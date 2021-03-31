jb.component('jbm.wPreview', {
    type: 'jbm',
    impl: jbm.worker({
        id: 'wPreview', 
        init: runActions(
            Var('dataResources', () => jb.studio.projectCompsAsEntries().map(e=>e[0]).filter(x=>x.match(/^dataResource/)).map(x=> ({$: x}))),
            remote.action(runActions(
                () => jb.component('dataResource.studio', { watchableData: { scriptChangeCounter: 0} }), 
                ({},{dataResources}) => jb.watchableComps.forceLoad(), 
            ), jbm.worker('wPreview')),
            rx.pipe(
                source.callbag(() => jb.watchableComps.handler.resourceChange),
                rx.map(obj(prop('op','%op%'), prop('path','%path%'))),
                rx.log('test op'),
                rx.var('cssOnlyChange',studio.isCssPath('%path%')),
                sink.action(remote.action( wPreview.handlePageChangeOnWorker('%$cssOnlyChange%'), jbm.worker('wPreview')))
            )
        )
    })
})

jb.component('remote.wPreviewCtrl', {
    params: [
        {id: 'control', defaultValue: obj(prop('$','%$studio/page%'))}, // ensure the code loader will load the page code
    ],
    type: 'control',
    impl: remote.widget( 
        group({
            controls: (ctx,{},{control}) => ctx.run(control),
            features: [
                watchRef('%$studio/scriptChangeCounter%'),
                variable('$previewMode',true)
            ]
    }), jbm.wPreview() ),
})


jb.component('wPreview.handlePageChangeOnWorker', {
    type: 'action',
    description: 'preview script change handler',
    params: [
        {id: 'cssOnlyChange', as: 'boolean' }
    ],
    impl: (ctx, cssOnlyChange) => {
        const {op, path} = ctx.data
        const handler = jb.watchableComps.handler
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
            jb.db.writeValue(ref, +jb.val(ref)+1 ,ctx.setVars({headlessWidgetId, headlessWidget: true}))
        }
    }
})
