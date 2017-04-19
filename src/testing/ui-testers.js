jb.component('ui-test', {
	type: 'test',
	params: [
		{ id: 'control', type: 'control', dynamic: true },
		{ id: 'runBefore', type: 'action', dynamic: true },
		{ id: 'expectedResult', type: 'boolean', dynamic: true },
		{ id: 'cleanUp', type: 'action', dynamic: true },
	],
	impl: function(context,control,runBefore,expectedResult,cleanUp) {
		return Promise.resolve(runBefore())
			.then(_ => {
				var elem = document.createElement('div');
				jb.ui.render(jb.ui.h(control()), elem);
				return elem.outerHTML;
			}).then(v=>
				Array.isArray(v) ? jb_synchArray(v) : v)
			.then(value=>
				!! expectedResult(new jb.jbCtx(context,{ data: value })))
			.then(result =>
					Promise.resolve(cleanUp()).then(_=>result) )
			.then(result =>
					({ id: context.vars.testID, success: result }))
	}
})
