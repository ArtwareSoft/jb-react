using('testing-ui')

component('wPreview', {
  type: 'jbm<jbm>',
  params: [
    {id: 'id', defaultValue: 'wPreview'}
  ],
  impl: worker('%$id%', { sourceCode: probeServer(studio.filePath(), 'studio'), init: studio.initPreview() })
})

component('studio.filePath', {
  impl: pipeline(
    firstSucceeding('%$studio/circuit%','%$studio/page%'),
    ({data}) => jb.path(jb.comps[data],'$location.path')
  )
})

component('preview', {
  type: 'jbm<jbm>',
  impl: If('%$yellowPages/preview%', byUri('%$yellowPages/preview%'), wPreview())
})

component('preview', {
  type: 'source-code<loader>',
  params: [
    {id: 'filePath', as: 'string'}
  ],
  impl: sourceCode(plugins('testing,probe-preview'))
})

component('studio.initPreview', {
  type: 'action',
  impl: runActions(
    Var('dataResources', () => jb.studio.projectCompsAsEntries().map(e=>e[0]).filter(x=>x.match(/^dataResource/)).join(',')),
    log('init preview', () => ({uri: jb.uri})),
    remote.action(treeShake.getCodeFromRemote('%$dataResources%'), '%$jbm%'),
    remote.shadowResource('studio', '%$jbm%'),
    remote.shadowResource('probe', '%$jbm%'),
    rx.pipe(
      source.callbag(() => {
          jb.log('init preview watchableComps source',{})
          return jb.watchableComps.source
      }),
      rx.log('studio preview change script'),
      rx.map(obj(prop('op', '%op%'), prop('path', '%path%'))),
      rx.var('cssOnlyChange', tgp.isCssPath('%path%')),
      sink.action(
        remote.action(probe.handleScriptChangeOnPreview('%$cssOnlyChange%'), '%$jbm%', {
          oneway: true
        })
      )
    )
  )
})

component('preview.remoteWidget', {
  params: [
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: wPreview()}
  ],
  type: 'control',
  impl: remote.widget(preview.control(), '%$jbm%')
})

component('studio.refreshPreview', {
  type: 'action'
})

component('preview.control', {
  type: 'control',
  impl: group({
    controls: ctx => { 
      const _circuit = ctx.exp('%$studio/circuit%')
      const circuit = (jb.path(jb.comps[_circuit],'impl.$') || '').match(/Test/) ? { $: 'control<>test.showTestInStudio', testId: _circuit} : { $: _circuit }
      jb.log('preview circuit',{circuit, ctx})
      return circuit && circuit.$ && ctx.run(circuit)
    },
    features: [
      If(ctx => !jb.comps[ctx.exp('%$studio/circuit%')], group.wait(treeShake.getCodeFromRemote('%$studio/circuit%'))),
      watchRef('%$probe/scriptChangeCounter%'),
      variable('$previewMode', true)
    ]
  })
})


