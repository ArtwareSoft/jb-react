dsl('test')

// uiAction works in both uiTest and uiFrontEndTest. 
// uiAction uses ctx.vars.elemToTest to decide whether to return a sourceCb of events (uiTest) or promise (uiFETest)

extension('test','uiActions', {
  activateFEHandlers(elem,type,ev,ctx) {
    const currentTarget = [elem, ...jb.ui.parents(elem)].find(x=>jb.path(x.handlers,type))
    if (currentTarget)
      (jb.path(currentTarget.handlers,type) || []).forEach(h=>h({...ev,currentTarget}))
    else
      jb.log(`uiTest can not find event handler for ${type}`,{elem,ev,ctx})
    return Promise.resolve()
  }
})

component('action', {
  type: 'ui-action',
  params: [
    {id: 'action', type: 'action', dynamic: true },
  ],
  impl: '%$action()%'
})

component('waitFor', {
  type: 'ui-action',
  params: [
    {id: 'check', dynamic: true},
    {id: 'logOnError', as: 'string', dynamic: true},
  ],
  impl: action(waitFor({check: '%$check()%', logOnError: '%$logOnError()%'}))
})

component('delay', {
  type: 'ui-action',
  params: [
    {id: 'mSec', as: 'number', defaultValue: 1},
  ],
  impl: action(delay('%$mSec%'))
})

component('writeValue', {
  type: 'ui-action',
  params: [
    {id: 'to', as: 'ref', mandatory: true},
    {id: 'value', mandatory: true},
  ],
  impl: action(writeValue('%$to%','%$value%'))
})

component('uiActions', {
  type: 'ui-action',
  params: [
    {id: 'actions', type: 'ui-action[]', ignore: true, composite: true, mandatory: true}
  ],
  impl: ctx => {
    const isFE = ctx.vars.elemToTest
    const ctxToUse = ctx.setVars({updatesCounterAtBeginUIActions: jb.ui.testUpdateCounters[ctx.vars.widgetId], logCounterAtBeginUIActions: jb.path(jb.spy,'logs.length')})
    if (isFE) return jb.asArray(ctx.profile.actions).filter(x=>x).reduce((pr,action,index) =>
				pr.finally(function runActions() {return ctxToUse.runInner(action, { as: 'single'}, `items~${index}` ) })
			,Promise.resolve())

    return (start, sink) => {
      let index = -1, talkback, currSrc, finished
      if (start != 0) return

      function nextSource() {
        index++;
        //jb.log('uiActions nextSource',{ctx,index})
        if (ctx.profile.actions.length <= index) {
          finished = true
          sink(2)
        }
        if (finished) return

        const action = ctx.profile.actions[index]
        currSrc = action && ctxToUse.runInner(action, { as: 'single'}, `items~${index}` )
        jb.log('uiActions calc next source',{action, ctx,currSrc, index})
        if (!currSrc)
          nextSource()
        else if (jb.utils.isPromise(currSrc)) {
          Promise.resolve(currSrc).then(() => {
            currSrc = null
            nextSource()
          })
        } else if (currSrc.$ == 'userRequest') {
          sink(1,ctx.dataObj(currSrc))
          nextSource()
        } else if (jb.callbag.isCallbag(currSrc)) {
          currSrc(0, (t,d) => {
            if (t == 0) {
              talkback = d
              talkback(1,null)
            }
            if (t == 1 && d && !finished)
              sink(1,d)
            if (t == 2)
              nextSource()
          })
        } else {
          nextSource()
        }
      }

      sink(0, (t,d) => {
        if (t == 1 && !d && currSrc && jb.callbag.isCallbag(currSrc))
           currSrc(1,null)
        if (t == 2) {
          finished = true
          currSrc && currSrc(2,d)
          currSrc = null
        }
      })
      nextSource()
    }
  }
})

component('waitForText', {
  type: 'ui-action',
  params: [
    {id: 'text', as: 'string' },
  ],
  impl: waitFor((ctx,{},{text}) => {
    const body = jb.ui.widgetBody(ctx.setVars({headlessWidget: false})) // look at FE
    const lookin = typeof body.outerHTML == 'function' ? body.outerHTML() : body.outerHTML
    return lookin.indexOf(text) != -1
  })
})

component('waitForSelector', {
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string'}
  ],
  impl: waitFor(
    (ctx,{elemToTest, useFrontEndInTest},{selector}) => {
    const ctxToUse = useFrontEndInTest ? ctx.setVars({headlessWidget: false}) : ctx
    const elem = jb.ui.elemOfSelector(selector,ctxToUse)

  //  const elem = jb.ui.elemOfSelector(selector,ctx)
    const cmpElem = elem && jb.ui.closestCmpElem(elem)
    if (!cmpElem) return false
    // if FETest, wait for the frontEnd cmp to be in ready state
    return !elemToTest || !cmpElem.getAttribute('interactive') || jb.path(cmpElem,'_component.state.frontEndStatus') == 'ready'
  },
    'uiTest waitForSelector failed. selector %$selector%'
  )
})

component('waitForCmpUpdate', {
  type: 'ui-action',
  params: [
    {id: 'cmpVer', as: 'number', defaultValue: 2 },
  ],
  impl: waitForSelector('[cmp-ver=\"%$cmpVer%\"]')
})

component('waitForNextUpdate', {
  type: 'ui-action',
  params: [
    {id: 'expectedCounter', as: 'number', defaultValue: 0, description: '0 means next' },
  ],
  impl: (ctx,expectedCounter) => jb.ui.renderingUpdates && new Promise(resolve => {
    if (ctx.vars.elemToTest) return resolve() // maybe should find the widget
    const startTime = new Date().getTime()
    let done = false
    const { updatesCounterAtBeginUIActions, useFrontEndInTest, widgetId} = ctx.vars
    const widget = jb.ui.headless[widgetId] || jb.ui.FEEmulator[widgetId]
    if (!widget) {
      jb.logError('uiTest waitForNextUpdate can not find widget',{ctx, widgetId})
      return resolve()
    }    
    const currentCounter = jb.ui.testUpdateCounters[widgetId] || 0
    const baseCounter = updatesCounterAtBeginUIActions != null ? updatesCounterAtBeginUIActions : currentCounter
    if (expectedCounter == 0)
      expectedCounter = baseCounter + 1

    jb.log(`uiTest waitForNextUpdate started`,{ctx, currentCounter, expectedCounter, baseCounter})
    if (currentCounter >= expectedCounter) {
      jb.log('uiTest waitForNextUpdate resolved - counter already reached',{ctx, currentCounter, expectedCounter, baseCounter})
      return resolve() 
    }
    const renderingUpdates = ctx.vars.testRenderingUpdate

    const userRequestSubject = useFrontEndInTest && jb.callbag.subscribe(userRequest => {
      if (done) return
      done = true
      userRequestSubject.dispose()
      jb.delay(1).then(() => {
        const waitTime = new Date().getTime() - startTime
        jb.log(`uiTest waitForNextUpdate done by userRequest after ${waitTime}mSec`, {ctx, userRequest, currentCounter, expectedCounter, baseCounter})
        resolve()
      })
    })(jb.ui.widgetUserRequests)

    const renderingUpdatesSubject = jb.callbag.subscribe(renderingUpdate => {
      if (done) return
      const currentCounter = jb.ui.testUpdateCounters[widgetId] || 0
      jb.log(`waitForNextUpdate checking ${currentCounter}`,{ctx, currentCounter, expectedCounter, baseCounter})

      if (renderingUpdate.widgetId == widgetId && currentCounter >= expectedCounter) {
        done = true
        renderingUpdatesSubject.dispose()
        jb.delay(1).then(() => {
          const waitTime = new Date().getTime() - startTime
          jb.log(`uiTest waitForNextUpdate counter reached after ${waitTime}mSec`, {ctx, currentCounter, expectedCounter, baseCounter})
          resolve()
        })
      }
    })(renderingUpdates)
  })
})

component('setText', {
  type: 'ui-action',
  params: [
    {id: 'value', as: 'string', mandatory: true},
    {id: 'selector', as: 'string', defaultValue: 'input,textarea'},
    {id: 'doNotWaitForNextUpdate', as: 'boolean', type: 'boolean'}
  ],
  impl: uiActions(
    waitForSelector('%$selector%'),
    (ctx,{elemToTest},{value,selector}) => {
          const currentTarget = selector ? jb.ui.elemOfSelector(selector,ctx) : elemToTest;
          jb.ui.findIncludeSelf(currentTarget,'input,textarea').forEach(e=>e.value= value)
          const widgetId = jb.ui.parentWidgetId(currentTarget) || ctx.vars.widgetId
          const ev = { type: 'blur', currentTarget, widgetId, target: {value}}
          jb.log('uiTest setText',{ev,currentTarget,selector,ctx})
          if (elemToTest) 
            jb.ui.handleCmpEvent(ev)
          else
            return jb.ui.rawEventToUserRequest(ev,{ctx})
      },
    If(
      '%$useFrontEndInTest%',
      uiActions(delay(1), FEUserRequest(), If(not('%$doNotWaitForNextUpdate%'), waitForNextUpdate()))
    ),
    If(
      and(not('%$useFrontEndInTest%'), not('%$remoteUiTest%'), not('%$doNotWaitForNextUpdate%')),
      waitForNextUpdate()
    )
  )
})

component('click', {
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string', defaultValue: 'button'},
    {id: 'methodToActivate', as: 'string'},
    {id: 'doNotWaitForNextUpdate', as: 'boolean', type: 'boolean'},
    {id: 'doubleClick', as: 'boolean', type: 'boolean'},
    {id: 'expectedEffects', type: 'ui-action-effects'}
  ],
  impl: uiActions(
    Var('originatingUIAction', 'click{? at %$selector%?}'),
    waitForSelector('%$selector%'),
    (ctx,{elemToTest, useFrontEndInTest},{selector, methodToActivate, doubleClick, expectedEffects}) => {
      const type = doubleClick ? 'dblclick' : 'click'
      const ctxToUse = useFrontEndInTest ? ctx.setVars({headlessWidget: false}) : ctx
      const elem = selector ? jb.ui.elemOfSelector(selector,ctxToUse) : elemToTest
      jb.log('uiTest uiAction click',{elem,selector,ctx})
      if (!elem) 
        return jb.logError(`click can not find elem ${selector}`, {ctx,elemToTest} )
      expectedEffects && expectedEffects.setLogs()
      const widgetId = jb.ui.parentWidgetId(elem) || ctx.vars.widgetId
      const ev = { type, currentTarget: elem, widgetId, target: elem }
      if (!elemToTest && !useFrontEndInTest) 
        return jb.ui.rawEventToUserRequest(ev, {specificMethod: methodToActivate, ctx})
      if (!elemToTest && useFrontEndInTest)
        return jb.test.activateFEHandlers(elem,type,ev,ctx)

      if (elemToTest) 
        elem.click()
      else
        return jb.ui.rawEventToUserRequest({ type, target: elem, currentTarget: elem, widgetId}, {specificMethod: methodToActivate, ctx})
    },
    If(
      '%$useFrontEndInTest%',
      uiActions(delay(1), FEUserRequest(), If(not('%$doNotWaitForNextUpdate%'), waitForNextUpdate()))
    ),
    If(
      and(not('%$useFrontEndInTest%'), not('%$remoteUiTest%'), not('%$doNotWaitForNextUpdate%')),
      waitForNextUpdate()
    ),
    If('%$expectedEffects%', '%$expectedEffects/check()%')
  )
})
  
component('keyboardEvent', {
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'type', as: 'string', options: 'keypress,keyup,keydown,blur'},
    {id: 'keyCode', as: 'number'},
    {id: 'keyChar', as: 'string'},
    {id: 'ctrl', as: 'string', options: ['ctrl','alt']},
    {id: 'doNotWaitForNextUpdate', as: 'boolean', type: 'boolean'}
  ],
  impl: uiActions(
    waitForSelector('%$selector%'),
    (ctx,{elemToTest, useFrontEndInTest},{selector,type,keyCode,keyChar,ctrl}) => {
      const ctxToUse = useFrontEndInTest ? ctx.setVars({headlessWidget: false}) : ctx
      const elem = selector ? jb.ui.elemOfSelector(selector,ctxToUse) : elemToTest
      jb.log('uiTest uiAction keyboardEvent',{elem,selector,type,keyCode,ctx})
      if (!elem)
        return jb.logError('can not find elem for test uiAction keyboardEvent',{ elem,selector,type,keyCode,ctx})

      const widgetId = jb.ui.parentWidgetId(elem) || ctx.vars.widgetId
      const ev = { widgetId, type, keyCode , ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt', key: keyChar, target: elem, currentTarget: elem}
      if (!elemToTest && !useFrontEndInTest) 
        return jb.ui.rawEventToUserRequest(ev, {ctx})
      if (!elemToTest && useFrontEndInTest) {
        elem.value = elem.value || ''
        if (type == 'keyup')
          elem.value += keyChar
        return jb.test.activateFEHandlers(elem,type,ev,ctx)
      }
    
      if (keyChar && type == 'keyup')
        elem.value = elem.value + keyChar
      const e = new KeyboardEvent(type,{ ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt', key: keyChar })
      Object.defineProperty(e, 'keyCode', { get : _ => keyChar ? keyChar.charCodeAt(0) : keyCode })
      Object.defineProperty(e, 'target', { get : _ => elem })
      elem.dispatchEvent(e)
    },
    If('%$useFrontEndInTest%', uiActions(delay(1), FEUserRequest(), If(not('%$doNotWaitForNextUpdate%'), waitForNextUpdate()))),
    If(
      and(not('%$useFrontEndInTest%'), not('%$remoteUiTest%'), not('%$doNotWaitForNextUpdate%')),
      waitForNextUpdate()
    )    
    // If(or('%$remoteUiTest%','%$useFrontEndInTest%', '%$doNotWaitForNextUpdate%'), '', waitForNextUpdate()),
    // If('%$useFrontEndInTest%', FEUserRequest()),
  )
})

component('changeEvent', {
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'value', as: 'string'},
    {id: 'doNotWaitForNextUpdate', as: 'boolean', type: 'boolean'}
  ],
  impl: uiActions(
    waitForSelector('%$selector%'),
    (ctx,{elemToTest, useFrontEndInTest},{selector, value}) => {
      const type = 'change'
      const ctxToUse = useFrontEndInTest ? ctx.setVars({headlessWidget: false}) : ctx
      const elem = selector ? jb.ui.elemOfSelector(selector,ctxToUse) : elemToTest
      jb.log('uiTest uiAction changeEvent',{elem,selector,type,ctx})
      if (!elem)
        return jb.logError('can not find elem for test uiAction keyboardEvent',{ elem,selector,type,ctx})

      const widgetId = jb.ui.parentWidgetId(elem) || ctx.vars.widgetId
      const ev = { widgetId, type, target: elem, currentTarget: elem }
      if (!elemToTest && !useFrontEndInTest) 
        return jb.ui.rawEventToUserRequest(ev, {ctx})
      if (!elemToTest && useFrontEndInTest) {
        elem.value = value
        return jb.test.activateFEHandlers(elem,type,ev,ctx)
      }
    
      const e = new Event(type)
      Object.defineProperty(e, 'target', { get : _ => elem })
      elem.dispatchEvent(e)
    },
    If('%$useFrontEndInTest%', uiActions(delay(1), FEUserRequest(), If(not('%$doNotWaitForNextUpdate%'), waitForNextUpdate()))),
    If(
      and(not('%$useFrontEndInTest%'), not('%$remoteUiTest%'), not('%$doNotWaitForNextUpdate%')),
      waitForNextUpdate()
    )    
    // If(or('%$remoteUiTest%','%$useFrontEndInTest%', '%$doNotWaitForNextUpdate%'), '', waitForNextUpdate()),
    // If('%$useFrontEndInTest%', FEUserRequest()),
  )
})

component('scrollBy', {
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'scrollBy', as: 'number'}
  ],
  impl: uiActions(
    waitForSelector('%$selector%'),
    (ctx,{elemToTest},{selector,scrollBy}) => {
      if (!elemToTest) return
      const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : elemToTest
      elem && elem.scrollBy(scrollBy,scrollBy)
      jb.log('uiTest scroll on dom',{elem,ctx})
    },
    waitForNextUpdate(),
  )
})

component('runMethod', {
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'method', as: 'string' },
    {id: 'data', defaultValue: '%%' },
    {id: 'ctxVars', as: 'single' },
    {id: 'doNotWaitForNextUpdate', as: 'boolean', type: 'boolean'}
  ],
  impl: uiActions(
    waitForSelector('%$selector%'),
    (ctx,{elemToTest},{selector,method,data,ctxVars}) => {
      if (elemToTest) return
      const elem = jb.ui.elemOfSelector(selector,ctx)
      const cmpElem = elem && jb.ui.closestCmpElem(elem)
      jb.log('uiTest run method',{method,cmpElem,elem,ctx})
      jb.ui.runBEMethodByElem(cmpElem,method,data,ctxVars ? {...ctx.vars, ...ctxVars} : ctx.vars)
    },
    If('%$doNotWaitForNextUpdate%', '', waitForNextUpdate()),
  )
})

component('FEUserRequest', {
  type: 'ui-action',
  params: [
  ],
  impl: ctx => {
    const userRequest = jb.ui.FEEmulator[ctx.vars.widgetId].userRequests.pop()
    jb.log('uiTest frontend check FEUserRequest', {ctx,userRequest})
    // if (userRequest)
    //   jb.log('uiTest frontend widgetUserRequest is played', {ctx,userRequest})
    return userRequest
  },
})

// expected effects

component('expectedEffects', {
  type: 'ui-action-effects',
  params: [
    {id: 'logsToCheck', as: 'string' },
    {id: 'effects', type: 'ui-action-effect[]', mandatory: true},
  ],
  impl: (_ctx,logsToCheck,effects) => ({
    setLogs() {
      this.originalLogs = { ... jb.spy.includeLogs }
      logsToCheck.split(',').filter(x=>x).forEach(logName=>jb.spy.includeLogs[logName] = true)
    },
    check(ctx) {
      jb.spy.includeLogs = this.originalLogs
      effects.forEach(ef=>ef.check(ctx))
    }
  })
})

component('logFired', {
  type: 'ui-action-effect',
  params: [
    {id: 'log', as: 'string', mandatory: true},
    {id: 'condition', type: 'boolean<>', dynamic: true, description: '%% is log item', mandatory: true},
    {id: 'errorMessage', as: 'string', dynamic: true },
  ],
  impl: (_ctx,log,condition,errorMessage) => ({
    check: (ctx) => {
      const logs = jb.spy.search(log,{ slice: ctx.vars.logCounterAtBeginUIActions || 0, spy: jb.spy, enrich: true })
      if (!logs.length)
        jb.logError(`can not find logs ${log} after action ${ctx.vars.originatingUIAction}`,{ctx,log})
      if (! logs.find(l=>condition(ctx.setData(l))))
        jb.logError(errorMessage(ctx) + `no log item met condition ${jb.utils.prettyPrint(condition.profile,{forceFlat:true})} after action ${ctx.vars.originatingUIAction}`,
          {logs, ctx})
    }
  })
})

component('compChange', {
  type: 'ui-action-effect',
  params: [
    {id: 'cmpId', as: 'string', mandatory: true },
    {id: 'condition', type: 'boolean<>', dynamic: true, description: '%% is cmp vdom', mandatory: true},
  ],
  impl: 5
})