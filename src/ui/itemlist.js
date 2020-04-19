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
  impl: ctx => ({ extendCtx: (ctx,cmp) => ctx.setVars({itemlistCntr: null}) })
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
    calcProp('items', (ctx,{cmp}) => jb.ui.itemlistCalcItems(ctx,cmp)),
    calcProp({
        id: 'ctrls',
        value: ctx => {
          const controlsOfItem = item =>
            ctx.vars.$model.controls(ctx.setVar(ctx.vars.$model.itemVariable,item).setData(item)).filter(x=>x)
          return ctx.vars.$props.items.map(item=> Object.assign(controlsOfItem(item),{item})).filter(x=>x.length > 0)
        }
      }),
    itemlist.initContainerWithItems()
  )
})

jb.component('itemlist.initTable', {
  type: 'feature',
  impl: features(
    calcProp('items', (ctx,{cmp}) => jb.ui.itemlistCalcItems(ctx,cmp)),
    calcProp({id: 'fields', value: '%$$model/controls/field%'}),
    itemlist.initContainerWithItems()
  )
})

jb.component('itemlist.infiniteScroll', {
  type: 'feature',
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: features(
    defHandler('onscrollHandler', (ctx,{ev, $state},{pageSize}) => {
      const elem = ev.target
      if (!$state.visualLimit || !ev.scrollPercentFromTop || ev.scrollPercentFromTop < 0.9) return
      const allItems = ctx.vars.$model.items()
      const needsToLoadMoreItems = $state.visualLimit.shownItems && $state.visualLimit.shownItems < allItems.length
      if (!needsToLoadMoreItems) return
      const cmpCtx = jb.ui.ctxOfElem(elem)
      if (!cmpCtx) return
      const itemsToAppend = allItems.slice($state.visualLimit.shownItems, $state.visualLimit.shownItems + pageSize)
      const ctxToRun = cmpCtx.ctx({profile: Object.assign({},cmpCtx.profile,{ items: () => itemsToAppend}), path: ''}) // change the profile to return itemsToAppend
      const vdom = ctxToRun.runItself().renderVdom()
      const itemlistVdom = jb.ui.findIncludeSelf(vdom,'tbody')[0] || jb.ui.findIncludeSelf(vdom,'.jb-itemlist')[0]
      const elemToExpand = jb.ui.findIncludeSelf(elem,'tbody')[0] || jb.ui.findIncludeSelf(elem,'.jb-itemlist')[0]
      if (itemlistVdom) {
        console.log(itemsToAppend,ev)
        jb.ui.appendItems(elemToExpand,itemlistVdom,ctx)
        $state.visualLimit.shownItems += itemsToAppend.length
      }
    }
      ),
    templateModifier(({},{vdom}) => vdom.setAttribute('onscroll',true))
  )
})

jb.component('itemlist.fastFilter', {
  type: 'feature',
  description: 'use display:hide to filter itemlist elements',
  params: [
    {id: 'showCondition', mandatory: true, dynamic: true, defaultValue: itemlistContainer.conditionFilter()},
    {id: 'filtersRef', mandatory: true, as: 'ref', dynamic: true, defaultValue: '%$itemlistCntrData/search_pattern%'}
  ],
  impl: interactive(
    (ctx,{cmp},{showCondition,filtersRef}) =>
      jb.subscribe(jb.ui.refObservable(filtersRef(cmp.ctx),cmp,{srcCtx: ctx}),
          () => Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item')).forEach(elem=>
                elem.style.display = showCondition(jb.ctxDictionary[elem.getAttribute('jb-ctx')]) ? 'block' : 'none'))
  )
})

jb.component('itemlist.ulLi', {
  type: 'itemlist.style',
  impl: customStyle({
    template: (cmp,{ctrls},h) => h('ul#jb-itemlist',{},
        ctrls.map(ctrl=> h('li#jb-item', {'jb-ctx': jb.ui.preserveCtx(ctrl[0] && ctrl[0].ctx)} ,
          ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features: itemlist.init()
  })
})

jb.component('itemlist.div', {
  type: 'itemlist.style',
  params: [
    {id: 'spacing', as: 'number', defaultValue: 0}
  ],
  impl: customStyle({
    template: (cmp,{ctrls},h) => h('div#jb-itemlist jb-drag-parent',{},
        ctrls.map(ctrl=> h('div#jb-item', {'jb-ctx': jb.ui.preserveCtx(ctrl[0] && ctrl[0].ctx)} ,
          ctrl.map(singleCtrl=>h(singleCtrl))))),
    features: itemlist.init()
  })
})

jb.component('itemlist.horizontal', {
  type: 'itemlist.style',
  params: [
    {id: 'spacing', as: 'number', defaultValue: 0}
  ],
  impl: customStyle({
    template: (cmp,{ctrls},h) => h('div#jb-itemlist jb-drag-parent',{},
        ctrls.map(ctrl=> h('div#jb-item', {'jb-ctx': jb.ui.preserveCtx(ctrl[0] && ctrl[0].ctx)} ,
          ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features: itemlist.init()
  })
})

jb.ui.itemlistInitCalcItems = cmp => cmp.calcItems = cmp.calcItems || (() => Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item'))
    .map(el=>(jb.ctxDictionary[el.getAttribute('jb-ctx')] || {}).data).filter(x=>x).map(x=>jb.val(x)))

jb.ui.itemlistCalcItems = function(ctx,cmp) {
  const slicedItems = addSlicedState(cmp, ctx.vars.$model.items(), ctx.vars.$model.visualSizeLimit)
  const itemsRefs = jb.isRef(jb.asRef(slicedItems)) ? 
      Object.keys(slicedItems).map(i=>jb.objectProperty(slicedItems,i)) : slicedItems
  return itemsRefs

  function addSlicedState(cmp,items,visualLimit) {
    if (items.length > visualLimit)
      cmp.state.visualLimit = { totalItems: items.length, shownItems: visualLimit }
      return visualLimit < items.length ? items.slice(0,visualLimit) : items
  }
}

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
    {id: 'cssForSelected', as: 'string', description: 'e.g. background: #bbb', defaultValue: 'background: #bbb !important; color: #fff !important'}
  ],
  impl: (ctx,databind) => ({
    onclick: true,
    ondblclick: true,
    afterViewInit: cmp => {
        const {pipe,map,filter,subscribe,merge,subject,distinctUntilChanged,catchError} = jb.callbag
        cmp.selectionEmitter = subject();
        cmp.clickEmitter = pipe(
          merge(cmp.onclick,cmp.ondblclick),
          map(e=>dataOfElem(e.target)),
          filter(x=>x)
        )
        pipe(cmp.ondblclick,
          map(e=> dataOfElem(e.target)),
          filter(x=>x),
          subscribe(data => ctx.params.onDoubleClick(cmp.ctx.setData(data)))
        )

        jb.ui.itemlistInitCalcItems(cmp)
        cmp.items = cmp.calcItems()

        cmp.setSelected = selected => {
          cmp.state.selected = selected
          if (!cmp.base) return
          Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
            .forEach(elem=>elem.classList.remove('selected'))
          Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item'))
            .filter(elem=> jb.val((jb.ctxDictionary[elem.getAttribute('jb-ctx')] || {}).data) === jb.val(selected))
            .forEach(elem=> {elem.classList.add('selected'); elem.scrollIntoViewIfNeeded()})
        }
        cmp.doRefresh = () => cmp.setSelected(cmp.state.selected)

        pipe(merge(cmp.selectionEmitter,cmp.clickEmitter),
          distinctUntilChanged(),
          filter(x=>x),
          subscribe( selected => {
              writeSelectedToDatabind(selected);
              cmp.setSelected(selected)
              ctx.params.onSelection(cmp.ctx.setData(selected));
        }))

        const selectedRef = databind()

        jb.isWatchable(selectedRef) && pipe(
          jb.ui.refObservable(selectedRef,cmp,{throw: true, srcCtx: ctx}),
          catchError(() => cmp.setSelected(null) || []),
          subscribe(() => cmp.setSelected(selectedOfDatabind()))
        )

        if (cmp.state.selected && cmp.items.indexOf(cmp.state.selected) == -1) // clean irrelevant selection
          cmp.state.selected = null;
        if (selectedOfDatabind()) //selectedRef && jb.val(selectedRef))
          cmp.setSelected(selectedOfDatabind())
        if (!cmp.state.selected)
          autoSelectFirstWhenEnabled()

        function autoSelectFirstWhenEnabled() {
          if (ctx.params.autoSelectFirst && cmp.items[0] && !jb.val(selectedRef))
              jb.delay(1).then(()=> cmp.selectionEmitter.next(cmp.items[0]))
        }
        function writeSelectedToDatabind(selected) {
          return selectedRef && jb.writeValue(selectedRef,ctx.params.selectedToDatabind(ctx.setData(selected)), ctx)
        }
        function selectedOfDatabind() {
          return selectedRef && jb.val(ctx.params.databindToSelected(ctx.setVars({items: cmp.calcItems()}).setData(jb.val(selectedRef))))
        }
        function dataOfElem(el) {
          const itemElem = jb.ui.closest(el,'.jb-item')
          const ctxId = itemElem && itemElem.getAttribute('jb-ctx')
          return jb.val(((ctxId && jb.ctxDictionary[ctxId]) || {}).data)
        }
    },
    css: ['>.selected','>*>.selected','>*>*>.selected'].map(sel=>sel+ ' ' + jb.ui.fixCssLine(ctx.params.cssForSelected)).join('\n')
  })
})

jb.component('itemlist.keyboardSelection', {
  type: 'feature',
  macroByValue: false,
  params: [
    {id: 'autoFocus', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true}
  ],
  impl: ctx => ({
    templateModifier: vdom => {
      vdom.attributes = vdom.attributes || {};
      vdom.attributes.tabIndex = 0
    },
    afterViewInit: cmp => {
        const {pipe,map,filter,subscribe,merge} = jb.callbag
        const selectionKeySourceCmp = jb.ui.parentCmps(cmp.base).find(_cmp=>_cmp.selectionKeySource)
        let onkeydown = jb.path(cmp.ctx.vars,'itemlistCntr.keydown') || jb.path(selectionKeySourceCmp,'onkeydown');
        if (!onkeydown) {
          onkeydown = jb.ui.fromEvent(cmp, 'keydown')
          if (ctx.params.autoFocus)
            jb.ui.focus(cmp.base,'itemlist.keyboard-selection init autoFocus',ctx)
        } else {
          onkeydown = merge(onkeydown,jb.ui.fromEvent(cmp, 'keydown'))
        }
        cmp.onkeydown = onkeydown
        jb.ui.itemlistInitCalcItems(cmp)

        pipe(cmp.onkeydown,
          filter(e=> e.keyCode == 13 && cmp.state.selected),
          subscribe(() => ctx.params.onEnter(cmp.ctx.setData(cmp.state.selected))))

        pipe(cmp.onkeydown,
          filter(ev => !ev.ctrlKey && (ev.keyCode == 38 || ev.keyCode == 40)),
          map(ev => {
              ev.stopPropagation();
              const diff = ev.keyCode == 40 ? 1 : -1;
              cmp.items = cmp.calcItems()
              const selectedIndex = cmp.items.indexOf(cmp.state.selected) + diff
              return cmp.items[Math.min(cmp.items.length-1,Math.max(0,selectedIndex))];
          }),
          subscribe(selected => cmp.selectionEmitter && cmp.selectionEmitter.next(selected) ))
      },
    })
})

jb.component('itemlist.dragAndDrop', {
  type: 'feature',
  impl: ctx => ({
      afterViewInit: function(cmp) {
        if (!jb.frame.dragula)
          return jb.logError('itemlist.dragAndDrop - the dragula lib is not loaded')
        jb.ui.itemlistInitCalcItems(cmp)

        cmp.itemsAsRef = () => jb.asRef(jb.path(jb.ctxDictionary,`${cmp.base.getAttribute('jb-ctx')}.params.items`)())

        const drake = dragula([cmp.base.querySelector('.jb-drag-parent') || cmp.base] , {
          moves: (el,source,handle) => jb.ui.parents(handle,{includeSelf: true}).some(x=>jb.ui.hasClass(x,'drag-handle'))
        })

        drake.on('drag', function(el, source) {
          cmp.items = cmp.calcItems()
          let item = jb.val(el.getAttribute('jb-ctx') && jb.ctxDictionary[el.getAttribute('jb-ctx')].data);
          if (!item) {
            const item_comp = el._component || (el.firstElementChild && el.firstElementChild._component);
            item = item_comp && item_comp.ctx.data;
          }
          el.dragged = {
            item,
            remove: item => cmp.items.splice(cmp.items.indexOf(item), 1)
          }
          cmp.selectionEmitter && cmp.selectionEmitter.next(el.dragged.item);
        });
        drake.on('drop', (dropElm, target, source,sibling) => {
            const draggedIndex = cmp.items.indexOf(dropElm.dragged.item)
            const targetIndex = sibling ? jb.ui.index(sibling) : cmp.items.length
            jb.move(jb.asRef(cmp.items[draggedIndex]),jb.asRef(cmp.items[targetIndex-1]),ctx)
            dropElm.dragged = null;
            cmp.doRefresh && cmp.doRefresh()
        })
        cmp.dragAndDropActive = true

        // ctrl + Up/Down
        jb.delay(1).then(_=>{ // wait for the keyboard selection to register keydown
        if (!cmp.onkeydown) return;
        jb.subscribe(cmp.onkeydown, e => {
            if (e.ctrlKey && (e.keyCode == 38 || e.keyCode == 40)) {
              cmp.items = cmp.calcItems()
              const diff = e.keyCode == 40 ? 1 : -1;
              const selectedIndex = cmp.items.indexOf(jb.val(cmp.state.selected))
              if (selectedIndex == -1) return;
              const targetIndex = (selectedIndex + diff+ cmp.items.length) % cmp.items.length;
              jb.move(jb.asRef(cmp.state.selected),jb.asRef(cmp.items[targetIndex]),ctx)
              cmp.items = cmp.calcItems()
              cmp.selectionEmitter && cmp.selectionEmitter.next(cmp.items[targetIndex])
        }})
        })
      }
    })
})

jb.component('itemlist.dragHandle', {
  description: 'put on the control inside the item which is used to drag the whole line',
  type: 'feature',
  impl: list(
    css.class('drag-handle'),
    css('{cursor: pointer}')
  )
})

jb.component('itemlist.shownOnlyOnItemHover', {
  type: 'feature',
  category: 'itemlist:75',
  description: 'put on the control inside the item which is shown when the mouse enters the line',
  impl: (ctx,cssClass,cond) => ({
    class: 'jb-shown-on-item-hover',
  })
})

jb.component('itemlist.divider', {
  type: 'feature',
  params: [
    {id: 'space', as: 'number', defaultValue: 5}
  ],
  impl: (ctx,space) =>
    ({css: `>.jb-item:not(:first-of-type) { border-top: 1px solid rgba(0,0,0,0.12); padding-top: ${space}px }`})
})
