jb.ns('itemlist,itemlistContainer')

jb.component('itemlist', {
  description: 'list, dynamic group, collection, repeat',
  type: 'control',
  category: 'group:80,common:80',
  params: [
    {id: 'title', as: 'string'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true},
    {id: 'style', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.ulLi()},
    {id: 'layout', type: 'layout'},
    {id: 'itemVariable', as: 'string', defaultValue: 'item'},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default itemlist is limmited to 100 shown items'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, ctx.params.layout)
})

jb.component('itemlist.noContainer', {
  type: 'feature',
  category: 'group:20',
  impl: () => ({ extendCtx: ctx => ctx.setVars({itemlistCntr: null}) })
})

jb.component('itemlist.initContainerWithItems', {
  type: 'feature',
  category: 'itemlist:20',
  impl: calcProp({
    id: 'updateItemlistCntr',
    value: action.if('%$itemlistCntr%',writeValue('%$itemlistCntr.items%', '%$$props.items%')),
    phase: 100
  })
})

jb.component('itemlist.init', {
  type: 'feature',
  impl: features(
    calcProp('allItems', '%$$model/items%'),
    calcProp('items', itemlist.calcSlicedItems()),
    calcProp({
        id: 'ctrls',
        value: (ctx,{$model,$props}) => {
          const controlsOfItem = item => {
            const itemCtx = ctx.setVar($model.itemVariable,item).setData(item)
            return $model.controls(itemCtx).filter(x=>x).map(ctrl => Object.assign(ctrl,{ctxId : jb.ui.preserveCtx(itemCtx)}))
          }
          return $props.items.map(item=> controlsOfItem(item)).filter(x=>x.length > 0)
        }
      }),
    itemlist.initContainerWithItems()
  )
})

jb.component('itemlist.initTable', {
  type: 'feature',
  impl: features(
    calcProp('allItems', '%$$model/items%'),
    calcProp('items', itemlist.calcSlicedItems()),
    calcProp('itemsCtxs', pipeline('%$$props/items%', ctx => jb.ui.preserveCtx(ctx.setData()))),
    calcProp('fields', '%$$model/controls/field()%'),
    itemlist.initContainerWithItems()
  )
})

jb.component('itemlist.infiniteScroll', {
  type: 'feature',
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: features(
    method('appendToShownItems', runActions(
      Var('shown','%$$state/visualLimit/shownItems%'),
      Var('itemsToAppend', pipeline('%$$props/allItems%',slice('%$shown%',math.plus('%$shown%','%$pageSize%')))),
      Var('delta', itemlist.deltaOfItems('%$itemsToAppend%', 
        ({},{$state, shown, itemsToAppend}) => ({visualLimit: { ...$state.visualLimit, shownItems: shown + itemsToAppend.length} }))),
      //Var('cmpId','%$cmp/cmpId%'),
      action.applyDeltaToCmp('%$delta%','%$cmp/cmpId%')
    )),
    feature.userEventProps('elem.scrollTop,elem.scrollHeight'),
    frontEnd.flow(
      source.frontEndEvent('scroll'),
      rx.var('scrollPercentFromTop',({data}) => 
        (data.currentTarget.scrollTop + data.currentTarget.getBoundingClientRect().height) / data.currentTarget.scrollHeight),
      rx.filter('%$scrollPercentFromTop%>0.9'),
      sink.BEMethod('appendToShownItems')
    )
  )
})

jb.component('itemlist.deltaOfItems', {
  params: [
    {id: 'items', defaultValue: '%%', as: 'array' },
    {id: 'newState' }
  ],
  impl: (ctx,items, $__state) => {
    const deltaCalcCtx = ctx.vars.cmp.ctx
    const vdomWithDeltaItems = deltaCalcCtx.ctx({profile: Object.assign({},deltaCalcCtx.profile,{ items: () => items}), path: ''}).runItself().renderVdom() // change the profile to return itemsToAppend
    const emptyItemlistVdom = deltaCalcCtx.ctx({profile: Object.assign({},deltaCalcCtx.profile,{ items: () => []}), path: ''}).runItself().renderVdom()
    const delta = jb.ui.compareVdom(emptyItemlistVdom,vdomWithDeltaItems)
    delta.attributes = $__state ? { $__state } : {} // also keeps the original cmpId
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
      rx.var('delta', itemlist.deltaOfItems('%%')),
      sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
    )
})

jb.component('itemlist.calcSlicedItems', {
  impl: ctx => {
    const {$props, $model, cmp} = ctx.vars
    const firstItem = $props.allItems[0]
    if (jb.callbag.isCallbag(firstItem)) {
      const res = []
      res.callbag = firstItem
      return res
    }
    const slicedItems = addSlicedState(cmp, $props.allItems, $model.visualSizeLimit)
    const itemsRefs = jb.isRef(jb.asRef(slicedItems)) ? 
        Object.keys(slicedItems).map(i=> jb.objectProperty(slicedItems,i)) : slicedItems
    return itemsRefs

    function addSlicedState(cmp,items,visualLimit) {
      if (items.length > visualLimit)
        cmp.state.visualLimit = { totalItems: items.length, shownItems: visualLimit }
        return visualLimit < items.length ? items.slice(0,visualLimit) : items
    }
  }
})

// ****************** Selection ******************

jb.component('itemlist.selection', {
  type: 'feature',
  params: [
    {id: 'databind', as: 'ref', defaultValue: '%$itemlistCntrData/selected%', dynamic: true},
    {id: 'selectedToDatabind', dynamic: true, defaultValue: '%%'},
    {id: 'databindToSelected', dynamic: true, defaultValue: '%%'},
    {id: 'onSelection', type: 'action', dynamic: true},
    {id: 'onDoubleClick', type: 'action', dynamic: true},
    {id: 'autoSelectFirst', type: 'boolean'},
    {id: 'cssForSelected', as: 'string', defaultValue: 'color: var(--jb-menubar-selectionForeground); background: var(--jb-menubar-selectionBackground)'}
  ],
  impl: features(
    css(({},{},{cssForSelected}) => ['>.selected','>*>.selected','>*>*>.selected'].map(sel=>sel+ ' ' + jb.ui.fixCssLine(cssForSelected)).join('\n')),
    userStateProp({
      id: 'selected', // selected represented as ctxId of selected data
      phase: 20, // after 'ctrls'
      value: (ctx,{$props,$state},{databind, autoSelectFirst}) => {
        const currentVal = $state.selected && jb.path(jb.ctxDictionary[$state.selected],'data')
        const val = jb.val(jb.val(databind()) || currentVal || (autoSelectFirst && $props.items[0]))
        const itemsCtxs = $props.itemsCtxs || $props.ctrls.map(ctrl=> ctrl[0].ctxId)
        return itemsCtxs.filter(ctxId => jb.val(ctx.run(itemlist.ctxIdToData(() => ctxId))) == val)[0]
      }
    }),
    templateModifier(({},{vdom, selected}) => vdom.querySelectorAll('.jb-item')
        .filter(el => selected == el.getAttribute('jb-ctx'))
        .forEach(el => el.addClass('selected'))
    ),
    method('onSelection', runActionOnItem(itemlist.ctxIdToData(),
      runActions(
        If(isRef('%$databind()%'),writeValue('%$databind()%','%$selectedToDatabind()%')),
        call('onSelection'))
    )),
    method('onDoubleClick', runActionOnItem(itemlist.ctxIdToData(),
      runActions(
        If(isRef('%$databind()%'),writeValue('%$databind()%','%$selectedToDatabind()%')),
        call('onDoubleClick'))
    )),
    followUp.flow(source.data('%$$props/selected%'),
		  rx.filter(and('%$autoSelectFirst%',not('%$$state/refresh%'))),
      sink.BEMethod('onSelection')
    ),
    frontEnd.method('applyState', ({},{cmp}) => {
      Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
        .forEach(elem=>elem.classList.remove('selected'))
      Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item'))
        .filter(elem=> elem.getAttribute('jb-ctx') == cmp.state.selected)
        .forEach(elem=> {elem.classList.add('selected'); elem.scrollIntoViewIfNeeded()})
    }),
    frontEnd.method('setSelected', ({data},{cmp}) => {
        cmp.base.state.selected = cmp.state.selected = data
        cmp.runFEMethod('applyState')
    }),

    frontEnd.prop('selectionEmitter', rx.subject()),
    frontEnd.flow(
      source.frontEndEvent('dblclick'), 
      rx.map(itemlist.ctxIdOfElem('%target%')), rx.filter('%%'), 
      sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onDoubleClick')))
    ),
    frontEnd.flow(
        rx.merge( 
          rx.pipe(source.frontEndEvent('click'), rx.map(itemlist.ctxIdOfElem('%target%')), rx.filter('%%')),
          source.subject('%$cmp/selectionEmitter%')
        ),
        rx.distinctUntilChanged(),
        sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onSelection')))
    )
  )
})

jb.component('itemlist.keyboardSelection', {
  type: 'feature',
  macroByValue: false,
  params: [
    {id: 'autoFocus', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true}
  ],
  impl: features(
    htmlAttribute('tabIndex',0),
    method('onEnter', runActionOnItem(itemlist.ctxIdToData(),call('onEnter'))),
    frontEnd.passSelectionKeySource(),
    frontEnd.prop('onkeydown', rx.merge(
        source.frontEndEvent('keydown'), 
        source.findSelectionKeySource()
      ), 
      frontEnd.addUserEvent(),
      rx.log('itemlistOnkeydown')
    ),
    frontEnd.flow('%$cmp.onkeydown%', rx.filter('%keyCode%==13'), rx.filter('%$cmp.state.selected%'), sink.BEMethod('onEnter','%$cmp.state.selected%') ),
    frontEnd.flow(
      '%$cmp.onkeydown%',
      rx.filter(not('%ctrlKey%')),
      rx.log('itemlist0'),
      rx.filter(inGroup(list(38,40),'%keyCode%')),
      rx.map(itemlist.nextSelected(If('%keyCode%==40',1,-1))), 
      rx.log('itemlistOnkeydownNextSelected'),
      sink.subjectNext('%$cmp/selectionEmitter%')
    ),
    passPropToFrontEnd('autoFocus','%$autoFocus%'),
    frontEnd.init(If(and('%$autoFocus%','%$selectionKeySourceCmpId%'), action.focusOnCmp('itemlist autofocus') ))
  )
})

jb.component('itemlist.dragAndDrop', {
  type: 'feature',
  impl: features(
    method('moveItem', runActions(
      move(itemlist.ctxIdToData('%from%'),itemlist.ctxIdToData('%to%') ),
      action.refreshCmp()
    )),
    frontEnd.prop('drake', ({},{cmp}) => {
        if (!jb.frame.dragula) return jb.logError('itemlist.dragAndDrop - the dragula lib is not loaded')
        return dragula([cmp.base.querySelector('.jb-drag-parent') || cmp.base] , {
          moves: (el,source,handle) => jb.ui.parents(handle,{includeSelf: true}).some(x=>jb.ui.hasClass(x,'drag-handle'))
        })
    }),
    frontEnd.flow(source.dragulaEvent('drag',list('el')), 
      rx.map(itemlist.ctxIdOfElem('%el%')),
      rx.do(({},{cmp}) => cmp.ctxsOnDrag = Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item')).map(el=>el.getAttribute('jb-ctx'))),
      sink.subjectNext('%$cmp/selectionEmitter%')
    ),
    frontEnd.flow(source.dragulaEvent('drop',list('dropElm','target','source','sibling')), 
      rx.map(obj(
        prop('from', itemlist.ctxIdOfElem('%dropElm%')),
        prop('to', itemlist.ctxIdFromSibling('%sibling%'))
      )),
      sink.BEMethod('moveItem')
    ),
    frontEnd.flow(
      source.frontEndEvent('keydown'),
      rx.filter('%ctrlKey%'),
      rx.filter(inGroup(list(38,40),'%keyCode%')),
      rx.map(obj(
        prop('from', itemlist.nextSelected(0)),
        prop('to', itemlist.nextSelected(If('%keyCode%==40',1,-1)))
      )),          
      sink.BEMethod('moveItem')
    )
  )
})

jb.component('source.dragulaEvent',{
  type: 'rx:0',
  params: [
    {id: 'event', as: 'string'},
    {id: 'argNames', as: 'array', description: "e.g., ['dropElm', 'target', 'source']" }
  ],
  impl: source.callbag(({},{cmp},{event,argNames}) => 
    jb.callbag.create(obs=> cmp.drake.on(event, (...args) => obs(jb.objFromEntries(args.map((v,i) => [argNames[i],v]))))))
  
  // (ctx,event,argNames) => (start, sink) => {
  //   if (start !== 0) return
  //   const drake = jb.path(ctx.vars,'cmp.drake')
  //   if (!drake) return
  //   drake.on(event, function dragula(...args) { sink(1, ctx.dataObj(jb.objFromEntries(args.map((v,i) => [argNames[i],v])))) } )
  //   sink(0, (t,d) => {})
  // }
})

jb.component('itemlist.ctxIdFromSibling', {
  type: 'data:0',
  params: [
    {id: 'sibling', defaultValue: '%%'}
  ],
  impl: (ctx,sibling) => {
    const ctxs = ctx.vars.cmp.ctxsOnDrag
    const targetIndex = sibling ? jb.ui.index(sibling) : ctxs.length
    return ctxs[targetIndex-1];
  }
})

jb.component('itemlist.dragHandle', {
  description: 'put on the control inside the item which is used to drag the whole line',
  type: 'feature',
  impl: features(
    css.class('drag-handle'),
    css('{cursor: pointer}')
  )
})

jb.component('itemlist.shownOnlyOnItemHover', {
  type: 'feature',
  category: 'itemlist:75',
  description: 'put on the control inside the item which is shown when the mouse enters the line',
  impl: css.class('jb-shown-on-item-hover')
})

jb.component('itemlist.divider', {
  type: 'feature',
  params: [
    {id: 'space', as: 'number', defaultValue: 5}
  ],
  impl: css('>.jb-item:not(:first-of-type) { border-top: 1px solid rgba(0,0,0,0.12); padding-top: %$space%px }')
})

jb.component('itemlist.ctxIdOfElem', {
  type: 'data:0',
  description: 'also supports multiple elements',
  params: [
    {id: 'elem', defaultValue: '%%'}
  ],
  impl: (ctx,el) => {
      const itemElem = jb.ui.closest(el,'.jb-item')
      return itemElem && itemElem.getAttribute('jb-ctx')
  }
})

jb.component('itemlist.ctxIdsOfElems', {
  type: 'data:0',
  params: [
    {id: 'elem', defaultValue: '%%'}
  ],
  impl: (ctx,elem) => jb.asArray(elem).find(el=> {
      const itemElem = jb.ui.closest(el,'.jb-item')
      return itemElem && itemElem.getAttribute('jb-ctx')
  })
})

jb.component('itemlist.ctxIdToData', {
  type: 'data:0',
  params: [
    {id: 'ctxId', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,ctxId) => jb.path(jb.ctxDictionary[ctxId],'data')
})

jb.component('itemlist.findSelectionSource', {
  type: 'data:0',
  impl: ctx => {
    const {cmp,itemlistCntr} = ctx.vars
    const srcCtxId = itemlistCntr && itemlistCntr.selectionKeySourceCmp
    return [jb.ui.parentCmps(cmp.base).find(_cmp=>_cmp.selectionKeySource), document.querySelector(`[ctxId="${srcCtxId}"]`)]
      .map(el => el && el._component && el._component.selectionKeySource).filter(x=>x)[0]
  }
})

jb.component('itemlist.nextSelected', {
  type: 'data:0',
  params: [
    {id: 'diff', as: 'number'},
    {id: 'elementFilter', dynamic: 'true', defaultValue: true }
  ],
  impl: (ctx,diff,elementFilter) => {
    const {cmp} = ctx.vars
    const ctxs = Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item')).filter(el=>elementFilter(ctx.setData(el)))
      .map(el=>+el.getAttribute('jb-ctx'))
    const selectedIndex = ctxs.indexOf(+cmp.state.selected) + diff
    return ctxs[Math.min(ctxs.length-1,Math.max(0,selectedIndex))]
  }
})