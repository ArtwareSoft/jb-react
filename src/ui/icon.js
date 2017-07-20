
jb.component('material-icon', {
	type: 'control', category: 'control:50',
	params: [
		{ id: 'icon', as: 'string', essential: true },
		{ id: 'title', as: 'string' },
		{ id: 'style', type: 'icon.style', dynamic: true, defaultValue :{$: 'icon.material' } },
		{ id: 'features', type: 'feature[]', dynamic: true }
	],
	impl: ctx =>
		jb.ui.ctrl(ctx,{init: cmp=> cmp.state.icon = ctx.params.icon})
})

jb.component('icon.material', {
    type: 'icon.style,icon-with-action.style',
    impl :{$: 'custom-style',
        template: (cmp,state,h) => h('i',{class: 'material-icons', onclick: ev => cmp.clicked(ev)},state.icon),
    }
})

jb.component('icon-with-action', {
  type: 'control', category: 'control:100,common:100',
  params: [
		{ id: 'icon', as: 'string', essential: true },
		{ id: 'title', as: 'string' },
		{ id: 'action', type: 'action', essential: true, dynamic: true },
		{ id: 'style', type: 'icon-with-action.style', dynamic: true, defaultValue :{$: 'icon.material' } },
		{ id: 'features', type: 'feature[]', dynamic: true }
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx,{
			init: cmp=> cmp.state.icon = ctx.params.icon,
      afterViewInit: cmp =>
          cmp.clicked = jb.ui.wrapWithLauchingElement(ctx.params.action, ctx, cmp.base)
    })
})
