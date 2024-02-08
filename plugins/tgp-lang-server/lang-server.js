using('tgp-lang-service,common,net,remote')

component('modelDataServer', {
  type: 'source-code<jbm>',
  params: [
    {id: 'filePath', as: 'string'}
  ],
  impl: sourceCode(pluginsByPath('%$filePath%'), plugins('tgp-model-data'), {
    pluginPackages: packagesByPath('%$filePath%'),
    libsToInit: 'utils,tgp'
  })
})

component('probeServer', {
  type: 'source-code<jbm>',
  params: [
    {id: 'filePath', as: 'string'},
    {id: 'host', as: 'string', options: ',node,studio,static'}
  ],
  impl: sourceCode(pluginsByPath('%$filePath%'), plugins('probe,tree-shake,tgp'), {
    pluginPackages: packagesByPath('%$filePath%', '%$host%')
  })
})

component('langServer.tgpModelData', {
  params: [
    {id: 'filePath', defaultValue: '%%'}
  ],
  impl: remote.data(langService.tgpModelData('%$filePath%'), cmd(modelDataServer('%$filePath%'), { doNotStripResult: true }))
})

component('langServer.probe', {
  params: [
    {id: 'compProps', defaultValue: '%%'}
  ],
  impl: pipe(
    '%$compProps/path%',
    remote.data({
      calc: pipe(
        If('%%', {$: 'probe.runCircuit', probePath: '%%'}, '%%'),
        obj(
          prop('probePath','%probePath%'),
          prop('result', {$: 'probe.stripProbeResult', result: '%result%'}),
          prop('circuitRes', '%circuitRes%'),
          prop('simpleVisits', '%simpleVisits%'),
          prop('totalTime', '%totalTime%'),
          prop('circuitPath', '%circuitCtx.path%'),
          prop('errors', () => jb.spy.search('error'))
        ),
        first()
      ),
      jbm: cmd(probeServer('%$compProps/filePath%'))
    })
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
