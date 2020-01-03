jb.component('markdown', {
    type: 'control', category: 'control:20',
    params: [
        { id: 'markdown', as: 'string', mandatory: true, dynamic: true },
        { id: 'style', type: 'markdown.style', defaultValue: { $: 'markdown.showdown' }, dynamic: true },
        { id: 'title', as: 'string', defaultValue: 'markdown' },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx =>
        jb.ui.ctrl(ctx)
})

jb.component('markdown.showdown', {
    type: 'markdown.style',
    impl: ctx => ({
        template: (cmp,state,h) => h('div'),
        afterViewInit: cmp => {
            cmp.base.innerHtml = new showdown.Converter({tables:true})
                    .makeHtml(ctx.vars.$model.markdown(cmp.ctx))
        },
    })
})
