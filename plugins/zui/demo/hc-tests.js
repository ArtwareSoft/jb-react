dsl('zui')

component('zuiTest.healthCareGet100Items', {
  doNotRunInTests: true,
  impl: dataTest(pipe(healthCare.conditionDataSample300(), '%title%', slice(0,50)), contains('Appendicitis,'))
})

component('zuiTest.healthCare.conditionIconBox', {
  doNotRunInTests: true,
  impl: zuiTest({
    control: itemlist({
      items: '%$testData%',
      itemControl: healthCare.conditionIconBox(),
      itemsLayout: groupByScatter('category', { sort: 'likelihood' })
    }),
    testData: healthCare.conditionDataSample300(),
  })
})

component('zuiTest.healthCare.conditionCard', {
  doNotRunInTests: true,
  impl: zuiTest({
    control: itemlist({
      items: '%$testData%',
      itemControl: firstToFit(healthCare.conditionCard(), healthCare.conditionIconBox()),
      itemsLayout: groupByScatter('category', { sort: 'likelihood' })
    }),
    testData: healthCare.conditionDataSample300(),
  })
})