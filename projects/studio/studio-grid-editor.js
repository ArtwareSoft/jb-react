jb.ns('gridEditor')

Object.assign(jb.ui,{
  getGridVals(el,axis) {
    const prop = `gridTemplate${axis}`
    const grid = jb.studio.previewWindow.getComputedStyle(el)[prop] || '' // <tt>78.2969px 74px 83px 120px 16px</tt>
    return grid.replace(/<\/?tt>/g,'').replace(/px /,' ').replace(/px/g,'').split(' ').map(x=>+(x.trim()))
  },
})

jb.component('inplaceEdit.openGridEditor', {
    params: [
        {id: 'path', as: 'string'}
    ],
    type: 'action',
    impl: runActions(
        Var('gridPath','%$path%'),
        Var('gridAccVals', obj()),
        gridEditor.openGridLineThumb('Columns'),
        gridEditor.openGridLineThumb('Rows'),
        gridEditor.openGridItemThumbs()
    )
})

jb.component('gridEditor.openGridLineThumb', {
  type: 'action',
  params: [
    {id: 'axis', as: 'string', options: 'Columns,Rows'}
  ],
  impl: runActionOnItems(
    Var('otherAxis', If('%$axis%==Rows', 'Columns', 'Rows')),
    Var('otherAxisSize', ({},{otherAxis,inplaceElem}) => jb.ui.getGridVals(inplaceElem, otherAxis).reduce((sum,x) => sum+x,0) ),
    Var('$launchingElement', null),

    (ctx,{inplaceElem},{axis}) => [0,...jb.ui.getGridVals(inplaceElem, axis)],
    openDialog({
      id: 'gridLineThumb',
      style: inplaceEdit.thumbStyle(),
      content: text(),
      features: [
        htmlAttribute('onclick',true),
        defHandler('onclickHandler', 
        menu.openContextMenu({
          menu: menu.menu({
            options: [
              menu.action({title: 'delete tab', icon: icon('delete')}),
              menu.action({title: 'new tab', icon: icon({icon: 'Plus', type: 'mdi'})})
            ]
          }),
        })),
        gridEditor.dragableGridLineThumb('%$axis%'),
        watchRef({ ref: studio.ref('%$gridPath%~layout'), includeChildren: 'yes', cssOnly: true}),
        css(
          (ctx,{$dialog,gridIndex,otherAxis,gridAccVals,inplaceElem},{axis}) => {
                Object.assign($dialog, {axis, gridIndex})
                Object.assign(gridAccVals,{
                  Rows: jb.ui.getGridVals(inplaceElem, 'Rows').reduce((sums,x) => [...sums,x + sums.slice(-1)[0]],[0]),
                  Columns: jb.ui.getGridVals(inplaceElem, 'Columns').reduce((sums,x) => [...sums,x + sums.slice(-1)[0]],[0])
                })
                const otherAxisSize = gridAccVals[otherAxis].slice(-1)[0]
                const elemRect = inplaceElem.getBoundingClientRect()
                const offset = jb.ui.getGridVals(inplaceElem, axis).slice(0,gridIndex).reduce((sum,x) => sum+x,0) 
                const left = (axis == 'Columns' ? offset + elemRect.left : elemRect.left) + 'px'
                const top = jb.ui.studioFixYPos() + (axis == 'Rows' ? elemRect.top + offset : elemRect.top) + 'px'
                const width = `width: ${axis == 'Rows' ? otherAxisSize : 0}px;`
                const height = `height: ${axis == 'Columns' ? otherAxisSize: 0}px;`
                return `left: ${left}; top: ${top}; ${width}${height}`
            }
        ),
        css(
          pipeline(
            Var('side', If('%$axis%==Rows', 'top', 'left')),
            Var('cursor', If('%$axis%==Rows', 'row', 'col')),
            '{border-%$side%: 5px dashed black; opacity: 0.1; cursor: %$cursor%-resize} ~:hover{opacity: 1}'
          )
        )
      ]
    }),
    undefined,
    'gridIndex'
  )
})

jb.component('gridEditor.dragableGridLineThumb', {
  type: 'feature',
  params: [
    {id: 'axis', as: 'string', options: 'Columns,Rows'},
  ],
  impl: interactive( (ctx,{cmp,gridIndex,inplaceElem,gridPath},{axis})=> {
    const {pipe,takeUntil,merge,Do, flatMap, map, subscribe,last} = jb.callbag
    cmp.mousedownEm = jb.ui.fromEvent(cmp, 'mousedown')
    let mouseUpEm = jb.ui.fromEvent(cmp, 'mouseup', document)
    let mouseMoveEm = jb.ui.fromEvent(cmp, 'mousemove', document)
    if (jb.studio.previewWindow) {
      mouseUpEm = merge(mouseUpEm, jb.ui.fromEvent(cmp, 'mouseup', jb.studio.previewWindow.document))
      mouseMoveEm = merge(mouseMoveEm, jb.ui.fromEvent(cmp, 'mousemove', jb.studio.previewWindow.document))
    }
    let startPos = 0, base = 0, accVals
    pipe(cmp.mousedownEm,
      Do(e => e.preventDefault()),
      Do(e => {
          startPos = HandlerPos(e)
          base = gridIndex ? jb.ui.getGridVals(inplaceElem, axis)[gridIndex-1] : 0
          accVals = jb.ui.getGridVals(inplaceElem, axis).slice(gridIndex).reduce((sums,x) => [...sums,x + sums.slice(-1)[0]],[0])
      }),
      flatMap(() => pipe(
        mouseMoveEm,
        takeUntil(mouseUpEm),
        map(e => base + moveHandlersAndCalcDiff(e)),
        Do(val => setGridPosScript(val, axis, gridIndex-1, ctx)),
        last(),
      )),
      subscribe(() => jb.ui.dialogs.closePopups())
    )
    function HandlerPos(e) {
        return axis == 'Rows' ? e.clientY - jb.ui.studioFixYPos() : e.clientX
    }
    function moveHandlersAndCalcDiff(e) {
        const newPos = HandlerPos(e)
        const overflow = base + newPos - startPos
        const fixBack = (overflow < 0) ? -overflow : 0
        console.log(base,startPos,newPos, newPos - startPos,overflow,fixBack)
        jb.ui.dialogs.dialogs.filter(dlg => dlg.axis == axis &&  dlg.gridIndex >= gridIndex -1)
            .forEach(dlg=>{
                if (axis == 'Rows')
                    dlg.el.style.top = e.clientY + fixBack + accVals[dlg.gridIndex-gridIndex] + 'px'
                else
                    dlg.el.style.left = e.clientX + fixBack + accVals[dlg.gridIndex-gridIndex] + 'px'
            })
        return newPos + fixBack - startPos
    }
    function setGridPosScript(val, axis, i, ctx) {
        const ref = jb.studio.refOfPath(`${gridPath}~layout~${axis.toLowerCase().slice(0,-1)}Sizes~items~${i}`)
        jb.writeValue(ref,val,ctx)
    }
  })
})

jb.component('gridEditor.openGridItemThumbs', {
  type: 'action',
  impl: runActionOnItems(
    Var('$launchingElement', null),
    (ctx,{inplaceElem}) => jb.ui.find(inplaceElem,'*'),
    openDialog({
      vars: Var('gridItemElem'),
      id: 'gridItemThumb',
      style: inplaceEdit.thumbStyle(),
      content: text(''),
      features: [
        gridEditor.dragableGridItemThumb(),
        feature.init((ctx,{$dialog,gridItemElem}) => {                 
            $dialog.gridItem = true
            $dialog.gridItemElem = gridItemElem
        }),
        css((ctx,{gridItemElem}) => {
              const elemRect = gridItemElem.getBoundingClientRect()
              const left = elemRect.left + 5 + 'px'
              const top = jb.ui.studioFixYPos() + elemRect.top + 5 + 'px'
              const width = `width: ${elemRect.width - 10}px;`
              const height = `height: ${elemRect.height - 10}px;`
              return `left: ${left}; top: ${top}; ${width}${height}`
        }),
        css('{cursor: grab; box-shadow: 3px 3px; background: grey; opacity: 0.2} ~:hover {opacity: 0.7}' ),
        feature.onDataChange({ ref: studio.ref('%$gridPath%'), includeChildren: 'yes', 
          action: (ctx,{cmp}) => jb.delay(300).then(()=> cmp.refresh()) 
        })
      ]
    })
  )
})

jb.component('gridEditor.dragableGridItemThumb', {
  type: 'feature',
  impl: interactive( (ctx,{cmp,gridItemElem,inplaceElem,gridAccVals})=> {
    const {pipe,takeUntil,merge,Do, flatMap, last, subscribe} = jb.callbag
    cmp.mousedownEm = jb.ui.fromEvent(cmp, 'mousedown')
    let mouseUpEm = jb.ui.fromEvent(cmp, 'mouseup', document)
    let mouseMoveEm = jb.ui.fromEvent(cmp, 'mousemove', document)
    if (jb.studio.previewWindow) {
      mouseUpEm = merge(mouseUpEm, jb.ui.fromEvent(cmp, 'mouseup', jb.studio.previewWindow.document))
      mouseMoveEm = merge(mouseMoveEm, jb.ui.fromEvent(cmp, 'mousemove', jb.studio.previewWindow.document))
    }
    const gridRect = inplaceElem.getBoundingClientRect()
    const elemRect = gridItemElem.getBoundingClientRect()
    let offsetX, offsetY, span, basePos
    pipe(cmp.mousedownEm,
      Do(e => e.preventDefault()),
      Do(e => {
          span = e.ctrlKey
          basePos = posToGridPos([e.clientX - gridRect.x, e.clientY - gridRect.y])
          offsetY = e.clientY - elemRect.top
          offsetX = e.clientX - elemRect.left
      }),
      flatMap(() => pipe(
        mouseMoveEm,
        takeUntil(mouseUpEm),
        Do(e => moveHandler(e)),
        Do(e => moveGridItem(e)),
        last(),
      )),
      subscribe(() => jb.ui.dialogs.closePopups())
    )

    function moveHandler(e) {
        if (span) {
            //TODO span..

        } else {
            cmp.base.style.top = (e.clientY - offsetY + jb.ui.studioFixYPos()) + 'px'
            cmp.base.style.left = (e.clientX - offsetX) + 'px'
        }
    }
    function moveGridItem(e) {
        const pos = [e.clientY - jb.ui.studioFixYPos() - gridRect.y, e.clientX - gridRect.x]
        const gridArea = posToGridPos(pos)
        setGridAreaValsInScript(gridArea)
    }
    function setGridAreaValsInScript(vals) {
        const gridItemPath = gridItemElem._component.ctx.path
        const gridAreaFeatureIndex = jb.studio.valOfPath(`${gridItemPath}~features`).findIndex(f=>f.$ == 'css.gridArea')
        const gridAreaRef = jb.studio.refOfPath(`${gridItemPath}~features~${gridAreaFeatureIndex}~css`)
        const scriptValues = jb.val(gridAreaRef).replace(/;?\s*}?\s*$/,'').replace(/^\s*{?\s*grid-area\s*:/,'').split('/') // grid-area: 1 / 2 / span 2 / span 3;
        if (!span && scriptValues.slice(0,2).map(x=>x.trim()).join(',') == vals.join(',')) return
        if (span)
            [0,1].forEach(axis =>scriptValues[2+axis] = ` span ${vals[axis] -basePos[axis]} `)
         else
            [0,1].forEach(i=>scriptValues[i] = ` ${vals[i]} `)
        jb.writeValue(gridAreaRef,`grid-area: ${scriptValues.join('/')}`,ctx)
    }
    function posToGridPos(pos) {
        return pos.map((val,i) => gridAccVals[i ? 'Columns' : 'Rows'].findIndex(x=>x>val))
    }
  })
})
