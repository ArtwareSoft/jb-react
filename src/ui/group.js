jb.ns('group,layout,tabs')

jb.component('group', {
  type: 'control',
  category: 'group:100,common:90',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'layout', type: 'layout'},
    {id: 'style', type: 'group.style', defaultValue: group.div(), mandatory: true, dynamic: true},
    {id: 'controls', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true, composite: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, ctx.params.layout)
})

jb.component('group.initGroup', {
  type: 'feature',
  category: 'group:0',
  impl: calcProp({
    id: 'ctrls',
    value: '%$$model.controls()%'
  })
})

jb.component('inlineControls', {
  type: 'control',
  description: 'controls without a wrapping group',
  params: [
    {id: 'controls', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true, composite: true}
  ],
  impl: ctx => ctx.params.controls().filter(x=>x)
})

jb.component('dynamicControls', {
  type: 'control',
  description: 'calculated controls by data items without a wrapping group',
  params: [
    {id: 'controlItems', type: 'data', as: 'array', mandatory: true, dynamic: true},
    {id: 'genericControl', type: 'control', mandatory: true, dynamic: true},
    {id: 'itemVariable', as: 'string', defaultValue: 'controlItem'},
    {id: 'indexVariable', as: 'string'}
  ],
  impl: (ctx,controlItems,genericControl,itemVariable,indexVariable) => (controlItems() || [])
      .map((controlItem,i) => jb.tosingle(genericControl(
        ctx.setVar(itemVariable,controlItem).setVar(indexVariable,i).setData(controlItem))))
})

jb.component('group.firstSucceeding', {
  type: 'feature',
  category: 'group:70',
  description: 'Used with controlWithCondition. Takes the fhe first succeeding control',
  impl: features(
    () => ({calcHash: ctx => jb.asArray(ctx.vars.$model.controls.profile).reduce((res,prof,i) => {
        if (res) return res
        const found = prof.condition == undefined || ctx.vars.$model.ctx.setVars(ctx.vars).runInner(prof.condition,{ as: 'boolean'},`controls~${i}~condition`)
        if (found)
          return i + 1 // avoid index 0
      }, null),
    }),
    calcProp({
        id: 'ctrls',
        value: ctx => {
      const index = ctx.vars.$props.cmpHash-1
      if (isNaN(index)) return []
      const prof = jb.asArray(ctx.vars.$model.controls.profile)[index]
      return [ctx.vars.$model.ctx.setVars(ctx.vars).runInner(prof,{type: 'control'},`controls~${index}`)]
     },
        priority: 5
      })
  )
})

jb.component('controlWithCondition', {
  type: 'control',
  description: 'Used with group.firstSucceeding',
  category: 'group:10',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', dynamic: true, mandatory: true, as: 'boolean'},
    {id: 'control', type: 'control', mandatory: true, dynamic: true},
    {id: 'title', as: 'string'}
  ],
  impl: (ctx,condition,ctrl) => condition(ctx) && ctrl(ctx)
})

jb.component('group.wait', {
  type: 'feature',
  category: 'group:70',
  description: 'wait for asynch data before showing the control',
  params: [
    {id: 'for', mandatory: true, dynamic: true, description: 'a promise or rx'},
    {id: 'loadingControl', type: 'control', defaultValue: text('loading ...'), dynamic: true},
    {id: 'error', type: 'control', defaultValue: text('error: %$error%'), dynamic: true},
    {id: 'varName', as: 'string', description: 'variable for the promise result'},
    {id: 'passRx', as: 'boolean', description: 'do not wait for reactive data to end, and pass it as is' },
  ],
  impl: features(
    calcProp({
        id: 'ctrls',
        value: (ctx,{cmp},{loadingControl,error}) => {
        const ctrl = cmp.state.error ? error() : loadingControl(ctx)
        return cmp.ctx.profile.$ == 'itemlist' ? [[ctrl]] : [ctrl]
      },
        priority: ctx => jb.path(ctx.vars.$state,'dataArrived') ? 0: 10
    }),
    followUp.action((ctx,{cmp},{varName,passRx}) => !cmp.state.dataArrived && !cmp.state.error &&
        Promise.resolve(jb.toSynchArray(ctx.cmpCtx.params.for(),!passRx))
        .then(data => cmp.refresh({ dataArrived: true }, {
            srcCtx: ctx.cmpCtx,
            extendCtx: ctx => ctx.setVar(varName,data).setData(data)
          }))
          .catch(e=> cmp.refresh({error: JSON.stringify(e)}))
      )
  )
})

jb.component('group.eliminateRecursion', {
  type: 'feature',
  description: 'can be put on a global top group',
  params: [
    { id: 'maxDepth', as: 'number' }
  ],
  impl: (ctx,maxDepth) => {
    const protectedComp = ctx.cmpCtx.cmpCtx.path
    const timesInStack = ctx.callStack().filter(x=>x && x.indexOf(protectedComp) != -1).length
    if (timesInStack > maxDepth)
      return ctx.run( calcProp({id: 'ctrls', value: () => [], phase: 1, priority: 100 }))
  }
})
