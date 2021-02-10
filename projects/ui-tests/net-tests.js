jb.component('netTest.childJbm', {
    impl: dataTest({
      timeout: 1000,
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

jb.component('netTest.remote.data', {
  impl: dataTest({
    timeout: 3000,
    calculate: pipe(
      Var('w','world'), remote.data('hello %$w%', jbm.worker('innerWorker'))),
    expectedResult: equals('hello world')
  })
})

jb.component('netTest.remote.action', {
  impl: dataTest({
    timeout: 3000,
    calculate: pipe(
      remote.action(() => jb.passive('w','hello'), jbm.worker('innerWorker')),
      remote.data('%$w%', jbm.worker('innerWorker')),
    ),
    expectedResult: equals('hello')
  })
})

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

jb.component('netTest.childJbmPort', {
  impl: dataTest({
    timeout: 5000,
    runBefore: pipe(
      jbm.worker('innerWorker'), 
      remote.action(jbm.child('inner'),'%%')
    ),
    calculate: remote.data('hello',jbm.byUri('tests►innerWorker►inner')),
    expectedResult: 'hello'
  })
})

jb.component('netTest.innerWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker({id: 'networkPeer', networkPeer: true}), jbm.child('inner')),
    calculate: rx.pipe(
      source.promise(jbm.worker('innerWorker')),
      rx.flatMap(source.remote(source.promise(pipe(jbm.child('inWorker'),'x')), '%%')),
      rx.mapPromise(pipe(net.listSubJbms(), join(',')))
    ),
    expectedResult: contains(['tests►innerWorker','tests►innerWorker►inWorker'])
  })
})

jb.component('netTest.byUri', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.child('tst'),
    calculate: source.remote(source.data('hello'), jbm.byUri('tests►tst')),
    expectedResult: equals('hello')
  })
})

jb.component('netTest.workerByUri', {
  impl: dataTest({
    timeout: 1000,
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
    runBefore: runActions(jbm.worker({id: 'peer1', networkPeer: true}), jbm.worker('innerWorker2')),
    calculate: source.remote(rx.pipe(
        source.data('hello'), 
        remote.operator(rx.map('%% world'), jbm.byUri('tests►innerWorker2'))
      ), jbm.byUri('peer1')),
    expectedResult: equals('hello world')
  })
})

jb.component('netTest.networkGateway', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker({id: 'peer1', networkPeer: true}), jbm.worker({id: 'peer2', networkPeer: true})),
    calculate: source.remote(rx.pipe(
        source.data('hello'), 
        remote.operator(rx.map('%% world'), jbm.byUri('peer2'))
      ), jbm.byUri('peer1')),
    expectedResult: equals('hello world')
  })
})
