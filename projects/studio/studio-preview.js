
jb.component('jbm.wPreview', {
  type: 'jbm',
  params: [
    {id: 'id', defaultValue: 'wPreview'}
  ],
  impl: jbm.worker('%$id%', studio.initPreview())
})

jb.component('jbm.preview', {
  type: 'jbm',
  impl: If('%$yellowPages/preview%', jbm.byUri('%$yellowPages/preview%'), jbm.wPreview())
})

jb.component('studio.initPreview', {
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
        remote.action({
          action: probe.handleScriptChangeOnPreview('%$cssOnlyChange%'),
          jbm: '%$jbm%',
          oneway: true
        })
      )
    )
  )
})

jb.component('preview.remoteWidget', {
  params: [
    {id: 'jbm', type: 'jbm', defaultValue: jbm.wPreview()}
  ],
  type: 'control',
  impl: remote.widget(preview.control(), '%$jbm%')
})

jb.component('studio.refreshPreview', {
  type: 'action',
  impl: ''
})

jb.component('preview.control', {
  type: 'control',
  impl: group({
    controls: ctx => { 
      const _circuit = ctx.exp('%$studio/circuit%')
      const circuit = (jb.path(jb.comps[_circuit],'impl.$') || '').match(/Test/) ? { $: 'test.showTestInStudio', testId: _circuit} : { $: _circuit }
      jb.log('preview circuit',{circuit, ctx})
      return circuit && circuit.$ && ctx.run(circuit)
    },
    features: [
      If(ctx => !jb.comps[ctx.exp('%$studio/circuit%')], group.wait(treeShake.getCodeFromRemote('%$studio/circuit%'))),
      watchRef('%$probe/scriptChangeCounter%'),
      variable('$previewMode', true)
    ]
  }),
  require: {$: 'test.showTestInStudio' }
})


