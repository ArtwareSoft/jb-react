jb.ns('uiTest,userInput,uiAction,dialog,widget')

jb.test = {
	runInner(propName, ctx) {
		const profile = ctx.profile
		return profile[propName] && ctx.runInner(profile[propName],{type: 'data'}, propName)
	},
	dataTestResult(ctx) {
		return Promise.resolve(jb.test.runInner('runBefore',ctx))
		.then(_ => jb.test.runInner('calculate',ctx))
		.then(v => jb.toSynchArray(v,true))
		.then(value => {
			const success = !! jb.test.runInner('expectedResult',ctx.setData(value))
			return { success, value}
		})
	},
	runInStudio(profile) {
		return profile && jb.frame.parent.jb.exec(profile)
	},
	cleanBeforeRun(ctx) {
		jb.rebuildRefHandler && jb.rebuildRefHandler();
		jb.entries(JSON.parse(ctx.vars.$initial_resources || '{}')).forEach(e=>jb.resource(e[0],e[1]))
		jb.studio && jb.studio.compsRefHandler && jb.studio.compsRefHandler.resources(ctx.vars.$initial_comps)
		jb.ui.subscribeToRefChange(jb.mainWatchableHandler)
		if (!jb.spy) jb.initSpy({spyParam: 'none'})
		jb.spy.clear()
	}
}

jb.component('tests.main', { // needed for loading the 'virtual' tests project
	type: 'control',
	impl: text('') // dummy impl needed
})

jb.component('dataTest', {
	type: 'test',
	params: [
	  {id: 'calculate', dynamic: true},
	  {id: 'runBefore', type: 'action', dynamic: true},
	  {id: 'expectedResult', type: 'boolean', dynamic: true},
	  {id: 'timeout', as: 'number', defaultValue: 200},
	  {id: 'allowError', as: 'boolean', dynamic: true},
	  {id: 'cleanUp', type: 'action', dynamic: true},
	  {id: 'expectedCounters', as: 'single'},
	],
	impl: function(ctx,calculate,runBefore,expectedResult,timeout,allowError,cleanUp,expectedCounters) {
		const _timeout = ctx.vars.singleTest ? Math.max(1000,timeout) : timeout
		const id = ctx.vars.testID
		return Promise.race([jb.delay(_timeout).then(()=>[{runErr: 'timeout'}]), Promise.resolve(runBefore())
			  .then(_ => calculate())
			  .then(v => jb.toSynchArray(v,true))])
			  .then(value => {
				  const runErr = jb.path(value,'0.runErr')
				  const countersErr = countersErrors(expectedCounters,allowError)
				  const expectedResultCtx = new jb.jbCtx(ctx,{ data: value })
				  const expectedResultRes = expectedResult(expectedResultCtx)
				  const success = !! (expectedResultRes && !countersErr && !runErr)
				  jb.log('data test result',{success,expectedResultRes, runErr, countersErr, expectedResultCtx})
				  const result = { id, success, reason: countersErr || runErr }
				  return result
			  })
			  .catch(e=> {
				  jb.logException(e,'error in test',{ctx})
				  return { id, success: false, reason: 'Exception ' + e}
			  })
			  .then(result => { // default cleanup
				  if (ctx.probe || ctx.vars.singleTest) return result
				  if (ctx.vars.uiTest)
					result.elem && jb.ui.unmount(result.elem)
				  return result
			  })
			  .then(result =>
					  Promise.resolve(!ctx.vars.singleTest && cleanUp())
					  .then(_=>result) )
	  }
})

jb.component('uiTest', {
	type: 'test',
	params: [
	  {id: 'control', type: 'control', dynamic: true},
	  {id: 'runBefore', type: 'action', dynamic: true},
	  {id: 'userInput', type: 'user-input[]', as: 'array' },
	  {id: 'userInputRx', type: 'rx', dynamic: true },
	  {id: 'checkResultRx', type: 'rx' },
	  {id: 'expectedResult', type: 'boolean', dynamic: true},
	  {id: 'allowError', as: 'boolean', dynamic: true},
	  {id: 'timeout', as: 'number', defaultValue: 200},
	  {id: 'cleanUp', type: 'action', dynamic: true},
	  {id: 'expectedCounters', as: 'single'},
	],
	impl: dataTest({
		vars: [
			Var('uiTest',true),
			Var('tstWidgetId',replace({text: '%$testID%', find: '[.]', replace: '_'})),
		],
		timeout: '%$timeout%',
		allowError: '%$allowError%',
		runBefore: runActions(
			call('runBefore'), rx.pipe(
						rx.merge(
							'%$userInputRx()%',
							rx.pipe(source.data('%$userInput%'),rx.delay(1))
						),
						rx.log('userInput'),
						rx.takeUntil('%$$testFinished%'),
						userInput.eventToRequest(),
						rx.log('userRequest'),
						sink.action(({data}) => jb.ui.widgetUserRequests.next(data))
			)
		),
		calculate: rx.pipe(
			rx.merge(
				rx.pipe(
					source.callbag(()=>jb.ui.widgetUserRequests),
					rx.takeUntil('%$$testFinished%'),
					rx.log('userRequest from widgetUserRequests'),
					widget.headless('%$control()%', '%$tstWidgetId%'),
					rx.log('uiDelta from headless'),
					rx.delay(1)
				),
				'%$checkResultRx%'
			),
			rx.var('html',uiTest.vdomResultAsHtml()),
			rx.var('success', pipeline('%$html%', call('expectedResult'), last())),
			rx.log('check test result'),
			rx.filter('%$success%'), // if failure wait for the next delta
			rx.map('%$success%'),
			rx.take(1),
			rx.do( ({},{tstWidgetId})=>jb.ui.unmount(jb.ui.headless[tstWidgetId].body)),
		),
		expectedResult: '%%',
		cleanUp: call('cleanUp'),
		expectedCounters: '%$expectedCounters%',
	})
})  

jb.component('uiFrontEndTest', {
	type: 'test',
	params: [
	  {id: 'control', type: 'control', dynamic: true},
	  {id: 'runBefore', type: 'action', dynamic: true},
	  {id: 'action', type: 'action', dynamic: true},
	  {id: 'expectedResult', as: 'boolean', dynamic: true},
	  {id: 'allowError', as: 'boolean', dynamic: true},
	  {id: 'cleanUp', type: 'action', dynamic: true},
	  {id: 'expectedCounters', as: 'single'},
	  {id: 'renderDOM', type: 'boolean', descrition: 'render the vdom under the document dom' },
	  {id: 'runInPreview', type: 'action', dynamic: true, descrition: 'not for test mode'},
	  {id: 'runInStudio', type: 'action', dynamic: true, descrition: 'not for test mode'},
	],
	impl: (_ctx,control,runBefore,action,expectedResult,allowError,cleanUp,expectedCounters,renderDOM) => {
		const elemToTest = document.createElement('div')
		const ctx = _ctx.setVars({elemToTest})
		const {testID, singleTest} = ctx.vars
		elemToTest.ctxForFE = ctx
		elemToTest.setAttribute('id','jb-testResult')
		const show = new URL(location.href).searchParams.get('show') !== null
		return Promise.resolve(runBefore())
			.then(() => {
				try {
					if (renderDOM) document.body.appendChild(elemToTest)
					jb.ui.render(jb.ui.h(control(ctx)), elemToTest)
				} catch (e) {
					jb.logException(e,'error in test',{ctx})
					return e
				}
			})
			.then(error => jb.delay(1,error))
			.then(error => !error && jb.toSynchArray(action(ctx),true))
			.then(() => jb.delay(1))
			.then(() => {
				// put input values as text
				Array.from(elemToTest.querySelectorAll('input,textarea')).forEach(e=>
					e.parentNode && jb.ui.addHTML(e.parentNode,`<input-val style="display:none">${e.value}</input-val>`))
				const countersErr = countersErrors(expectedCounters,allowError)
				const resultHtml = elemToTest.outerHTML
				const expectedResultRes = expectedResult(ctx.setData(resultHtml))
				jb.log('check test result',{testID, expectedResultRes, resultHtml})
				const success = !! (expectedResultRes && !countersErr)
				const result = { id: testID, success, reason: countersErr, renderDOM}
				// default cleanup
				if (!show && !singleTest) {
					jb.ui.unmount(elemToTest)
					ctx.run(runActions(dialog.closeAll(), dialogs.destroyAllEmitters()))
				}
				if (renderDOM && !show && !singleTest) document.body.removeChild(elemToTest)
				return Promise.resolve(cleanUp()).then(_=>result)
		})
	}
})

jb.component('uiTest.vdomResultAsHtml', {
	params: [
	],
	impl: ctx => {
		const widget = jb.ui.headless[ctx.vars.tstWidgetId]
		if (!widget) debugger
		const elemToTest = document.createElement('div')
		elemToTest.ctxForFE = ctx.setVars({elemToTest})
		jb.ui.render(widget.body, elemToTest)
		Array.from(elemToTest.querySelectorAll('input,textarea')).forEach(e=> e.parentNode && 
			jb.ui.addHTML(e.parentNode,`<input-val style="display:none">${e.value}</input-val>`))		
		return elemToTest.outerHTML
	}
})

jb.component('uiTest.applyVdomDiff', {
  type: 'test',
  params: [
    {id: 'controlBefore', type: 'control', dynamic: true},
    {id: 'control', type: 'control', dynamic: true}
  ],
  impl: function(ctx,controlBefore,control) {
		console.log('starting ' + ctx.vars.testID)
		const show = new URL(location.href).searchParams.get('show') !== null

		const elem = document.createElement('div');
		const vdomBefore = jb.ui.h(controlBefore(ctx))
		const vdom = jb.ui.h(control(ctx))
		jb.ui.render(vdomBefore,elem)
		jb.ui.applyNewVdom(elem.firstElementChild,vdom)
		const actualVdom = jb.ui.elemToVdom(elem.firstElementChild)
		const diff = jb.ui.vdomDiff(vdom,actualVdom)

		const success = Object.keys(diff).length == 0
		const result = { id: ctx.vars.testID, success, vdom, actualVdom, diff }
		if (!show)
			jb.ui.unmount(elem)
		return result
	  }
})

function countersErrors(expectedCounters,allowError) {
	if (!jb.spy) return ''
	const exception = jb.spy.logs.find(r=>r.logNames.indexOf('exception') != -1)
	const error = jb.spy.logs.find(r=>r.logNames.indexOf('error') != -1)
	if (exception) return exception.err
	if (!allowError() && error) return error.err

	return Object.keys(expectedCounters || {}).map(
		exp => expectedCounters[exp] != jb.spy.count(exp)
			? `${exp}: ${jb.spy.count(exp)} instead of ${expectedCounters[exp]}` : '')
		.filter(x=>x)
		.join(', ')
}

jb.ui.elemOfSelector = (selector,ctx) => jb.ui.widgetBody(ctx).querySelector(selector) 
	|| document.querySelector('.jb-dialogs '+ selector)
jb.ui.cmpOfSelector = (selector,ctx) => jb.path(jb.ui.elemOfSelector(selector,ctx),'_component')

jb.ui.cssOfSelector = (selector,ctx) => {
	const jbClass = (jb.ui.elemOfSelector(selector,ctx).classList.value || '').split('-').pop()
	return jb.entries(jb.ui.cssSelectors_hash).filter(e=>e[1] == jbClass)[0] || ''
}

var jb_success_counter = 0;
var jb_fail_counter = 0;

function goto_editor(id) {
	fetch(`/?op=gotoSource&comp=${id}`)
}
function goto_studio(id) {
	location.href = `/project/studio/${id}?host=test`
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

function profileSingleTest(testID) {
	new jb.jbCtx().setVars({testID}).run({$: testID})
}

if (typeof startTime === 'undefined')
	startTime = new Date().getTime();
startTime = startTime || new Date().getTime();

jb.testers = {
  runTests: function({testType,specificTest,show,pattern,}) {
	const {pipe, fromIter, subscribe,concatMap, flatMap, fromPromise } = jb.callbag
	let index = 1

	jb.studio.initTests() && jb.studio.initTests()
	const $initial_resources = JSON.stringify(jb.resources) //.replace(/\"\$jb_id":[0-9]*,/g,'')
	const $initial_comps = jb.studio && jb.studio.compsRefHandler && jb.studio.compsRefHandler.resources();

	const tests = jb.entries(jb.comps)
		.filter(e=>typeof e[1].impl == 'object')
		.filter(e=>e[1].type != 'test') // exclude the testers
		.filter(e=>isCompNameOfType(e[0],'test'))
		.filter(e=>!testType || e[1].impl.$ == testType)
		.filter(e=>!specificTest || e[0] == specificTest)
//		.filter(e=> !e[0].match(/throw/)) // tests that throw exceptions and stop the debugger
		.filter(e=>!pattern || e[0].match(pattern))
//		.filter(e=>!e[0].match(/^remoteTest|inPlaceEditTest|patternsTest/) && ['uiTest','dataTest'].indexOf(e[1].impl.$) != -1) // || includeHeavy || specificTest || !e[1].impl.heavy )
//		.sort((a,b) => (a[0] > b[0]) ? 1 : ((b[0] > a[0]) ? -1 : 0))

	document.write(`<div style="font-size: 20px"><div id="progress"></div><span id="fail-counter" onclick="hide_success_lines()"></span><span id="success-counter"></span><span>, total ${tests.length}</span><span id="time"></span><span id="memory-usage"></span></div>`);

	const times = {}
	return pipe(
			fromIter(tests),
			concatMap(e => {
			  const testID = e[0]
			  const $testFinished = jb.callbag.subject()
			  const tstCtx = jb.ui.extendWithServiceRegistry()
			  	.setVars({ testID, $initial_resources, $initial_comps, singleTest: tests.length == 1, $testFinished })
			  document.getElementById('progress').innerHTML = `<div id=${testID}>${index++}: ${testID} started</div>`
			  times[testID] = { start: new Date().getTime() }
			  jb.test.cleanBeforeRun(tstCtx)
			  jb.log('start test',{testID})
			  console.log('starting ' + testID )
			  return fromPromise(Promise.resolve(tstCtx.run({$:testID}))
				.then(res => {
					$testFinished.next(1)
					document.getElementById('progress').innerHTML = `<div id=${testID}>${testID} finished</div>`
					res.duration = new Date().getTime() - times[testID].start
					console.log('end      ' + testID, res)
					jb.log('end test',{testID,res})
					res.show = () => {
						if (!e[1].impl.control) return
						const ctxToRun = jb.ui.extendWithServiceRegistry(new jb.jbCtx(tstCtx,{ profile: e[1].impl.control , forcePath: testID+ '~impl~control', path: '' } ))
						const elem = document.createElement('div')
						elem.className = 'show'
						document.body.appendChild(elem)
						jb.ui.render(jb.ui.h(ctxToRun.runItself()),elem)    
					}
					return res
			 }))
		}),
		subscribe(res=> {
			if (res.success)
				jb_success_counter++;
			else
				jb_fail_counter++;
			const baseUrl = window.location.href.split('/tests.html')[0]
			const studioUrl = `http://localhost:8082/project/studio/${res.id}?host=test`
			const matchLogs = 'remote,itemlist,refresh'.split(',')
			const matchLogsMap = jb.entries({ui: ['uiComp'], widget: ['uiComp','widget'] })
			const spyLogs = ['test', ...(matchLogs.filter(x=>res.id.toLowerCase().indexOf(x) != -1)), 
				...(matchLogsMap.flatMap( ([k,logs]) =>res.id.toLowerCase().indexOf(k) != -1 ? logs : []))]
			const testResultHtml = `<div class="${res.success ? 'success' : 'failure'}"">
				<a href="${baseUrl}/tests.html?test=${res.id}&show&spy=${spyLogs.join(',')}" style="color:${res.success ? 'green' : 'red'}">${res.id}</a>
				<span> ${res.duration}mSec</span> 
				<a class="test-button" href="javascript:goto_editor('${res.id}')">src</a>
				<a class="test-button" href="${studioUrl}">studio</a>
				<a class="test-button" href="javascript:profileSingleTest('${res.id}')">profile</a>
				<span>${res.reason||''}</span>
				</div>`;

			document.getElementById('success-counter').innerHTML = ', success ' + jb_success_counter;
			document.getElementById('fail-counter').innerHTML = 'failures ' + jb_fail_counter;
			document.getElementById('fail-counter').style.color = jb_fail_counter ? 'red' : 'green';
			document.getElementById('fail-counter').style.cursor = 'pointer';
			document.getElementById('memory-usage').innerHTML = ', ' + (jb.path(jb.frame,'performance.memory.usedJSHeapSize' || 0) / 1000000)  + 'M memory used';

			document.getElementById('time').innerHTML = ', ' + (new Date().getTime() - startTime) +' mSec';
			jb.ui.addHTML(document.body,testResultHtml);
			if (!res.renderDOM && show) res.show()
			if (jb.ui && tests.length >1) {
				jb.ui.garbageCollectCtxDictionary && jb.ui.garbageCollectCtxDictionary(true,true)
				jb.cbLogByPath = {}
			}
	}))
}}