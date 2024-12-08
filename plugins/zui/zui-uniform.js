dsl('zui')

component('uniforms', {
  type: 'uniform',
  params: [
    {id: 'uniforms', type: 'uniform[]', composite: true},
  ],
  impl: (ctx,uniforms) => ({ composite: true, uniforms})
})

component('texture', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true},
    {id: 'imageF', dynamic: true, mandatory: true}
  ],
  impl: (ctx,glVar,imageF) => [
    {glVar, glType: 'sampler2D', glMethod: '1i', imageF},
    {glVar: ctx => `${glVar(ctx)}Size`, glType: 'vec2', glMethod: '2fv', val: ctx => imageF(ctx).textureSize },
  ]
})

component('intVec', {
  type: 'uniform',
  macroByValue: true,
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true},
    {id: 'size', as: 'number', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,glVar,size,val) => ({glVar, val, glType: 'int', glMethod: '1iv', vecSize: size})
})

component('vec3Vec', {
  type: 'uniform',
  macroByValue: true,
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true},
    {id: 'size', as: 'number', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,glVar,size,val) => ({glVar, val, glType: 'vec3', glMethod: '3fv', vecSize: size})
})

component('int', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,glVar,val) => ({glVar, val, glType: 'int', glMethod: '1i'})
})

component('float', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true},
    {id: 'val', dynamic: true},
  ],
  impl: (ctx,glVar,val) => ({glVar, val, glType: 'float', glMethod: '1f'})
})

component('vec2', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,glVar,val) => ({glVar, val, glType: 'vec2', glMethod: '2fv'})
})

component('vec3', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,glVar,val) => ({glVar, val, glType: 'vec3', glMethod: '3fv'})
})

component('vec4', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true},
    {id: 'val', dynamic: true, mandatory: true}
  ],
  impl: (ctx,glVar,val) => ({glVar, val, glType: 'vec4', glMethod: '4fv'})
})

component('canvasSize', {
  type: 'uniform',
  impl: vec2('canvasSize', '%$canvasSize%')
})