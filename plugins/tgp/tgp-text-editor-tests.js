component('tgpTextEditorTest.getPosOfPath', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.tgpTextEditor.getPosOfPath('tgpTextEditorTest.getPosOfPath~impl~expectedResult', 'edit'),
      '%line%,%col%'
    ),
    expectedResult: equals('6,27')
  })
})

component('tgpTextEditorTest.pathChangeTest.wrap', {
  impl: tgp.pathChangeTest('probeTest.label1~impl', tgp.wrapWithGroup('probeTest.label1~impl'), {
    expectedPathAfter: 'probeTest.label1~impl~controls~0'
  })
})

