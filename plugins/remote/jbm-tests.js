using('parsing,core-tests')

component('jbmTest.child', {
  impl: dataTest({
    calculate: remote.data('hello', child()),
    expectedResult: equals('hello')
  })
})

component('jbmTest.worker', {
  impl: dataTest({
    calculate: remote.data('hello', worker()),
    expectedResult: equals('hello'),
    timeout: 3000
  })
})

component('jbmTest.cmd', {
  impl: dataTest({calculate: remote.data(pipeline('hello'), cmd()), expectedResult: equals('hello'), timeout: 5000})
})

component('jbmTest.cmdWithVars', {
  impl: dataTest({
    calculate: pipeline(Var('toPass', 'aa'), remote.data(pipeline('hello %$toPass%'), cmd())),
    expectedResult: equals('hello aa'),
    timeout: 5000
  })
})

component('jbmTest.cmdWithParams', {
  params: [
    {id: 'toPass', defaultValue: 'aa'}
  ],
  impl: dataTest(remote.data(pipeline('hello %$toPass%'), cmd()), equals('hello aa'))
})

component('jbmTest.cmdWithParams.script.static', {
  params: [
    {id: 'toPass', defaultValue: trim(nameOfCity(eilat())) }
  ],
  impl: dataTest(remote.data(pipeline('hello %$toPass%'), cmd()), equals('hello Eilat'))
})

component('jbmTest.cmdWithParams.script.staticObj', {
  params: [
    {id: 'toPass', defaultValue: () => ({ x: 'aa\nbb'}) }
  ],
  impl: dataTest(remote.data(pipeline('hello %$toPass/x%'), cmd()), equals('hello aa\nbb'))
})

component('jbmTest.cmdWithParams.script.dynamic', {
  params: [
    {id: 'toPass', defaultValue: trim(nameOfCity(eilat())), dynamic: true}
  ],
  impl: dataTest({
    calculate: remote.data(pipeline('hello %$toPass()%'), cmd()),
    expectedResult: equals('hello Eilat'),
    timeout: 500
  })
})

component('jbmTest.cmdWithParams.script.js', {
  params: [
    {id: 'toPass', defaultValue: () => 'aa', dynamic: true}
  ],
  impl: dataTest({
    calculate: remote.data(pipeline('hello %$toPass()%'), cmd()),
    expectedResult: equals('hello aa'),
    timeout: 500
  })
})

component('jbmTest.cmdWithParams.objWithNL', {
  params: [
    {id: 'toPass', defaultValue: 'a\na'}
  ],
  impl: dataTest(remote.data(pipeline('hello %$toPass%'), cmd()), equals('hello a\na'))
})

component('jbmTest.remote.data.defComponents', {
  impl: dataTest({
    calculate: remote.data(pipeline('1.5', math.floor()), worker()),
    expectedResult: equals(1),
    timeout: 500
  })
})

component('jbmTest.innerTreeShake', {
  impl: dataTest({
    calculate: remote.data(() => jb.utils.emptyLineWithSpaces != null, byUri('tests•w1•inner')),
    expectedResult: equals(true),
    runBefore: pipe(jbm.start(worker()), remote.action(jbm.start(child('inner')), '%%')),
    timeout: 5000
  })
})

component('jbmTest.innerWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: remote.action(jbm.start(child('inWorker')), worker()),
    calculate: pipe(net.listSubJbms(), join(',')),
    expectedResult: contains(['tests•w1','tests•w1•inWorker'])
  })
})

component('jbmTest.child.byUri', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.start(child('tst')),
    calculate: remote.data('hello', byUri('tests•tst')),
    expectedResult: equals('hello')
  })
})

component('jbmTest.worker.byUri', {
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

component('jbmTest.workerToWorker', {
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

component('jbmTest.networkToWorker', {
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

component('jbmTest.remoteVarCleanAndRestore', {
  impl: dataTest({
    calculate: rx.pipe(
      source.data(1),
      rx.var('notPassed', 5),
      remote.operator(rx.map(ctx=> ctx.vars['not'+'Passed'] || 3), worker()),
      rx.log('test 0'),
      rx.map('%%-%$notPassed%'),
      rx.take(1)
    ),
    expectedResult: equals('3-5'),
    timeout: 5000
  })
})

component('jbmTest.operator.useVars', {
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

component('jbmTest.dynamicProfileFunc', {
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

component('jbmTest.remoteNodeWorker', {
  impl: dataTest({
    calculate: pipe(jbm.start(remoteNodeWorker()), remote.data('hello', '%%')),
    expectedResult: equals('hello'),
    timeout: 3000
  })
})

component('jbmTest.remote.data', {
  impl: dataTest({
    timeout: 3000,
    calculate: pipe(
      Var('w','world'), remote.data('hello %$w%', worker())),
    expectedResult: equals('hello world')
  })
})

component('jbmTest.childJbmPort', {
  impl: dataTest({
    calculate: remote.data('hello', byUri('tests•w1•inner')),
    expectedResult: 'hello',
    runBefore: pipe(jbm.start(worker()), remote.action(jbm.start(child('inner')), '%%')),
    timeout: 5000
  })
})

