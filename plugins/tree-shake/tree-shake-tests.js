component('treeShakeTest.basic', {
  impl: dataTest({
    calculate: pipeline(() => jb.treeShake.treeShake(['notContains'],{}), join(',')),
    expectedResult: and(contains('contains'),contains('not'))
  })
})

component('treeShakeTest.itemlist', {
  impl: dataTest(
    pipeline(() => jb.treeShake.treeShake(['itemlist'],{}), join(',')),
    and(contains('writeValue'), contains('#ui.vdomDiff'))
  )
})

component('treeShakeTest.big', {
  impl: dataTest(
    pipeline(
      () => jb.treeShake.code(jb.treeShake.treeShake('widget.headless,call,editableText,editableText.codemirror'.split(','),{}))
    ),
    contains('jb.ui.h')
  )
})

component('treeShakeTest.funcDef', {
  impl: dataTest(pipeline(() => jb.treeShake.treeShake(['#utils.toSynchArray'],{}), join(',')), contains('#callbag.fromIter'))
})

component('treeShakeTest.runOnWorker', {
  impl: dataTest({
    timeout: 5000,
    runBefore: jbm.start(worker('dynaWorker')),
    calculate: remote.data(pipeline('hello'), byUri('tests•dynaWorker')),
    expectedResult: '%%==hello'
  })
})

component('test.compWithEscInFunc', {
  impl: () => '\\'
})

component('treeShakeTest.compToStrEsc', {
  impl: dataTest(ctx => jb.treeShake.compToStr('test.compWithEscInFunc'), notContains('\\\\\\'))
})