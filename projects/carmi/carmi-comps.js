const { Expr, Token, Setter, Expression, SetterExpression, SpliceSetterExpression, TokenTypeData, SourceTag } = carmi.lang;
const { wrap, compile, chain, root, and, ternary, or, arg0, arg1, setter, splice, withName } = carmi;

jb.component('carmi.map', {
	type: 'carmi.array',
	params: [
		{id: 'array', type: 'carmi.exp', dynamic: true },
		{id: 'mapTo', type: 'carmi.exp', dynamic: true },
		{id: 'itemVar', as: 'string', defaultValue: 'val' },
	],
	impl: (ctx, array, mapTo, itemVar) => ({
			calc: ctx2 => { 
				const input = array(ctx).map(x=> x.calc(ctx2));
				const output = input.map(x=> mapTo(ctx2).calc(ctx2.setData(x)))
				return { input, output}
			},
			ast: new Expression(
					new Token('map'),
					new Expression(
						new Token('func'),
						wrap(mapTo(ctx.setVars({itemVar})).ast)), 
					array().ast
			)
	}),
	probeResultCustomization: (ctx, probeResult) => {
			$inputCustomizer: probeResult => array(probeResult.in)
			$outputCustomizer: probeResult => probeResult.out.calc(probeResult.in)
	}
})

jb.component('carmi.root', {
	type: 'carmi.array,carmi.exp',
	params: [
	],
	impl: ctx => ({
		calc: ctx2 => ctx.vars.root,
		ast: new Token('root')
	})
})

jb.component('carmi.not', {
	type: 'carmi.boolean,carmi.exp',
	params: [
		{id: 'of', type: 'carmi.exp', dynamic: true },
	],
	impl: (ctx, _of) => ({
		calc: ctx2 => !_of(ctx2.data),
		ast: new Expression(
				new Token('not'), 
				(_of() || {ast: new Token(ctx.vars.itemVar)}).ast
		),
		$outputCustomizer: probeResult => probeResult.out.calc(probeResult.in)
	})
})

jb.component('carmi.var', {
	type: 'carmi.var',
	params: [
		{id: 'id', type: 'string', essential: true },
		{id: 'exp', type: 'carmi.exp', essential: true },
	],
	impl: (ctx, id, exp) => ({ id, exp })
})

jb.component('carmi.model', {
	type: 'carmi.model',
	params: [
		{id: 'id', type: 'string', essential: true },
		{id: 'vars', type: 'carmi.var[]', essential: true, defaultValue: [] },
        {id: 'setters', type: 'carmi.setter[]', defaultValue: [] },
        {id: 'schemaByExample' },
	],
	impl: (ctx, id, vars, setters, sample) => {
		let innerCtx = ctx.setVars({ root: sample});
        vars.forEach(v => innerCtx = v.exp.calc(innerCtx) );

        // build carmi model
        const model = {
        	set: setter(arg0)
        }
        vars.forEach(v => model[v.id] = wrap(v.exp.ast));
        setters.forEach(v => model[v.id] = v.exp.ast);

		const originalModel = { doubleNegated: root.map(val => val.not()), set: setter(arg0) };

		const negated = root.map(val => val.not());
		const model2 = { doubleNegated: root.map(val => val.not()).map(val => val.not()), set: setter(arg0) };

        const compiler = 'naive';
        return carmi.compile(model, { compiler, debug: true }).then(sourceCode=> {
        	const fixedCode = sourceCode.replace(/\$map_localhost:[0-9]*:[0-9]*:/g,'$map')
            const optCode = eval(fixedCode)
            const inst = optCode(sample, {});
            return inst;
        })
    }
})

jb.component('carmi.doubleNegated', {
    impl :{$: 'carmi.model',
        schemaByExample: [false, 1, 0],
        vars: [
            {$: 'carmi.var', id: 'doubleNegated',
            	exp :{$: 'carmi.map', 
            		array :{$: 'carmi.root'}, 
            		mapTo :{$: 'carmi.not', of :{$: 'carmi.not'}}
            	}
            }
        ]
    }
})
