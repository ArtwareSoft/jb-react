Object.assign(jb.ui,{
  computeStyle(el,prop) { return +(getComputedStyle(el)[prop].split('px')[0] || 0)},
  splitCssProp(cssProp) {
    const sideIndex = Array.from(cssProp).findIndex(x=>x.toUpperCase() == x)
    return { prop: cssProp.slice(0,sideIndex), sideUpper: cssProp.slice(sideIndex),
      side: cssProp.slice(sideIndex)[0].toLowerCase() + cssProp.slice(sideIndex+1) }
  },
  computeBasePos(el, cssProp, axis) {
    const elemRect = el.getBoundingClientRect()
    const endPos = elemRect[axis == 'x' ? 'right' : 'bottom']
    const otherSidePos = elemRect[axis == 'x' ? 'left' : 'top']
    if (cssProp == 'height' || cssProp == 'width')
      return otherSidePos
    const {prop,sideUpper,side} = jb.ui.splitCssProp(cssProp)
    const otherSideUpper = side == 'bottom' ? 'Top': 'Bottom'
    const basePos = prop == 'margin' ? endPos
        : prop == 'padding' ?  endPos - jb.ui.computeStyle(el,'padding'+sideUpper)
        : otherSidePos + jb.ui.computeStyle(el,'padding'+otherSideUpper)
    return basePos
  },
  studioFixYPos(elem) {
    const studioDoc = jb.path(jb,'studio.previewjb.studio.studioWindow.document')
    if (elem && elem.ownerDocument == studioDoc || !jb.path(studioDoc,'body')) return 0
    const zoom = +studioDoc.body.style.zoom || 1
    this._studioFixYPos = ((studioDoc.querySelector('#jb-preview') && studioDoc.querySelector('#jb-preview').getBoundingClientRect().top) || 0)/zoom
    return this._studioFixYPos
  },
  studioFixXPos(elem) {
    const studioDoc = jb.path(jb,'studio.previewjb.studio.studioWindow.document')
    if (elem && elem.ownerDocument == studioDoc || !jb.path(studioDoc,'body')) return 0
    this._studioFixXPos = (studioDoc.querySelector('#jb-preview') && studioDoc.querySelector('#jb-preview').getBoundingClientRect().left) || 0
    return this._studioFixXPos
  }
})

component('contentEditable.effectiveProp', {
  params: [
    {id: 'axis', as: 'string', options: 'x,y'}
  ],
  impl: firstSucceeding('%$studio/dragPos/prop%', If('axis=="x"', 'paddingRight', 'paddingBottom'))
})

component('contentEditable.actionIcon', {
  type: 'icon',
  params: [
    {id: 'cssProp', as: 'string'}
  ],
  impl: (ctx,cssProp) => cssProp == 'marginBottom' ? 'border_bottom'
    : cssProp == 'paddingBottom' || cssProp == 'paddingTop' ? 'border_horizontal'
    : cssProp == 'marginTop' ? 'border_top'
    : cssProp == 'marginRight' ? 'border_right'
    : cssProp == 'paddingRight' || cssProp == 'paddingLeft' ? 'border_vertical'
    : cssProp == 'marginLeft' ? 'border_left'
    : cssProp == 'width' || cssProp == 'height' ? 'border_clear'
    : ''
})

component('contentEditable.positionButton', {
  type: 'control',
  params: [
    {id: 'cssProp', as: 'string'},
    {id: 'axis', as: 'string', options: 'x,y'}
  ],
  impl: group({
    controls: [
      button('', {
        style: button.mdcIcon(contentEditable.actionIcon('%$cssProp%')),
        raised: equals(contentEditable.effectiveProp(), '%$cssProp%'),
        features: css(
          If({
            condition: '%$axis%==y',
            then: 'padding-top: 20px; padding-bottom: 20px; margin-top: -20px',
            Else: 'padding-left: 20px; padding-right: 20px; margin-left: -20px'
          })
        )
      })
    ],
    features: feature.onHover(runActions(contentEditable.writePosToScript(), writeValue('%$studio/dragPos/prop%', '%$cssProp%')))
  })
})

component('contentEditable.positionThumbs', {
  type: 'control',
  params: [
    {id: 'axis', as: 'string', options: 'x,y'}
  ],
  impl: group({
    controls: [
      group({
        controls: control.icon('radio_button_unchecked', {
          type: 'mdc',
          features: [
            contentEditable.dragableThumb('%$axis%'),
            css('font-size: 14px')
          ]
        }),
        layout: layout.flex(If('%$axis%==y', 'column', 'row'), { alignItems: 'center' })
      }),
      group({
        controls: [
          group({
            controls: [
              contentEditable.positionButton('margin%$sideEnd%', '%$axis%'),
              contentEditable.positionButton('padding%$sideEnd%', '%$axis%'),
              text(''),
              contentEditable.positionButton('%$sizer%', '%$axis%'),
              text(''),
              contentEditable.positionButton('padding%$sideStart%', '%$axis%'),
              contentEditable.positionButton('margin%$sideStart%', '%$axis%')
            ],
            layout: layout.grid(If('%$axis%==y', list('24','24','24','24','24','24','24'), list('24')), { rowGap: '10px' })
          }),
          text({
            text: pipeline(
              Var('inspectElemStyle', ctx => getComputedStyle(jb.ui.contentEditable.current)),
              Var('prop', contentEditable.effectiveProp('%$axis%')),
              '%$inspectElemStyle/{%$prop%}%',
              removeSuffix('px')
            ),
            features: css(If('%$axis%==x', 'align-self: center', 'padding-top: 5px'))
          }),
          text(contentEditable.effectiveProp('%$axis%'), {
            features: css(If('%$axis%==x', 'align-self: center;', ''))
          })
        ],
        layout: layout.grid(If('%$axis%==x', list('30','40','100'), list('168'))),
        features: [
          css(If('%$axis%==y', 'margin-top: -10px; width: 168px;text-align: center', 'height: 182px')),
          feature.if('%$studio/dragPos/{%$axis%}-active%'),
          watchRef('%$studio/dragPos%', 'yes'),
          variable('sizer', If('%$axis%==x', 'width', 'height')),
          variable('sideStart', If('%$axis%==x', 'Left', 'Top')),
          variable('sideEnd', If('%$axis%==x', 'Right', 'Bottom'))
        ]
      })
    ],
    layout: layout.flex(If('%$axis%==y', 'column', 'row'), { alignItems: 'center' })
  })
})

component('contentEditable.openPositionThumbs', {
  type: 'action',
  params: [
    {id: 'axis', as: 'string', options: 'x,y'}
  ],
  impl: runActions(
    delay(100),
    openDialog({
      content: contentEditable.positionThumbs('%$axis%'),
      style: contentEditable.positionThumbsStyle(),
      id: 'positionThumbs',
      features: [
        watchRef('%$studio/dragPos/prop%'),
        css(
          `~ button>i {font-size: 24px }
            ~ button.raised>i { border-bottom: 2px solid #6200ee; }
            {display: flex; align-items: center;}
          `
        ),
        css(If('%$axis%==y', '{flex-direction: column}')),
        css(If('%$axis%==y', '~ i {cursor: row-resize}', '~ i {cursor: col-resize}')),
        css((ctx,{},{axis}) => {
            const el = jb.ui.contentEditable.current
            const elemRect = el.getBoundingClientRect()
            const iconOffset = [-3, -8]
            const left = (axis == 'x' ? elemRect.right + iconOffset[0] : elemRect.left) + 'px'
            const top = jb.ui.studioFixYPos() + (axis == 'y' ? elemRect.bottom + iconOffset[1] : elemRect.top) + 'px'
            const width = axis == 'y' ? `width: ${elemRect.width}px;` : ''
            const height = axis == 'x' ? `height: ${elemRect.height}px;` : ''
            return `left: ${left}; top: ${top}; ${width}${height}`
          })
      ]
    })
  )
})

component('contentEditable.writePosToScript', {
  type: 'action',
  impl: ctx => {
    const el = jb.ui.contentEditable.current
    const prop = ctx.exp('%$studio/dragPos/prop%')
    if (!prop) return
    const val = jb.ui.computeStyle(el,prop)
    jb.ui.contentEditable.setPositionScript(el, prop , val, ctx)
  }
})

component('contentEditable.dragableThumb', {
  type: 'feature',
  params: [
    {id: 'axis', as: 'string', options: 'x,y'}
  ],
  impl: frontEnd.init((ctx,{cmp},{axis})=> {
    const el = jb.ui.contentEditable.current
    const prop = () => ctx.run(contentEditable.effectiveProp(axis))
    const {pipe,takeUntil,merge,Do, flatMap, map, last, forEach} = jb.callbag
    cmp.mousedownEm = jb.ui.fromEvent(cmp, 'mousedown')
    let mouseUpEm = jb.ui.fromEvent(cmp, 'mouseup', document)
    let mouseMoveEm = jb.ui.fromEvent(cmp, 'mousemove', document)
    if (jb.studio.previewWindow()) {
      mouseUpEm = merge(mouseUpEm, jb.ui.fromEvent(cmp, 'mouseup', jb.studio.previewWindow().document))
      mouseMoveEm = merge(mouseMoveEm, jb.ui.fromEvent(cmp, 'mousemove', jb.studio.previewWindow().document))
    }
    const dialog = ctx.vars.$dialog;
    const dialogStyle = dialog.cmp.base.style
    pipe(cmp.mousedownEm,
      Do(writeValue('%$studio/dragPos/{%$axis%}-active%', true)),
      flatMap(() => pipe(
        mouseMoveEm,
        takeUntil(mouseUpEm),
        map(e => moveHandlerAndCalcNewPos(e)),
        Do(requested => moveElem(requested)),
        Do(writeValue('%$studio/dragPos/pos%', '%%')),
        last(),
        Do(runActions(
            writeValue('%$studio/dragPos/{%$axis%}-active%', false),
            contentEditable.writePosToScript(),
            dialog.closeAllPopups()
        ))
      )),
     forEach(() => {})
    )

    function getVal() { return jb.ui.computeStyle(el,prop()) }
    function setVal(val) { el.style[prop()] = val + 'px'; }
    function moveHandlerAndCalcNewPos(e) {
      if (axis == 'y') {
        dialogStyle.top = (e.clientY - 12) + 'px'
        return Math.max(0,e.clientY - jb.ui.studioFixYPos() - jb.ui.computeBasePos(el,prop(),axis) )
      } else {
        dialogStyle.left = (e.clientX - 12) + 'px'
        return Math.max(0,e.clientX - jb.ui.computeBasePos(el,prop(),axis) )
      }
    }

    function moveElem(requested) {
      const current = getVal()
      setVal(requested)
      if (getVal() != requested)
        setVal(current) // was not effective, so rollback
    }
  })
})

component('contentEditable.positionThumbsStyle', {
  type: 'dialog-style',
  impl: customStyle({
    template: (cmp,state,h) => h('div.jb-dialog jb-popup',{},h(state.contentComp)),
    css: '{ display: block; position: absolute; background: var(--jb-dropdown-bg); }',
    features: [maxZIndexOnClick(), closeWhenClickingOutside()]
  })
})
