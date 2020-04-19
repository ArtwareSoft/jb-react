jb.ns('mdc,mdc-style')

jb.component('editableText.input', {
  type: 'editable-text.style',
  impl: customStyle({
    template: (cmp,{databind},h) => h('input', {value: databind, onchange: true, onkeyup: true, onblur: true }),
    features: field.databindText()
  })
})

jb.component('editableText.textarea', {
  type: 'editable-text.style',
  params: [
    {id: 'rows', as: 'number', defaultValue: 4},
    {id: 'cols', as: 'number', defaultValue: 120},
    {id: 'oneWay', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: customStyle({
    template: (cmp,{databind,rows,cols},h) => h('textarea', {
        rows: rows, cols: cols, value: databind, onchange: true, onkeyup: true, onblur: true  }),
    features: field.databindText(0, '%$oneWay%')
  })
})

jb.component('editableText.mdcInput', {
  type: 'editable-text.style,editable-number.style',
  params: [
    {id: 'width', as: 'number'},
    {id: 'noLabel', as: 'boolean'},
    {id: 'noRipple', as: 'boolean'},
  ],
  impl: customStyle({
    template: (cmp,{databind,fieldId,title,noLabel,noRipple,error},h) => h('div',{}, [
      h('div#mdc-text-field',{class: [ 
          (cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'pre')[0] && 'mdc-text-field--with-leading-icon',
          (cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'post')[0] && 'mdc-text-field--with-trailing-icon'
        ].filter(x=>x).join(' ') },[
          ...(cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'pre').map(h).map(vdom=>vdom.addClass('mdc-text-field__icon mdc-text-field__icon--leading')),
          h('input#mdc-text-field__input', { type: 'text', id: 'input_' + fieldId,
              value: databind, onchange: true, onkeyup: true, onblur: true,
          }),
          ...(cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-text-field__icon mdc-text-field__icon--trailing')),
          ...[!noLabel && h('label#mdc-floating-label', { class: databind ? 'mdc-floating-label--float-above' : '', for: 'input_' + fieldId},title() )].filter(x=>x),
          ...[!noRipple && h('div#mdc-line-ripple')].filter(x=>x)
        ]),
        h('div#mdc-text-field-helper-line', {}, error || '')
      ]),
    css: `~ .mdc-text-field-helper-line { color: red }`,
    features: [
      field.databindText(), 
      mdcStyle.initDynamic(),
      css( ({},{},{width}) => `>.mdc-text-field { ${jb.ui.propWithUnits('width', width)} }`),
    ]
  })
})

jb.component('editableText.mdcNoLabel', {
  type: 'editable-text.style',
  params: [
    {id: 'width', as: 'number'}
  ],
  impl: editableText.mdcInput({width:'%$width%', noLabel: true})
})

jb.component('editableText.mdcSearch', {
  params: [
    {id: 'width', as: 'number'}
  ],
  description: 'debounced and one way binding',
  type: 'editable-text.style',
  impl: styleWithFeatures(editableText.mdcInput({width:'%$width%', noLabel: true}), feature.icon({icon: 'search', position: 'post'}))
})

