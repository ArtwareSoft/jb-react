jb.component('group', {
  type: 'control', category: 'group:100,common:90',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'style', type: 'group.style', defaultValue: { $: 'group.section' }, essential: true , dynamic: true },
    { id: 'controls', type: 'control[]', essential: true, flattenArray: true, dynamic: true, composite: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('group.init-group', {
  type: 'feature', category: 'group:0',
  impl: ctx => ({
    init: cmp => {
      if (cmp.ctrlEmitter) {
          cmp.ctrlEmitter.takeUntil(cmp.jbEmitter.filter(x=>x=='destroy'))
            .subscribe(ctrls=>
              cmp.setState({ctrls:ctrls}))
      } else {
        cmp.state.ctrls = ctx.vars.$model.controls()
      }
    }
  })
})

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
