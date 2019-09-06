jb.ns('slider')
jb.ns('mdlStyle')

jb.component('editable-number.slider-no-text', { /* editableNumber.sliderNoText */
  type: 'editable-number.style',
  impl: customStyle({
    template: (cmp,state,h) => h('input',{ type: 'range',
        min: state.min, max: state.max, step: state.step,
        value: state.model, mouseup: e => cmp.jbModel(e.target.value), tabindex: -1}),
    features: [field.databind(), slider.init()]
  })
})

jb.component('editable-number.slider', { /* editableNumber.slider */
  type: 'editable-number.style',
  impl: styleByControl(
    group({
      title: '%$editableNumberModel/title%',
      controls: group({
        style: layout.horizontal(20),
        controls: [
          editableText({
            databind: '%$editableNumberModel/databind%',
            style: editableText.mdlInputNoFloatingLabel(36),
            features: [slider.handleArrowKeys(), css.margin(-3)]
          }),
          editableNumber({
            databind: '%$editableNumberModel/databind%',
            style: editableNumber.sliderNoText(),
            features: css.width(80)
          })
        ],
        features: variable({name: 'sliderCtx', value: {'$': 'object'}})
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
      init: cmp =>
        cmp.refresh =  _=> {
          var val = cmp.jbModel() !=null && Number(cmp.jbModel());
          cmp.max = Math.max.apply(0,[ctx.vars.$model.max,val,cmp.max].filter(x=>x!=null));
          cmp.min = Math.min.apply(0,[ctx.vars.$model.min,val,cmp.min].filter(x=>x!=null));
          if (val == cmp.max && ctx.vars.$model.autoScale)
            cmp.max += cmp.max - cmp.min;
          if (val == cmp.min && ctx.vars.$model.autoScale)
            cmp.min -= cmp.max - cmp.min;

          jb.ui.setState(cmp,{ min: cmp.min, max: cmp.max, step: ctx.vars.$model.step, val: cmp.jbModel() },null,ctx);
        },

      afterViewInit: cmp => {
          cmp.refresh();

          cmp.handleArrowKey = e => {
              var val = Number(cmp.jbModel()) || 0;
              if (e.keyCode == 46) // delete
                jb.writeValue(cmp.state.databindRef || ctx.vars.$model.databind(),null);
              if ([37,39].indexOf(e.keyCode) != -1) {
                var inc = e.shiftKey ? 9 : 1;
                if (val !=null && e.keyCode == 39)
                  cmp.jbModel(Math.min(cmp.max,val+inc));
                if (val !=null && e.keyCode == 37)
                  cmp.jbModel(Math.max(cmp.min,val-inc));
              }
          }

          cmp.onkeydown.subscribe(e=>
              cmp.handleArrowKey(e));

          // drag
          cmp.onmousedown.flatMap(e=>
            cmp.onmousemove.takeUntil(cmp.onmouseup)
            ).subscribe(e=>cmp.jbModel(cmp.base.value))

          if (ctx.vars.sliderCtx) // supporting left/right arrow keys in the text field as well
            ctx.vars.sliderCtx.handleArrowKey = e => cmp.handleArrowKey(e);
        }
    })
})

jb.component('slider.handle-arrow-keys', { /* sliderText.handleArrowKeys */
  type: 'feature',
  impl: ctx => ({
      onkeyup: true,
      onkeydown: true,
      afterViewInit: cmp => {
          jb.delay(1).then(_=>{
            var sliderCtx = ctx.vars.sliderCtx;
            if (sliderCtx)
              cmp.onkeydown.subscribe(e=>
                  sliderCtx.handleArrowKey(e));
          })
      }
    })
})

jb.component('slider.edit-as-text-popup', { /* slider.editAsTextPopup */
  type: 'feature',
  impl: openDialog({
    style: dialog.popup(),
    content: group({
      title: 'data-settings',
      style: layout.vertical(3),
      controls: [
        editableText({
          title: '%title%',
          databind: '%databind%',
          style: editableText.mdlInput('270'),
          features: feature.onEnter(dialog.closeContainingPopup())
        })
      ],
      features: [group.data('%$editableNumber%'), css.padding({left: '10', right: '10'})]
    }),
    features: [
      dialogFeature.uniqueDialog('slider', false),
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.nearLauncherPosition({}),
      dialogFeature.autoFocusOnFirstInput(true)
    ]
  })
})


jb.component('editable-number.mdl-slider', { /* editableNumber.mdlSlider */
  type: 'editable-number.style',
  impl: customStyle({
    template: (cmp,state,h) => h('input',{class:'mdl-slider mdl-js-slider', type: 'range',
        min: state.min, max: state.max, step: state.step,
        value: state.model, mouseup: e => cmp.jbModel(e.target.value), tabindex: 0}),
    features: [field.databind(), slider.init(), mdlStyle.initDynamic()]
  })
})
