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
    value: action.if('%$itemlistCntr%', writeValue('%$itemlistCntr.items%', '%$$props.items%')),
    phase: 100
  })
})

jb.component('itemlist.init', {
  type: 'feature',
  impl: features(
    calcProp('allItems', '%$$model/items%'),
    calcProp('visualSizeLimit', ({},{$model,$state}) => Math.max($model.visualSizeLimit,$state.visualSizeLimit ||0)),
    calcProp('items', itemlist.calcSlicedItems()),
    calcProp('ctrls', (ctx,{$model,$props}) => {
      const controlsOfItem = (item,index) => $model.controls(ctx.setVars({index}).setVar($model.itemVariable,item).setData(item)).filter(x=>x)
      return $props.items.map((item,i)=> controlsOfItem(item,i+1)).filter(x=>x.length > 0)
    }),
    itemlist.initContainerWithItems()
  )
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
    {id: 'cssForSelected', as: 'string', defaultValue: 'color: var(--jb-menubar-selection-fg); background: var(--jb-menubar-selection-bg)'}
  ],
  impl: features(
    css(
      ({},{},{cssForSelected}) => ['>.selected','>*>.selected','>*>*>.selected'].map(sel=>sel+ ' ' + jb.ui.fixCssLine(cssForSelected)).join('\n')
    ),
    userStateProp({
      id: 'selected',
      value: (ctx,{$props,$state},{databind, autoSelectFirst, databindToSelected}) => {
        const currentVal = $state.selected && jb.path(jb.ctxDictionary[$state.selected],'data')
        const databindVal = jb.val(databind()) 
        const val = jb.val( databindVal != null && databindToSelected(ctx.setData(databindVal)) || currentVal || (autoSelectFirst && $props.items[0]))
        return $props.items.findIndex(item => jb.val(item) == val)
      },
      phase: 20
    }),
    templateModifier(({},{vdom, selected}) => {
      const parent = vdom.querySelector('.jb-items-parent') || vdom
      const el = jb.path(parent,`children.${selected}`)
      el && el.addClass('selected')
    }),
    method(
      'onSelection',
      runActionOnItem(
        itemlist.indexToData(),
        runActions(If(isRef('%$databind()%'), writeValue('%$databind()%', '%$selectedToDatabind()%')), call('onSelection'))
      )
    ),
    method(
      'onDoubleClick',
      runActionOnItem(
        itemlist.indexToData(),
        runActions(If(isRef('%$databind()%'), writeValue('%$databind()%', '%$selectedToDatabind()%')), call('onDoubleClick'))
      )
    ),
    followUp.flow(
      source.data('%$$props/selected%'),
      rx.filter(and('%$autoSelectFirst%', not('%$$state/refresh%'))),
      sink.BEMethod('onSelection')
    ),
    frontEnd.method('applyState', ({},{cmp}) => {
      Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
        .forEach(elem=>elem.classList.remove('selected'))
      const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
      const elem = parent.children[cmp.state.selected]
      if (elem) {
        elem.classList.add('selected')
        elem.scrollIntoViewIfNeeded()
      }
    }),
    frontEnd.method('setSelected', ({data},{cmp}) => {
        cmp.base.state.selected = cmp.state.selected = data
        cmp.runFEMethod('applyState')
    }),
    frontEnd.prop('selectionEmitter', rx.subject()),
    frontEnd.flow(
      source.frontEndEvent('dblclick'),
      rx.map(itemlist.indexOfElem('%target%')),
      rx.filter('%%'),
      sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onDoubleClick')))
    ),
    frontEnd.flow(
      rx.merge(
        rx.pipe(source.frontEndEvent('click'), rx.map(itemlist.indexOfElem('%target%')), rx.filter('%%')),
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
    htmlAttribute('tabIndex', 0),
    method('onEnter', runActionOnItem(itemlist.indexToData(), call('onEnter'))),
    frontEnd.passSelectionKeySource(),
    frontEnd.prop('onkeydown', rx.merge(source.frontEndEvent('keydown'), source.findSelectionKeySource())),
    frontEnd.flow(
      '%$cmp.onkeydown%',
      rx.filter('%keyCode%==13'),
      rx.filter('%$cmp.state.selected%'),
      sink.BEMethod('onEnter', '%$cmp.state.selected%')
    ),
    frontEnd.flow(
      '%$cmp.onkeydown%',
      rx.filter(not('%ctrlKey%')),
      rx.filter(inGroup(list(38, 40), '%keyCode%')),
      rx.map(itemlist.nextSelected(If('%keyCode%==40', 1, -1))),
      rx.log('itemlist frontend nextSelected'),
      sink.subjectNext('%$cmp/selectionEmitter%')
    ),
    frontEnd.var('autoFocus', '%$autoFocus%'),
    frontEnd.init(If(and('%$autoFocus%', '%$selectionKeySourceCmpId%'), action.focusOnCmp('itemlist autofocus')))
  )
})

jb.component('itemlist.dragAndDrop', {
  type: 'feature',
  impl: features(
    method('moveItem', runActions(move(itemlist.indexToData('%from%'), itemlist.indexToData('%to%')), action.refreshCmp())),
    frontEnd.prop('drake', ({},{cmp}) => {
        if (!jb.frame.dragula) return jb.logError('itemlist.dragAndDrop - the dragula lib is not loaded')
        return dragula([cmp.base.querySelector('.jb-items-parent') || cmp.base] , {
          moves: (el,source,handle) => jb.ui.parents(handle,{includeSelf: true}).some(x=>jb.ui.hasClass(x,'drag-handle'))
        })
    }),
    frontEnd.flow(
      source.dragulaEvent('drag', list('el')),
      rx.map(itemlist.indexOfElem('%el%')),
      rx.do(({},{cmp}) => 
        Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item')).forEach(el=>el.setAttribute('jb-original-index',jb.ui.indexOfElement(el)))
      ),
      sink.subjectNext('%$cmp/selectionEmitter%')
    ),
    frontEnd.flow(
      source.dragulaEvent('drop', list('dropElm', 'target', 'source', 'sibling')),
      rx.map(obj(prop('from', itemlist.indexOfElem('%dropElm%')), prop('to', itemlist.orignialIndexFromSibling('%sibling%')))),
      sink.BEMethod('moveItem')
    ),
    frontEnd.flow(
      source.frontEndEvent('keydown'),
      rx.filter('%ctrlKey%'),
      rx.filter(inGroup(list(38, 40), '%keyCode%')),
      rx.map(obj(prop('from', itemlist.nextSelected(0)), prop('to', itemlist.nextSelected(If('%keyCode%==40', 1, -1))))),
      sink.BEMethod('moveItem')
    )
  )
})

jb.component('source.dragulaEvent', {
  type: 'rx:0',
  params: [
    {id: 'event', as: 'string'},
    {id: 'argNames', as: 'array', description: "e.g., ['dropElm', 'target', 'source']"}
  ],
  impl: source.callbag(({},{cmp},{event,argNames}) =>
    jb.callbag.create(obs=> cmp.drake.on(event, (...args) => obs(jb.objFromEntries(args.map((v,i) => [argNames[i],v]))))))
})

jb.component('itemlist.orignialIndexFromSibling', {
  type: 'data:0',
  params: [
    {id: 'sibling', defaultValue: '%%'}
  ],
  impl: (ctx,sibling) => {
    const cmp = ctx.vars.cmp
    const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
    const indeces = Array.from(parent.children).map(el => +el.getAttribute('jb-original-index'))
    const targetIndex = sibling ? jb.ui.indexOfElement(sibling) : indeces.length
    const result = indeces[targetIndex-1]
    jb.log('itemlist DD orignialIndexFromSibling',{sibling, indeces,targetIndex, result,ctx})
    return result
  }
})

jb.component('itemlist.dragHandle', {
  description: 'put on the control inside the item which is used to drag the whole line',
  type: 'feature',
  impl: features(css.class('drag-handle'), css('{cursor: pointer}'))
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

jb.component('itemlist.indexOfElem', {
  type: 'data:0',
  description: 'also supports multiple elements',
  params: [
    {id: 'elem', defaultValue: '%%'}
  ],
  impl: ({},el) => {
      const elem = jb.ui.closest(el,'.jb-item')
      return elem && jb.ui.indexOfElement(elem)
  }
})

jb.component('itemlist.indexToData', {
  type: 'data:0',
  params: [
    {id: 'index', as: 'number', defaultValue: '%%'}
  ],
  impl: (ctx,index) => jb.val(jb.path(ctx.vars.cmp,'renderProps.items') || [])[index]
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
    {id: 'elementFilter', dynamic: 'true', defaultValue: true}
  ],
  impl: (ctx,diff,elementFilter) => {
    const {cmp} = ctx.vars
    const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
    const indeces = Array.from(parent.children).map((el,i) => [el,i])
      .filter(([el]) => elementFilter(ctx.setData(el))).map(([el,i]) => i)

    const selectedIndex = indeces.indexOf(+cmp.state.selected) + diff
    return indeces[Math.min(indeces.length-1,Math.max(0,selectedIndex))]
  }
})