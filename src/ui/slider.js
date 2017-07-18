jb.component('editable-number.slider-no-text', {
  type: 'editable-number.style',
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('input',{ type: 'range',
        min: state.min, max: state.max, step: state.step,
        value: state.model, mouseup: e => cmp.jbModel(e.target.value), tabindex: -1}),
      features :[
          {$: 'field.databind-range' },
          {$: 'slider.init'},
      ],
  }
})

jb.component('editable-number.slider', {
  type: 'editable-number.style',
  impl :{$: 'style-by-control', __innerImplementation: true,
    modelVar: 'editableNumberModel',
    control :{$: 'group',
      title: '%$editableNumberModel/title%',
      controls :{$: 'group',
        style: {$: 'layout.horizontal', spacing: 20},
        controls: [
          {$: 'editable-text',
              databind: '%$editableNumberModel/databind%',
              style: {$: 'editable-text.mdl-input-no-floating-label', width: 36 },
              features: [
                {$: 'slider-text.handleArrowKeys' },
                { $: 'css.margin', top : -3}
              ],
          },
          {$: 'editable-number',
              databind: '%$editableNumberModel/databind%',
              style :{$: 'editable-number.slider-no-text'},
              features: {$: 'css.width', width: 80},
          },
        ],
        features: {$: 'var', name: 'sliderCtx', value: {$: 'object'}}
      }
    }
  }
})

jb.component('slider.init', {
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
                jb.writeValue(ctx.vars.$model.databind,null);
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

jb.component('slider-text.handleArrowKeys', {
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

jb.component('slider.edit-as-text-popup', {
  type: 'feature',
  impl :{$: 'open-dialog',
    style :{$: 'dialog.popup' },
    content :{$: 'group',
      title: 'data-settings',
      style :{$: 'layout.vertical', spacing: 3 },
      controls: [
        {$: 'editable-text',
          title: '%title%',
          databind: '%databind%',
          style :{$: 'editable-text.mdl-input', width: '270' },
          features :{$: 'feature.onEnter',
            action :{$: 'dialog.close-containing-popup' }
          },
        },
      ],
      features: [
        {$: 'group.data', data: '%$editableNumber%' },
        {$: 'css.padding', left: '10', right: '10' }
      ]
    },
    features: [
        { $: 'dialog-feature.unique-dialog', id: 'slider', remeberLastLocation: false },
        { $: 'dialog-feature.max-zIndex-on-click' },
        { $: 'dialog-feature.close-when-clicking-outside' },
        { $: 'dialog-feature.css-class-on-launching-element' },
        { $: 'dialog-feature.near-launcher-position' },
        {$: 'dialog-feature.auto-focus-on-first-input', selectText: true },
      ]
  },
})


jb.component('editable-number.mdl-slider', {
  type: 'editable-number.style',
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('input',{class:'mdl-slider mdl-js-slider', type: 'range',
        min: state.min, max: state.max, step: state.step,
        value: state.model, mouseup: e => cmp.jbModel(e.target.value), tabindex: 0}),
      features :[
          {$: 'field.databind' },
          {$: 'slider.init'},
          {$: 'mdl-style.init-dynamic' }
      ],
  }
})
