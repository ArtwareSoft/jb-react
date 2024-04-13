dsl('webAsm')

component('module', {
  type: 'module',
  params: [
    {id: 'name', as: 'string'},
    {id: 'functionNames', type: 'data<>[]', byName: true},
    {id: 'imports', as: 'import[]'}
  ]
})

component('global', {
  type: 'import',
  params: [
    {id: 'name', as: 'string' },
    {id: 'type', as: 'string', options: 'i32,i64,f32,f64,v128'}
  ]
})

component('memory', {
  type: 'import',
  params: [
    {id: 'pages', as: 'number', defaultValue: 1 },
  ]
})

component('params', {
  type: 'param',
  params: [
    {id: 'params', type: 'param[]'}
  ]
})
component('param', {
  type: 'param',
  params: [
    {id: 'name', as: 'string', templateValue: ''},
    {id: 'type', as: 'string', options: 'i32,i64,f32,f64,v128'}
  ]
})

component('locals', {
  type: 'localDef',
  params: [
    {id: 'locals', type: 'localDef[]'}
  ]
})
component('local', {
  type: 'localDef',
  params: [
    {id: 'name', as: 'string', templateValue: ''},
    {id: 'type', as: 'string', options: 'i32,i64,f32,f64,v128'}
  ]
})

// --- functions and args - exp

component('func', {
  type: 'exp',
  params: [
    {id: 'body', type: 'exp[]'},
    {id: 'locals', type: 'localDef[]'},
    {id: 'result', options: 'noResult,i32,i64,f32,f64,v128'},
    {id: 'export', as: 'boolean', type: 'boolean<>'},
    {id: 'defaultType', options: 'i32,i64,f32,f64'},
    {id: 'smidDefaultType', options: 'i8,i16,i32,i64,f32,f64'},
  ]
})

component('JSfunc', {
  type: 'exp',
  params: [
    {id: 'name', as: 'string' },
  ]
})

component('add', {
  type: 'exp',
  params: [
    {id: 'x', type: 'exp' },
    {id: 'y', type: 'exp' },
    {id: 'type', options: 'i32,i64,f32,f64,v128'},
  ]
})

component('param', {
  type: 'exp',
  params: [
    {id: 'name', as: 'string', templateValue: ''},
  ]
})

component('local', {
  type: 'exp',
  params: [
    {id: 'name', as: 'string', templateValue: ''},
  ]
})

component('global', {
  type: 'exp',
  params: [
    {id: 'name', as: 'string', templateValue: ''},
  ]
})

component('set', {
  type: 'exp',
  description: 'local or global',
  params: [
    {id: 'name', as: 'string', templateValue: ''},
    {id: 'val', type: 'exp', templateValue: ''},
  ]
})

component('load', {
  type: 'exp',
  params: [
    {id: 'offset', type: 'exp', templateValue: ''},
    {id: 'type', options: 'i32,i64,f32,f64,v128'}
  ]
})

component('store', {
  type: 'exp',
  params: [
    {id: 'offset', type: 'exp', templateValue: ''},
    {id: 'val', type: 'exp', templateValue: ''},
    {id: 'type', options: 'i32,i64,f32,f64,v128'},
  ]
})

component('Const', {
  type: 'exp',
  params: [
    {id: 'value', as: 'string', templateValue: ''},
    {id: 'type', as: 'string', options: 'i32,i64,f32,f64,v128'}
  ]
})

component('call', {
  type: 'exp',
  params: [
    {id: 'funcName', as: 'string', templateValue: ''},
    {id: 'args', type: 'arg[]', secondParamAsArray: true },
    {id: 'module', as: 'string', byName: true},
  ]
})

component('loop', {
  type: 'exp',
  params: [
    {id: 'label', as: 'string', templateValue: ''},
    {id: 'body', type: 'exp[]', templateValue: []}
  ]
})

component('While', {
  type: 'exp',
  params: [
    {id: 'cond', type: 'condition', templateValue: ''},
    {id: 'do', type: 'exp[]', templateValue: []},
    {id: 'label', as: 'string'},
  ]
})

component('branchIf', {
  type: 'exp',
  params: [
    {id: 'gotoLabel', as: 'string' },
    {id: 'if', type: 'condition', templateValue: ''},
  ]
})

component('branch', {
  type: 'exp',
  params: [
    {id: 'gotoLabel', as: 'string' },
  ]
})

component('gt', {
  type: 'condition',
  params: [
    {id: 'v1', type: 'exp', templateValue: ''},
    {id: 'v2', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: 'i32,i64,f32,f64,v128'},
    {id: 'signed', as: 'boolean', type: 'boolean<>'}
  ]
})

component('gte', {
  type: 'condition',
  params: [
    {id: 'v1', type: 'exp', templateValue: ''},
    {id: 'v2', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: 'i32,i64,f32,f64,v128'},
    {id: 'signed', as: 'boolean', type: 'boolean<>'}
  ]
})

component('smid128.splat', {
  type: 'exp',
  description: 'initialize all lanes to value. no of lanes are 128/type',
  params: [
    {id: 'value', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: 'i8,i16,i32,i64,f32,f64'}
  ]
})

component('smid128.add', {
  type: 'exp',
  description: 'no of lanes are 128/type',
  params: [
    {id: 'v1', type: 'exp', templateValue: ''},
    {id: 'v2', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: 'i8,i16,i32,i64,f32,f64'}
  ]
})

component('smid128.equals', {
  type: 'exp',
  description: 'no of lanes are 128/type',
  params: [
    {id: 'v1', type: 'exp', templateValue: ''},
    {id: 'v2', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: 'i8,i16,i32,i64,f32,f64'}
  ]
})


component('add32', {
  impl: func('add', params('x','y'), { defaultType: 'i32', body: add('x', 'y') })
})

component('add1', {
  params: [
    {id: 'x', type: 'exp'}
  ],
  impl: func(add(Const('1'), 'x'), { defaultType: 'i32' })
})

component('getAnswer', {
  impl: func(Const('42'), { defaultType: 'i32' })
})

component('addOneTogetAnswer', {
  impl: func(add1(getAnswer()))
})