dsl('zui')

component('group', {
  type: 'view',
  params: [
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true}
  ],
  impl: ctx => jb.zui.initGroup(ctx)
})

component('allOrNone', {
  type: 'view',
  params: [
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true}
  ],
  impl: ctx => Object.assign(jb.zui.initGroup(ctx), {title: 'allOrNone', allOrNone: true })
})

component('firstToFit', {
  type: 'view',
  params: [
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true}
  ],
  impl: ctx => Object.assign(jb.zui.initGroup(ctx), {title: 'firstToFit', firstToFit: true })
})

component('vertical', {
  type: 'group_layout',
  impl: () => ({ layoutAxis:  1 })
})

component('horizontal', {
  type: 'group_layout',
  impl: () => ({ layoutAxis:  0 })
})

