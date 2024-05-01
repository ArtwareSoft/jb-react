
component('remoteTest.stateless', {
  impl: dataTest({
    calculate: pipeline(
      Var('v1', '33'),
      remote.data(pipeline(list('a','b','%$v1%'), join()), stateless(sourceCode(plugins('common'))))
    ),
    expectedResult: equals('a,b,33'),
    timeout: 2000
  })
})

component('remoteTest.workerData', {
  impl: remote.data(list([1,2,3]), worker())
})

component('remoteTest.worker.data', {
  impl: dataTest(pipe(remote.data(list([1,2,3]), worker()), join(',')), equals('1,2,3'))
})

component('remoteTest.remoteNodeWorker.data', {
  impl: dataTest({
    calculate: pipe(remote.data(list([1,2,3]), remoteNodeWorker()), join(',')),
    expectedResult: equals('1,2,3'),
    timeout: 2000,
    spy: 'remote'
  })
})

component('remoteTest.remote.deStripBug', {
  impl: dataTest({
    calculate: remote.data('%%', child(), { data: asIs({'$$asIs': true, remoteRun: {$: 'runCtx'}}) }),
    expectedResult: equals('runCtx', ({data}) => data.remoteRun.$)
  })
})

component('remoteTest.remote.action', {
  impl: dataTest(remote.data('%$w%', worker()), equals('hello'), {
    runBefore: remote.action(() => jb.db.passive('w','hello'), worker()),
    timeout: 1000
  })
})

component('remoteTest.remoteOperator.remoteParam', {
  params: [
    {id: 'retVal', defaultValue: 5}
  ],
  impl: dataTest(rx.pipe(source.data(1), remote.operator(rx.map('%$retVal%'), worker()), rx.take(1)), equals(5), {
    timeout: 5000
  })
})

component('remoteTest.remoteOperator.remoteVar', {
  impl: dataTest({
    calculate: rx.pipe(source.data(1), rx.var('retVal', 5), remote.operator(rx.map('%$retVal%'), worker()), rx.take(1)),
    expectedResult: equals(5),
    timeout: 5000
  })
})

component('test.addAA', {
  type: 'rx<>',
  impl: rx.map('AA%%')
})

component('remoteTest.remoteOperator.loadOperatorCode', {
  impl: dataTest(rx.pipe(source.data('bb'), remote.operator(test.addAA(), worker())), equals('AAbb'), { timeout: 1000 })
})

component('remoteTest.remoteOperator.child.loadOperatorCode', {
  impl: dataTest(rx.pipe(source.data('bb'), remote.operator(test.addAA(), child('opTst'))), equals('AAbb'), {
    timeout: 1000
  })
})

component('itemlists.manyItems2', {
  type: 'data<>',
  params: [
    {id: 'howMany', as: 'number', defaultValue: 1000}
  ],
  impl: pipeline(
    range(1, '%$howMany%'),
    obj(prop('id', '%%'), prop('name', '%%-%%'), prop('group', ({data}) => Math.floor(Number(data) /10)))
  )
})
component('remoteTest.worker.sourceCode.project', {
  impl: dataTest({
    calculate: remote.data({
      calc: pipeline(itemlists.manyItems2(3), '%id%', join(',')),
      jbm: worker('itemlists', { sourceCode: project('itemlists') })
    }),
    expectedResult: equals('1,2,3'),
    timeout: 3000
  })
})

component('remoteTest.dataAsRx', {
  impl: dataTest(remote.data(rx.pipe(source.data('Dan')), worker()), equals('Dan'))
})

component('remoteTest.dataAsRxWrapedWithPipe', {
  impl: dataTest(remote.data(pipe(rx.pipe(source.data('Dan'))), worker()), equals('Dan'))
})

component('remoteTest.networkGateway', {
  impl: dataTest({
    calculate: rx.pipe(
      source.remote({
        rx: rx.pipe(
          source.data('hello'),
          rx.map('%%'),
          remote.operator(rx.map('%% world'), byUri('peer2'))
        ),
        jbm: byUri('peer1')
      })
    ),
    expectedResult: equals('hello world'),
    runBefore: runActions(
      jbm.start(worker('peer1', { networkPeer: true })),
      jbm.start(worker('peer2', { networkPeer: true }))
    ),
    timeout: 5000
  })
})

component('remoteTest.shadowResource.initWatchable', {
  impl: dataTest(remote.data(() => jb.watchable != null, worker()), equals(true), {
    runBefore: remote.shadowResource('person', worker()),
    timeout: 5000
  })
})

component('remoteTest.shadowResource.watchable', {
  impl: dataTest({
    calculate: remote.data({
      calc: rx.pipe(source.watchableData('%$person/name%'), rx.log('test'), rx.map('%newVal%'), rx.take(1)),
      jbm: worker()
    }),
    expectedResult: equals('Dan'),
    runBefore: runActions(
      remote.shadowResource('person', worker()),
      () => { 
        // do not return promise
        jb.exec(runActions(delay(1), writeValue('%$person/name%','Dan'))) 
      }
    ),
    timeout: 5000
  })
})

component('remoteTest.shadowResource.childJbm', {
  impl: dataTest({
    calculate: remote.data({
      calc: rx.pipe(source.watchableData('%$person/name%'), rx.log('test'), rx.map('%newVal%'), rx.take(1)),
      jbm: child('inner')
    }),
    expectedResult: equals('Dan'),
    runBefore: runActions(
      remote.shadowResource('person', child('inner')),
      () => { 
        // do not return promise
        jb.exec(runActions(delay(1), writeValue('%$person/name%','Dan')))
      }
    ),
    timeout: 5000
  })
})

component('remoteTest.sourceNoTalkback', {
  impl: dataTest({
    calculate: pipe(rx.pipe(source.remote(source.interval(1), worker()), rx.take(2), rx.map('-%%-')), join(',')),
    expectedResult: equals('-0-,-1-'),
    timeout: 5000
  })
})

component('remoteTest.source.remote.local', {
  impl: dataTest({
    calculate: pipe(rx.pipe(source.remote(source.data([1,2,3])), rx.take(2), rx.map('-%%-')), join(',')),
    expectedResult: equals('-1-,-2-')
  })
})

component('remoteTest.source.remote.worker', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(source.remote(source.data([1,2,3]), worker()), rx.take(2), rx.map('-%%-')),
      join(',')
    ),
    expectedResult: equals('-1-,-2-')
  })
})

component('remoteTest.source.remote.pipe', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(
        source.remote(rx.pipe(source.data([1,2,3]), rx.map('-%%-')), worker()),
        rx.take(2),
        rx.map('-%%-')
      ),
      join(',')
    ),
    expectedResult: equals('--1--,--2--')
  })
})

component('remoteTest.remote.operator', {
  impl: dataTest({
    calculate: pipe(
      rx.pipe(source.data([1,2,3]), remote.operator(rx.take(2), worker()), rx.map('-%%-')),
      join(',')
    ),
    expectedResult: equals('-1-,-2-'),
    timeout: 5000
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

component('remoteTest.operator.runTest', {
  impl: dataTest({
    vars: [
      Var('testsToRun', list('commonTest.join','commonTest.slice'))
    ],
    calculate: pipe(
      rx.pipe(
        source.data('%$testsToRun%'),
        rx.var('fullTestId', 'test<>%%'),
        rx.log('test'),
        remote.operator({
          rx: rx.mapPromise(({data},{fullTestId}) => jb.test.runSingleTest(data,{fullTestId})),
          jbm: worker('tester', { sourceCode: sourceCode(pluginsByPath('/plugins/common/xx-tests.js')) })
        }),
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
      Var('testsToRun', list('commonTest.join','commonTest.slice'))
    ],
    calculate: pipe(
      rx.pipe(
        source.testsResults('%$testsToRun%', worker('tester', {
          sourceCode: sourceCode(pluginsByPath('/plugins/common/xx-tests.js'))
        })),
        rx.log('test')
      ),
      '%id%-%started%-%success%',
      join(',')
    ),
    expectedResult: equals(
      'commonTest.join-true-,commonTest.join--true,commonTest.slice-true-,commonTest.slice--true'
    ),
    timeout: 3000
  })
})

component('remoteTest.dataFromCmd', {
  impl: dataTest({
    calculate: remote.cmd(pipeline(list('a','b','%$v1%'), join()), {
      context: obj(prop('v1', '33')),
      sourceCode: sourceCode(plugins('common'))
    }),
    expectedResult: equals('a,b,33'),
    timeout: 3000
  })
})

component('remoteTest.listSubJbms', {
  impl: dataTest(pipe(remote.listSubJbms(), join(',')), contains('tests,','tests•inner'), {
    runBefore: jbm.start(child('inner')),
    timeout: 1000
  })
})

component('remoteTest.listAll', {
  impl: dataTest(remote.listAll(), equals(['tests','tests•inner','networkPeer']), {
    runBefore: runActions(jbm.start(worker('networkPeer', { networkPeer: true })), jbm.start(child('inner'))),
    timeout: 1000
  })
})

component('remoteTest.remoteCtx.varsUsed', {
  params: [
    {id: 'p1', dynamic: true, defaultValue: pipeline('%$aa%','%$bb%')}
  ],
  impl: dataTest(remoteCtx.varsUsed(ctx => ctx.cmpCtx.params.p1.profile), equals(['aa','bb']))
})

component('remoteTest.nodeOnly', {
  impl: dataTest(nodeOnly('5', plugins('common')), equals(5))
})
