component('picklist.native', {
  type: 'picklist.style',
  impl: customStyle({
    template: ({},{databind,options},h) => h('select', { onchange: true }, 
      options.map(option=>h('option', {value: option.code, ...(databind == option.code && {selected:  '' }) },option.text))),
    features: [field.databind(), picklist.init()]
  })
})

component('picklist.nativePlus', {
  type: 'picklist.style',
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
  type: 'picklist.style',
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
    Var('color',css.valueOfCssVar('--mdc-theme-text-primary-on-background')),
    css('-webkit-appearance: none; appearance: none; width: 6px; height: 23px; background-repeat: no-repeat; background-position-y: -1px;'),
    css(`background-image: url("data:image/svg+xml;utf8,<svg fill='%$color%' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M17,13 H13 V17 H11 V13 H7 V11 H11 V7 H13 V11 H17 V13 Z'/></svg>");`),
  )
})

component('picklist.radio', {
  type: 'picklist.style',
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

component('picklist.mdcRadio', {
  type: 'picklist.style',
  params: [
    {id: 'text', defaultValue: '%text%', dynamic: true}
  ],
  impl: customStyle({
    template: (cmp,{databind, options, fieldId, text},h) => h('div.mdc-form-field', {},
          options.flatMap((option,i)=> [
              h('div.mdc-radio',{},[
                h('input.mdc-radio__native-control', {
                  type: 'radio', name: fieldId, id: i, ...(databind == option.code && {checked:  '' }), value: option.code, onchange: true
                }),
                h('div.mdc-radio__background',{},[
                  h('div.mdc-radio__outer-circle'),
                  h('div.mdc-radio__inner-circle'),
                ]),
                h('div.mdc-radio__ripple')
              ]),
              h('label',{for: i}, text(cmp.ctx.setData(option))),
    ])),
    features: [field.databind(), picklist.init()]
  })
})

component('picklist.radioVertical', {
  type: 'picklist.style',
  impl: styleWithFeatures(
    picklist.radio(),
    layout.grid({columnSizes: list('30px', 'auto')})
  )
})

component('picklist.mdcSelect', {
  type: 'picklist.style',
  params: [
    {id: 'width', as: 'number', defaultValue: 300},
    {id: 'noLabel', as: 'boolean', type: 'boolean'},
    {id: 'noRipple', as: 'boolean', type: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{databind,options,title,noLabel,noRipple,hasEmptyOption},h) => h('div.mdc-select',{}, [
      h('div.mdc-select__anchor',{},[
          ...(cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'pre').map(h).map(vdom=>vdom.addClass('mdc-text-field__icon mdc-text-field__icon--leading')),
          h('i.mdc-select__dropdown-icon', {}),
          h('div.mdc-select__selected-text',{'aria-required': !hasEmptyOption},databind),
          ...[!noLabel && h('label.mdc-floating-label',{ class: databind ? 'mdc-floating-label--float-above' : ''},title() )].filter(x=>x),
          ...[!noRipple && h('div.mdc-line-ripple')].filter(x=>x)
      ]),
      h('div.mdc-select__menu mdc-menu mdc-menu-surface demo-width-class',{},[
        h('ul.mdc-list',{},options.map(option=>h('li.mdc-list-item',{'data-value': option.code, 
          class: option.code == databind ? 'mdc-list-item--selected': ''},    
          h('span.mdc-list-item__text', {}, option.text))))
      ])
    ]),
    features: [
      field.databind(),
      picklist.init(),
      mdcStyle.initDynamic(),
      css(({},{},{width}) => `>* { ${jb.ui.propWithUnits('width', width)} }`),
      frontEnd.flow(
        source.callbag(({},{cmp}) => jb.callbag.create(obs=> 
          cmp.mdc_comps.forEach(({mdc_cmp}) => mdc_cmp.listen('MDCSelect:change', () => obs(mdc_cmp.value))))),
        rx.takeUntil('%$cmp/destroyed%'),
        sink.BEMethod('writeFieldValue','%%')
      ),  
      css(
        `~.mdc-select:not(.mdc-select--disabled) .mdc-select__selected-text { color: var(--mdc-theme-text-primary-on-background); background: var(--mdc-theme-background); border-color: var(--jb-menubar-inactive-bg); }
        ~.mdc-select:not(.mdc-select--disabled) .mdc-floating-label { color: var(--mdc-theme-primary) }`
      )
    ]
  })
})

component('picklist.labelList', {
  type: 'picklist.style',
  params: [
    {id: 'labelStyle', type: 'text.style', dynamic: true, defaultValue: text.span()},
    {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.ulLi()},
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
      controls: text({text: '%text%', style: call('labelStyle')}),
      style: call('itemlistStyle'),
      features: [
        itemlist.selection({
          databind: '%$picklistModel/databind%',
          selectedToDatabind: '%code%',
          databindToSelected: (ctx,{$props}) => $props.items.find(o=>o.code == ctx.data),
          cssForSelected: '%$cssForSelected%'
        }),
        itemlist.keyboardSelection(),
        watchRef('%$picklistModel/databind%')
      ]
    }),
    'picklistModel'
  )
})

component('picklist.buttonList', {
  type: 'picklist.style',
  params: [
    {id: 'buttonStyle', type: 'button.style', dynamic: true, defaultValue: button.mdc()},
    {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.horizontal()},
    {id: 'cssForSelected', as: 'string', description: 'e.g. background: red;color: blue;font-weight: bold;', defaultValue: 'background: #bbb; color: #fff'}
  ],
  impl: styleByControl(
    itemlist({
      items: '%$picklistModel/options%',
      controls: button({title: '%text%', style: call('buttonStyle')}),
      style: call('itemlistStyle'),
      features: [
          itemlist.selection({
          databind: '%$picklistModel/databind%',
          selectedToDatabind: '%code%',
          databindToSelected: (ctx,{$props}) => $props.items.find(o=>o.code == ctx.data),
          cssForSelected: '%$cssForSelected%'
        }),
        watchRef('%$picklistModel/databind%')
      ]
    }),
    'picklistModel'
  )
})

component('picklist.hyperlinks', {
  type: 'picklist.style',
  impl: picklist.buttonList({
    buttonStyle: button.href(),
    itemlistStyle: itemlist.horizontal('10'),
    cssForSelected: '>a { color: red }'
  })
})

component('picklist.groups', {
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,{databind,hasEmptyOption,groups},h) => h('select', { onchange: true },
          (hasEmptyOption ? [h('option',{value:''},'')] : []).concat(
            groups.map(group=>h('optgroup',{label: group.text},
              group.options.map(
                option=>h('option',{value: option.code, ...(databind == option.code && {selected:  '' }) },option.text))))
      )),
    features: [field.databind(), picklist.init(),  picklist.initGroups()]
  })
})
