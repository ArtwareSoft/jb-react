jb.ns('editableBoolean')

jb.component('editableBoolean', {
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
    watchRef({ref: '%$$model/databind%', allowSelfRefresh: true}),
    defHandler('toggle', ctx => ctx.run(writeValue('%$$model/databind%',not('%$$model/databind%')))),
    defHandler('toggleByKey', (ctx,{ev}) => ev.keyCode != 27 && ctx.run(writeValue('%$$model/databind%',not('%$$model/databind%')))),
    defHandler('setChecked', writeValue('%$$model/databind%','true')),
		))
})
