jb.component('netTest.listSubJbms', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.child('inner'),
    calculate: pipe(net.listSubJbms(),join(',')),
    expectedResult: contains(['tests,','tests►inner'])
  })
})

jb.component('netTest.listAll', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker({id: 'networkPeer', networkPeer: true}), jbm.child('inner')),
    calculate: pipe(net.listAll(),join(',')),
    expectedResult: contains(['tests,','tests►inner','networkPeer'])
  })
})

