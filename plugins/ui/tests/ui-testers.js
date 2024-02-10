using('remote-widget')
component('tests.main', {
  type: 'control',
  impl: text('')
})

component('uiTest', {
  type: 'test',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'expectedResult', type: 'boolean', dynamic: true, mandatory: true},
    {id: 'runBefore', type: 'action', dynamic: true},
    {id: 'uiAction', type: 'ui-action<test>', dynamic: true},
    {id: 'allowError', as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'timeout', as: 'number', defaultValue: 200},
    {id: 'cleanUp', type: 'action', dynamic: true},
    {id: 'expectedCounters', as: 'single'},
    {id: 'backEndJbm', type: 'jbm<jbm>', defaultValue: jbm.self()},
    {id: 'useFrontEnd', as: 'boolean', type: 'boolean'},
    {id: 'transactiveHeadless', as: 'boolean', type: 'boolean'},
    {id: 'engine', as: 'string'},
    {id: 'spy', as: 'string'},
    {id: 'covers'}
  ],
  impl: dataTest({
    vars: [
      Var('uiTest', true),
      Var('widgetId', widget.newId()),
      Var('headlessWidget', true),
      Var('remoteUiTest', notEquals('%$backEndJbm%', () => jb)),
      Var('headlessWidgetId', '%$widgetId%'),
      Var('useFrontEndInTest', '%$useFrontEnd%'),
      Var('transactiveHeadless', '%$transactiveHeadless%'),
      Var('testRenderingUpdate', () => jb.callbag.subject('testRenderingUpdate')),
      Var('engineForTest', '%$engine%')
    ],
    calculate: pipe(
      rx.pipe(
        typeAdapter('ui-action<test>', uiActions('%$uiAction()%')),
        rx.log('uiTest userRequest'),
        remote.operator({
          rx: widget.headless('%$control()%', '%$widgetId%', {
            transactiveHeadless: '%$transactiveHeadless%'
          }),
          jbm: '%$backEndJbm%'
        }),
        rx.do(uiTest.aggregateDelta('%%')),
        rx.var('renderingCounters', uiTest.postTestRenderingUpdate()),
        rx.log('uiTest uiDelta from headless %$renderingCounters%'),
        rx.toArray(),
        rx.map(uiTest.vdomResultAsHtml()),
        rx.do(({},{widgetId})=> !jb.test.singleTest && jb.ui.destroyHeadless(widgetId))
      ),
      first()
    ),
    expectedResult: pipeline('%all%', '%$expectedResult()%', first()),
    runBefore: runActions(uiTest.addFrontEndEmulation(), '%$runBefore()%'),
    timeout: If(equals('%$backEndJbm%', () => jb), '%$timeout%', 5000),
    allowError: '%$allowError()%',
    cleanUp: runActions(uiTest.removeFrontEndEmulation(), call('cleanUp')),
    expectedCounters: '%$expectedCounters%',
	spy: ({},{},{spy}) => spy === '' ? 'uiTests,headless' : spy
  })
})

component('uiFrontEndTest', {
  type: 'test',
  params: [
    {id: 'control', type: 'control', dynamic: true},
    {id: 'runBefore', type: 'action', dynamic: true},
    {id: 'uiAction', type: 'ui-action<test>', dynamic: true},
    {id: 'expectedResult', as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'allowError', as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'cleanUp', type: 'action', dynamic: true},
    {id: 'expectedCounters', as: 'single'},
    {id: 'renderDOM', type: 'boolean', descrition: 'render the vdom under the document dom'},
    {id: 'runInPreview', type: 'action', dynamic: true, descrition: 'not for test mode'},
    {id: 'runInStudio', type: 'action', dynamic: true, descrition: 'not for test mode'},
    {id: 'covers'}
  ],
  impl: async (_ctx,control,runBefore,uiAction,expectedResult,allowError,cleanUp,expectedCounters,renderDOM) => {
		if (typeof document == 'undefined')
			return _ctx.run({..._ctx.profile, $: 'uiTest'})
		const {testID, singleTest} = _ctx.vars
		//return Promise.resolve({ id: testID, success: true})
		const elemToTest = document.createElement('div')
		const ctx = _ctx.setVars({elemToTest})
		elemToTest.ctxForFE = ctx
		elemToTest.setAttribute('id','jb-testResult')
		const show = new URL(jb.frame.location.href).searchParams.get('show') !== null
		await runBefore()
		let error = null
		try {
			if (renderDOM) document.body.appendChild(elemToTest)
			await jb.ui.render(jb.ui.h(control(ctx)), elemToTest)
		} catch (e) {
			jb.logException(e,'error in test',{ctx})
			error = await e
		}
		await (!error && jb.utils.toSynchArray(uiAction(ctx),true))
		await jb.delay(1)
		Array.from(elemToTest.querySelectorAll('input,textarea')).forEach(e=>
			e.parentNode && jb.ui.addHTML(e.parentNode,`<input-val style="display:none">${e.value}</input-val>`))
		const reason = jb.test.countersErrors(expectedCounters,allowError)
		const resultHtml = elemToTest.outerHTML
		const expectedResultRes = expectedResult(ctx.setData(resultHtml))
		const success = !! (expectedResultRes && !reason)
		jb.log('check FE test result',{testID, success, reason, html: resultHtml})
		const result = { id: testID, success, reason, renderDOM}
		// default cleanup
		if (!show && !singleTest) {
			jb.ui.unmount(elemToTest)
			ctx.run(dialog.closeAll())
			jb.ui.destroyAllDialogEmitters()
		}
		if (renderDOM && !show && !singleTest) document.body.removeChild(elemToTest)
		await cleanUp()
		return result
	}
})

component('uiTest.vdomResultAsHtml', {
  impl: ctx => {
		const { widgetId } = ctx.vars
		const widget = jb.ui.FEEmulator[widgetId]
		const css = Object.values(jb.path(jb.ui.headless,[widgetId,'styles']) || {}).join('\n')
		const html = (!widget || !widget.body) ? '' : (typeof widget.body.outerHTML == 'function')
			? widget.body.outerHTML() : ''
		return { html, css, all : [html,css].join('\n')}
	}
})

component('uiTest.postTestRenderingUpdate', {
  impl: ctx => {
		const {widgetId} = ctx.vars
		jb.ui.testUpdateCounters[widgetId] = (jb.ui.testUpdateCounters[widgetId] || 0) + 1
		const counter = '' + jb.ui.testUpdateCounters[widgetId]
		// jb.log('postTestRenderingUpdate', {widgetId, counter, ctx }) - causing test stuck in FETest.workerPreviewTest.suggestions
		ctx.vars.testRenderingUpdate && ctx.vars.testRenderingUpdate.next({widgetId})
        return counter
	}
})

component('uiTest.addFrontEndEmulation', {
  impl: ctx => {
		const { widgetId, useFrontEndInTest} = ctx.vars
		jb.ui.FEEmulator[widgetId] = {
			userReqSubs: useFrontEndInTest && jb.callbag.subscribe(userRequest => {
				if (userRequest.$$ == 'destroy') return
				jb.log('uiTest frontend widgetUserRequest recorded', {ctx,userRequest})
				jb.ui.FEEmulator[widgetId].userRequests.push(userRequest)
			})(jb.ui.widgetUserRequests),
			userRequests: [],
			body: jb.ui.h('div',{widgetId , widgetTop:true, frontend: true}) 
		}
	}
})

component('uiTest.removeFrontEndEmulation', {
  impl: ctx => {
		const { widgetId, useFrontEndInTest} = ctx.vars
		useFrontEndInTest && jb.ui.FEEmulator[widgetId].userReqSubs.dispose()
		delete jb.ui.FEEmulator[widgetId]
		jb.ui.testUpdateCounters = {}
	}
})

component('uiTest.aggregateDelta', {
  type: 'action',
  params: [
    {id: 'renderingUpdate'}
  ],
  impl: (ctx, renderingUpdate) => {
	if (renderingUpdate.$ == 'updates')
      return renderingUpdate.updates.forEach(inner => aggDelta(inner))
    else
      return aggDelta(renderingUpdate)

    function aggDelta(renderingUpdate) {
		const {delta,css,widgetId,cmpId,elemId,classId} = renderingUpdate
		const ctxToUse = ctx.setVars({headlessWidget: false, FEwidgetId: widgetId })
		if (css)
	        return jb.ui.insertOrUpdateStyleElem(ctxToUse, css, elemId, { classId })

		const widgetBody = jb.ui.widgetBody(ctxToUse)
		const elem = cmpId ? jb.ui.find(widgetBody,`[cmp-id="${cmpId}"]`)[0] : widgetBody
		jb.log('uiTest aggregate delta',{ctx,delta,renderingUpdate,cmpId, widgetBody,elem})
		delta && jb.ui.applyDeltaToCmp({delta,ctx: ctxToUse,cmpId,elem})
	}
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
		jb.ui.applyNewVdom(elem.firstElementChild,vdom,{ctx})
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
	initExtension() {
		return { FEEmulator: {}, testUpdateCounters: {} }
	},
	elemOfSelector: (selector,ctx) => {
		const widgetBody = jb.ui.widgetBody(ctx)
		if (widgetBody)
			return widgetBody.querySelector(selector)
		return jb.frame.document && document.querySelector('.jb-dialogs '+ selector)
	},
	cmpOfSelector: (selector,ctx) => jb.path(jb.ui.elemOfSelector(selector,ctx),'_component'),
	cssOfSelector(selector,ctx) {
		const jbClass = (jb.ui.elemOfSelector(selector,ctx).classList.value || '').split('-').pop()
		return jb.entries(jb.ui.cssSelectors_hash).filter(e=>e[1] == jbClass)[0] || ''
	}
})

extension('spy','headless', {
	uiTestHeadlessIO: () => {
		let res = null
		try {
			res = jb.spy.logs.map(x=>
			x.logNames == 'uiTest uiDelta from headless' && {log: x.logNames, ...x.data }
			|| x.logNames == 'uiTest userRequest'  && {log: x.logNames, ...x.data}
			|| x.logNames == 'uiComp start renderVdom'  && {log: x.logNames, cmp: `${x.cmp.ctx.path};${x.cmp.ctx.profile.$};${x.cmp.ver}`}
		).filter(x=>x).map(x=>{delete x.ctx; delete x.assumedVdom; return x})
			.map(x=> {
				const txt = jb.utils.prettyPrint(x,{noMacros: true})
				const isReq = x.log == 'uiTest userRequest'
				return `\n${isReq ? '' : '<'}---${isReq ? '>' : ''}` + txt
			})
			.join('\n')
		} catch(e) {}

		return res || ''
	},
	headlessIO: () => {
		let res = null
		try {
			res = jb.spy.logs.map(x=>
			x.logNames == 'remote widget arrived from headless' && {log: x.logNames, ...x.data }
			|| x.logNames == 'remote widget sent to headless'  && {log: x.logNames, ...x.data}
			|| x.logNames == 'uiComp start renderVdom'  && {log: x.logNames, cmp: `${x.cmp.ctx.path};${x.cmp.ctx.profile.$};${x.cmp.ver}`}
		).filter(x=>x).map(x=>{delete x.ctx; delete x.assumedVdom; return x})
			.map(x=> {
				const txt = jb.utils.prettyPrint(x,{noMacros: true})
				const isReq = x.log == 'remote widget sent to headless'
				return `\n${isReq ? '' : '<'}---${isReq ? '>' : ''}` + txt
			})
			.join('\n')
		} catch(e) {}

		return res || ''
	}
	
})