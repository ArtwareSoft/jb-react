const { Expr, Token, Setter, Expression, SetterExpression, SpliceSetterExpression, TokenTypeData, SourceTag } = carmi.lang;
const { wrap, compile, chain, root, and, ternary, or, arg0, arg1, setter, splice, withName } = carmi;

function runPipe(ctx, profiles, data) {
    const start = Array.isArray(data) ? data : typeof data == 'object' ? data : [data];
    const output = profiles.reduce((inner_data,prof,index) => step(prof,index,inner_data), data);
    return output

    function step(profile,i,data) {
        const innerPath = 'pipe~';
        if (!profile || profile.$disabled) return data;
        if (jb.profileType(profile).indexOf('aggregator') != -1)
            return jb.run(new jb.jbCtx(ctx, { data, profile, path: innerPath+i })).output;
        if (!Array.isArray(data))
            return [];
        const res = data.map(item =>
                jb.run(new jb.jbCtx(ctx,{data: item, profile, path: innerPath+i})))
                .map(x=>x.output)
        return res;
    }
}

if (jb.studio && jb.studio.probeResultCustomizers) {
     jb.studio.probeResultCustomizers.push( (ctx, res) => {
         if (res.out && typeof res.out.output !== 'undefined') 
            res.out = res.out.exp() + ': ' + res.out.output 
    })
}

function chainAst(ctx, input, pipe_profiles) {
    return pipe_profiles.reduce((ast,prof) => 
        ctx.setVars({carmiCurrentInput: input}).run(prof).chainAst(ast), input)
}

function chainExp(ctx, pipe_profiles) {
    return pipe_profiles.map(prof => ctx.run(prof).exp())
        .join('.')
}

jb.component('carmi.map', {
	type: 'carmi.chain-exp',
	params: [
		{id: 'pipe', type: 'carmi.chain-exp[]', ignore: true, composite: true },
		{id: 'itemVar', as: 'string', defaultValue: 'val' },
	],
	impl: (ctx, pipe, itemVar) => {
        const pipe_profiles = jb.toarray(ctx.profile.pipe);
        const input = ctx.data;
        const output = runPipe(ctx, ctx.setVars(jb.obj(itemVar,input)), pipe_profiles, input)
        return {
            input, output,
            chainAst: ast => chainAst(ctx, ast, pipe_profiles),
            exp: () => `map(${itemVar} => ${itemVar}.${chainExp(ctx.setVars({itemVar}),pipe_profiles)})`
        }
    },
})

jb.component('carmi.filter', {
	type: 'carmi.chain-exp,aggregator',
	params: [
		{id: 'condition', type: 'carmi.exp', dynamic: true, essential: true },
		{id: 'itemVar', as: 'string', defaultValue: 'val' },
	],
	impl: (ctx, condition, itemVar) => {
        const input = ctx.data;
        let output = [];
        if (Array.isArray(input))
            output = input.filter(item => 
                condition(ctx.setVars(jb.obj(itemVar,item)).setData(item)))
        else if (typeof input === 'object') {
            output = objFromEntries(jb.entries(input).filter(item => 
                condition(ctx.setVars(jb.obj(itemVar,item[1])).setData(item[1]))))
        }
        return {
            input, output,
            chainAst: ast => ast.filter(x => condition.ast),
            exp: () => `filter(${itemVar} => ${itemVar}.${condition.exp(ctx.setVars({itemVar}))})`
        }
    },
})


jb.component('carmi.root', {
	type: 'carmi.exp',
	impl: ctx => ({
		output: ctx.vars.root,
        ast: root,
        exp: () => 'root'
    })
})

jb.component('carmi.negate', {
	type: 'carmi.chain-exp',
	impl: (ctx) => {
        const data = ctx.data;
        return {
            input: data, 
            output: !data,
            chainAst: ast => ast.not(),
            exp: () => `not()`
        }
    }
})

jb.component('carmi.not', {
    type: 'carmi.exp',
    params: [
        { id: 'of', type: 'carmi.exp', essential: true },
    ],
	impl: (ctx, _of) => {
        const data = _of.output;
        return {
            input: data, 
            output: !data,
            ast: _of.ast.not(),
            exp: () => `not(${_of.exp})`
        }
    }
})

jb.component('carmi.equals', {
    type: 'carmi.exp',
    params: [
        { id: 'item', as: 'carmi.exp', defaultValue :{$: 'carmi.var', var: 'val'} },
        { id: 'to', as: 'string', essential: true }
    ],
	impl: (ctx, item, to) => {
        const data = ctx.data;
        return {
            input: data, 
            output: data === to,
            chainAst: ast => ast.equal(to),
            exp: () => `equal(${item.exp}, ${to.exp})`
        }
    }
})


jb.component('carmi.equalsTo', {
    type: 'carmi.chain-exp',
    params: [
        { id: 'to', as: 'string', essential: true }
    ],
	impl: (ctx, to) => {
        const data = ctx.data;
        return {
            input: data, 
            output: data === to,
            chainAst: ast => ast.equal(to),
            exp: () => `equal(${to.exp})`
        }
    }
})

jb.component('carmi.keys', {
	type: 'carmi.chain-exp,aggregator',
	impl: (ctx) => {
        const data = ctx.data;
        return {
            input: data, 
            output: Object.keys(data || {}),
            chainAst: ast => ast.keys(),
            exp: () => `keys()`
        }
    }
})


jb.component('carmi.get', {
    type: 'carmi.chain-exp',
    params: [
        {id: 'prop', as: 'string'}
    ],
	impl: (ctx, prop) => {
        const data = ctx.data;
        return {
            input: data, 
            output: data[prop],
            chainAst: ast => ast.get(prop),
            exp: () => `get('${prop}')`
        }
    }
})

jb.component('carmi.plus', {
    type: 'carmi.chain-exp',
    params: [
        {id: 'toAdd', as: 'string', essential: true}
    ],
	impl: (ctx, toAdd) => {
        const data = ctx.data;
        const _data = isNaN(Number(data)) ? data : Number(data)
        const _toAdd = isNaN(Number(toAdd)) ? toAdd : Number(toAdd)
        return {
            input: data, 
            output: _data + _toAdd,
            chainAst: ast => ast.plus(_toAdd),
            exp: () => `plus(${typeof toAdd === 'number' ? to_add: "'" + toAdd + "'"})`
        }
    }
})

jb.component('carmi.pipe', {
	type: 'carmi.exp',
	params: [
		{ id: 'input', type: 'carmi.exp' },
        { id: 'pipe', type: 'carmi.chain-exp[]', dynamic: true },
		{ id: 'itemVar', as: 'string', defaultValue: 'val' },
	],
	impl: (ctx, input, pipe, itemVar) => {
        input = input || ctx.vars.carmiCurrentInput || ctx.run({$:'root'});
        const pipe_profiles = jb.toarray(ctx.profile.pipe);
        const output = runPipe(ctx, pipe_profiles, input && input.output)
    
        return {
            input: ctx.data && ctx.data.input, 
            output,
            ast: chainAst(ctx, input.ast, pipe_profiles),
            exp: () => `${input.exp()}.map(${itemVar} => ${itemVar}.${chainExp(ctx.setVars({itemVar}),pipe_profiles)})`
        }
	}
})

jb.component('carmi.var', {
	type: 'carmi.var',
	params: [
		{id: 'id', type: 'string', essential: true },
		{id: 'exp', type: 'carmi.exp', essential: true },
		{id: 'carmi_exp', ignore: true },
	],
	impl: (ctx, id, exp, carmi_exp) => {
        return ({ id, exp })
    }
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

		const originalModel = { doubleNegated: root.keys(), set: setter(arg0) };

		const negated = root.map(val => val.not());
		const model2 = { doubleNegated: root.map(val => val.not()).map(val => val.not()), set: setter(arg0) };
		const model3 = { doubleNegated: root.map(val => val.not()).map(val => val.not()), set: setter(arg0) };

        const compiler = 'naive';
        return carmi.compile(model, { compiler, debug: true }).then(sourceCode=> {
        	const fixedCode = sourceCode.replace(/\$map_localhost:[0-9]*:[0-9]*:/g,'$map')
            const optCode = eval(fixedCode)
            const inst = optCode(sample, {});
            return {vars, model, inst};
        })
    }
})
