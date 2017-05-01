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
      cmp.initWatchByRef = cmp.initWatchByRef || (refToWatch =>
        jb.ui.refObservable(refToWatch,cmp)
          .map(_=>ctx.vars.$model.controls(cmp.ctx))
          .subscribe(ctrls=>
              cmp.setState({ctrls:ctrls.map(c=>c.reactComp())})))

      if (cmp.ctrlEmitter)
        cmp.ctrlEmitter.subscribe(ctrls=>
              cmp.setState({ctrls:ctrls.map(c=>c.reactComp())}))
      if (!cmp.state.ctrls)
        cmp.state.ctrls = ctx.vars.$model.controls(cmp.ctx).map(c=>c.reactComp())
    }
  })
})

jb.component('dynamic-controls', {
  type: 'control',
  params: [
    { id: 'controlItems', type: 'data', as: 'array', essential: true, dynamic: true },
    { id: 'genericControl', type: 'control', essential: true, dynamic: true },
    { id: 'itemVariable', as: 'string', defaultValue: 'controlItem'}
  ],
  impl: (context,controlItems,genericControl,itemVariable) =>
    controlItems()
      .map(controlItem => jb.tosingle(genericControl(
        new jb.jbCtx(context,{data: controlItem, vars: jb.obj(itemVariable,controlItem)})))
      )
})
