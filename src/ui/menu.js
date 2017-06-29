
jb.component('menu.menu', {
	type: 'menu.option', 
	params: [
		{ id: 'title', as: 'string', dynamic: true, essential: true },
		{ id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, essential: true },
	],
	impl: ctx => ({ 
		options: ctx.params.options, 
		title: ctx.params.title(), 
		applyShortcut: function(e) {
			this.options().forEach(o=>o.applyShortcut && o.applyShortcut(e))
		},
		ctx: ctx 
	})
})

jb.component('menu.options-group', {
	type: 'menu.option',
	params: [
		{ id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, essential: true },
	],
	impl: (ctx,options) => 
    	options()
})

jb.component('menu.dynamic-options', {
  type: 'menu.option[]',
  params: [
    { id: 'items', type: 'data', as: 'array', essential: true, dynamic: true },
    { id: 'genericOption', type: 'menu.option', essential: true, dynamic: true },
  ],
  impl: (ctx,items,generic) =>
    items().map(item => 
      	generic(ctx.setData(item)))
})

jb.component('menu.end-with-separator', {
  type: 'menu.option[]',
  params: [
	{ id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, essential: true },
	{ id: 'separator', type: 'menu.option[]', as: 'array',defaultValue :{$: 'menu.separator'} },
  ],
  impl: (ctx) => {
  	var options = ctx.params.options();
  	if (options.length > 0)
  		return options.concat(ctx.params.separator)
  	return []
  }
})


jb.component('menu.separator', {
	type: 'menu-option', 
	impl: ctx => ({ separator: true })
})

jb.component('menu.action', {
	type: 'menu.option', 
	params: [
		{ id: 'title', as: 'string', dynamic: true, essential: true },
		{ id: 'action', type: 'action', dynamic: true, essential: true },
		{ id: 'icon', as: 'string' },
		{ id: 'shortcut', as: 'string' },
		{ id: 'showCondition', as: 'boolean', defaultValue: true }
	],
	impl: ctx => 
		ctx.params.showCondition ? ({ 
			leaf : ctx.params, 
			action: _ => ctx.params.action(ctx.setVars({topMenu:null})), // clean topMenu from context after the action
			title: ctx.params.title(), 
			applyShortcut: e=> {
				var key = ctx.params.shortcut;
				if (!key) return;
				if (key.indexOf('-') > 0)
					key = key.replace(/-/,'+');
	            var keyCode = key.split('+').pop().charCodeAt(0);
	            if (key == 'Delete') keyCode = 46;
	            if (key.match(/\+[Uu]p$/)) keyCode = 38;
	            if (key.match(/\+[Dd]own$/)) keyCode = 40;
	            if (key.match(/\+Right$/)) keyCode = 39;
	            if (key.match(/\+Left$/)) keyCode = 37;

	            if (key.match(/^[Cc]trl/) && !e.ctrlKey) return;
	            if (key.match(/^[Aa]lt/) && !e.altKey) return;
	            if (e.keyCode == keyCode) {
	            	e.stopPropagation();
	                return ctx.params.action();
	            }
			},
			ctx: ctx 
		}) : null
})

// ********* actions / controls ************

jb.component('menu.control', {
  type: 'control',
  params: [
  	{id: 'menu', type: 'menu.option', dynamic: true},
    {id: 'style', type: 'menu.style', defaultValue :{$: 'menu-style.context-menu' }, dynamic: true },
	{id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx => {
  	var menuModel = ctx.params.menu();
  	return jb.ui.ctrl(ctx.setVars({
  		topMenu: ctx.vars.topMenu || { popups: []},
  		menuModel: menuModel, 
  	}),{ctxForPick: menuModel.ctx })
  }
})

jb.component('menu.open-context-menu', {
  type: 'action',
  params: [
  	{id: 'menu', type: 'menu.option', dynamic: true },
  	{id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue :{$: 'dialog.context-menu-popup'}  },
	{ id: 'features', type: 'dialog-feature[]', dynamic: true }
  ],
  impl :{$: 'open-dialog', 
  	  style :{$call: 'popupStyle' },
      content :{$: 'menu.control' , menu :{$call: 'menu'}, style :{$: 'menu-style.context-menu'} },
  	  features :{$call: 'features' },
  }
})

// ********* styles ************

jb.component('menu-style.pulldown', {
	type: 'menu.style',
	params: [
	    { id: 'innerMenuStyle', type: 'menu.style', dynamic: true, defaultValue: {$: 'menu-style.popup-as-option'}},
	    { id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: {$: 'menu-style.option-line'}},
	    { id: 'layout', type: 'group.style', dynamic: true, defaultValue :{$: 'layout.horizontal'}},
	],
  	impl :{$: 'style-by-control', __innerImplementation: true,
    	control :{$: 'itemlist',
	    	$vars: {
	    		optionsParentId: ctx => ctx.id,
	    		innerMenuStyle: ctx => ctx.componentContext.params.innerMenuStyle,
	    		leafOptionStyle: ctx => ctx.componentContext.params.leafOptionStyle,
	    	},
	    	watchItems: false,
	    	style :{$:'itemlist.use-group-style', groupStyle :{$call: 'layout' }},
    		items: '%$menuModel/options%',
			controls :{$: 'menu.control', menu: '%$item%', style :{$: 'menu-style.popup-thumb'} },
    		features :{$: 'menu.selection'},
		}
	}
})

jb.component('menu-style.context-menu', {
	type: 'menu.style',
	params: [
	    { id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: {$: 'menu-style.option-line'}},
	],
  	impl :{$: 'style-by-control', __innerImplementation: true,
    	control :{$: 'itemlist',
			$vars: { 
				optionsParentId: ctx => ctx.id,
	    		leafOptionStyle: ctx => ctx.componentContext.params.leafOptionStyle,
			},
	    	watchItems: false,
    		items: '%$menuModel/options%',
			controls :{$: 'menu.control', menu: '%$item%', style :{$: 'menu-style.apply-multi-level'} },
    		features :{$: 'menu.selection', autoSelectFirst: true},
		}
	}
})


jb.component('menu.init-popup-menu', {
	type: 'feature',
	params: [
	    { id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue :{$: 'dialog.context-menu-popup' } },
	],
  	impl: ctx => 
  	({
  		destroy: cmp => 
  			cmp.closePopup()
  		,
 		afterViewInit: cmp => {
 			cmp.setState({title: ctx.vars.menuModel.title});

			cmp.mouseEnter = _ => {
				if ($('.context-menu-popup')[0]) 
					cmp.openPopup()
			};
			cmp.openPopup = jb.ui.wrapWithLauchingElement( ctx2 => {
	 			cmp.ctx.vars.topMenu.popups.push(ctx.vars.menuModel);
	        	ctx2.run( {$: 'menu.open-context-menu', 
	        		popupStyle: _ctx => ctx.params.popupStyle(_ctx),
	        		menu: _ctx => 
	        			ctx.vars.$model.menu()
	        	})
	        } , cmp.ctx, cmp.base );

			cmp.closePopup = _ => {
	  			jb.ui.dialogs.dialogs
	  				.filter(d=>d.id == ctx.vars.optionsParentId)
	  				.forEach(d=>d.close());
	  			cmp.ctx.vars.topMenu.popups.pop();
			};

			if (ctx.vars.topMenu && ctx.vars.topMenu.keydown) {
				var keydown = ctx.vars.topMenu.keydown.takeUntil( cmp.destroyed );

			    keydown.filter(e=>e.keyCode == 39) // right arrow
		    	    .subscribe(x=>{
		        		if (ctx.vars.topMenu.selected == ctx.vars.menuModel && cmp.openPopup)
		        			cmp.openPopup();
		        	})
			    keydown.filter(e=>e.keyCode == 37) // left arrow
		    	    .subscribe(x=>{
		        		if (cmp.ctx.vars.topMenu.popups.slice(-1)[0] == ctx.vars.menuModel) {
		        			ctx.vars.topMenu.selected = ctx.vars.menuModel;
		        			cmp.closePopup();
		        		}
		        	})
			}

		}
  	})
})

jb.component('menu.init-menu-option', {
	type: 'feature',
  	impl: ctx => 
  	({
 		afterViewInit: cmp => {
			var leafParams = ctx.vars.menuModel.leaf;
	        cmp.setState({title:  leafParams.title() ,icon : leafParams.icon ,shortcut: leafParams.shortcut});
	        cmp.action = jb.ui.wrapWithLauchingElement( _ => {
				jb.ui.dialogs.dialogs.filter(d=>d.isPopup)
		  			.forEach(d=>d.close());
		  		jb.delay(50).then(_=>
	        		jb.ui.applyAfter(ctx.vars.menuModel.action(),ctx))
	        }, ctx, cmp.base);

	  		jb.delay(1).then(_=>{ // wait for topMenu keydown initalization
				if (ctx.vars.topMenu && ctx.vars.topMenu.keydown) {
					var keydown = ctx.vars.topMenu.keydown.takeUntil( cmp.destroyed );
				    keydown.filter(e=>e.keyCode == 13 && ctx.vars.topMenu.selected == ctx.vars.menuModel) // Enter
			    	    .subscribe(_=>
			    	    	cmp.action())
			    }
			})
		}
  	})
})

jb.component('menu-style.apply-multi-level', {
	type: 'menu.style',
	params: [
	    { id: 'menuStyle', type: 'menu.style', dynamic: true, defaultValue: {$: 'menu-style.popup-as-option'}},
	    { id: 'leafStyle', type: 'menu.style', dynamic: true, defaultValue: {$: 'menu-style.option-line'}},
	    { id: 'separatorStyle', type: 'menu.style', dynamic: true, defaultValue: {$: 'menu-separator.line'}},
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

jb.component('menu.selection', {
  type: 'feature',
  params: [
    { id: 'autoSelectFirst', type: 'boolean'},
  ],
  impl: ctx => ({
  	 onkeydown: true,
     afterViewInit: function(cmp) {
        cmp.base.setAttribute('tabIndex','0');
     	// putting the emitter at the top-menu only and listen at all sub menus

     	if (!ctx.vars.topMenu.keydown) { 
	        ctx.vars.topMenu.keydown = cmp.onkeydown;
            jb.ui.focus(cmp.base,'menu.keyboard init autoFocus',ctx);
      	};

        var keydown = ctx.vars.topMenu.keydown.takeUntil( cmp.destroyed );

        keydown.filter(e=>
              e.keyCode == 38 || e.keyCode == 40 )
            .map(event => {
              event.stopPropagation();
              var diff = event.keyCode == 40 ? 1 : -1;
              var items = cmp.items.filter(item=>!item.separator);
              var selectedIndex = items.indexOf(ctx.vars.topMenu.selected);
              if (selectedIndex != -1)
              	return items[(selectedIndex + diff + items.length) % items.length];
	        }).subscribe(x=>{
	        	if (x)
	        		cmp.select(x);
	        })
	    keydown.filter(e=>e.keyCode == 27) // close all popups
    	    .subscribe(_=>{
		  			jb.ui.dialogs.dialogs
		  				.filter(d=>d.isPopup)
		  				.forEach(d=>d.close())
		  			cmp.ctx.vars.topMenu.popups = [];
		  			cmp.ctx.run({$:'tree.regain-focus'});
	    	})
	    cmp.select = item => {
	    	cmp.setState({selected: ctx.vars.topMenu.selected = item})
	    }
	    cmp.selected = _ =>
	    	ctx.vars.topMenu.selected;

        if (ctx.params.autoSelectFirst && cmp.items[0])
            cmp.select(cmp.items[0]);
      },
	  extendItem: (cmp,vdom,data) => {
	      jb.ui.toggleClassInVdom(vdom,'selected', ctx.vars.topMenu.selected == data);
	      vdom.attributes.onmouseenter = _ => 
	      	cmp.select(data)
	  },
	  css: '>.selected { background: #bbb !important; color: #fff !important }',
    })
})

jb.component('menu-style.option-line', {
	type: 'menu-option.style',
  	impl :{$: 'custom-style', 
		template: (cmp,state,h) => h('div',{ 
				class: 'line noselect', onmousedown: _ => cmp.action() 
			},[
				h('i',{class:'material-icons'},state.icon),
				h('span',{class:'title'},state.title),
				h('span',{class:'shortcut'},state.shortcut),
		]),
		css: `{ display: flex; cursor: pointer; font: 13px Arial; height: 24px}
			  .selected { background: #d8d8d8 }	
			  >i { width: 24px; padding-left: 3px; padding-top: 3px; font-size:16px; }
			  >span { padding-top: 3px }
	          >.title { display: block; text-align: left; } 
			  >.shortcut { margin-left: auto; text-align: right; padding-right: 15px }`,
        features: [
        	{$: 'mdl.ripple-effect'},
    		{$: 'menu.init-menu-option'}
        ]
	}
})

jb.component('menu.option-as-icon24', {
	type: 'menu-option.style',
  	impl :{$: 'custom-style', 
		template: (cmp,state,h) => h('div',{ 
				class: 'line noselect', onclick: _ => cmp.clicked(), title: state.title 
			},[
				h('i',{class:'material-icons'},state.icon),
		]),
		css: `{ display: flex; cursor: pointer; height: 24px}
			  >i { width: 24px; padding-left: 3px; padding-top: 3px; font-size:16px; }`
	}
})

jb.component('menu-style.popup-as-option', {
	type: 'menu.style',
  	impl :{$: 'custom-style', 
		template: (cmp,state,h) => h('div',{ 
				class: 'line noselect', onmousedown: _ => cmp.action() 
			},[
				h('span',{class:'title'},state.title),
				h('i',{class:'material-icons', onmouseenter: e => cmp.openPopup(e) },'play_arrow'),
		]),
		css: `{ display: flex; cursor: pointer; font: 13px Arial; height: 24px}
			  >i { width: 100%; text-align: right; font-size:16px; padding-right: 3px; padding-top: 3px; }
	          >.title { display: block; text-align: left; padding-top: 3px; padding-left: 26px;} 
			`,
        features :{$: 'menu.init-popup-menu', popupStyle :{$: 'dialog.context-menu-popup', rightSide: true, offsetTop: -24 } },
    }
})

jb.component('menu-style.popup-thumb', {
	type: 'menu.style',
	description: 'used for pulldown',
	impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{ 
				class: 'pulldown-top-menu-item', 
				onmouseenter: _ => 
					cmp.mouseEnter(),
				onclick: _ => cmp.openPopup()
		},state.title),
        features :[
          {$: 'menu.init-popup-menu' },
          {$: 'mdl.ripple-effect'}
        ],
	}
})


jb.component('menu-style.toolbar', {
	type: 'menu.style',
	impl :{$: 'menu.multi-level',
		leafOptionStyle :{$: 'menu.option-as-icon24' }
	}
})

jb.component('dialog.context-menu-popup',{
	type: 'dialog.style',
	params: [
		{ id: 'offsetTop', as: 'number' },
		{ id: 'rightSide', as: 'boolean' },
	],
	impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup context-menu-popup pulldown-mainmenu-popup'},
				h(state.contentComp)),
			features: [
				{ $: 'dialog-feature.unique-dialog', id: '%$optionsParentId%', remeberLastLocation: false },
				{ $: 'dialog-feature.max-zIndex-on-click' },
				{ $: 'dialog-feature.close-when-clicking-outside' },
				{ $: 'dialog-feature.css-class-on-launching-element' },
				{ $: 'dialog-feature.near-launcher-position', rightSide: '%$rightSide%', offsetTop: '%$offsetTop%' }
			]
	}
})

jb.component('menu-separator.line', {
	type: 'menu-separator.style',
  	impl :{$: 'custom-style', 
      template: (cmp,state,h) => h('div'),
      css: '{ margin: 6px 0; border-bottom: 1px solid #EBEBEB;}'
  }
})
