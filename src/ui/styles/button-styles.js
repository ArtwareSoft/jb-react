jb.ui.chooseIconWithRaised = (icons,raised) => {
  if (!icons) return []
  const raisedIcon = icons.filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'raised')[0]
  const otherIcons = (raisedIcon && icons.filter(cmp=>cmp && cmp.ctx.vars.$model.position != 'raised') || icons)
    .filter(cmp=>cmp && cmp.ctx.vars.$model.position != 'post')
  if (raised) 
    return raisedIcon ? [raisedIcon] : otherIcons
  return otherIcons
}

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
    {id: 'noRipple', as: 'boolean'},
    {id: 'noTitle', as: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{title,raised,noRipple,noTitle},h) => h('button',{
      class: ['mdc-button',raised && 'raised mdc-button--raised'].filter(x=>x).join(' '), onclick: true},[
      ...[!noRipple && h('div',{class:'mdc-button__ripple'})],
      ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-button__icon')),
      ...[!noTitle && h('span',{class:'mdc-button__label'},title)],
      ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-button__icon')),
    ]),
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.mdcChipAction', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
    h('div#mdc-chip-set mdc-chip-set--filter', {onclick: true},
      h('div#mdc-chip',{ class: [raised && 'mdc-chip--selected raised'].filter(x=>x).join(' ') }, [
        h('div#mdc-chip__ripple'),
        ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-chip__icon mdc-chip__icon--leading')),
        h('span',{ role: 'gridcell'}, h('span', {role: 'button', tabindex: -1, class: 'mdc-chip__text'}, title )),
        ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-chip__icon mdc-chip__icon--trailing')),
    ])),
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.plainIcon', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => 
      jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=> vdom.setAttribute('title',vdom.getAttribute('title') || title))[0]
  })
})

jb.component('button.mdcIcon', {
  type: 'button.style,icon.style',
  params: [
    {id: 'icon', type: 'icon' },
    {id: 'buttonSize', as: 'number', defaultValue: 40, description: 'button size is larger than the icon size, usually at the rate of 40/24' },
  ],
  impl: styleWithFeatures(button.mdcFloatingAction({withTitle: false, buttonSize: '%$buttonSize%'}), features(
      ((ctx,{},{icon}) => icon && ctx.run({$: 'feature.icon', ...icon, title: '%$model.title%', 
        size: ({},{},{buttonSize}) => buttonSize * 24/40 })),
      css('background-color: grey'),
    ))
})

jb.component('button.mdcFloatingAction', {
  type: 'button.style,icon.style',
  description: 'fab icon',
  params: [
    {id: 'buttonSize', as: 'number', defaultValue: 60, description: 'mini is 40'},
    {id: 'withTitle', as: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{title,withTitle,raised},h) =>
      h('button',{ class: ['mdc-fab',raised && 'raised mdc-icon-button--on'].filter(x=>x).join(' ') ,
          title, tabIndex: -1, onclick:  true}, [
            h('div',{ class: 'mdc-fab__ripple'}),
            ...jb.ui.chooseIconWithRaised(cmp.icon,raised).filter(x=>x).map(h).map(vdom=>
                vdom.addClass('mdc-fab__icon').setAttribute('title',vdom.getAttribute('title') || title)),
            ...[withTitle && h('span',{ class: 'mdc-fab__label'},title)].filter(x=>x)
      ]),
    css: '{width: %$buttonSize%px; height: %$buttonSize%px;}',  
    features: mdcStyle.initDynamic(),
  })
})

jb.component('button.mdcTab', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
      h('button',{ class: ['mdc-tab', raised && 'mdc-tab--active'].filter(x=>x).join(' '),tabIndex: -1, role: 'tab', onclick:  true}, [
        h('span#mdc-tab__content',{}, [
          ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-tab__icon')),
          h('span#mdc-tab__text-label',{},title),
          ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-tab__icon'))
        ]),
        h('span',{ class: ['mdc-tab-indicator', raised && 'mdc-tab-indicator--active'].filter(x=>x).join(' ') }, h('span',{ class: 'mdc-tab-indicator__content mdc-tab-indicator__content--underline'})),
        h('span#mdc-tab__ripple'),
      ]),
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.mdcHeader', {
  type: 'button.style',
  params: [
    {id: 'stretch', as: 'boolean'},
  ],
  impl: styleWithFeatures(button.mdcTab(), css(pipeline(
    Var('contentWidth',If('%$stretch%', 'width: 100%;','')),
    `
    {width: 100%; border-bottom: 1px solid black; margin-bottom: 7px; padding: 0}
    ~ .mdc-tab__content { %$contentWidth% display: flex; align-content: space-between;}
    ~ .mdc-tab__text-label { width: 100% }
  `)))
})


