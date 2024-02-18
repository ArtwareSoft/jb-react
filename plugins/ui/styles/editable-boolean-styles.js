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

component('editableBoolean.mdcXV', {
  type: 'editable-boolean-style',
  description: 'two icons',
  params: [
    {id: 'yesIcon', as: 'string', mandatory: true, defaultValue: 'check'},
    {id: 'noIcon', as: 'string', mandatory: true, defaultValue: 'close'}
  ],
  impl: customStyle({
    template: ({},{title,databind,yesIcon,noIcon},h) => h('button',{
          class: ['mdc-icon-button material-icons',databind && 'raised mdc-icon-button--on'].filter(x=>x).join(' '),
          title: title(), tabIndex: -1, onclick: 'toggle', onkeyup: 'toggleByKey'},[
            h('i',{class:'material-icons mdc-icon-button__icon mdc-icon-button__icon--on'}, yesIcon),
            h('i',{class:'material-icons mdc-icon-button__icon '}, noIcon),
        ]),
    css: '{ border-radius: 2px; padding: 0; width: 24px; height: 24px;}',
    features: [editableBoolean.initToggle(), field.databind(), mdcStyle.initDynamic()]
  })
})

component('editableBoolean.buttonXV', {
  type: 'editable-boolean-style',
  description: 'two icons',
  params: [
    {id: 'yesIcon', type: 'icon', mandatory: true, defaultValue: icon('check')},
    {id: 'noIcon', type: 'icon', mandatory: true, defaultValue: icon('close')},
    {id: 'buttonStyle', type: 'button-style', dynamic: true, mandatory: true, defaultValue: button.mdcFloatingAction()}
  ],
  impl: styleByControl({
    control: button({
      title: If({
        condition: '%$editableBooleanModel/databind()%',
        then: '%$editableBooleanModel/textForTrue()%',
        Else: '%$editableBooleanModel/textForFalse()%'
      }),
      action: runActions(
        writeValue('%$editableBooleanModel/databind()%', typeAdapter('boolean<>', not('%$editableBooleanModel/databind()%'))),
        refreshIfNotWatchable('%$editableBooleanModel/databind()%')
      ),
      style: call('buttonStyle'),
      features: [
        (ctx,{editableBooleanModel},{yesIcon,noIcon}) => {
            const icon = jb.val(editableBooleanModel.databind()) ? yesIcon : noIcon
            const title = jb.val(editableBooleanModel.databind()) ? editableBooleanModel.textForTrue() : editableBooleanModel.textForFalse()
            return ctx.run({$: 'feature.icon', ...icon, title})
          },
        watchRef('%$editableBooleanModel/databind()%', { allowSelfRefresh: true, strongRefresh: true })
      ]
    }),
    modelVar: 'editableBooleanModel'
  })
})

component('editableBoolean.mdcSlideToggle', {
  type: 'editable-boolean-style',
  params: [
    {id: 'width', as: 'string', defaultValue: 80}
  ],
  impl: customStyle({
    template: ({},{databind,fieldId,toggleText},h) => h('div.mdc-switch',{class: databind ? 'mdc-switch--checked': '' },[
      h('div.mdc-switch__track'),
      h('div.mdc-switch__thumb-underlay',{},
        h('div.mdc-switch__thumb',{},
          h('input.mdc-switch__native-control', { type: 'checkbox', role: 'switch', id: 'switch_' + fieldId, 
            'aria-checked': 'false', ...(databind && {checked: '', 'aria-checked' : 'true' }), 
            onchange: 'toggle', onkeyup: 'toggleByKey' }
      ))),
      h('label',{for: 'switch_' + fieldId},toggleText)
    ]),
    css: ctx => jb.ui.propWithUnits('width',ctx.params.width),
    features: [editableBoolean.initToggle(), field.databind(), mdcStyle.initDynamic()]
  })
})

component('editableBoolean.mdcCheckBox', {
  type: 'editable-boolean-style',
  params: [
    {id: 'width', as: 'string', defaultValue: 80}
  ],
  impl: customStyle({
    template: (cmp,{databind,fieldId,title},h) => h('div.mdc-form-field', {},[
        h('div.mdc-checkbox',{}, [
          h('input.mdc-checkbox__native-control', { type: 'checkbox', id: 'checkbox_' + fieldId,
            ...(databind && {checked: ''}), onchange: 'toggle', onkeyup: 'toggleByKey' }),
          h('div.mdc-checkbox__background',{}, [
            h('svg.mdc-checkbox__checkmark',{viewBox: '0 0 24 24'},
              h('path.mdc-checkbox__checkmark-path', { fill: 'none', d: 'M1.73,12.91 8.1,19.28 22.79,4.59' }
            )),
            h('div.mdc-checkbox__mixedmark')
          ]),
          h('div.mdc-checkbox__ripple')
        ]),
        h('label',{for: 'checkbox_' + fieldId},title())
    ]),
    css: ctx => jb.ui.propWithUnits('width',ctx.params.width),
    features: [
      editableBoolean.initToggle(),
      field.databind(),
      css('~ .mdc-checkbox__checkmark { top: -9px}')
    ]
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