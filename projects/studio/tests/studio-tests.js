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