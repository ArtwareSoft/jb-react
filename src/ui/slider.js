jb.component('editable-number.slider-no-text', {
  type: 'editable-number.style',
  impl :{$: 'custom-style', 
      template: (cmp,state,h) => h('input',{ type: 'range', 
        min: state.min, max: state.max, step: state.step,
        value: cmp.jbModel(), mouseup: e => cmp.jbModel(e.target.value), tabindex: 0}),
      features :[
          {$: 'field.databind' },
          {$: 'slider.init'},
      ],
  }
})

jb.component('editable-number.slider', {
  type: 'editable-number.style',
  impl :{$: 'custom-style', 
      template: (cmp,state,h) => h('div',{},[
        h('div',{class:'slider-text'},cmp.jbModel()),
        h('input',{ type: 'range', 
          min: state.min, max: state.max, step: state.step,
          value: cmp.jbModel(), mouseup: e => cmp.jbModel(e.target.value), tabindex: 0})
        ]),
      features :[
          {$: 'field.databind' },
          {$: 'slider.init'},
      ],
      css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
  }
})

jb.component('slider.init', {
  type: 'feature',
  params: [
    {id: 'onEnter', type: 'action', dynamic: true, defaultValue:{$: 'slider.edit-settings'} },
  ],
  impl: ctx => ({
      onclick: true,
      onmouseup: true,
      onkeyup: true,
      init: cmp => 
        cmp.refresh =  _=> {
          var val = Number(cmp.jbModel());
          cmp.max = Math.max.apply(0,[ctx.vars.$model.max,val,cmp.max].filter(x=>x!=null));
          cmp.min = Math.min.apply(0,[ctx.vars.$model.min,val,cmp.min].filter(x=>x!=null));
          if (val == cmp.max && ctx.vars.$model.autoScale)
            cmp.max += cmp.max - cmp.min;
          if (val == cmp.min && ctx.vars.$model.autoScale)
            cmp.min -= cmp.max - cmp.min;

          jb.ui.setState(cmp,{ min: cmp.min, max: cmp.max, step: ctx.vars.$model.step })
        },

      afterViewInit: cmp => {
          cmp.refresh();
          cmp.onmouseup.merge(cmp.onkeyup).subscribe(e=> {
              cmp.jbModel(e.target.value);
              cmp.refresh();
              if (e.keyCode == 13)
                jb.ui.wrapWithLauchingElement(ctx.params.onEnter, cmp.ctx, cmp.base)();
              if (e.keyCode == 46) // delete
                jb.writeValue(ctx.vars.$model.databind,null);
              if ([37,39].indexOf(e.keyCode) != -1 && e.shiftKey) { 
                var val = Number(cmp.jbModel());
                if (e.keyCode == 39)
                  cmp.jbModel(Math.min(cmp.max,val+9));
                if (e.keyCode == 37)
                  cmp.jbModel(Math.max(cmp.min,val-9));
              }
          });
          cmp.onclick.subscribe(e=>jb.ui.focus(cmp.base,'slider'));
        }
    })
})


jb.component('slider.edit-settings', {
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
            action :{$: 'close-containing-popup' }
          }, 
        }, 
      ], 
      features: [
        {$: 'group.data', data: '%$editableNumber%' }, 
        {$: 'css.padding', left: '10', right: '10' }
      ]
    }, 
    features: [
        { $: 'dialog-feature.uniqueDialog', id: 'slider', remeberLastLocation: false },
        { $: 'dialog-feature.maxZIndexOnClick' },
        { $: 'dialog-feature.closeWhenClickingOutside' },
        { $: 'dialog-feature.cssClassOnLaunchingControl' },
        { $: 'dialog-feature.nearLauncherLocation' },
        {$: 'dialog-feature.autoFocusOnFirstInput' },
      ]
  }, 
})


jb.component('editable-number.mdl-slider', {
  type: 'editable-number.style',
  impl :{$: 'custom-style', 
      template: (cmp,state,h) => h('input',{class:'mdl-slider mdl-js-slider', type: 'range', 
        min: state.min, max: state.max, step: state.step,
        value: cmp.jbModel(), mouseup: e => cmp.jbModel(e.target.value), tabindex: 0}),
      features :[
          {$: 'field.databind' },
          {$: 'slider.init'},
          {$: 'mdl-style.init-dynamic' }
      ],
  }
})
