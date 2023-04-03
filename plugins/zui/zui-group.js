jb.dsl('zui')

jb.extension('zui','layout', {
  initGroup(ctx) {
    const { layout, views,viewFeatures } = ctx.params
    const _views = views()
    _views.byPriority = _views.slice(0).sort((x,y) => y.priority-x.priority )
    
    const view = {
      title: 'group',
      children: _views,
      ctxPath: ctx.path,
      ...layout,
      renderProps: () => jb.zui.renderProps(ctx),
      pivots: () => _views.flatMap(v=>v.pivots()),
      zuiElems: () => _views.flatMap(v=>v.zuiElems()),
    }
    viewFeatures().forEach(f=>f.enrich(view))
    return view
  }
})

jb.component('group', {
  type: 'view',
  params: [
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true},
    {id: 'layout', type: 'layout', defaultValue: vertical()},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
  ],
  impl: ctx => jb.zui.initGroup(ctx)
})

jb.component('allOrNone', {
  type: 'view',
  params: [
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true},
    {id: 'layout', type: 'layout', defaultValue: vertical()},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
  ],
  impl: ctx => Object.assign(jb.zui.initGroup(ctx), {title: 'allOrNone', allOrNone: true })
})

jb.component('firstToFit', {
  type: 'view',
  params: [
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true},
    {id: 'layout', type: 'layout', defaultValue: vertical()},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
  ],
  impl: ctx => Object.assign(jb.zui.initGroup(ctx), {title: 'firstToFit', firstToFit: true })
})

jb.component('vertical', {
  type: 'layout',
  impl: () => ({ layoutAxis:  1 })
})

jb.component('horizontal', {
  type: 'layout',
  impl: () => ({ layoutAxis:  0 })
})

