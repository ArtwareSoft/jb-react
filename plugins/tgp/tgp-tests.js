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