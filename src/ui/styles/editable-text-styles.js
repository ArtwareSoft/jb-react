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
    {id: 'width', as: 'number'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{class: ['mdc-text-field',state.error ? 'is-invalid' : ''].join(' ') },[
        h('input', { type: 'text', class: 'mdc-text-field__input', id: 'input_' + state.fieldId,
            value: state.databind, onchange: true, onkeyup: true, onblur: true,
        }),
        h('label',{class: 'mdc-floating-label', for: 'input_' + state.fieldId},state.title),
        h('div',{class: 'mdc-line-ripple' }),
        h('span',{class: 'mdc-text-field-helper-text' }, state.error || '')
      ]),
    css: '{ {?width: %$width%px?} }',
    features: [field.databindText(), mdcStyle.initDynamic()]
  })
})

jb.component('editableText.mdcNoLabel', {
  type: 'editable-text.style',
  params: [
    {id: 'width', as: 'number'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{class: 'mdc-text-field mdc-text-field--no-label'},
        h('input', { class: 'mdc-text-field__input', type: 'text', value: state.databind, onchange: true, onkeyup: true, onblur: true }),
        h('div',{class: 'mdc-line-ripple' }),
        ),
    css: '{ padding: 0 !important; {?width: %$width%px?} } :focus { border-color: #3F51B5; border-width: 2px}',
    features: [field.databindText(), mdcStyle.initDynamic()]
  })
})

jb.component('editableText.mdcSearch', {
  description: 'debounced and one way binding',
  type: 'editable-text.style',
  impl: customStyle({
    template: (cmp,{databind, fieldId, title},h) => h('div',{class:'mdc-text-field'},[
        h('input', { class: 'mdc-text-field__input', id: 'search_' + fieldId, type: 'text',
            value: databind, onchange: true, onkeyup: true, onblur: true,
        }),
        h('label',{class: 'mdc-floating-label mdc-floating-label--float-above', for: 'search_' + fieldId}, databind ? '' : title)
      ]),
    features: [field.databindText(), mdcStyle.initDynamic()]
  })
})

jb.component('editableText.expandable', {
  description: 'label that changes to editable class on double click',
  type: 'editable-text.style',
  params: [
    {id: 'buttonFeatures', type: 'feature[]', flattenArray: true, dynamic: true},
    {id: 'editableFeatures', type: 'feature[]', flattenArray: true, dynamic: true},
    {id: 'buttonStyle', type: 'button.style', dynamic: true, defaultValue: button.href()},
    {id: 'editableStyle', type: 'editable-text.style', dynamic: true, defaultValue: editableText.input()},
    {id: 'onToggle', type: 'action', dynamic: true}
  ],
  impl: styleByControl(
    group({
      controls: [
        editableText({
          databind: '%$editableTextModel/databind%',
          updateOnBlur: true,
          style: call('editableStyle'),
          features: [
            watchRef('%$editable%'),
            hidden('%$editable%'),
            (ctx,{expandableContext}) => ({
              afterViewInit: cmp => {
                const elem = cmp.base.matches('input,textarea') ? cmp.base : cmp.base.querySelector('input,textarea')
                if (elem) {
                  elem.onblur = () => cmp.ctx.run(runActions(
                      toggleBooleanValue('%$editable%'),
                      (ctx,vars,{onToggle}) => onToggle(ctx)
                   ))
                }
                expandableContext.regainFocus = () =>
                  jb.delay(1).then(() => jb.ui.focus(elem, 'editable-text.expandable', ctx))
              }
            }),
            (ctx,vars,{editableFeatures}) => editableFeatures(ctx)
          ]
        }),
        button({
          title: '%$editableTextModel/databind%',
          action: runActions(
            toggleBooleanValue('%$editable%'),
            (ctx,{expandableContext}) => expandableContext.regainFocus(),
            (ctx,vars,{onToggle}) => onToggle(ctx)
          ),
          style: call('buttonStyle'),
          features: [
            watchRef('%$editable%'),
            hidden(not('%$editable%')),
            (ctx,vars,{buttonFeatures}) => buttonFeatures(ctx)
          ]
        })
      ],
      features: [
        variable({name: 'editable', watchable: true}),
        variable({name: 'expandableContext', value: obj()})
      ]
    }),
    'editableTextModel'
  )
})
