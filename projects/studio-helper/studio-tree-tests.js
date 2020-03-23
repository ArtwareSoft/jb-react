jb.component('jbEditorTest.cmp1', {
  impl: list(
    'a.1',
    'b.2'
  )
})

jb.component('jbEditorTest.cmp3', {
  impl: list(
    
  )
})

jb.component('jbEditorTest.cmp4', {
  impl: list(
    'hello'
  )
})

jb.component('jbEditorTest.cmp5JsonFormat', {
  impl: text({
    text: pipeline('a', 'b')
  })
})

jb.component('jbEditorTest.actionsSugarExample1', {
  impl: button({
    title: 'hello',
    action: [gotoUrl('google')]
  })
})

jb.component('jbEditorTest.actionsSugarExample2JsonFormat', {
  impl: button({
    title: 'hello',
    action: runActions({'$': 'goto-url', url: 'google'})
  })
})

jb.component('jbEditorTest.extraElemInList', {
  impl: jbEditorChildrenTest({
    path: 'jbEditorTest.cmp1~impl~items',
    childrenType: 'jb-editor',
    expectedResult: and(contains('items[2]'), not(contains('undefined')))
  })
})

jb.component('jbEditorTest.emptyPipelineBug', {
  impl: jbEditorChildrenTest({
    path: 'jbEditorTest.cmp3~impl~items~0',
    childrenType: 'jb-editor',
    expectedResult: not(contains('pipeline (0)'))
  })
})

// jb.component('jb-editor-test.single-string-bug', {
// 	impl :{$: 'jb-editor-children-test',
// 		path: 'jbEditorTest.cmp4~impl~items',
// 		childrenType: 'jb-editor',
// 		expectedResult :{ $: 'contains', text: 'hello' }
// 	}
// })

// jb.component('jbEditorTest.$pipline', {
//   impl: jbEditorChildrenTest({
//     path: 'jbEditorTest.cmp5JsonFormat~impl~text',
//     childrenType: 'jb-editor',
//     expectedResult: and(contains(['[0]', '[1]']), notContains('$pipeline'), notContains('items'))
//   })
// })

jb.component('jbEditorTest.actionsSugar1', {
  impl: jbEditorChildrenTest({
    path: 'jbEditorTest.actionsSugarExample1~impl~action',
    childrenType: 'jb-editor',
    expectedResult: and(contains(['action[0]', 'action[1]']), not(contains('actions')))
  })
})

// jb.component('jbEditorTest.actionsSugar2a', {
//   impl: jbEditorChildrenTest({
//     path: 'jbEditorTest.actionsSugarExample2JsonFormat~impl~action',
//     childrenType: 'jb-editor',
//     expectedResult: contains('$runActions')
//   })
// })

// jb.component('jbEditorTest.actionsSugar2b', {
//   impl: jbEditorChildrenTest({
//     path: 'jbEditorTest.actionsSugarExample2JsonFormat~impl~action~$runActions',
//     childrenType: 'jb-editor',
//     expectedResult: and(contains(['runActions[0]', 'runActions[1]']), not(contains('actions')))
//   })
// })

