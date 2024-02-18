
component('group', {
  type: 'control',
  category: 'group:100,common:90',
  params: [
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true, composite: true},
    {id: 'title', as: 'string', dynamic: true, byName: true},
    {id: 'layout', type: 'layout'},
    {id: 'style', type: 'group-style', defaultValue: group.div(), mandatory: true, dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, ctx.params.layout)
})

component('group.initGroup', {
  type: 'feature',
  category: 'group:0',
  impl: calcProp('ctrls', (ctx,{$model}) => $model.controls(ctx).filter(x=>x).flatMap(x=>x.segment ? x : [x]))
})

component('inlineControls', {
  type: 'control',
  description: 'controls without a wrapping group',
  params: [
    {id: 'controls', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true, composite: true}
  ],
  impl: ctx => ctx.params.controls().filter(x=>x)
})

component('dynamicControls', {
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

component('group.firstSucceeding', {
  type: 'feature',
  category: 'group:70',
  description: 'Used with controlWithCondition. Takes the fhe first succeeding control',
  impl: calcProp({
    id: 'ctrls',
    value: (ctx,{$model}) => {
        const runCtx = $model.controls.runCtx.setVars(ctx.vars)
        return [jb.asArray($model.controls.profile).reduce((res,prof,i) => 
          res || runCtx.runInner(prof, {}, `controls~${i}`), null )]
      },
    priority: 5
  })
})

component('controlWithCondition', {
  type: 'control',
  description: 'Used with group.firstSucceeding',
  category: 'group:10',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', dynamic: true, mandatory: true, as: 'boolean'},
    {id: 'control', type: 'control', mandatory: true, dynamic: true, composite: true},
    {id: 'title', as: 'string'}
  ],
  impl: (ctx,condition,ctrl) => condition(ctx) ? ctrl(ctx) : null
})

component('group.wait', {
  type: 'feature',
  category: 'group:70',
  description: 'wait for asynch data before showing the control',
  params: [
    {id: 'for', mandatory: true, dynamic: true, description: 'a promise or rx'},
    {id: 'loadingControl', type: 'control', defaultValue: text('loading ...'), dynamic: true},
    {id: 'error', type: 'control', defaultValue: text('error: %$error%'), dynamic: true},
    {id: 'varName', as: 'string', description: 'variable for the promise result'},
    {id: 'passRx', as: 'boolean', description: 'do not wait for reactive data to end, and pass it as is', type: 'boolean'}
  ],
  impl: features(
    calcProp({
      id: 'ctrls',
      value: (ctx,{cmp},{loadingControl,error}) => {
          const ctrl = cmp.state.error ? error() : loadingControl(ctx)
          return cmp.ctx.profile.$ == 'itemlist' ? [[ctrl]] : [ctrl]
        },
      priority: (ctx,{},{varName}) => {
        if (jb.path(ctx.vars.$state,'dataArrived')) return 0
        const cmp = ctx.vars.cmp
        // not well behaved - calculating the "waitFor" prop not via calcProp
        const waitFor = cmp.renderProps.waitFor = ctx.cmpCtx.params.for()
        if (!jb.utils.isDelayed(waitFor)) {
          cmp.state.dataArrived = true
          if (varName)
            cmp.calcCtx = cmp.calcCtx.setVar(varName,waitFor)
          return 0
        }
        return 10
      }
    }),
    followUp.action(async (ctx,{cmp,$props},{varName,passRx}) => {
      try {
        if (!cmp.state.dataArrived && !cmp.state.error) {
          const data = await jb.utils.resolveDelayed($props.waitFor, !passRx)
          jb.log('group wait dataArrived', {ctx,data})
          cmp.refresh({ dataArrived: true }, {
            srcCtx: ctx.cmpCtx,
            extendCtx: ctx => ctx.setVar(varName,data).setData(data)
          }, ctx)
        }
      } catch(e) {
        jb.logException(e,'group.wait',{ctx,cmp}) 
        cmp.refresh({error: JSON.stringify(e)},{},ctx)
      }
    })
  )
})

component('group.eliminateRecursion', {
  type: 'feature',
  description: 'can be put on a global top group',
  params: [
    {id: 'maxDepth', as: 'number'}
  ],
  impl: (ctx,maxDepth) => {
    const protectedComp = jb.path(ctx.cmpCtx,'cmpCtx.path')
    const timesInStack = jb.utils.callStack(ctx).filter(x=>x && x.indexOf(protectedComp) != -1).length
    if (timesInStack > maxDepth)
      return ctx.run( calcProp({id: 'ctrls', value: () => [], phase: 1, priority: 100 }))
  }
})

component('controls', {
  type: 'control',
  description: 'list of controls to be put inline, flatten inplace. E.g., set of table fields',
  category: 'group:20',
  params: [
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true, composite: true}
  ],
  impl: (ctx,controls) => {
    const res = controls(ctx)
    res.segment = true
    return res
  }
})