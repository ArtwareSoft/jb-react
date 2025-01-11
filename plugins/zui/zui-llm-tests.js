dsl('zui')

component('zuiTest.domain.itemsSource', {
  impl: dataTest({
    calculate: pipe(
      domain.itemsSource(healthCare(), baseTask({ noOfItems: '3', details: 'icon', modelId: 'gpt_35_turbo_0125' })),
      join(',', { itemText: '%title%' })
    ),
    expectedResult: contains('Vertigo'),
    timeout: '20000'
  })
})
//'%model% %$task/onOfItems%: %duration%'

// component('zuiTest.itemKeys', {
//   doNotRunInTests: true,
//   impl: dataTest({
//     calculate: pipe(zui.itemKeysFromLlm(healthCare(gpt_35_turbo_0125()), 5), '%title%', join(',')),
//     expectedResult: contains('')
//   })
// })
