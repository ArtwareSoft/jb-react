jb.component('editableBoolean.checkbox', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('input', { type: 'checkbox', checked: state.databind, onclick: 'toggle', onchange: 'toggle', onkeyup: 'toggleByKey'  }),
    features: field.databind()
  })
})

jb.component('editableBoolean.checkboxWithTitle', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,{title,databind},h) => h('div',{}, [h('input', { type: 'checkbox',
        checked: databind, onchange: 'toggle', onkeyup: 'toggleByKey'  }), title()]),
    features: field.databind()
  })
})

jb.component('editableBoolean.checkboxWithLabel', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,{title,databind,fieldId},h) => h('div',{},[
        h('input', { type: 'checkbox', id: "switch_"+fieldId,
          checked: databind,
          onchange: 'toggle',
          onkeyup: 'toggleByKey'  },),
        h('label',{for: "switch_"+fieldId },title())
    ]),
    features: field.databind()
  })
})

jb.component('editableBoolean.expandCollapse', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,{databind},h) => h('i',{class:'material-icons noselect', onclick: 'toggle' },
      databind ? 'keyboard_arrow_down' : 'keyboard_arrow_right'),
    css: '{ font-size:16px; cursor: pointer; }',
    features: field.databind()
  })
})

jb.component('editableBoolean.mdcXV', {
  type: 'editable-boolean.style',
  description: 'two icons',
  params: [
    {id: 'yesIcon', as: 'string', mandatory: true, defaultValue: 'check'},
    {id: 'noIcon', as: 'string', mandatory: true, defaultValue: 'close'}
  ],
  impl: customStyle({
    template: (cmp,{title,databind,yesIcon,noIcon},h) => h('button',{
          class: ['mdc-icon-button material-icons',databind && 'raised mdc-icon-button--on'].filter(x=>x).join(' '),
          title: title(), tabIndex: -1, onclick: 'toggle', onkeyup: 'toggleByKey'},[
            h('i',{class:'material-icons mdc-icon-button__icon mdc-icon-button__icon--on'}, yesIcon),
            h('i',{class:'material-icons mdc-icon-button__icon '}, noIcon),
        ]),
    css: '{ border-radius: 2px; padding: 0; width: 24px; height: 24px;}',
    features: [field.databind(), mdcStyle.initDynamic()]
  })
})

jb.component('editableBoolean.buttonXV', {
  type: 'editable-boolean.style',
  description: 'two icons',
  params: [
    {id: 'yesIcon', type: 'icon', mandatory: true, defaultValue: icon('check')},
    {id: 'noIcon', type: 'icon', mandatory: true, defaultValue: icon('close') },
    {id: 'buttonStyle', type: 'button.style', mandatory: true, defaultValue: button.mdcFloatingAction() }
  ],
  impl: styleWithFeatures(call('buttonStyle'), features(
      htmlAttribute('onclick','toggle'),
      ctx => ctx.run({...ctx.cmpCtx.params[jb.toboolean(ctx.vars.$model.databind()) ? 'yesIcon' : 'noIcon' ], 
        title: ctx.exp('%$$model/title%'), $: 'feature.icon'}),
    ))
})

jb.component('editableBoolean.iconWithSlash', {
  type: 'editable-boolean.style',
  params: [
    {id: 'buttonSize', as: 'number', defaultValue: 40, description: 'button size is larger than the icon size, usually at the rate of 40/24' },
  ],
  impl: styleWithFeatures(button.mdcIcon({buttonSize: '%$buttonSize%'}), features(
      Var('strokeColor', css.valueOfCssVar('mdc-theme-on-secondary')),
      htmlAttribute('onclick','toggle'),
      htmlAttribute('title','%$$model/title%'),
      css(If('%$$model/databind%','',`background-repeat: no-repeat; background-image: url("data:image/svg+xml;utf8,<svg width='%$buttonSize%' height='%$buttonSize%' viewBox='0 0 %$buttonSize% %$buttonSize%' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='0' x2='%$buttonSize%' y2='%$buttonSize%' style='stroke:%$strokeColor%;stroke-width:2' /></svg>")`))
    ))
})

jb.component('editableBoolean.mdcSlideToggle', {
  type: 'editable-boolean.style',
  params: [
    {id: 'width', as: 'string', defaultValue: 80}
  ],
  impl: customStyle({
    template: (cmp,{databind,fieldId,toggleText},h) => h('div#mdc-switch',{class: databind ? 'mdc-switch--checked': '' },[
      h('div#mdc-switch__track'),
      h('div#mdc-switch__thumb-underlay',{},
        h('div#mdc-switch__thumb',{},
          h('input#mdc-switch__native-control', { type: 'checkbox', role: 'switch', id: 'switch_' + fieldId,
            checked: databind, onchange: 'toggle', onkeyup: 'toggleByKey' }
      ))),
      h('label',{for: 'switch_' + fieldId},toggleText)
    ]),
    css: ctx => jb.ui.propWithUnits('width',ctx.params.width),
    features: [field.databind(), mdcStyle.initDynamic()]
  })
})

jb.component('editableBoolean.mdcCheckBox', {
  type: 'editable-boolean.style',
  params: [
    {id: 'width', as: 'string', defaultValue: 80}
  ],
  impl: customStyle({
    template: (cmp,{databind,fieldId,title},h) => h('div#mdc-form-field', {},[
        h('div#mdc-checkbox',{}, [
          h('input#mdc-checkbox__native-control', { type: 'checkbox', id: 'checkbox_' + fieldId,
            checked: databind, onchange: 'toggle', onkeyup: 'toggleByKey' }),
          h('div#mdc-checkbox__background',{}, [
            h('svg#mdc-checkbox__checkmark',{viewBox: '0 0 24 24'},
              h('path#mdc-checkbox__checkmark-path', { fill: 'none', d: 'M1.73,12.91 8.1,19.28 22.79,4.59' }
            )),
            h('div#mdc-checkbox__mixedmark')
          ]),
          h('div#mdc-checkbox__ripple')
        ]),
        h('label',{for: 'checkbox_' + fieldId},title())
    ]),
    css: ctx => jb.ui.propWithUnits('width',ctx.params.width),
    features: [
      field.databind(), 
      css('~ .mdc-checkbox__checkmark { top: -9px}')
      // frontEnd((ctx,{cmp}) => {
      //   // svg refresh bug (maybe a jb-react bug)
      //   const bck = cmp.base.querySelector('.mdc-checkbox__background')
      //   bck.outerHTML = ''+ bck.outerHTML
      // })
    ]
  })
})

jb.component('editableBoolean.picklist', {
  type: 'editable-boolean.style',
  params: [
    {id: 'picklistStyle', type: 'picklist.style', dynamic: true },
  ],
  impl: styleByControl(
    picklist({
      databind: '%$editableBooleanModel/databind%',
      options: list(
        obj(prop('text','%$editableBooleanModel/textForTrue()%'),prop('code',true)),
        obj(prop('text','%$editableBooleanModel/textForFalse()%'),prop('code',false))),
      style: call('picklistStyle'),
    }),
    'editableBooleanModel'
  )
})