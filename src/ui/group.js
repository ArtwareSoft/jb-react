jb.ns('group,layout,tabs')

jb.component('group', { /* group */
  type: 'control',
  category: 'group:100,common:90',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'layout', type: 'layout' },
    {
      id: 'style',
      type: 'group.style',
      defaultValue: group.div(),
      mandatory: true,
      dynamic: true
    },
    {
      id: 'controls',
      type: 'control[]',
      mandatory: true,
      flattenArray: true,
      dynamic: true,
      composite: true
    },
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx,ctx.params.layout)
})

jb.component('group.init-group', { /* group.initGroup */
  type: 'feature',
  category: 'group:0',
  impl: ctx => ({
    calcState: cmp => ({ctrls: cmp.calcCtrls() }),
    init: cmp => {
      cmp.calcCtrls = cmp.calcCtrls || (() => ctx.vars.$model.controls(cmp.ctx).filter(x=>x))
      if (!cmp.state.ctrls)
        cmp.state.ctrls = cmp.calcCtrls()
      cmp.refresh = cmp.refresh || (() => cmp.setState({ctrls: cmp.calcCtrls() }))
    }
  })
})

jb.component('inline-controls', { /* inlineControls */
  type: 'control',
  params: [
    {
      id: 'controls',
      type: 'control[]',
      mandatory: true,
      flattenArray: true,
      dynamic: true,
      composite: true
    }
  ],
  impl: ctx => ctx.params.controls().filter(x=>x)
})

jb.component('dynamic-controls', { /* dynamicControls */
  type: 'control',
  params: [
    {id: 'controlItems', type: 'data', as: 'array', mandatory: true, dynamic: true},
    {id: 'genericControl', type: 'control', mandatory: true, dynamic: true},
    {id: 'itemVariable', as: 'string', defaultValue: 'controlItem'}
  ],
  impl: (context,controlItems,genericControl,itemVariable) =>
    controlItems()
      .map(jb.ui.cachedMap(controlItem => jb.tosingle(genericControl(
        new jb.jbCtx(context,{data: controlItem, vars: jb.obj(itemVariable,controlItem)})))
      ))
})

jb.component('group.dynamic-titles', { /* group.dynamicTitles */
  type: 'feature',
  category: 'group:30',
  description: 'dynamic titles for sub controls',
  impl: ctx => ({
    componentWillUpdate: cmp =>
      (cmp.state.ctrls || []).forEach(ctrl=> ctrl.title = ctrl.field().title ? ctrl.field().title() : '')
  })
})

jb.component('group.first-succeeding', { /* group.firstSucceeding */
  type: 'feature',
  category: 'group:70',
  description: 'Used with controlWithCondition. Takes the fhe first succeeding control',
  impl: ctx => ({
    beforeInit: cmp => cmp.calcCtrls = () => {
      cmp.lastSucceeding = cmp.lastSucceeding || { index: -1 }
      const profiles = jb.asArray(cmp.ctx.profile.controls)
      for(let i=0;i<profiles.length;i++) {
        const found = cmp.ctx.run(profiles[i])
        if (found && cmp.lastSucceeding.index != i)
          cmp.lastSucceeding = { index: i, cmp: found }
        if (found) 
          return [cmp.lastSucceeding.cmp]
      }
      return []
    }
  })
})

jb.component('control-with-condition', { /* controlWithCondition */
  type: 'control',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', dynamic: true, mandatory: true, as: 'boolean'},
    {id: 'control', type: 'control', mandatory: true, dynamic: true},
    {id: 'title', as: 'string'}
  ],
  impl: (ctx,condition,ctrl) => condition() && ctrl(ctx)
})
