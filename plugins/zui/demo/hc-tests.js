dsl('zui')

component('zuiTest.healthCare.app', {
  doNotRunInTests: true,
  impl: zuiTest(mainApp(healthCare.fixed5Items()), contains(''))
})

component('zuiTest.healthCare.items', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(
      healthCare.itemsFromLlm(healthCare.fixed5Items(), sampleUserData(), { appData: sampleAppData() }),
      join(',', { itemText: '%title%' })
    ),
    expectedResult: contains('')
  })
})