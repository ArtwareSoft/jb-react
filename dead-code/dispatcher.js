jb.component('remote.dispatch', {
    description: 'batch jobs to multiple servers',
    type: 'rx',
    category: 'operator',
    params: [
      {id: 'job', description:'job of item, should return data', dynamic: true, mandatory: true },
      {id: 'servers', type: 'dispatch.server[]', as: 'array', mandatory: true},
      {id: 'serverMatch', type: 'boolean', dynamic: 'true', defaultValue: true, description: 'use %$server% and %% as item'},
    ],
    impl: rx.innerPipe(
      rx.resource('tasks',rx.queue()),
      rx.resource('availableServers', rx.queue('%$servers/jbm/uri%')),

      rx.do(action.addToQueue('%$tasks%')),
      rx.take(1),
      rx.flatMap(rx.pipe(
        source.queue('%$availableServers%'),
        rx.var('serverUri'),
        rx.var('server',pipeline('%$servers%', filter(equals('%jbm/uri%','%$serverUri%')), last())),
        rx.log('test server'),
        rx.do(action.removeFromQueue('%$availableServers%')),
        rx.flatMap(rx.pipe(
          source.queue('%$tasks%'), 
          rx.var('task'),
          rx.log('test task'),
          rx.filter(call('serverMatch')), 
//          rx.take(1),
          rx.do(action.removeFromQueue('%$tasks%')),
//          rx.map(call('job')),
          remote.operator(rx.map(call('job')), '%$server/jbm%'),
          rx.log('test result'),
          rx.do(action.addToQueue('%$availableServers%','%$serverUri%'))
        )),
      ))
    )
})

jb.component('dispatch.singleJbm', {
  type: 'dispatch.server',
  params: [
    {id: 'jbm', type: 'jbm', mandatory: true},
    {id: 'capabilities', type: 'dispatch.capabilities[]', as: 'array', mandatory: true}
  ],
  impl: ctx => ctx.params
})


jb.component('remoteTest.dispatcher.child', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.child('dispatch'),
    calculate: pipe(rx.pipe(
        source.data(list(1,2)), 
        remote.dispatch('a-%%', dispatch.singleJbm(jbm.byUri('tests•dispatch'))),
        rx.take(2)
      ), join(',')),
    expectedResult: equals('a-1,a-2')
  })
})

jb.component('remoteTest.dispatcher.worker', {
  impl: dataTest({
    timeout: 1000,
    runBefore: jbm.worker('dispatchW'),
    calculate: pipe(rx.pipe(
        source.data(list(1,2)), 
        remote.dispatch('a-%%', dispatch.singleJbm(jbm.byUri('tests•dispatchW'))),
        rx.take(2)
      ), join(',')),
    expectedResult: equals('a-1,a-2')
  })
})

