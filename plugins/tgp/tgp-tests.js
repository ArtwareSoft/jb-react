jb.component('dataTest.tgpTextEditor.getPosOfPath', {
  impl: dataTest(
    pipeline(
      () => jb.tgpTextEditor.getPosOfPath('dataTest.tgpTextEditor.getPosOfPath~impl~expectedResult','profile'),
      slice(0, 2),
      join()
    ),
    equals('7,4')
  )
})

jb.component('pathChangeTest.wrap', {
  impl: tgp.pathChangeTest({
    path: 'probeTest.label1~impl',
    action: tgp.wrapWithGroup('probeTest.label1~impl'),
    expectedPathAfter: 'probeTest.label1~impl~controls~0'
  })
})