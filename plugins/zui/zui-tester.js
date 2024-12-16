dsl('zui')
using('ui-testers')

extension('test', 'zui', {
	initExtension() {
		return { animationFuncs: [] } 
	},
    requestAnimationFrame(func) {
        jb.test.animationFuncs.push(func)
    },
    triggerAnimationEvent(ctx) {
        const funcs = jb.test.animationFuncs
        jb.log(`zui activate animation events ${funcs.length}`, {funcs, ctx})
        funcs.forEach(f=>f())
    }
})

component('zuiTest', {
  type: 'test<>',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'expectedResult', type: 'boolean<>', dynamic: true, mandatory: true},
    {id: 'canvasSize', as: 'array', defaultValue: [600,600]},
    {id: 'runBefore', type: 'action<>', dynamic: true},
    {id: 'userEvents', type: 'animation_event[]'},
    {id: 'allowError', as: 'boolean', dynamic: true, type: 'boolean<>'},
    {id: 'timeout', as: 'number', defaultValue: 200},
    {id: 'cleanUp', type: 'action<>', dynamic: true},
    {id: 'expectedCounters', as: 'single'},
    {id: 'testData', dynamic: true},
    {id: 'htmlMode', as: 'boolean', type: 'boolean<>'},
    {id: 'spy'},
    {id: 'covers'}
  ],
  impl: dataTest({
    vars: [
      Var('uiTest', true),
      Var('testData', '%$testData()%', { async: true }),
      Var('widget', pipeline(
        '%$testData%',
        typeAdapter('widget<zui>', widget('%$control()%', '%$canvasSize%', { frontEnd: widgetFE({ htmlMode: '%$htmlMode%' }) }))
      )),
      Var('initwidget', '%$widget.init()%', { async: true })
    ],
    calculate: pipe('%$userEvents%','%$widget.be_cmp.processFEReq()%'),
    expectedResult: typeAdapter('data<>', pipeline('%$widget.frontEnd.cmpsData%', prettyPrint({ noMacros: true }), '%$expectedResult()%', first())),
    timeout: If(equals('%$backEndJbm%', () => jb), '%$timeout%', 5000),
    allowError: '%$allowError()%',
    expectedCounters: '%$expectedCounters%',
    spy: ({},{},{spy}) => spy === '' ? 'test,zui' : spy,
    includeTestRes: true
  })
})

component('zuiControlRunner', {
  type: 'action<>',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'testData', dynamic: true},
    {id: 'htmlMode', as: 'boolean', type: 'boolean<>'},
    {id: 'canvasSize', as: 'array', defaultValue: [600,600]},
    {id: 'styleSheet', as: 'string', newLinesInCode: true}
  ],
  impl: runActions(
    Var('testData', '%$testData()%', { async: true }),
    Var('widget', pipeline(
      '%$testData%',
      typeAdapter('widget<zui>', widget('%$control()%', '%$canvasSize%', { frontEnd: widgetFE('.elemToTest', { htmlMode: '%$htmlMode%' }) }))
    )),
    '%$widget.init()%'
  )
})

component('animationEvent', {
  type: 'animation_event',
  params: [
    {id: 'event', defaultValue: obj()},
  ],
  impl: (ctx,event) => jb.test.triggerAnimationEvent(ctx.setData(event))
})

component('zoomEvent', {
    type: 'animation_event',
    params: [
      {id: 'zoom', as: 'number'},
      {id: 'center', as: 'array'},
    ],
    impl: animationEvent(({},{},{zoom,center}) => ({
        ...(isNaN(zoom) ? {} : { zoom, tZoom: zoom}),
        ...(center ? {}: { center, tCenter: center})
    }))
})

component('animationEvent', {
  type: 'ui-action<test>',
  params: [
    {id: 'cmpState', defaultValue: obj()},
    {id: 'selector', as: 'string', defaultValue: 'canvas'},
    {id: 'expectedEffects', type: 'ui-action-effects'}
  ],
  impl: uiActions(
    Var('originatingUIAction', 'animationEvent{? at %$selector%?}'),
    waitForSelector('%$selector%'),
    (ctx,{elemToTest, emulateFrontEndInTest},{selector, cmpState, expectedEffects}) => {
      if (!emulateFrontEndInTest)
        return jb.logError(`animationEvent requires emulateFrontEnd to be set in test`, {ctx} )

      const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : elemToTest
      const cmpElem = elem && jb.ui.closestCmpElem(elem)
      jb.log(`uiTest uiAction animationEvent zoom: ${cmpState.zoom}`,{cmpState, cmpElem,elem,selector,ctx})
      if (!cmpElem) 
        return jb.logError(`animationEvent can not find elem ${selector}`, {ctx,elemToTest} )
      expectedEffects && expectedEffects.setLogs()
      cmpElem._component && Object.assign(cmpElem._component.state, cmpState)
      jb.test.triggerAnimationEvent(ctx)
    },
    waitForNextUpdate(),
    If('%$expectedEffects%', '%$expectedEffects/check()%')
  )
})

component('zoomEvent', {
    type: 'ui-action<test>',
    params: [
      {id: 'zoom', as: 'number'},
      {id: 'center', as: 'array'},
      {id: 'selector', as: 'string', defaultValue: 'canvas'},
    ],
    impl: animationEvent(({},{},{zoom,center}) => ({
        ...(isNaN(zoom) ? {} : { zoom, tZoom: zoom}),
        ...(center ? {}: { center, tCenter: center})
    }))
})  