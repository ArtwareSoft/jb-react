jb.component('picklist.native', { /* picklist.native */
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,state,h) => h('select', { value: state.databind, onchange: true },
          state.options.map(option=>h('option',{value: option.code},option.text))
        ),
    css: `
{ display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857; color: #555555; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; }
:focus { border-color: #66afe9; outline: 0; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }
::-webkit-input-placeholder { color: #999; }`,
    features: field.databind()
  })
})

jb.component('picklist.radio', {
  type: 'picklist.style',
  params:[
    { id: 'radioCss', as: 'string', defaultValue: '', description: 'e.g. display: none' },
    { id: 'text', defaultValue: '%text%', dynamic: true },
  ],
  impl: customStyle({
    template: (cmp,{databind, options, fieldId, text},h) => h('div', {},
          options.flatMap((option,i)=> [h('input', {
              type: 'radio', name: fieldId, id: i, checked: databind === option.code, value: option.code, onchange: true
            }), h('label',{for: i}, text(cmp.ctx.setData(option))) ] )),
    css: `>input { %$radioCss% }`,
    features: field.databind()
  })
})

jb.component('picklist.radio-vertical', {
  type: 'picklist.style',
  impl: styleWithFeatures(
    picklist.radio(),
    layout.grid({columnSizes: list('30px', 'auto')})
  )
})

jb.component('picklist.native-md-look-open', { /* picklist.nativeMdLookOpen */
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{}, [
        h('input', { type: 'text', value: state.databind, list: 'list_' + cmp.ctx.id, onchange: true }),
        h('datalist', {id: 'list_' + cmp.ctx.id}, state.options.map(option=>h('option',{},option.text)))
    ]),
    css: `>input {  appearance: none; -webkit-appearance: none; font-family: inherit;
  background-color: transparent;
  padding: 6px 0;
  font-size: 14px;
  width: 100%;
  color: rgba(0,0,0, 0.82);
  border: none;
  border-bottom: 1px solid rgba(0,0,0, 0.12); }

  {
    font-family: 'Roboto','Helvetica','Arial',sans-serif;
    position: relative;
  }
  >input:focus { border-color: #3F51B5; border-width: 2px}

  :after { position: absolute;
        top: 0.75em;
        right: 0.5em;
        /* Styling the down arrow */
        width: 0;
        height: 0;
        padding: 0;
        content: '';
        border-left: .25em solid transparent;
        border-right: .25em solid transparent;
        border-top: .375em solid rgba(0,0,0, 0.12);
        pointer-events: none; }`,
    features: field.databind()
  })
})

jb.component('picklist.native-md-look', { /* picklist.nativeMdLook */
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{},h('select',
      { value: state.databind, onchange: true },
          state.options.map(option=>h('option',{value: option.code},option.text)))),
    css: `>select {  appearance: none; -webkit-appearance: none; font-family: inherit;
  background-color: transparent;
  padding: 6px 0;
  font-size: 14px;
  width: 100%;
  color: rgba(0,0,0, 0.82);
  border: none;
  border-bottom: 1px solid rgba(0,0,0, 0.12); }

  {
    font-family: 'Roboto','Helvetica','Arial',sans-serif;
    position: relative;
  }
  >select:focus { border-color: #3F51B5; border-width: 2px}

  :after { position: absolute;
        top: 0.75em;
        right: 0.5em;
        /* Styling the down arrow */
        width: 0;
        height: 0;
        padding: 0;
        content: '';
        border-left: .25em solid transparent;
        border-right: .25em solid transparent;
        border-top: .375em solid rgba(0,0,0, 0.12);
        pointer-events: none; }`,
    features: field.databind()
  })
})

jb.component('picklist.label-list', { /* picklist.labelList */
  type: 'picklist.style',
  params: [
    {id: 'labelStyle', type: 'label.style', dynamic: true, defaultValue: label.span()},
    {
      id: 'itemlistStyle',
      type: 'itemlist.style',
      dynamic: true,
      defaultValue: itemlist.ulLi()
    },
    {
      id: 'cssForSelected',
      as: 'string',
      description: 'e.g. background: red OR >a { color: red }',
      defaultValue: 'background: #bbb; color: #fff'
    }
  ],
  impl: styleByControl(
    itemlist({
      items: '%$picklistModel/options%',
      controls: label({text: '%text%', style: call('labelStyle')}),
      style: call('itemlistStyle'),
      features: itemlist.selection({
        databind: '%$picklistModel/databind%',
        selectedToDatabind: '%code%',
        databindToSelected: ctx => ctx.vars.items.filter(o=>o.code == ctx.data)[0],
        cssForSelected: '%$cssForSelected%'
      })
    }),
    'picklistModel'
  )
})

jb.component('picklist.button-list', { /* picklist.buttonList */
  type: 'picklist.style',
  params: [
    {
      id: 'buttonStyle',
      type: 'button.style',
      dynamic: true,
      defaultValue: button.mdc()
    },
    {
      id: 'itemlistStyle',
      type: 'itemlist.style',
      dynamic: true,
      defaultValue: itemlist.horizontal()
    },
    {
      id: 'cssForSelected',
      as: 'string',
      description: 'e.g. background: red;color: blue;font-weight: bold;',
      defaultValue: 'background: #bbb; color: #fff'
    }
  ],
  impl: styleByControl(
    itemlist({
      items: '%$picklistModel/options%',
      controls: button({title: '%text%', style: call('buttonStyle')}),
      style: call('itemlistStyle'),
      features: itemlist.selection({
        databind: '%$picklistModel/databind%',
        selectedToDatabind: '%code%',
        databindToSelected: ctx => ctx.vars.items.filter(o=>o.code == ctx.data)[0],
        cssForSelected: '%$cssForSelected%'
      })
    }),
    'picklistModel'
  )
})

jb.component('picklist.hyperlinks', { /* hyperlinks */
  type: 'picklist.style',
  impl: picklist.buttonList({
    buttonStyle: button.href(),
    itemlistStyle: itemlist.horizontal('10'),
    cssForSelected: '>a { color: red }'
  })
})

jb.component('picklist.groups', { /* picklist.groups */
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,state,h) => h('select', { value: state.databind, onchange: true },
          (state.hasEmptyOption ? [h('option',{value:''},'')] : []).concat(
            state.groups.map(group=>h('optgroup',{label: group.text},
              group.options.map(option=>h('option',{value: option.code},option.text))
              ))
      )),
    css: `
 { display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857; color: #555555; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; }
select:focus { border-color: #66afe9; outline: 0; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }
select::-webkit-input-placeholder { color: #999; }`,
    features: field.databind()
  })
})
