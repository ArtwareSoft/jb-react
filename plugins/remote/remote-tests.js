// jb.component('netSetup.peers', { 
//   impl: net.setup(
//     jbm.peers(
//       jbm.worker({id: 'peer1', networkPeer: true}), jbm.worker({id: 'peer2', networkPeer: true})
//     )
//   )
// })

// jb.component('netSetup.workerWithInner', { 
//   impl: net.setup(
//     jbm.children(jbm.worker({
//       id: 'w1',
//       features: jbm.children(jbm.child('inWorker'))
//     })))
// })

jb.component('itemlists.manyItems', {
  params: [
    {id: 'howMany', as: 'number', defaultValue: 1000 }
  ],
  impl: pipeline(range(1, '%$howMany%'), obj(prop('id','%%'), prop('name','%%-%%'), prop('group', ({data}) => Math.floor(Number(data) /10))))
})

jb.component('remoteTest.childJbm', {
  impl: dataTest({
    calculate: pipe(jbm.child('tst'), remote.data('hello', '%%')),
    expectedResult: equals('hello')
  })
})

jb.component('remoteTest.childWorker', {
  impl: dataTest({
    calculate: pipe(jbm.worker(), remote.data('hello', '%%')),
    expectedResult: equals('hello'),
    timeout: 3000
  })
})

jb.component('remoteTest.childWorker.initJb.usingProjects', {
  impl: dataTest({
    calculate: pipe(
      jbm.worker({id: 'itemlists', initJbCode: initJb.usingProjects('itemlists')}),
      remote.data(pipeline({'$': 'itemlists.manyItems', howMany: 3}, '%id%', join(',')), '%%')
    ),
    expectedResult: equals('1,2,3'),
    timeout: 3000
  })
})

jb.component('remoteTest.remote.data', {
  impl: dataTest({
    timeout: 3000,
    calculate: pipe(
      Var('w','world'), remote.data('hello %$w%', jbm.worker())),
    expectedResult: equals('hello world')
  })
})

jb.component('remoteTest.remote.data.defComponents', {
  impl: dataTest({
    calculate: remote.data(pipeline('1.5', math.floor()), jbm.worker()),
    expectedResult: equals(1),
  })
})

jb.component('remoteTest.remote.action', {
  impl: dataTest({
    timeout: 3000,
    calculate: pipe(
      remote.action(() => jb.db.passive('w','hello'), jbm.worker()),
      remote.data('%$w%', jbm.worker()),
    ),
    expectedResult: equals('hello')
  })
})

jb.component('remoteTest.innerTreeShake', {
  impl: dataTest({
    calculate: remote.data(() => jb.utils.emptyLineWithSpaces != null, jbm.byUri('tests•w1•inner')),
    expectedResult: equals(true),
    runBefore: pipe(jbm.worker(), remote.action(jbm.child('inner'), '%%')),
    timeout: 5000
  })
})

jb.component('remoteTest.childJbmPort', {
  impl: dataTest({
    calculate: remote.data('hello', jbm.byUri('tests•w1•inner')),
    expectedResult: 'hello',
    runBefore: pipe(jbm.worker(), remote.action(jbm.child('inner'), '%%')),
    timeout: 5000
  })
})

jb.component('remoteTest.innerWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: remote.action(jbm.child('inWorker'), jbm.worker()),
    calculate: pipe(net.listSubJbms(), join(',')),
    expectedResult: contains(['tests•w1','tests•w1•inWorker'])
  })
})

jb.component('remoteTest.jbm.byUri', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.child('tst'),
    calculate: remote.data('hello', jbm.byUri('tests•tst')),
    expectedResult: equals('hello')
  })
})

jb.component('remoteTest.workerByUri', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.worker('w1'),
    calculate: rx.pipe(
      source.data('hello'),
      remote.operator(rx.map('%% world'), jbm.byUri('tests•w1'))
    ),
    expectedResult: equals('hello world')
  })
})

jb.component('remoteTest.workerToWorker', {
  impl: dataTest({
    calculate: source.remote(
      rx.pipe(source.data('hello'), rx.map('%%'), remote.operator(rx.map('%% world'), jbm.byUri('tests•w2'))),
      jbm.byUri('tests•w1')
    ),
    expectedResult: equals('hello world'),
    runBefore: runActions(jbm.worker('w1'), jbm.worker('w2')),
    timeout: 5000
  })
})

jb.component('remoteTest.networkToWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker({id: 'peer1', networkPeer: true}), jbm.worker('w2')),
    calculate: source.remote(rx.pipe(
        source.data('hello'),
        rx.map('%%'),
        remote.operator(rx.map('%% world'), jbm.byUri('tests•w2'))
      ), jbm.byUri('peer1')),
    expectedResult: equals('hello world')
  })
})

jb.component('remoteTest.networkGateway', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(jbm.worker({id: 'peer1', networkPeer: true}), jbm.worker({id: 'peer2', networkPeer: true})),
    calculate: source.remote(rx.pipe(
        source.data('hello'),
        rx.map('%%'),
        remote.operator(rx.map('%% world'), jbm.byUri('peer2'))
      ), jbm.byUri('peer1')),
    expectedResult: equals('hello world')
  })
})

jb.component('remoteTest.shadowResource.initWatchable', {
  impl: dataTest({
    timeout: 5000,
    runBefore: remote.shadowResource('person', jbm.worker()),
    calculate: remote.data(() => jb.watchable != null,jbm.worker()),
    expectedResult: equals(true)
  })
})

jb.component('remoteTest.shadowResource.watchable', {
  impl: dataTest({
    calculate: remote.data(
      pipe(rx.pipe(source.watchableData('%$person/name%'), rx.log('test'), rx.map('%newVal%'), rx.take(1))),
      jbm.worker()
    ),
    expectedResult: equals('Dan'),
    runBefore: runActions(
      remote.shadowResource('person', jbm.worker()), 
    () => { jb.exec(runActions(delay(1), writeValue('%$person/name%','Dan'))) },// writeValue after calculate
    ),
    timeout: 5000
  })
})

jb.component('remoteTest.shadowResource.childJbm', {
  impl: dataTest({
    timeout: 5000,
    runBefore: runActions(
      remote.shadowResource('person', jbm.child('inner')),
      () => { jb.exec(runActions(delay(1), writeValue('%$person/name%','Dan'))) } // writeValue after calculate
    ),
    calculate: remote.data(
      pipe(rx.pipe(
        source.watchableData('%$person/name%'),
        rx.log('test'),
        rx.map('%newVal%'),
        rx.take(1)
      )), 
      jbm.child('inner')
    ),
    expectedResult: equals('Dan')
  })
})

jb.component('remoteTest.sourceNoTalkback', {
    impl: dataTest({
      timeout: 5000,
      calculate: pipe(rx.pipe(
            source.remote(source.interval(1), jbm.worker()),
            rx.take(2),
            rx.map('-%%-'),
      ), join(',')),
      expectedResult: equals('-0-,-1-')
    })
})

jb.component('remoteTest.source.remote.local', {
  impl: dataTest({
    timeout: 5000,
    calculate: pipe(
      rx.pipe(source.remote(source.data([1, 2, 3])), rx.take(2), rx.map('-%%-')),
      join(',')
    ),
    expectedResult: equals('-1-,-2-')
  })
})

jb.component('remoteTest.source.remote.worker', {
  impl: dataTest({
    timeout: 5000,
    calculate: pipe(
      rx.pipe(source.remote(source.data([1, 2, 3]), jbm.worker()), rx.take(2), rx.map('-%%-')),
      join(',')
    ),
    expectedResult: equals('-1-,-2-')
  })
})

jb.component('remoteTest.remote.operator', {
    impl: dataTest({
      timeout: 5000,
      calculate: pipe(
         rx.pipe(
            source.data([1,2,3]),
            remote.operator(rx.take(2), jbm.worker()),
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
//       remote.operator(rx.map(remoteTest.sampleObject(5)), jbm.worker()),
//       remote.operator(rx.map('%m1()%'), jbm.worker()),
//       rx.take(1)
//     ),
//     expectedResult: equals(5)
//   })
// })

jb.component('remoteTest.remoteParam', {
  params: [
    { id: 'retVal', defaultValue: 5},
  ],
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          source.data(1),
          remote.operator(rx.map('%$retVal%'), jbm.worker()),
          rx.take(1)
    ),
    expectedResult: equals(5)
  })
})

jb.component('remoteTest.remoteVar', {
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          source.data(1),
          rx.var('retVal',5),
          remote.operator(rx.map('%$retVal%'), jbm.worker()),
          rx.take(1)
    ),
    expectedResult: equals(5)
  })
})

jb.component('remoteTest.remoteVarCleanAndRestore', {
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          source.data(1),
          rx.var('notPassed',5),
          remote.operator(rx.map(ctx=> ctx.vars['not'+'Passed'] || 3), jbm.worker()),
          rx.log('test 0'),
          rx.map('%%-%$notPassed%'),
          rx.take(1)
    ),
    expectedResult: equals('3-5')
  })
})

jb.component('remoteTest.operator.useVars', {
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          source.data(1),
          rx.var('keepIt','keep me'),
          remote.operator(rx.var('remoteVar','alive'), jbm.worker()),
          rx.map('%$keepIt%-%$remoteVar%'),
          rx.take(1)
    ),
    expectedResult: equals('keep me-alive')
  })
})

jb.component('remoteTest.dynamicProfileFunc', {
  params: [
    { id: 'func', dynamic: true, defaultValue: '-%%-'},
  ],
  impl: dataTest({
    timeout: 5000,
      calculate: rx.pipe(
          source.data(1),
          remote.operator(rx.map('%$func()%'), jbm.worker()),
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
//           remote.operator(rx.map('%$func()%'), jbm.worker()),
//           rx.take(1)
//     ),
//     expectedResult: equals('-1-')
//   })
// })


jb.component('remoteTest.nodeContainer', {
  impl: dataTest({
    calculate: pipe(jbm.remoteNodeWorker(), remote.data('hello', '%%')),
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
//       jbm.worker()
//     ),
//     userInputRx: rx.pipe(
//       source.waitForSelector('button'),
//       rx.map(userInput.click('button')),
//     ),
//     checkResultRx: () => jb.ui.renderingUpdates,
//     expectedResult: contains('delta error true')
//   })
// })

jb.component('remoteTest.nodeContainer.runTest', {
  impl: dataTest({
    vars: [
      Var('testsToRun', list('dataTest.join', 'dataTest.ctx.expOfRefWithBooleanType')),
      Var('servlet', jbm.remoteNodeWorker({
        id: 'tester',
        loadTests: true,
        projects: list('studio'),
        inspect: 7010
      }))
    ],
    calculate: pipe(
      rx.pipe(
        source.data('%$testsToRun%'),
        rx.log('test'),
        remote.operator(
          rx.mapPromise(
            ({data}) => {
        return jb.test.runOneTest(data) 
      }
          ),
          '%$servlet%'
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

jb.component('remoteTest.testResults', {
  impl: dataTest({
    vars: [
      Var('testsToRun', list('dataTest.join', 'dataTest.ctx.expOfRefWithBooleanType')),
      Var('servlet', jbm.remoteNodeWorker('tester', list('studio')))
    ],
    calculate: pipe(rx.pipe(source.testsResults('%$testsToRun%', '%$servlet%'), rx.log('test')), '%id%-%started%-%success%', join(',')),
    expectedResult: equals(
      'dataTest.join-true-,dataTest.join--true,dataTest.ctx.expOfRefWithBooleanType-true-,dataTest.ctx.expOfRefWithBooleanType--true'
    ),
    timeout: 3000
  })
})

// jb.component('remoteTest.tcp', {
//   impl: dataTest({
//     vars: [
//       Var('s1', jbm.remoteNodeWorker({id: 's1', inspect: 7010, spyParam: 'remote'})),
//     ],
//     calculate: remote.data(pipe(
//       jbm.remoteNodeWorker({id: 's2', tcp: true, urlBase: 'http://localhost:8082', spyParam: 'remote', inspect: 7011}),
//       remote.data('hello from s2 via tcp', '%%'))
//         ,'%$s1%'),
//     expectedResult: equals('hello from s2 via tcp'),
//     timeout: 3000
//   })
// })



