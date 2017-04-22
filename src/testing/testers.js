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
		{ id: 'action', type: 'action', dynamic: true },
		{ id: 'expectedResult', type: 'boolean', dynamic: true },
		{ id: 'cleanUp', type: 'action', dynamic: true },
	],
	impl: function(context,control,runBefore,action,expectedResult,cleanUp) {
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
					jb.logException(e,'error in test');
					return document.createElement('div');
				}
			})
			.then(elem => 
				Promise.resolve(action(context.setVars({elemToTest : elem }))).then(_=>elem))
			.then(result =>
					Promise.resolve(cleanUp()).then(_=>result) )
			.then(elem=> {
				// put input values as text
				Array.from(elem.querySelectorAll('input')).forEach(e=>
					e.parentNode.appendChild($(`<input-val style="display:none">${e.value}</input-val>`)[0]));
				return { id: context.vars.testID, 
					success: !! expectedResult(new jb.jbCtx(context,{ data: elem.outerHTML })),
					elem: elem
				}
			})
	}
})

jb.component('ui-action.ngModel', {
	type: 'test',
	params: [
		{ id: 'selector', as: 'string' },
		{ id: 'value', as: 'string' },
	],
	impl: (ctx,selector,value) => {
		var elems = selector ? Array.from(ctx.vars.elemToTest.querySelectorAll(selector)) : [ctx.vars.elemToTest];
		elems.forEach(e=>
			e._component.state.jbModel(value))
		return jb.delay(1);
	}
})

var jb_success_counter = 0;
var jb_fail_counter = 0;

jb.testers.runTests = function(testType,specificTest,show) {
	var tests = jb.entries(jb.comps)
		.filter(e=>typeof e[1].impl == 'object' && e[1].impl.$ == testType)
		.filter(e=>!specificTest || e[0] == specificTest);


	document.write(`<div><span id="success-counter"></span><span id="fail-counter"></span><span> total ${tests.length}</span>`);
	

	jb.rx.Observable.from(tests).concatMap(e=> 
			Promise.resolve(new jb.jbCtx().setVars({testID: e[0]}).run({$:e[0]})))
		.subscribe(res=> {
			if (res.success)
				jb_success_counter++;
			else
				jb_fail_counter++;
			var elem = `<div><a href="/projects/ui-tests/tests.html?test=${res.id}&show" style="color:${res.success ? 'green' : 'red'}">${res.id}</a></div>`;

			document.getElementById('success-counter').innerHTML = 'success ' + jb_success_counter;
			document.getElementById('fail-counter').innerHTML = ' failure ' + jb_fail_counter;
			document.body.innerHTML += elem;
			if (show)
				document.body.appendChild(res.elem);
		})
}