dsl('webAsm')
extension('webAsm', 'Wat', {
  expToWat(ctx,{op, indent} = {}) {
    const profile = ctx.profile
    if (typeof profile == 'string')
      return `(local.get ${profile})`
    if (typeof profile == number)
      return `(${ctx.vars.defaultType}.const ${profile})`
  
    const pt = profile.$
    const simd = pt.indexOf('simd') != -1
    const comp = jb.comps[ctx.profile.$$]
    const params = comp.params.filter(p=>p.id != 'type' && p.id != 'signed' ).map(p=>ctx.params[p]).join(' ')
    const type = profile.type || (simd ? ctx.vars.simdDefaultType : ctx.vars.defaultType)
    const signed = profile.signed || ctx.vars.defaultSigned
    
    return comp.impl.$ != 'func' ? `(${type}.${op||pt} ${params})` : `(call $${profile} ${funcArgs()})`

    function funcArgs() {
      return 'TBD'
    }
  }
})

component('mainFunc', {
  type: 'exp',
  params: [
    {id: 'locals', type: 'localDef', dynamic: true},
    {id: 'body', type: 'exp[]', dynamic: true},
    {id: 'result', options: 'noResult,i32,i64,f32,f64,v128'},
    {id: 'defaultType', options: 'i32,i64,f32,f64'},
    {id: 'simdDefaultType', options: '8x16,16x8,32x4,64x2'}
  ],
  impl: typeAdapter('data<>', pipe(
    Var('defaultType', '%$defaultType%'),
    Var('simdDefaultType', '%$simdDefaultType%'),
    Var('funcName', ctx=>ctx.path.split('~')[0]),
    Var('bodyWat', join('\n', { items: '%$body()%' })),
    Var('localsWat', '%$locals{}%'),
    Var('callerParams', ctx => ctx.cmpCtx.cmpCtx.params),
    Var('paramsWat', join(' ', { items: values('%$callerParams%'), itemText: '(param $%id% %asmType%)' })),
    Var('mem', '%$callerParams/mem%', { async: true }),
    Var('memoryWat', If('%$mem%', '(import "js" "mem" (memory %$mem/noOfPages%))')),
    Var('resultWat', Switch(Case('%$result%==noResult', ''), Case('%$result%', '(result %$result%)'), {
      default: '(result %$defaultType%)'
    })),
    Var({
      name: 'wasmCode',
      val: compileWAT(`(module %$memoryWat% (func $%$funcName% (export "%$funcName%") %$paramsWat% %$resultWat% 
%$localsWat%
 %$bodyWat%
))`),
      async: true
    }),
    Var({
      name: 'func',
      val: (ctx,{wasmCode}, {funcName,mem,watCode}) => jb.webAsm.WATFunc(wasmCode, funcName, mem, {watCode, ctx}),
      async: true
    }),
    Var({
      name: 'args',
      val: ({},{mem, callerParams}) => jb.utils.waitForInnerElements(mem ? [0,mem.length, ...Object.values(callerParams).slice(1)] : Object.values(callerParams)),
      async: true
    }),
    ({},{func, args}) => func(args)
  ))
})

component('text', {
  type: 'memory',
  params: [
    {id: 'text', as: 'string'},
  ],
  impl: (ctx,text) => {
    const encodedText = new TextEncoder().encode(text)
    const noOfPages = Math.ceil(encodedText.length / 65536)
    const mem = new WebAssembly.Memory({ initial: noOfPages })
    new Uint8Array(mem.buffer).set(encodedText, 0)
    return { mem, length: encodedText.length, noOfPages }
  }
})

component('fileContent', {
  type: 'memory',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: text({ vars: [
    Var('text', fileContent('%$path%'), { async: true })
  ], text: '%$text%' })
})

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

component('locals', {
  type: 'localDef',
  params: [
    {id: 'locals', type: 'localDef[]'}
  ],
  impl: typeAdapter('data<>', join(' ', { items: '%$locals%' }))
})
component('local', {
  type: 'localDef',
  params: [
    {id: 'name', as: 'string', templateValue: ''},
    {id: 'type', as: 'string', options: 'i32,i64,f32,f64,v128'}
  ],
  impl: typeAdapter('data<>', pipeline(Var('t', firstSucceeding('%$type%','%$defaultType%')), '(local $%$name% %$t%)'))
})

component('add', {
  type: 'exp',
  params: [
    {id: 'x', type: 'exp'},
    {id: 'y', type: 'exp'},
    {id: 'type', options: 'i32,i64,f32,f64,v128'}
  ],
  impl: jb.webAsm.expToWat
})

component('and', {
  type: 'exp',
  params: [
    {id: 'x', type: 'exp' },
    {id: 'y', type: 'exp' },
    {id: 'type', options: 'i32,i64,f32,f64,v128'},
  ],
  impl: jb.webAsm.expToWat
})

component('shiftRight', {
  type: 'exp',
  params: [
    {id: 'x', type: 'exp'},
    {id: 'noOfBits', type: 'exp', byName: true},
    {id: 'type', options: 'i32,i64,f32,f64,v128'}
  ],
  impl: ctx => jb.webAsm.expToWat(ctx,'shr_u')
})

component('set', {
  type: 'exp',
  description: 'local or global',
  params: [
    {id: 'name', as: 'string', templateValue: ''},
    {id: 'val', type: 'exp', templateValue: ''},
  ],
  impl: ctx => jb.webAsm.setExpToWat(ctx)
})

component('addTo', {
  type: 'exp',
  description: 'local or global',
  params: [
    {id: 'name', as: 'string', templateValue: ''},
    {id: 'val', type: 'exp', templateValue: ''}
  ],
  impl: set('%$name%', add('%$name%', '%$val%'))
})

component('load', {
  type: 'exp',
  params: [
    {id: 'offset', type: 'exp', templateValue: ''},
    {id: 'type', options: 'i32,i64,f32,f64,v128'},
  ],
  impl: jb.webAsm.expToWat
})

component('load_8u', {
  type: 'exp',
  params: [
    {id: 'offset', type: 'exp', templateValue: ''},
    {id: 'type', options: 'i32,i64,f32,f64,v128'},
  ],
  impl: jb.webAsm.expToWat
})

component('store', {
  type: 'exp',
  params: [
    {id: 'offset', type: 'exp', templateValue: ''},
    {id: 'val', type: 'exp', templateValue: ''},
    {id: 'type', options: 'i32,i64,f32,f64,v128'},
  ],
  impl: jb.webAsm.expToWat
})

component('loop', {
  type: 'exp',
  params: [
    {id: 'until', type: 'condition', templateValue: ''},
    {id: 'do', type: 'exp[]', templateValue: []},
    {id: 'label', as: 'string', defaultValue: ()=>jb.webAsm.newLabel() },
  ],
  impl: '(loop $%$label% (block $%$label%_exit (br_if $%$label%_exit %$until%) /n %$body% /n (br $%$label%) ))'
})

component('equals', {
  type: 'condition',
  params: [
    {id: 'v1', type: 'exp', templateValue: ''},
    {id: 'v2', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: 'i32,i64,f32,f64,v128'},
    {id: 'signed', as: 'boolean', type: 'boolean<>'}
  ],
  impl: ctx => jb.webAsm.expToWat(ctx,'eq')
})

component('gt', {
  type: 'condition',
  params: [
    {id: 'v1', type: 'exp', templateValue: ''},
    {id: 'v2', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: 'i32,i64,f32,f64,v128'},
    {id: 'signed', as: 'boolean', type: 'boolean<>'}
  ],
  impl: jb.webAsm.expToWat
})

component('gte', {
  type: 'condition',
  params: [
    {id: 'v1', type: 'exp', templateValue: ''},
    {id: 'v2', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: 'i32,i64,f32,f64,v128'},
    {id: 'signed', as: 'boolean', type: 'boolean<>'}
  ],
  impl: jb.webAsm.expToWat
})

component('isZero', {
  type: 'condition',
  params: [
    {id: 'v', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: 'i32,i64,f32,f64,v128'}
  ],
  impl: ctx => jb.webAsm.expToWat(ctx,'eqz')
})

component('notZero', {
  type: 'condition',
  params: [
    {id: 'v', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: 'i32,i64,f32,f64,v128'}
  ],
  impl: isZero(typeAdapter('condition<webAsm>', isZero('%$v%','%$type%')),'%$type%')
})

component('simd128.splat', {
  type: 'exp',
  description: 'initialize all lanes to value. no of lanes are 128/type',
  params: [
    {id: 'value', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: '8x16,16x8,32x4,64x2'}
  ]
})

component('simd128.add', {
  type: 'exp',
  description: 'no of lanes are 128/type',
  params: [
    {id: 'v1', type: 'exp', templateValue: ''},
    {id: 'v2', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: '8x16,16x8,32x4,64x2'}
  ]
})

component('simd128.equals', {
  type: 'exp',
  description: 'no of lanes are 128/type',
  params: [
    {id: 'v1', type: 'exp', templateValue: ''},
    {id: 'v2', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: '8x16,16x8,32x4,64x2'}
  ]
})

component('simd128.bitmask', {
  type: 'exp',
  description: 'takes the first byte of each lane',
  params: [
    {id: 'v1', type: 'exp', templateValue: ''},
    {id: 'type', as: 'string', options: '8x16,16x8,32x4,64x2'}
  ]
})
