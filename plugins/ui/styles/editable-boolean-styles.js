using('ui-misc')

component('editableBoolean.checkbox', {
  type: 'editable-boolean-style',
  impl: customStyle({
    template: ({},{databind},h) => h('input', { type: 'checkbox', ...(databind && {checked: ''}) , 
      onclick: 'toggle', onchange: 'toggle', onkeyup: 'toggleByKey'  }),
    features: [editableBoolean.initToggle(), field.databind()]
  })
})

component('editableBoolean.checkboxWithLabel', {
  type: 'editable-boolean-style',
  impl: customStyle({
    template: ({},{title,databind,fieldId},h) => h('div',{},[ 
      h('input', { type: 'checkbox', ...(databind && {checked: ''}), id: "switch_"+fieldId, onchange: 'toggle', onkeyup: 'toggleByKey' }),
      h('label',{for: "switch_"+fieldId },title())
     ]),
    features: [editableBoolean.initToggle(), field.databind()]
  })
})

component('editableBoolean.expandCollapseWithUnicodeChars', {
  type: 'editable-boolean-style',
  params: [
    {id: 'toExpandSign', as: 'string', defaultValue: '⯈'},
    {id: 'toCollapseSign', as: 'string', defaultValue: '⯆'}
  ],
  impl: customStyle({
    template: ({},{databind,toExpandSign,toCollapseSign},h) => 
      h('span',{ onclick: 'toggle' }, databind ? toCollapseSign : toExpandSign),
    css: '{cursor: pointer; opacity: 0.6; user-select: none}',
    features: [editableBoolean.initToggle(), field.databind()]
  })
})

component('editableBoolean.expandCollapse', {
  type: 'editable-boolean-style',
  impl: customStyle({
    template: ({},{databind},h) => h('i',{class:'material-icons noselect', onclick: 'toggle' },
      databind ? 'keyboard_arrow_down' : 'keyboard_arrow_right'),
    css: '{ font-size:16px; cursor: pointer }',
    features: [editableBoolean.initToggle(), field.databind()]
  })
})

component('editableBoolean.picklist', {
  type: 'editable-boolean-style',
  params: [
    {id: 'picklistStyle', type: 'picklist-style', defaultValue: select.native(), dynamic: true}
  ],
  impl: styleByControl({
    control: picklist({
      databind: '%$editableBooleanModel/databind%',
      options: typeAdapter('data<>' ,list(
        obj(prop('text', '%$editableBooleanModel/textForTrue()%'), prop('code', true)),
        obj(prop('text', '%$editableBooleanModel/textForFalse()%'), prop('code', false))
      )),
      style: call('picklistStyle'),
      features: picklist.onChange(writeValue('%$editableBooleanModel/databind()%', If('%%==true', true, false)))
    }),
    modelVar: 'editableBooleanModel'
  })
})