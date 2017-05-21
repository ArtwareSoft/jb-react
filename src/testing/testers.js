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
				Array.isArray(v) ? jb.synchArray(v) : v)
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
					var ctrl = jb.ui.h(control().reactComp());
					var cmp = jb.ui.render(ctrl, elem)._component;
					return Promise.resolve(cmp.delayed).then(_=>
						elem)
				} catch (e) {
					jb.logException(e,'error in test');
					return document.createElement('div');
				}
			})
			.then(elem => 
				Promise.resolve(action(context.setVars({elemToTest : elem }))).then(_=>elem))
			.then(elem=> {
				// put input values as text
				Array.from(elem.querySelectorAll('input')).forEach(e=>
					e.parentNode.appendChild($(`<input-val style="display:none">${e.value}</input-val>`)[0]));
				var success = !! expectedResult(new jb.jbCtx(context,{ data: elem.outerHTML })); 
				if (!success)
					t = 5; // just a breakpoint for debugger
				return { id: context.vars.testID, success: success,	elem: elem }
			})
			.then(result =>
					Promise.resolve(cleanUp()).then(_=>result) )
	}
})

jb.component('ui-action.click', {
	type: 'ui-action',
	params: [
		{ id: 'selector', as: 'string' },
	],
	impl: (ctx,selector,value) => {
		var elems = selector ? Array.from(ctx.vars.elemToTest.querySelectorAll(selector)) : [ctx.vars.elemToTest];
		elems.forEach(e=>
			e._component && e._component.clicked && e._component.clicked())
//			e.click())
		return jb.delay(1);
	}
})

jb.component('ui-action.keyboard-event', {
	type: 'ui-action',
	params: [
		{ id: 'selector', as: 'string' },
		{ id: 'type', as: 'string', options: ['keypress','keyup','keydown'] },
		{ id: 'keyCode', as: 'number' },
		{ id: 'ctrl', as: 'string', options: ['ctrl','alt'] },
	],
	impl: (ctx,selector,type,keyCode,ctrl) => {
		var elems = selector ? Array.from(ctx.vars.elemToTest.querySelectorAll(selector)) : [ctx.vars.elemToTest];
		elems.forEach(el=> {
				var e = new KeyboardEvent(type,{
					ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt' 
				});
				Object.defineProperty(e, 'keyCode', { get : _ => keyCode });     
				el.dispatchEvent(e);
			})
		return jb.delay(1);
	}
})

jb.component('ui-action.set-text', {
	type: 'ui-action',
	params: [
		{ id: 'value', as: 'string', essential: true },
		{ id: 'selector', as: 'string', defaultValue: 'input' },
	],
	impl: (ctx,value,selector) => {
		var elems = selector ? Array.from(ctx.vars.elemToTest.querySelectorAll(selector)) : [ctx.vars.elemToTest];
		elems.forEach(e=>
			e._component.jbModel(value))
		return jb.delay(1);
	}
})

jb.component('test.dialog-content', {
	type: 'data',
	params: [
		{ id: 'id', as: 'string' },
	],
	impl: (ctx,id) =>
		jb.ui.dialogs.dialogs.filter(d=>d.id == id).map(d=>d.el)[0].outerHTML || ''
})

var jb_success_counter = 0;
var jb_fail_counter = 0;

function goto_sublime(id) {
	$.ajax(`/?op=gotoSource&comp=${id}`)
}

startTime = startTime || new Date().getTime();
jb.testers.runTests = function(testType,specificTest,show) {
	var tests = jb.entries(jb.comps)
		.filter(e=>typeof e[1].impl == 'object')
		.filter(e=>e[1].type != 'test') // exclude the testers
		.filter(e=>jb.studio.isCompNameOfType(e[0],'test'))
		.filter(e=>!testType || e[1].impl.$ == testType)
		.filter(e=>!specificTest || e[0] == specificTest);


	document.write(`<div style="font-size: 20px"><span id="fail-counter"></span><span id="success-counter"></span><span>, total ${tests.length}</span><span id="time"></span></div>`);

	jb.rx.Observable.from(tests).concatMap(e=> 
			Promise.resolve(new jb.jbCtx().setVars({testID: e[0]}).run({$:e[0]})))
		// .finally( _=> 
		// 	$('.jb-dialogs').empty() )
		.subscribe(res=> {
			if (res.success)
				jb_success_counter++;
			else
				jb_fail_counter++;
			var elem = `<div><a href="/projects/ui-tests/tests.html?test=${res.id}&show" style="color:${res.success ? 'green' : 'red'}">${res.id}</a>
			<button class="sublime" onclick="goto_sublime('${res.id}')">src</button>
			</div>`;

			document.getElementById('success-counter').innerHTML = ', success ' + jb_success_counter;
			document.getElementById('fail-counter').innerHTML = 'failures ' + jb_fail_counter;
			document.getElementById('fail-counter').style.color = jb_fail_counter ? 'red' : 'green';
			document.getElementById('time').innerHTML = ', ' + (new Date().getTime() - startTime) +' mSec';
			document.body.innerHTML += elem;
			if (show && res.elem)
				document.body.appendChild(res.elem);
		})
}