jb.ns('editableBoolean')

jb.component('editable-boolean', { /* editableBoolean */
  type: 'control',
  category: 'input:20',
  params: [
    {id: 'databind', as: 'ref', type: 'boolean', mandaroy: true, dynamic: true, aa: 5},
    {id: 'style', type: 'editable-boolean.style', defaultValue: editableBoolean.checkbox(), dynamic: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'textForTrue', as: 'string', defaultValue: 'yes', dynamic: true},
    {id: 'textForFalse', as: 'string', defaultValue: 'no', dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, features(
    calcProp('text',data.if('%$$model/databind%','%$$model/textForTrue%','%$$model/textForFalse%' )),
    defHandler('toggle', writeValue('%$$model/databind%',not('%$$model/databind%'))),
    defHandler('setChecked', writeValue('%$$model/databind%','true')),
		))
})

jb.component('editable-boolean.keyboard-support', { /* editableBoolean.keyboardSupport */
  type: 'feature',
  impl: feature.onEvent({
    event: 'click',
    action: action.if(
      () => event.keyCode == 37 || event.keyCode == 39,
      writeValue('%$$model/databind%', not('%$$model/databind%'))
    )
  })
})
