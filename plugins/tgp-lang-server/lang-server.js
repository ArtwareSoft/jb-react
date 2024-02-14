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
  impl: sourceCode(pluginsByPath('%$filePath%',true), plugins('probe,tree-shake,tgp'), {
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
    extend(prop('tgpModelErrors','%$compProps/tgpModelErrors%'))
  )
})

component('langServer.studioCircuitUrl', {
  impl: pipe(
    Var('filePath', tgpTextEditor.currentFilePath()),
    langService.compProps(),
    '%path%',
    If('%%', remote.data({
      calc: pipe(
        Var('sourceCode', sourceCode.encodeUri(probeServer('%$filePath%', 'studio'))),
        Var('probePath', '%%'),
        {$: 'probe.calcCircuitPath', probePath: '%%'},
        join('/', { items: list('%path%','%$probePath%') }),
        'http://localhost:8082/project/studio/%%?sourceCode=%$sourceCode%&spy=test'
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