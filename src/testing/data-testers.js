jb.component('data-test', {
	type: 'test',
	params: [
		{ id: 'calculate', dynamic: true },
		{ id: 'runBefore', type: 'action', dynamic: true },
		{ id: 'expectedResult', type: 'boolean', dynamic: true },
		{ id: 'cleanUp', type: 'action', dynamic: true },
	],
	impl: function(context,calculate,runBefore,expectedResult,cleanUp) {
		return Promise.resolve(runBefore())
			.then(_ => 
				calculate())
			.then(v=>
				Array.isArray(v) ? jb_synchArray(v) : v)
			.then(value=>
				!! expectedResult(new jb.jbCtx(context,{ data: value })))
			.then(result =>
					Promise.resolve(cleanUp()).then(_=>result) )
			.then(result =>
					({ id: context.vars.testID, success: result }))
	}
})

jb.testers.runDataTests = function() {
	jb.entries(jb.comps)
		.filter(e=>e[0].impl.$ == 'data-test' )
		.map(e=>)
}