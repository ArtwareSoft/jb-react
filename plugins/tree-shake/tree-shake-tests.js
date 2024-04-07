component('treeShakeTest.basic', {
  impl: dataTest({
    calculate: pipeline(() => jb.treeShake.treeShake(['boolean<>notContains'],{}), join(',')),
    expectedResult: and(contains('boolean<>contains'), contains('boolean<>not'))
  })
})

component('treeShakeTest.itemlist', {
  impl: dataTest({
    calculate: pipeline(() => jb.treeShake.treeShake(['control<>itemlist'],{}), join(',')),
    expectedResult: and(contains('action<>writeValue'), contains('#ui.vdomDiff'))
  })
})

component('treeShakeTest.big', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.treeShake.code(jb.treeShake.treeShake('rx<>widget.headless,any<>call,control<>editableText'.split(','),{}))
    ),
    expectedResult: contains('jb.ui.h')
  })
})

component('treeShakeTest.funcDef', {
  impl: dataTest({
    calculate: pipeline(() => jb.treeShake.treeShake(['#utils.waitForInnerElements'],{}), join(',')),
    expectedResult: contains('#utils.isCallbag')
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
  impl: dataTest(ctx => jb.treeShake.compToStr('data<>test.compWithEscInFunc'), notContains('\\\\\\'))
})