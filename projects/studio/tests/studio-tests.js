jb.component('studioTest.save', {
    impl: dataTest({
        vars: Var('newVal', () => Math.floor(Math.random() * 1000 )),
        runBefore: runActions(
            (ctx,{newVal}) => {
                jb.scriptHistory.undoIndex = 0
                jb.scriptHistory.compsHistory = []
                jb.watchableComps.handler.writeValue(jb.tgp.ref('studioTest.changingComp~impl'),newVal,ctx)
            }
        ),
        calculate: pipe(
            Var('saveResult', studio.saveComponents()),
            waitFor('%$saveResult.isDone()%'),
            http.get('/projects/studio/tests/studio-changing-file.js'),
        ),
        expectedResult: and(contains('%$newVal%'),notContains('location'))
    })
})

jb.component('eventTracker.worker.vDebugger', {
  impl: uiTest({
    control: remote.widget(studio.eventTracker(), byUri('tests•w1•vDebugger')),
    runBefore: remote.action(
      runActions(
        () => jb.spy.initSpy({spyParam: 'remote,log1'}), 
        log('log1', obj(prop('hello', 'world'))), 
        jbm.start(jbm.vDebugger())
      ),
      worker()
    ),
    expectedResult: contains('log1'),
    timeout: 5000
  })
})

jb.component('eventTracker.uiTest.vDebugger', {
  impl: uiTest({
    timeout: 2000,
    runBefore: remote.action(
      runActions(
        jbm.start(jbm.vDebugger()), 
        log('check test result', obj(prop('html','<div><span>aa</span></div>'), prop('success',true))),
        log('check test result', obj(prop('html','<span/>'), prop('success',false))),
      ), worker()),
    control: group({
      controls: [
        remote.widget(editableText({databind:'%$person/name%'}), worker()),
        remote.widget(studio.eventTracker(), byUri('tests•w1•vDebugger')),
      ]
    }),
    expectedResult: contains('group'),
  })
})
