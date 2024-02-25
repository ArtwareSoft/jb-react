
component('menu.menu', {
  type: 'menu.option',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true},
    {id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, mandatory: true, defaultValue: []},
    {id: 'icon', type: 'icon'}
  ],
  impl: ctx => ({
		options: function(ctx2) {
      const ctxWithDepth = ctx.setVars({...ctx.vars, ...(ctx2 && ctx2.vars), menuDepth: this.ctx.vars.menuDepth })
      return ctx.params.options(ctxWithDepth).filter(x=>x)
      //return ctx.params.optionsFilter(ctx.setData(ctx.params.options(ctxWithDepth)))
    },
    title: ctx.params.title(),
    icon: ctx.params.icon,
		runShortcut: function(event) {
			return this.options().reduce((res,o)=> res || (o.runShortcut && o.runShortcut(event)),false)
		},
		ctx: ctx.setVar('menuDepth', (ctx.vars.menuDepth || 0)+1)
	})
})

component('menu.dynamicOptions', {
  type: 'menu.option',
  params: [
    {id: 'items', type: 'data', as: 'array', mandatory: true, dynamic: true},
    {id: 'genericOption', type: 'menu.option', mandatory: true, dynamic: true}
  ],
  impl: typeAdapter('data<>', pipeline('%$items()%', '%$genericOption()%'))
})

component('menu.endWithSeparator', {
  type: 'menu.option',
  params: [
    {id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, mandatory: true},
    {id: 'separator', type: 'menu.option', defaultValue: menu.separator()},
    {id: 'title', as: 'string'}
  ],
  impl: typeAdapter('data<>', pipeline(Var('opts', '%$options()%'), If('%$opts/length%>0', list('%$opts%','%$separator%'))))
})

component('menu.separator', {
  type: 'menu.option',
  impl: typeAdapter('data<>', obj(prop('separator', true)))
})

component('menu.action', {
  type: 'menu.option',
  moreTypes: 'control<>',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'description', as: 'string', dynamic: true, mandatory: true},
    {id: 'icon', type: 'icon'},
    {id: 'shortcut', as: 'string'},
    {id: 'showCondition', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: ctx => ctx.params.showCondition && ({
			leaf : ctx.params,
			action: () => ctx.params.action(ctx.setVars({topMenu:null})), // clean topMenu from context after the action
      title: ctx.params.title(ctx),
      description: ctx.params.description(ctx),
      shortcut: ctx.params.shortcut,
			runShortcut: event => {
				if (ctx.run({$: 'key.eventMatchKey', event: () => event.ev, key: () => ctx.params.shortcut}))
					ctx.params.action()
			},
			ctx: ctx.setVar('menuDepth', (ctx.vars.menuDepth || 0)+1)
		}),
  require: key.eventMatchKey()
})

// ********* controls ************

component('menu.control', {
  type: 'control',
  moreTypes: 'menu<>',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'style', type: 'menu-style', defaultValue: menuStyle.contextMenu(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => {
    const model = ctx.params.menu()
    const menuModel = model || { options: [], ctx, title: ''}
    const ctxWithModel = ctx.setVars({menuModel})
    const ctxToUse = ctx.vars.topMenu ? ctxWithModel : jb.ui.extendWithServiceRegistry(ctxWithModel.setVar('topMenu',{}))
    jb.log('menu create uiComp',{topMenu: ctx.vars.topMenu, menuModel,ctx,ctxToUse})
    return jb.ui.ctrl(ctxToUse, {$: 'features', features: [
      () => ({pathForPick: jb.path(menuModel,'ctx.path') }),
      {$: 'calcProp', id: 'title', value: '%$menuModel.title%' },
      {$: 'htmlAttribute', attribute: 'menuDepth', value: '%$menuModel/ctx/vars/menuDepth%' },
    ]})
	},
  require: [features(), calcProp(), htmlAttribute()]
})

component('menu.openContextMenu', {
  type: 'action',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'popupStyle', type: 'dialog-style', dynamic: true, defaultValue: dialog.contextMenuPopup()},
    {id: 'menuStyle', type: 'menu-style', dynamic: true, defaultValue: menuStyle.contextMenu()},
    {id: 'features', type: 'dialog-feature[]', dynamic: true},
    {id: 'id', as: 'string'}
  ],
  impl: openDialog({
    content: menu.control(call('menu'), call('menuStyle')),
    style: call('popupStyle'),
    id: '%$id%',
    features: call('features')
  })
})

// ********* styles ************

component('menuStyle.pulldown', {
  type: 'menu-style',
  params: [
    {id: 'innerMenuStyle', type: 'menu-style', dynamic: true, defaultValue: menuStyle.popupAsOption()},
    {id: 'leafOptionStyle', type: 'menu-option-style', dynamic: true, defaultValue: menuStyle.optionLine()},
    {id: 'layout', type: 'group-style', dynamic: true, defaultValue: itemlist.horizontal()}
  ],
  impl: styleByControl({
    vars: [
      Var('optionsParentId', ctx => ctx.id),
      Var('innerMenuStyle', '%$innerMenuStyle%'),
      Var('leafOptionStyle', '%$leafOptionStyle%')
    ],
    control: itemlist({
      items: '%$menuModel.options()%',
      controls: menu.control('%$item%', menuStyle.popupThumb()),
      style: call('layout'),
      features: menu.selection()
    })
  })
})

component('menuStyle.contextMenu', {
  type: 'menu-style',
  params: [
    {id: 'leafOptionStyle', type: 'menu-option-style', dynamic: true, defaultValue: menuStyle.optionLine()}
  ],
  impl: styleByControl({
    vars: [
      Var('optionsParentId', ctx => ctx.id),
      Var('leafOptionStyle', '%$leafOptionStyle%')
    ],
    control: itemlist({ items: '%$menuModel.options()%', controls: menu.control('%$item%', menuStyle.applyMultiLevel()), features: menu.selection() })
  })
})

component('menu.initPopupMenu', {
  type: 'feature',
  params: [
    {id: 'popupStyle', type: 'dialog-style', dynamic: true, defaultValue: dialog.contextMenuPopup()}
  ],
  impl: features(
    calcProp('title', '%$menuModel.title%'),
    method('openPopup', parentCtx => parentCtx.run({$: 'menu.openContextMenu',
        popupStyle: {$: 'call', param: 'popupStyle'},
        menu: () => parentCtx.run({$: 'If', condition: '%$innerMenu%', then: '%$innerMenu.menu()%', Else: '%$$model.menu()%'}),
      })),
    method('closePopup', dialog.closeDialogById('%$optionsParentId%')),
    method('openNewPopup', runActions(action.runBEMethod('closePopup'), action.runBEMethod('openPopup'))),
    frontEnd.onDestroy(action.runBEMethod('closePopup')),
    menu.passMenuKeySource(),
    frontEnd.flow(source.findMenuKeySource(), rx.filter('%keyCode%==39'), sink.BEMethod('openPopup')),
    frontEnd.flow(source.findMenuKeySource(), rx.filter(inGroup(list(37,27), '%keyCode%')), sink.BEMethod('closePopup'))
  ),
  require: [menu.openContextMenu(), call(), If()]
})

component('menu.initMenuOption', {
  type: 'feature',
  impl: features(
    calcProp('title', '%$menuModel.leaf.title%'),
    calcProp('icon', '%$menuModel.leaf.icon%'),
    calcProp('shortcut', '%$menuModel.leaf.shortcut%'),
    method('closeAndActivate', runActions(dialog.closeAllPopups(), '%$menuModel.action()%')),
    menu.passMenuKeySource(),
    frontEnd.flow(source.findMenuKeySource(), rx.filter('%keyCode%==13'), sink.BEMethod('closeAndActivate'))
  )
})

component('menuStyle.applyMultiLevel', {
  type: 'menu-style',
  params: [
    {id: 'menuStyle', type: 'menu-style', dynamic: true, defaultValue: menuStyle.popupAsOption()},
    {id: 'leafStyle', type: 'menu-style', dynamic: true, defaultValue: menuStyle.optionLine()},
    {id: 'separatorStyle', type: 'menu-separator-style', defaultValue: menuSeparator.line()}
  ],
  impl: (ctx,menuStyle,leafStyle,separatorStyle) => {
    const {menuModel,leafOptionStyle, innerMenuStyle } = ctx.vars
			if (menuModel.leaf)
				return leafOptionStyle ? leafOptionStyle(ctx) : leafStyle();
			else if (menuModel.separator)
				return separatorStyle
			else if (innerMenuStyle)
				return innerMenuStyle(ctx)
			else
				return menuStyle()
		}
})

// jb.component('menu.apply-context-menu-shortcuts', {
//   type: 'feature',
//   impl: ctx => ({
//   	 onkeydown: true,
//      afterViewInit: cmp => {
//         cmp.base.setAttribute('tabIndex','0');
//         if (!ctx.vars.topMenu.keydown) {
//   	        ctx.vars.topMenu.keydown = cmp.onkeydown;
//             jb.ui.focus(cmp.base,'menu.keyboard init autoFocus',ctx);
//       	};
//         const keydown = ctx.vars.topMenu.keydown.takeUntil( cmp.destroyed );
//         keydown.subscribe(e=>cmp.ctx.vars.topMenu.runShortcut(e))
//       }
//     })
// })

component('menu.selection', {
  type: 'feature',
  impl: features(
    htmlAttribute('tabIndex', 0),
    css(
      '>.selected { color: var(--jb-menubar-selection-fg); background: var(--jb-menubar-selection-bg) }'
    ),
    userStateProp('selected', 0),
    templateModifier(({},{vdom, selected}) => {
      const parent = vdom.querySelector('.jb-items-parent') || vdom
      const el = jb.path(parent,`children.${selected}`)
      el && el.addClass('selected')
    }),
    method('closeMenu', dialog.closeDialog()),
    menu.selectionKeySourceService(),
    menu.passMenuKeySource(),
    frontEnd.method('applyState', ({},{cmp}) => {
      Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
        .forEach(elem=>jb.ui.removeClass(elem,'selected'))
      const parent = cmp.base.querySelector('.jb-items-parent') || cmp.base
      const elem = parent.children[cmp.state.selected]
      if (elem) {
        jb.ui.addClass(elem,'selected')
        jb.ui.scrollIntoView(elem)
      }
    }),
    frontEnd.method('setSelected', ({data},{cmp}) => {
        cmp.base.state.selected = cmp.state.selected = data
        cmp.runFEMethod('applyState')
    }),
    frontEnd.flow(
      source.findMenuKeySource(),
      rx.filter(not('%ctrlKey%')),
      rx.filter(inGroup(list(38,40), '%keyCode%')),
      rx.map(itemlist.nextSelected(If('%keyCode%==40', 1, -1), menu.notSeparator('%%'))),
      sink.FEMethod('setSelected')
    ),
    frontEnd.flow(source.findMenuKeySource(), rx.filter('%keyCode%==27'), sink.BEMethod('closeMenu')),
    frontEnd.flow(
      source.frontEndEvent('mousemove'),
      rx.filter(menu.notSeparator('%target%')),
      rx.var('elem', ({data}) => data.target.ownerDocument.elementsFromPoint(data.pageX, data.pageY)[0]),
      rx.var('ctxId', itemlist.indexOfElem('%$elem%')),
      rx.map('%$ctxId%'),
      rx.distinctUntilChanged(),
      sink.FEMethod('setSelected')
    )
  )
})
  
component('menu.selectionKeySourceService', {
  type: 'feature',
  impl: If({
    condition: '%$$serviceRegistry/services/menuKeySource%',
    then: [],
    Else: features(
      service.registerBackEndService('menuKeySource', '%$cmp/cmpId%'),
      frontEnd.prop('menuKeySource', (ctx,{cmp,el}) => {
      if (el.keydown_src) return
      const {pipe, takeUntil,subject} = jb.callbag
      el.keydown_src = subject()
      el.onkeydown = e => {
        if ([37,38,39,40,13,27].indexOf(e.keyCode) != -1) {
          jb.log('menuKeySource',{ctx,cmp,e})
          el.keydown_src.next((ctx.cmpCtx || ctx).dataObj(e))
          return false // stop propagation
        }
        return true
      }
      jb.ui.focus(el,'menu.selectionKeySourceService',ctx)
      jb.log('menuKeySource register',{cmp,el,ctx})
      return pipe(el.keydown_src, takeUntil(cmp.destroyed))
    })
    )
  })
})

component('menu.passMenuKeySource', {
  type: 'feature',
  impl: frontEnd.var('menuKeySourceCmpId', '%$$serviceRegistry/services/menuKeySource%')
})

component('source.findMenuKeySource', {
  type: 'rx',
  category: 'source',
  params: [
    {id: 'clientCmp', defaultValue: '%$cmp%'}
  ],
  impl: rx.pipe(
    source.merge(
      source.data([]),
      (ctx,{menuKeySourceCmpId},{clientCmp}) => {
        jb.log('search menuKeySource',{menuKeySourceCmpId,clientCmp,ctx})
        const el = jb.ui.elemOfCmp(ctx,menuKeySourceCmpId)
        const ret = jb.path(el, '_component.menuKeySource')
        if (!ret)
          jb.log('menuKeySource notFound',{menuKeySourceCmpId,clientCmp,el,ctx})
        else
          jb.log('found menuKeySource',{menuKeySourceCmpId,clientCmp,el,ctx})
        return ret
      }
    ),
    rx.var('cmp', '%$clientCmp%'),
    rx.takeUntil('%$cmp.destroyed%'),
    rx.filter(menu.isRelevantMenu()),
    rx.log('from menuKeySource')
  )
})

component('menu.isRelevantMenu', {
  type: 'boolean',
  impl: ctx => {
    const key = ctx.data.keyCode
    const el = ctx.vars.cmp.base
    const menus = jb.ui.find(ctx,'[menuDepth]').filter(el=>jb.ui.hasClass(el,'jb-itemlist'))
    const maxDepth = menus.reduce((max,el) => Math.max(max,+el.getAttribute('menudepth')),0)
    const depth = +el.getAttribute('menudepth') || 0
    const isSelected = jb.ui.parents(el,{includeSelf: true}).find(el=>jb.ui.hasClass(el,'selected'))
    const isMenu = jb.ui.hasClass(el,'jb-itemlist')
    const upDownInMenu = isMenu && (key == 40 || key == 38 || key == 27) && depth == maxDepth
    const leftArrowEntryBefore = isSelected && (key == 37 || key == 27) && depth == maxDepth 
    const rightArrowCurrentEntry = isSelected && (key == 39 || key == 13) && depth == maxDepth + 1
    const res = upDownInMenu || leftArrowEntryBefore || rightArrowCurrentEntry
    jb.log('check isRelevantMenu',{res,key,el,isMenu,isSelected,depth,maxDepth,upDownInMenu,leftArrowEntryBefore,rightArrowCurrentEntry,menus})
    return res
  }
})

component('menuStyle.optionLine', {
  type: 'menu-option-style',
  moreTypes: 'menu-style<>',
  impl: customStyle({
    template: (cmp,{icon,title,shortcut},h) => h('div.line noselect', { onmousedown: 'closeAndActivate' },[
        h(cmp.ctx.run({$: 'control.icon', ...icon, size: 20})),
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
    features: [menu.initMenuOption(), feature.mdcRippleEffect()]
  })
})

component('menuStyle.popupAsOption', {
  type: 'menu-style',
  impl: customStyle({
    template: (cmp,{title},h) => h('div.line noselect', { onmousedown: 'closeAndActivate' },[
				h('span.title',{},title),
				h('i.material-icons', { onmouseenter: 'openPopup' },'play_arrow'),
		]),
    css: `{ display: flex; cursor: pointer; font1: 13px Arial; height: 24px}
				>i { width: 100%; text-align: right; font-size:16px; padding-right: 3px; padding-top: 3px; }
						>.title { display: block; text-align: left; padding-top: 3px; padding-left: 32px; white-space: nowrap; }
			`,
    features: menu.initPopupMenu(dialog.contextMenuPopup(-24, true))
  })
})

component('menuStyle.popupThumb', {
  type: 'menu-style',
  description: 'used for pulldown',
  impl: customStyle({
    template: ({},{title},h) => h('div.pulldown-top-menu-item',{ onclick: 'openPopup'}, title),
    features: [
      menu.initPopupMenu(),
      feature.mdcRippleEffect(),
      frontEnd.flow(
        source.frontEndEvent('mouseenter'),
        rx.filter(ctx => jb.ui.find(ctx,'.pulldown-mainmenu-popup')[0]),
        sink.BEMethod('openNewPopup')
      )
    ]
  })
})

component('dialog.contextMenuPopup', {
  type: 'dialog-style',
  params: [
    {id: 'offsetTop', as: 'number'},
    {id: 'rightSide', as: 'boolean', type: 'boolean'},
    {id: 'toolbar', as: 'boolean', type: 'boolean'}
  ],
  impl: customStyle({
    template: ({},{contentComp,toolbar},h) => h('div.jb-dialog jb-popup context-menu-popup', 
      { class: toolbar ? 'toolbar-popup' : 'pulldown-mainmenu-popup'}, h(contentComp)),
    features: [
      dialogFeature.uniqueDialog('%$optionsParentId%'),
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.nearLauncherPosition({ offsetTop: '%$offsetTop%', rightSide: '%$rightSide%' })
    ]
  })
})

component('menuSeparator.line', {
  type: 'menu-separator-style',
  impl: customStyle({
    template: ({},{},h) => h('div', {separator: true}),
    css: '{ margin: 6px 0; border-bottom: 1px solid var(--jb-menu-separator-fg);}'
  })
})

component('menu.notSeparator', {
  type: 'boolean',
  moreTypes: 'data<>',
  params: [
    {id: 'elem'}
  ],
  impl: (ctx,elem) => elem.firstElementChild && !elem.firstElementChild.getAttribute('separator')
})

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
      controls: menu.control('%$item%', menuStyle.applyMultiLevel(menuStyle.iconMenu(), menuStyle.icon())),
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
    features: [menu.initMenuOption(), feature.mdcRippleEffect()]
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
