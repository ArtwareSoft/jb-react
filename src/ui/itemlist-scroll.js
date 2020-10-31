jb.component('itemlist.infiniteScroll', {
  type: 'feature',
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: features(
    method('fetchNextPage', runActions(
      Var('delta', itemlist.deltaOfNextPage('%$pageSize%')),
      action.applyDeltaToCmp({
          delta: '%$delta%', 
          cmpId: '%$cmp/cmpId%', 
          assumedVdom: (ctx,{cmp}) => jb.ui.elemToVdom(jb.ui.elemOfCmp(ctx,cmp.cmpId))
      })
    )),
    feature.userEventProps('elem.scrollTop,elem.scrollHeight'),
    frontEnd.flow(
      rx.merge(
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
    const deltaCalcCtx = cmp.ctx.setVar('$refreshElemCall',true)
      .setVar('$cmpId', cmp.cmpId).setVar('$cmpVer', cmp.ver+1)
      .ctx({profile: {...cmp.ctx.profile, items: () => nextPageItems}, path: ''}) // change the profile to return itemsToAppend
    const vdomOfDeltaItems = deltaCalcCtx.runItself().renderVdom() 
    const itemsParent = jb.ui.find(vdomOfDeltaItems,'.jb-items-parent')[0]
    const delta = itemsParent ? {
        _$prevVersion: cmp.ver,
        _$bySelector: {
            '.jb-items-parent': jb.ui.compareVdom({},itemsParent),
            ':scope': { attributes: { $scrollDown: true }}
    }} : {
      children: {toAppend: jb.ui.stripVdom(vdomOfDeltaItems).children }, 
      attributes: { $scrollDown: true },
      _$prevVersion: cmp.ver,
    }
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
