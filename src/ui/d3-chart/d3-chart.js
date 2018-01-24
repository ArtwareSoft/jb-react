
jb.component('d3.pivot', {
	type: 'd3.pivot',
	params: [
	    { id: 'title', as: 'string', essential: true },
	    { id: 'value', as: 'string', essential: true, dynamic: true },
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

jb.component('d3.chart-scatter', {
  	type: 'control', category: 'group:80,common:70',
	params: [
	    { id: 'title', as: 'string' },
		{ id: 'items', as: 'array', dynamic: true, essential: true },
		{ id: 'frame', type: 'd3.frame', defaultValue :{$: 'd3.frame', width: 1400, height: 500, 
				top: 30, right: 50, bottom: 40, left: 60 } },
	    { id: 'pivots', type: 'd3.pivot[]', essential: true, dynamic: true },
	    { id: 'itemTitle', as: 'string', dynamic: true },
	    { id: 'visualSizeLimit', as: 'number' },
	    { id: 'style', type: 'd3.scatter-style', dynamic: true , defaultValue: {$: 'd3-scatter.plain' } },
	    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
	],
 	impl: ctx =>
    	jb.ui.ctrl(ctx)
})

jb.component('d3-scatter.plain', {
	type: 'd3.scatter-style',
  	impl :{$: 'custom-style',
    	template: (cmp,state,h) => h('svg',{width: cmp.width, height: cmp.height},
    	  h('g', { transform: 'translate(' + cmp.left + ',' + cmp.top + ')' },
    		[
    			h('g',{ class: 'x axis', transform: 'translate(0,' + cmp.innerHeight + ')'}),
    			h('g',{ class: 'y axis', transform: 'translate(0,0)'}),
    			h('text', { class: 'label', x: 10, y: 10}, cmp.yPivot.title),
    			h('text', { class: 'label', x: cmp.innerWidth, y: cmp.innerHeight - 10, 'text-anchor': 'end'}, cmp.xPivot.title),
    			h('text', { class: 'note', x: cmp.innerWidth, y: cmp.height - cmp.top, 'text-anchor': 'end' }, '' + cmp.state.items.length + ' items'),
    		].concat(
    		state.items.map((item,index)=> h('circle',{ 
    			class: 'bubble', 
    			cx: cmp.xPivot.scale(cmp.xPivot.valFunc(item)), 
    			cy: cmp.yPivot.scale(cmp.yPivot.valFunc(item)), 
    			r: cmp.rPivot.scale(cmp.rPivot.valFunc(item)), 
    			fill: cmp.colorPivot.scale(cmp.colorPivot.valFunc(item)), 
    		},h('title',{x: cmp.rPivot.scale(cmp.xPivot.valFunc(item))}, cmp.itemTitle(cmp.ctx.setData(item)) )
    	))))),
    	features :{$: 'd3-scatter.init'},
    	css: `>g>.label { font-size: 15px; text-transform: capitalize }
>g>.note { font-size: 10px; }
.legend text,
.legend rect { fill-opacity: 0.75 }
.legend:hover rect { fill-opacity:1 }
>g>.axis text { font-size: 13px; fill: #333;  }
>g>.axis path,
>g>.axis line { fill: none;stroke-width: 1px; stroke: #777 }
>g>circle { fill-opacity: 0.3; stroke-width: 2px; }
>g>.bubble { opacity: 1;transition: opacity 0.3s }
>g>.bubble:hover text {opacity: 1 }
>g>.bubble:hover circle {	fill-opacity: 1 }
`
  }
})

jb.component('d3-scatter.init', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        cmp.state.items = calcItems();
        cmp.pivots = ctx.vars.$model.pivots();
        var x = cmp.pivots[0],y = cmp.pivots[1],radius = cmp.pivots[2],color = cmp.pivots[3];

		var ctx2 = ctx.setVars({items: cmp.state.items, frame: ctx.vars.$model.frame});
		Object.assign(cmp, {
			xPivot: x.init(ctx2.setVars({xAxis: true})),
			yPivot: y.init(ctx2.setVars({yAxis: true})),
			rPivot: radius.init(ctx2.setVars({rAxis: true})),
			colorPivot: color.init(ctx2.setVars({colorAxis: true})),
			itemTitle: ctx.vars.$model.itemTitle
		}, ctx.vars.$model.frame );
		cmp.colorPivot.scale = d3.scaleOrdinal(d3.schemeCategory20); //.domain(cmp.colorPivot.domain);

        cmp.refresh = _ =>
            cmp.setState({items: calcItems()})

        if (ctx.vars.$model.watchItems)
          jb.ui.watchRef(ctx,cmp,ctx.vars.$model.items(cmp.ctx))

        function calcItems() {
          cmp.items = jb.toarray(jb.val(ctx.vars.$model.items(cmp.ctx)));
          if (cmp.ctx.vars.itemlistCntr)
              cmp.ctx.vars.itemlistCntr.items = cmp.items;
          //extendItemsWithCalculatedFields();
          cmp.sortItems && cmp.sortItems();
          return cmp.items.slice(0,ctx.vars.$model.visualSizeLimit || 100);
        }

        function extendItemsWithCalculatedFields() {
          cmp.pivots.filter(f=>f.extendItems).forEach(f=>
            cmp.items.forEach(item=>item[f.title] = f.calcFieldData(item)))
        }
      },
      afterViewInit: cmp => {
      	d3.select(cmp.base.querySelector('.x.axis')).call(d3.axisBottom().scale(cmp.xPivot.scale));
      	d3.select(cmp.base.querySelector('.y.axis')).call(d3.axisLeft().scale(cmp.yPivot.scale));
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

jb.component('d3.frame', {
	type: 'd3.frame',
	params: [
		{id: 'width', as: 'number', defaultValue: 900 },
		{id: 'height', as: 'number', defaultValue: 600 },
		{id: 'top', as: 'number' , defaultValue: 20},
		{id: 'right', as: 'number', defaultValue: 20 },
		{id: 'bottom', as: 'number', defaultValue: 20 },
		{id: 'left', as: 'number', defaultValue: 20 },
	],
	impl : ctx => Object.assign({},ctx.params,{
			innerWidth: ctx.params.width - ctx.params.left - ctx.params.right,
			innerHeight: ctx.params.height - ctx.params.top - ctx.params.bottom,
	})
})
