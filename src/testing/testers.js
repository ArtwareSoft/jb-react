jb.component('tests.main', { // needed for loading the 'virtual' tests project
	type: 'control',
	impl: text('') // dummy impl needed
})

jb.component('dataTest', {
	type: 'test',
	params: [
	  {id: 'calculate', dynamic: true},
	  {id: 'expectedResult', type: 'boolean', dynamic: true},
	  {id: 'runBefore', type: 'action', dynamic: true},
	  {id: 'timeout', as: 'number', defaultValue: 200},
	  {id: 'allowError', as: 'boolean', dynamic: true},
	  {id: 'cleanUp', type: 'action', dynamic: true},
	  {id: 'expectedCounters', as: 'single'},
	  {id: 'useResource', as: 'string'},
	],
	impl: function(ctx,calculate,expectedResult,runBefore,timeout,allowError,cleanUp,expectedCounters) {
		const _timeout = ctx.vars.singleTest ? Math.max(1000,timeout) : timeout
		const id = ctx.vars.testID
		return Promise.race([ 
			jb.delay(_timeout).then(()=>[{runErr: 'timeout'}]), 
			Promise.resolve(runBefore())
			  .then(_ => calculate())
			  .then(v => jb.utils.toSynchArray(v,true))
			]).then(value => {
				  const runErr = jb.path(value,'0.runErr')
				  const countersErr = jb.test.countersErrors(expectedCounters,allowError)
				  const expectedResultCtx = new jb.core.jbCtx(ctx,{ data: value })
				  const expectedResultRes = expectedResult(expectedResultCtx)
				  const success = !! (expectedResultRes && !countersErr && !runErr)
				  jb.log('check test result',{success,expectedResultRes, runErr, countersErr, expectedResultCtx})
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
			Var('tstWidgetId', ({},{testID}) => `${jb.uri}-${testID.replace(/\./g,'_')}`)
		],
		timeout: '%$timeout%',
		allowError: '%$allowError%',
		runBefore: runActions(
			call('runBefore'), 
			rx.pipe(
				rx.merge(
					'%$userInputRx()%',
					rx.pipe(source.data('%$userInput%'),rx.delay(1))
				),
				rx.log('userInput'),
				rx.takeUntil('%$$testFinished%'),
				userInput.eventToRequest(),
				rx.filter(({data}) => data && data.$ == 'runCtxAction'),
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
					widget.headless(call('control'), '%$tstWidgetId%'),
					rx.log('uiDelta from headless'),
					rx.delay(1),
				),
				'%$checkResultRx%'
			),
			rx.takeUntil('%$$testFinished%'),
			rx.var('html',uiTest.vdomResultAsHtml()),
			rx.var('success', pipeline('%$html%', call('expectedResult'), last())),
			rx.log('check ui test result', obj(prop('success','%$success%'), prop('html','%$html%'))),
			rx.filter('%$success%'), // if failure wait for the next delta
			rx.map('%$success%'),
			rx.take(1),
			rx.do( ({},{tstWidgetId})=> jb.ui.destroyHeadless(tstWidgetId)),
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
		const {testID, singleTest} = _ctx.vars
		//return Promise.resolve({ id: testID, success: true})
		const elemToTest = document.createElement('div')
		const ctx = _ctx.setVars({elemToTest})
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
			.then(error => !error && jb.utils.toSynchArray(action(ctx),true))
			.then(() => jb.delay(1))
			.then(() => {
				// put input values as text
				Array.from(elemToTest.querySelectorAll('input,textarea')).forEach(e=>
					e.parentNode && jb.ui.addHTML(e.parentNode,`<input-val style="display:none">${e.value}</input-val>`))
				const reason = jb.test.countersErrors(expectedCounters,allowError)
				const resultHtml = elemToTest.outerHTML
				const expectedResultRes = expectedResult(ctx.setData(resultHtml))
				const success = !! (expectedResultRes && !reason)
				jb.log('check FE test result',{testID, success, reason, html: resultHtml})
				const result = { id: testID, success, reason, renderDOM}
				// default cleanup
				if (!show) { //} && !singleTest) {
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
		if (!widget) return ''
		if (typeof document == 'undefined')
			return widget.body.outerHTML()
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
		if (!show);
		const result = { id: ctx.vars.testID, success, vdom, actualVdom, diff }
			jb.ui.unmount(elem)
		return result
	}
})

jb.extension('test', {
	initExtension() { 
		jb.test.initSpyEnrichers()
		return { success_counter: 0, fail_counter: 0, startTime: new Date().getTime() } 
	},
	goto_editor: id => fetch(`/?op=gotoSource&comp=${id}`),
	hide_success_lines: () => jb.frame.document.querySelectorAll('.success').forEach(e=>e.style.display = 'none'),
	profileSingleTest: testID => new jb.core.jbCtx().setVars({testID}).run({$: testID}),
	initSpyEnrichers() {
		jb.spy.registerEnrichers([
			r => r.logNames == 'check test result' && ({ props: {success: r.success, data: r.expectedResultCtx.data, id: r.expectedResultCtx.vars.testId }}),
			r => r.logNames == 'check ui test result' && ({ props: {success: r.success, html: jb.ui.beautifyXml(r.html), data: r.data, id: r.testId }})
		])
	},
	runInner(propName, ctx) {
		const profile = ctx.profile
		return profile[propName] && ctx.runInner(profile[propName],{type: 'data'}, propName)
	},
	dataTestResult(ctx) {
		return Promise.resolve(jb.test.runInner('runBefore',ctx))
		.then(_ => jb.test.runInner('calculate',ctx))
		.then(v => jb.utils.toSynchArray(v,true))
		.then(value => {
			const success = !! jb.test.runInner('expectedResult',ctx.setData(value))
			return { success, value}
		})
	},
	runInStudio(profile) {
		return profile && jb.ui.parentFrameJb().exec(profile)
	},
	async cleanBeforeRun() {
		jb.db.watchableHandlers.forEach(h=>h.dispose())
		jb.db.watchableHandlers = [new jb.watchable.WatchableValueByRef(jb.watchable.resourcesRef)];
		jb.entries(JSON.parse(jb.test.initial_resources || '{}')).filter(e=>e[0] != 'studio').forEach(e=>jb.db.resource(e[0],e[1]))
		jb.ui.subscribeToRefChange(jb.db.watchableHandlers[0])

		if (jb.watchableComps && jb.watchableComps.handler) {
			jb.watchableComps.handler.resources(jb.test.initial_comps)
			jb.db.watchableHandlers.push(jb.watchableComps.handler)
		}
		if (!jb.spy.log) jb.spy.initSpy({spyParam: 'test'})
		jb.spy.clear()
		// await jb.jbm.terminateAllChildren()
		// jb.ui.garbageCollectCtxDictionary(true,true)
	},
	countersErrors(expectedCounters,allowError) {
		if (!jb.spy.log) return ''
		const exception = jb.spy.logs.find(r=>r.logNames.indexOf('exception') != -1)
		const error = jb.spy.logs.find(r=>r.logNames.indexOf('error') != -1)
		if (exception) return exception.err
		if (!allowError() && error) return error.err

		return Object.keys(expectedCounters || {}).map(
			exp => expectedCounters[exp] != jb.spy.count(exp)
				? `${exp}: ${jb.spy.count(exp)} instead of ${expectedCounters[exp]}` : '')
			.filter(x=>x)
			.join(', ')
  	},
	isCompNameOfType(name,type) {
		const comp = name && jb.comps[name]
		if (comp) {
			while (jb.comps[name] && !jb.comps[name].type && jb.utils.compName(jb.comps[name].impl))
				name = jb.utils.compName(jb.comps[name].impl)
			return (jb.comps[name] && jb.comps[name].type || '').indexOf(type) == 0
		}
	},
	async runOneTest(testID,{doNotcleanBeforeRun} = {}) {
		const $testFinished = jb.callbag.subject()
		const tstCtx = jb.ui.extendWithServiceRegistry()
			.setVars({ testID, singleTest: jb.test.singleTest, $testFinished })
		const start = new Date().getTime()
		await !doNotcleanBeforeRun && jb.test.cleanBeforeRun()
		jb.log('start test',{testID})
		const res = await tstCtx.run({$:testID})
		$testFinished.next(1)
		$testFinished.complete()
		res.duration = new Date().getTime() - start
		jb.log('end test',{testID,res})
		if (!jb.test.singleTest)
			await jb.jbm.terminateAllChildren()
		jb.ui.garbageCollectCtxDictionary(true,true)

		res.show = () => {
			const profile = jb.comps[testID]
			if (!profile.impl.control) return
			const doc = jb.frame.document
			if (!doc) return
			const ctxToRun = jb.ui.extendWithServiceRegistry(new jb.core.jbCtx(tstCtx,{ profile: profile.impl.control , forcePath: testID+ '~impl~control', path: '' } ))
			const elem = doc.createElement('div')
			elem.className = 'show'
			doc.body.appendChild(elem)
			jb.ui.render(jb.ui.h(ctxToRun.runItself()),elem)    
		}		
		return res
	},
	async runTests({testType,specificTest,show,pattern,notPattern,take,remoteTests,repo}) {
		const {pipe, fromIter, subscribe,concatMap, fromPromise } = jb.callbag 
		let index = 1

		jb.test.initial_resources = JSON.stringify(jb.db.resources) //.replace(/\"\$jb_id":[0-9]*,/g,'')
		jb.test.initial_comps = jb.watchableComps.handler && jb.watchableComps.handler.resources();

		let tests = jb.entries(jb.comps)
			.filter(e=>typeof e[1].impl == 'object')
			.filter(e=>e[1].type != 'test') // exclude the testers
			.filter(e=>jb.test.isCompNameOfType(e[0],'test'))
			.filter(e=>!testType || e[1].impl.$ == testType)
			.filter(e=>!specificTest || e[0] == specificTest)
	//		.filter(e=> !e[0].match(/throw/)) // tests that throw exceptions and stop the debugger
			.filter(e=>!pattern || e[0].match(pattern))
			.filter(e=>!notPattern || !e[0].match(notPattern))
	//		.filter(e=>!e[0].match(/^remoteTest|inPlaceEditTest|patternsTest/) && ['uiTest','dataTest'].indexOf(e[1].impl.$) != -1) // || includeHeavy || specificTest || !e[1].impl.heavy )
	//		.sort((a,b) => (a[0] > b[0]) ? 1 : ((b[0] > a[0]) ? -1 : 0))
		tests.forEach(e => e.group = e[0].split('.')[0].split('Test')[0])
		const priority = 'net,data,ui,rx,suggestionsTest,remote,studio'.split(',').reverse().join(',')
		const groups = jb.utils.unique(tests.map(e=>e.group)).sort((x,y) => priority.indexOf(x) - priority.indexOf(y))
		tests.sort((y,x) => groups.indexOf(x.group) - groups.indexOf(y.group))
		tests = tests.slice(0,take)
		jb.test.singleTest = tests.length == 1	
		jb.test.runningTests = true

		if (remoteTests) {
			jb.exec({$: 'tests.runner', 
				jbm: jbm.worker({initJbCode: initJb.loadModules(['studio','tests'])}), 
				tests: () => tests.map(e=>e[0]), rootElemId: 'remoteTests'})
			return
		}

		document.body.innerHTML = `<div style="font-size: 20px"><div id="progress"></div><span id="fail-counter" onclick="jb.test.hide_success_lines()"></span><span id="success-counter"></span><span>, total ${tests.length}</span><span id="time"></span><span id="memory-usage"></span></div>`;

		return pipe(
			fromIter(tests),
			concatMap(e => fromPromise((async () => {
				if (e[1].impl.timeout && e[1].impl.timeout > 1000)
					await jb.delay(5)
				const testID = e[0]
				document.getElementById('progress').innerHTML = `<div id=${testID}>${index++}: ${testID} started</div>`
				console.log('starting ' + testID )
				const res = await jb.test.runOneTest(testID)
				console.log('end      ' + testID, res)
				document.getElementById('progress').innerHTML = `<div id=${testID}>${testID} finished</div>`
				return res
			})() )),
			subscribe(res=> {
				res.success ? jb.test.success_counter++ : jb.test.fail_counter++;
				jb.test.usedJSHeapSize = (jb.path(jb.frame,'performance.memory.usedJSHeapSize' || 0) / 1000000)
				jb.test.updateTestHeader(jb.frame.document, jb.test)

				jb.ui.addHTML(document.body, jb.test.testResultHtml(res, repo));
				if (!res.renderDOM && show) res.show()
				if (jb.ui && tests.length >1) {
					jb.cbLogByPath = {}
					window.scrollTo(0,0)
				}
		}))
  	},
	testResultHtml(res, repo) {
		const baseUrl = window.location.href.split('/tests.html')[0]
		const studioUrl = `http://localhost:8082/project/studio/${res.id}?host=test`
		const matchLogs = 'remote,itemlist,refresh'.split(',')
		const matchLogsMap = jb.entries({ui: ['uiComp'], widget: ['uiComp','widget'] })
		const spyLogs = ['test', ...(matchLogs.filter(x=>res.id.toLowerCase().indexOf(x) != -1)), 
			...(matchLogsMap.flatMap( ([k,logs]) =>res.id.toLowerCase().indexOf(k) != -1 ? logs : []))]
		const repoInUrl = repo ? `&repo=${repo}` : ''
		return `<div class="${res.success ? 'success' : 'failure'}"">
			<a href="${baseUrl}/tests.html?test=${res.id}${repoInUrl}&show&spy=${spyLogs.join(',')}" style="color:${res.success ? 'green' : 'red'}">${res.id}</a>
			<span> ${res.duration}mSec</span> 
			<a class="test-button" href="javascript:jb.test.goto_editor('${res.id}')">src</a>
			<a class="test-button" href="${studioUrl}">studio</a>
			<a class="test-button" href="javascript:jb.test.profileSingleTest('${res.id}')">profile</a>
			<span>${res.reason||''}</span>
			</div>`;
	},
	updateTestHeader(topElem,{success_counter,fail_counter,usedJSHeapSize,startTime}) {
		topElem.querySelector('#success-counter').innerHTML = ', success ' + success_counter;
		topElem.querySelector('#fail-counter').innerHTML = 'failures ' + fail_counter;
		topElem.querySelector('#fail-counter').style.color = fail_counter ? 'red' : 'green';
		topElem.querySelector('#fail-counter').style.cursor = 'pointer';
		topElem.querySelector('#memory-usage').innerHTML = ', ' + usedJSHeapSize + 'M memory used';
		topElem.querySelector('#time').innerHTML = ', ' + (new Date().getTime() - startTime) +' mSec';
	}
})

jb.component('source.testsResults', {
	type: 'rx',
	params: [
		{id: 'tests', as: 'array' },
		{id: 'jbm', type: 'jbm', defaultValue: jbm.self() },
	],
	impl: source.remote(
			rx.pipe(
				source.data('%$tests%'),
				rx.var('testID'),
				rx.concatMap(rx.merge(source.data(obj(prop('id','%%'), prop('started','true'))), rx.pipe(source.promise(({},{testID}) => jb.test.runOneTest(testID)))))
			), '%$jbm%')
})

jb.component('tests.runner', {
	type: 'action',
	params: [
		{id: 'tests', as: 'array' },
		{id: 'jbm', type: 'jbm', defaultValue: jbm.self() },
		{id: 'rootElemId', as: 'string'}
	],
	impl: runActions(
		Var('rootElem', ({},{},{rootElemId}) => jb.frame.document.getElementById(rootElemId)),
		({},{rootElem},{tests}) => rootElem.innerHTML = `<div style="font-size: 20px"><div id="progress"></div><span id="fail-counter" onclick="jb.test.hide_success_lines()"></span><span id="success-counter"></span><span>, total ${tests.length}</span><span id="time"></span><span id="memory-usage"></span></div>`,
		rx.pipe(
			source.testsResults('%$tests%','%$jbm%'),
			rx.resource('acc',() => ({ index: 0, success_counter: 0, fail_counter: 0, startTime: new Date().getTime() })),
			rx.var('testID','%id%'),
			rx.do(({data},{acc, testID, rootElem}) => {
				rootElem.querySelector('#progress').innerHTML = `<div id=${testID}>${acc.index++}: ${testID} ${data.started?'started':'finished'}</div>`
				if (!data.started) {
					data.success ? acc.success_counter++ : acc.fail_counter++;
					jb.ui.addHTML(rootElem, jb.test.testResultHtml(data))
					jb.test.updateTestHeader(rootElem,acc)
				}
			}),
			sink.action(()=>{})
		)
	)
})

jb.extension('ui', {
	elemOfSelector: (selector,ctx) => jb.ui.widgetBody(ctx).querySelector(selector) || document.querySelector('.jb-dialogs '+ selector),
	cmpOfSelector: (selector,ctx) => jb.path(jb.ui.elemOfSelector(selector,ctx),'_component'),
	cssOfSelector(selector,ctx) {
		const jbClass = (jb.ui.elemOfSelector(selector,ctx).classList.value || '').split('-').pop()
		return jb.entries(jb.ui.cssSelectors_hash).filter(e=>e[1] == jbClass)[0] || ''
	}
})