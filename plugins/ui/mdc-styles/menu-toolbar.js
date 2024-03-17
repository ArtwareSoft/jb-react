/***** icon menus */

component('menuStyle.toolbar', {
  type: 'menu-style',
  params: [
    {id: 'leafOptionStyle', type: 'menu-option-style', dynamic: true, defaultValue: menuStyle.icon()},
    {id: 'itemlistStyle', type: 'itemlist-style', dynamic: true, defaultValue: itemlist.horizontal(5)}
  ],
  impl: styleByControl({
    vars: [
      Var('optionsParentId', ctx => ctx.id),
      Var('leafOptionStyle', '%$leafOptionStyle%')
    ],
    control: itemlist({
      items: '%$menuModel/options()%',
      controls: menu('%$item%', menuStyle.applyMultiLevel(menuStyle.iconMenu(), menuStyle.icon())),
      style: call('itemlistStyle')
    })
  })
})

component('menuStyle.icon', {
  type: 'menu-option-style',
  moreTypes: 'menu-style<>',
  params: [
    {id: 'buttonSize', as: 'number', defaultValue: 20}
  ],
  impl: styleByControl(
    button({
      action: '%$menuModel/action()%',
      style: button.mdcFloatingAction('%$buttonSize%', false),
      features: (ctx,{menuModel},{buttonSize}) => 
        ctx.run({$: 'feature.icon', ...menuModel.leaf.icon, title: menuModel.title, size: buttonSize * 24/40 }, 'feature<>')
    })
  )
})

component('menuStyle.icon3', {
  type: 'menu-option-style',
  params: [
    {id: 'buttonSize', as: 'number', defaultValue: 20}
  ],
  impl: customStyle({
    template: (cmp,{icon,title,shortcut},h) => h('div.line noselect', { onmousedown: 'closeAndActivate' },[
        h(cmp.ctx.run({$: 'control.icon', ...icon, size: 20}, 'control<>')),
				h('span.title',{},title),
				h('span.shortcut',{},shortcut),
        h('div.mdc-line-ripple'),
		]),
    css: `{ display: flex; cursor: pointer; font1: 13px Arial; height: 24px}
				.selected { color: var(--jb-menubar-selection-fg); background: var(--jb-menubar-selection-bg) }
				>i { padding: 3px 8px 0 3px }
				>span { padding-top: 3px }
				>.title { display: block; text-align: left; white-space: nowrap; }
				>.shortcut { margin-left: auto; text-align: right; padding-right: 15px }`,
    features: [menu.initMenuOption(), menu.mdcRippleEffect()]
  })
})

component('menuStyle.iconMenu', {
  type: 'menu-style',
  impl: styleByControl({
    control: button('%title%', action.runBEMethod('openPopup'), {
      style: button.mdcIcon({
        icon: icon('%icon/icon%', { type: '%icon/type%', features: css('transform: translate(7px,0px) !important') }),
        buttonSize: 16
      }),
      features: [
        feature.icon('more_vert', {
          type: 'mdc',
          features: css('transform: translate(-3px,0px) !important')
        }),
        menu.initPopupMenu(dialog.contextMenuPopup({ rightSide: true, toolbar: true }))
      ]
    }),
    modelVar: 'innerMenu'
  })
})
