using('ui-tests')

component('studioTest.save', {
  impl: dataTest({
    vars: [
      Var('newVal', () => Math.floor(Math.random() * 1000 ))
    ],
    calculate: pipe(
      Var('saveResult', studio.saveComponents()),
      waitFor('%$saveResult.isDone()%'),
      http.get('/projects/studio/tests/studio-changing-file.js')
    ),
    expectedResult: and(contains('%$newVal%'), notContains('location')),
    runBefore: runActions(
      (ctx,{newVal}) => {
                jb.scriptHistory.undoIndex = 0
                jb.scriptHistory.compsHistory = []
                jb.watchableComps.handler.writeValue(jb.tgp.ref('studioTest.changingComp~impl'),newVal,ctx)
            }
    )
  })
})

component('eventTracker.uiTest.vDebugger', {
  impl: uiTest(studio.eventTracker(), contains('remote rec'), {
    runBefore: remote.action({
      action: runActions(
        jbm.start(jbm.vDebugger()),
        log('check test result', obj(prop('html', '<div><span>aa</span></div>'), prop('success', true))),
        log('check test result', obj(prop('html', '<span/>'), prop('success', false)))
      ),
      jbm: worker()
    }),
    timeout: 4000,
    backEndJbm: byUri('tests•w1•vDebugger')
  })
})
