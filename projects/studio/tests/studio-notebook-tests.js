
jb.component('notebookTest.compToShadow', {
  impl: 'Homer'
})

jb.component('notebookTest.initShadowComponent', {
  impl: dataTest({
    timeout: 5000,
    runBefore: pipe(
      jbm.worker('notebook'),
      remote.action(loadLibs(['ui-common','notebook-worker']),'%%'),
      remote.initShadowComponent({compId: 'notebookTest.compToShadow', jbm: jbm.byUri('tests•notebook')}),
      () => { jb.exec(runActions(delay(1), writeValue(studio.ref('notebookTest.compToShadow~impl'),'Dan'))) } // writeValue after calculate
    ),
    calculate: remote.data(
      pipe(rx.pipe(
        studio.scriptChange(),
        rx.log('test'),
        rx.map('%newVal%'),
        rx.take(1)
      )), 
      jbm.byUri('tests•notebook')
    ),
    expectedResult: equals('Dan')
  })
})