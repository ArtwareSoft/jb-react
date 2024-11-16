dsl('test')
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

component('animationEvent', {
  type: 'ui-action',
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
    type: 'ui-action',
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