jb.component('netTest.childJbm', {
    impl: dataTest({
      calculate: rx.pipe(
        source.promise(jbm.child('tst')),
        rx.flatMap(source.remote(source.data('hello'), '%%'))
      ),
      expectedResult: equals('hello')
    })
})

jb.component('netTest.childWorker', {
  impl: dataTest({
    timeout: 3000,
    calculate: rx.pipe(
      source.promise(jbm.worker('innerWorker')),
      rx.flatMap(source.remote(source.promise(pipe(jbm.child('tst'),'hello')), '%%'))
    ),
    expectedResult: equals('hello')
  })
})

jb.component('netTest.listSubJBms', {
  impl: dataTest({
    runBefore: jbm.child('inner'),
    calculate: pipe(net.listSubJBms(),join(',')),
    expectedResult: contains(['tests,','tests►inner'])
  })
})

jb.component('netTest.innerWorker', {
  impl: dataTest({
    timeout: 5000,
    calculate: rx.pipe(
      source.promise(jbm.worker('innerWorker')),
      rx.flatMap(source.remote(source.promise(pipe(jbm.child('inWorker'),'x')), '%%')),
      rx.mapPromise(pipe(net.listSubJBms(), join(',')))
    ),
    expectedResult: contains(['tests►innerWorker','tests►innerWorker►inWorker'])
  })
})

jb.component('netTest.byUri', {
  impl: dataTest({
    runBefore: jbm.child('tst'),
    calculate: source.remote(source.data('hello'), jbm.byUri('tests►tst')),
    expectedResult: equals('hello')
  })
})

jb.component('netTest.workerByUri', {
  impl: dataTest({
    runBefore: jbm.worker('innerWorker'),
    calculate: rx.pipe(
      source.data('hello'),
      remote.operator(rx.map('%% world'), jbm.byUri('tests►innerWorker'))
    ),
    expectedResult: equals('hello world')
  })
})

jb.component('netTest.workerToWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker('innerWorker'), jbm.worker('innerWorker2')),
    calculate: source.remote(rx.pipe(
        source.data('hello'), 
        remote.operator(rx.map('%% world'), jbm.byUri('tests►innerWorker2'))
      ), jbm.byUri('tests►innerWorker')),
    expectedResult: equals('hello world')
  })
})

jb.component('netTest.networkToWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker({id: 'networkPeer', networkPeer: true}), jbm.worker('innerWorker2')),
    calculate: source.remote(rx.pipe(
        source.data('hello'), 
        remote.operator(rx.map('%% world'), jbm.byUri('tests►innerWorker2'))
      ), jbm.byUri('networkPeer')),
    expectedResult: equals('hello world')
  })
})
