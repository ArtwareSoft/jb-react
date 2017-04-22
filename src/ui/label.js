jb.component('label', {
    type: 'control', category: 'control:100,common:80',
    params: [
        { id: 'title', as: 'string', essential: true, defaultValue: 'my label', dynamic: true },
        { id: 'style', type: 'label.style', defaultValue: { $: 'label.span' }, dynamic: true },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx =>
        jb.ui.ctrl(ctx.setVars({title: ctx.params.title() }))
})

jb.component('label.bind-title', {
  type: 'feature',
  impl: ctx => ({
    init: cmp =>
      cmp.setState({title: ctx.vars.$model.title(cmp.ctx)}),
    doCheck: cmp => 
      cmp.setState({title: ctx.vars.$model.title(cmp.ctx)})
  })
})
