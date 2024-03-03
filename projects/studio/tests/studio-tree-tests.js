// var {jbEditorChildrenTest} = jb.macro

component('jbEditorTest.cmp1', {
  impl: list('a.1','b.2')
})

component('jbEditorTest.cmp3', {
  impl: list()
})

component('jbEditorTest.cmp4', {
  impl: list('hello')
})

component('jbEditorTest.cmp5JsonFormat', {
  impl: text(pipeline('a','b'))
})

// jb.component('jbEditorTest.actionsSugarExample1', {
//   impl: button({
//     title: 'hello',
//     action: [gotoUrl('google')]
//   })
// })

// jb.component('jbEditorTest.actionsSugarExample2JsonFormat', {
//   impl: button('hello', runActions(gotoUrl('google')))
// })

component('jbEditorTest.extraElemInList', {
  impl: jbEditorChildrenTest('jbEditorTest.cmp1~impl~items', 'jb-editor', {
    expectedResult: and(contains('items[2]'), not(contains('undefined')))
  })
})

component('jbEditorTest.emptyPipelineBug', {
  impl: jbEditorChildrenTest('jbEditorTest.cmp3~impl~items~0', 'jb-editor', {
    expectedResult: not(contains('pipeline (0)'))
  })
})


