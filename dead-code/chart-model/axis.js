jb.dsl('chartModel')

component('axes', {
    type: 'axis',
    params: [
      {id: 'axes', type: 'axis[]', as: 'array', composite: true}
    ],
    impl: (ctx,axes) => axes.flatMap(x=> Array.isArray(x) ? x: [x])
})
  
component('x', {
    type: 'axis',
    impl: ctx => ({ id: 'x', ...ctx.params })
})
  
component('y', {
    type: 'axis',
    impl: ctx => ({ id: 'y', ...ctx.params })
})
  
component('z', {
    type: 'axis',
    impl: ctx => ({ id: 'z', ...ctx.params })
})
  
component('fillColor', {
    type: 'axis',
    params: [
    ],
    impl: ctx => ({ id: 'fillColor', ...ctx.params })
})
  
component('lineColor', {
    type: 'axis',
    params: [
    ],
    impl: ctx => ({ id: 'lineColor', ...ctx.params })
})
  
component('lineFormat', {
  type: 'axis',
  params: [
    
  ],
  impl: ctx => ({ id: 'lineFormat', ...ctx.params })
})
  
component('shape', {
  type: 'axis',
  params: [
    
  ],
  impl: ctx => ({ id: 'shape', ...ctx.params })
})
  
component('radius', {
    type: 'axis',
    params: [
      
    ],
    impl: ctx => ({ id: 'radius', ...ctx.params })
})
  