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
    if (elem && elem.ownerDocument == jb.frame.document) return 0
    if (this._studioFixYPos == null)
      this._studioFixYPos = (document.querySelector('#jb-preview') && document.querySelector('#jb-preview').getBoundingClientRect().top) || 0
    return this._studioFixYPos
  }
})

jb.component('contentEditable.effectiveProp', {
  type: 'control',
  params: [
    {id: 'axis', as: 'string', options: 'x,y'}
  ],
  impl: firstSucceeding(
    '%$studio/dragPos/prop%',
    If('axis==\"x\"', 'paddingRight', 'paddingBottom')
  )
})

jb.component('contentEditable.actionIcon', {
  type: 'control',
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

jb.component('contentEditable.positionButton', {
  type: 'control',
  params: [
    {id: 'cssProp', as: 'string'},
    {id: 'axis', as: 'string', options: 'x,y'}
  ],
  impl: group({
    controls: [
      button({
        title: '',
        style: button.mdcIcon(contentEditable.actionIcon('%$cssProp%')),
        raised: equals(contentEditable.effectiveProp(), '%$cssProp%'),
        features: css(
          If(
            '%$axis%==y',
            'padding-top: 20px; padding-bottom: 20px; margin-top: -20px',
            'padding-left: 20px; padding-right: 20px; margin-left: -20px'
          )
        )
      })
    ],
    features: feature.onHover({
      action: runActions(
        contentEditable.writePosToScript(),
        writeValue('%$studio/dragPos/prop%', '%$cssProp%')
      )
    })
  })
})

jb.component('contentEditable.positionThumbs', {
  type: 'control',
  params: [
    {id: 'axis', as: 'string', options: 'x,y'}
  ],
  impl: group({
    layout: layout.flex({direction: If('%$axis%==y', 'column', 'row'), alignItems: 'center'}),
    controls: [
      group({
        layout: layout.flex({direction: If('%$axis%==y', 'column', 'row'), alignItems: 'center'}),
        controls: control.icon({
          icon: 'radio_button_unchecked',
          type: 'mdc',
          features: [contentEditable.dragableThumb('%$axis%'), css('font-size: 14px')]
        })
      }),
      group({
        layout: layout.grid({
          columnSizes: If('%$axis%==x', list('30', '40', '100'), list('168'))
        }),
        controls: [
          group({
            layout: layout.grid({
              columnSizes: If('%$axis%==y', list('24', '24', '24', '24', '24', '24', '24'), list('24')),
              rowGap: '10px'
            }),
            controls: [
              contentEditable.positionButton('margin%$sideEnd%', '%$axis%'),
              contentEditable.positionButton('padding%$sideEnd%', '%$axis%'),
              text(''),
              contentEditable.positionButton('%$sizer%', '%$axis%'),
              text(''),
              contentEditable.positionButton('padding%$sideStart%', '%$axis%'),
              contentEditable.positionButton('margin%$sideStart%', '%$axis%')
            ]
          }),
          text({
            text: pipeline(
              Var(
                  'inspectElemStyle',
                  ctx => getComputedStyle(jb.ui.contentEditable.current)
                ),
              Var('prop', contentEditable.effectiveProp('%$axis%')),
              '%$inspectElemStyle/{%$prop%}%',
              removeSuffix('px')
            ),
            features: css(If('%$axis%==x', 'align-self: center', 'padding-top: 5px'))
          }),
          text({
            text: contentEditable.effectiveProp('%$axis%'),
            features: css(If('%$axis%==x', 'align-self: center;', ''))
          })
        ],
        features: [
          css(
            If(
              '%$axis%==y',
              'margin-top: -10px; width: 168px;text-align: center',
              'height: 182px'
            )
          ),
          feature.if('%$studio/dragPos/{%$axis%}-active%'),
          watchRef({ref: '%$studio/dragPos%', includeChildren: 'yes'}),
          variable({name: 'sizer', value: If('%$axis%==x', 'width', 'height')}),
          variable({name: 'sideStart', value: If('%$axis%==x', 'Left', 'Top')}),
          variable({name: 'sideEnd', value: If('%$axis%==x', 'Right', 'Bottom')})
        ]
      })
    ]
  })
})

jb.component('contentEditable.openPositionThumbs', {
  type: 'action',
  params: [
    {id: 'axis', as: 'string', options: 'x,y'}
  ],
  impl: runActions(
    delay(100),
    openDialog({
        id: 'positionThumbs',
        style: contentEditable.positionThumbsStyle(),
        content: contentEditable.positionThumbs('%$axis%'),
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
          css(
            (ctx,{},{axis}) => {
            const el = jb.ui.contentEditable.current
            const elemRect = el.getBoundingClientRect()
            const iconOffset = [-3, -8]
            const left = (axis == 'x' ? elemRect.right + iconOffset[0] : elemRect.left) + 'px'
            const top = jb.ui.studioFixYPos() + (axis == 'y' ? elemRect.bottom + iconOffset[1] : elemRect.top) + 'px'
            const width = axis == 'y' ? `width: ${elemRect.width}px;` : ''
            const height = axis == 'x' ? `height: ${elemRect.height}px;` : ''
            return `left: ${left}; top: ${top}; ${width}${height}`
          }
          )
        ]
      })
  )
})

jb.component('contentEditable.writePosToScript', {
  type: 'action',
  impl: ctx => {
    const el = jb.ui.contentEditable.current
    const prop = ctx.exp('%$studio/dragPos/prop%')
    if (!prop) return
    const val = jb.ui.computeStyle(el,prop)
    jb.ui.contentEditable.setPositionScript(el, prop , val, ctx)
  }
})

jb.component('contentEditable.dragableThumb', {
  type: 'feature',
  params: [
    {id: 'axis', as: 'string', options: 'x,y'}
  ],
  impl: interactive(
    (ctx,{cmp},{axis})=> {
    const el = jb.ui.contentEditable.current
    const prop = () => ctx.run(contentEditable.effectiveProp(axis))
    const {pipe,fromEvent,takeUntil,merge,Do, flatMap, map, last, forEach,fromPromise} = jb.callbag
    const destroyed = fromPromise(cmp.destroyed)
    cmp.mousedownEm = jb.ui.fromEvent(cmp, 'mousedown')
    let mouseUpEm = jb.ui.fromEvent(cmp, 'mouseup', document)
    let mouseMoveEm = jb.ui.fromEvent(cmp, 'mousemove', document)
    if (jb.studio.previewWindow) {
      mouseUpEm = merge(mouseUpEm, jb.ui.fromEvent(cmp, 'mouseup', jb.studio.previewWindow.document))
      mouseMoveEm = merge(mouseMoveEm, jb.ui.fromEvent(cmp, 'mousemove', jb.studio.previewWindow.document))
    }
    const dialog = ctx.vars.$dialog;
    const dialogStyle = dialog.cmp.base.style
    pipe(cmp.mousedownEm,
      Do(e => e.preventDefault()),
      Do(() => ctx.run(writeValue('%$studio/dragPos/{%$axis%}-active%', true))),
      flatMap(() => pipe(
        mouseMoveEm,
        takeUntil(mouseUpEm),
        map(e => moveHandlerAndCalcNewPos(e)),
        Do(requested => moveElem(requested)),
        Do(val => ctx.run(writeValue('%$studio/dragPos/pos%', val))),
        last(),
        Do(() => ctx.run(runActions(
            writeValue('%$studio/dragPos/{%$axis%}-active%', false),
            contentEditable.writePosToScript(),
            jb.ui.dialogs.closePopups())
        ))
      )),
     forEach(() => {}) // TODO: try to take it out
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
  }
  )
})

jb.component('contentEditable.positionThumbsStyle', {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div#jb-dialog jb-popup',{},h(state.contentComp)),
    css: '{ display: block; position: absolute; background: white; }',
    features: [dialogFeature.maxZIndexOnClick(), dialogFeature.closeWhenClickingOutside()]
  })
})
