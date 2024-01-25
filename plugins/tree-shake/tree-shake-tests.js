component('treeShakeTest.basic', {
  impl: dataTest({
    calculate: pipeline(() => jb.treeShake.treeShake(['notContains'],{}), join(',')),
    expectedResult: and(contains('contains'), contains('not'))
  })
})

component('treeShakeTest.itemlist', {
  impl: dataTest({
    calculate: pipeline(() => jb.treeShake.treeShake(['itemlist'],{}), join(',')),
    expectedResult: and(contains('writeValue'), contains('#ui.vdomDiff'))
  })
})

component('treeShakeTest.big', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.treeShake.code(jb.treeShake.treeShake('widget.headless,call,editableText,editableText.codemirror'.split(','),{}))
    ),
    expectedResult: contains('jb.ui.h')
  })
})

component('treeShakeTest.funcDef', {
  impl: dataTest({
    calculate: pipeline(() => jb.treeShake.treeShake(['#utils.toSynchArray'],{}), join(',')),
    expectedResult: contains('#callbag.fromIter')
  })
})

component('treeShakeTest.runOnWorker', {
  impl: dataTest(remote.data(pipeline('hello'), byUri('tests•dynaWorker')), '%%==hello', {
    runBefore: jbm.start(worker('dynaWorker')),
    timeout: 5000
  })
})

component('test.compWithEscInFunc', {
  impl: () => '\\'
})

component('treeShakeTest.compToStrEsc', {
  impl: dataTest(ctx => jb.treeShake.compToStr('test.compWithEscInFunc'), notContains('\\\\\\'))
})