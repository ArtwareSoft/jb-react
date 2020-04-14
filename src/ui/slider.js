jb.ns('slider,mdcStyle')

jb.component('editableNumber.sliderNoText', {
  type: 'editable-number.style',
  impl: features(
    ctx => ({
      template: (cmp,{min,max,step,databind},h) => h('input',{ type: 'range',
        min, max, step, value: cmp.ctx.vars.editableNumber.numericPart(databind), mouseup: 'onblurHandler', tabindex: -1})
    }),
    field.databind(),
    slider.checkAutoScale(),
    slider.initJbModelWithUnits(),
    slider.init(),
  )
})

jb.component('editableNumber.slider', {
  type: 'editable-number.style',
  impl: styleByControl(
    group({
      title: '%$editableNumberModel/title%',
      controls: group({
        layout: layout.horizontal(20),
        controls: [
          editableText({
            databind: '%$editableNumberModel/databind%',
            style: editableText.input(),
            features: [
              slider.handleArrowKeys(),
              css(
                'width: 30px; padding-left: 3px; border: 0; border-bottom: 1px solid black;'
              ),
              css.class('text-input')
            ]
          }),
          editableNumber({
            databind: '%$editableNumberModel/databind%',
            style: editableNumber.sliderNoText(),
            max: '%$editableNumberModel/max%',
            min: '%$editableNumberModel/min%',
            step: '%$editableNumberModel/step%',            
            features: [css.width(80), css.class('slider-input')]
          })
        ],
        features: [
          variable({name: 'sliderCtx', value: {'$': 'object'}}),
          watchRef('%$editableNumberModel/databind%')
        ]
      })
    }),
    'editableNumberModel'
  )
})

jb.component('editableNumber.mdcSlider', {
  type: 'editable-number.style',
  impl: styleByControl(
    group({
      title: '%$editableNumberModel/title%',
      controls: group({
        layout: layout.horizontal(20),
        controls: [
          editableText({
            databind: '%$editableNumberModel/databind%',
            style: editableText.input(),
            features: [
              slider.handleArrowKeys(),
              css(
                'width: 40px; height: 20px; padding-top: 14px; padding-left: 3px; border: 0; border-bottom: 1px solid black; background: transparent;'
              ),
              css.class('text-input')
            ]
          }),
          editableNumber({
            databind: '%$editableNumberModel/databind%',
            max: '%$editableNumberModel/max%',
            min: '%$editableNumberModel/min%',
            step: '%$editableNumberModel/step%',
            style: editableNumber.mdcSliderNoText({}),
          })
        ],
        features: [
          variable({name: 'sliderCtx', value: {'$': 'object'}}),
          watchRef('%$editableNumberModel/databind%')
        ]
      })
    }),
    'editableNumberModel'
  )
})

jb.component('editableNumber.mdcSliderNoText', {
  type: 'editable-number.style',
  params: [
    { id: 'thumbSize', as: 'number', defaultValue: 21 },
    { id: 'cx', as: 'number', defaultValue: 10.5 },
    { id: 'cy', as: 'number', defaultValue: 10.5 },
    { id: 'r', as: 'number', defaultValue: 7.875 },
  ],
  impl: customStyle({
    template: (cmp,{title,min,max,step,databind,thumbSize,cx,cy,r},h) =>
      h('div#mdc-slider mdc-slider--discrete',{tabIndex: -1, role: 'slider', max, step,
        'aria-valuemin': min, 'aria-valuemax': max, 'aria-valuenow': cmp.ctx.vars.editableNumber.numericPart(databind), 'aria-label': title()}, [
        h('div#mdc-slider__track-container',{}, h('div#mdc-slider__track')),
        h('div#mdc-slider__thumb-container',{},[
          h('div#mdc-slider__pin',{},h('span#mdc-slider__pin-value-marker')),
          h('svg#mdc-slider__thumb',{ width: thumbSize, height: thumbSize}, h('circle',{cx,cy,r})),
          h('div#mdc-slider__focus-ring')
        ])
      ]),
    features: [
      field.databind(),
      slider.initJbModelWithUnits(),
      //slider.init(),
      slider.checkAutoScale(),
      interactiveProp('rebuild mdc on external refresh',(ctx,{cmp}) => {
        cmp.mdcSlider && cmp.mdcSlider.destroy()
        cmp.mdcSlider = new jb.ui.material.MDCSlider(cmp.base)
        //cmp.mdcSlider.listen('MDCSlider:input', ({detail}) =>  !cmp.checkAutoScale(detail.value) && cmp.jbModelWithUnits(detail.value))
        cmp.mdcSlider.listen('MDCSlider:change', () =>
          !cmp.checkAutoScale(cmp.mdcSlider.value) && cmp.jbModelWithUnits(cmp.mdcSlider.value))
      }),
      feature.destroy((ctx,{cmp}) => cmp.mdcSlider && cmp.mdcSlider.destroy()),
    ]
  })
})

jb.component('slider.initJbModelWithUnits', {
  type: 'feature',
  impl: interactive((ctx,{cmp}) => {
        cmp.jbModelWithUnits = val => {
          const numericVal = ctx.vars.editableNumber.numericPart(jb.val(cmp.jbModel()))
          if (val === undefined)
            return numericVal
          else
            cmp.jbModel(ctx.vars.editableNumber.calcDataString(+val,ctx))
        }
  })
})

jb.component('slider.init', {
  type: 'feature',
  impl: ctx => ({
      onkeydown: true,
      onmouseup: true,
      onmousedown: true,
      onmousemove: true,
      afterViewInit: cmp => {
        const step = (+cmp.base.step) || 1
        cmp.handleArrowKey = e => {
            const val = jb.tonumber(cmp.jbModelWithUnits())
            if (val == null) return
            if (e.keyCode == 46) // delete
              jb.writeValue(ctx.vars.$model.databind(),null, ctx);
            if ([37,39].indexOf(e.keyCode) != -1) {
              var inc = e.shiftKey ? step*9 : step;
              if (val !=null && e.keyCode == 39)
                cmp.jbModelWithUnits(Math.min(+cmp.base.max,val+inc));
              if (val !=null && e.keyCode == 37)
                cmp.jbModelWithUnits(Math.max(+cmp.base.min,val-inc));
              cmp.checkAutoScale(cmp.base.value)
            }
        }

        const {pipe,subscribe,flatMap,takeUntil} = jb.callbag
        pipe(cmp.onkeydown,subscribe(e=> cmp.handleArrowKey(e)))

        // drag
        pipe(cmp.onmousedown,
          flatMap(e=> pipe(cmp.onmousemove, takeUntil(cmp.onmouseup))),
          subscribe(e=> !cmp.checkAutoScale(cmp.base.value) && cmp.jbModelWithUnits(cmp.base.value)
          ))

        if (ctx.vars.sliderCtx) // supporting left/right arrow keys in the text field as well
          ctx.vars.sliderCtx.handleArrowKey = e => cmp.handleArrowKey(e);
      }
    })
})

jb.component('slider.checkAutoScale', {
  type: 'feature',
  impl: features(
    calcProp('min'),
    calcProp('step'),      
    calcProp({
        id: 'max',
        value: ctx => {
          const val = ctx.vars.editableNumber.numericPart(jb.val(ctx.vars.$model.databind()))
          if (val > +ctx.vars.$model.max && ctx.vars.$model.autoScale)
            return val + 100
          return +ctx.vars.$model.max
    }}),
    interactive((ctx,{cmp}) => {
      cmp.checkAutoScale = val => {
        if (!ctx.vars.$model.autoScale) return
        const max = +(cmp.base.max || cmp.base.getAttribute('max'))
        const step = +(cmp.base.step || cmp.base.getAttribute('step'))
        if (val == max) { // scale up
          cmp.jbModelWithUnits((+val) + step)
          cmp.refresh(null, {strongRefresh: true},{srcCtx: ctx.componentContext})
          return true
        }
        if (max > ctx.vars.$model.max && val < ctx.vars.$model.max) { // scale down
          cmp.jbModelWithUnits(+val)
          cmp.refresh(null, {strongRefresh: true},{srcCtx: ctx.componentContext})
          return true
        }
      }
    }))
})

jb.component('slider.handleArrowKeys', {
  type: 'feature',
  impl: features(
    htmlAttribute('onkeydown', true),
    defHandler(
        'onkeydownHandler',
        (ctx,{ev}) =>
        ctx.vars.sliderCtx && sliderCtx.handleArrowKey(ev)
      )
  )
})


