using('ui-core')

component('itemlist', {
  description: 'list, dynamic group, collection, repeat',
  type: 'control',
  category: 'group:80,common:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'items', as: 'array', type: 'data', dynamic: true, mandatory: true},
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true},
    {id: 'style', type: 'itemlist-style', dynamic: true, defaultValue: itemlist.ulLi()},
    {id: 'layout', type: 'layout'},
    {id: 'itemVariable', as: 'string', defaultValue: 'item'},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default itemlist is limmited to 100 shown items'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, ctx.params.layout)
})

component('itemlist.noContainer', {
  type: 'feature',
  category: 'group:20',
  impl: () => ({ extendCtx: ctx => ctx.setVars({itemlistCntr: null}) })
})

component('itemlist.init', {
  type: 'feature',
  impl: features(
    calcProp('allItems', '%$$model/items%'),
    calcProp('visualSizeLimit', ({},{$model,$state}) => Math.max($model.visualSizeLimit,$state.visualSizeLimit ||0)),
    calcProp('items', itemlist.calcSlicedItems()),
    calcProp('ctrls', (ctx,{$model,$props}) => {
      const controlsOfItem = (item,index) => $model.controls(ctx.setVars({index: index + (ctx.vars.$baseIndex || 0)}).setVar($model.itemVariable,item).setData(item)).filter(x=>x)
      return $props.items.map((item,i)=> controlsOfItem(item,i+1)).filter(x=>x.length > 0)
    }),
    calcProp({
      id: 'updateItemlistCntr',
      value: If('%$itemlistCntr%', typeAdapter('action<>',writeValue('%$itemlistCntr.items%', '%$$props.items%'))),
      phase: 100
    })
  )
})
