jb.component('style-by-control', {
	typePattern: /.*-style/,
	params: [
		{ id: 'control', type: 'control', essential: true, dynamic: true },
		{ id: 'modelVar', as: 'string', essential: true }
	],
	impl: (ctx,control,modelVar) =>
		control(ctx.setVars( jb.obj(modelVar,ctx.vars.$model)))
})

jb.component('custom-control', {
	type: 'control',
	params: [
		{ id: 'title', as: 'string', dynamic: true },
		{ id: 'html', as: 'string', essential: true, defaultValue: '<div></div>'},
		{ id: 'css', as: 'string'},
		{ id: 'options', as: 'object'},
    	{ id: 'features', type: 'feature[]', dynamic: true },
		{ id: 'imports', ignore: true },
		{ id: 'providers', ignore: true },
	],
	impl: (ctx,title,html,css,options,features) => {
		jb.ctxDictionary[ctx.id] = ctx;
		return jb_ui.Comp(jb.extend({ 
			template: `<div jb-ctx="${ctx.id}">${html}</div>`, //jb_ui.parseHTML(`<div>${html || ''}</div>`).innerHTML, 
			css: css, 
			featuresOptions: features(),
			imports: ctx.profile.imports,
			providers: ctx.profile.providers,
		},options),ctx)
	}
})
