jb.component('editable-boolean.checkbox', { /* editableBoolean.checkbox */
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('input', { type: 'checkbox', checked: state.databind, onchange: 'setChecked', onkeyup: 'setChecked'  }),
    features: field.databind()
  })
})

jb.component('editable-boolean.checkbox-with-title', { /* editableBoolean.checkboxWithTitle */
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{}, [h('input', { type: 'checkbox',
        checked: state.databind, onchange: 'setChecked', onkeyup: 'setChecked'  }), state.text]),
    features: field.databind()
  })
})

jb.component('editable-boolean.expand-collapse', { /* editableBoolean.expandCollapse */
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,{databind},h) => h('i',{class:'material-icons noselect', onclick: 'toggle' },
      databind ? 'keyboard_arrow_down' : 'keyboard_arrow_right'),
    css: '{ font-size:16px; cursor: pointer; }',
    features: field.databind()
  })
})

jb.component('editable-boolean.mdc-x-v', { /* editableBoolean.mdcXV */
  type: 'editable-boolean.style',
  description: 'two icons',
  params: [
    {id: 'yesIcon', as: 'string', mandatory: true, defaultValue: 'check'},
    {id: 'noIcon', as: 'string', mandatory: true, defaultValue: 'close'}
  ],
  impl: customStyle({
    template: (cmp,{title,databind,yesIcon,noIcon},h) => h('button',{
          class: ['mdc-icon-button material-icons',databind && 'raised mdc-icon-button--on'].filter(x=>x).join(' '),
          title, tabIndex: -1, onclick: 'toggle'},[
            h('i',{class:'material-icons mdc-icon-button__icon mdc-icon-button__icon--on'}, yesIcon),
            h('i',{class:'material-icons mdc-icon-button__icon '}, noIcon),
        ]),
    css: '{ border-radius: 2px; padding: 0; width: 24px; height: 24px;}',
    features: [field.databind(), mdcStyle.initDynamic()]
  })
})

jb.component('editable-boolean.mdc-slide-toggle', { /* editableBoolean.mdcSlideToggle */
  type: 'editable-boolean.style',
  params: [
    {id: 'width', as: 'string', defaultValue: 80}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{class: 'mdc-switch'},[
      h('div',{class: 'mdc-switch__track'}),
      h('div',{class: 'mdc-switch__thumb-underlay'},[
        h('div',{class: 'mdc-switch__thumb'},
          h('input', { type: 'checkbox', role: 'switch', class: 'mdc-switch__native-control', id: 'switch_' + state.fieldId,
            checked: state.databind, onchange: 'setChecked' })),
      ]),
      h('label',{for: 'switch_' + state.fieldId},state.text)
    ]),
    css: ctx => jb.ui.propWithUnits('width',ctx.params.width),
    features: [field.databind(), editableBoolean.keyboardSupport(), mdcStyle.initDynamic()]
  })
})

jb.component('editable-boolean.checkbox-with-label', { /* editableBoolean.checkboxWithLabel */
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{},[
        h('input', { type: 'checkbox', id: "switch_"+state.fieldId,
          checked: state.databind,
          onchange: 'setChecked',
          onkeyup: 'setChecked'  },),
        h('label',{for: "switch_"+state.fieldId },state.text)
    ]),
    features: field.databind()
  })
})

