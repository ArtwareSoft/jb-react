Object.assign(jb.ui,{
  getGridVals(el,axis) {
    const prop = `gridTemplate${axis}`
    const grid = jb.studio.previewWindow.getComputedStyle(el)[prop] || '' // <tt>78.2969px 74px 83px 120px 16px</tt>
    return grid.replace(/<\/?tt>/g,'').replace(/px /,' ').replace(/px/g,'').split(' ').map(x=>+(x.trim()))
  }
})

jb.component('contentEditable.GridThumb', {
    type: 'control',
    params: [
      {id: 'axis', as: 'string', options: 'x,y'}
    ],
    impl: control.icon({
        icon: 'radio_button_unchecked',
        type: 'mdc',
        features: [contentEditable.dragableGridThumb('%$axis%'), css('font-size: 14px')]
      })
})
  
jb.component('contentEditable.openGridEditor', {
  type: 'action',
  params: [
    {id: 'axis', as: 'string', options: 'Columns,Rows'},
  ],
  impl: runActionOnItems({
    vars: [
        Var('otherAxis',If('%$axis%==Rows','Columns','Rows')),
        Var('otherAxisSize',({},{otherAxis}) => jb.ui.getGridVals(jb.ui.contentEditable.current, otherAxis).reduce((sum,x) => sum+x,0))
    ],
    indexVariable: 'gridIndex',
    items: (ctx,{},{axis}) => [0,...jb.ui.getGridVals(jb.ui.contentEditable.current, axis)],
    action: openDialog({
        style: contentEditable.positionThumbsStyle(),
        content: text({}),
        features: [ 
            contentEditable.dragableGridThumb('%$axis%'),
            css( ({},{gridIndex,otherAxisSize},{axis}) => {
                const el = jb.ui.contentEditable.current
                const elemRect = el.getBoundingClientRect()
                const offset = jb.ui.getGridVals(jb.ui.contentEditable.current, axis).slice(0,gridIndex).reduce((sum,x) => sum+x,0) 
                const left = (axis == 'Columns' ? offset + elemRect.left : elemRect.left) + 'px'
                const top = jb.ui.studioFixYPos() + (axis == 'Rows' ? elemRect.top + offset : elemRect.top) + 'px'
                const width = `width: ${axis == 'Rows' ? otherAxisSize : 0}px;`
                const height = `height: ${axis == 'Columns' ? otherAxisSize: 0}px;`
                return `left: ${left}; top: ${top}; ${width}${height}`
            }),
            css(pipeline(
                Var('side', If('%$axis%==Rows','top','left')),
                Var('cursor', If('%$axis%==Rows','row','col')),
                '{border-%$side%: 5px dashed black; opacity: 0.1; cursor: %$cursor%-resize} ~:hover{opacity: 1}'))
        ]
    })
    })
})

jb.component('contentEditable.dragableGridThumb', {
  type: 'feature',
  params: [
    {id: 'axis', as: 'string', options: 'Columns,Rows'},
  ],
  impl: interactive( (ctx,{cmp,gridIndex},{axis})=> {
    const el = jb.ui.contentEditable.current
    const prop = () => ctx.run(contentEditable.effectiveProp(axis))
    const {pipe,takeUntil,merge,Do, flatMap, map, subscribe,last} = jb.callbag
    cmp.mousedownEm = jb.ui.fromEvent(cmp, 'mousedown')
    let mouseUpEm = jb.ui.fromEvent(cmp, 'mouseup', document)
    let mouseMoveEm = jb.ui.fromEvent(cmp, 'mousemove', document)
    if (jb.studio.previewWindow) {
      mouseUpEm = merge(mouseUpEm, jb.ui.fromEvent(cmp, 'mouseup', jb.studio.previewWindow.document))
      mouseMoveEm = merge(mouseMoveEm, jb.ui.fromEvent(cmp, 'mousemove', jb.studio.previewWindow.document))
    }
    const dialog = ctx.vars.$dialog;
    const dialogStyle = dialog.cmp.base.style
    let startPos = 0, base = 0
    pipe(cmp.mousedownEm,
      Do(e => e.preventDefault()),
      Do(e => {
          startPos = HandlerPos(e)
          base = gridIndex ? jb.ui.getGridVals(el, axis)[gridIndex-1] : 0
      }),
      flatMap(() => pipe(
        mouseMoveEm,
        takeUntil(mouseUpEm),
        map(e => base + moveHandlerAndCalcDiff(e)),
//        Do(val => moveElem(val)),
//        Do(val => jb.ui.contentEditable.setGridPosScript(val, el, axis, gridIndex, ctx)),
        last(),
      )),
      subscribe(val => ctx.run(runActions(
            () => jb.ui.contentEditable.setGridPosScript(val, el, axis, gridIndex, ctx),
            jb.ui.dialogs.closePopups())))
    )

    function HandlerPos(e) {
        return axis == 'Rows' ? e.clientY - jb.ui.studioFixYPos() : e.clientX - 12
    }
    function moveHandlerAndCalcDiff(e) {
        const newPos = HandlerPos(e)
        console.log(startPos,newPos)
        if (axis == 'Rows')
            dialogStyle.top = (e.clientY - 12) + 'px'
        else
            dialogStyle.left = (e.clientX - 12) + 'px'
        return newPos - startPos
    }

    // function getVal() { 
    //     const vals = jb.ui.getGridVals(el, axis)
    //     return vals[gridIndex]
    // }
    // function moveElem(requested) {
    //   console.log(requested)
    //   const current = getVal()
    //   setVal(requested)
    //   if (getVal() != requested)
    //     setVal(current) // was not effective, so rollback
    // }
    // function setVal(val) {
    //     const prop = `gridTemplate${axis}`
    //     const vals = jb.ui.getGridVals(el, axis)
    //     vals.splice(gridIndex,1,val)
    //     el.style[prop] = vals.join('px ')
    // }
  }
  )
})
