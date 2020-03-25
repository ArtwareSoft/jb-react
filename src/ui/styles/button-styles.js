jb.component('button.href', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('a',{class: raised ? 'raised' : '', href: 'javascript:;', onclick: true }, title),
    css: '{color: grey} .raised { font-weight: bold }'
  })
})

jb.component('button.x', {
  type: 'button.style',
  params: [
    {id: 'size', as: 'number', defaultValue: '21'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('button',{title: state.title, onclick: true },'×'),
    css: `{
            padding: 0;
            cursor: pointer;
            font: %$size%px sans-serif;
            border: none;
            background: transparent;
            color: rgba(0,0,0,0.2);
            text-shadow: 0 1px 0 #fff;
            font-weight: 700;
        }
        :hover { color: rgba(0,0,0,0.5) }`
  })
})

jb.component('button.native', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('button',{class: raised ? 'raised' : '', title, onclick: true },title),
    css: '.raised {font-weight: bold}'
  })
})

jb.component('button.mdc', {
  type: 'button.style',
  params: [
    {id: 'ripple', as: 'boolean', defaultValue: true, type: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('button',{
      class: ['mdc-button',raised && 'raised mdc-button--raised'].filter(x=>x).join(' '), onclick: true},[
      h('div',{class:'mdc-button__ripple'}),
      h('span',{class:'mdc-button__label'},title),
    ]),
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.mdcIcon', {
  type: 'button.style,icon.style',
  params: [
    {id: 'icon', as: 'string', defaultValue: 'bookmark_border'},
    {id: 'raisedIcon', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,{title,icon,raised,raisedIcon},h) => h('button',{
          class: ['mdc-icon-button material-icons',raised && 'raised mdc-icon-button--on'].filter(x=>x).join(' '),
          title, tabIndex: -1, onclick:  true},[
            h('i',{class:'material-icons mdc-icon-button__icon mdc-icon-button__icon--on'}, raisedIcon || icon),
            h('i',{class:'material-icons mdc-icon-button__icon '}, icon),
        ]),
    css: '{ border-radius: 2px; padding: 0; width: 24px; height: 24px;}',
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.mdcChipAction', {
  type: 'button.style',
  params: [

  ],
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
    h('div',{class: 'mdc-chip-set mdc-chip-set--choice'},
      h('div',{ class: ['mdc-chip',raised && 'mdc-chip--selected raised'].filter(x=>x).join(' ') }, [
        h('div',{ class: 'mdc-chip__ripple'}),
        h('span',{ role: 'gridcell'}, h('span', {role: 'button', tabindex: -1, class: 'mdc-chip__text'}, title )),
    ])),
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.mdcChipWithIcons', {
  type: 'button.style,icon.style',
  params: [
    {id: 'leadingIcon', as: 'string', defaultValue: 'code'},
    {id: 'trailingIcon', as: 'string', defaultValue: 'code'}
  ],
  impl: customStyle({
    template: (cmp,{title,raised,leadingIcon,trailingIcon},h) =>
    h('div',{class: 'mdc-chip-set mdc-chip-set--choice'},
      h('div',{ class: ['mdc-chip',raised && 'mdc-chip--selected raised'].filter(x=>x).join(' ') }, [
        h('div',{ class: 'mdc-chip__ripple'}),
        ...(leadingIcon ? [h('i',{class:'material-icons mdc-chip__icon mdc-chip__icon--leading'},leadingIcon)] : []),
        h('span',{ role: 'gridcell'}, h('span', {role: 'button', tabindex: -1, class: 'mdc-chip__text'}, title )),
        ...(trailingIcon ? [h('i',{class:'material-icons mdc-chip__icon mdc-chip__icon--trailing'},trailingIcon)] : []),
    ])),
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.mdcFloatingAction', {
  type: 'button.style,icon.style',
  description: 'fab icon',
  params: [
    {id: 'icon', as: 'string', defaultValue: 'code'},
    {id: 'mini', as: 'boolean', type: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{title,icon,mini,raised},h) =>
      h('button',{ class: ['mdc-fab',raised && 'raised mdc-icon-button--on',mini && 'mdc-fab--mini'].filter(x=>x).join(' ') ,
          title, tabIndex: -1, onclick:  true}, [
            h('div',{ class: 'mdc-fab__ripple'}),
            h('span',{ class: 'mdc-fab__icon material-icons'},icon),
      ]),
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.mdcFloatingWithTitle', {
  type: 'button.style,icon.style',
  params: [
    {id: 'icon', as: 'string', defaultValue: 'code'},
    {id: 'mini', as: 'boolean', type: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{title,icon,mini,raised},h) =>
      h('button',{ class: ['mdc-fab mdc-fab--extended',raised && 'mdc-icon-button--on',mini && 'mdc-fab--mini'].filter(x=>x).join(' ') ,
          title, tabIndex: -1, onclick:  true}, [
        h('div',{ class: 'mdc-fab__ripple'}),
        ...(icon ? [h('span',{ class: 'mdc-fab__icon material-icons'},icon)]: []),
        h('span',{ class: 'mdc-fab__label'},title),
      ]),
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.mdcIcon12', {
  type: 'button.style,icon.style',
  params: [
    {id: 'icon', as: 'string', defaultValue: 'code'}
  ],
  impl: customStyle({
    template: (cmp,{icon,raised},h) => h('i',{class: ['material-icons',raised && 'raised mdc-icon-button--on'].filter(x=>x).join(' ') 
      , onclick: true},icon),
    css: '{ font-size:12px; cursor: pointer }'
  })
})

jb.component('button.mdIcon', {
  type: 'button.style,icon.style',
  params: [
    {id: 'icon', as: 'string', defaultValue: 'Yoga'},
    {id: 'raisedIcon', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,{title,icon,raised,raisedIcon},h) => 
        h('div',{title, onclick: true,
          $html: `<svg height="24" width="24"><path d="${jb.path(jb.frame,['MDIcons',icon])}"/></svg>`}),
    css: '{width: 24px; height: 24px}'
  })
})

jb.component('button.mdcTab', {
  type: 'button.style,icon.style',
  params: [
    {id: 'icon', as: 'string', defaultValue: 'code'},
  ],
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
      h('button',{ class: ['mdc-tab', raised && 'mdc-tab--active'].filter(x=>x).join(' '),tabIndex: -1, role: 'tab', onclick:  true}, [
        h('span',{ class: 'mdc-tab__content'}, h('span',{ class: 'mdc-tab__text-label'},title)),
        h('span',{ class: ['mdc-tab-indicator', raised && 'mdc-tab-indicator--active'].filter(x=>x).join(' ') }, h('span',{ class: 'mdc-tab-indicator__content mdc-tab-indicator__content--underline'})),
        h('span',{ class: 'mdc-tab__ripple'}),
      ]),
    features: mdcStyle.initDynamic()
  })
})
