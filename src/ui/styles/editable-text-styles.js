jb.component('editable-text.input', { /* editableText.input */
  type: 'editable-text.style',
  impl: customStyle({
    template: (cmp,state,h) => h('input', {
        value: state.model,
        onchange: e => cmp.jbModel(e.target.value),
        onkeyup: e => cmp.jbModel(e.target.value,'keyup')  }),
    features: field.databindText()
  })
})

jb.component('editable-text.textarea', { /* editableText.textarea */
  type: 'editable-text.style',
  params: [
    {id: 'rows', as: 'number', defaultValue: 4},
    {id: 'cols', as: 'number', defaultValue: 120},
    {id: 'oneWay', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('textarea', {
        rows: cmp.rows, cols: cmp.cols,
        value: state.model, onchange: e => cmp.jbModel(e.target.value), onkeyup: e => cmp.jbModel(e.target.value,'keyup')  }),
    features: field.databindText(undefined, '%$oneWay')
  })
})

jb.component('editable-text.mdl-input', { /* editableText.mdlInput */
  type: 'editable-text.style',
  params: [
    {id: 'width', as: 'number'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{class: ['mdl-textfield','mdl-js-textfield','mdl-textfield--floating-label',state.error ? 'is-invalid' : ''].join(' ') },[
        h('input', { class: 'mdl-textfield__input', id: 'input_' + state.fieldId, type: 'text',
            value: state.model,
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
        h('label',{class: 'mdl-textfield__label', for: 'input_' + state.fieldId},state.title),
        h('span',{class: 'mdl-textfield__error' }, state.error || '')
      ]),
    css: '{ {?width: %$width%px?} }',
    features: [
      field.databindText(),
      mdlStyle.initDynamic(),
      ctx => ({
            beforeInit: cmp => cmp.elemToInput = elem => elem.children[0]
          })
    ]
  })
})

jb.component('editable-text.mdl-input-no-floating-label', { /* editableText.mdlInputNoFloatingLabel */
  type: 'editable-text.style',
  params: [
    {id: 'width', as: 'number'}
  ],
  impl: customStyle({
    template: (cmp,state,h) =>
        h('input', { class: 'mdl-textfield__input', type: 'text',
            value: state.model,
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
    css: '{ {?width: %$width%px?} } :focus { border-color: #3F51B5; border-width: 2px}',
    features: [field.databindText(), mdlStyle.initDynamic()]
  })
})

jb.component('editable-text.mdl-search', { /* editableText.mdlSearch */
  description: 'debounced and one way binding',
  type: 'editable-text.style',
  impl: customStyle({
    template: (cmp,{model, fieldId, title},h) => h('div',{class:'mdl-textfield mdl-js-textfield'},[
        h('input', { class: 'mdl-textfield__input', id: 'search_' + fieldId, type: 'text',
            value: model,
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
        h('label',{class: 'mdl-textfield__label', for: 'search_' + fieldId}, model ? '' : title)
      ]),
    features: [field.databindText(), mdlStyle.initDynamic()]
  })
})
