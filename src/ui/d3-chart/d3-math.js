jb.ns('d3Chart,d3Scatter,d3Histogram')

jb.component('d3-chart.pivot', { /* d3Chart.pivot */
  type: 'd3-chart.pivot',
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'value', as: 'string', mandatory: true, dynamic: true},
    {
      id: 'scale',
      type: 'd3-chart.scale',
      dynamic: true,
      defaultValue: d3Chart.linearScale()
    },
    {
      id: 'range',
      type: 'd3-chart.range',
      dynamic: true,
      defaultValue: d3Chart.autoRange()
    },
    {
      id: 'domain',
      type: 'd3-chart.domain',
      dynamic: true,
      defaultValue: d3Chart.domainByValues()
    }
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

jb.component('d3-chart.linear-scale', { /* d3Chart.linearScale */
  type: 'd3-chart.scale',
  impl: ctx => d3.scaleLinear()
})

jb.component('d3-chart.sqrt-scale', { /* d3Chart.sqrtScale */
  type: 'd3-chart.scale',
  impl: ctx => d3.scaleSqrt()
})

jb.component('d3-chart.ordinal-scale', { /* d3Chart.ordinalScale */
  type: 'd3-chart.scale',
  params: [
    {id: 'list', as: 'array'}
  ],
  impl: (ctx,list) => d3.scaleOrdinal(list)
})

jb.component('d3-chart.colors', { /* d3Chart.colors */
  type: 'd3-chart.scale',
  impl: d3Chart.ordinalScale(
    ctx => d3.schemeCategory20
  )
})

jb.component('d3-chart.auto-range', { /* d3Chart.autoRange */
  type: 'd3-chart.range',
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

jb.component('d3-chart.from-to', { /* d3Chart.fromTo */
  type: 'd3-chart.range',
  params: [
    {id: 'from', as: 'number'},
    {id: 'to', as: 'number'}
  ],
  impl: (ctx,from,to) => ([from,to])
})

jb.component('d3-chart.domain-by-values', { /* d3Chart.domainByValues */
  type: 'd3-chart.domain',
  impl: ctx => d3.extent(ctx.vars.items, ctx.vars.valFunc)
})

