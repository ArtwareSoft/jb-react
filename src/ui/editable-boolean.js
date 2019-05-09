jb.type('editable-boolean.style');

jb.component('editable-boolean',{
	type: 'control', category: 'input:20',
	params: [
		{ id: 'databind', as: 'ref'},
		{ id: 'style', type: 'editable-boolean.style', defaultValue :{$: 'editable-boolean.checkbox' }, dynamic: true },
		{ id: 'title', as: 'string' , dynamic: true },
		{ id: 'textForTrue', as: 'string', defaultValue: 'yes', dynamic: true },
		{ id: 'textForFalse', as: 'string', defaultValue: 'no', dynamic: true  },
		{ id: 'features', type: 'feature[]', dynamic: true },
	],
	impl: ctx => jb.ui.ctrl(ctx,{
			init: cmp => {
				cmp.toggle = () =>
					cmp.jbModel(!cmp.jbModel());

				cmp.text = () => {
					if (!cmp.jbModel) return '';
					return cmp.jbModel() ? ctx.params.textForTrue(cmp.ctx) : ctx.params.textForFalse(cmp.ctx);
				}
				cmp.extendRefresh = _ =>
					cmp.setState({text: cmp.text()})
					
				cmp.refresh();
			},
		})
})

jb.component('editable-boolean.keyboard-support', {
	type: 'feature',
	impl: ctx => ({
			onkeydown: true,
			afterViewInit: cmp => {
				cmp.onkeydown.filter(e=> 
						e.keyCode == 37 || e.keyCode == 39)
					.subscribe(e=> {
						cmp.toggle();
						cmp.refreshMdl && cmp.refreshMdl();
					})
			},
		})
})
