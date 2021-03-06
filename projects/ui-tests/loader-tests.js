jb.component('loaderTest.treeShake', {
  impl: dataTest({
    calculate: pipeline(() => jb.loader.treeShake(['notContains'],{}), sort(), join(',')),
    expectedResult: '%%==notContains,not,contains,#tostring,#core.tojstype,#core.init_core_main'
  })
})

jb.component('loaderTest.treeShake.itemlist', {
  impl: dataTest({
    allowError: true,
    calculate: pipeline(() => jb.loader.treeShake(['itemlist'],{}), sort(), join(',')),
    expectedResult: and(contains('writeValue'),contains('#ui.vdomDiff'))
  })
})

// jb.component('loaderTest.runOnWorker', {
//   impl: dataTest({
//     timeout: 5000,
//     runBefore: runActions(delay(1000), jbm.workerWithLoader('dynaWorker')),
//     calculate: remote.data(pipeline('hello'), jbm.byUri('tests•dynaWorker')),
//     expectedResult: 'hello'
//   })
// })