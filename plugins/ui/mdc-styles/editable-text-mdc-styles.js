using('ui-common')

component('editableText.mdcInput', {
  type: 'editable-text-style',
  moreTypes: 'editable-number.style<>',
  params: [
    {id: 'width', as: 'number'},
    {id: 'noLabel', as: 'boolean', type: 'boolean'},
    {id: 'noRipple', as: 'boolean', type: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{databind,fieldId,title,noLabel,noRipple,error},h) => h('div',{}, [
      h('div.mdc-text-field',{class: [ 
          (cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'pre')[0] && 'mdc-text-field--with-leading-icon',
          (cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'post')[0] && 'mdc-text-field--with-trailing-icon'
        ].filter(x=>x).join(' ') },[
          ...(cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'pre').map(h).map(vdom=>vdom.addClass('mdc-text-field__icon mdc-text-field__icon--leading')),
          h('input.mdc-text-field__input', { type: 'text', id: 'input_' + fieldId, name: 'input_' + fieldId,
              value: databind, onchange: true, onkeyup: true, onblur: true, autocomplete: 'off'
          }),
          ...(cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-text-field__icon mdc-text-field__icon--trailing')),
          ...[!noLabel && h('label.mdc-floating-label', { class: databind ? 'mdc-floating-label--float-above' : '', for: 'input_' + fieldId},title() )].filter(x=>x),
          ...[!noRipple && h('div.mdc-line-ripple')].filter(x=>x)
        ]),
        h('div.mdc-text-field-helper-line', {}, error || '')
      ]),
    css: `~ .mdc-text-field-helper-line { color: var(--jb-error-fg) }
    ~ .mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__input { color: var(--mdc-theme-text-primary-on-background); background: var(--mdc-theme-background); border-color: var(--jb-menubar-inactive-bg); }
    ~ .mdc-text-field--focused:not(.mdc-text-field--disabled) .mdc-floating-label { color: var(--mdc-theme-primary) }
    `,
    features: [
      field.databindText(),
      mdcStyle.initDynamic(),
      css(({},{},{width}) => `>.mdc-text-field { ${jb.ui.propWithUnits('width', width)} }`)
    ]
  })
})

component('editableText.mdcNoLabel', {
  type: 'editable-text-style',
  params: [
    {id: 'width', as: 'number'}
  ],
  impl: editableText.mdcInput('%$width%', true)
})

component('editableText.mdcSearch', {
  params: [
    {id: 'width', as: 'number'}
  ],
  description: 'debounced and one way binding',
  type: 'editable-text-style',
  impl: styleWithFeatures(editableText.mdcInput('%$width%', true), {
    features: feature.icon('search', { position: 'post' })
  })
})
