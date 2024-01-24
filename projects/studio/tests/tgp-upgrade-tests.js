component('test.mixedTest.disabled', {
  impl: split(';', {
    disabled: true,
    text: pipeline('%%','dfssdaasdasdadasd','sdfsdfsd','dsfsdfsdfsd sdfsdf'),
    part: 'second'
  })
})

component('mixedTest.tst1Helper', {
  impl: dataTest({
    calculate: pipeline(typeAdapter('cmp-upgrade<upgrade>', upgradeMixed('uiTest.group'))),
    expectedResult: notNull('%edit%'),
    runBefore: TBD()
  })
})

component('mixedTest.tst1', {
  impl: dataTest(typeAdapter('cmp-upgrade<upgrade>', upgradeMixed('mixedTest.tst1Helper')), equals('', ''))
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

// component('mixedTest.createUpgradeScript', {
//   impl: dataTest(createUpgradeScript({upgrade: upgradeMixed(), slice: 5}), equals('',''))
// })
