jb.component('editable-boolean.checkbox', { /* editableBoolean.checkbox */
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('input', { type: 'checkbox',
        checked: state.model,
        onchange: e => cmp.jbModel(e.target.checked),
        onkeyup: e => cmp.jbModel(e.target.checked,'keyup')  }),
    features: field.databind()
  })
})

jb.component('editable-boolean.checkbox-with-title', { /* editableBoolean.checkboxWithTitle */
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{}, [h('input', { type: 'checkbox',
        checked: state.model,
        onchange: e => cmp.jbModel(e.target.checked),
        onkeyup: e => cmp.jbModel(e.target.checked,'keyup')  }), state.text]),
    features: field.databind()
  })
})


jb.component('editable-boolean.expand-collapse', { /* editableBoolean.expandCollapse */
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{},[
          h('input', { type: 'checkbox',
            checked: state.model,
            onchange: e => cmp.jbModel(e.target.checked),
            onkeyup: e => cmp.jbModel(e.target.checked,'keyup')  }, state.text),
          h('i',{class:'material-icons noselect', onclick: _=> cmp.toggle() }, state.model ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
      ]),
    css: `>i { font-size:16px; cursor: pointer; }
          >input { display: none }`,
    features: field.databind()
  })
})

jb.component('editable-boolean.mdl-slide-toggle', { /* editableBoolean.mdlSlideToggle */
  type: 'editable-boolean.style',
  params: [
    { id: 'width', as: 'number', defaultValue: 80 }
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('label',{style: { width: cmp.width+'px'}, class:'mdl-switch mdl-js-switch mdl-js-ripple-effect', for: 'switch_' + state.fieldId },[
        h('input', { type: 'checkbox', class: 'mdl-switch__input', id: 'switch_' + state.fieldId,
          checked: state.model, onchange: e => cmp.jbModel(e.target.checked) }),
        h('span',{class:'mdl-switch__label' },state.text)
      ]),
    features: [field.databind(), editableBoolean.keyboardSupport(), mdlStyle.initDynamic()]
  })
})

jb.component('editable-boolean.checkbox-with-label', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{},[
        h('input', { type: 'checkbox', id: "switch_"+state.fieldId,
          checked: state.model,
          onchange: e => cmp.jbModel(e.target.checked),
          onkeyup: e => cmp.jbModel(e.target.checked,'keyup')  },),
        h('label',{for: "switch_"+state.fieldId },state.text)
    ]),
    features: field.databind()
  })
})

