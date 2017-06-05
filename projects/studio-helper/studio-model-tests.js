
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

jb.component('studio.jb-editor-move', {
	 impl :{$: 'data-test', 
	 	runBefore : ctx =>
	 		jb.studio.moveInArray('test.simple-pipeline~impl~$pipeline',
	 				'test.simple-pipeline~impl~$pipeline~0',1),
		calculate :{$pipeline: [
			{$: 'studio.val' , path: 'test.simple-pipeline~impl~$pipeline' },
			{$join: ','}
		]},
		expectedResult : '%% == "y,x,z"'
	},
})
