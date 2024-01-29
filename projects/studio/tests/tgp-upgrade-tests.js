component('test.mixedTest.disabled', {
  impl: split(';', {
    disabled: true,
    text: pipeline('%%','dfssdaasdasdadasd','sdfsdfsd','dsfsdfsdfsd sdfsdf'),
    part: 'second'
  })
})

component('mixedTest.tst2Helper', {
  doNotRunInTests: true,
  impl: calcProp('toggleText', If('%$$model/databind()%', '%$$model/textForTrue()%', '%$$model/textForFalse()%'))
})

component('mixedTest.tst1Helper', {
  doNotRunInTests: true,
  impl: contains('hello world','red')
})

component('mixedTest.tst1', {
  impl: dataTest(typeAdapter('upgrade<upgrade>', reformat('mixedTest.tst1Helper')), equals('', ''))
})

component('upgradeTest.upgradePT', {
  impl: dataTest({
    calculate: pipeline('mixedTest.tst1Helper', typeAdapter('upgrade<upgrade>', upgradePT('contains'))),
    expectedResult: equals('', '')
  })
})


// component('mixedTest.all', {
//   impl: dataTest(
//     pipeline(
//       () => Object.keys(jb.comps),
//       filter(not(startsWith('dataResource.'))),
//       slice(0, 100),
//       typeAdapter('cmp-upgrade<upgrade>', upgradeMixed()),
//       filter('%edit%'),
//       slice(0, 1)
//     ),
//     equals('','')
//   )
// })

component('mixedTest.createUpgradeScript', {
  doNotRunInTests: true,
  impl: dataTest(createUpgradeScript(reformat(), { slice: 100 }), equals('', ''), {
    timeout: 20000
  })
})


