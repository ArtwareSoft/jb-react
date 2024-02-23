using('tgp-lang-service,common,net,remote,probe')

component('modelDataServer', {
  type: 'source-code<loader>',
  params: [
    {id: 'filePath', as: 'string'}
  ],
  impl: sourceCode(pluginsByPath('%$filePath%'), plugins('tgp-model-data'), {
    pluginPackages: packagesByPath('%$filePath%'),
    libsToInit: 'utils,tgp'
  })
})

component('probeServer', {
  type: 'source-code<loader>',
  params: [
    {id: 'filePath', as: 'string'},
    {id: 'host', as: 'string', options: ',node,studio,static'}
  ],
  impl: sourceCode(pluginsByPath('%$filePath%', true), plugins('probe,tree-shake,tgp'), {
    pluginPackages: packagesByPath('%$filePath%', '%$host%')
  })
})

component('remote.tgpModelData', {
  params: [
    {id: 'filePath', defaultValue: '%%'}
  ],
  circuit: 'langServerTest.tgpModelData',
  impl: pipe(
    remote.data({
      calc: tgpModelData.byFilePath('%$filePath%'),
      jbm: cmd(modelDataServer('%$filePath%'), { doNotStripResult: true, includeLogs: true })
    }),
    obj(
      prop('filePath', '%result/filePath%'),
      prop('errors', '%errors%'),
      prop('comps', '%result/comps%'),
      prop('typeRules', '%result/typeRules%'),
      prop('plugins', '%result/plugins%')
    ),
    first()
  )
})

component('langServer.probe', {
  params: [
    {id: 'compProps', defaultValue: '%%'}
  ],
  impl: pipe(
    '%$compProps/path%',
    remote.data({
      calc: pipe(
        If('%%', probe.runCircuit('%%',2000), '%%'),
        obj(
          prop('circuitPath', '%circuitCtx.path%'),
          prop('probePath', '%probePath%'),
          prop('simpleVisits', '%simpleVisits%'),
          prop('totalTime', '%totalTime%'),
          prop('result', probe.stripProbeResult('%result%')),
          prop('circuitRes', '%circuitRes%'),
          prop('errors', () => jb.spy.search('error')),
          prop('logs', () => jb.spy.logs)
        ),
        first()
      ),
      jbm: cmd(probeServer('%$compProps/filePath%'))
    }),
    extend(prop('tgpModelErrors','%$compProps/tgpModelErrors%')),
    first()
  )
})

component('langServer.references', {
  impl: pipe(
    Var('filePath', tgpTextEditor.currentFilePath()),
    langService.compId(),
    If('%%', remote.data({
      calc: pipe('%%', langService.compReferences()),
      jbm: cmd({
        sourceCode: sourceCode(plugins('*'), project('studio'), {
          pluginPackages: packagesByPath('%$filePath%'),
          libsToInit: 'utils,tgp'
        }),
        doNotStripResult: true
      }),
      timeout: 10000
    }))
  )
})

component('langServer.localReferences', {
  impl: pipe(Var('filePath', tgpTextEditor.currentFilePath()), langService.compId(), 
  If('%%', remote.data(pipe('%%', langService.compReferences()), jbm.self(), { timeout: 10000 })))
})

component('langServer.studioCircuitUrl', {
  impl: pipe(
    Var('filePath', tgpTextEditor.currentFilePath()),
    Var('sourceCodeForStudio', typeAdapter('source-code<loader>', probeServer('%$filePath%', 'studio'))),
    langService.calcCompProps(),
    '%path%',
    If('%%', remote.data({
      calc: pipe(
        Var('probePath', '%%'),
        Var('sourceCode', sourceCode.encodeUri('%$sourceCodeForStudio%')),
        probe.calcCircuitPath('%%'),
        'http://localhost:8082/project/studio/%path%/%$probePath%?sourceCode=%$sourceCode%&spy=test'
      ),
      jbm: cmd(probeServer('%$filePath%'))
    }))
  )
})

component('langServer.remoteProbe', {
  params: [
    {id: 'sourceCode', type: 'source-code<loader>'},
    {id: 'probePath', as: 'string'},
    {id: 'expressionOnly', as: 'boolean', type: 'boolean'},
    {id: 'input', defaultValue: '%%', description: '{value, selectionStart}'}
  ],
  impl: remote.data({
    calc: probe.suggestions('%$probePath%', '%$expressionOnly%', '%$input%'),
    jbm: If('%$forceLocalSuggestions%', jbm.self(), cmd('%$sourceCode%'))
  })
})