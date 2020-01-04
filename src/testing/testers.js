jb.component('data-test', { /* dataTest */
  type: 'test',
  params: [
    {id: 'calculate', dynamic: true},
    {id: 'runBefore', type: 'action', dynamic: true},
    {id: 'expectedResult', type: 'boolean', dynamic: true},
    {id: 'cleanUp', type: 'action', dynamic: true},
    {id: 'expectedCounters', as: 'single'}
  ],
  impl: function(ctx,calculate,runBefore,expectedResult,cleanUp,expectedCounters) {
		console.log('starting ' + ctx.path )
		var initial_comps = jb.studio && jb.studio.compsRefHandler && jb.studio.compsRefHandler.resources();
		if (expectedCounters) {
			if (!jb.spy)
				jb.initSpy({spyParam: 'data-test'})
			jb.spy.clear()
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
			.catch(e=> {
				jb.logException(e,ctx)
				return { id: ctx.vars.testID, success: false, reason: 'Exception ' + e}
			})
			.then(result => { // default cleanup
				if (expectedCounters)
					jb.initSpy({resetSpyToNull: true})
				jb.resources = JSON.parse(ctx.vars.initial_resources); jb.rebuildRefHandler && jb.rebuildRefHandler();
				jb.studio && jb.studio.compsRefHandler && jb.studio.compsRefHandler.resources(initial_comps);
				return result;
			})
			.catch(e=> {
				jb.logException(e,ctx)
				return { id: ctx.vars.testID, success: false, reason: 'Exception ' + e}
			})
			.then(result =>
					Promise.resolve(cleanUp())
					.then(_=> console.log('end ' + ctx.path ))
					.then(_=>result) )
	}
})

jb.component('ui-test', { /* uiTest */
  type: 'test',
  params: [
    {id: 'control', type: 'control', dynamic: true},
    {id: 'runBefore', type: 'action', dynamic: true},
    {id: 'action', type: 'action', dynamic: true},
    {id: 'expectedResult', type: 'boolean', dynamic: true},
    {id: 'cleanUp', type: 'action', dynamic: true},
    {id: 'expectedCounters', as: 'single'}
  ],
  impl: function(ctx,control,runBefore,action,expectedResult,cleanUp,expectedCounters) {
		console.log('starting ' + ctx.path )
		const initial_comps = jb.studio && jb.studio.compsRefHandler && jb.studio.compsRefHandler.resources();
		return Promise.resolve(runBefore())
			.then(_ => {
				try {
					if (expectedCounters) {
						if (!jb.spy)
							jb.initSpy({spyParam: 'ui-test'})
						jb.spy.clear()
					}
					const elem = document.createElement('div');
					const ctxForTst = ctx.setVars({elemToTest : elem })
					const vdom = jb.ui.h(control(ctxForTst));
					const cmp = jb.ui.render(vdom, elem)._component;
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
				Array.from(elem.querySelectorAll('input,textarea')).forEach(e=>{
					if (e.parentNode)
						jb.ui.addHTML(e.parentNode,`<input-val style="display:none">${e.value}</input-val>`)
				})
				const countersErr = countersErrors(expectedCounters);
				const success = !! (expectedResult(new jb.jbCtx(ctx,{ data: elem.outerHTML }).setVars({elemToTest: elem})) && !countersErr);
				return { id: ctx.vars.testID, success, elem, reason: countersErr}
			}).then(result=> { // default cleanup
				if (new URL(location.href).searchParams.get('show') === null) {
					jb.ui.dialogs.dialogs.forEach(d=>d.close())
					jb.ui.unmount(result.elem)
					jb.rebuildRefHandler && jb.rebuildRefHandler();
					jb.entries(JSON.parse(ctx.vars.initial_resources)).forEach(e=>jb.resource(e[0],e[1]))
					jb.studio && jb.studio.compsRefHandler && jb.studio.compsRefHandler.resources(initial_comps);
					jb.ui.subscribeToRefChange(jb.mainWatchableHandler)
					if (expectedCounters)
						jb.initSpy({resetSpyToNull: true})
				}
				return result;
			}).then(result =>
				Promise.resolve(cleanUp())
				.then(_=> console.log('end ' + ctx.path ))
				.then(_=>result) )
	}
})

function countersErrors(expectedCounters) {
	if (!jb.spy) return ''
	if ((jb.spy.logs.exception || [])[0])
		return (jb.spy.logs.exception || [])[0][0]
	if (jb.spy.$counters && jb.spy.$counters.exception)
		return 'exception occured'

	return Object.keys(expectedCounters || {}).map(
		counter => expectedCounters[counter] !== (jb.spy.logs.$counters[counter] || 0)
			? `${counter}: ${jb.spy.logs.$counters[counter]} instead of ${expectedCounters[counter]}` : '')
		.filter(x=>x)
		.join(', ')
}

jb.ui.elemOfSelector = (selector,ctx) => ctx.vars.elemToTest.querySelector(selector) || document.querySelector('.jb-dialogs '+ selector)
jb.ui.cmpOfSelector = (selector,ctx) => jb.path(jb.ui.elemOfSelector(selector,ctx),['_component'])

jb.ui.cssOfSelector = (selector,ctx) => {
	const jbClass = (jb.ui.elemOfSelector(selector,ctx).classList.value || '').split('-').pop()
	return jb.entries(jb.ui.cssSelectors_hash).filter(e=>e[1] == jbClass)[0] || ''
}


jb.component('ui-action.click', { /* uiAction.click */
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'methodToActivate', as: 'string', defaultValue: 'onclickHandler'}
  ],
  impl: (ctx,selector,methodToActivate) => {
		var elems = selector ? Array.from(ctx.vars.elemToTest.querySelectorAll(selector)) : [ctx.vars.elemToTest];
		elems.forEach(e=>
			e._component && e._component[methodToActivate] && e._component[methodToActivate]())
		return jb.delay(1);
	}
})


jb.component('ui-action.keyboard-event', { /* uiAction.keyboardEvent */
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'type', as: 'string', options: ['keypress', 'keyup', 'keydown']},
    {id: 'keyCode', as: 'number'},
    {id: 'ctrl', as: 'string', options: ['ctrl', 'alt']}
  ],
  impl: (ctx,selector,type,keyCode,ctrl) => {
		const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : ctx.vars.elemToTest;
		if (!elem) return
		const e = new KeyboardEvent(type,{ ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt' });
		Object.defineProperty(e, 'keyCode', { get : _ => keyCode });
		elem.dispatchEvent(e);
		return jb.delay(1);
	}
})

jb.component('ui-action.set-text', { /* uiAction.setText */
  type: 'ui-action',
  macroByValue: true,
  params: [
    {id: 'value', as: 'string', mandatory: true},
    {id: 'selector', as: 'string', defaultValue: 'input,textarea'},
    {id: 'delay', as: 'number', defaultValue: 1}
  ],
  impl: (ctx,value,selector,delay) => {
		const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : ctx.vars.elemToTest;
		elem && elem._component && elem._component.jbModel(value) 
//			&& jb.ui.findIncludeSelf(elem,`${selector},${selector} input,${selector} textarea`).forEach(el=>el.value = value);
		return jb.delay(delay);
	}
})

jb.component('test.dialog-content', { /* test.dialogContent */
  type: 'data',
  params: [
    {id: 'id', as: 'string'}
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
	jb.studio.initTests() && jb.studio.initTests()
	const initial_resources = JSON.stringify(jb.resources).replace(/\"\$jb_id":[0-9]*,/g,'')
	const tests = jb.entries(jb.comps)
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
					if (!res)
						return { id: e[0], success: false, reason: 'empty result'}
					if (res && res.success && jb.logs.error.length > 0) {
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
				var elem = `<div class="${res.success ? 'success' : 'failure'}""><a href="${baseUrl}/tests.html?test=${res.id}&show&spy=res" style="color:${res.success ? 'green' : 'red'}">${res.id}</a>
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
