jb.ns('gridEditor')

Object.assign(jb.ui, {
  getGridVals(el,axis) {
    const prop = `gridTemplate${axis}`
    const grid = jb.studio.previewWindow.getComputedStyle(el)[prop] || '' // <tt>78.2969px 74px 83px 120px 16px</tt>
    return grid.replace(/<\/?tt>/g,'').replace(/px /,' ').replace(/px/g,'').split(' ').map(x=>+(x.trim()))
  },
  calcGridAccVals(inplaceElem) { return {
    Rows: jb.ui.getGridVals(inplaceElem, 'Rows').reduce((sums,x) => [...sums,x + sums.slice(-1)[0]],[0]),
    Columns: jb.ui.getGridVals(inplaceElem, 'Columns').reduce((sums,x) => [...sums,x + sums.slice(-1)[0]],[0])
  }},
  canRemoveGridTab(gridPath,gridIndex,axis,ctx) {
    const ref = jb.ui.getOrCreateSizesRef(gridPath,axis,ctx)
    return gridIndex > 0 && gridIndex < jb.val(ref).length
  },
  removeGridTab(gridPath,gridIndex,axis,ctx) {
    const ref = jb.ui.getOrCreateSizesRef(gridPath,axis,ctx)
    const arr = jb.val(ref)
    const together = Number(arr[gridIndex-1]) + Number(arr[gridIndex])
    jb.splice(ref,[[gridIndex-1,2,together]],ctx)
  },
  addGridTab(gridPath,gridIndex,axis,ctx) {
    const ref = jb.ui.getOrCreateSizesRef(gridPath,axis,ctx)
    if (jb.val(ref).length == gridIndex) {
      jb.push(ref,100,ctx)
    } else {
      const half = Number(jb.val(ref)[gridIndex])/2
      jb.splice(ref,[[gridIndex,1,half,half]],ctx)
    }
  },
  getOrCreateSizesRef(gridPath,axis,ctx) {
    const sizesProp = `${axis.toLowerCase().slice(0,-1)}Sizes`
    if (!jb.studio.valOfPath(`${gridPath}~layout~${sizesProp}`))
      ctx.run(writeValue(studio.ref(`${gridPath}~layout~${sizesProp}`), { [sizesProp]: list(100) }))
    return jb.studio.refOfPath(`${gridPath}~layout~${sizesProp}~items`)
  },
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

jb.component('gridEditor.addRemoveTabPopup', {
  type: 'feature',
  params: [
    {id: 'axis', as: 'string', options: 'Columns,Rows'}
  ],
  impl: features(
    htmlAttribute('onclick', true),
    defHandler(
      'onclickHandler',
      runActions(
        dialog.closeDialog('add-remove-tab'),
        If('%$ev/ctrlKey%', menu.openContextMenu({
          id: 'add-remove-tab',
          menu: menu.menu({
            options: [
              menu.action({
                title: 'remove tab',
                action: runActions(
                  (ctx,{gridIndex,gridPath},{axis}) => jb.ui.removeGridTab(gridPath,gridIndex,axis,ctx),
                  dialog.closeContainingPopup(),
                  dialog.closeDialog('gridLineThumb'),
                  delay(100),
                  inplaceEdit.openGridEditor('%$gridPath%')
                ),
                icon: icon('delete'),
                showCondition: (ctx,{gridIndex,gridPath},{axis}) => jb.ui.canRemoveGridTab(gridPath,gridIndex,axis,ctx)
              }),
              menu.action({
                title: 'new tab',
                action: runActions(
                  (ctx,{gridIndex,gridPath},{axis}) => jb.ui.addGridTab(gridPath,gridIndex,axis,ctx),
                  dialog.closeContainingPopup(),
                  dialog.closeDialog('gridLineThumb'),
                  delay(100),
                  inplaceEdit.openGridEditor('%$gridPath%')
                ),
                icon: icon({icon: 'add', type: 'mdc'})
              })
            ]
          }),
          popupStyle: dialog.transparentPopup(),
          menuStyle: menuStyle.toolbar()
        })
    ))))
})

jb.component('gridEditor.openGridLineThumb', {
  type: 'action',
  params: [
    {id: 'axis', as: 'string', options: 'Columns,Rows'}
  ],
  impl: runActionOnItems(
    Var('otherAxis', If('%$axis%==Rows', 'Columns', 'Rows')),
    Var(
        'otherAxisSize',
        ({},{otherAxis,inplaceElem}) => jb.ui.getGridVals(inplaceElem, otherAxis).reduce((sum,x) => sum+x,0)
      ),
    Var('$launchingElement', () => null),
    (ctx,{inplaceElem},{axis}) => [0,...jb.ui.getGridVals(inplaceElem, axis)],
    openDialog({
      id: 'gridLineThumb',
      style: inplaceEdit.thumbStyle(),
      content: text('Ctrl+click to add/remove'),
      features: [
        gridEditor.addRemoveTabPopup('%$axis%'),
        gridEditor.dragableGridLineThumb('%$axis%'),
        watchRef({
          ref: studio.ref('%$gridPath%~layout'),
          includeChildren: 'yes',
          cssOnly: true
        }),
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
          '>span { display: none; width: 150px; white-space: nowrap; padding: 7px; color: white; background: gray;}'
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
        Do(() => cmp.base.querySelector('span').style.display = 'block'),
        takeUntil(mouseUpEm),
        map(e => base + moveHandlersAndCalcDiff(e)),
        Do(val => setGridPosScript(val, axis, gridIndex-1, ctx)),
        last()
      )),
      Do(() => cmp.base.querySelector('span').style.display = 'none'),
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

        css((ctx,{gridItemElem}) => {
          const elemRect = gridItemElem.getBoundingClientRect()
          return `>span { display: none; color: white; position: absolute; white-space: nowrap; padding: 7px; background: gray; opacity: 1; top: ${elemRect.height- 7 }px}`
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
    const {pipe,takeUntil,merge,Do, flatMap, subscribe, map, last, distinctUntilChanged} = jb.callbag
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
        takeUntil(mouseUpEm),
        Do(() => cmp.base.querySelector('span').style.display = 'block'),
        // strange bug in chrome mouse position of clientY. Using screenY with offset of first click that works fine
        Do(e=> { screenToClient = screenToClient || { x: e.screenX - e.clientX, y: e.screenY - e.clientY} }),
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
        last(),
      )),
      Do(() => cmp.base.querySelector('span').style.display = 'none'),
      subscribe(() => {})
    )

    function setGridAreaValsInScript(vals) {
      const gridAreaRef = ctx.run(pipeline(
        studio.getOrCreateCompInArray('%$gridItemElem/_component/ctx/path%~features','css.gridArea'), 
        '%css%', 
        studio.ref('%%')))     //{as: 'ref'})
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
