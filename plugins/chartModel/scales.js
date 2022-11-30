jb.dsl('chartModel')

jb.extension('d3', {
  $requireLibs: ['/dist/d3-scale.js'],
  lib: () => jb.frame.d3
})

jb.component('linear', {
  type: 'scale',
  impl: ctx => jb.d3.lib().scaleLinear()
})

jb.component('sqrt', {
  type: 'scale',
  impl: ctx => jb.d3.lib().scaleSqrt()
})

jb.component('band', {
  type: 'scale',
  params: [
    {id: 'paddingInner', as: 'number', defaultValue: 1, description: 'range [0,1]'},
    {id: 'paddingOuter', as: 'number', defaultValue: 0.5, description: 'range [0,1]'},
    {id: 'align', as: 'number', defaultValue: 0.5, description: '0 - aligned left, 0.5 - centered, 1 - aligned right'}
  ],
  impl: (ctx,paddingInner,paddingOuter,align) => jb.d3.lib().scaleBand().paddingInner(paddingInner).paddingOuter(paddingOuter).align(align)
})

jb.component('ordinalColors', {
  type: 'scale',
  params: [
    {id: 'scale', as: 'string', options: 'schemeCategory10,schemeAccent,schemePaired,schemeDark2,schemeSet3', defaultValue: 'schemeAccent'}
  ],
  impl: (ctx,scale) => jb.d3.lib().scaleOrdinal(jb.frame.d3[scale])
})

jb.component('interpolateColors', {
  type: 'scale',
  params: [
    {id: 'scale', as: 'string', options: 'Blues,Greens,Greys,Oranges,Reds,Turbo,Magma,Warm,Cool,Rainbow,BrBG,PRGn,PiYG,RdBu', defaultValue: 'Blues'}
  ],
  impl: (ctx,scale) => jb.d3.lib().scaleSequential(jb.frame.d3['interpolate'+scale])
})

// *** range
jb.component('auto', {
  type: 'range',
  impl: ({vars}) => {
        const { yAxis, xAxis, rAxis, frame } = vars || {}
        if (yAxis)
            return [jb.path(frame,'innerHeight') || 400,0]
        if (xAxis)
            return [0, jb.path(frame,'innerWidth') || 400]
        if (rAxis)
            return [2,20]
        return [0,10]
    }
})

jb.component('fromTo', {
  type: 'range',
  params: [
    {id: 'from', as: 'number'},
    {id: 'to', as: 'number'}
  ],
  impl: (ctx,from,to) => ([from,to])
})

// *** domain
jb.component('byValues', {
  type: 'domain',
  impl: ctx => {
    const vals = jb.utils.unique(ctx.vars.items.map(x=>ctx.vars.valFunc(x)))
    if (isNaN(+vals[0]))
      return vals
    return jb.d3.lib().extent(vals)
  }
})

