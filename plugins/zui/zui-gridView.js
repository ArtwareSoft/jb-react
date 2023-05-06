jb.dsl('zui')

component('zui.gridView', {
  type: 'view',
  params: [
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'DIM', as: 'number', defaultValue: 256},
    {id: 'itemView', type: 'view', mandatory: true, dynamic: true},
    {id: 'itemProps', type: 'itemProp[]', dynamic: true, flattenArray: true},
    {id: 'features', type: 'view_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: (ctx,itemsF,DIM,itemViewF,itemPropsF,features) => {
    const items = itemsF()
    const gridProps = { DIM, items }
    const ctxWithItems = ctx.setVars({items})
    const itemProps = itemPropsF(ctxWithItems)
    const itemView = itemViewF(ctxWithItems.setVars({itemProps}))
    const pivotsFromItemProps = itemProps.flatMap(prop=>prop.pivots({DIM}))
    const pivots = [...pivotsFromItemProps, ...itemView.pivots({DIM})
        .filter(p=>! pivotsFromItemProps.find(_p => _p.att == p.att)) ]
    pivots.forEach(p=>{if (p.preferedAxis) pivots[p.preferedAxis] = p})
    const itemsPositions = pivots.x && pivots.y && jb.zui.calcItemsPositions({items, pivots, DIM})
    const props = {
      DIM, ZOOM_LIMIT: [1, jb.ui.isMobile() ? DIM: DIM*2], itemView, items, pivots,
        itemsPositions, ...jb.zui.prepareItemView(itemView)
    }


    const view = {
      layoutRounds: 1,
      sizeNeeds: ({round, available }) => (available[0] < 100 || available[1] < 100) ? [0,0] : available,
      title: 'gridView',
      ctxPath: ctx.path,
      pivots: (s) => [],
      priority: 0,
      innerLayout() {
        // TODO: fix zoom and center
        //return jb.zui.layoutView...
      }
    }
    features().forEach(f=>f.enrich(view))
    return view
  }
})
  
