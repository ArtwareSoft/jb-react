dsl('webAsm')
using('common')

extension('webAsm', 'basic', {
    async WATFunc(watCode, funcName) {
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
            return { error, stderr}
        const code = fs.readFileSync(wasmFile)
        return { funcName, code }
    },
    async instantiate({ funcName, code }, ) {
        let wasmCode = ''
        try {
            
            const wasmModule = await WebAssembly.instantiate(wasmCode)
            return wasmModule.instance.exports[funcName]
        } catch (e) {
            return jb.logException(e,{wasmCode: wasmCode && wasmCode.toString()})
        }
    },
    mmap() {
        const fs = require('fs');
        const mmap = require('mmap-io');
        
        // Open a file
        const fd = fs.openSync('large_file.txt', 'r');
        // Get the file's size
        const stats = fs.fstatSync(fd);
        const fileSize = stats.size;
        
        // Memory-map the file
        const mappedBuffer = mmap.map(fileSize, mmap.PROT_READ, mmap.MAP_SHARED, fd, 0);
        const wasm = fs.readFileSync(path.join(__dirname, 'count_newlines.wasm'));
        const numPages = Math.ceil(mappedBuffer.length / (64 * 1024));
        const memory = new WebAssembly.Memory({ initial: numPages });

        const importObject = {
            js: { mem: memory }
        };

        (async () => {
            const { instance } = await WebAssembly.instantiate(wasm, importObject);
            const { count_newlines } = instance.exports;

            // Pass the offset and length of the memory-mapped buffer to the WebAssembly function
            const newLinesCount = count_newlines(0, mappedBuffer.length);
            console.log(`Number of new lines: ${newLinesCount}`);
        })();
    },
    workerExample(msg) {
      const { Worker } = require('worker_threads')

      const workerCode = `
      const inspector = require('inspector')
      const { parentPort } = require('worker_threads')
      inspector.open()
      inspector.waitForDebugger()

      parentPort.on('message', (message) => {
          console.log(message)
          parentPort.postMessage(message + '-back')
      })
      //# sourceURL=worker-script.js`

      // Create a worker using the worker code string
      const worker = new Worker(workerCode, { eval: true, execArgv: ["--inspect"] })

      worker.on('error', (error) => {
          console.error('Worker error:', error)
      })

      worker.on('exit', (code) => {
          if (code !== 0)
              console.error(`Worker stopped with exit code ${code}`)
      })
      return new Promise(resolve=> {
        worker.on('message', resolve)
        worker.postMessage(msg)
      })
    },
    
    WATWithSimd: `(module
        (memory (import "js" "mem") 1)
        (func $count_newlines_avx512 (param $buffer i32) (param $length i32) (result i32)
          (local $count i32) (local $i i32) (local $simdCount v128)
          (v128.store (local.get $simdCount) (i32x4.splat 0)) ;; Initialize SIMD vector to 0
          (loop $loop
            (br_if $done (i32.ge_u (local.get $i) (local.get $length)))
            ;; Load 64 bytes and compare to newline character
            (local.set $simdCount
              (i8x64.add (local.get $simdCount)
                         (i8x64.eq (v128.load (i32.add (local.get $buffer) (local.get $i))) (i8x64.splat 10))))
            (local.set $i (i32.add (local.get $i) (i32.const 64))) ;; Increment by 64 bytes
            (br $loop)
          $done)
          ;; Sum the elements of the SIMD vector to get the total count
          (local.set $count (i32x4.extract_lane 0 (i32x4.add (local.get $simdCount) (v128.shuffle (local.get $simdCount) (local.get $simdCount) 2 3 0 1))))
          (local.get $count)
        )
        (export "count_newlines_avx512" (func $count_newlines_avx512))
      )
  `,
  WAT: { 
        add: '(module (func (export "add") (param i32 i32) (result i32) (i32.add (local.get 0) (local.get 1))))'
    }
})

component('count_newlines_avx512', {
  params: [
    {id: 'buffer'},
    {id: 'length'}
  ],
  impl: func({
    body: [
      store('smidCount', smid128.splat(Const(0))),
      While({
        cond: gte('i', 'length'),
        do: [
          set('smidCount', smid128.add('smidCount', smid128.equals(load(add('i', 'buffer'), 'v128'), smid128.splat(10)))),
          set('i', add('i', Const(64)))
        ]
      })
    ],
    locals: locals('count', 'i', local('smidCount', 'v128')),
    export: true,
    defaultType: 'i32',
    smidDefaultType: 'i8'
  })
})

component('webAsm.func', {
  type: 'data<>',
  params: [
    {id: 'watCode', as: 'string'},
    {id: 'funcName', as: 'string'},
    {id: 'params', type: 'param[]'}
  ],
  impl: (ctx,watCode, funcName) => jb.webAsm.WATFunc(watCode, funcName)
})

component('webAsm.add', {
  type: 'data<>',
  params: [
    {id: 'x', as: 'number'},
    {id: 'y', as: 'number'}
  ],
  impl: pipe(
    webAsm.func({
      watCode: '(module (func (export "add") (param i32 i32) (result i32) (i32.add (local.get 0) (local.get 1))))',
      funcName: 'add'
    }),
    ({data},{},{x,y}) => data(x,y)
  )
})

component('webAsm.mmap', {
  type: 'data<>',
  params: [
    {id: 'filePath', as: 'string'}
  ],
  impl: pipe(
    webAsm.func({
      watCode: '(module (func (export "add") (param i32 i32) (result i32) (i32.add (local.get 0) (local.get 1))))',
      funcName: 'add'
    }),
    ({data},{},{x,y}) => data(x,y)
  )
})

component('webAsm.countCharOcc', {
  type: 'data<>',
  params: [
    {id: 'char', as: 'string'},
    {id: 'filePath', as: 'string'}
  ],
  impl: pipe(
    webAsm.func({
      watCode: '(module (func (export "add") (param i32 i32) (result i32) (i32.add (local.get 0) (local.get 1))))',
      funcName: 'add'
    }),
    ({data},{},{x,y}) => data(x,y)
  )
})
