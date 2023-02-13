
jb.component('completionTest.param', {
  impl: tgp.completionOptionsTest({
    compText:`jb.component('x', {
  impl: uiTest(__{control: text(__{__text: 'hello world',__ title: ''__}__),__ expectedResult: contains('hello world')__})
})`,
    expectedSelections:['runBefore','style','style','style','style','style','runBefore','runBefore']
 })
})

jb.component('completionTest.pipeline', {
  impl: tgp.completionOptionsTest({
    compText: "jb.component('x', {\n  impl: uiTest(text(pipeline(__)))\n})",
    expectedSelections:['split']
 })
})

jb.component('completionTest.pipeline2', {
  impl: tgp.completionOptionsTest({
    compText: "jb.component('x', {\n  impl: uiTest(text(pipeline(__'')))\n})",
    expectedSelections:['split']
 })
})

jb.component('completionTest.pt', {
  impl: tgp.completionOptionsTest({
    compText:`jb.component('x', {
  impl: uiTest({
    control: group({
      controls: [__
__        text('hello world in the largest'),__
__        text('2')__
__      ]
    }),
    expectedResult: __contains(['hello world', '2'])
  })
})`,
    expectedSelections:['button','button','button','button','button','button','not']
 })
})

jb.component('completionTest.createPipelineFromComp', {
  impl: tgp.completionActionTest({
    compText: "jb.component('x', {\n  impl: uiTest(text(__split()))\n})",
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 20}, end: {line: 1, col: 26}},
        newText: 'pipeline(split()'
      }),
    expectedCursorPos: '1,36'
 })
})

jb.component('completionTest.paramsAndProfiles', {
  impl: tgp.completionOptionsTest({
    compText:"jb.component('x', {\n  impl: uiTest(text(__''))\n})",
    expectedSelections:['pipeline']
 })
})

jb.component('completionTest.paramsAndProfiles2', {
  impl: tgp.completionOptionsTest({
    compText:"jb.component('x', {\n  impl: uiTest(text(__''))\n})",
    expectedSelections:['style']
 })
})

jb.component('completionTest.createPipelineFromString', {
  impl: tgp.completionActionTest({
    compText: "jb.component('x', {\n  impl: uiTest(text(__'aa'))\n})",
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 20}, end: {line: 1, col: 24}},
        newText: "pipeline('aa')"
      }),
    expectedCursorPos: '1,33'
 })
})

jb.component('completionTest.createPipelineFromEmptyString', {
  impl: tgp.completionActionTest({
    compText: "jb.component('x', {\n  impl: uiTest(text({text: 'hello world', title: __''}))\n})",
    completionToActivate: 'pipeline',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 20}, end: {line: 1, col: 52}},
        newText: "'hello world', pipeline('')"
      }),
    expectedCursorPos: '1,46'
 })
})

jb.component('completionTest.splitInsidePipeline', {
  impl: tgp.completionActionTest({
    compText: `jb.component('x', {
  impl: uiTest(text(pipeline(__)))
})`,
    completionToActivate: 'split',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 29}, end: {line: 1, col: 29}},
        newText: 'split()'
      }),
    expectedCursorPos: '1,36'
  })
})

jb.component('completionTest.splitPart', {
  impl: tgp.completionOptionsTest(`jb.component('x', {
  impl: uiTest(text(pipeline(split(__))))
})`, ['part'])
})

jb.component('completionTest.dynamicFormat', {
  impl: tgp.completionActionTest({
    compText: "jb.component('x', {\n  impl: uiTest(__{control: text('my text'), expectedResult: contains('hello world')})\n})",
    completionToActivate: 'userInput',
    expectedEdit: () => ({
  range: {start: {line: 1, col: 16}, end: {line: 1, col: 81}},
  newText: `
    control: text('my text'),
    userInput: TBD(),
    expectedResult: contains('hello world')
  `}),
  expectedCursorPos: '3,15'
 })
})

// jb.component('completionTest.wrapWithGroup', {
//   impl: tgp.completionActionTest({
//     compText: "jb.component('x', {\n  impl: uiTest(__text())\n})",
//     completionToActivate: 'group',
//     expectedEdit: () => ({
//         range: {start: {line: 1, col: 15}, end: {line: 1, col: 20}},
//         newText: 'group({controls: [text()]}'
//       }),
//     expectedCursorPos: '2,4'
//  })
// })

jb.component('completionTest.wrapWithGroup', {
  impl: tgp.completionActionTest({
    compText: "jb.component('x', {\n  impl: uiTest(__text())\n})",
    completionToActivate: 'group',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 15}, end: {line: 1, col: 20}},
        newText: `group({controls: [text()]}`}),
    expectedCursorPos: '1,40'
 })
})

jb.component('completionTest.wrapWithArray', {
  impl: tgp.completionActionTest({
    compText: "jb.component('x', {\n  impl: uiTest({expectedResult: contains(__'')})\n})",
    completionToActivate: 'wrap with array',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 41}, end: {line: 1, col: 43}},
        newText: "['']"
      }),
    expectedCursorPos: '1,44'
 })
})

jb.component('uiTest.editableText.emptyData', {
  impl: uiTest(button({title: '', features: []}))
})

jb.component('completionTest.buttonFeature', {
  impl: tgp.completionOptionsTest(
    `jb.component('x', {
  impl: uiTest(button({title: '', features: [__]}))
})`,
    ['method', 'button.ctrlAction']
  )
})

jb.component('completionTest.singleParamAsArray.rx', {
  impl: tgp.completionOptionsTest(`jb.component('x', {
  impl: dataTest(rx.pipe(__))
})`, ['source.data'])
})

jb.component('completionTest.singleParamAsArray.data', {
  impl: tgp.completionOptionsTest(`jb.component('x', {
  impl: dataTest(pipeline(__))
})`, ['split'])
})

jb.component('completionTest.actionReplaceTBD', {
  impl: tgp.completionActionTest({
    compText: `jb.component('x', {
  impl: uiTest(button('x', remote.action(__TBD())))
})`,
    completionToActivate: 'move',
    expectedEdit: () => ({
        range: {start: {line: 1, col: 41}, end: {line: 1, col: 44}},
        newText: 'move'
      }),
    expectedCursorPos: '1,46'
  })
})
