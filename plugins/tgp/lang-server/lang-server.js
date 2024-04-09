using('tgp-lang-service,common,net,remote-jbm,probe-core')

component('modelDataServer', {
  type: 'source-code<loader>',
  params: [
    {id: 'filePath', as: 'string'}
  ],
  impl: sourceCode(pluginsByPath('%$filePath%'), plugins('tgp-model-data'), {
    pluginPackages: packagesByPath('%$filePath%'),
    libsToInit: 'utils,tgp,spy'
  })
})

component('probeServer', {
  type: 'source-code<loader>',
  params: [
    {id: 'filePath', as: 'string'},
    {id: 'host', as: 'string', options: ',node,studio,static'}
  ],
  impl: sourceCode(pluginsByPath('%$filePath%', { addTests: true }), plugins('probe-core,tree-shake,tgp-core'), {
    pluginPackages: packagesByPath('%$filePath%', '%$host%')
  })
})

component('remote.tgpModelData', {
  params: [
    {id: 'filePath', defaultValue: '%%'}
  ],
  impl: pipe(
    remote.data({
      calc: tgpModelData.byFilePath('%$filePath%'),
      jbm: cmd(modelDataServer('%$filePath%'), { doNotStripResult: true, includeLogs: true })
    }),
    obj(
      prop('filePath', '%result/filePath%'),
      prop('errors', '%errors%'),
      prop('comps', '%result/comps%'),
      prop('sourceCode', '%result/sourceCode%'),
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
        If('%%', probe.runCircuit('%%', 2000), '%%'),
        obj(
          prop('circuitPath', '%circuitCtx/path%'),
          prop('probePath', '%probePath%'),
          prop('visits', '%visits%'),
          prop('simpleVisits', '%simpleVisits%'),
          prop('totalTime', '%totalTime%'),
          prop('result', probe.stripProbeResult('%result%')),
          prop('circuitRes', '%circuitRes%'),
          prop('errors', () => jb.spy.search('error')),
          prop('logs', () => jb.spy.logs)
        ),
        first()
      ),
      jbm: stateless(probeServer('%$compProps/filePath%'))
    }),
    extend(prop('tgpModelErrors', '%$compProps/tgpModelErrors%')),
    first()
  )
})

component('langServer.calcProbeOverlay', {
  params: [
    {id: 'overlay', type: 'overlay<>', dynamic: true}
  ],
  impl: pipeline(
    Var('compProps', langService.calcCompProps({ includeCircuitOptions: true }), { async: true }),
    Var('probeResult', langServer.probe('%$compProps%'), { async: true }),
    '%$overlay()%',
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
          libsToInit: 'utils,tgp,spy'
        }),
        doNotStripResult: true
      }),
      timeout: 10000
    }))
  )
})

component('langServer.localReferences', {
  impl: pipe(
    Var('filePath', tgpTextEditor.currentFilePath()),
    langService.compId(),
    If('%%', remote.data(pipe('%%', langService.compReferences()), jbm.self(), { timeout: 10000 }))
  )
})

component('langServer.studioCircuitUrl', {
  params: [
    {id: 'compProps', defaultValue: '%%'}
  ],
  impl: pipeline(
    Var('sourceCode', sourceCode.encodeUri(typeAdapter('source-code<loader>', probeServer('%$compProps/filePath%', 'studio')))),
    Var('spyParams', test.calcSpyParamForTest('%$compProps/circuitOptions/0/id%')),
    'http://localhost:8082/project/studio/%$compProps/circuitOptions/0/id%/%$compProps/path%?sourceCode=%$sourceCode%&spy=%$spyParams%'
  )
})

component('langServer.testUrl', {
  params: [
    {id: 'compProps', defaultValue: '%%'}
  ],
  impl: pipeline(
    Var('spyParams', test.calcSpyParamForTest('%$compProps/circuitOptions/0/id%')),
    'http://localhost:8082/hosts/tests/tests.html?test=%$compProps/circuitOptions/0/shortId%&show&spy=%$spyParam%'
  )
})

component('langServer.runCtxOfRemoteCmdUrl', {
  params: [
    {id: 'compProps', defaultValue: '%%'}
  ],
  impl: pipe(
    Var('sourceCode', sourceCode.encodeUri(typeAdapter('source-code<loader>', probeServer('%$compProps/filePath%')))),
    Var('spyParams', test.calcSpyParamForTest('%$compProps/circuitOptions/0/id')),
    langServer.probe(),
    encodeJsonAsUri('%result.0.in%'),
    'http://localhost:8082/hosts/tests/runCtx.html?runCtx=%%&sourceCode=%$sourceCode%&spy=%$spyParams%',
    first()
  )
})

component('encodeJsonAsUri', {
  params: [
    {id: 'obj'}
  ],
  impl: (ctx,obj) => {
    try {
      return jb.frame.encodeURIComponent(JSON.stringify(obj))
    } catch(e) {
      jb.logException(e,{ctx,obj})
    }
  }
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