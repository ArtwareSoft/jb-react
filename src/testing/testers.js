jb.component('data-test', {
	type: 'test',
	params: [
		{ id: 'calculate', dynamic: true },
		{ id: 'runBefore', type: 'action', dynamic: true },
		{ id: 'expectedResult', type: 'boolean', dynamic: true },
		{ id: 'cleanUp', type: 'action', dynamic: true },
		{ id: 'expectedCounters', as: 'single' }
	],
	impl: function(ctx,calculate,runBefore,expectedResult,cleanUp,expectedCounters) {
		console.log('starting ' + ctx.path )
		var initial_comps = jb.studio && jb.studio.compsRefHandler && jb.studio.compsRefHandler.resources();
		jb.resources = JSON.parse(ctx.vars.initial_resources); jb.rebuildRefHandler && jb.rebuildRefHandler();
		if (expectedCounters) {
			if (!jb.frame.wSpy.enabled())
				jb.frame.initwSpy({wSpyParam: 'data-test'})
			jb.frame.wSpy.clear()
		}
		return Promise.resolve(runBefore())
			.then(_ =>
				calculate())
			.then(v=>
				Array.isArray(v) ? jb.synchArray(v) : v)
			.then(value=> {
				const countersErr = countersErrors(expectedCounters);
				const success = !! (expectedResult(new jb.jbCtx(ctx,{ data: value })) && !countersErr);
				const result = { id: ctx.vars.testID, success, reason: countersErr}
				return result
			})
			.catch(e=>jb.logException(e,ctx))
			.then(result => { // default cleanup
				if (expectedCounters)
					jb.frame.initwSpy({resetwSpyToNoop: true})
				jb.studio && jb.studio.compsRefHandler && jb.studio.compsRefHandler.resources(initial_comps);
				return result;
			})
			.catch(e=>jb.logException(e,ctx))
			.then(result =>
					Promise.resolve(cleanUp())
					.then(_=> console.log('end ' + ctx.path ))
					.then(_=>result) )
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
		{ id: 'expectedCounters', as: 'single' },
	],
	impl: function(ctx,control,runBefore,action,expectedResult,cleanUp,expectedCounters) {
		console.log('starting ' + ctx.path )
		var initial_comps = jb.studio && jb.studio.compsRefHandler && jb.studio.compsRefHandler.resources();
		jb.resources = JSON.parse(ctx.vars.initial_resources); jb.rebuildRefHandler && jb.rebuildRefHandler();
		return Promise.resolve(runBefore())
			.then(_ => {
				try {
					if (expectedCounters) {
						if (!jb.frame.wSpy.enabled())
							jb.frame.initwSpy({wSpyParam: 'ui-test'})
						jb.frame.wSpy.clear()
					}
					var elem = document.createElement('div');
					var vdom = jb.ui.h(jb.ui.renderable(control()));
					var cmp = jb.ui.render(vdom, elem)._component;
					return Promise.resolve(cmp && cmp.delayed)
						.then(_ => jb.delay(1))
						.then(_=> elem)
				} catch (e) {
					jb.logException(e,'error in test',ctx);
					return document.createElement('div');
				}
			})
			.then(elem =>
				Promise.resolve(action(ctx.setVars({elemToTest : elem }))).then(_=>elem))
			.then(elem=> {
				// put input values as text
				Array.from(elem.querySelectorAll('input')).forEach(e=>{
					if (e.parentNode)
						jb.ui.addHTML(e.parentNode,`<input-val style="display:none">${e.value}</input-val>`)
				})
				const countersErr = countersErrors(expectedCounters);
				const success = !! (expectedResult(new jb.jbCtx(ctx,{ data: elem.outerHTML })) && !countersErr);
				return { id: ctx.vars.testID, success, elem, reason: countersErr}
			}).then(result=> { // default cleanup
				if (new URL(location.href).searchParams.get('show') === null) {
					jb.ui.dialogs.dialogs.forEach(d=>d.close())
					jb.studio && jb.studio.compsRefHandler && jb.studio.compsRefHandler.resources(initial_comps);
					if (expectedCounters)
						jb.frame.initwSpy({resetwSpyToNoop: true})
				}
				return result;
			}).then(result =>
				Promise.resolve(cleanUp())
				.then(_=> console.log('end ' + ctx.path ))
				.then(_=>result) )
	}
})

function countersErrors(expectedCounters) {
	return Object.keys(expectedCounters || {}).map(
		counter => expectedCounters[counter] != jb.frame.wSpy.logs.$counters[counter] 
			? `${counter}: ${jb.frame.wSpy.logs.$counters[counter]} instead of ${expectedCounters[counter]}` : '')
		.filter(x=>x)
		.join(', ')
}

jb.component('ui-action.click', {
	type: 'ui-action',
	params: [
		{ id: 'selector', as: 'string' },
		{ id: 'methodToActivate', as: 'string', defaultValue: 'clicked'}
	],
	impl: (ctx,selector,methodToActivate) => {
		var elems = selector ? Array.from(ctx.vars.elemToTest.querySelectorAll(selector)) : [ctx.vars.elemToTest];
		elems.forEach(e=>
			e._component && e._component[methodToActivate] && e._component[methodToActivate]())
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
		const elem = selector ? ctx.vars.elemToTest.querySelector(selector) : ctx.vars.elemToTest;
		if (!elem) return
		const e = new KeyboardEvent(type,{ ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt' });
		Object.defineProperty(e, 'keyCode', { get : _ => keyCode });
		elem.dispatchEvent(e);
		return jb.delay(1);
	}
})

jb.component('ui-action.set-text', {
	type: 'ui-action',
	usageByValue: true,
	params: [
		{ id: 'value', as: 'string', mandatory: true },
		{ id: 'selector', as: 'string', defaultValue: 'input' },
		{ id: 'delay', as: 'number', defaultValue: 1}
	],
	impl: (ctx,value,selector,delay) => {
		const elems = selector ? Array.from(ctx.vars.elemToTest.querySelectorAll(selector)) : [ctx.vars.elemToTest];
		elems.forEach(e=> {
			e._component.jbModel(value);
			jb.ui.findIncludeSelf(e,'input').forEach(el=>el.value = value);
		})
		return jb.delay(delay);
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

function goto_editor(id) {
	fetch(`/?op=gotoSource&comp=${id}`)
}
function hide_success_lines() {
	document.querySelectorAll('.success').forEach(e=>e.style.display = 'none')
}

function isCompNameOfType(name,type) {
	const comp = name && jb.comps[name];
	if (comp) {
		while (jb.comps[name] && !jb.comps[name].type && jb.compName(jb.comps[name].impl))
			name = jb.compName(jb.comps[name].impl);
		return (jb.comps[name] && jb.comps[name].type || '').indexOf(type) == 0;
	}
}
jb.ui = jb.ui || {}
jb.ui.addHTML = jb.ui.addHTML || ((el,html) => {
	var elem = document.createElement('div');
	elem.innerHTML = html;
	el.appendChild(elem.firstChild)
})
  
if (typeof startTime === 'undefined')
	startTime = new Date().getTime();
startTime = startTime || new Date().getTime();

jb.testers.runTests = function({testType,specificTest,show,pattern,rerun}) {
	var initial_resources = JSON.stringify(jb.resources).replace(/\"\$jb_id":[0-9]*,/g,'')
	var tests = jb.entries(jb.comps)
		.filter(e=>typeof e[1].impl == 'object')
		.filter(e=>e[1].type != 'test') // exclude the testers
		.filter(e=>isCompNameOfType(e[0],'test'))
		.filter(e=>!testType || e[1].impl.$ == testType)
		.filter(e=>!specificTest || e[0] == specificTest)
		.filter(e=>!pattern || e[0].match(pattern));


	document.write(`<div style="font-size: 20px"><span id="fail-counter" onclick="hide_success_lines()"></span><span id="success-counter"></span><span>, total ${tests.length}</span><span id="time"></span><span id="memory-usage"></span></div>`);

	return jb.rx.Observable.from(Array.from(Array(rerun ? Number(rerun) : 1).keys()))
		.concatMap(i=> (i % 20 == 0) ? jb.delay(300): [1])
		.concatMap(_=>
		jb.rx.Observable.from(tests).concatMap(e=>{
			jb.logs.error = [];
			return Promise.resolve(new jb.jbCtx().setVars({testID: e[0], initial_resources }).run({$:e[0]}))
				.then(res => {
					if (res.success && jb.logs.error.length > 0) {
						res.success = false;
						res.reason = 'log errors: ' + JSON.stringify(jb.logs.error) 
					}
					return res
				})
			})).subscribe(res=> {
				if (res.success)
					jb_success_counter++;
				else
					jb_fail_counter++;
				const baseUrl = window.location.href.split('/tests.html')[0]
				var elem = `<div class="${res.success ? 'success' : 'failure'}""><a href="${baseUrl}/tests.html?test=${res.id}&show&wspy=res" style="color:${res.success ? 'green' : 'red'}">${res.id}</a>
				<button class="editor" onclick="goto_editor('${res.id}')">src</button><span>${res.reason||''}</span>
				</div>`;

				document.getElementById('success-counter').innerHTML = ', success ' + jb_success_counter;
				document.getElementById('fail-counter').innerHTML = 'failures ' + jb_fail_counter;
				document.getElementById('fail-counter').style.color = jb_fail_counter ? 'red' : 'green';
				document.getElementById('fail-counter').style.cursor = 'pointer';
				document.getElementById('memory-usage').innerHTML = ', ' + (performance.memory.usedJSHeapSize / 1000000)  + 'M memory used';

				document.getElementById('time').innerHTML = ', ' + (new Date().getTime() - startTime) +' mSec';
				jb.ui.addHTML(document.body,elem);
				if (show && res.elem)
					document.body.appendChild(res.elem);
				jb.ui && jb.ui.garbageCollectCtxDictionary && jb.ui.garbageCollectCtxDictionary(true)
			})
}
