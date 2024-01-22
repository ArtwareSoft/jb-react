component('test.mixedTest.disabled', {
  impl: split({separator: ';', part: 'first', disabled: true})
})

component('mixedTest.disabled', {
  impl: mixedMigrationTest('test.mixedTest.disabled', contains('{disabled: true'))
})

component('mixedTest.group', {
  impl: dataTest(typeAdapter('cmp-upgrade<upgrade>', upgradeMixed('uiTest.group')), isNull('%edit%'))
})

component('mixedTest.tst1Helper', {
  impl: contains(['hello world','2'])
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
