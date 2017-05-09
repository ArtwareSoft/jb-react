
jb.component('material-icon', {
	type: 'control', category: 'control:50',
	params: [
		{ id: 'icon', as: 'string', essential: true },
		{ id: 'style', type: 'icon.style', dynamic: true, defaultValue :{$: 'icon.material' } },
		{ id: 'features', type: 'feature[]', dynamic: true }
	],
	impl: ctx => 
		jb.ui.ctrl(ctx,{init: cmp=> cmp.state.icon = ctx.params.icon})
})

jb.component('icon.material', {
    type: 'icon.style',
    impl :{$: 'custom-style', 
        template: (cmp,state,h) => h('i',{class: 'material-icons'},state.icon),
    }
})

