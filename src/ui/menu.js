jb.ns('menuStyle,menuSeparator,mdc,icon')

jb.component('menu.menu', {
  type: 'menu.option',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true},
    {id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, mandatory: true, defaultValue: []},
    {id: 'icon', type: 'icon' },
    {id: 'optionsFilter', type: 'data', dynamic: true, defaultValue: '%%'}
  ],
  impl: ctx => ({
		options: ctx2 => ctx.params.optionsFilter(ctx.setData(ctx.params.options(ctx2))),
    title: ctx.params.title(),
    icon: ctx.params.icon,
		applyShortcut: function(e) {
			return this.options().reduce((res,o)=> res || (o.applyShortcut && o.applyShortcut(e)),false)
		},
		ctx
	})
})

jb.component('menu.optionsGroup', {
  type: 'menu.option',
  params: [
    {id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, mandatory: true}
  ],
  impl: (ctx,options) => options()
})

jb.component('menu.dynamicOptions', {
  type: 'menu.option',
  params: [
    {id: 'items', type: 'data', as: 'array', mandatory: true, dynamic: true},
    {id: 'genericOption', type: 'menu.option', mandatory: true, dynamic: true}
  ],
  impl: (ctx,items,generic) => items().map(item => generic(ctx.setData(item)))
})

jb.component('menu.endWithSeparator', {
  type: 'menu.option',
  params: [
    {id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, mandatory: true},
    {id: 'separator', type: 'menu.option', as: 'array', defaultValue: menu.separator()},
    {id: 'title', as: 'string'}
  ],
  impl: (ctx) => {
		const options = ctx.params.options();
		if (options.length > 0)
			return options.concat(ctx.params.separator)
		return []
	}
})


jb.component('menu.separator', {
  type: 'menu.option',
  impl: ctx => ({ separator: true })
})

jb.component('menu.action', {
  type: 'menu.option',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'icon', type: 'icon' },
    {id: 'shortcut', as: 'string'},
    {id: 'showCondition', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: ctx => ctx.params.showCondition && ({
			leaf : ctx.params,
			action: _ => ctx.params.action(ctx.setVars({topMenu:null})), // clean topMenu from context after the action
			title: ctx.params.title(ctx),
			applyShortcut: e=> {
				if (jb.ui.checkKey(e,ctx.params.shortcut)) {
					e.stopPropagation();
					ctx.params.action();
					return true;
				}
			},
			ctx
		})
})

// ********* actions / controls ************

jb.component('menu.control', {
  type: 'control,clickable,menu',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'style', type: 'menu.style', defaultValue: menuStyle.contextMenu(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => {
		const menuModel = ctx.params.menu() || { options: [], ctx, title: ''};
    return jb.ui.ctrl(ctx.setVars({	topMenu: ctx.vars.topMenu || { popups: []},	menuModel	}), features(
      () => ({ctxForPick: menuModel.ctx }),
      calcProp('title','%$menuModel.title%'),
    ))
	}
})

jb.component('menu.openContextMenu', {
  type: 'action',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue: dialog.contextMenuPopup()},
    {id: 'menuStyle', type: 'menu.style', dynamic: true, defaultValue: menuStyle.contextMenu()},
    {id: 'features', type: 'dialog-feature[]', dynamic: true},
    {id: 'id', as: 'string' } 
  ],
  impl: openDialog({
    id: '%$id%',
    style: call('popupStyle'),
    content: menu.control({menu: call('menu'), style: call('menuStyle')}),
    features: call('features')
  })
})

// ********* styles ************

jb.component('menuStyle.pulldown', {
  type: 'menu.style',
  params: [
    {id: 'innerMenuStyle', type: 'menu.style', dynamic: true, defaultValue: menuStyle.popupAsOption()},
    {id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: menuStyle.optionLine()},
    {id: 'layout', type: 'group.style', dynamic: true, defaultValue: itemlist.horizontal()}
  ],
  impl: styleByControl(
    Var('optionsParentId', ctx => ctx.id),
    Var('innerMenuStyle', ctx => ctx.componentContext.params.innerMenuStyle),
    Var('leafOptionStyle', ctx => ctx.componentContext.params.leafOptionStyle),
    itemlist({
      vars: [
        Var('optionsParentId', ctx => ctx.id),
        Var('innerMenuStyle', ctx => ctx.componentContext.params.innerMenuStyle),
        Var('leafOptionStyle', ctx => ctx.componentContext.params.leafOptionStyle)
      ],
      items: ctx => ctx.vars.menuModel.options && ctx.vars.menuModel.options().filter(x=>x) || [],
      controls: menu.control({menu: '%$item%', style: menuStyle.popupThumb()}),
      style: call('layout'),
      features: menu.selection()
    })
  )
})

jb.component('menuStyle.contextMenu', {
  type: 'menu.style',
  params: [
    {id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: menuStyle.optionLine()}
  ],
  impl: styleByControl(
    Var('optionsParentId', ctx => ctx.id),
    Var('leafOptionStyle', ctx => ctx.componentContext.params.leafOptionStyle),
    itemlist({
      vars: [
        Var('optionsParentId', ctx => ctx.id),
        Var('leafOptionStyle', ctx => ctx.componentContext.params.leafOptionStyle)
      ],
      items: ctx => ctx.vars.menuModel.options && ctx.vars.menuModel.options().filter(x=>x) || [],
      controls: menu.control({menu: '%$item%', style: menuStyle.applyMultiLevel({})}),
      features: menu.selection(true)
    })
  )
})

jb.component('menu.initPopupMenu', {
  type: 'feature',
  params: [
    {id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue: dialog.contextMenuPopup()}
  ],
  impl: features(
    () => ({destroy: cmp => cmp.closePopup()}),
    calcProp({id: 'title', value: '%$menuModel.title%'}),
    interactive(
        (ctx,{cmp}) => {
				cmp.mouseEnter = _ => {
					if (jb.ui.find(ctx,'.context-menu-popup')[0]) // first open with click...
  					cmp.openPopup()
				};
				cmp.openPopup = jb.ui.wrapWithLauchingElement( ctx2 => {
					cmp.ctx.vars.topMenu.popups.push(ctx.vars.menuModel);
					ctx2.run( menu.openContextMenu({
							popupStyle: _ctx => ctx.componentContext.params.popupStyle(_ctx),
							menu: _ctx =>	_ctx.vars.innerMenu ? ctx.vars.innerMenu.menu() : ctx.vars.$model.menu()
						}))
					}, cmp.ctx, cmp.base );

				cmp.closePopup = () => jb.ui.dialogs.closeDialogs(jb.ui.dialogs.dialogs
              .filter(d=>d.id == ctx.vars.optionsParentId))
              .then(()=> cmp.ctx.vars.topMenu.popups.pop()),

				jb.delay(1).then(_=>{ // wait for topMenu keydown initalization
					if (ctx.vars.topMenu && ctx.vars.topMenu.keydown) {
            const {pipe, takeUntil } = jb.callbag
						const keydown = pipe(ctx.vars.topMenu.keydown, takeUntil( cmp.destroyed ))

					  jb.subscribe(keydown, e=> e.keyCode == 39 && // right arrow
						  ctx.vars.topMenu.selected == ctx.vars.menuModel && cmp.openPopup && cmp.openPopup())
            jb.subscribe(keydown, e=> { // left arrow
              if (e.keyCode == 37 && cmp.ctx.vars.topMenu.popups.slice(-1)[0] == ctx.vars.menuModel) {
                ctx.vars.topMenu.selected = ctx.vars.menuModel;
                cmp.closePopup();
              }
          })
				}
			})
		})
  )
})

jb.component('menu.initMenuOption', {
  type: 'feature',
  impl: features(
    calcProp({id: 'title', value: '%$menuModel.leaf.title%'}),
    calcProp({id: 'icon', value: '%$menuModel.leaf.icon%'}),
    calcProp({id: 'shortcut', value: '%$menuModel.leaf.shortcut%'}),
    interactive(
        (ctx,{cmp}) => {
          const {pipe,filter,subscribe,takeUntil} = jb.callbag

          cmp.action = jb.ui.wrapWithLauchingElement( () =>
                jb.ui.dialogs.closePopups().then(() =>	ctx.vars.menuModel.action())
              , ctx, cmp.base);

          jb.delay(1).then(_=>{ // wait for topMenu keydown initalization
          if (ctx.vars.topMenu && ctx.vars.topMenu.keydown) {
            pipe(ctx.vars.topMenu.keydown,
              takeUntil( cmp.destroyed ),
              filter(e=>e.keyCode == 13 && ctx.vars.topMenu.selected == ctx.vars.menuModel), // Enter
              subscribe(_=> cmp.action()))
          }
			})
	}
      )
  )
})

jb.component('menuStyle.applyMultiLevel', {
  type: 'menu.style',
  params: [
    {id: 'menuStyle', type: 'menu.style', dynamic: true, defaultValue: menuStyle.popupAsOption()},
    {id: 'leafStyle', type: 'menu.style', dynamic: true, defaultValue: menuStyle.optionLine()},
    {id: 'separatorStyle', type: 'menu.style', dynamic: true, defaultValue: menuSeparator.line()}
  ],
  impl: ctx => {
			if (ctx.vars.menuModel.leaf)
				return ctx.vars.leafOptionStyle ? ctx.vars.leafOptionStyle(ctx) : ctx.params.leafStyle();
			else if (ctx.vars.menuModel.separator)
				return ctx.params.separatorStyle()
			else if (ctx.vars.innerMenuStyle)
				return ctx.vars.innerMenuStyle(ctx)
			else
				return ctx.params.menuStyle();
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
//         keydown.subscribe(e=>cmp.ctx.vars.topMenu.applyShortcut(e))
//       }
//     })
// })

jb.component('menu.selection', {
  type: 'feature',
  params: [
    {id: 'autoSelectFirst', type: 'boolean'}
  ],
  impl: ctx => ({
    onkeydown: true,
    onmousemove: true,
		templateModifier: vdom => {
				vdom.attributes = vdom.attributes || {};
				vdom.attributes.tabIndex = 0
    },
		afterViewInit: cmp => {
				// putting the emitter at the top-menu only and listen at all sub menus
				if (!ctx.vars.topMenu.keydown) {
					ctx.vars.topMenu.keydown = cmp.onkeydown;
						jb.ui.focus(cmp.base,'menu.keyboard init autoFocus',ctx);
			  }
      cmp.items = Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item'))
        .map(el=>(jb.ctxDictionary[el.getAttribute('jb-ctx')] || {}).data)

      const {pipe,map,filter,subscribe,takeUntil} = jb.callbag

			const keydown = pipe(ctx.vars.topMenu.keydown, takeUntil( cmp.destroyed ))
      pipe(cmp.onmousemove, map(e=> dataOfElems(e.target.ownerDocument.elementsFromPoint(e.pageX, e.pageY))),
        filter(data => data && data != ctx.vars.topMenu.selected),
        subscribe(data => cmp.select(data)))
			pipe(keydown, filter(e=> e.keyCode == 38 || e.keyCode == 40 ),
					map(event => {
						event.stopPropagation();
						const diff = event.keyCode == 40 ? 1 : -1;
						const items = cmp.items.filter(item=>!item.separator);
						const selectedIndex = ctx.vars.topMenu.selected.separator ? 0 : items.indexOf(ctx.vars.topMenu.selected);
						if (selectedIndex != -1)
							return items[(selectedIndex + diff + items.length) % items.length];
				}), filter(x=>x), subscribe(data => cmp.select(data)))

			pipe(keydown,filter(e=>e.keyCode == 27), // close all popups
					subscribe(_=> jb.ui.dialogs.closePopups().then(()=> {
              cmp.ctx.vars.topMenu.popups = [];
              cmp.ctx.run({$:'tree.regain-focus'}) // very ugly
      })))

      cmp.select = selected => {
				ctx.vars.topMenu.selected = selected
        if (!cmp.base) return
        Array.from(cmp.base.querySelectorAll('.jb-item.selected, *>.jb-item.selected'))
          .forEach(elem=>elem.classList.remove('selected'))
        Array.from(cmp.base.querySelectorAll('.jb-item, *>.jb-item'))
          .filter(elem=> (jb.ctxDictionary[elem.getAttribute('jb-ctx')] || {}).data === selected)
          .forEach(elem=> elem.classList.add('selected'))
      }
			cmp.state.selected = ctx.vars.topMenu.selected;
			if (ctx.params.autoSelectFirst && cmp.items[0])
            cmp.select(cmp.items[0])

      function dataOfElems(elems) {
        const itemElem = elems.find(el=>el.classList && el.classList.contains('jb-item'))
        const ctxId = itemElem && itemElem.getAttribute('jb-ctx')
        return ((ctxId && jb.ctxDictionary[ctxId]) || {}).data
      }
		},
		css: '>.selected { background: #bbb !important; color: #fff !important }',
		})
})

jb.component('menuStyle.optionLine', {
  type: 'menu-option.style',
  impl: customStyle({
    template: (cmp,{icon,title,shortcut},h) => h('div#line noselect', { onmousedown: 'action' },[
        h(cmp.ctx.run({$: 'control.icon', ...icon, size: 20})),
				h('span#title',{},title),
				h('span#shortcut',{},shortcut),
        h('div#mdc-line-ripple'),
		]),
    css: `{ display: flex; cursor: pointer; font: 13px Arial; height: 24px}
				.selected { background: #d8d8d8 }
				>i { padding: 3px 8px 0 3px }
				>span { padding-top: 3px }
				>.title { display: block; text-align: left; white-space: nowrap; }
				>.shortcut { margin-left: auto; text-align: right; padding-right: 15px }`,
    features: [menu.initMenuOption(), mdc.rippleEffect()]
  })
})

jb.component('menuStyle.popupAsOption', {
  type: 'menu.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div#line noselect', { onmousedown: 'action' },[
				h('span#title',{},state.title),
				h('i#material-icons', { onmouseenter: 'openPopup' },'play_arrow'),
		]),
    css: `{ display: flex; cursor: pointer; font: 13px Arial; height: 24px}
				>i { width: 100%; text-align: right; font-size:16px; padding-right: 3px; padding-top: 3px; }
						>.title { display: block; text-align: left; padding-top: 3px; padding-left: 32px; white-space: nowrap; }
			`,
    features: menu.initPopupMenu(dialog.contextMenuPopup(-24, true))
  })
})

jb.component('menuStyle.popupThumb', {
  type: 'menu.style',
  description: 'used for pulldown',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{
				class: 'pulldown-top-menu-item',
				onmouseenter: 'mouseEnter',
				onclick: 'openPopup'
		},state.title),
    features: [menu.initPopupMenu(), mdc.rippleEffect()]
  })
})

jb.component('dialog.contextMenuPopup', {
  type: 'dialog.style',
  params: [
    {id: 'offsetTop', as: 'number'},
    {id: 'rightSide', as: 'boolean', type: 'boolean'},
    {id: 'toolbar', as: 'boolean', type: 'boolean'},
  ],
  impl: customStyle({
    template: (cmp,{contentComp,toolbar},h) => h('div#jb-dialog jb-popup context-menu-popup', 
      { class: toolbar ? 'toolbar-popup' : 'pulldown-mainmenu-popup'}, h(contentComp)),
    features: [
      dialogFeature.uniqueDialog('%$optionsParentId%', false),
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.nearLauncherPosition({
        offsetTop: '%$offsetTop%',
        rightSide: '%$rightSide%'
      })
    ]
  })
})

jb.component('menuSeparator.line', {
  type: 'menu-separator.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div'),
    css: '{ margin: 6px 0; border-bottom: 1px solid #EBEBEB;}'
  })
})

/***** icon menus */

jb.component('menuStyle.toolbar', {
  type: 'menu.style',
  params: [
    {id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: menuStyle.icon()},
    {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.horizontal(5)},
  ],
  impl: styleByControl(
    Var('optionsParentId', ctx => ctx.id),
    Var('leafOptionStyle', ctx => ctx.componentContext.params.leafOptionStyle),
    itemlist({
      vars: [
        Var('optionsParentId', ctx => ctx.id),
        Var('leafOptionStyle', ctx => ctx.componentContext.params.leafOptionStyle)
      ],
      style: call('itemlistStyle'),
      items: ctx => ctx.vars.menuModel.options && ctx.vars.menuModel.options().filter(x=>x) || [],
      controls: menu.control({menu: '%$item%', style: menuStyle.applyMultiLevel({
        menuStyle: menuStyle.iconMenu(), leafStyle: menuStyle.icon()
      })}),
    })
  )
})

jb.component('menuStyle.icon', {
  type: 'menu-option.style',
  params: [
    {id: 'buttonSize', as: 'number', defaultValue: 20 },
  ],
  impl: styleWithFeatures(
      button.mdcIcon('%$menuModel/leaf/icon%','%$buttonSize%'),
      [
        htmlAttribute('onclick',true),
        defHandler('onclickHandler', ctx => ctx.vars.menuModel.action())
      ]
  )
})

jb.component('menuStyle.iconMenu', {
  type: 'menu.style',
  impl: styleByControl(
      button({
        title: '%title%',
        action: (ctx,{cmp}) => cmp.openPopup(),
        style: button.mdcIcon(
          icon({
            icon: '%icon/icon%',
            type: '%icon/type%',
            features: css('transform: translate(7px,0px) !important')
          }), 16),
        features: [feature.icon({
          icon: 'more_vert',
          type: 'mdc',
          features: css('transform: translate(-3px,0px) !important')
        }),
          menu.initPopupMenu(dialog.contextMenuPopup({toolbar: true, rightSide: true}))
        ]
      }),
    'innerMenu'),
})
