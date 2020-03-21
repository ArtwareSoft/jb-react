jb.ns('slider')

jb.component('editable-number.slider-no-text', { /* editableNumber.sliderNoText */
  type: 'editable-number.style',
  impl: features(
    calcProp('max', ctx => {
      const val = jb.tonumber(ctx.exp('%$editableNumberModel/databind%'))
      if (val > +ctx.vars.$model.max && ctx.vars.$model.autoScale)
        return val + 100
      return +ctx.vars.$model.max
    }),
    ctx => ({
      template: (cmp,state,h) => h('input',{ type: 'range',
        min: state.min, max: state.max, step: state.step,
        value: state.databind, mouseup: 'onblurHandler', tabindex: -1})
    }),
    field.databind(), 
    slider.init(), 
    watchRef('%$editableNumberModel/databind%')
  )
})

jb.component('editable-number.slider', { /* editableNumber.slider */
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
            features: [slider.handleArrowKeys(), css('width: 30px; padding-left: 3px; border: 0; border-bottom: 1px solid black;') ]
          }),
          editableNumber({
            databind: '%$editableNumberModel/databind%',
            style: editableNumber.sliderNoText(),
            features: css.width(80)
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

jb.component('slider.init', { /* slider.init */
  type: 'feature',
  impl: ctx => ({
      onkeyup: true,
      onkeydown: true,
      onmouseup: true,
      onmousedown: true,
      onmousemove: true,
      afterViewInit: cmp => {
        const step = (+cmp.base.step) || 1
        cmp.handleArrowKey = e => {
            const val = jb.tonumber(cmp.jbModel())
            if (val == null) return
            if (e.keyCode == 46) // delete
              jb.writeValue(ctx.vars.$model.databind(),null, ctx);
            if ([37,39].indexOf(e.keyCode) != -1) {
              var inc = e.shiftKey ? step*9 : step;
              if (val !=null && e.keyCode == 39)
                cmp.jbModel(Math.min(+cmp.base.max,val+inc));
              if (val !=null && e.keyCode == 37)
                cmp.jbModel(Math.max(+cmp.base.min,val-inc));
              checkAutoScale()
            }
        }

        const {pipe,subscribe,flatMap,takeUntil} = jb.callbag
        pipe(cmp.onkeydown,subscribe(e=> cmp.handleArrowKey(e)))

        // drag
        pipe(cmp.onmousedown, 
          flatMap(e=> pipe(cmp.onmousemove, takeUntil(cmp.onmouseup))), 
          subscribe(e=> !checkAutoScale() && cmp.jbModel(cmp.base.value)
          ))

        if (ctx.vars.sliderCtx) // supporting left/right arrow keys in the text field as well
          ctx.vars.sliderCtx.handleArrowKey = e => cmp.handleArrowKey(e);

        function checkAutoScale() {
          if (cmp.base.value == +cmp.base.max && ctx.vars.$model.autoScale) {
            cmp.jbModel((+cmp.base.value) + step)
            cmp.refresh(null, {strongRefresh: true})
            return true
          }
        }
      }
    })
})

jb.component('slider.handle-arrow-keys', { /* slider.handleArrowKeys */
  type: 'feature',
  impl: features(
    htmlAttribute('onkeydown',true),
    defHandler('onkeydownHandler', (ctx,{ev}) =>
        ctx.vars.sliderCtx && sliderCtx.handleArrowKey(ev))
  )
})


