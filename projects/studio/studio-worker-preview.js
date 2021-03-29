jb.component('studio.workerPreview', {
    params: [
        {id: 'pageCtrl', defaultValue: obj(prop('$','%$studio/page%'))}, // ensure the code loader will load the page code
        {id: 'dataResources', defaultValue: () => [jb.studio.projectCompsAsEntries().map(e=>e[0]).filter(x=>x.match(/^dataResource/)).map(x=> ({$: x}))] }
    ],
    type: 'control',
    impl: remote.widget( (ctx,{},{pageCtrl,dataResources}) => ctx.run(pageCtrl), jbm.worker('preview'))
})

jb.component('studio.initShadowComps', {
    type: 'action',
    description: 'shadow watchable data on remote jbm',
    params: [
      {id: 'src', as: 'ref' },
      {id: 'jbm', type: 'jbm'},
    ],
    impl: rx.pipe(
        source.watchableData({ref: '%$src%', includeChildren: 'yes'}),
        rx.map(obj(prop('op','%op%'), prop('path',({data}) => jb.db.pathOfRef(data.ref)))),
        rx.log('test op'),
        sink.action(remote.action( 
            ctx => jb.db.doOp(jb.db.refOfPath(ctx.data.path), ctx.data.op, ctx),
            '%$jbm%')
        )
    )
})