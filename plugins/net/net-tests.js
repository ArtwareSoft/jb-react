component('routerTests.hello', {
  impl: dataTest(remote.data('hello', router()), equals('hello'))
})

component('routerTests.viaRouter', {
  doNotRunInTests: true,
  impl: dataTest(remote.data('hello', viaRouter('tests•c1')), equals('hello'), {
    runBefore: jbm.start(
      child('c1', {
        sourceCode: sourceCode(plugins('remote,net')),
        init: remote.action(remote.action(log('remote c1 was here'), router()), '%$jbm%')
      })
    ),
    covers: ['routerTests.hello']
  })
})
