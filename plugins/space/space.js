jb.extension('space', {
  $requireLibs: ['/dist/d3-scale.js'],
  d3: () => jb.frame.d3
})

// **** pivots 
jb.component('space.pivots', {
  type: 'feature',
  category: 'itemlist:80',
  params: [
    {id: 'pivots', type: 'space.pivot[]', dynamic: true, flattenArray: true, defaultValue: []}
  ],
  impl: calcProp('pivots','%$pivots()%')
})

jb.component('pivot.field', {
  type: 'space.pivot',
  params: [
    {id: 'title', mandatory: true, as: 'string' },
    {id: 'data', dynamic: true, description: 'default behavior uses the title as property name'},
    {id: 'scale', type: 'space.scale', dynamic: true, defaultValue: scale.linear()},
    {id: 'domain', type: 'space.domain', dynamic: true, defaultValue: domain.byValues()},
    {id: 'preferedAxis', type: 'space.axis' },
  ],
  impl: ctx => ctx.params
})

// *** Axes

jb.component('space.virtualAxes', {
  type: 'feature',
  category: 'itemlist:80',
  params: [
    {id: 'axes', type: 'space.axis[]', dynamic: true, flattenArray: true, defaultValue: [] }
  ],
  impl: calcProp('axes','%$axes()%')
})

jb.component('axis.axes', {
  type: 'space.axis',
  params: [
    {id: 'axes', type: 'space.axis[]', as: 'array', composite: true}
  ],
  impl: (ctx,axes) => axes.flatMap(x=> Array.isArray(x) ? x: [x])
})

jb.component('axis.x', {
  type: 'space.axis',
  params: [
    {id: 'style', type: 'space.axisStyle', dynamic: true}
  ],
  impl: ctx => ({ axis: 'x', ...ctx.params })
})

jb.component('axis.y', {
  type: 'space.axis',
  params: [
    {id: 'style', type: 'space.axisStyle', dynamic: true}
  ],
  impl: ctx => ({ axis: 'y', ...ctx.params })
})

jb.component('axis.z', {
  type: 'space.axis',
  params: [
    {id: 'style', type: 'space.axisStyle', dynamic: true}
  ],
  impl: ctx => ({ axis: 'z', ...ctx.params })
})

jb.component('axis.color', {
  type: 'space.axis',
  params: [
  ],
  impl: ctx => ({ axis: 'color', ...ctx.params })
})

jb.component('axis.lineColor', {
  type: 'space.axis',
  params: [
  ],
  impl: ctx => ({ axis: 'lineColor', ...ctx.params })
})

jb.component('axis.lineFormat', {
  type: 'space.axis',
  params: [
  ],
  impl: ctx => ({ axis: 'lineFormat', ...ctx.params })
})

jb.component('axis.shape', {
  type: 'space.axis',
  params: [
  ],
  impl: ctx => ({ axis: 'shape', ...ctx.params })
})

jb.component('axis.shapeRadius', {
  type: 'space.axis',
  params: [
    
  ],
  impl: ctx => ({ axis: 'shapeRadius', ...ctx.params })
})

// *** Pivot-Axes match

jb.component('space.PivotAxesMatch', {
  type: 'feature',
  category: 'itemlist:80',
  params: [
    {id: 'rules', type: 'space.matchRule[]', dynamic: true, flattenArray: true, defaultValue: []}
  ],
  impl: calcProp('PivotAxesMatch','%$rules()%')
})

jb.component('pivotAxesMatch.smart', {
  type: 'space.matchRule',
  impl: ctx => ({ rule: 'smart', ...ctx.params })
})

// *** scales
jb.component('scale.linear', {
  type: 'space.scale',
  impl: ctx => jb.space.d3().scaleLinear()
})

jb.component('scale.sqrt', {
  type: 'space.scale',
  impl: ctx => jb.space.d3().scaleSqrt()
})

jb.component('scale.band', {
  type: 'space.scale',
  params: [
    {id: 'paddingInner', as: 'number', defaultValue: 1, description: 'range [0,1]'},
    {id: 'paddingOuter', as: 'number', defaultValue: 0.5, description: 'range [0,1]'},
    {id: 'align', as: 'number', defaultValue: 0.5, description: '0 - aligned left, 0.5 - centered, 1 - aligned right'}
  ],
  impl: (ctx,paddingInner,paddingOuter,align) => jb.space.d3().scaleBand().paddingInner(paddingInner).paddingOuter(paddingOuter).align(align)
})

jb.component('scale.ordinalColors', {
  type: 'space.scale',
  params: [
    {id: 'scale', as: 'string', options: 'schemeCategory10,schemeAccent,schemePaired,schemeDark2,schemeSet3', defaultValue: 'schemeAccent'}
  ],
  impl: (ctx,scale) => jb.space.d3().scaleOrdinal(d3[scale])
})

jb.component('scale.interpolateColors', {
  type: 'space.scale',
  params: [
    {id: 'scale', as: 'string', options: 'Blues,Greens,Greys,Oranges,Reds,Turbo,Magma,Warm,Cool,Rainbow,BrBG,PRGn,PiYG,RdBu', defaultValue: 'Blues'}
  ],
  impl: (ctx,scale) => jb.space.d3().scaleSequential(d3['interpolate'+scale])
})

jb.component('scale.strechByValues', {
  type: 'space.scale',
  impl: ctx => jb.space.d3().scaleLinear()
})

jb.component('range.auto', {
  type: 'space.range',
  impl: ctx => {
		if (ctx.vars.yAxis)
		  return [400,0] //[ctx.vars.frame.innerHeight,0]
		if (ctx.vars.xAxis)
		  return [0,400] // [0, ctx.vars.frame.innerWidth]
		if (ctx.vars.rAxis)
		  return [2,20]
		return [0,10]
	}
})

jb.component('range.fromTo', {
  type: 'space.range',
  params: [
    {id: 'from', as: 'number'},
    {id: 'to', as: 'number'}
  ],
  impl: (ctx,from,to) => ([from,to])
})

jb.component('domain.byValues', {
  type: 'space.domain',
  impl: ctx => {
    const vals = jb.utils.unique(ctx.vars.items.map(x=>ctx.vars.valFunc(x)))
    if (isNaN(+vals[0]))
      return vals
    return jb.space.d3().extent(vals)
  }
})

