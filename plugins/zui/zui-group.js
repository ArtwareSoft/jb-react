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
    children('%$$model/controls()%'),
    '%$$model/layout%',
  )
})

component('allOrNone', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx, {layoutProp: { allOrNone: true } })
})

component('firstToFit', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx, {layoutProp: { firstToFit: true } })
})

component('children', {
  type: 'feature',
  params: [
    {id: 'children', as: 'array', dynamic: true}
  ],
  impl: (ctx,children) => ({children})
})

component('vertical', {
  type: 'group_layout',
  impl: () => ({layoutProp: { layoutAxis:  1 }})
})

component('horizontal', {
  type: 'group_layout',
  impl: () => ({layoutProp: { layoutAxis:  0 }})
})