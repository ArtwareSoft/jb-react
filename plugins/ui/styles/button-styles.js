using('ui-common','ui-mdc-styles')

extension('ui','button', {
  chooseIconWithRaised(icons,raised) {
    if (!icons) return []
    const raisedIcon = icons.filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'raised')[0]
    const otherIcons = (raisedIcon && icons.filter(cmp=>cmp && cmp.ctx.vars.$model.position != 'raised') || icons)
      .filter(cmp=>cmp && cmp.ctx.vars.$model.position != 'post')
    if (raised)
      return raisedIcon ? [raisedIcon] : otherIcons
    return otherIcons
  }
})

component('button.href', {
  type: 'button-style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('a',{class: raised ? 'raised' : '', href: 'javascript:;', onclick: true }, title),
    css: '{color: var(--jb-textLink-fg)} .raised { color: var(--jb-textLink-active-fg) }',
    features: button.initAction()
  })
})

component('button.hrefText', {
  type: 'button-style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('a',{class: raised ? 'raised' : '', href: 'javascript:;', onclick: true }, title),
    css: '{color: var(--jb-input-fg) ; text-decoration: none }     ~.hover, ~.active: { text-decoration: underline }',
    features: button.initAction()
  })
})

component('button.x', {
  type: 'button-style',
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
            color: var(--mdc-theme-text-primary-on-background);
            text-shadow: 0 1px 0 var(--jb-dropdown-shadow);
            font-weight: 700;
        }
        :hover { color: var(--jb-menubar-active-fg) }`,
    features: button.initAction()
  })
})

component('button.plainIcon', {
  type: 'button-style',
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
      jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=> vdom.setAttribute('title',vdom.getAttribute('title') || title))[0],
    features: button.initAction()
  })
})

