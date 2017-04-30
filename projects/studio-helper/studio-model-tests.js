
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

