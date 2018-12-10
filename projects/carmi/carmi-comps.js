const { Expr, Token, Setter, Expression, SetterExpression, SpliceSetterExpression, TokenTypeData, SourceTag } = carmi.lang;
const { wrap, compile, chain, root, and, ternary, or, arg0, arg1, setter, splice, withName } = carmi;

function runPipe(ctx, profiles, data) {
    const start = Array.isArray(data) ? data : typeof data == 'object' ? data : [data];
    const output = profiles.reduce((data,prof,index) => step(prof,index,data).output, data);

    function step(profile,i,data) {
        const innerPath = 'pipe~';
        if (!profile || profile.$disabled) return data;
        const parentParam = (i < profiles.length - 1) ? { as: 'array'} : (ctx.parentParam || {}) ;
        if (jb.profileType(profile) == 'aggregator')
            return jb.run( new jb.jbCtx(ctx, { data, profile, path: innerPath+i }), parentParam);
        return [].concat.apply([],data.map(item =>
                jb.run(new jb.jbCtx(ctx,{data: item, profile, path: innerPath+i}), parentParam)))
    }
}

function chainAst(ctx, start, pipe_profiles) {
    return pipe_profiles.reduce((ast,prof) => 
        ctx.run(prof).chainAst(ast), start)
}

jb.component('carmi.map', {
	type: 'carmi.chain-exp',
	params: [
		{id: 'pipe', type: 'carmi.chain-exp[]', ignore: true },
		{id: 'itemVar', as: 'string', defaultValue: 'val' },
	],
	impl: (ctx, pipe, itemVar) => {
        const pipe_profiles = jb.toarray(ctx.profile.pipe);
        const input = ctx.data;
        const output = runPipe(ctx, ctx.setVars(jb.obj(itemVar,input)), pipe_profiles, input)
        return {
            input, output,
            chainAst: ast => chainAst(ctx, ast,pipe_profiles)
        }
    },
})

jb.component('carmi.root', {
	type: 'carmi.exp',
	impl: ctx => ({
		output: ctx.vars.root,
		ast: root
    })
})

jb.component('carmi.not', {
	type: 'carmi.chain-exp',
	impl: (ctx) => {
        const data = ctx.data;
        return {
            input: data, 
            output: !data,
            chainAst: ast => ast.not()
        }
    }
})

jb.component('carmi.chain', {
	type: 'carmi.exp',
	params: [
		{ id: 'input', type: "carmi.exp", essential: true, defaultValue :{$: 'carmi.root' } },
		{ id: 'pipe', type: "carmi.chain-exp[]", ignore: true },
	],
	impl: (ctx, input, pipe) => {
        const pipe_profiles = jb.toarray(ctx.profile.pipe);
        const output = runPipe(ctx, pipe_profiles, input && input.output)
    
        return {
            input: ctx.data && ctx.data.input, 
            output,
            ast: chainAst(ctx, input.ast, pipe_profiles)
        }
	}
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
        vars.forEach(v => model[v.id] = v.exp.ast);
        setters.forEach(v => model[v.id] = v.exp.ast);

		const originalModel = { doubleNegated: root.map(val => val.not()), set: setter(arg0) };

		const negated = root.map(val => val.not());
		const model2 = { doubleNegated: root.map(val => val.not()).map(val => val.not()), set: setter(arg0) };

        const compiler = 'naive';
        return carmi.compile(model, { compiler, debug: true }).then(sourceCode=> {
        	const fixedCode = sourceCode.replace(/\$map_localhost:[0-9]*:[0-9]*:/g,'$map')
            const optCode = eval(fixedCode)
            const inst = optCode(sample, {});
            return {vars, model, inst};
        })
    }
})

jb.component('carmi.doubleNegated', {
    impl :{$: 'carmi.model',
        schemaByExample: [false, 1, 0],
        vars: [
            {$: 'carmi.var', id: 'doubleNegated',
            	exp :{$: 'carmi.chain', 
            		input :{$: 'carmi.root'}, 
            		pipe : [
                        {$: 'carmi.not' }, {$: 'carmi.not'} 
                    ]
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