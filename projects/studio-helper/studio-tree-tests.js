jb.component('studio-tree-test.cmp1', {
  impl :{$: 'list', items: ['a.1', 'b.2'] }, 
})

jb.component('studio-tree-test.cmp2', {
  impl: {$: 'itemlist-with-groups', 
  title: 'itemlist', 
  items :{$: 'list', items: ['a.1', 'b.2'] }, 
  controls: [
    {$: 'label', 
      title: '%%', 
      style :{$: 'label.span' },
    }
  ], 
}})

jb.component('studio-tree-test.cmp3', {
  impl :{$: 'list', items: [] }, 
})

jb.component('studio-tree-test.cmp4', {
  impl :{$: 'list', items: 'hello' }, 
})

jb.component('studio-tree-test.cmp5', {
  impl :{$: 'label', title: {$pipeline: ['a','b'] }}, 
})


jb.component('studio-tree-test.actions-sugar-example1', {
  impl: {$: 'button', title : 'hello', action: [ {$: 'goto-url', url: 'google' }] } 
})

jb.component('studio-tree-test.actions-sugar-example2', {
  impl: {$: 'button', title : 'hello', action: {$runActions: [ {$: 'goto-url', url: 'google' }] }} 
})



jb.component('studio-tree-test.extra-elem-in-list', {
	impl :{$: 'studio-tree-children-test',
		path: 'studio-tree-test.cmp1~impl~items', 
		childrenType: 'jb-editor',
		expectedResult :{ $and: [{$: 'contains', text: 'items[2]' }, { $not: { $contains: 'undefined'}}]}
	}
})

jb.component('studio-tree-test.extra-elem-in-list-bug', {
	impl :{$: 'studio-tree-children-test',
		path: 'studio-tree-test.cmp2~impl~items~items', 
		childrenType: 'jb-editor',
		expectedResult :{ $and: [{$: 'contains', text: 'items[2]' }, { $not: { $contains: 'undefined'}}]}
	}
})

jb.component('studio-tree-test.empty-pipeline-bug', {
	impl :{$: 'studio-tree-children-test',
		path: 'studio-tree-test.cmp3~impl~items~0', 
		childrenType: 'jb-editor',
		expectedResult :{ $not: { $: 'contains', text: 'pipeline (0)' }}
	}
})

// jb.component('studio-tree-test.single-string-bug', {
// 	impl :{$: 'studio-tree-children-test',
// 		path: 'studio-tree-test.cmp4~impl~items', 
// 		childrenType: 'jb-editor',
// 		expectedResult :{ $: 'contains', text: 'hello' }
// 	}
// })

jb.component('studio-tree-test.$pipline', {
	impl :{$: 'studio-tree-children-test',
		path: 'studio-tree-test.cmp5~impl~title', 
		childrenType: 'jb-editor',
		expectedResult :{ $and: [{$: 'contains', text: ['$pipeline[0]','$pipeline[1]'] }, { $not: { $contains: 'pipeline (2)'}}]}
	}
})

jb.component('studio-tree-test.actions-sugar1', {
	impl :{$: 'studio-tree-children-test',
		path: 'studio-tree-test.actions-sugar-example1~impl~action', 
		childrenType: 'jb-editor',
		expectedResult :{ $and: [{$: 'contains', text: ['action[0]','action[1]'] }, { $not: { $contains: 'actions'}}]}
	}
})

jb.component('studio-tree-test.actions-sugar2a', {
	impl :{$: 'studio-tree-children-test',
		path: 'studio-tree-test.actions-sugar-example2~impl~action', 
		childrenType: 'jb-editor',
		expectedResult :{ $contains: '$runActions'}
	}
})

jb.component('studio-tree-test.actions-sugar2b', {
	impl :{$: 'studio-tree-children-test',
		path: 'studio-tree-test.actions-sugar-example2~impl~action~$runActions', 
		childrenType: 'jb-editor',
		expectedResult :{ $and: [{$: 'contains', text: ['runActions[0]','runActions[1]'] }, { $not: { $contains: 'actions'}}]}
	}
})

