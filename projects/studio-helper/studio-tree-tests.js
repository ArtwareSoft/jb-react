jb.component('jb-editor-test.cmp1', {
  impl :{$: 'list', items: ['a.1', 'b.2'] }, 
})

jb.component('jb-editor-test.cmp2', {
  impl: {$: 'itemlist-with-groups', 
	title: 'itemlist', 
	items :{$: 'list', items: ['a.1', 'b.2'] }, 
	controls: [
		{$: 'label', 
		title: '%%', 
		style :{$: 'label.span' },
		}
	]
  }
})

jb.component('jb-editor-test.cmp3', {
  impl :{$: 'list', items: [] }, 
})

jb.component('jb-editor-test.cmp4', {
  impl :{$: 'list', items: 'hello' }, 
})

jb.component('jb-editor-test.cmp5', {
  impl :{$: 'label', title: {$pipeline: ['a','b'] }}, 
})

jb.component('jb-editor-test.actions-sugar-example1', {
  impl: {$: 'button', title : 'hello', action: [ {$: 'goto-url', url: 'google' }] } 
})

jb.component('jb-editor-test.actions-sugar-example2', {
  impl: {$: 'button', title : 'hello', action: {$runActions: [ {$: 'goto-url', url: 'google' }] }} 
})



jb.component('jb-editor-test.extra-elem-in-list', {
	impl :{$: 'jb-editor-children-test',
		path: 'jb-editor-test.cmp1~impl~items', 
		childrenType: 'jb-editor',
		expectedResult :{ $and: [{$: 'contains', text: 'items[2]' }, { $not: { $contains: 'undefined'}}]}
	}
})

jb.component('jb-editor-test.extra-elem-in-list-bug', {
	impl :{$: 'jb-editor-children-test',
		path: 'jb-editor-test.cmp2~impl~items~items', 
		childrenType: 'jb-editor',
		expectedResult :{ $and: [{$: 'contains', text: 'items[2]' }, { $not: { $contains: 'undefined'}}]}
	}
})

jb.component('jb-editor-test.empty-pipeline-bug', {
	impl :{$: 'jb-editor-children-test',
		path: 'jb-editor-test.cmp3~impl~items~0', 
		childrenType: 'jb-editor',
		expectedResult :{ $not: { $: 'contains', text: 'pipeline (0)' }}
	}
})

// jb.component('jb-editor-test.single-string-bug', {
// 	impl :{$: 'jb-editor-children-test',
// 		path: 'jb-editor-test.cmp4~impl~items', 
// 		childrenType: 'jb-editor',
// 		expectedResult :{ $: 'contains', text: 'hello' }
// 	}
// })

jb.component('jb-editor-test.$pipline', {
	impl :{$: 'jb-editor-children-test',
		path: 'jb-editor-test.cmp5~impl~title', 
		childrenType: 'jb-editor',
		expectedResult :{ $and: [
			{$: 'contains', text: ['[0]','[1]'] }, 
			{$: 'not-contains', text : '$pipeline'},
			{$: 'not-contains', text : 'items'},
		]}
	}
})

jb.component('jb-editor-test.actions-sugar1', {
	impl :{$: 'jb-editor-children-test',
		path: 'jb-editor-test.actions-sugar-example1~impl~action', 
		childrenType: 'jb-editor',
		expectedResult :{ $and: [{$: 'contains', text: ['action[0]','action[1]'] }, { $not: { $contains: 'actions'}}]}
	}
})

jb.component('jb-editor-test.actions-sugar2a', {
	impl :{$: 'jb-editor-children-test',
		path: 'jb-editor-test.actions-sugar-example2~impl~action', 
		childrenType: 'jb-editor',
		expectedResult :{ $contains: '$runActions'}
	}
})

jb.component('jb-editor-test.actions-sugar2b', {
	impl :{$: 'jb-editor-children-test',
		path: 'jb-editor-test.actions-sugar-example2~impl~action~$runActions', 
		childrenType: 'jb-editor',
		expectedResult :{ $and: [{$: 'contains', text: ['runActions[0]','runActions[1]'] }, { $not: { $contains: 'actions'}}]}
	}
})

