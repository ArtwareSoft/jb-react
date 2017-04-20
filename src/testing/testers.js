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
				try {
					var elem = document.createElement('div');
					var ctrl = jb.ui.h(control());
					var cmp = jb.ui.render(ctrl, elem)._component;
					console.log(cmp);
					return Promise.resolve(cmp.delayed).then(_=>
						elem)
				} catch (e) {
					return '';
				}
			})
			.then(result =>
					Promise.resolve(cleanUp()).then(_=>result) )
			.then(elem=>
				({ id: context.vars.testID, 
					success: !! expectedResult(new jb.jbCtx(context,{ data: elem.outerHTML })),
					elem: elem
				}))
	}
})


var jb_success_counter = 0;
var jb_fail_counter = 0;

jb.testers.runTests = function(testType,show) {
	var tests = jb.entries(jb.comps)
		.filter(e=>typeof e[1].impl == 'object' && e[1].impl.$ == testType);

	document.write(`<div><span id="success-counter"></span><span id="fail-counter"></span><span> total ${tests.length}</span>`);
	

	jb.rx.Observable.from(tests).concatMap(e=> 
			Promise.resolve(new jb.jbCtx().setVars({testID: e[0]}).run({$:e[0]})))
		.subscribe(res=> {
			if (res.success)
				jb_success_counter++;
			else
				jb_fail_counter++;
			var elem = `<div style="color:${res.success ? 'green' : 'red'}">${res.id}</div>`

			document.getElementById('success-counter').innerHTML = 'success ' + jb_success_counter;
			document.getElementById('fail-counter').innerHTML = ' failure ' + jb_fail_counter;
			document.body.innerHTML += elem;
			if (show)
				document.body.appendChild(res.elem);
		})
}