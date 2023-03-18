jb.dsl('zui')

jb.component('group', {
  type: 'view',
  params: [
    {id: 'layout', type: 'layout', defaultValue: verticalOneByOne()},
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
  ],
  impl: (ctx,layout,viewsF,features) => {
    const views = viewsF()
    views.byPriority = views.slice(0).sort((x,y) => y.priority-x.priority )
    
    const view = {
      title: 'group',
      children: views,
      path: ctx.path,
      state: () => jb.zui.viewState(ctx),
      pivots: () => views.flatMap(v=>v.pivots()),
      zuiElems: () => views.flatMap(v=>v.zuiElems()),
      //layout: layoutProps => Object.assign(jb.zui.viewState(ctx), layout.layout(layoutProps, views)),
    }
    features().forEach(f=>f.enrich(view))
    return view
  }
})

jb.component('verticalOneByOne', {
  type: 'layout',
  impl: ctx => ({
    layout(layoutProps, views) {
      debugger
      const {height, top} = layoutProps
      let sizeLeft = height, accTop = top
      views.byPriority.forEach(v=>{
        const state = v.state()
        const viewPreferedHeight = v.preferedHeight ? v.preferedHeight(layoutProps) : 0
        if (sizeLeft == 0) {
          state.height = 0
        } else if (sizeLeft > viewPreferedHeight) {
          state.height = viewPreferedHeight
          sizeLeft -= viewPreferedHeight
        } else if (sizeLeft > v.enterHeight) {
          state.height = sizeLeft
          sizeLeft = 0
        } else {
          state.height = 0
          sizeLeft = 0
        }
        v.layout({...layoutProps, height: null})
      })

      views.filter(v=>jb.zui.isVisible(v)).forEach(v=>{
        v.state().top = accTop
        accTop += height
      })
      return layoutProps
    }
  })
})

jb.component('horizontalOneByOne', {
  type: 'layout',
  params: [
  ],
  impl: ctx => ctx.params
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
