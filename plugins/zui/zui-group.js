jb.dsl('zui')

jb.component('group', {
  type: 'view',
  params: [
    {id: 'layout', type: 'layout', defaultValue: verticalOneByOne()},
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true, composite: true},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
  ],
  impl: (ctx,layout,viewsF,features) => {
    const views = viewsF()
    views.byPriority = views.slice(0).sort((x,y) => y.priority-x.priority )
    
    const view = {
      title: 'group',
      children: views,
      ctxPath: ctx.path,
      ...layout,
      renderProps: () => jb.zui.renderProps(ctx),
      pivots: () => views.flatMap(v=>v.pivots()),
      zuiElems: () => views.flatMap(v=>v.zuiElems()),
    }
    features().forEach(f=>f.enrich(view))
    return view
  }
})

jb.component('verticalOneByOne', {
  type: 'layout',
  impl: () => ({ layoutAxis:  1 })
})

jb.component('horizontalOneByOne', {
  type: 'layout',
  impl: () => ({ layoutAxis:  0 })
})

jb.component('priorty', {
  type: 'view_feature',
  params: [
    {id: 'priority', mandatory: true, as: 'number', description: 'scene enter order'}
  ],
  impl: (ctx,priority) => ({
    enrich(obj) { obj.priority = priority}
  })
})
