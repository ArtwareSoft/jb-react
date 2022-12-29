  
jb.component('axes', {
    type: 'axis',
    params: [
      {id: 'axes', type: 'axis[]', as: 'array', composite: true}
    ],
    impl: (ctx,axes) => axes.flatMap(x=> Array.isArray(x) ? x: [x])
})
  
jb.component('x', {
    type: 'axis',
    impl: ctx => ({ id: 'x', ...ctx.params })
})
  
jb.component('y', {
    type: 'axis',
    impl: ctx => ({ id: 'y', ...ctx.params })
})
  
jb.component('z', {
    type: 'axis',
    impl: ctx => ({ id: 'z', ...ctx.params })
})
  
jb.component('fillColor', {
    type: 'axis',
    params: [
    ],
    impl: ctx => ({ id: 'fillColor', ...ctx.params })
})
  
jb.component('lineColor', {
    type: 'axis',
    params: [
    ],
    impl: ctx => ({ id: 'lineColor', ...ctx.params })
})
  
jb.component('lineFormat', {
  type: 'axis',
  params: [
    
  ],
  impl: ctx => ({ id: 'lineFormat', ...ctx.params })
})
  
jb.component('shape', {
  type: 'axis',
  params: [
    
  ],
  impl: ctx => ({ id: 'shape', ...ctx.params })
})
  
jb.component('radius', {
    type: 'axis',
    params: [
      
    ],
    impl: ctx => ({ id: 'radius', ...ctx.params })
})
  