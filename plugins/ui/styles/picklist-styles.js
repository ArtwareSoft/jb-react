component('picklist.native', {
  type: 'picklist-style',
  impl: select.native()
})

component('picklist.nativePlus', {
  type: 'picklist-style',
  impl: customStyle({
    template: ({},{databind,options},h) => h('select', { onchange: true }, 
      options.map(option=>h('option', {value: option.code, ...(databind == option.code && {selected:  '' }) } ,option.text))),
    css: `
{ display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857; 
  color: var(--jb-menu-fg); background: var(--jb-menu-bg); 
  background-image: none; border: 1px solid var(--jb-menubar-inactive-bg); border-radius: 4px; box-shadow: inset 0 1px 1px var(--jb-dropdown-shadow);
}
:focus { border-color: border-color: var(--jb-menubar-active-bg); outline: 0; box-shadow: inset 0 1px 1px var(--jb-dropdown-shadow); }
::input-placeholder { color: var(--jb-menu-fg) }`,
    features: [field.databind(), picklist.init()]
  })
})

component('picklist.nativeMdLookOpen', {
  type: 'picklist-style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{}, [
        h('input', { type: 'text', value: state.databind, list: 'list_' + cmp.ctx.id, onchange: true }),
        h('datalist', {id: 'list_' + cmp.ctx.id}, state.options.map(option=>h('option',{},option.text)))
    ]),
    css: `>input {  appearance: none; -webkit-appearance: none;
  padding: 6px 0;
  width: 100%;
  color: rgba(0,0,0, 0.82);
  border: none;
  border-bottom: 1px solid var(--jb-menubar-inactive-bg);
  color: var(--mdc-theme-text-primary-on-background); background: var(--mdc-theme-background);
}
  { position: relative;}
  >input:focus { border-color: var(--jb-menubar-active-bg); border-width: 2px}

  :after1 { position: absolute;
        top: 0.75em;
        right: 0.5em;
        /* Styling the down arrow */
        width: 0;
        height: 0;
        padding: 0;
        content: '';
        border-left: .25em solid transparent;
        border-right: .25em solid transparent;
        border-top: .375em solid var(--mdc-theme-text-primary-on-background);
        pointer-events: none; }`,
    features: [field.databind(), picklist.init()]
  })
})

component('picklist.plusIcon', {
  type: 'feature',
  categories: 'feature:0,picklist:50',
  impl: features(
    Var('color', css.valueOfCssVar('--mdc-theme-text-primary-on-background')),
    css(
      '-webkit-appearance: none; appearance: none; width: 6px; height: 23px; background-repeat: no-repeat; background-position-y: -1px;'
    ),
    css(
      `background-image: url("data:image/svg+xml;utf8,<svg fill='%$color%' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M17,13 H13 V17 H11 V13 H7 V11 H11 V7 H13 V11 H17 V13 Z'/></svg>");`
    )
  )
})

component('picklist.radio', {
  type: 'picklist-style',
  params: [
    {id: 'radioCss', as: 'string', defaultValue: '', description: 'e.g. display: none'},
    {id: 'text', defaultValue: '%text%', dynamic: true}
  ],
  impl: customStyle({
    template: (cmp,{databind, options, fieldId, text},h) => h('div', {},
          options.flatMap((option,i)=> [h('input', {
              type: 'radio', name: fieldId, id: i, ...(databind == option.code && {checked:  '' }), value: option.code, onchange: true
            }), h('label',{for: i}, text(cmp.ctx.setData(option))) ] )),
    css: '>input { %$radioCss% }',
    features: [field.databind(), picklist.init()]
  })
})

component('picklist.radioVertical', {
  type: 'picklist-style',
  impl: styleWithFeatures(picklist.radio(), { features: layout.grid(list('30px','auto')) })
})

component('picklist.buttonList', {
  type: 'picklist-style',
  params: [
    {id: 'buttonStyle', type: 'button-style', dynamic: true, defaultValue: button.mdc()},
    {id: 'itemlistStyle', type: 'itemlist-style', dynamic: true, defaultValue: itemlist.horizontal()},
    {id: 'cssForSelected', as: 'string', description: 'e.g. background: red;color: blue;font-weight: bold;', defaultValue: 'background: #bbb; color: #fff'}
  ],
  impl: styleByControl({
    control: itemlist({
      items: '%$picklistModel/options%',
      controls: button('%text%', { style: call('buttonStyle') }),
      style: call('itemlistStyle'),
      features: [
        itemlist.selection('%$picklistModel/databind%', '%code%', {
          databindToSelected: (ctx,{$props}) => $props.items.find(o=>o.code == ctx.data),
          cssForSelected: '%$cssForSelected%'
        }),
        watchRef('%$picklistModel/databind%')
      ]
    }),
    modelVar: 'picklistModel'
  })
})

component('picklist.hyperlinks', {
  type: 'picklist-style',
  impl: picklist.buttonList(button.href(), itemlist.horizontal('10'), {
    cssForSelected: '>a { color: red }'
  })
})

component('picklist.groups', {
  type: 'picklist-style',
  impl: customStyle({
    template: (cmp,{databind,hasEmptyOption,groups},h) => h('select', { onchange: true },
          (hasEmptyOption ? [h('option',{value:''},'')] : []).concat(
            groups.map(group=>h('optgroup',{label: group.text},
              group.options.map(
                option=>h('option',{value: option.code, ...(databind == option.code && {selected:  '' }) },option.text))))
      )),
    features: [field.databind(), picklist.init(), picklist.initGroups()]
  })
})

