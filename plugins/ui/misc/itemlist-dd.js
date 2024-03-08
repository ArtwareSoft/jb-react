// var { move } = jb.macro

component('itemlist.dragAndDrop', {
  type: 'feature',
  impl: features(
    frontEnd.requireExternalLibrary('dragula.js','css/dragula.css'),
    method('moveItem', runActions(move(itemlist.indexToData('%from%'), itemlist.indexToData('%to%')), action.refreshCmp())),
    frontEnd.prop('drake', ({},{cmp,uiTest}) => {
        if (uiTest) return { on: () => {}}
        if (!jb.frame.dragula) return jb.logError('itemlist.dragAndDrop - the dragula lib is not loaded')
        return dragula([cmp.base.querySelector('.jb-items-parent') || cmp.base] , {
          moves: (el,source,handle) => jb.ui.parents(handle,{includeSelf: true}).some(x=>jb.ui.hasClass(x,'drag-handle'))
        })
    }),
    frontEnd.flow(
      source.dragulaEvent('drag', { argNames: list('el') }),
      rx.map(itemlist.indexOfElem('%el%')),
      rx.do(({},{cmp}) => 
        Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item')).forEach(el=>el.setAttribute('jb-original-index',jb.ui.indexOfElement(el)))),
      sink.subjectNext('%$cmp/selectionEmitter%')
    ),
    frontEnd.flow(
      source.dragulaEvent('drop', { argNames: list('dropElm','target','source','sibling') }),
      rx.map(
        obj(
          prop('from', itemlist.indexOfElem('%dropElm%')),
          prop('to', itemlist.orignialIndexFromSibling('%sibling%'))
        )
      ),
      sink.BEMethod('moveItem')
    ),
    frontEnd.flow(
      source.frontEndEvent('keydown'),
      rx.filter('%ctrlKey%'),
      rx.filter(inGroup(list(38,40), '%keyCode%')),
      rx.map(
        obj(
          prop('from', itemlist.nextSelected(0)),
          prop('to', itemlist.nextSelected(If('%keyCode%==40', 1, -1)))
        )
      ),
      sink.BEMethod('moveItem')
    )
  )
})

component('source.dragulaEvent', {
  type: 'rx',
  hidden: true,
  params: [
    {id: 'event', as: 'string'},
    {id: 'argNames', as: 'array', description: `e.g., ['dropElm', 'target', 'source']`}
  ],
  impl: source.callbag(({},{cmp},{event,argNames}) =>
    jb.callbag.create(obs=> cmp.drake.on(event, (...args) => obs(jb.objFromEntries(args.map((v,i) => [argNames[i],v]))))))
})

component('itemlist.orignialIndexFromSibling', {
  type: 'data',
  hidden: true,
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

component('itemlist.dragHandle', {
  description: 'put on the control inside the item which is used to drag the whole line',
  type: 'feature',
  impl: features(css.class('drag-handle'), css('{cursor: pointer}'))
})
