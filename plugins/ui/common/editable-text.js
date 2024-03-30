component('editableText', {
  type: 'control',
  category: 'input:100,common:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'updateOnBlur', as: 'boolean', type: 'boolean'},
    {id: 'style', type: 'editable-text-style', defaultValue: editableText.input(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('editableText.input', {
  type: 'editable-text-style',
  impl: customStyle({
    template: (cmp,{databind},h) => h('input', {value: databind, onchange: true, onkeyup: true, onblur: true }),
    features: field.databindText()
  })
})

component('textarea.enrichUserEvent', {
  type: 'feature',
  impl: frontEnd.enrichUserEvent((ctx,{cmp,el}) => {
      if (el instanceof jb.ui.VNode)
        return { selectionStart: jb.path(el, '_component.state.selectionRange.from') }
      return el && {
          outerHeight: jb.ui.outerHeight(el), 
          outerWidth: jb.ui.outerWidth(el), 
          clientRect: jb.ui.clientRect(el),
          text: el.value,
          selectionStart: jb.tgpTextEditor.offsetToLineCol(el.value,el.selectionStart)
    }
  })
})