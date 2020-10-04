// jb.component('itemlist.infiniteScroll', {
//   type: 'feature',
//   params: [
//     {id: 'pageSize', as: 'number', defaultValue: 2}
//   ],
//   impl: features(
//     frontEnd.var('pageSize','%$pageSize%'),
//     method('fetchMoreItems', runActions(
//       Var('itemsToAppend', ({data},{$props}) => $props.allItems.slice(data.from,data.from+data.noOfItems)),
//       Var('updateState1', writeValue('%$$state/visualLimit/shownItems%', math.plus('%$$state/visualLimit/shownItems%','%noOfItems%'))),
//       Var('updateState2', writeValue('%$$state/visualLimit/waitingForServer%', false)),
//       Var('delta', itemlist.deltaOfItems('%$itemsToAppend%', '%$$state%')),
//       action.applyDeltaToCmp('%$delta%','%$cmp/cmpId%')
//     )),
//     feature.userEventProps('elem.scrollTop,elem.scrollHeight'),
//     frontEnd.flow(
//       rx.merge(
//         source.frontEndEvent('scroll'),
//         source.frontEndEvent('wheel')
//       ),
//       rx.var('applicative','%target/__appScroll%'),
//       rx.do(({data}) => data.target.__appScroll = null),
//       rx.var('scrollPercentFromTop',({data}) => 
//         (data.currentTarget.scrollTop + data.currentTarget.getBoundingClientRect().height) / data.currentTarget.scrollHeight),
//       rx.var('fetchItems', ({},{$state,pageSize}) => ({ 
//         from: $state.visualLimit.shownItems,
//         noOfItems: Math.min($state.visualLimit.totalItems,$state.visualLimit.shownItems + pageSize) - $state.visualLimit.shownItems
//       })),
//       rx.log('itemlist frontend infiniteScroll'),
//       rx.filter(and('%$scrollPercentFromTop%>0.9','%$fetchItems/noOfItems%!=0',not('%$applicative%'),not('%$$state/visualLimit/waitingForServer%'))),
//       rx.do(writeValue('%$$state/visualLimit/waitingForServer%','true')),
//       sink.BEMethod('fetchMoreItems','%$fetchItems%')
//     )
//   )
// })

// jb.component('itemlist.deltaOfItems', {
//   params: [
//     {id: 'items', defaultValue: '%%', as: 'array' },
//     {id: 'newState' }
//   ],
//   impl: (ctx,items,state) => {
//     if (items.length == 0) return null
//     const deltaCalcCtx = ctx.vars.cmp.ctx
//     const vdomWithDeltaItems = deltaCalcCtx.ctx({profile: Object.assign({},deltaCalcCtx.profile,{ items: () => items}), path: ''}).runItself().renderVdom() // change the profile to return itemsToAppend
//     const delta = {
//         $prevVersion = ctx.vars.cmp.ver,
//         $bySelector: {
//             '.jb-drag-parent': jb.ui.compareVdom({},jb.ui.findIncludeSelf(vdomWithDeltaItems,'.jb-drag-parent')[0]),
//             '': {$__state : JSON.stringify(state), $scrollDown: true }
//     }}
//     return delta
//   }
// })

// jb.component('itemlist.incrementalFromRx', {
//   type: 'feature',
//   params: [
//     {id: 'prepend', as: 'boolean', boolean: 'last at top' }
//   ],
//   impl: followUp.flow(
//       source.callbag(ctx => ctx.exp('%$$props.items%').callbag || jb.callbag.fromIter([])),
//       rx.map(If('%vars%','%data%','%%')), // rx/cb compatible ...
//       rx.var('delta', itemlist.deltaOfItems('%%')),
//       sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
//     )
// })

// jb.component('itemlist.calcSlicedItems', {
//   impl: ctx => {
//     const {$props, $model, cmp} = ctx.vars
//     const firstItem = $props.allItems[0]
//     if (jb.callbag.isCallbag(firstItem)) {
//       const res = []
//       res.callbag = firstItem
//       return res
//     }
//     const slicedItems = addSlicedState(cmp, $props.allItems, $model.visualSizeLimit)
//     const itemsRefs = jb.isRef(jb.asRef(slicedItems)) ? 
//         Object.keys(slicedItems).map(i=> jb.objectProperty(slicedItems,i)) : slicedItems
//     return itemsRefs

//     function addSlicedState(cmp,items,visualLimit) {
//       cmp.state.visualLimit = { totalItems: items.length, shownItems: visualLimit }
//       return visualLimit < items.length ? items.slice(0,visualLimit) : items
//     }
//   }
// })

jb.component('itemlist.infiniteScroll', {
  type: 'feature',
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: features(
    method('fetchNextPage', runActions(
      Var('delta', itemlist.deltaOfNextPage('%$pageSize%')),
      action.applyDeltaToCmp('%$delta%','%$cmp/cmpId%')
    )),    
    feature.userEventProps('elem.scrollTop,elem.scrollHeight'),
    frontEnd.flow(
      rx.merge(
        source.frontEndEvent('scroll'),
        source.frontEndEvent('wheel')
      ),
      rx.var('applicative','%target/__appScroll%'),
      rx.do(({data}) => data.target.__appScroll = null),
      rx.var('scrollPercentFromTop',({data}) => 
        (data.currentTarget.scrollTop + data.currentTarget.getBoundingClientRect().height) / data.currentTarget.scrollHeight),
      rx.log('itemlist frontend infiniteScroll'),
      rx.filter('%$scrollPercentFromTop%>0.9'),
      rx.filter(not('%$applicative%')),
      sink.BEMethod('fetchNextPage')
    )
  )
})

jb.component('itemlist.deltaOfItems', {
  impl: ctx => {
    const cmp = ctx.vars.cmp
    const newVdom = cmp.renderVdom(), oldVdom = cmp.oldVdom || {}
    const delta = jb.ui.compareVdom(oldVdom,newVdom)
    cmp.oldVdom = newVdom
    jb.log('uiComp itemlist delta incrementalFromRx', {cmp, newVdom, oldVdom, delta})
    return delta
  }
})

jb.component('itemlist.deltaOfNextPage', {
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: (ctx,pageSize) => {
    const $props = ctx.vars.$props, cmp = ctx.vars.cmp, $state = cmp.state
    $state.visualSizeLimit = $state.visualSizeLimit || $props.visualSizeLimit
    const nextPageItems = $props.allItems.slice($state.visualSizeLimit, $state.visualSizeLimit + pageSize)
    $state.visualSizeLimit = $state.visualSizeLimit + nextPageItems.length
    if (nextPageItems.length == 0) return null
    const deltaCalcCtx = cmp.ctx.setVar('$refreshElemCall',true).setVar('$cmpId', cmp.cmpId).setVar('$cmpVer', cmp.ver+1)
    const vdomOfDeltaItems = deltaCalcCtx.ctx({profile: Object.assign({},deltaCalcCtx.profile,{ items: () => nextPageItems}), path: ''}).runItself().renderVdom() // change the profile to return itemsToAppend
    const delta = {
        $prevVersion: cmp.ver,
        $bySelector: {
            '.jb-drag-parent': jb.ui.compareVdom({},jb.ui.findIncludeSelf(vdomOfDeltaItems,'.jb-drag-parent')[0]),
            ':scope': { attributes: { $scrollDown: true }}
    }}
    return delta
  }
})

jb.component('itemlist.incrementalFromRx', {
  type: 'feature',
  params: [
    {id: 'prepend', as: 'boolean', boolean: 'last at top' }
  ],
  impl: followUp.flow(
      source.callbag(ctx => ctx.exp('%$$props.items%').callbag || jb.callbag.fromIter([])),
      rx.map(If('%vars%','%data%','%%')), // rx/cb compatible ...
      rx.do(({data},{$props}) => $props.items.push(data)),
      rx.var('delta', itemlist.deltaOfItems()),
      sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
    )
})

jb.component('itemlist.calcSlicedItems', {
  impl: ctx => {
    const {allItems, visualSizeLimit, items} = ctx.vars.$props
    if (items) return items
    const firstItem = allItems[0]
    if (jb.callbag.isCallbag(firstItem)) {
      const res = []
      res.callbag = firstItem
      return res
    }
    const slicedItems = allItems.length > visualSizeLimit ? allItems.slice(0, visualSizeLimit) : allItems
    const itemsRefs = jb.isRef(jb.asRef(slicedItems)) ? Object.keys(slicedItems).map(i=> jb.objectProperty(slicedItems,i)) : slicedItems
    return itemsRefs
  }
})
