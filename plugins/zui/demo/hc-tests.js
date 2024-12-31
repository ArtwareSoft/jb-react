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

component('zuiTest.writeToRedis', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: http.fetch('http://localhost:8082/?op=redisSet', 'POST', { body: obj(prop('key', 'hello'), prop('value', 'world2')) }),
    expectedResult: contains('')
  })
})

component('zuiTest.readFromRedis', {
  doNotRunInTests: true,
  impl: dataTest({
    calculate: pipe(http.fetch('http://localhost:8082/?op=redisGet&key=hello', { json: true }), '%message/value%'),
    expectedResult: equals('world')
  })
})