dsl('webAsm')

using('common','remote-jbm')

extension('webAsm', 'basic', {
    typeRules: [ { same: ['data<webAsm>','data<>']} ],
    async compileWAT(watCode, ctx) {
      const fs = require('fs')
      const { exec } = require('child_process')
      const os = require('os')
      const path = require('path')

      const tmpDir = os.tmpdir()
      const watFile = path.join(tmpDir, 'temp.wat'), wasmFile = path.join(tmpDir, 'temp.wasm')

      fs.writeFileSync(watFile, watCode)
      const {stdout, error,stderr} = await new Promise(resolve =>
          exec(`wat2wasm ${watFile} -o ${wasmFile}`, { encoding: 'buffer' }, (error, stdout, stderr) => resolve({stdout, error, stderr})))
      if (error)
        return jb.logError(`error compiling wat ${error.message}`,{watCode, ctx})
      const wasmCode = fs.readFileSync(wasmFile).toString('base64')
      return wasmCode
    },
    async WATFunc(wasmCode, funcName, mem, {watCode, ctx} = {}) {
        try {
          const wasmBuffer = jbHost.isNode ?  Buffer.from(wasmCode, 'base64') : Uint8Array.from(atob(wasmCode), c => c.charCodeAt(0)).buffer 
          const params = [wasmBuffer, ...[mem && { js: { mem } }].filter(x=>x)] // mem, table, imported_func , global
          const wasmModule = await WebAssembly.instantiate(...params)
          return (...params) => {
            const start = jbHost.isNode ? process.hrtime.bigint() : new Date().getTime()
            const res = wasmModule.instance.exports[funcName](...params)
            const end = jbHost.isNode ? process.hrtime.bigint() : new Date().getTime()
            const dur = end - start
            const duration = dur > 1000000n ? (Number(dur) / 1000000) : dur
            const unit = jbHost.isNode && dur === duration ? 'nanoSec' : 'mSec'
            return { res, duration: '' + duration, unit }
          }
        } catch (e) {
            return jb.logException(e,'WATFunc',{watCode, ctx})
        }
    }
})

component('compileWAT', {
  type: 'data<>',
  params: [
    {id: 'watCode', as: 'string', newLinesInCode: true}
  ],
  impl: nodeOnly((ctx,{},{watCode}) => jb.webAsm.compileWAT(watCode,ctx), plugins('web-asm'))
})

component('WATFunc', {
  type: 'data',
  params: [
    {id: 'watCode', as: 'string', newLinesInCode: true},
    {id: 'funcName', as: 'string'},
    {id: 'mem', type: 'memory'}
  ],
  impl: pipe(
    Var('wasmCode', compileWAT('%$watCode%'), { async: true }),
    (ctx,{wasmCode}, {funcName,mem,watCode}) => jb.webAsm.WATFunc(wasmCode, funcName, mem, {watCode, ctx})
  )
})

component('_addWithWAT', {
  params: [
    {id: 'x', as: 'number'},
    {id: 'y', as: 'number'}
  ],
  impl: pipe(
    WATFunc({
      watCode: '(module (func (export "add") (param i32 i32) (result i32) (i32.add (local.get 0) (local.get 1))))',
      funcName: 'add'
    }),
    ({data},{},{x,y}) => data(x,y),
    first()
  )
})

component('_countNL', {
  params: [
    {id: 'mem', type: 'memory'}
  ],
  impl: pipeline(
    Var('memory', '%$mem%', { async: true }),
    Var('func', WATFunc({
      watCode: `(module (import "js" "mem" (memory %$memory/noOfPages%))
        
        (func $count_newlines (export "count_newlines") (param $offset i32) (param $length i32) (result i32)
          (local $i i32)
          (local $count i32)
          (local.set $count (i32.const 0))
          (loop $loop
            (block $exit
              (br_if $exit (i32.ge_u (local.get $i) (local.get $length)))
              (local.set $count
                (i32.add (local.get $count)
                         (i32.eq (i32.load8_u (i32.add (local.get $offset) (local.get $i)))
                                 (i32.const 10))))
              (local.set $i (i32.add (local.get $i) (i32.const 1)))
              (br $loop)
            )
          )
          (local.get $count)
        )
      )
      `,
      funcName: 'count_newlines',
      mem: '%$memory/mem%'
    })),
    ({},{func, memory}) => func(0,memory.length)
  )
})

component('countNL', {
  params: [
    {id: 'mem', type: 'memory'},
    {id: 'offset', asmType: 'i32'},
    {id: 'length', asmType: 'i32'}
  ],
  impl: mainFunc(locals('count','i'), {
    body: [
      set('count', 0),
      loop({
        until: gte('i', 'length'),
        do: [
          addTo('count', typeAdapter('condition<webAsm>', equals(load_8u(add('offset', 'i')), 10))),
          addTo('i', 1)
        ]
      })
    ],
    export: true,
    defaultType: 'i32',
    simdDefaultType: '8x16'
  })
})

component('addWithWAT', {
  params: [
    {id: 'x', asmType: 'i32'},
    {id: 'y', asmType: 'i32'}
  ],
  impl: mainFunc({ body: add('x', 'y'), defaultType: 'i32' })
})

component('countNL.simd16', {
  params: [
    {id: 'mem', type: 'memory'}
  ],
  impl: pipeline(
    Var('memory', '%$mem%', { async: true }),
    Var('func', WATFunc({
      watCode: `(module (import "js" "mem" (memory %$memory/noOfPages%))
        (func $count_newlines (export "count_newlines") (param $offset i32) (param $length i32) (result i32)

        (local $i i32)
        (local $count i32)
        (local $vec v128)
        (local $newline_vec v128)
        (local $mask i32)
    
        (local.set $count (i32.const 0))
        (local.set $newline_vec (i8x16.splat (i32.const 10)))
    
        (loop $loop
          (block $exit
            (br_if $exit (i32.ge_u (local.get $i) (local.get $length)))
    
            (local.set $vec (v128.load (i32.add (local.get $offset) (local.get $i))))    
            (local.set $vec (i8x16.eq (local.get $vec) (local.get $newline_vec)))
            (local.set $mask (i8x16.bitmask (local.get $vec)))
   
            (block $popcount_done
              (loop $popcount
                (br_if $popcount_done (i32.eqz (local.get $mask)))
                (local.set $count 
                  (i32.add (local.get $count) (i32.and (local.get $mask) (i32.const 1))))
                
                (local.set $mask (i32.shr_u (local.get $mask) (i32.const 1)))
                (br $popcount)
              )
            )
            (local.set $i (i32.add (local.get $i) (i32.const 16)))
            (br $loop)
          )
        )        
        
        (local.get $count)
        ))
      `,
      funcName: 'count_newlines',
      mem: '%$memory/mem%'
    })),
    ({},{func, memory}) => func(0,memory.length)
  )
})

component('countNL_simd128', {
  params: [
    {id: 'mem', type: 'memory'},
    {id: 'offset', asmType: 'i32'},
    {id: 'length', asmType: 'i32'}
  ],
  impl: mainFunc({
    locals: locals('count', 'i', 'mask', local('vec', 'v128'), local('newline_vec', 'v128')),
    body: [
      set('count', 0),
      set('newline_vec', simd128.splat(10)),
      loop({
        do: [
          set('vec', load(add('offset', 'i'), 'v128')),
          set('vec', simd128.equals('vec', 'newline_vec')),
          set('mask', simd128.bitmask('vec')),
          loop(isZero('mask'), [
            addTo('count', and('mask', 1)),
            set('mask', shiftRight('mask', { noOfBits: 1 }))
          ]),
          addTo('i', 16)
        ]
      })
    ],
    export: true,
    defaultType: 'i32',
    simdDefaultType: '8x16'
  })
})

component('countNL_simd128', {
  params: [
    {id: 'mem', type: 'memory'},
    {id: 'offset', asmType: 'i32'},
    {id: 'length', asmType: 'i32'}
  ],
  impl: mainFunc({
    locals: locals('count', 'i', 'mask', local('vec', 'v128'), local('newline_vec', 'v128')),
    body: [
      set('count', 0),
      set('newline_vec', simd128.splat(10)),
      loop({
        do: [
          set('vec', load(add('offset', 'i'), 'v128')),
          set('vec', simd128.equals('vec', 'newline_vec')),
          set('mask', simd128.bitmask('vec')),
          loop(isZero('mask'), [
            addTo('count', and('mask', 1)),
            set('mask', shiftRight('mask', { noOfBits: 1 }))
          ]),
          addTo('i', 64)
        ]
      })
    ],
    defaultType: 'i32',
    simdDefaultType: '8x64'
  })
})

component('countCharOcc', {
  params: [
    {id: 'char', as: 'string'},
    {id: 'filePath', as: 'string'}
  ],
  impl: pipe(
    WATFunc({
      watCode: '(module (func (export "add") (param i32 i32) (result i32) (i32.add (local.get 0) (local.get 1))))',
      funcName: 'add'
    }),
    ({data},{},{x,y}) => data(x,y)
  )
})
