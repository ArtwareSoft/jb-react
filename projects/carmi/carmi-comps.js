const { Expr, Token, Setter, Expression, SetterExpression, SpliceSetterExpression, TokenTypeData } = carmi.lang;

jb.component('carmi.map', {
	type: 'carmi.array',
	params: [
		{id: 'array', type: 'carmi.array' },
		{id: 'mapTo', type: 'carmi.exp', dynamic: true },
		{id: 'itemVar', as: 'string', defaultValue: 'val' },
	],
	impl: (ctx, array, mapTo, itemVar) => 
	({
		ast: new Expression([
			new Token('map'),
			mapTo(ctx.setVars({itemVar})).ast, 
			array.ast
		])
	})
})

jb.component('carmi.root', {
	type: 'carmi.array,carmi.exp',
	params: [
	],
	impl: ctx => ({
		ast: new Token('root')
	})
})

jb.component('carmi.not', {
	type: 'carmi.boolean,carmi.exp',
	params: [
		{id: 'of', type: 'carmi.exp', dynamic: true },
	],
	impl: (ctx, _of) => ({
		ast: new Expression([
			new Token('not'),
			(_of() || {ast: new Token('val')}).ast 
		])
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
        {id: 'sample' },
	],
	impl: (ctx, id, vars, setters, sample) => {
        const model = {}
        vars.forEach(v => model[v.id] = v.ast);
        setters.forEach(v => model[v.id] = v.ast);

        const compiler = 'optimizing';
        return carmi.compile(model, { compiler, debug: true }).then(sourceCode=> {
            const optCode = eval(sourceCode)
            const inst = optCode(sample, {});
            return { inst, model, sourceCode, optCode, setters}
        })
    }
})
