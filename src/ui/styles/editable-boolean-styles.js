jb.component('editable-boolean.checkbox', { /* editableBoolean.checkbox */
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('input', { type: 'checkbox', checked: state.model, onchange: 'setChecked', onkeyup: 'setChecked'  }),
    features: field.databind()
  })
})

jb.component('editable-boolean.checkbox-with-title', { /* editableBoolean.checkboxWithTitle */
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{}, [h('input', { type: 'checkbox',
        checked: state.model, onchange: 'setChecked', onkeyup: 'setChecked'  }), state.text]),
    features: field.databind()
  })
})

jb.component('editable-boolean.expand-collapse', { /* editableBoolean.expandCollapse */
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('i',{class:'material-icons noselect', onclick: 'toggle' }, 
      state.model ? 'keyboard_arrow_down' : 'keyboard_arrow_right'),
    css: `{ font-size:16px; cursor: pointer; }`,
    features: field.databind()
  })
})

jb.component('editable-boolean.mdc-slide-toggle', { /* editableBoolean.mdcSlideToggle */
  type: 'editable-boolean.style',
  params: [
    { id: 'width', as: 'string', defaultValue: 80 }
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{class: 'mdc-switch'},[
      h('div',{class: 'mdc-switch__track'}),
      h('div',{class: 'mdc-switch__thumb-underlay'},[
        h('div',{class: 'mdc-switch__thumb'},
          h('input', { type: 'checkbox', role: 'switch', class: 'mdc-switch__native-control', id: 'switch_' + state.fieldId,
            checked: state.model, onchange: 'setChecked' })),
      ]),
      h('label',{for: 'switch_' + state.fieldId},state.text)
    ]),
    css: ctx => `{ width: ${jb.ui.withUnits(ctx.params.width)}}`,
    features: [field.databind(), editableBoolean.keyboardSupport(), mdcStyle.initDynamic()]
  })
})

jb.component('editable-boolean.checkbox-with-label', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{},[
        h('input', { type: 'checkbox', id: "switch_"+state.fieldId,
          checked: state.model,
          onchange: 'setChecked',
          onkeyup: 'setChecked'  },),
        h('label',{for: "switch_"+state.fieldId },state.text)
    ]),
    features: field.databind()
  })
})

