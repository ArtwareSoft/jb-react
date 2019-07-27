jb.component('d3.pivot', {
	type: 'd3.pivot',
	params: [
	    { id: 'title', as: 'string', mandatory: true },
	    { id: 'value', as: 'string', mandatory: true, dynamic: true },
		{ id: 'scale', type: 'd3.scale', dynamic: true, defaultValue: {$: 'd3.linear-scale' } },
		{ id: 'range', type: 'd3.range', dynamic: true, 
			defaultValue: {$: 'd3.auto-range'} },
		{ id: 'domain', type: 'd3.domain', dynamic: true, 
			defaultValue: {$: 'd3.domain-by-values'} },
	],
	impl: (ctx,title,value,scaleFunc,range,domain) => ({
			init: function(ctx2) {
				var scale = scaleFunc(ctx2);
				this.range = range(ctx2);
				this.domain = domain(ctx2.setVars({valFunc: this.valFunc}));
				this.scale = scale.range(this.range).domain(this.domain);
				return this;
			},
			title: title, 
			valFunc: x => { 
				var out = value(ctx.setData(x));
				return +out || out;
			}
	})
})

jb.component('d3.linear-scale', {
	type: 'd3.scale',
	impl: ctx => d3.scaleLinear()
})

jb.component('d3.sqrt-scale', {
	type: 'd3.scale',
	impl: ctx => d3.scaleSqrt()
})

jb.component('d3.ordinal-scale', {
	type: 'd3.scale',
	params: [
		{ id: 'list', as: 'array' }
	],
	impl: (ctx,list) => d3.scaleOrdinal(list)
})

jb.component('d3.colors', {
	type: 'd3.scale',
	impl: {$: 'd3.ordinal-scale', list: ctx => d3.schemeCategory20 }
})

jb.component('d3.auto-range', {
	type: 'd3.range',
	impl: ctx => {
		if (ctx.vars.yAxis)
		  return [ctx.vars.frame.innerHeight,0]
		if (ctx.vars.xAxis)
		  return [0, ctx.vars.frame.innerWidth]
		if (ctx.vars.rAxis)
		  return [2,20]
		return [0,10]
	}
})

jb.component('d3.from-to', {
	type: 'd3.range',
	params: [
		{ id: 'from', as: 'number'},
		{ id: 'to', as: 'number'},
	],
	impl: (ctx,from,to) => ([from,to])
})

jb.component('d3.domain-by-values', {
	type: 'd3.domain',
	impl: ctx => d3.extent(ctx.vars.items, ctx.vars.valFunc)
})

jb.component('d3.histogram', {
	type: 'aggregator',
	params: [
		{ id: 'bins', as: 'number', defaultValue: 20 },
		{ id: 'values', as:'array', defaultValue: '%%'},
	],
	impl: (ctx,bins,values) => d3.histogram()(values)
})
