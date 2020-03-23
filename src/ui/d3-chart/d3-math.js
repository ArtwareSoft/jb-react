jb.ns('d3g,d3Scatter,d3Histogram')

jb.component('d3g.pivot', {
  type: 'd3g.pivot',
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'value', as: 'string', mandatory: true, dynamic: true},
    {id: 'scale', type: 'd3g.scale', dynamic: true, defaultValue: d3g.linearScale()},
    {id: 'range', type: 'd3g.range', dynamic: true, defaultValue: d3g.autoRange()},
    {id: 'domain', type: 'd3g.domain', dynamic: true, defaultValue: d3g.domainByValues()},
    {id: 'axisControl', type: 'control', dynamic: true, defaultValue: button('%title%')}
  ],
  impl: (ctx,title,value,scaleFunc,range,domain,axisControl) => ({
    title,
    init: function(ctx2) {
				var scale = scaleFunc(ctx2);
				this.range = range(ctx2);
				this.domain = domain(ctx2.setVars({valFunc: this.valFunc}));
        this.scale = scale.range(this.range).domain(this.domain);
        this.axisControl = axisControl;
				return this;
    },
    valFunc: x => {
      var out = value(ctx.setData(x));
      return +out || out;
    }
	})
})

jb.component('d3g.linearScale', {
  type: 'd3g.scale',
  impl: ctx => d3.scaleLinear()
})

jb.component('d3g.sqrtScale', {
  type: 'd3g.scale',
  impl: ctx => d3.scaleSqrt()
})

jb.component('d3g.bandScale', {
  params: [
    {id: 'paddingInner', as: 'number', defaultValue: 1, description: 'range [0,1]'},
    {id: 'paddingOuter', as: 'number', defaultValue: 0.5, description: 'range [0,1]'},
    {id: 'align', as: 'number', defaultValue: 0.5, description: '0 - aligned left, 0.5 - centered, 1 - aligned right'}
  ],
  type: 'd3g.scale',
  impl: (ctx,paddingInner,paddingOuter,align) => d3.scaleBand().paddingInner(paddingInner).paddingOuter(paddingOuter).align(align)
})

jb.component('d3g.ordinalColors', {
  type: 'd3g.scale',
  params: [
    {id: 'scale', as: 'string', options: 'schemeCategory10,schemeAccent,schemePaired,schemeDark2,schemeSet3', defaultValue: 'schemeAccent'}
  ],
  impl: (ctx,scale) => d3.scaleOrdinal(d3[scale])
})

jb.component('d3g.interpolateColors', {
  type: 'd3g.scale',
  params: [
    {id: 'scale', as: 'string', options: 'Blues,Greens,Greys,Oranges,Reds,Turbo,Magma,Warm,Cool,Rainbow,BrBG,PRGn,PiYG,RdBu', defaultValue: 'Blues'}
  ],
  impl: (ctx,scale) => d3.scaleSequential(d3['interpolate'+scale])
})

jb.component('d3g.autoRange', {
  type: 'd3g.range',
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

jb.component('d3g.fromTo', {
  type: 'd3g.range',
  params: [
    {id: 'from', as: 'number'},
    {id: 'to', as: 'number'}
  ],
  impl: (ctx,from,to) => ([from,to])
})

jb.component('d3g.domainByValues', {
  type: 'd3g.domain',
  impl: ctx => {
    const vals = jb.unique(ctx.vars.items.map(x=>ctx.vars.valFunc(x)))
    if (isNaN(+vals[0]))
      return vals
    return d3.extent(vals)
  }
})

