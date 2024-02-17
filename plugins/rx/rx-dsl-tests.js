component('rxDslTest.mapPromise', {
  impl: dataTest(rxPipe(data(0), mapPromise(({data}) => jb.delay(1,data+2))), equals('2'))
})

component('rxDslTest.doPromise', {
  impl: dataTest({
    calculate: rxPipe(data(1), elems(doPromise(({data}) =>jb.delay(1,data *10)), mapPromise(({data}) =>jb.delay(1,data+2)))),
    expectedResult: equals('3')
  })
})

component('rxDslTest.join', {
  impl: dataTest({
    calculate: rxPipe(data(list(1,2,3,4)), elems(map('-%%-'), join())),
    expectedResult: equals('-1-,-2-,-3-,-4-'),
    spy: 'test'
  })
})

component('rxDslTest.rxFlow', {
  impl: dataTest({
    vars: [Var('out', obj())],
    calculate: '%$out/x%',
    expectedResult: equals('1'),
    runBefore: rxFlow(data(1), map('%%'), writeValue('%$out/x%')),
  })
})

// component('rxDslTest.switch', {
//   impl: dataTest({
//     calculate: rxPipe(data(list(1,2,3,4)), elems(Switch(Case('%%<2', map('%%-')), Case(true, map('-%%'))), join())),
//     expectedResult: equals('1-,-2,-3,-4')
//   })
// })

//     calculate: rxPipe(data(list(1,2,3,4)), elems(fork(take(1), writeValue('%$a/fork%')), skip(1), take(1), join())),
