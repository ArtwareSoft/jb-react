component('itemlist.infiniteScroll', {
  type: 'feature',
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: features(
    method('fetchNextPage', itemlist.applyDeltaOfNextPage('%$pageSize%')),
    feature.userEventProps('elem.scrollTop,elem.scrollHeight'),
    frontEnd.flow(
      source.merge(
        source.frontEndEvent('scroll'),
        source.frontEndEvent('wheel')
      ),
      rx.var('applicative','%target/__appScroll%'),
      rx.do(action.if('%$applicative%', runActions(
        log('itemlist applicative scroll terminated'),
        ({data}) => data.target.__appScroll = null
      ))),
      rx.filter(not('%$applicative%')),
      rx.var('scrollPercentFromTop',({data}) => 
        (data.currentTarget.scrollTop + data.currentTarget.getBoundingClientRect().height) / data.currentTarget.scrollHeight),
      rx.log('itemlist frontend infiniteScroll'),
      rx.filter('%$scrollPercentFromTop%>0.9'),
      sink.BEMethod('fetchNextPage')
    )
  )
})

component('itemlist.applyDeltaOfNextPage', {
  type: 'action',
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: (ctx,pageSize) => {
    const $props = ctx.vars.$props, cmp = ctx.vars.cmp, $state = cmp.state, cmpId = cmp.cmpId
    jb.log('itemlist applyDeltaOfNextPage',{ctx,pageSize,$props,$state,cmpId})
    $state.visualSizeLimit = $state.visualSizeLimit || $props.visualSizeLimit
    const nextPageItems = $props.allItems.slice($state.visualSizeLimit, $state.visualSizeLimit + pageSize)
    $state.visualSizeLimit = $state.visualSizeLimit + nextPageItems.length
    if (nextPageItems.length == 0) return null
    const deltaCalcCtx = cmp.ctx.setVar('$refreshElemCall',true)
      .setVars({$cmpId: cmpId, $cmpVer: cmp.ver+1, $baseIndex: $state.visualSizeLimit - nextPageItems.length})
      .ctx({profile: {...cmp.ctx.profile, items: () => nextPageItems}, path: ''}) // change the profile to return itemsToAppend
    const deltaCmp = deltaCalcCtx.runItself()
    const oldCmp = jb.ui.cmps[cmpId]
    const vdomOfDeltaItems = deltaCmp.renderVdom()
    jb.ui.cmps[cmpId] = oldCmp
    cmp.renderProps.items = [...cmp.renderProps.items, ...deltaCmp.renderProps.items]
    cmp.renderProps.ctrls = [...cmp.renderProps.ctrls, ...deltaCmp.renderProps.ctrls]
    const itemsParent = jb.ui.find(vdomOfDeltaItems,'.jb-items-parent')[0] || vdomOfDeltaItems
    const appendDelta = { children: {toAppend: jb.ui.stripVdom(itemsParent).children } }
    const deltaOfItems = itemsParent == vdomOfDeltaItems ? appendDelta : { _$bySelector: {'.jb-items-parent': appendDelta} }
    const deltaOfCmp = { attributes: { $scrollDown: true, $__state : JSON.stringify($state) } }

    jb.ui.applyDeltaToCmp({ctx,delta: deltaOfItems,cmpId,assumedVdom: jb.ui.elemToVdom(jb.ui.elemOfCmp(ctx,cmpId))})
    jb.ui.applyDeltaToCmp({ctx,delta: deltaOfCmp,cmpId})
  }
})

component('itemlist.deltaOfItems', {
  impl: ctx => {
    const cmp = ctx.vars.cmp
    const newVdom = cmp.renderVdom(), oldVdom = cmp.oldVdom || {}
    const delta = jb.ui.compareVdom(oldVdom,newVdom,ctx)
    cmp.oldVdom = newVdom
    jb.log('uiComp itemlist delta incrementalFromRx', {cmp, newVdom, oldVdom, delta})
    return delta
  }
})

component('itemlist.incrementalFromRx', {
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

component('itemlist.calcSlicedItems', {
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
    const itemsRefs = jb.db.isRef(jb.db.asRef(slicedItems)) ? Object.keys(slicedItems).map(i=> jb.db.objectProperty(slicedItems,i)) : slicedItems
    return itemsRefs
  }
})
