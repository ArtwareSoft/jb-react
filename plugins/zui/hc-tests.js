dsl('zui')

component('zuiTest.healthCare.app', {
  doNotRunInTests: true,
  impl: zuiTest(mainApp(), contains('⚠️'), { timeout: 50000 })
})

