
jb.component('studio-data-test.list-for-tests', {
	 impl :{$: 'list' }
})

jb.component('studio-data-test.categories-of-type', {
	 impl :{$: 'data-test',
		calculate: {$pipeline: [
				{$: 'studio.categories-of-type', type: 'control'},
				'%name%',
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
	 impl :{$: 'data-test',
	 	runBefore : ctx =>
	 		jb.studio.moveFixDestination('test.move-in-tree~impl~controls~1', 'test.move-in-tree~impl~controls~3~controls'),
		calculate :{$pipeline: [
			{$list: [
				{$: 'studio.val' , path: 'test.move-in-tree~impl~controls' },
				{$: 'studio.val' , path: 'test.move-in-tree~impl~controls~2~controls' },
			] },
			, '%title%', {$: 'join'} ]},
		expectedResult : ctx =>
			ctx.data == 'a,c,b'
	},
})

jb.component('studio-data-test.moveFixDestination-empty-group', {
	 impl :{$: 'data-test',
	 	runBefore : ctx =>
	 		jb.studio.moveFixDestination('test.move-in-tree~impl~controls~1', 'test.move-in-tree~impl~controls~4~controls'),
		calculate :{$pipeline: [
			{$list: [
				{$: 'studio.val' , path: 'test.move-in-tree~impl~controls' },
				{$: 'studio.val' , path: 'test.move-in-tree~impl~controls~3~controls' },
			] },
			, '%title%', {$: 'join'} ]},
		expectedResult : ctx =>
			ctx.data == 'a,c,b'
	},
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
