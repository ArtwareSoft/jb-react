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

component('remoteTest.childSimple', {
  impl: dataTest({
    calculate: pipe(jbm.start(child('tst')), remote.data('hello', '%%')),
    expectedResult: equals('hello')
  })
})

component('test.addAA',{
  type: 'rx<>',
  impl: rx.map('AA%%')
})

component('remoteTest.childLoadOperatorCode', {
  impl: dataTest({
    calculate: rx.pipe(source.data('bb'), remote.operator(test.addAA(), child('tst'))), 
    expectedResult: equals('AAbb'),
    timeout: 1000
  })
})

component('remoteTest.workerSimple', {
  impl: dataTest({
    calculate: pipe(jbm.start(worker()), remote.data('hello', '%%')),
    expectedResult: equals('hello'),
    timeout: 3000
  })
})

component('remoteTest.workerLoadOperatorCode', {
  impl: dataTest({
    calculate: rx.pipe(source.data('bb'), remote.operator(test.addAA(), worker('wtst'))),
    expectedResult: equals('AAbb'),
    timeout: 1000
  })
})

component('remoteTest.childWorker.sourceCode.project', {
  impl: dataTest({
    calculate: pipe(
      jbm.start(worker({id: 'itemlists', sourceCode: project('itemlists')})),
      remote.data(pipeline(itemlists.manyItems(3), '%id%', join(',')), '%%')
    ),
    expectedResult: equals('1,2,3'),
    timeout: 3000
  })
})

component('remoteTest.remote.data', {
  impl: dataTest({
    timeout: 3000,
    calculate: pipe(
      Var('w','world'), remote.data('hello %$w%', worker())),
    expectedResult: equals('hello world')
  })
})

component('remoteTest.remote.data.defComponents', {
  impl: dataTest({
    calculate: remote.data(pipeline('1.5', math.floor()), worker()),
    expectedResult: equals(1),
  })
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

component('remoteTest.innerTreeShake', {
  impl: dataTest({
    calculate: remote.data(() => jb.utils.emptyLineWithSpaces != null, byUri('tests•w1•inner')),
    expectedResult: equals(true),
    runBefore: pipe(jbm.start(worker()), remote.action(jbm.start(child('inner')), '%%')),
    timeout: 5000
  })
})

component('remoteTest.childJbmPort', {
  impl: dataTest({
    calculate: remote.data('hello', byUri('tests•w1•inner')),
    expectedResult: 'hello',
    runBefore: pipe(jbm.start(worker()), remote.action(jbm.start(child('inner')), '%%')),
    timeout: 5000
  })
})

component('remoteTest.innerWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: remote.action(jbm.start(child('inWorker')), worker()),
    calculate: pipe(net.listSubJbms(), join(',')),
    expectedResult: contains(['tests•w1','tests•w1•inWorker'])
  })
})

component('remoteTest.byUri(', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.start(child('tst')),
    calculate: remote.data('hello', byUri('tests•tst')),
    expectedResult: equals('hello')
  })
})

component('remoteTest.workerByUri', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.start(worker('w1')),
    calculate: rx.pipe(
      source.data('hello'),
      remote.operator(rx.map('%% world'), byUri('tests•w1'))
    ),
    expectedResult: equals('hello world')
  })
})

component('remoteTest.workerToWorker', {
  impl: dataTest({
    calculate: source.remote(
      rx.pipe(source.data('hello'), rx.map('%%'), remote.operator(rx.map('%% world'), byUri('tests•w2'))),
      byUri('tests•w1')
    ),
    expectedResult: equals('hello world'),
    runBefore: runActions(jbm.start(worker('w1')), jbm.start(worker('w2'))),
    timeout: 5000
  })
})

component('remoteTest.networkToWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.start(worker({id: 'peer1', networkPeer: true})), jbm.start(worker('w2'))),
    calculate: source.remote(rx.pipe(
        source.data('hello'),
        rx.map('%%'),
        remote.operator(rx.map('%% world'), byUri('tests•w2'))
      ), byUri('peer1')),
    expectedResult: equals('hello world')
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

component('remoteTest.remoteParam', {
  params: [
    { id: 'retVal', defaultValue: 5},
  ],
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          source.data(1),
          remote.operator(rx.map('%$retVal%'), worker()),
          rx.take(1)
    ),
    expectedResult: equals(5)
  })
})

component('remoteTest.remoteVar', {
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

component('remoteTest.remoteVarCleanAndRestore', {
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          source.data(1),
          rx.var('notPassed',5),
          remote.operator(rx.map(ctx=> ctx.vars['not'+'Passed'] || 3), worker()),
          rx.log('test 0'),
          rx.map('%%-%$notPassed%'),
          rx.take(1)
    ),
    expectedResult: equals('3-5')
  })
})

component('remoteTest.operator.useVars', {
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          source.data(1),
          rx.var('keepIt','keep me'),
          remote.operator(rx.var('remoteVar','alive'), worker()),
          rx.map('%$keepIt%-%$remoteVar%'),
          rx.take(1)
    ),
    expectedResult: equals('keep me-alive')
  })
})

component('remoteTest.dynamicProfileFunc', {
  params: [
    { id: 'func', dynamic: true, defaultValue: '-%%-'},
  ],
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          source.data(1),
          remote.operator(rx.map('%$func()%'), worker()),
          rx.take(1)
    ),
    expectedResult: equals('-1-')
  })
})

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


component('remoteTest.nodeContainer', {
  impl: dataTest({
    calculate: pipe(jbm.start(remoteNodeWorker()), remote.data('hello', '%%')),
    expectedResult: equals('hello'),
    timeout: 3000
  })
})

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
