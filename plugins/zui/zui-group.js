dsl('zui')

extension('zui','layout', {
  initGroup(ctx) {
    const { layout, views,viewFeatures } = ctx.params
    const _views = views()
    _views.byPriority = _views.slice(0).sort((x,y) => y.priority-x.priority )
    
    const view = {
      title: 'group',
      children: _views,
      ctxPath: ctx.path,
      ...layout,
      pivots: () => _views.flatMap(v=>v.pivots()),
    }
    viewFeatures().forEach(f=>f.enrich(view))
    return view
  }
})

component('group', {
  type: 'view',
  params: [
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true, arrayInMacro: true},
    {id: 'layout', type: 'layout', defaultValue: vertical()},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => jb.zui.initGroup(ctx)
})

component('allOrNone', {
  type: 'view',
  params: [
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true},
    {id: 'layout', type: 'layout', defaultValue: vertical()},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => Object.assign(jb.zui.initGroup(ctx), {title: 'allOrNone', allOrNone: true })
})

component('firstToFit', {
  type: 'view',
  params: [
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true, arrayInMacro: true},
    {id: 'layout', type: 'layout', defaultValue: vertical()},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => Object.assign(jb.zui.initGroup(ctx), {title: 'firstToFit', firstToFit: true })
})

component('vertical', {
  type: 'layout',
  impl: () => ({ layoutAxis:  1 })
})

component('horizontal', {
  type: 'layout',
  impl: () => ({ layoutAxis:  0 })
})

