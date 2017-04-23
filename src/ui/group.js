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
          cmp.ctrlEmitter.takeUntil(cmp.destroyed)
            .subscribe(ctrls=>
              cmp.setState({ctrls:ctrls}))
      } else {
        cmp.state.ctrls = ctx.vars.$model.controls()
      }
    }
  })
})
