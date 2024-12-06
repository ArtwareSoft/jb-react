dsl('zui')

component('group', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('group', {
  type: 'group-style',
  impl: features(
    frontEnd.var('zuiMode', If('%$cmp/topOfWidget%', 'flowMode', '%$zuiMode%')),
    children('%$$model/controls()%'),
    '%$$model/layout%',
    init((ctx,{cmp, $model, widget}) => {
      debugger;
      if (!cmp.topOfWidget) return
      cmp.extendedPayload = async topPayload => {
        const layoutCalculator = jb.zui.initLayoutCalculator(cmp)
        const {shownCmps} = layoutCalculator.calcStaticLayout()
        const groupCmps = {}
        await shownCmps.reduce((pr,cmp,i)=>pr.then(async ()=> groupCmps[cmp.id] = await cmp.calcPayload()), Promise.resolve())
        return groupCmps
      }
    }),
  )
})

component('allOrNone', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx, layoutProp('allOrNone'))
})

component('firstToFit', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx, layoutProp('firstToFit'))
})

component('children', {
  type: 'feature',
  params: [
    {id: 'children', as: 'array', dynamic: true}
  ],
  impl: (ctx,children) => ({children})
})

component('layoutProp', {
  type: 'group-feature',
  params: [
    {id: 'prop', as: 'string'}
  ],
  impl: (ctx,prop) => ({layoutProp: { [prop]: true } })
})

component('vertical', {
  type: 'group_layout',
  impl: () => ({layoutProp: { layoutAxis:  1 }})
})

component('horizontal', {
  type: 'group_layout',
  impl: () => ({layoutProp: { layoutAxis:  0 }})
})