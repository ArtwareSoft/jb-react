dsl('webAsm')

const WATWithSimd =  `(module
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
`

extension('webAsm', 'mmap', {
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
    }
})

