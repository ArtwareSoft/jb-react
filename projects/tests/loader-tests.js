jb.component('loaderTest.treeShake', {
  impl: dataTest({
    calculate: pipeline(() => jb.codeLoader.treeShake(['notContains'],{}), join(',')),
    expectedResult: and(contains('contains'),contains('not'))
  })
})

jb.component('loaderTest.treeShake.itemlist', {
  impl: dataTest({
    calculate: pipeline(() => jb.codeLoader.treeShake(['itemlist'],{}), join(',')),
    expectedResult: and(contains('writeValue'),contains('#ui.vdomDiff'))
  })
})

jb.component('loaderTest.treeShake.big', {
  impl: dataTest({
    calculate: pipeline(() => jb.codeLoader.code(jb.codeLoader.treeShake('widget.headless,call,editableText,editableText.codemirror'.split(','),{}))),
    expectedResult: contains('jb.ui.h')
  })
})

jb.component('loaderTest.treeShake.funcDef', {
  impl: dataTest({
    calculate: pipeline(() => jb.codeLoader.treeShake(['#utils.toSynchArray'],{}), join(',')),
    expectedResult: contains('#callbag.fromIter')
  })
})

jb.component('loaderTest.runOnWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: jbm.worker('dynaWorker'),
    calculate: remote.data(pipeline('hello'), jbm.byUri('tests•dynaWorker')),
    expectedResult: '%%==hello'
  })
})