jb.ns('gridEditor')

Object.assign(jb.ui, {
  getGridVals(el,axis) {
    const prop = `gridTemplate${axis}`
    const grid = jb.studio.previewWindow.getComputedStyle(el)[prop] || '' // <tt>78.2969px 74px 83px 120px 16px</tt>
    return grid.replace(/<\/?tt>/g,'').replace(/px /,' ').replace(/px/g,'').split(' ').map(x=>+(x.trim()))
  },
  removeGridTab(gridPath,gridIndex,axis,ctx) {
    const ref = jb.studio.refOfPath(`${gridPath}~layout~${axis.toLowerCase().slice(0,-1)}Sizes~items`)
    jb.splice(ref,[[gridIndex,1]],ctx)
  },
  calcGridAccVals(inplaceElem) { return {
    Rows: jb.ui.getGridVals(inplaceElem, 'Rows').reduce((sums,x) => [...sums,x + sums.slice(-1)[0]],[0]),
    Columns: jb.ui.getGridVals(inplaceElem, 'Columns').reduce((sums,x) => [...sums,x + sums.slice(-1)[0]],[0])
  }}
})

jb.component('inplaceEdit.openGridEditor', {
    params: [
        {id: 'path', as: 'string'}
    ],
    type: 'action',
    impl: runActions(
        Var('gridPath','%$path%'),
        gridEditor.openGridLineThumb('Columns'),
        gridEditor.openGridLineThumb('Rows'),
        gridEditor.openGridItemThumbs(),
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
    Var('$launchingElement', () => null),

    (ctx,{inplaceElem},{axis}) => [0,...jb.ui.getGridVals(inplaceElem, axis)],
    openDialog({
      id: 'gridLineThumb',
      style: inplaceEdit.thumbStyle(),
      content: text(),
      features: [
        htmlAttribute('onclick',true),
        defHandler('onclickHandler', 
          If('%$ev/ctrlKey%',
          menu.openContextMenu({
            menu: menu.menu({
              options: [
                menu.action({
                  title: 'delete tab', 
                  icon: icon('delete'),
                  action: runActions(
                    (ctx,{gridIndex,gridPath},{axis}) => jb.ui.removeGridTab(gridPath,gridIndex,axis,ctx),
                    delay(100),
                    inplaceEdit.openGridEditor('%$gridPath%'))
                }),
                menu.action({
                  title: 'new tab', 
                  icon: icon({icon: 'Plus', type: 'mdi'}),
                  action: runActions(
                    (ctx,{gridIndex,gridPath},{axis}) => jb.ui.addGridTab(gridPath,gridIndex,axis,ctx),
                    inplaceEdit.openGridEditor('%$gridPath%'))
                })
              ]
            }),
          }))),
        gridEditor.dragableGridLineThumb('%$axis%'),
        watchRef({ ref: studio.ref('%$gridPath%~layout'), includeChildren: 'yes', cssOnly: true}),
        css(
          (ctx,{$dialog,gridIndex,otherAxis,inplaceElem},{axis}) => {
                Object.assign($dialog, {axis, gridIndex})
                const gridAccVals = jb.ui.calcGridAccVals(inplaceElem)
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
      )),
      subscribe(() => {})
    )
    function HandlerPos(e) {
        return axis == 'Rows' ? e.clientY - jb.ui.studioFixYPos() : e.clientX
    }
    function moveHandlersAndCalcDiff(e) {
        const newPos = HandlerPos(e)
        const overflow = base + newPos - startPos
        const fixBack = (overflow < 0) ? -overflow : 0
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
      content: text('Ctrl to span'),
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
            const res = `left: ${left}; top: ${top}; ${width}${height}`
            return res
        }),
        css('{cursor: grab; box-shadow: 3px 3px; background: grey; opacity: 0.2; display: flex; flex-flow: row-reverse} ~:hover {opacity: 0.7}' ),
        feature.onDataChange({ ref: studio.ref('%$gridPath%'), includeChildren: 'yes', 
          action: (ctx,{cmp}) => jb.delay(1).then(()=> cmp.refresh(null,{srcCtx: ctx.componentContext})) 
        })
      ]
    })
  )
})

jb.component('gridEditor.dragableGridItemThumb', {
  type: 'feature',
  impl: interactive( (ctx,{cmp,gridItemElem,inplaceElem})=> {
    const {pipe,takeUntil,merge,Do, flatMap, last, subscribe, map, distinctUntilChanged} = jb.callbag
    cmp.mousedownEm = jb.ui.fromEvent(cmp, 'mousedown')
    let mouseUpEm = jb.ui.fromEvent(cmp, 'mouseup', document)
    let mouseMoveEm = jb.ui.fromEvent(cmp, 'mousemove', document)
    if (jb.studio.previewWindow) {
      mouseUpEm = merge(mouseUpEm, jb.ui.fromEvent(cmp, 'mouseup', jb.studio.previewWindow.document))
      mouseMoveEm = merge(mouseMoveEm, jb.ui.fromEvent(cmp, 'mousemove', jb.studio.previewWindow.document))
    }
    let spanBase,screenToClient
    const gridRect = inplaceElem.getBoundingClientRect()
    pipe(cmp.mousedownEm,
      Do(e => e.preventDefault()),
      flatMap(() => pipe(
        mouseMoveEm,
        // strange bug in chrome mouse position of clientY. Using screenY with offset of first click that works fine
        Do(e=> { screenToClient = screenToClient || { x: e.screenX - e.clientX, y: e.screenY - e.clientY} }),
        Do(e=> console.log(e,e.ctrlKey)),
        map(e=> ({ ctrlKey: e.ctrlKey, gridPos: posToGridPos([e.screenY - screenToClient.y - gridRect.top - jb.ui.studioFixYPos(),
            e.screenX - screenToClient.x - gridRect.left])})),
        distinctUntilChanged((x,y) => x.gridPos.join(',') == y.gridPos.join(',')),
        Do(e=> {
          if (spanBase && !e.ctrlKey) spanBase = null
          if (!spanBase && e.ctrlKey) spanBase = e.ctrlKey && !spanBase && posToGridPos([e.screenY - screenToClient.y - gridRect.top - jb.ui.studioFixYPos(),
            e.screenX - screenToClient.x - gridRect.left])
        }),
        Do(e=>jb.log('dragableGridItemThumb',['changed to ' + e.gridPos.join(','), e])),
        Do(e => setGridAreaValsInScript(e.gridPos)),
        takeUntil(mouseUpEm),
      )),
      subscribe(() => {})
    )

    function setGridAreaValsInScript(vals) {
      console.log('changed to ' + vals, spanBase)
      const gridItemPath = gridItemElem._component.ctx.path
      const gridAreaFeatureIndex = jb.studio.valOfPath(`${gridItemPath}~features`).findIndex(f=>f.$ == 'css.gridArea')
      const gridAreaRef = jb.studio.refOfPath(`${gridItemPath}~features~${gridAreaFeatureIndex}~css`)
      spanBase && [0,1].forEach(i=>{
          spanBase[i] = Math.min(spanBase[i],vals[i])
          vals[i] = Math.max(spanBase[i],vals[i])
        })
      const spans = spanBase && [0,1].map(i => `span ${Math.max(1,vals[i] -spanBase[i] + 1)}`)
      const newScriptValues = spanBase ? [...spanBase, ...spans] : vals
      jb.writeValue(gridAreaRef,`grid-area: ${newScriptValues.join(' / ')}`,ctx)
    }
    function posToGridPos(pos) {
      const gridAccVals = jb.ui.calcGridAccVals(inplaceElem)
      return pos.map((val,i) => gridAccVals[i ? 'Columns' : 'Rows'].findIndex(x=> x > val))
        .map((val,i) => val == -1 ? gridAccVals[i ? 'Columns' : 'Rows'].length : val)
    }
  })
})
