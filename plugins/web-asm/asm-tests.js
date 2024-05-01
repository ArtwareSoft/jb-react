// component('wasmTest.helloWorld', {
//   impl: dataTest(() => jb.webAsm.helloWorld(), equals('%res%',15))
// })

// component('wasmTest.addWithWAT', {
//   impl: dataTest(addWithWAT(3, 5), equals('%res%', 8))
// })

// component('wasmTest.countNL', {
//   impl: dataTest(countNL(fileContent('/plugins/security/endgame.jsonLog.txt')), equals('%res%', 1028))
// })

component('wasmTest.countNL.simd16', {
  doNotRunInTests: true,
  impl: dataTest(countNL.simd16(fileContent('/plugins/security/endgame.jsonLog.txt')), equals('%res%', 1028))
})

component('ffiTest.countNL.simd512', {
  doNotRunInTests: true,
  impl: dataTest(ffi.countNL(fileContent('/plugins/security/endgame.jsonLog.txt')), equals('%res%', 1028))
})

// component('wasmTest.workerExample', {
//   impl: dataTest(() => jb.webAsm.workerExample('hello'), equals('hello-back'))
// })
