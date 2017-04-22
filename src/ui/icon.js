
jb.component('material-icon', {
	type: 'control', category: 'control:50',
	params: [
		{ id: 'icon', as: 'string', essential: true },
		{ id: 'style', type: 'icon.style', dynamic: true, defaultValue: { $: 'icon.material' } },
		{ id: 'features', type: 'feature[]', dynamic: true }
	],
	impl: ctx => jb_ui.ctrl(ctx)
})

jb.component('icon.material', {
    type: 'icon.style',
    impl :{$: 'customStyle', 
        template: '<i class="material-icons">%$$model/icon%</i>',
    }
})

