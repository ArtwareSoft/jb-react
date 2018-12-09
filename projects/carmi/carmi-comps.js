const { Expr, Token, Setter, Expression, SetterExpression, SpliceSetterExpression, TokenTypeData, SourceTag } = carmi.lang;
const { wrap, compile, chain, root, and, ternary, or, arg0, arg1, setter, splice, withName } = carmi;

jb.component('carmi.map', {
	type: 'carmi.array',
	params: [
		{id: 'array', type: 'carmi.exp', dynamic: true },
		{id: 'mapTo', type: 'carmi.exp', dynamic: true },
		{id: 'itemVar', as: 'string', defaultValue: 'val' },
	],
	impl: (ctx, array, mapTo, itemVar) => {
        const input = jb.toarray(array(ctx).output);
        const output = input.map(x=> {
            const ctx2 = ctx.setData(x).setVars({itemVar}).setVars(jb.obj(itemVar,x))
            const res = mapTo(ctx2)
            return res && res.output
        })
        return {
            input, output,
            ast: new Expression(
                    new Token('map'),
                    new Expression(
                        new Token('func'),
                        wrap(mapTo(ctx.setVars({itemVar})).ast)),
                    array().ast
            ),
            probeResultCustomization: function(ctx2, res) {
                res.in.data = this.input
                res.out = this.output
            }
        }
    },
})

jb.component('carmi.root', {
	type: 'carmi.array,carmi.exp',
	params: [
	],
	impl: ctx => ({
		output: ctx.vars.root,
		ast: new Token('root')
    })
})

jb.component('carmi.not', {
	type: 'carmi.boolean,carmi.exp',
	params: [
		{id: 'of', type: 'carmi.exp', dynamic: true },
	],
	impl: (ctx, _of) => {
        const of_exp = _of(ctx)
        const input = (of_exp ? of_exp.output : ctx.vars[ctx.vars.itemVar])
        const output = !input
        return {
            input, output,
            ast: new Expression(
				new Token('not'), 
                (_of() || {ast: new Token(ctx.vars.itemVar)}).ast
            )
        }
    }
})

function chain(context,items,ptName) {
	const start = [jb.toarray(context.data)[0]]; // use only one data item, the first or null
	if (typeof context.profile.items == 'string')
		return context.runInner(context.profile.items,null,'items');
	const profiles = jb.toarray(context.profile.items || context.profile[ptName]);
	const innerPath = (context.profile.items && context.profile.items.sugar) ? '' 
		: (context.profile[ptName] ? (ptName + '~') : 'items~');

	if (ptName == '$pipe') // promise pipe
		return profiles.reduce((deferred,prof,index) => {
			return deferred.then(data=>
				jb.synchArray(data))
			.then(data=>
				step(prof,index,data))
		}, Promise.resolve(start))

	return profiles.reduce((data,prof,index) =>
		step(prof,index,data), start)


	function step(profile,i,data) {
    	if (!profile || profile.$disabled) return data;
		const parentParam = (i < profiles.length - 1) ? { as: 'array'} : (context.parentParam || {}) ;
		if (jb.profileType(profile) == 'aggregator')
			return jb.run( new jb.jbCtx(context, { data: data, profile: profile, path: innerPath+i }), parentParam);
		return [].concat.apply([],data.map(item =>
				jb.run(new jb.jbCtx(context,{data: item, profile: profile, path: innerPath+i}), parentParam))
			.filter(x=>x!=null)
			.map(x=> Array.isArray(jb.val(x)) ? jb.val(x) : x ));
	}
}

jb.component('carmi.chain', {
	type: 'carmi.exp',
	params: [
		{ id: 'items', type: "carmi.exp[]", ignore: true, essential: true, composite: true },
	],
	impl: (ctx,items) => {
        const of_exp = _of(ctx)
        const input = (of_exp ? of_exp.output : ctx.vars[ctx.vars.itemVar])
        const output = !input
        return {
            input, output,
            ast: new Expression(
				new Token('not'), 
                (_of() || {ast: new Token(ctx.vars.itemVar)}).ast
            )
        }
	}

	jb.pipe(ctx,items,'$pipeline')
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
		{id: 'vars', type: 'carmi.var[]', essential: true, defaultValue: [], dynamic: true },
        {id: 'setters', type: 'carmi.setter[]', defaultValue: [] },
        {id: 'schemaByExample' },
	],
	impl: (ctx, id, varsF, setters, sample) => {
		let innerCtx = ctx.setVars({ root: sample});
        const vars = varsF(innerCtx);

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

jb.component('carmi.negated', {
    impl :{$: 'carmi.model',
        schemaByExample: [false, 1, 0],
        vars: [
            {$: 'carmi.var', id: 'negated',
            	exp :{$: 'carmi.map', 
            		array :{$: 'carmi.root'}, 
            		mapTo :{$: 'carmi.not' }
            	}
            }
        ]
    }
})

new jb.jbCtx().run({$:'carmi.doubleNegated'}).then(mdl=> console.log(mdl))