dsl('zui')

component('group', {
  type: 'view',
  params: [
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'layoutFeatures', type: 'group_layout_feature[]' }
  ],
  impl: ctx => jb.zui.initGroup(ctx)
})

component('allOrNone', {
  type: 'view',
  params: [
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'layoutFeatures', type: 'group_layout_feature[]' }
  ],
  impl: ctx => jb.zui.initGroup(ctx, 'allOrNone', { allOrNone: true})
})

component('firstToFit', {
  type: 'view',
  params: [
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'layoutFeatures', type: 'group_layout_feature[]' }
  ],
  impl: ctx => jb.zui.initGroup(ctx, 'firstToFit', { firstToFit: true})
})

// component('vertical', {
//   type: 'group_layout',
//   impl: () => ({ layoutAxis:  1 })
// })

// component('horizontal', {
//   type: 'group_layout',
//   impl: () => ({ layoutAxis:  0 })
// })

// component('minSize', {
//   type: 'group_layout_feature',
//   params: [
//     {id: 'minSize', mandatory: true, as: 'array', defaultValue: [0,0]},
//   ]
// })
