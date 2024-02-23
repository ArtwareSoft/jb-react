using('remote')

component('dataTest', {
  type: 'test',
  params: [
    {id: 'calculate', type:'data', dynamic: true},
    {id: 'expectedResult', type: 'boolean', dynamic: true},
    {id: 'runBefore', type: 'action', dynamic: true},
    {id: 'timeout', as: 'number', defaultValue: 200},
    {id: 'allowError', as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'cleanUp', type: 'action', dynamic: true},
    {id: 'expectedCounters', as: 'single'},
    {id: 'spy', as: 'string'},
    {id: 'includeTestRes', as: 'boolean', type: 'boolean'},
    {id: 'covers', as: 'array'},
  ],
  impl: async function(ctx,calculate,expectedResult,runBefore,timeout,allowError,cleanUp,expectedCounters,spy,includeTestRes) {
		const ctxToUse = ctx.vars.testID ? ctx : ctx.setVars({testID:'unknown'})
		const {testID,singleTest,uiTest}  = ctxToUse.vars
		const remoteTimeout = testID.match(/([rR]emote)|([wW]orker)|(jbm)/) ? 5000 : null
		const _timeout = singleTest ? Math.max(1000,timeout) : (remoteTimeout || timeout)
		if (spy) jb.spy.setLogs(spy+',error')
		let result = null
		try {
			const testRes = await Promise.race([ 
				(async() => {
					await jb.delay(_timeout)
					return {testFailure: `timeout ${_timeout}mSec`}
				})(),
				(async() => {
					await runBefore(ctxToUse)
					const res = await calculate(ctxToUse)
					return await jb.utils.toSynchArray(res,true)
				})()
			])
			let testFailure = jb.path(testRes,'0.testFailure') || jb.path(testRes,'testFailure')
			const countersErr = jb.test.countersErrors(expectedCounters,allowError)
			const expectedResultCtx = new jb.core.jbCtx(ctxToUse,{ data: testRes })
			const expectedResultRes = !testFailure && await expectedResult(expectedResultCtx)
			testFailure = jb.path(expectedResultRes,'testFailure')
			const success = !! (expectedResultRes && !countersErr && !testFailure)
			jb.log('check test result',{testRes, success,expectedResultRes, testFailure, countersErr, expectedResultCtx})
			result = { id: testID, success, reason: countersErr || testFailure, ...(includeTestRes ? testRes : {})}
		} catch (e) {
			jb.logException(e,'error in test',{ctx})
			result = { id, success: false, reason: 'Exception ' + e}
		} finally {
			if (spy) jb.spy.setLogs('error')
			if (uiTest && result.elem && jb.ui)
				jb.ui.unmount(result.elem)
			const doNotClean = ctx.probe || singleTest
			if (!doNotClean) await (!singleTest && cleanUp())
		} 
		return result
	}
})

extension('test', {
	initExtension() { 
		jb.test.initSpyEnrichers()
		return { success_counter: 0, fail_counter: 0, startTime: new Date().getTime() } 
	},
	goto_editor: (id,repo) => fetch(`/?op=gotoSource&comp=${id}&repo=${repo}`),
	hide_success_lines: () => jb.frame.document.querySelectorAll('.success').forEach(e=>e.style.display = 'none'),
	profileSingleTest: fullTestId => new jb.core.jbCtx().setVars({fullTestId, testID: fullTestId.split('>').pop()}).run({$: fullTestId}),
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
	addHTML(el,html,{beforeResult} = {}) {
        const elem = document.createElement('div')
        elem.innerHTML = html
		const toAdd = elem.firstChild
		if (beforeResult && document.querySelector('#jb-testResult'))
			el.insertBefore(toAdd, document.querySelector('#jb-testResult'))
		else
        	el.appendChild(toAdd)
    },
	async cleanBeforeRun() {
		jb.db.watchableHandlers.forEach(h=>h.dispose())
		jb.db.watchableHandlers = [new jb.watchable.WatchableValueByRef(jb.watchable.resourcesRef)];
		jb.entries(JSON.parse(jb.test.initial_resources || '{}')).filter(e=>e[0] != 'studio').forEach(e=>jb.db.resource(e[0],e[1]))
		jb.ui && jb.ui.subscribeToRefChange(jb.db.watchableHandlers[0])

		if (jb.watchableComps && jb.watchableComps.handler) {
			jb.watchableComps.handler.resources(jb.test.initial_comps)
			jb.db.watchableHandlers.push(jb.watchableComps.handler)
		}
		if (!jb.spy.enabled) jb.spy.initSpy({spyParam: 'test'})
		jb.spy.clear()
		// await jb.jbm.terminateAllChildren()
		// jb.ui.garbageCollectUiComps({forceNow: true,clearAll: true})
	},
	countersErrors(expectedCounters,allowError) {
		if (!jb.spy.enabled) return ''
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
			while (jb.comps[name] && !jb.comps[name].type && typeof jb.comps[name].impl == 'object' && jb.utils.compName(jb.comps[name].impl))
				name = jb.utils.compName(jb.comps[name].impl)
			return (jb.comps[name] && jb.comps[name].type || '').indexOf(type) == 0
		}
	},
	async runSingleTest(testID,{doNotcleanBeforeRun, showOnlyTest,fullTestId} = {}) {
		const tstCtx = (jb.ui ? jb.ui.extendWithServiceRegistry() : new jb.core.jbCtx())
			.setVars({ testID, fullTestId,singleTest: jb.test.singleTest })
		const start = new Date().getTime()
		await !doNotcleanBeforeRun && jb.test.cleanBeforeRun()
		jb.log('start test',{testID})
		const res = await tstCtx.run({$:fullTestId})
		res.duration = new Date().getTime() - start
		jb.log('end test',{testID,res})
		if (!jb.test.singleTest)
			await jb.jbm.terminateAllChildren(tstCtx)
		jb.ui && jb.ui.garbageCollectUiComps({forceNow: true,clearAll: true ,ctx: tstCtx})

		res.show = () => {
			const profile = jb.comps[fullTestId]
			if (!profile.impl.control) return
			const doc = jb.frame.document
			if (!doc) return
			const ctxToRun = jb.ui.extendWithServiceRegistry(new jb.core.jbCtx(tstCtx,{ profile: profile.impl.control , forcePath: fullTestId+ '~impl~control', path: '' } ))
			const elem = doc.createElement('div')
			elem.className = 'show elemToTest'
			if (showOnlyTest)
				doc.body.innerHTML = ''
			doc.body.appendChild(elem)
			jb.ui.render(jb.ui.h(ctxToRun.runItself()),elem)    
		}		
		return res
	},
	async runTests({testType,specificTest,show,pattern,notPattern,take,remoteTests,repo,showOnlyTest,top,coveredTestsOf}) {
		const {pipe, fromIter, subscribe,concatMap, fromPromise } = jb.callbag 
		let index = 1

		jb.test.initial_resources = JSON.stringify(jb.db.resources) //.replace(/\"\$jb_id":[0-9]*,/g,'')
		jb.test.initial_comps = jb.watchableComps && jb.watchableComps.handler && jb.watchableComps.handler.resources()
		jb.test.coveredTests = {}
		jb.entries(jb.comps).forEach(e=>{
			(jb.path(e[1].impl,'covers') || []).forEach(test=>{
				jb.test.coveredTests[test] = jb.test.coveredTests[test] || []
				jb.test.coveredTests[test].push(e[0])
			})
		})

		let tests = jb.entries(jb.comps)
			 .map(([id,comp]) => [id.split('test<>').pop(),comp,id])
			.filter(e=>typeof e[1].impl == 'object')
			.filter(e=>e[1].type != 'test') // exclude the testers
			.filter(e=>jb.path(e[1],[jb.core.CT,'dslType']) == 'test<>')
			.filter(e=>!testType || e[1].impl.$ == testType)
			.filter(e=>!specificTest || e[0] == specificTest)
	//		.filter(e=> !e[0].match(/throw/)) // tests that throw exceptions and stop the debugger
			.filter(e=>!pattern || e[0].match(pattern))
			.filter(e=>!notPattern || !e[0].match(notPattern))
			.filter(e => e[0] == specificTest || (
				(coveredTestsOf || !jb.test.coveredTests[e[0]])
				&& (!coveredTestsOf || (jb.comps[coveredTestsOf].impl.covers || []).includes(e[0]) || e[0] == coveredTestsOf)
				&& jb.path(e[1].impl,'expectedResult') !== true
				&& !jb.path(e[1],'doNotRunInTests')
			))
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
				jbm: worker({sourceCode: project('studio')}), 
				tests: () => tests.map(e=>e[0]), rootElemId: 'remoteTests'})
			return
		}

		document.body.innerHTML = `<div style="font-size: 20px"><div id="progress"></div><span id="fail-counter" onclick="jb.test.hide_success_lines()"></span><span id="success-counter"></span><span>, total ${tests.length}</span><span id="time"></span><span id="memory-usage"></span></div>`;
		let counter = 0
		return pipe(
			fromIter(tests),
			concatMap(e => fromPromise((async () => {
				counter++
				if (counter % 100 == 0)
					await jb.delay(500) // gc
				if (e[1].impl.timeout && e[1].impl.timeout > 1000)
					await jb.delay(5)
				const testID = e[0], fullTestId = e[2]
				//if (testID == 'previewTest.childJbm') debugger
				document.getElementById('progress').innerHTML = `<div id=${testID}>${index++}: ${testID} started</div>`
				await jb.delay(1)
				console.log('starting ' + testID )
				const res = await jb.test.runSingleTest(testID,{showOnlyTest, fullTestId })
				console.log('end      ' + testID, res)
				document.getElementById('progress').innerHTML = `<div id=${testID}>${testID} finished</div>`
				return { ...res, fullTestId, testID}
			})() )),
			subscribe(res=> {
				res.success ? jb.test.success_counter++ : jb.test.fail_counter++;
				jb.test.usedJSHeapSize = (jb.path(jb.frame,'performance.memory.usedJSHeapSize' || 0) / 1000000)
				jb.test.updateTestHeader(jb.frame.document, jb.test)

				jb.test.addHTML(document.body, jb.test.testResultHtml(res, repo), {beforeResult: jb.test.singleTest && res.renderDOM});
				if (!res.renderDOM && show) res.show()
				if (jb.ui && tests.length >1) {
					jb.cbLogByPath = {}
					jb.frame.scrollTo(0,0)
				}
		}))
  	},
	testResultHtml(res, repo) {
		const baseUrl = jb.frame.location.href.split('/tests.html')[0]
		const {fullTestId, success, duration, reason, testID} = res
		const testComp = jb.comps[fullTestId]
		const location = testComp[jb.core.CT].location || {}
		const sourceCode = JSON.stringify(jb.exec(typeAdapter('source-code<loader>', test({
			filePath: () => location.path, repo: () => location.repo
		}))))
		const studioUrl = `http://localhost:8082/project/studio/${fullTestId}/${fullTestId}?sourceCode=${encodeURIComponent(sourceCode)}`
		const _repo = repo ? `&repo=${repo}` : ''
		const coveredTests = testComp.impl.covers ? `<a href="${baseUrl}/tests.html?coveredTestsOf=${testID}${_repo}">${testComp.impl.covers.length} dependent tests</a>` : ''
		return `<div class="${success ? 'success' : 'failure'}">
			<a href="${baseUrl}/tests.html?test=${testID}${_repo}&show&spy=${jb.spy.spyParamForTest(testID)}" style="color:${success ? 'green' : 'red'}">${testID}</a>
			<span> ${duration}mSec</span> 
			${coveredTests}
			<a class="test-button" href="javascript:jb.test.goto_editor('${testID}','${repo||''}')">src</a>
			<a class="test-button" href="${studioUrl}">studio</a>
			<a class="test-button" href="javascript:jb.test.profileSingleTest('${fullTestId}')">profile</a>
			<span>${reason||''}</span>
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

component('source.testsResults', {
  type: 'rx<>',
  params: [
    {id: 'tests', as: 'array'},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()}
  ],
  impl: source.remote({
    rx: rx.pipe(
      source.data('%$tests%'),
	  rx.var('fullTestId','test<>%%'),
      rx.var('testID'),
      rx.concatMap(
        source.merge(
          source.data(obj(prop('id', '%%'), prop('started', 'true'))),
          rx.pipe(source.promise(({},{testID,fullTestId}) => jb.test.runSingleTest(testID,{fullTestId})))
        )
      )
    ),
    jbm: '%$jbm%'
  })
})

component('tests.batchRunner', {
  params: [
    {id: 'tests', as: 'array'},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()}
  ],
  impl: pipe(rx.pipe(source.testsResults('%$tests%', '%$jbm%')))
})

component('tests.runner', {
  type: 'action<>',
  params: [
    {id: 'tests', as: 'array'},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()},
    {id: 'rootElemId', as: 'string'}
  ],
  impl: runActions(
    Var('rootElem', ({},{},{rootElemId}) => jb.frame.document.getElementById(rootElemId)),
    ({},{rootElem},{tests}) => rootElem.innerHTML = `<div style="font-size: 20px"><div id="progress"></div><span id="fail-counter" onclick="jb.test.hide_success_lines()"></span><span id="success-counter"></span><span>, total ${tests.length}</span><span id="time"></span><span id="memory-usage"></span></div>`,
    rx.pipe(
      source.testsResults('%$tests%', '%$jbm%'),
      rx.resource('acc', () => ({ index: 0, success_counter: 0, fail_counter: 0, startTime: new Date().getTime() })),
      rx.var('testID', '%id%'),
      rx.do(({data},{acc, testID, rootElem}) => {
				rootElem.querySelector('#progress').innerHTML = `<div id=${testID}>${acc.index++}: ${testID} ${data.started?'started':'finished'}</div>`
				if (!data.started) {
					data.success ? acc.success_counter++ : acc.fail_counter++;
					jb.test.addHTML(rootElem, jb.test.testResultHtml(data))
					jb.test.updateTestHeader(rootElem,acc)
				}
			}),
      sink.action(()=>{})
    )
  )
})

component('test', {
  type: 'source-code<loader>',
  params: [
    {id: 'filePath', as: 'string'},
    {id: 'repo', as: 'string'}
  ],
  impl: sourceCode(pluginsByPath('%$filePath%', true), plugins('testing,probe-preview,tree-shake,tgp,workspace'), {
    pluginPackages: [
      defaultPackage(),
      jbStudioServer('%$repo%')
    ]
  })
})

component('tester.runTestsOfPlugin', {
  params: [
    {id: 'plugin', as: 'string'},
    {id: 'tests', as: 'array', description: 'empty means all'},
  ],
  impl: async (ctx,plugin,test) => {
	const tests = jb.entries(jb.comps)
		.filter(([id,comp]) => jb.path(comp,[jb.core.CT,'plugin','id']) == plugin+'-tests' 
			&& jb.path(comp,[jb.core.CT,'dslType']) == 'test' && comp.type != 'test')
		.filter(([id,comp]) => jb.path(comp,'impl.$') != 'uiFrontEndTest').map(([id]) => id)
	const testResults = []
	await tests.reduce(async (pr,testID) => {
		await pr
		console.log(`starting test ${testID}`)
		const res = await jb.test.runSingleTest(testID)
		console.log(`test ${testID} ${res.success}`)
		testResults.push(res)
	}, Promise.resolve())
	testResults.forEach(t=>delete t.show)
	return { tests, testResults }
  }
})

component('testServer', {
  type: 'source-code<loader>',
  params: [
    {id: 'plugin', as: 'string'},
    {id: 'repo', as: 'string'}
  ],
  impl: sourceCode(plugins('%$plugin%,%$plugin%-tests,testing'), {
    pluginPackages: [
      defaultPackage(),
      jbStudioServer('%$repo%')
    ]
  })
})

component('testServer.runTestsOfPlugin', {
  params: [
    {id: 'plugin', as: 'string'},
    {id: 'tests', as: 'array', description: 'empty means all'},
  ],
  impl: remote.data(tester.runTestsOfPlugin('%$plugin%','%$test%'), cmd(testServer('%$plugin%'),{doNotStripResult: true}))
})

component('pluginTest.common', {
	doNotRunInTests: true,
	impl: dataTest(tester.runTestsOfPlugin('common'), equals('1,2'))
})

component('testServer.ui', {
	doNotRunInTests: true,
	impl: dataTest(testServer.runTestsOfPlugin('ui'), equals('1,2'))
})

component('PROJECTS_PATH', { passiveData : '/home/shaiby/projects' // 'c:/projects' 
})