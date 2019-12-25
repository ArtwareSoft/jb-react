jb.component('editable-text.input', { /* editableText.input */
  type: 'editable-text.style',
  impl: customStyle({
    template: (cmp,state,h) => h('input', {
        value: state.model, onchange: true, onkeyup: true, onblur: true }),
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
        value: state.model, onchange: true, onkeyup: true, onblur: true  }),
    features: field.databindText(0, '%$oneWay%')
  })
})

jb.component('editable-text.mdl-input', { /* editableText.mdlInput */
  type: 'editable-text.style,editable-number.style',
  params: [
    {id: 'width', as: 'number'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{class: ['mdl-textfield','mdl-js-textfield','mdl-textfield--floating-label',state.error ? 'is-invalid' : ''].join(' ') },[
        h('input', { class: 'mdl-textfield__input', id: 'input_' + state.fieldId, type: 'text',
            value: state.model, onchange: true, onkeyup: true, onblur: true,
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
            value: state.model, onchange: true, onkeyup: true, onblur: true,
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
            value: model, onchange: true, onkeyup: true, onblur: true,
        }),
        h('label',{class: 'mdl-textfield__label', for: 'search_' + fieldId}, model ? '' : title)
      ]),
    features: [field.databindText(), mdlStyle.initDynamic()]
  })
})

jb.component('editable-text.expandable', {
  description: 'label that changes to editable class on double click',
  type: 'editable-text.style',
  params: [
    { id: 'buttonFeatures', type: 'feature[]', flattenArray: true, dynamic: true},
    { id: 'editableFeatures', type: 'feature[]', flattenArray: true, dynamic: true},
    { id: 'buttonStyle', type: 'button.style' , dynamic: true, defaultValue: button.href() },
    { id: 'editableStyle', type: 'editable-text.style', dynamic: true , defaultValue: editableText.input() },
    { id: 'onToggle', type: 'action' , dynamic: true  }
  ], 
  impl: styleByControl(group({
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
            (ctx,vars,{editableFeatures}) => editableFeatures(ctx),
          ]
      }),
      button({
        title: '%$editableTextModel/databind%',
        style: call('buttonStyle'),
        action: runActions(
          toggleBooleanValue('%$editable%'),
          (ctx,{expandableContext}) => expandableContext.regainFocus(),
          (ctx,vars,{onToggle}) => onToggle(ctx)
        ),
        features: [
          watchRef('%$editable%'),
          hidden(not('%$editable%')),
          (ctx,vars,{buttonFeatures}) => buttonFeatures(ctx)
        ],
      })
    ],
    features: [
      variable({name: 'editable', watchable: true}),
      variable({name: 'expandableContext', value: obj() }),
    ]
  })
  ,
    'editableTextModel'
  )
})
