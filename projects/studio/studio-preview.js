
jb.component('jbm.wPreview', {
    type: 'jbm',
    params: [
        {id: 'id', defaultValue: 'wPreview' }
    ],    
    impl: jbm.worker({id: '%$id%', init: studio.initPreview()})
})

jb.component('jbm.preview', {
    type: 'jbm',
    impl: If('%$yellowPages/preview%',jbm.byUri('%$yellowPages/preview%'), jbm.wPreview())
})

jb.component('studio.initPreview', {
    type: 'action',
    impl: runActions(
        log('init preview', () => ({uri: jb.uri})),
        Var('dataResources',() => jb.studio.projectCompsAsEntries().map(e=>e[0]).filter(x=>x.match(/^dataResource/)).map(x=> ({$: x}))),
        // Var('circuit', '%$studio/circuit%'),
        // writeValue('%$yellowPages/preview%', '%$jbm/uri%'),
        // remote.action(runActions(
        //     treeShake.getCodeFromRemote('%$circuit%'),
        //     ({},{circuit}) => jb.component('dataResource.studio', { watchableData: { jbEditor: {}, scriptChangeCounter: 0, circuit } }),
        //     ({},{dataResources}) => { 
        //         jb.ctxByPath = {}; 
        //         // for code loader: jb.ui.createHeadlessWidget()
        //      }, 
        // ), '%$jbm%'),
        // remote.initShadowData('%$studio%', '%$jbm%'),
        remote.shadowResource('studio', '%$jbm%'),
        remote.shadowResource('probe', '%$jbm%'),
        rx.pipe(
            source.callbag(() => {
                jb.log('init preview watchableComps source',{})
                return jb.watchableComps.source
            }),
//            watchableComps.scriptChange(),
            rx.log('preview change script'),
            rx.map(obj(prop('op','%op%'), prop('path','%path%'))),
            rx.var('cssOnlyChange',tgp.isCssPath('%path%')),
            sink.action(remote.action( {action: probe.handleScriptChangeOnPreview('%$cssOnlyChange%'), jbm: '%$jbm%', oneway: true}))
        )
    ),
})

jb.component('preview.remoteWidget', {
    params: [
        {id: 'jbm', defaultValue: jbm.wPreview() }
    ],    
    type: 'control',
    impl: remote.widget( preview.control(), '%$jbm%' )
})

jb.component('studio.refreshPreview', {
  type: 'action',
  impl: {}
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
            variable('$previewMode',true)
        ]
    }),
    require: {$: 'test.showTestInStudio'}
})


