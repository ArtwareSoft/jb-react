jb.component('loaderTest.treeShake', {
  impl: dataTest({
    calculate: pipeline(() => jb.treeShake.treeShake(['notContains'],{}), join(',')),
    expectedResult: and(contains('contains'),contains('not'))
  })
})

jb.component('loaderTest.treeShake.itemlist', {
  impl: dataTest(
    pipeline(() => jb.treeShake.treeShake(['itemlist'],{}), join(',')),
    and(contains('writeValue'), contains('#ui.vdomDiff'))
  )
})

jb.component('loaderTest.treeShake.big', {
  impl: dataTest(
    pipeline(
      () => jb.treeShake.code(jb.treeShake.treeShake('widget.headless,call,editableText,editableText.codemirror'.split(','),{}))
    ),
    contains('jb.ui.h')
  )
})

jb.component('loaderTest.treeShake.funcDef', {
  impl: dataTest(pipeline(() => jb.treeShake.treeShake(['#utils.toSynchArray'],{}), join(',')), contains('#callbag.fromIter'))
})

jb.component('loaderTest.runOnWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: jbm.worker('dynaWorker'),
    calculate: remote.data(pipeline('hello'), jbm.byUri('tests•dynaWorker')),
    expectedResult: '%%==hello'
  })
})

jb.component('test.compWithEscInFunc', {
  impl: () => '\\'
})

jb.component('loaderTest.treeShake.compToStrEsc', {
  impl: dataTest(ctx => jb.treeShake.compToStr('test.compWithEscInFunc'), notContains('\\\\\\'))
})