using('parsing,core-tests')

component('jbmTest.child', {
  impl: dataTest(remote.data('hello', child()), equals('hello'))
})

component('jbmTest.worker', {
  impl: dataTest(remote.data('hello', worker()), equals('hello'), { timeout: 3000 })
})

component('jbmTest.cmd', {
  impl: dataTest(remote.data(pipeline('hello'), cmd()), equals('hello'), { timeout: 5000 })
})

component('jbmTest.cmdWithVars', {
  impl: dataTest(pipeline(Var('toPass', 'aa'), remote.data(pipeline('hello %$toPass%'), cmd())), equals('hello aa'), {
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
    {id: 'toPass', defaultValue: trim(nameOfCity(eilat()))}
  ],
  impl: dataTest(remote.data(pipeline('hello %$toPass%'), cmd()), equals('hello Eilat'))
})

component('jbmTest.cmdWithParams.script.staticObj', {
  params: [
    {id: 'toPass', defaultValue: () => ({ x: 'aa\nbb'})}
  ],
  impl: dataTest(remote.data(pipeline('hello %$toPass/x%'), cmd()), equals(`hello aa
bb`))
})

component('jbmTest.cmdWithParams.script.dynamic', {
  params: [
    {id: 'toPass', defaultValue: trim(nameOfCity(eilat())), dynamic: true}
  ],
  impl: dataTest(remote.data(pipeline('hello %$toPass()%'), cmd()), equals('hello Eilat'), { timeout: 500 })
})

component('jbmTest.cmdWithParams.script.js', {
  params: [
    {id: 'toPass', defaultValue: () => 'aa', dynamic: true}
  ],
  impl: dataTest(remote.data(pipeline('hello %$toPass()%'), cmd()), equals('hello aa'), { timeout: 500 })
})

component('jbmTest.cmdWithParams.objWithNL', {
  params: [
    {id: 'toPass', defaultValue: `a
a`}
  ],
  impl: dataTest(remote.data(pipeline('hello %$toPass%'), cmd()), equals(`hello a
a`))
})

component('jbmTest.remote.data.defComponents', {
  impl: dataTest(remote.data(pipeline('1.5', math.floor()), worker()), equals(1), { timeout: 500 })
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
  impl: dataTest(pipe(net.listSubJbms(), join(',')), contains(['tests•w1','tests•w1•inWorker']), {
    runBefore: remote.action(jbm.start(child('inWorker')), worker()),
    timeout: 5000
  })
})

component('jbmTest.child.byUri', {
  impl: dataTest(remote.data('hello', byUri('tests•tst')), equals('hello'), {
    runBefore: jbm.start(child('tst')),
    timeout: 1000
  })
})

component('jbmTest.worker.byUri', {
  impl: dataTest({
    calculate: rx.pipe(source.data('hello'), remote.operator(rx.map('%% world'), byUri('tests•w1'))),
    expectedResult: equals('hello world'),
    runBefore: jbm.start(worker('w1')),
    timeout: 1000
  })
})

component('jbmTest.workerToWorker', {
  impl: dataTest({
    calculate: source.remote({
      rx: rx.pipe(source.data('hello'), rx.map('%%'), remote.operator(rx.map('%% world'), byUri('tests•w2'))),
      jbm: byUri('tests•w1')
    }),
    expectedResult: equals('hello world'),
    runBefore: runActions(jbm.start(worker('w1')), jbm.start(worker('w2'))),
    timeout: 5000
  })
})

component('jbmTest.networkToWorker', {
  impl: dataTest({
    calculate: source.remote({
      rx: rx.pipe(source.data('hello'), rx.map('%%'), remote.operator(rx.map('%% world'), byUri('tests•w2'))),
      jbm: byUri('peer1')
    }),
    expectedResult: equals('hello world'),
    runBefore: runActions(jbm.start(worker('peer1', { networkPeer: true })), jbm.start(worker('w2'))),
    timeout: 5000
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
    calculate: rx.pipe(
      source.data(1),
      rx.var('keepIt', 'keep me'),
      remote.operator(rx.var('remoteVar', 'alive'), worker()),
      rx.map('%$keepIt%-%$remoteVar%'),
      rx.take(1)
    ),
    expectedResult: equals('keep me-alive'),
    timeout: 5000
  })
})

component('jbmTest.dynamicProfileFunc', {
  params: [
    {id: 'func', dynamic: true, defaultValue: '-%%-'}
  ],
  impl: dataTest({
    calculate: rx.pipe(source.data(1), remote.operator(rx.map('%$func()%'), worker()), rx.take(1)),
    expectedResult: equals('-1-'),
    timeout: 5000
  })
})

component('jbmTest.remoteNodeWorker', {
  impl: dataTest(pipe(jbm.start(remoteNodeWorker()), remote.data('hello', '%%')), equals('hello'), { timeout: 3000 })
})

component('jbmTest.remote.data', {
  impl: dataTest(pipe(Var('w', 'world'), remote.data('hello %$w%', worker())), equals('hello world'), {
    timeout: 3000
  })
})

component('jbmTest.childJbmPort', {
  impl: dataTest(remote.data('hello', byUri('tests•w1•inner')), 'hello', {
    runBefore: pipe(jbm.start(worker()), remote.action(jbm.start(child('inner')), '%%')),
    timeout: 5000
  })
})

