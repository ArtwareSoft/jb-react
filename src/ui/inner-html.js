jb.component('inner-html', {
    type: 'control', category: 'control:20',
    params: [
        { id: 'title', as: 'string', dynamic: true },
        { id: 'html', as: 'string', mandatory: true, dynamic: true },
        { id: 'style', type: 'inner-html.style', defaultValue: { $: 'inner-html.unsafe' }, dynamic: true },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx =>
        jb.ui.ctrl(ctx,{
          afterViewInit: cmp =>
            cmp.base.innerHTML = ctx.params.html(cmp.ctx)
        })
})

jb.component('inner-html.unsafe', {
    type: 'inner-html.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('span',{}),
    }
})
