component('netTest.listSubJbms', {
  impl: dataTest(pipe(net.listSubJbms(), join(',')), contains('tests,','tests•inner'), {
    runBefore: jbm.start(child('inner')),
    timeout: 1000
  })
})

component('netTest.listAll', {
  impl: dataTest(pipe(net.listAll(), join(',')), contains('tests,','tests•inner','networkPeer'), {
    runBefore: runActions(jbm.start(worker('networkPeer', { networkPeer: true })), jbm.start(child('inner'))),
    timeout: 1000
  })
})

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
