jb.component('jb-editor-test.cmp1', { /* jbEditorTest.cmp1 */
  impl: list(
    'a.1',
    'b.2'
  )
})

jb.component('jb-editor-test.cmp3', { /* jbEditorTest.cmp3 */
  impl: list(
    
  )
})

jb.component('jb-editor-test.cmp4', { /* jbEditorTest.cmp4 */
  impl: list(
    'hello'
  )
})

jb.component('jb-editor-test.cmp5-json-format', { /* jbEditorTest.cmp5 */
  impl: text({
    text: {$pipeline: ['a','b'] }
  })
})

jb.component('jb-editor-test.actions-sugar-example1', { /* jbEditorTest.actionsSugarExample1 */
  impl: button({
    title: 'hello',
    action: [gotoUrl('google')]
  })
})

jb.component('jb-editor-test.actions-sugar-example2-json-format', { /* jbEditorTest.actionsSugarExample2 */
  impl: button({
    title: 'hello',
    action: {$runActions: [ {$: 'goto-url', url: 'google' }] }
  })
})

jb.component('jb-editor-test.extra-elem-in-list', { /* jbEditorTest.extraElemInList */
  impl: jbEditorChildrenTest({
    path: 'jb-editor-test.cmp1~impl~items',
    childrenType: 'jb-editor',
    expectedResult: and(contains('items[2]'), not(contains('undefined')))
  })
})

jb.component('jb-editor-test.empty-pipeline-bug', { /* jbEditorTest.emptyPipelineBug */
  impl: jbEditorChildrenTest({
    path: 'jb-editor-test.cmp3~impl~items~0',
    childrenType: 'jb-editor',
    expectedResult: not(contains('pipeline (0)'))
  })
})

// jb.component('jb-editor-test.single-string-bug', {
// 	impl :{$: 'jb-editor-children-test',
// 		path: 'jb-editor-test.cmp4~impl~items',
// 		childrenType: 'jb-editor',
// 		expectedResult :{ $: 'contains', text: 'hello' }
// 	}
// })

jb.component('jb-editor-test.$pipline', { /* jbEditorTest.$pipline */
  impl: jbEditorChildrenTest({
    path: 'jb-editor-test.cmp5-json-format~impl~text',
    childrenType: 'jb-editor',
    expectedResult: and(contains(['[0]', '[1]']), notContains('$pipeline'), notContains('items'))
  })
})

jb.component('jb-editor-test.actions-sugar1', { /* jbEditorTest.actionsSugar1 */
  impl: jbEditorChildrenTest({
    path: 'jb-editor-test.actions-sugar-example1~impl~action',
    childrenType: 'jb-editor',
    expectedResult: and(contains(['action[0]', 'action[1]']), not(contains('actions')))
  })
})

jb.component('jb-editor-test.actions-sugar2a', { /* jbEditorTest.actionsSugar2a */
  impl: jbEditorChildrenTest({
    path: 'jb-editor-test.actions-sugar-example2-json-format~impl~action',
    childrenType: 'jb-editor',
    expectedResult: contains('$runActions')
  })
})

jb.component('jb-editor-test.actions-sugar2b', { /* jbEditorTest.actionsSugar2b */
  impl: jbEditorChildrenTest({
    path: 'jb-editor-test.actions-sugar-example2-json-format~impl~action~$runActions',
    childrenType: 'jb-editor',
    expectedResult: and(contains(['runActions[0]', 'runActions[1]']), not(contains('actions')))
  })
})

