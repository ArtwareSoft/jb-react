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
    {id: 'id', as: 'string', mandatory: true},
    {id: 'imageF', dynamic: true, mandatory: true}
  ],
  impl: (ctx,glVar,imageF) => [
    {glVar, glType: 'sampler2D', glMethod: '1i', imageF},
    {glVar: `${glVar}Size`, glType: 'vec2', glMethod: '2fv', val: ctx => imageF(ctx).textureSize },
  ]
})

component('textureOfText', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'text', dynamic: true, mandatory: true},
    {id: 'font', as: 'string', defaultValue: '500 16px Arial'}
  ],
  impl: (ctx,glVar,text,font) => ({glVar, glType: 'sampler2D', glMethod: '1i', text, font })
})

component('intVec', {
  type: 'uniform',
  macroByValue: true,
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'size', as: 'number', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,glVar,size,val) => ({glVar, val, glType: 'int', glMethod: '1iv', vecSize: size})
})

component('vec3Vec', {
  type: 'uniform',
  macroByValue: true,
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'size', as: 'number', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,glVar,size,val) => ({glVar, val, glType: 'vec3', glMethod: '3fv', vecSize: size})
})

component('int', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,glVar,val) => ({glVar, val, glType: 'int', glMethod: '1i'})
})

component('float', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string'},
    {id: 'val', dynamic: true},
  ],
  impl: (ctx,glVar,val) => ({glVar, val, glType: 'float', glMethod: '1f'})
})

component('vec2', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,glVar,val) => ({glVar, val, glType: 'vec2', glMethod: '2fv'})
})

component('vec3', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,glVar,val) => ({glVar, val, glType: 'vec3', glMethod: '3fv'})
})

component('canvasSize', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true}
  ],
  impl: vec2('canvasSize', '%$canvasSize%')
})