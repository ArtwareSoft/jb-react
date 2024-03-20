component('location.data', {
  type: 'data<>',
  params: [
    {id: 'state', type: 'state<location>'}
  ],
  impl: pipeline(pipeline(list('%$state/capital/name%', '%$state/cities/name%'), join()))
})

component('dslTest.simple', {
  impl: dataTest(location.data(israel()), equals('Jerusalem,Eilat,Tel Aviv'))
})

component('dslTest.usingWrapper', {
  impl: completionOptionsTest('dataTest(__TBD())', {
    expectedSelections: 'location.data',
    filePath: '/plugins/tgp/lang-service/tgp-lang-service-tests.js'
  })
})

component('dslTest.insideWrapper', {
  impl: completionOptionsTest('dataTest(location.data(__TBD()))', {
    expectedSelections: 'israel',
    filePath: '/plugins/tgp/lang-service/tgp-lang-service-tests.js'
  })
})

