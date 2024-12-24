dsl('zui')

component('attsOfElements', {
  type: 'attribute',
  params: [
    {id: 'elements', as: 'array', dynamic: true},
    {id: 'attsOfElem', dynamic: true, type: 'attribute[]'}
  ],
  impl: (ctx,elems,attsOfElem) => ({ 
    composite: true,
    atts: ctx2 => elems(ctx2).flatMap(elem => attsOfElem(ctx2.setVars({elem})))
  })
})

component('float', {
  type: 'attribute',
  params: [
    {id: 'id', as: 'string'},
    {id: 'itemToFloat', dynamic: true},
  ],
  impl: (ctx,glVar, itemToFloat) => ({ 
      glVar,
      size: 1,
      glType: 'float',
      calc: ctx2 => ctx2.vars.items.map(item => itemToFloat(ctx2.setVars({item})))
  })
})

component('vec2', {
  type: 'attribute',
  params: [
    {id: 'id', as: 'string'},
    {id: 'itemToVec2', dynamic: true},
  ],
  impl: (ctx,glVar, itemToVec2) => ({ 
      glVar,
      size: 2,
      glType: 'vec2',
      calc: ctx2 => ctx2.vars.items.map(item => itemToVec2(ctx2.setVars({item})))
  })
})

component('vec3', {
  type: 'attribute',
  params: [
    {id: 'id', as: 'string'},
    {id: 'itemToVec3', dynamic: true},
  ],
  impl: (ctx,glVar, itemToVec3) => ({ 
      glVar,
      size: 3,
      glType: 'vec3',
      calc: ctx2 => ctx2.vars.items.map(item => itemToVec3(ctx2.setVars({item})))
  })
})

component('vec4', {
  type: 'attribute',
  params: [
    {id: 'id', as: 'string'},
    {id: 'itemToVec4', dynamic: true}
  ],
  impl: (ctx,glVar, itemToVec4) => ({ 
      glVar,
      size: 4,
      glType: 'vec4',
      calc: ctx2 => ctx2.vars.items.map(item => itemToVec4(ctx2.setVars({item})))
  })
})

// component('color', {
//   type: 'attribute',
//   params: [
//     {id: 'id', as: 'string'},
//     {id: 'colorScale', type: 'color_scale', mandatory: true},
//     {id: 'prop', type: 'itemProp', description: 'default prop is the view main pivot' },
//   ],
//   impl: (ctx,glVar, colorScale, prop) => ({ 
//       glVar,
//       size: 3,
//       glType: 'vec3',
//       calc(ctx2) {
//           const pivots = (prop || ctx2.vars.comp.props).pivots
//           const pivot = pivots && pivots()[0]
//           const linearScale = jb.path(pivot,'linearScale') || (() => 0)
//           return ctx.vars.items.map(item => {
//             const res = colorScale(linearScale(item))
//             if (isNaN(res[1])) debugger
//             return res
//           })
//       }
//   })
// })
