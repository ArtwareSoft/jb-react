(function() {
const { dataTest, pipeline, pipe, join, list, writeValue, splice, contains, equals, and, not, assign, prop, assignWithIndex, obj, $if, count, data_switch, data_case, runActions} = jb.macros
const { studio_val } = jb.macros

jb.component('studio-data-test.list-for-tests', {
	 impl :{$: 'list' }
})

jb.component('studio-data-test.categories-of-type', {
	 impl :{$: 'data-test',
		calculate: {$pipeline: [
				{$: 'studio.categories-of-type', type: 'control'},
				'%code%',
				{$: 'join'}
			]},
		expectedResult :{$: 'contains', text: ['control'] }
	},
})

jb.component('studio-data-test.is-of-type-array', {
	 impl :{$: 'data-test',
		calculate :{$: 'studio.is-of-type' , type: 'data', path: 'studio-data-test.list-for-tests~items~0' },
		expectedResult : '%%'
	},
})

jb.component('studio-data-test.param-type-array', {
	 impl :{$: 'data-test',
		calculate :{$: 'studio.param-type' , path: 'studio-data-test.list-for-tests~items~0' },
		expectedResult : '%% == "data"'
	},
})

jb.component('test.simple-pipeline', {
	type: 'data',
	impl :{$pipeline: ['x' , 'y', 'z']}
})

jb.component('test.move-in-tree', {
  type: 'control',
  impl :{$: 'group',
      controls: [
        {$: 'label', title: 'a' },
        {$: 'label', title: 'b' },
		{$: 'label', title: 'c' },
		{$: 'group' },
		{$: 'group', controls: [] },
	]
  }
})

jb.component('studio-data-test.jb-editor-move', {
	 impl :{$: 'data-test',
	 	runBefore : ctx =>
	 		jb.move(jb.studio.refOfPath('test.move-in-tree~impl~controls~1'), jb.studio.refOfPath('test.move-in-tree~impl~controls~0')),
		calculate :{$pipeline: [{$: 'studio.val' , path: 'test.move-in-tree~impl~controls' }, '%title%', {$: 'join'} ]},
		expectedResult : ctx =>
			ctx.data == 'b,a,c'
	},
})

jb.component('studio-data-test.moveFixDestination-null-group', {
	 impl: dataTest({
	 	runBefore : ctx =>
	 		jb.studio.moveFixDestination('test.move-in-tree~impl~controls~1', 'test.move-in-tree~impl~controls~3~controls'),
		calculate: pipeline(list(
				studio_val('test.move-in-tree~impl~controls'),
				studio_val('test.move-in-tree~impl~controls~2~controls'),
			),
			'%title%', join()
		),
		expectedResult : equals('a,c,b')
	})
})

jb.component('studio-data-test.moveFixDestination-empty-group', {
	impl: dataTest({
		runBefore : ctx =>
	 		jb.studio.moveFixDestination('test.move-in-tree~impl~controls~1', 'test.move-in-tree~impl~controls~4~controls'),
		calculate: pipeline(list(
				studio_val('test.move-in-tree~impl~controls'),
				studio_val('test.move-in-tree~impl~controls~3~controls'),
			),
			'%title%', join()
		),
		expectedResult : equals('a,c,b')
	})
})

jb.component('studio-data-test.jb-editor-move', {
	impl: dataTest({
		runBefore : ctx =>
	 		jb.move(jb.studio.refOfPath('test.move-in-tree~impl~controls~1'), jb.studio.refOfPath('test.move-in-tree~impl~controls~0')),
		calculate: pipeline(studio_val('test.move-in-tree~impl~controls'), '%title%', join()),
		expectedResult: equals('b,a,c')
	})
})

jb.component('test.set-sugar-comp-simple', {
	impl :{$: 'label' }
})

jb.component('test.set-sugar-comp-wrap', {
	impl :{$: 'label', title: 'a'}
})

jb.component('test.set-sugar-comp-override1', {
	impl :{$: 'label', title: {$: 'pipeline', items: ['a','b']} }
})

jb.component('test.set-sugar-comp-override2', {
	impl :{$: 'label', title: {$list: ['a','b']} }
})

jb.component('studio-data-test.set-sugar-comp-simple', {
	 impl :{$: 'data-test',
	 	runBefore : {$: 'studio.set-comp', path: 'test.set-sugar-comp-simple~impl~title', comp: 'pipeline' },
		calculate :{$: 'studio.val' , path: 'test.set-sugar-comp-simple~impl~title~$pipeline' },
		expectedResult : ctx =>
			JSON.stringify(ctx.data) == '[]'
	},
})

jb.component('studio-data-test.set-sugar-comp-wrap', {
	 impl :{$: 'data-test',
	 	runBefore : {$: 'studio.set-comp', path: 'test.set-sugar-comp-wrap~impl~title', comp: 'pipeline' },
		calculate :{$: 'studio.val' , path: 'test.set-sugar-comp-wrap~impl~title~$pipeline' },
		expectedResult : ctx =>
			JSON.stringify(ctx.data) == '["a"]'
	},
})

jb.component('studio-data-test.set-sugar-comp-override1', {
	 impl :{$: 'data-test',
	 	runBefore : {$: 'studio.set-comp', path: 'test.set-sugar-comp-override1~impl~title', comp: 'pipeline' },
		calculate :{$: 'studio.val' , path: 'test.set-sugar-comp-override1~impl~title~$pipeline' },
		expectedResult : ctx =>
			JSON.stringify(ctx.data) == '["a","b"]'
	},
})

jb.component('studio-data-test.set-sugar-comp-override2', {
	 impl :{$: 'data-test',
	 	runBefore : {$: 'studio.set-comp', path: 'test.set-sugar-comp-override2~impl~title', comp: 'pipeline' },
		calculate :{$: 'studio.val' , path: 'test.set-sugar-comp-override2~impl~title~$pipeline' },
		expectedResult : ctx =>
			JSON.stringify(ctx.data) == '["a","b"]'
	},
})

jb.component('test.profile-as-text-example', {
	impl :{$: 'label', title: 'a'}
})

jb.component('studio-data-test.studio.profile-as-text.change-diff-only', {
	impl :{$: 'data-test',
		runBefore : {$: 'write-value', 
		to :{$: 'studio.profile-as-text', path: 'test.profile-as-text-example~impl' }, 
		value: "{$: 'label', title: 'b'}"
	},
 	calculate :{$: 'studio.val' , path: 'test.profile-as-text-example~impl~title' },
	expectedResult : ctx => ctx.data == 'b',
	expectedCounters: ctx => ({ profileAsTextDiffActivated: 1 })
 },
})

// jb.component('studio-data-test.components-cross-ref', {
// 	 impl :{$: 'data-test',
// 		calculate :{$: 'studio.components-cross-ref' },
// 		expectedResult : ctx => ctx.data.length > 500
// 	},
// })

jb.component('test.referee', {
  impl: ctx => ''
})

jb.component('test.referer1', {
  impl: {$pipline: [{$: 'test.referee'}]}
})

jb.component('test.referer2', {
  impl: {$pipline: [{$: 'test.referee'},{$: 'test.referee'} ]}
})

jb.component('studio-ui-test.goto-references-button', {
	 impl :{$: 'ui-test',
	 	control: {$: 'studio.goto-references-button', path: 'test.referee' },
		expectedResult :{$: 'contains', text: '3 references'}
	},
})

jb.component('studio.completion-prop-of-pt', {
	impl :{$: 'data-test',
	calculate : ctx=> jb.studio.completion.hint("{$: 'group', controls :{$: 'itemlist', '{$$}' "),
	expectedResult : ctx =>
		JSON.stringify(ctx.data || '').indexOf('items') != -1
	},
})

jb.component('studio.completion-pt-of-type', {
	impl :{$: 'data-test',
	calculate : ctx=> jb.studio.completion.hint("{$: 'group', controls:{ "),
	expectedResult : ctx =>
		JSON.stringify(ctx.data || '').indexOf('"displayText":"itemlist"') != -1
	},
})

jb.component('studio.completion-pt-of-type-in-array', {
	impl :{$: 'data-test',
	calculate : ctx=> jb.studio.completion.hint("{$: 'group', controls :[{$: 'label' }, {$:'"),
	expectedResult : ctx =>
		JSON.stringify(ctx.data || '').indexOf('"displayText":"itemlist"') != -1
	},
})


jb.component('studio-data-test.pathOfText-inArray', {
	impl :{$: 'data-test',
		calculate : ctx => jb.studio.completion.pathOfText("{$: 'group', \n\tcontrols: [ {$: 'label', text: 'aa' }, {$: 'label', text: '"),
		expectedResult : ctx => ctx.data.join('~') == "controls~1~text"
 },
})

jb.component('studio-data-test.pathOfText-prop', {
	impl :{$: 'data-test',
		calculate : ctx => jb.studio.completion.pathOfText("{$: 'group', text :{$: 'split' , part: '"),
		expectedResult : ctx => ctx.data.join('~') == "text~part"
 },
})

jb.component('studio-data-test.pathOfText-prop-top', {
	impl :{$: 'data-test',
		calculate : ctx => jb.studio.completion.pathOfText("{ $:'group', style :{$: 'layo"),
		expectedResult : ctx => ctx.data.join('~') == "style"
 },
})


jb.component('studio-data-test.pathOfText-prop-after-array', {
	impl :{$: 'data-test',
		calculate : ctx => jb.studio.completion.pathOfText("{ $:'group', controls :[{$: '' }, {$:'label'}], style :{$: 'layo"),
		expectedResult : ctx => ctx.data.join('~') == "style"
 },
})

})()