component('test.mixedTest.byNameSection', {
    type: 'action', 
    impl: runActionOnItems(list(1,2,3), delay(), 'index')
})

component('test.mixedTest.disabled', {
  impl: split({separator: ';', part: 'first', disabled: true})
})

component('mixedTest.disabled', {
  impl: mixedMigrationTest('test.mixedTest.disabled', contains('{disabled: true'))
})

component('mixedTest.byNameSection', {
  impl: dataTest(
    typeAdapter('cmp-upgrade<upgrade>', upgradeMixed('test.mixedTest.byNameSection')),
    equals(
      '%edit/replaceBy%',
      "{indexVariable: 'index'"
    )
  )
})

component('mixedTest.group', {
  impl: dataTest(typeAdapter('cmp-upgrade<upgrade>', upgradeMixed('uiTest.group')), isNull('%edit%'))
})

component('mixedTest.tst1Helper', {
  impl: data.switch({cases: [
    data.case('', asIs({a: ''})),
    data.case('', asIs({a: ''}))
  ]})
})

component('mixedTest.tst1Helper', {
  impl: studio.watchPath({path: '%$path%', includeChildren: 'yes'})
})

component('mixedTest.tst1', {
  impl: dataTest(
    typeAdapter('cmp-upgrade<upgrade>', upgradeMixed('tgpTextEditor.studioCircuitUrlByDocProps')),
    isNull('%edit%')
  )
})

component('mixedTest.all', {
  impl: dataTest(
    pipeline(
      () => Object.keys(jb.comps),
      filter(not(startsWith('dataResource.'))),
      typeAdapter('cmp-upgrade<upgrade>', upgradeMixed('%%')),
      filter('%lostInfo%')
    ),
    equals('')
  )
})
