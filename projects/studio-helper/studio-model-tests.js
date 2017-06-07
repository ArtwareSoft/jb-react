
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
  impl :{$: 'itemlist', 
    items: '%$people%', 
    controls :{$: 'group', 
      style :{$: 'layout.horizontal', spacing: 3 }, 
      controls: [
        {$: 'label', title: '%name%' }, 
        {$: 'label', title: '%age%' }
      ]
    }
  }
})

jb.component('studio.jb-editor-move', {
	 impl :{$: 'data-test', 
	 	runBefore : ctx =>
	 		jb.studio.moveInTree('test.move-in-tree~impl',
	 				'test.move-in-tree~impl~controls~controls~0',0),
		calculate :{$: 'studio.val' , path: 'test.move-in-tree~impl~controls' },
		expectedResult : ctx => 
			ctx.data.length == 2
	},
})
