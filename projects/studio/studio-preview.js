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
        Var('dataResources',() => jb.studio.projectCompsAsEntries().map(e=>e[0]).filter(x=>x.match(/^dataResource/)).map(x=> ({$: x}))),
        Var('circuit', '%$studio/circuit%'),
        writeValue('%$yellowPages/preview%', '%$jbm/uri%'),
        remote.action(runActions(
            treeShake.getCodeFromRemote('%$circuit%'),
            ({},{circuit}) => jb.component('dataResource.studio', { watchableData: { jbEditor: {}, scriptChangeCounter: 0, circuit } }),
            ({},{dataResources}) => { 
                jb.ctxByPath = {}; 
                // for code loader: jb.watchableComps.forceLoad(); jb.ui.createHeadlessWidget()
             }, 
        ), '%$jbm%'),
        remote.initShadowData('%$studio%', '%$jbm%'),
        rx.pipe(
            source.callbag(() => jb.watchableComps.handler.resourceChange),
            rx.map(obj(prop('op','%op%'), prop('path','%path%'))),
            rx.log('preview change script'),
            rx.var('cssOnlyChange',studio.isCssPath('%path%')),
            sink.action(remote.action( preview.handleScriptChangeOnPreview('%$cssOnlyChange%'), '%$jbm%'))
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
            return circuit && ctx.run(circuit)
        },
        features: [ 
            If(ctx => !jb.comps[ctx.exp('%$studio/circuit%')], group.wait(treeShake.getCodeFromRemote('%$studio/circuit%'))),
            watchRef('%$studio/scriptChangeCounter%'),
            variable('$previewMode',true)
        ]
    }),
    require: {$: 'test.showTestInStudio'}
})

jb.component('preview.handleScriptChangeOnPreview', {
    type: 'action',
    description: 'preview script change handler',
    params: [
        {id: 'cssOnlyChange', as: 'boolean' }
    ],
    impl: (ctx, cssOnlyChange) => {
        const {op, path} = ctx.data
        const handler = jb.watchableComps.handler
        if (path[0] == 'probeTest.label1') return
        if (!jb.comps[path[0]])
            return jb.logError('handleScriptChangeOnPreview - missing comp', {path, ctx})
        handler.makeWatchable(path[0])
        handler.doOp(handler.refOfPath(path), op, ctx)

        const headlessWidgetId = Object.keys(jb.ui.headless)[0]
        const headless = jb.ui.headless[headlessWidgetId]
        if (cssOnlyChange) {
            let featureIndex = path.lastIndexOf('features')
            if (featureIndex == -1) featureIndex = path.lastIndexOf('layout')
            const ctrlPath = path.slice(0, featureIndex).join('~')
            const elems = headless.body.querySelectorAll('[jb-ctx]')
                .map(elem=>({elem, path: jb.path(JSON.parse(elem.attributes.$__debug),'path') }))
                .filter(e => e.path == ctrlPath)
            elems.forEach(e=>jb.ui.refreshElem(e.elem,null,{cssOnly: e.elem.attributes.class ? true : false}))           
        } else {
            const ref = ctx.exp('%$studio/scriptChangeCounter%','ref')
            jb.db.writeValue(ref, +jb.val(ref)+1 ,ctx.setVars({headlessWidget: true}))
        }
    }
})

