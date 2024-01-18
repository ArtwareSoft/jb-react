component('test.mixedTest.byNameSection', {
    type: 'action', 
    impl: runActionOnItems(list(1,2,3), delay(), 'index')
})

component('mixedTest.byNameSection', {
  impl: mixedMigrationTest('test.mixedTest.byNameSection', contains('{indexVariable: '))
})

component('test.mixedTest.disabled', {
  impl: split({separator: ';', part: 'first', disabled: true})
})

component('mixedTest.disabled', {
  impl: mixedMigrationTest('test.mixedTest.disabled', contains('{disabled: true'))
})
