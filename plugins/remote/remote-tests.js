// jb.component('netSetup.peers', { 
//   impl: net.setup(
//     jbm.peers(
//       worker({id: 'peer1', networkPeer: true}), worker({id: 'peer2', networkPeer: true})
//     )
//   )
// })

// jb.component('netSetup.workerWithInner', { 
//   impl: net.setup(
//     jbm.children(worker({
//       id: 'w1',
//       features: jbm.children(child('inWorker'))
//     })))
// })

component('itemlists.manyItems', {
  params: [
    {id: 'howMany', as: 'number', defaultValue: 1000 }
  ],
  impl: pipeline(range(1, '%$howMany%'), obj(prop('id','%%'), prop('name','%%-%%'), prop('group', ({data}) => Math.floor(Number(data) /10))))
})

component('remoteTest.remote.action', {
  impl: dataTest({
    timeout: 3000,
    calculate: pipe(
      remote.action(() => jb.db.passive('w','hello'), worker()),
      remote.data('%$w%', worker()),
    ),
    expectedResult: equals('hello')
  })
})

component('remoteTest.remoteOperator.remoteParam', {
  params: [
    {id: 'retVal', defaultValue: 5}
  ],
  impl: dataTest({
    calculate: rx.pipe(source.data(1), remote.operator(rx.map('%$retVal%'), worker()), rx.take(1)),
    expectedResult: equals(5),
    timeout: 5000
  })
})

component('remoteTest.remoteOperator.remoteVar', {
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          source.data(1),
          rx.var('retVal',5),
          remote.operator(rx.map('%$retVal%'), worker()),
          rx.take(1)
    ),
    expectedResult: equals(5)
  })
})


component('test.addAA',{
  type: 'rx<>',
  impl: rx.map('AA%%')
})

component('remoteTest.remoteOperator.loadOperatorCode', {
  impl: dataTest({
    calculate: rx.pipe(source.data('bb'), remote.operator(test.addAA(), worker())),
    expectedResult: equals('AAbb'),
    timeout: 1000
  })
})

component('remoteTest.remoteOperator.child.loadOperatorCode', {
  impl: dataTest({
    calculate: rx.pipe(source.data('bb'), remote.operator(test.addAA(), child('opTst'))),
    expectedResult: equals('AAbb'),
    timeout: 1000
  })
})

component('remoteTest.childWorker.sourceCode.project', {
  impl: dataTest({
    calculate: remote.data(
      pipeline(itemlists.manyItems(3), '%id%', join(',')),
      worker('itemlists', project('itemlists'))
    ),
    expectedResult: equals('1,2,3'),
    timeout: 3000
  })
})

component('remoteTest.networkGateway', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.start(worker({id: 'peer1', networkPeer: true})), jbm.start(worker({id: 'peer2', networkPeer: true}))),
    calculate: source.remote(rx.pipe(
        source.data('hello'),
        rx.map('%%'),
        remote.operator(rx.map('%% world'), byUri('peer2'))
      ), byUri('peer1')),
    expectedResult: equals('hello world')
  })
})

component('remoteTest.shadowResource.initWatchable', {
  impl: dataTest({
    timeout: 5000,
    runBefore: remote.shadowResource('person', worker()),
    calculate: remote.data(() => jb.watchable != null,worker()),
    expectedResult: equals(true)
  })
})

component('remoteTest.shadowResource.watchable', {
  impl: dataTest({
    calculate: remote.data(
      pipe(rx.pipe(source.watchableData('%$person/name%'), rx.log('test'), rx.map('%newVal%'), rx.take(1))),
      worker()
    ),
    expectedResult: equals('Dan'),
    runBefore: runActions(
      remote.shadowResource('person', worker()), 
    () => { jb.exec(runActions(delay(1), writeValue('%$person/name%','Dan'))) },// writeValue after calculate
    ),
    timeout: 5000
  })
})

component('remoteTest.shadowResource.childJbm', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(
      remote.shadowResource('person', child('inner')),
      () => { jb.exec(runActions(delay(1), writeValue('%$person/name%','Dan'))) } // writeValue after calculate
    ),
    calculate: remote.data(
      pipe(rx.pipe(
        source.watchableData('%$person/name%'),
        rx.log('test'),
        rx.map('%newVal%'),
        rx.take(1)
      )), 
      child('inner')
    ),
    expectedResult: equals('Dan')
  })
})

component('remoteTest.sourceNoTalkback', {
    impl: dataTest({
      timeout: 5000,
      calculate: pipe(rx.pipe(
            source.remote(source.interval(1), worker()),
            rx.take(2),
            rx.map('-%%-'),
      ), join(',')),
      expectedResult: equals('-0-,-1-')
    })
})

component('remoteTest.source.remote.local', {
  impl: dataTest({
    timeout: 5000,
    calculate: pipe(
      rx.pipe(source.remote(source.data([1, 2, 3])), rx.take(2), rx.map('-%%-')),
      join(',')
    ),
    expectedResult: equals('-1-,-2-')
  })
})

component('remoteTest.source.remote.worker', {
  impl: dataTest({
    timeout: 5000,
    calculate: pipe(
      rx.pipe(source.remote(source.data([1, 2, 3]), worker()), rx.take(2), rx.map('-%%-')),
      join(',')
    ),
    expectedResult: equals('-1-,-2-')
  })
})

component('remoteTest.remote.operator', {
    impl: dataTest({
      timeout: 5000,
      calculate: pipe(
         rx.pipe(
            source.data([1,2,3]),
            remote.operator(rx.take(2), worker()),
            rx.map('-%%-')
      ), join(',')),
      expectedResult: equals('-1-,-2-')
    })
})

// jb.component('remoteTest.remoteObjectWithMethods', {
//   impl: dataTest({
//     timeout: 5000,
//     calculate: rx.pipe(
//       source.data(1),
//       remote.operator(rx.map(remoteTest.sampleObject(5)), worker()),
//       remote.operator(rx.map('%m1()%'), worker()),
//       rx.take(1)
//     ),
//     expectedResult: equals(5)
//   })
// })


// jb.component('remoteTest.dynamicJsFuncAsParam', {
//   params: [
//     { id: 'func', dynamic: true, defaultValue: ({data}) => `-${data}-`},
//   ],
//   impl: dataTest({
//     timeout: 5000,
//       calculate: rx.pipe(
//           source.data(1),
//           remote.operator(rx.map('%$func()%'), worker()),
//           rx.take(1)
//     ),
//     expectedResult: equals('-1-')
//   })
// })


// jb.component('remoteWidgetTest.recoverAfterError', {
//   impl: uiTest({
//     timeout: 3000,
//     control: remote.widget( 
//       button({ title: 'generate delta error %$recover%',
//         style: button.native(),
//         action: (ctx,{widgetId}) => 
//           jb.ui.renderingUpdates.next({widgetId, delta: { }, cmpId: 'wrongId',ctx})
//       }), 
//       worker()
//     ),
//     userInputRx: rx.pipe(
//       source.waitForSelector('button'),
//       rx.map(userInput.click('button')),
//     ),
//     checkResultRx: () => jb.ui.renderingUpdates,
//     expectedResult: contains('delta error true')
//   })
// })

component('remoteTest.nodeContainer.runTest', {
  impl: dataTest({
    vars: [
      Var('testsToRun', list('dataTest.join','dataTest.ctx.expOfRefWithBooleanType'))
    ],
    calculate: pipe(
      rx.pipe(
        source.data('%$testsToRun%'),
        rx.log('test'),
        remote.operator(
          rx.mapPromise(({data}) => jb.test.runSingleTest(data)),
          remoteNodeWorker('tester', sourceCode(pluginsByPath('/plugins/common/xx-tests.js')))
        ),
        rx.log('test')
      ),
      '%success%',
      join(',')
    ),
    expectedResult: equals('true,true'),
    timeout: 3000
  })
})

component('remoteTest.testResults', {
  impl: dataTest({
    vars: [
      Var('testsToRun', list('dataTest.join','dataTest.ctx.expOfRefWithBooleanType'))
    ],
    calculate: pipe(
      rx.pipe(
        source.testsResults('%$testsToRun%', remoteNodeWorker('tester', sourceCode(pluginsByPath('/plugins/common/xx-tests.js')))),
        rx.log('test')
      ),
      '%id%-%started%-%success%',
      join(',')
    ),
    expectedResult: equals(
      'dataTest.join-true-,dataTest.join--true,dataTest.ctx.expOfRefWithBooleanType-true-,dataTest.ctx.expOfRefWithBooleanType--true'
    ),
    timeout: 3000
  })
})

component('remoteTest.listSubJbms', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.start(child('inner')),
    calculate: pipe(net.listSubJbms(),join(',')),
    expectedResult: contains(['tests,','tests•inner'])
  })
})

component('remoteTest.listAll', {
  impl: dataTest({
    calculate: pipe(net.listAll(), join(',')),
    expectedResult: contains(['tests,','tests•inner','networkPeer']),
    runBefore: runActions(jbm.start(worker({id: 'networkPeer', networkPeer: true})), jbm.start(child('inner'))),
    timeout: 1000
  })
})

component('remoteTest.dataFromCmd', {
  impl: dataTest({
    calculate: remote.cmd({
      main: pipeline(list('a', 'b', '%$v1%'), join()),
      context: obj(prop('v1', '33')),
      sourceCode: sourceCode(plugins('common'))
    }),
    expectedResult: equals('a,b,33'),
    timeout: 3000
  })
})
