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
  impl: sourceCode(pluginsByPath('%$filePath%', { addTests: true }), plugins('probe,tree-shake,tgp'), {
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

component('remote.circuitOptions', {
  params: [
    {id: 'filePath'},
    {id: 'path'}
  ],
  impl: remote.data(tgp.circuitOptions('%$path%'), cmd(probeServer('%$filePath%')))
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
  params: [
    {id: 'compProps', defaultValue: '%%'}
  ],
  impl: pipeline(
    Var('sourceCode', sourceCode.encodeUri(
      typeAdapter('source-code<loader>', probeServer('%$compProps/filePath%', 'studio'))
    )),
    Var('spyParams', spy.paramForTest('%$compProps/circuitOptions/0%')),
    'http://localhost:8082/project/studio/%$compProps/circuitOptions/0%/%$compProps/path%?sourceCode=%$sourceCode%&spy=%$spyParams%',
    first()
  )
})


component('langServer.testUrl', {
  params: [
    {id: 'compProps', defaultValue: '%%'}
  ],
  impl: pipeline(
    Var('spyParams', spy.paramForTest('%$compProps/circuitOptions/0%')),
    'http://localhost:8082/hosts/tests/tests.html?test=%$compProps/circuitOptions/0%&show&spy=%$spyParam%',
    first()
  )
})

component('langServer.runCtxOfProbeUrl', {
  params: [
    {id: 'compProps', defaultValue: '%%'}
  ],
  impl: pipe(
    Var('sourceCode', sourceCode.encodeUri(
      typeAdapter('source-code<loader>', probeServer('%$compProps/filePath%'))
    )),
    Var('spyParams', spy.paramForTest('%$compProps/circuitOptions/0%')),
    langServer.probe(),
    'http://localhost:8082/hosts/tests/runCtx.html?runCtx=%result.0.in%&sourceCode=%$sourceCode%&spy=%$spyParams%',
    first()
  )
})

// component('langServer.runCtxUrl', {
//   params: [
//     {id: 'compProps', defaultValue: '%%'}
//   ],
//   impl: pipe(
//     Var('sourceCode', sourceCode.encodeUri(
//       typeAdapter('source-code<loader>', probeServer('%$compProps/filePath%'))
//     )),
//     langServer.circuitPath('%$compProps/filePath%', '%$compProps/path%'),
//     'http://localhost:8082/hosts/tests/runCtx.html/%%?sourceCode=%$sourceCode%',
//     first()
//   )
// })

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