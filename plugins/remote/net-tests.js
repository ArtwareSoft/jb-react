jb.component('netTest.listSubJbms', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.start(child('inner')),
    calculate: pipe(net.listSubJbms(),join(',')),
    expectedResult: contains(['tests,','tests•inner'])
  })
})

jb.component('netTest.listAll', {
  impl: dataTest({
    timeout: 1000,
    runBefore: runActions(jbm.start(worker({id: 'networkPeer', networkPeer: true})), jbm.start(child('inner'))),
    calculate: pipe(net.listAll(),join(',')),
    expectedResult: contains(['tests,','tests•inner','networkPeer'])
  })
})

