const { Expr, Token, Setter, Expression, SetterExpression, SpliceSetterExpression, TokenTypeData, SourceTag } = carmi.lang;
const { wrap, compile, chain, root, and, ternary, or, arg0, arg1, setter, splice, withName } = carmi;

function ctrlOfElem(elem) {
    return (elem.ctrl && elem.ctrl()) || primitiveCtrl(elem.ctx.path, elem.exp)
}

const primitiveCtrl = (path, title) => ({$: 'button', 
        title, 
        style :{$: 'button.href'},
        action :{$: 'write-value', value: path, to: '%$jbEditor_selection%'}
})    



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
            res.out = res.out.exp + ': ' + res.out.output 
    })
}

function chainExp(ctx, pipe_profiles) {
    return pipe_profiles.map(prof => ctx.run(prof).exp)
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
        const output = runPipe(ctx, ctx.setVars(jb.obj(itemVar,input)), pipe_profiles, input.output);
        const exp_prefix = `map(${itemVar} => ${itemVar}.`;
        const exp = exp_prefix + chainExp(ctx.setVars({itemVar}),pipe_profiles) + ')';
        const ctrl = () => (
            {$: 'group', style: {$: 'layout.flex'},
                $vars: { exp_path: ctx.path },
                controls: [
                    {$: 'label', title: exp_prefix }, 
                    ...sub_controls,
                    {$: 'label', title: `)` }
                ]
            })
        return {input, output, exp, ctrl, ctx}
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

        const cond = condition(ctx.setVars({itemVar}))
        const exp_prefix = `filter(${itemVar} => ${itemVar}`
        const exp = `${exp_prefix}.${cond.exp})`
        const ctrl = () => (
            {$: 'group', style: {$: 'layout.flex'},
                controls: [
                    primitiveCtrl(ctx.path, exp_prefix),
                    ctrlOfElem(cond),
                    {$: 'label', title: ')' }
                ]
            })
        return {input, output, exp, ctrl, ctx}
    },
})


jb.component('carmi.root', {
    type: 'carmi.exp',
    impl: ctx => ({
        output: ctx.vars.root,
        exp: 'root',
        ctx
    })
})

jb.component('carmi.negate', {
    type: 'carmi.chain-exp',
    impl: (ctx) => {
        const input = ctx.data;
        const output = !input;
        return {
            input, output, exp: `not()`, ctx
        }
    }
})

jb.component('carmi.not', {
    type: 'carmi.exp',
    params: [
        { id: 'of', type: 'carmi.exp', essential: true },
    ],
    impl: (ctx, _of) => {
        const input = _of.output;
        const output = !input;
        return {
            input, output, exp: `not(${_of.exp})`, ctx
        }
    }
})

jb.component('carmi.equalsTo', {
    type: 'carmi.chain-exp',
    params: [
        { id: 'to', as: 'string', essential: true }
    ],
    impl: (ctx, to) => {
        const input = ctx.data;
        const output = input === to.output;
        return {
            input, output, exp: `equal(${to})`, ctx
        }
    }
})

jb.component('carmi.keys', {
    type: 'carmi.chain-exp,aggregator',
    impl: (ctx) => {
        const input = ctx.data;
        const output = Object.keys(input || {});
        return { input, output, exp: `keys()`, ctx }
    }
})


jb.component('carmi.get', {
    type: 'carmi.chain-exp',
    params: [
        {id: 'prop', as: 'string'}
    ],
    impl: (ctx, prop) => {
        const input = ctx.data;
        const output = input[prop];
        return { input, output, exp: `get('${prop}')`, ctx }
    }
})

jb.component('carmi.plus', {
    type: 'carmi.chain-exp',
    params: [
        {id: 'toAdd', as: 'string', essential: true}
    ],
    impl: (ctx, toAdd) => {
        const input = ctx.data;
        const _input = isNaN(Number(input)) ? input : Number(input)
        const _toAdd = isNaN(Number(toAdd)) ? toAdd : Number(toAdd)
        const output = _input + _toAdd;
        const exp = `plus(${typeof _toAdd === 'number' ? _toAdd : "'" + _toAdd + "'"})`
        return { input, output, exp, ctx }
    }
})

jb.component('carmi.pipe', {
    type: 'carmi.exp',
    params: [
        { id: 'input', type: 'carmi.exp', defaultValue :{$: 'root'} },
        { id: 'pipe', type: 'carmi.chain-exp[]', dynamic: true },
        { id: 'itemVar', as: 'string', defaultValue: 'val' },
    ],
    impl: (ctx, input, pipe, itemVar) => {
        const pipe_profiles = jb.toarray(ctx.profile.pipe);
        const {output, controls} = runPipe(ctx, pipe_profiles, input.output)
        const exp_prefix = `.map(${itemVar} => ${itemVar}`
        const exp = `${input.exp}${exp_prefix}.${chainExp(ctx.setVars({itemVar}), pipe_profiles)})`
        const ctrl = () => (
            {$: 'group', style: {$: 'layout.flex'},
                controls: [ctrlOfElem(input)].concat([
                    primitiveCtrl(ctx.path, exp_prefix),
                    ...[].concat.apply([],pipe().map(elem => [{$: 'label', title: '.'}, ctrlOfElem(elem)])),
                    {$: 'label', title: ')' }
                ])
            })
    
        return {input: ctx.data, output, exp, ctrl, ctx }
    }
})

jb.component('carmi.var', {
	type: 'carmi.var',
	params: [
		{id: 'id', as: 'string', essential: true },
		{id: 'exp', type: 'carmi.exp', essential: true },
	],
    impl: (ctx, id, exp, carmi_exp) =>
        ({ id, exp: exp.exp, ctrl: ctx.run(ctrlOfElem(exp)) })
})

jb.component('carmi.model', {
	type: 'carmi.model',
	params: [
		{id: 'id', as: 'string', essential: true },
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
        vars.forEach(v => model[v.id] = eval(`(${v.exp})`));
        setters.forEach(v => model[v.id] = v.exp.ast);

		// const originalModel = { doubleNegated: root.keys(), set: setter(arg0) };
		// const negated = root.map(val => val.not());
		// const model2 = { doubleNegated: root.map(val => val.not()).map(val => val.not()), set: setter(arg0) };
		// const model3 = { doubleNegated: root.map(val => val.not()).map(val => val.not()), set: setter(arg0) };

        const compiler = 'naive';
        return carmi.compile(model, { compiler, debug: true }).then(sourceCode=> {
        	const fixedCode = sourceCode.replace(/\$map_localhost:[0-9]*:[0-9]*:/g,'$map')
            const optCode = eval(fixedCode)
            const inst = optCode(sample, {});
            return {vars, model, inst};
        })
    }
})
