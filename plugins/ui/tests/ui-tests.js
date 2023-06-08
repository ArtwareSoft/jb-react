using('remote-widget')
component('tests.main', { // needed for loading the 'virtual' tests project
	type: 'control',
	impl: text('') // dummy impl needed
})

component('fixedTestId', {
	impl: ctx => `${jb.uri}-${ctx.vars.testID.replace(/\./g,'_')}`
})

component('uiTest', {
	type: 'test',
	params: [
	  {id: 'control', type: 'control', dynamic: true, mandatory: true},
	  {id: 'runBefore', type: 'action', dynamic: true},
	  {id: 'userInput', type: 'user-input[]', as: 'array', description: 'user actions' },
	  {id: 'userInputRx', type: 'rx', dynamic: true },
	  {id: 'checkResultRx', type: 'rx' },
	  {id: 'expectedResult', type: 'boolean', dynamic: true, mandatory: true},
	  {id: 'allowError', as: 'boolean', dynamic: true},
	  {id: 'timeout', as: 'number', defaultValue: 200},
	  {id: 'cleanUp', type: 'action', dynamic: true},
	  {id: 'expectedCounters', as: 'single'},
	],
	impl: dataTest({
		vars: [
			Var('uiTest',true),
			Var('tstWidgetId', fixedTestId())
		],
		timeout: '%$timeout%',
		allowError: '%$allowError()%',
		runBefore: runActions(
			call('runBefore'), 
			rx.pipe(
				rx.merge(
					'%$userInputRx()%',
					rx.pipe(source.data('%$userInput%'),rx.delay(1))
				),
				rx.log('uiTest userInput'),
				rx.takeUntil('%$$testFinished%'),
				userInput.eventToRequest(),
				rx.filter(({data}) => data && data.$ == 'runCtxAction'),
				rx.log('uiTest userRequest'),
				sink.action(({data}) => jb.ui.widgetUserRequests.next(data))
			)
		),
		calculate: rx.pipe(
			rx.merge(
				rx.pipe(
					source.callbag(()=>jb.ui.widgetUserRequests),
					rx.takeUntil('%$$testFinished%'),
					rx.log('uiTest userRequest from widgetUserRequests'),
					widget.headless(call('control'), '%$tstWidgetId%'),
					rx.log('uiTest uiDelta from headless'),
					rx.delay(1),
				),
				'%$checkResultRx%'
			),
			rx.takeUntil('%$$testFinished%'),
			rx.var('html',uiTest.vdomResultAsHtml()),
			rx.var('success', pipeline('%$html%', call('expectedResult'), last())),
			rx.log('check uiTest result', obj(prop('success','%$success%'), prop('html','%$html%'))),
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

component('uiFrontEndTest', {
  type: 'test',
  params: [
    {id: 'control', type: 'control', dynamic: true},
    {id: 'runBefore', type: 'action', dynamic: true},
    {id: 'action', type: 'action', dynamic: true},
    {id: 'expectedResult', as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'allowError', as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'cleanUp', type: 'action', dynamic: true},
    {id: 'expectedCounters', as: 'single'},
    {id: 'renderDOM', type: 'boolean', descrition: 'render the vdom under the document dom'},
    {id: 'runInPreview', type: 'action', dynamic: true, descrition: 'not for test mode'},
    {id: 'runInStudio', type: 'action', dynamic: true, descrition: 'not for test mode'}
  ],
  impl: (_ctx,control,runBefore,action,expectedResult,allowError,cleanUp,expectedCounters,renderDOM) => {
		if (typeof document == 'undefined')
			return _ctx.run({..._ctx.profile, $: 'uiTest'})
		const {testID, singleTest} = _ctx.vars
		//return Promise.resolve({ id: testID, success: true})
		const elemToTest = document.createElement('div')
		const ctx = _ctx.setVars({elemToTest})
		elemToTest.ctxForFE = ctx
		elemToTest.setAttribute('id','jb-testResult')
		const show = new URL(jb.frame.location.href).searchParams.get('show') !== null
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

component('uiTest.vdomResultAsHtml', {
  impl: ctx => {
		const widget = jb.ui.headless[ctx.vars.tstWidgetId]
		if (!widget) return ''
		if (typeof document == 'undefined') // in worker
			return widget.body ? widget.body.outerHTML() : ''
		return widget.body.children.map(vdom => {
			const elemToTest = document.createElement('div')
			elemToTest.ctxForFE = ctx.setVars({elemToTest})
			jb.ui.render(vdom, elemToTest,{doNotRefreshFrontEnd: true})
			Array.from(elemToTest.querySelectorAll('input,textarea')).forEach(e=> e.parentNode && 
				jb.ui.addHTML(e.parentNode,`<input-val style="display:none">${e.value}</input-val>`))		
			return elemToTest.outerHTML	
		}).join('\n')
	}
})

component('uiTest.applyVdomDiff', {
  type: 'test',
  params: [
    {id: 'controlBefore', type: 'control', dynamic: true},
    {id: 'control', type: 'control', dynamic: true}
  ],
  impl: function(ctx,controlBefore,control) {
		console.log('starting ' + ctx.vars.testID)
		const show = new URL(jb.frame.location.href).searchParams.get('show') !== null

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

extension('ui','tester', {
	elemOfSelector: (selector,ctx) => {
		const widgetBody = jb.ui.widgetBody(ctx)
		return widgetBody && widgetBody.querySelector(selector) || jb.frame.document && document.querySelector('.jb-dialogs '+ selector)
	},
	cmpOfSelector: (selector,ctx) => jb.path(jb.ui.elemOfSelector(selector,ctx),'_component'),
	cssOfSelector(selector,ctx) {
		const jbClass = (jb.ui.elemOfSelector(selector,ctx).classList.value || '').split('-').pop()
		return jb.entries(jb.ui.cssSelectors_hash).filter(e=>e[1] == jbClass)[0] || ''
	}
})