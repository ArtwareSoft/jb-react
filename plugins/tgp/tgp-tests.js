component('dataTest.tgpTextEditor.getPosOfPath', {
  impl: dataTest(
    pipeline(
      () => jb.tgpTextEditor.getPosOfPath('dataTest.tgpTextEditor.getPosOfPath~impl~expectedResult','profile'),
      slice(0, 2),
      join()
    ),
    equals('7,4')
  )
})

component('pathChangeTest.wrap', {
  impl: tgp.pathChangeTest({
    path: 'probeTest.label1~impl',
    action: tgp.wrapWithGroup('probeTest.label1~impl'),
    expectedPathAfter: 'probeTest.label1~impl~controls~0'
  })
})

component('completionTest.dslTest.createProp', {
  impl: tgp.completionActionTest({
    compText: `component('x', {
  impl: state(__)
})`,
    completionToActivate: 'capital',
    expectedEdit: () => ({
        range: {start: {line: 2, col: 14}, end: {line: 2, col: 14}},
        newText: 'TBD()'
      }),
    expectedCursorPos: '2,14',
    dsl: 'location'
  })
})

component('completionTest.dslTest.nameOverride', {
  impl: tgp.completionOptionsTest({
    compText: `component('x', {
  impl: state(pipeline(__))
})`,
    expectedSelections: ['checkNameOverride'],
    dsl: 'location'
  })
})

component('completionTest.dslTest.top', {
  impl: tgp.completionOptionsTest({
    compText: `component('x', {
  impl: state(__)
})`,
    expectedSelections: ['capital'],
    dsl: 'location'
  })
})