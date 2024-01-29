
component('itemlist.selection', {
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
    css(({},{},{cssForSelected}) => ['>.selected','>*>.selected','>*>*>.selected'].map(sel=>sel+ ' ' + jb.ui.fixCssLine(cssForSelected)).join('\n')),
    userStateProp({
      id: 'selected',
      value: (ctx,{$props,$state},{databind, autoSelectFirst, databindToSelected}) => {
        const currentVal = $state.selected != null && jb.path(jb.ui.cmps[$state.selected],'ctx.data')
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
    method('onSelection', runActionOnItem(itemlist.indexToData(), runActions(
      log('itemlist onSelection'),
      If(isRef('%$databind()%'), writeValue('%$databind()%', '%$selectedToDatabind()%')),
      call('onSelection')
    ))),
    method('onDoubleClick', runActionOnItem(itemlist.indexToData(), runActions(
      If(isRef('%$databind()%'), writeValue('%$databind()%', '%$selectedToDatabind()%')),
      call('onDoubleClick')
    ))),
    followUp.flow(
      source.data('%$$props/selected%'),
      rx.filter(and('%$autoSelectFirst%', not('%$$state/refresh%'))),
      sink.BEMethod('onSelection')
    ),
    frontEnd.method('applyState', ({},{cmp}) => {
      Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
        .forEach(elem=>jb.ui.removeClass(elem,'selected'))
      const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
      const elem = parent.children[cmp.state.selected]
      if (elem) {
        jb.ui.addClass(elem,'selected')
        jb.ui.scrollIntoView(elem)
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
      source.merge(
        rx.pipe(source.frontEndEvent('click'), rx.map(itemlist.indexOfElem('%target%')), rx.filter('%%')),
        source.subject('%$cmp/selectionEmitter%')
      ),
      rx.distinctUntilChanged(),
      sink.action(runActions(action.runFEMethod('setSelected'), action.runBEMethod('onSelection')))
    )
  )
})

component('itemlist.keyboardSelection', {
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
    frontEnd.prop('onkeydown', source.merge(source.frontEndEvent('keydown'), source.findSelectionKeySource())),
    frontEnd.flow(
      '%$cmp.onkeydown%',
      rx.log('test onkeydown keyboardSelection'),
      rx.filter('%keyCode%==13'),
      rx.filter(notNull('%$cmp.state.selected%')),
      sink.BEMethod('onEnter', '%$cmp.state.selected%')
    ),
    frontEnd.flow(
      '%$cmp.onkeydown%',
      rx.filter(not('%ctrlKey%')),
      rx.filter(inGroup(list(38,40), '%keyCode%')),
      rx.map(itemlist.nextSelected(If('%keyCode%==40', 1, -1))),
      rx.log('itemlist frontend nextSelected'),
      sink.subjectNext('%$cmp/selectionEmitter%')
    ),
    frontEnd.var('autoFocus', '%$autoFocus%'),
    frontEnd.init(
      If(and('%$autoFocus%','%$selectionKeySourceCmpId%'), action.focusOnCmp('itemlist autofocus'))
    )
  )
})

component('itemlist.indexOfElem', {
  type: 'data:0',
  description: 'also supports multiple elements',
  params: [
    {id: 'elem', defaultValue: '%%'}
  ],
  impl: (ctx,el) => {
      const elemOfItem = jb.ui.closest(el,'.jb-item')
      const index = elemOfItem && jb.ui.indexOfElement(elemOfItem)
      jb.log('itemlist selection index of elem', {el,elemOfItem,ctx})
      return index
  }
})

component('itemlist.indexToData', {
  type: 'data:0',
  params: [
    {id: 'index', as: 'number', defaultValue: '%%'}
  ],
  impl: (ctx,index) => jb.val(jb.path(ctx.vars.cmp,'renderProps.items') || [])[index]
})

component('itemlist.findSelectionSource', {
  type: 'data:0',
  impl: ctx => {
    const {cmp,itemlistCntr} = ctx.vars
    const srcCtxId = itemlistCntr && itemlistCntr.selectionKeySourceCmp
    return [jb.ui.parentCmps(cmp.base).find(_cmp=>_cmp.selectionKeySource), document.querySelector(`[ctxId="${srcCtxId}"]`)]
      .map(el => el && el._component && el._component.selectionKeySource).filter(x=>x)[0]
  }
})

component('itemlist.nextSelected', {
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