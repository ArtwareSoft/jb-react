// var {jbEditorChildrenTest} = jb.macro

component('jbEditorTest.cmp1', {
  impl: list(
    'a.1',
    'b.2'
  )
})

component('jbEditorTest.cmp3', {
  impl: list(
    
  )
})

component('jbEditorTest.cmp4', {
  impl: list(
    'hello'
  )
})

component('jbEditorTest.cmp5JsonFormat', {
  impl: text({
    text: pipeline('a', 'b')
  })
})

// jb.component('jbEditorTest.actionsSugarExample1', {
//   impl: button({
//     title: 'hello',
//     action: [winUtils.gotoUrl('google')]
//   })
// })

// jb.component('jbEditorTest.actionsSugarExample2JsonFormat', {
//   impl: button('hello', runActions(winUtils.gotoUrl('google')))
// })

component('jbEditorTest.extraElemInList', {
  impl: jbEditorChildrenTest({
    path: 'jbEditorTest.cmp1~impl~items',
    childrenType: 'jb-editor',
    expectedResult: and(contains('items[2]'), not(contains('undefined')))
  })
})

component('jbEditorTest.emptyPipelineBug', {
  impl: jbEditorChildrenTest({
    path: 'jbEditorTest.cmp3~impl~items~0',
    childrenType: 'jb-editor',
    expectedResult: not(contains('pipeline (0)'))
  })
})


