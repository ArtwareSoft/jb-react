dsl('ffi')

using('common','remote-jbm')

extension('ffi', 'basic', {
    typeRules: [ { same: ['data<ffi>','data<>']} ],
    async compileAsm(asm, funcName, ctx) {
        try {
            const fs = require('fs')
            const { exec } = require('child_process')
            const os = require('os')
            const path = require('path')
            const ffi = require('ffi-napi')
            const ref = require('ref-napi')
            const ArrayType = require('ref-array-di')(ref)
            const tmpDir = os.tmpdir()
            const asmFile = path.join(tmpDir, `${funcName}.asm`), soFile = path.join(tmpDir, funcName)

            try {
                fs.writeFileSync(asmFile, asm)
            } catch (e) {
                return jb.logException(e, 'error saving asmFile',{asmFile, asm, ctx})
            }

            const {stdout, error,stderr} = await new Promise(resolve =>
                exec(`nasm -f elf64 -g -F dwarf ${asmFile} -o ${soFile}.o`, { encoding: 'buffer' }, (error, stdout, stderr) => resolve({stdout, error, stderr})))
            if (error)
                return jb.logError(`error compiling asm ${error.message}`,{asm, ctx})
            {
                const {stdout, error,stderr} = await new Promise(resolve =>
                    exec(`gcc -shared -o ${soFile}.so ${soFile}.o`, { encoding: 'buffer' }, (error, stdout, stderr) => resolve({stdout, error, stderr})))
                    if (error)
                        return jb.logError(`error linking so ${error.message}`,{asm, ctx})
            }

            const lib = ffi.Library(`${soFile}.so`, { [funcName]: ['int', ['pointer', 'int', 'int', 'pointer']] })

            return (...params) => {
                try {
                    const debugBuffer = new (ArrayType(ref.types.byte, 128))()
                    const _params = [...params, debugBuffer.buffer]
                    const start = jbHost.isNode ? process.hrtime.bigint() : new Date().getTime()
                    const res = lib[funcName](..._params)
                    const end = jbHost.isNode ? process.hrtime.bigint() : new Date().getTime()
                    const dur = end - start
                    const duration = dur > 1000000n ? (Number(dur) / 1000000) : dur
                    const unit = jbHost.isNode && dur === duration ? 'nanoSec' : 'mSec'
                    return { res, duration: '' + duration, unit }
                } catch (e) {
                    return jb.logException(e,'run ffi',{asm, ctx})
                }
            }
        } catch (e) {
            return jb.logException(e,'ffi',{asm, ctx})
        }
    }
})

component('asmFunc', {
  type: 'data',
  params: [
    {id: 'asm', as: 'string', newLinesInCode: true},
    {id: 'funcName', as: 'string'},
  ],
  impl: (ctx,asm,funcName) => jb.ffi.compileAsm(asm, funcName, ctx)
})

component('ffi.countNL', {
  params: [
    {id: 'mem', type: 'memory<webAsm>'}
  ],
  impl: pipeline(
    Var('memory', '%$mem%', { async: true }),
    Var('func', asmFunc({
      asm: `section .text
      global count_newlines
      
      ; Arguments:
      ; rdi - base address of the memory buffer (void *)
      ; rsi - offset within the buffer (int)
      ; rdx - length of the buffer from the offset (int)
      ; rcx - pointer to the debug buffer (pointer)
      
      count_newlines:
          xor r8, r8             ; r8 - counter for newlines
          lea r9, [rdi + rsi]   ; r9 - buffer pointer (start position)
          lea rdx, [r9 + rdx]   ; rdx - end address of the buffer segment
      
          ; Initialize zmm1 with the newline character (0x0A)
          mov rax, 0x0A0A0A0A0A0A0A0A
          vmovq xmm1, rax
          vpshufd xmm1, xmm1, 0
          vpbroadcastq zmm1, xmm1
      
      start_loop:
          cmp r9, rdx
          jge end_loop           ; If buffer pointer (r9) >= rdx, exit loop
      
          vmovdqu64 zmm0, [r9]   ; Load 64 bytes from the buffer using r9
          vpcmpeqb k1, zmm0, zmm1 ; Compare for equality with newline characters
          kmovq rax, k1          ; Store mask results temporarily in rax
          popcnt rax, rax        ; Count the number of set bits (newlines) from mask
          add r8, rax            ; Accumulate in r8 the count of newlines
      
          add r9, 64             ; Move buffer pointer forward by 64 bytes
          jmp start_loop         ; Repeat the loop
      
      end_loop:
          mov rax, r8            ; Return the result in rax
          ret
          `,
      funcName: 'count_newlines'
    })),
    ({},{func, memory}) => func(Buffer.from(memory.mem.buffer), 0,memory.length)
  )
})