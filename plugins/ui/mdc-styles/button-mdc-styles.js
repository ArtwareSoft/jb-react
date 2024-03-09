using('ui-misc')

component('button.mdc', {
  type: 'button-style',
  params: [
    {id: 'noRipple', as: 'boolean', type: 'boolean'},
    {id: 'noTitle', as: 'boolean', type: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{title,raised,noRipple,noTitle},h) => h('button',{
      class: ['mdc-button',raised && 'raised mdc-button--raised'].filter(x=>x).join(' '), onclick: true},[
      ...[!noRipple && h('div.mdc-button__ripple')],
      ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-button__icon')),
      ...[!noTitle && h('span.mdc-button__label',{},title)],
      ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-button__icon')),
    ]),
    features: [button.initAction(), mdcStyle.initDynamic()]
  })
})

component('button.mdcChipAction', {
  type: 'button-style',
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
    h('div.mdc-chip-set mdc-chip-set--filter', {onclick: true},
      h('div.mdc-chip',{ class: [raised && 'mdc-chip--selected raised'].filter(x=>x).join(' ') }, [
        h('div.mdc-chip__ripple'),
        ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-chip__icon mdc-chip__icon--leading')),
        h('span',{ role: 'gridcell'}, h('span', {role: 'button', tabindex: -1, class: 'mdc-chip__text'}, title )),
        ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-chip__icon mdc-chip__icon--trailing')),
    ])),
    features: [button.initAction(), mdcStyle.initDynamic()]
  })
})

component('button.mdcIcon', {
  type: 'button-style',
  moreTypes: 'icon.style<>',
  params: [
    {id: 'icon', type: 'icon'},
    {id: 'buttonSize', as: 'number', defaultValue: 40, description: 'button size is larger than the icon size, usually at the rate of 40/24', byName: true}
  ],
  impl: styleWithFeatures(button.mdcFloatingAction('%$buttonSize%', false), {
    features: features(
      (ctx,{},{icon}) => icon && ctx.run({$: 'feature.icon', ...icon, title: '%$model.title%',
        size: ({},{},{buttonSize}) => buttonSize * 24/40 }, 'feature<>')
    )
  })
})

component('button.mdcFloatingAction', {
  type: 'button-style',
  moreTypes: 'icon.style<>',
  description: 'fab icon',
  params: [
    {id: 'buttonSize', as: 'number', defaultValue: 60, description: 'mini is 40', byName: true},
    {id: 'withTitle', as: 'boolean', type: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{title,withTitle,raised},h) =>
      h('button',{ class: ['mdc-fab',raised && 'raised mdc-icon-button--on'].filter(x=>x).join(' ') ,
          title, tabIndex: -1, onclick: true}, [
            h('div',{ class: 'mdc-fab__ripple'}),
            ...jb.ui.chooseIconWithRaised(cmp.icon,raised).filter(x=>x).map(h).map(vdom=>
                vdom.addClass('mdc-fab__icon').setAttribute('title',vdom.getAttribute('title') || title)),
            ...[withTitle && h('span',{ class: 'mdc-fab__label'},title)].filter(x=>x)
      ]),
    features: [
      button.initAction(),
      mdcStyle.initDynamic(),
      css('~.mdc-fab {width: %$buttonSize%px; height: %$buttonSize%px;}')
    ]
  })
})

component('button.mdcTab', {
  type: 'button-style',
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
      h('button.mdc-tab',{ class: raised ? 'mdc-tab--active' : '',tabIndex: -1, role: 'tab', onclick: true}, [
        h('span.mdc-tab__content',{}, [
          ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-tab__icon')),
          h('span.mdc-tab__text-label',{},title),
          ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-tab__icon'))
        ]),
        h('span',{ class: ['mdc-tab-indicator', raised && 'mdc-tab-indicator--active'].filter(x=>x).join(' ') }, h('span',{ class: 'mdc-tab-indicator__content mdc-tab-indicator__content--underline'})),
        h('span.mdc-tab__ripple'),
      ]),
    features: [button.initAction(), mdcStyle.initDynamic()]
  })
})

component('button.mdcHeader', {
  type: 'button-style',
  params: [
    {id: 'stretch', as: 'boolean', type: 'boolean', byName: true}
  ],
  impl: styleWithFeatures(button.mdcTab(), {
    features: css(
      pipeline(
        Var('contentWidth', If('%$stretch%', 'width: 100%;', '')),
        `
    {width: 100%; border-bottom: 1px solid black; margin-bottom: 7px; padding: 0}
    ~ .mdc-tab__content { %$contentWidth% display: flex; align-content: space-between;}
    ~ .mdc-tab__text-label { width: 100% }
  `
      )
    )
  })
})


