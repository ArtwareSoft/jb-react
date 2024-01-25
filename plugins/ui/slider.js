component('editableNumber.sliderNoText', {
  type: 'editable-number.style',
  impl: customStyle({
    template: (cmp,{min,max,step,numbericVal},h) => h('input', { 
        type: 'range', value: numbericVal, mouseup: 'onblurHandler', tabindex: -1, min,max,step
      }),
    features: [
      field.databind(0, true),
      slider.init(),
      slider.drag()
    ]
  })
})

component('editableNumber.slider', {
  type: 'editable-number.style',
  impl: styleByControl({
    control: group({
      title: '%$editableNumberModel/title%',
      controls: group({
        layout: layout.horizontal(20),
        controls: [
          editableText({
            databind: '%$editableNumberModel/databind()%',
            style: editableText.input(),
            features: [
              slider.init(),
              css(
                'width: 30px; padding-left: 3px; border: 0; border-bottom: 1px solid var(--jb-menubar-inactive-bg);'
              ),
              css('color: var(--mdc-theme-text-primary-on-background); background: var(--mdc-theme-background)'),
              css.class('text-input')
            ]
          }),
          editableNumber('%$editableNumberModel/databind()%', {
            style: editableNumber.sliderNoText(),
            min: '%$editableNumberModel/min%',
            max: '%$editableNumberModel/max%',
            step: '%$editableNumberModel/step%',
            features: [
            css.width(80),
            css.class('slider-input')
          ]
          })
        ],
        features: watchRef('%$editableNumberModel/databind()%', { allowSelfRefresh: true })
      })
    }),
    modelVar: 'editableNumberModel'
  })
})

component('editableNumber.mdcSlider', {
  type: 'editable-number.style',
  impl: styleByControl({
    control: group({
      title: '%$editableNumberModel/title%',
      controls: group({
        layout: layout.horizontal(20),
        controls: [
          editableText({
            databind: '%$editableNumberModel/databind()%',
            style: editableText.input(),
            features: [
              slider.init(),
              css(
                'width: 40px; height: 20px; padding-top: 14px; padding-left: 3px; border: 0; border-bottom: 1px solid black; background: transparent;'
              ),
              css.class('text-input')
            ]
          }),
          editableNumber('%$editableNumberModel/databind()%', {
            style: editableNumber.mdcSliderNoText(),
            min: '%$editableNumberModel/min%',
            max: '%$editableNumberModel/max%',
            step: '%$editableNumberModel/step%'
          })
        ],
        features: watchRef('%$editableNumberModel/databind()%', { allowSelfRefresh: true })
      })
    }),
    modelVar: 'editableNumberModel'
  })
})

component('editableNumber.mdcSliderNoText', {
  type: 'editable-number.style',
  params: [
    {id: 'thumbSize', as: 'number', defaultValue: 21},
    {id: 'cx', as: 'number', defaultValue: 10.5},
    {id: 'cy', as: 'number', defaultValue: 10.5},
    {id: 'r', as: 'number', defaultValue: 7.875}
  ],
  impl: customStyle({
    template: (cmp,{title,min,max,step,numbericVal,thumbSize,cx,cy,r},h) =>
      h('div.mdc-slider mdc-slider--discrete',{tabIndex: -1, role: 'slider', 'data-step': step,
        'aria-valuemin': min, 'aria-valuemax': max, 'aria-valuenow': numbericVal, 'aria-label': title()}, [
        h('div.mdc-slider__track-container',{}, h('div.mdc-slider__track')),
        h('div.mdc-slider__thumb-container',{},[
          h('div.mdc-slider__pin',{},h('span.mdc-slider__pin-value-marker')),
          h('svg.mdc-slider__thumb',{ width: thumbSize, height: thumbSize}, h('circle',{cx,cy,r})),
          h('div.mdc-slider__focus-ring')
        ])
      ]),
    features: [
      frontEnd.requireExternalLibrary('material-components-web.js','css/font.css','css/material.css'),
      field.databind(),
      slider.init(),
      frontEnd.init((ctx,{cmp}) => {
        cmp.mdcSlider = new jb.frame.mdc.slider.MDCSlider(cmp.base)
        cmp.mdcSlider.listen('MDCSlider:change', () => ctx.run(action.runBEMethod('assignIgnoringUnits', ()=> cmp.mdcSlider.value)))
      }),
      frontEnd.onRefresh((ctx,{cmp,el}) => {
        if (!cmp.mdcSlider) return 
        cmp.mdcSlider.value = +el.getAttribute('aria-valuenow')
        cmp.mdcSlider.min = +el.getAttribute('aria-valuemin')
        cmp.mdcSlider.max = +el.getAttribute('aria-valuemax')
        cmp.mdcSlider.step = +el.getAttribute('data-step')
      }),
      frontEnd.onDestroy((ctx,{cmp}) => cmp.mdcSlider && cmp.mdcSlider.destroy())
    ]
  })
})

component('slider.init', {
  type: 'feature',
  impl: features(
    calcProp('numbericVal', ({},{editableNumber,$model}) => editableNumber.numericPart(jb.val( $model.databind()))),
    calcProp('min'),
    calcProp('step'),
    calcProp('max', (ctx,{$model,$props}) => {
        const val = $props.numbericVal
        if (val >= +$model.max && $model.autoScale)
          return val * 1.2
        return +$model.max
    }),
    method('delete', writeValue('%$$model/databind()%', () => null)),
    method('assignIgnoringUnits', (ctx,{editableNumber,$model}) => {
      const curVal = editableNumber.numericPart(jb.val($model.databind()))
      if (curVal === undefined) return
      jb.db.writeValue($model.databind(),editableNumber.calcDataString(ctx.data,ctx),ctx)
    }),
    method('incIgnoringUnits', (ctx,{editableNumber,$model,$props}) => {
      const curVal = editableNumber.numericPart(jb.val($model.databind()))
      if (curVal === undefined) return
      const nVal = curVal + ctx.data*$props.step
      const newVal = editableNumber.autoScale ? nVal : editableNumber.keepInDomain(nVal)
      jb.db.writeValue($model.databind(), editableNumber.calcDataString(newVal, ctx),ctx)
    }),
    frontEnd.flow(source.frontEndEvent('keydown'), rx.filter('%keyCode%==46'), sink.BEMethod('delete')),
    frontEnd.flow(
      source.frontEndEvent('keydown'),
      rx.filter('%keyCode%==39'),
      rx.map(If('%shiftKey%', 9, 1)),
      sink.BEMethod('incIgnoringUnits')
    ),
    frontEnd.flow(
      source.frontEndEvent('keydown'),
      rx.filter('%keyCode%==37'),
      rx.map(If('%shiftKey%', -9, -1)),
      sink.BEMethod('incIgnoringUnits')
    )
  )
})

component('slider.drag', {
  type: 'feature',
  impl: features(
    frontEnd.flow(
      source.frontEndEvent('mousemove'),
      rx.filter('%buttons%!=0'),
      sink.BEMethod('assignIgnoringUnits', '%$cmp.base.value%')
    ),
    frontEnd.flow(source.frontEndEvent('click'), sink.BEMethod('assignIgnoringUnits', '%$cmp.base.value%'))
  )
})

