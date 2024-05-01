using('testing')

component('gpuTest.test1', {
  doNotRunInTests: true,
  impl: dataTest(() => jb.gpu.test1(), equals('hello'))
})