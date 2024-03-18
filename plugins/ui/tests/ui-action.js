dsl('test')

// uiAction works in both uiTest and browserTest. 
// uiAction uses ctx.vars.elemToTest to decide whether to return a sourceCb of events (uiTest) or promise (uiFETest)

extension('test','uiActions', {
  activateFEHandlers(elem,type,ev,ctx) {
    //elem._component && elem._component.enrichUserEvent(ev)
    const { emulateFrontEndInTest } = ctx.vars
    if (!emulateFrontEndInTest)
      return jb.ui.rawEventToUserRequest(ev,{ctx})

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
    {id: 'action', type: 'action<>', dynamic: true},
    {id: 'FEContext', as: 'boolean', type: 'boolean<>', byName: true}
  ],
  impl: (ctx,action,FEContext) => action(ctx.setVars({headlessWidget: !FEContext, headlessWidgetId: FEContext ? '' : ctx.vars.widgetId}))
})

component('waitFor', {
  type: 'ui-action',
  params: [
    {id: 'check', dynamic: true},
    {id: 'logOnError', as: 'string', dynamic: true}
  ],
  impl: action({
    action: waitFor('%$check()%', {
      timeout: firstSucceeding('%$uiActionsTimeout%',3000),
      logOnError: '%$logOnError()%'
    }),
    FEContext: true
  })
})

component('waitForPromise', {
  type: 'ui-action',
  params: [
    {id: 'promise', dynamic: true},
  ],
  impl: (ctx,promise) => promise()
})

component('delay', {
  type: 'ui-action',
  params: [
    {id: 'mSec', as: 'number', defaultValue: 1}
  ],
  impl: action(delay('%$mSec%'))
})

component('writeValue', {
  type: 'ui-action',
  params: [
    {id: 'to', as: 'ref', mandatory: true},
    {id: 'value', mandatory: true}
  ],
  impl: action(writeValue('%$to%', '%$value%'))
})

component('uiActions', {
  type: 'ui-action',
  params: [
    {id: 'actions', type: 'ui-action[]', ignore: true, composite: true, mandatory: true},
  ],
  impl: ctx => {
    const isFE = ctx.vars.elemToTest
    const ctxToUse = ctx.setVars({
      updatesCounterAtBeginUIActions: jb.ui.testUpdateCounters[ctx.vars.widgetId], logCounterAtBeginUIActions: jb.path(jb.spy,'logs.length')
    })
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
        try {
          currSrc = action && ctxToUse.runInner(action, { as: 'single'}, `items~${index}` )
        } catch(e) {
            jb.log(`uiActions exception ${e.toString()}`,{action, ctx, index})
            finished = true
            sink(2)
            return
        }
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
    {id: 'text', as: 'string'}
  ],
  impl: waitFor((ctx,{},{text}) => {
    const body = jb.ui.widgetBody(ctx)
    const lookin = typeof body.outerHTML == 'function' ? body.outerHTML() : body.outerHTML
    return lookin.indexOf(text) != -1
  })
})

component('waitForSelector', {
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string'}
  ],
  impl: waitFor({
    check: (ctx,{elemToTest, emulateFrontEndInTest},{selector}) => {
    const elem = jb.ui.elemOfSelector(selector,ctx)
    const cmpElem = elem && jb.ui.closestCmpElem(elem)
    if (!cmpElem) return false
    // if FETest, wait for the frontEnd cmp to be in ready state
    return !elemToTest || !cmpElem.getAttribute('interactive') || jb.path(cmpElem,'_component.state.frontEndStatus') == 'ready'
  },
    logOnError: 'uiTest waitForSelector failed. selector %$selector%'
  })
})

component('waitForCmpUpdate', {
  type: 'ui-action',
  params: [
    {id: 'cmpVer', as: 'number', defaultValue: 2}
  ],
  impl: waitForSelector('[cmp-ver="%$cmpVer%"]')
})

component('waitForNextUpdate', {
  type: 'ui-action',
  params: [
    {id: 'expectedCounter', as: 'number', defaultValue: 0, description: '0 means next'}
  ],
  impl: (ctx,expectedCounter) => jb.ui.renderingUpdates && new Promise(resolve => {
    if (ctx.vars.elemToTest) return resolve() // maybe should find the widget
    const startTime = new Date().getTime()
    let done = false
    const { updatesCounterAtBeginUIActions, widgetId} = ctx.vars
    const widget = jb.ui.headless[widgetId] || jb.ui.FEEmulator[widgetId] 
    if (!widget) {
      jb.logError('uiTest waitForNextUpdate can not find widget',{ctx, widgetId})
      return resolve()
    }    
    const currentCounter = jb.ui.testUpdateCounters[widgetId] || 0
    const baseCounter = updatesCounterAtBeginUIActions != null ? updatesCounterAtBeginUIActions : currentCounter
    if (expectedCounter == 0)
      expectedCounter = baseCounter + 1

    jb.log(`uiTest waitForNextUpdate started`,{ctx, currentCounter, expectedCounter, widgetId, baseCounter})
    if (currentCounter >= expectedCounter) {
      jb.log('uiTest waitForNextUpdate resolved - counter already reached',{ctx, currentCounter, expectedCounter, baseCounter})
      return resolve() 
    }
    const renderingUpdates = ctx.vars.testRenderingUpdate

    const userRequestSubject = jb.callbag.subscribe(userRequest => {
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
        const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : elemToTest
        jb.ui.findIncludeSelf(elem,'input,textarea').forEach(e=>e.value= value)
        const widgetId = jb.ui.parentWidgetId(elem) || ctx.vars.widgetId
        const type = 'blur'
        const ev = { type, currentTarget: elem, widgetId, target: {value}}
        jb.log('uiTest setText',{ev,elem,selector,ctx})
        if (elemToTest) {
          jb.ui.handleCmpEvent(ev)
        } else {
          //elem.attributes.value = value
          return jb.test.activateFEHandlers(elem,type,ev,ctx)
        }
    },
    If('%$emulateFrontEndInTest%', uiActions(delay(1), FEUserRequest(), If(not('%$doNotWaitForNextUpdate%'), waitForNextUpdate()))),
    If(and(not('%$emulateFrontEndInTest%'), not('%$remoteUiTest%'), not('%$doNotWaitForNextUpdate%')), waitForNextUpdate())
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
    (ctx,{elemToTest, emulateFrontEndInTest},{selector, methodToActivate, doubleClick, expectedEffects}) => {
      const type = doubleClick ? 'dblclick' : 'click'
      const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : elemToTest
      jb.log('uiTest uiAction click',{elem,selector,ctx})
      if (!elem) 
        return jb.logError(`click can not find elem ${selector}`, {ctx,elemToTest} )
      expectedEffects && expectedEffects.setLogs()
      const widgetId = jb.ui.parentWidgetId(elem) || ctx.vars.widgetId
      const ev = { type, currentTarget: elem, widgetId, target: elem }
      if (!elemToTest && !emulateFrontEndInTest)
        return jb.ui.rawEventToUserRequest({ type, target: elem, currentTarget: elem, widgetId}, {specificMethod: methodToActivate, ctx})

      if (elemToTest) 
        elem.click()
      else
        return jb.test.activateFEHandlers(elem,type,ev,ctx)
    },
    If('%$emulateFrontEndInTest%', uiActions(delay(1), FEUserRequest(), If(not('%$doNotWaitForNextUpdate%'), waitForNextUpdate()))),
    If(and(not('%$emulateFrontEndInTest%'), not('%$remoteUiTest%'), not('%$doNotWaitForNextUpdate%')), waitForNextUpdate()),
    If('%$expectedEffects%', '%$expectedEffects/check()%')
  )
})

component('selectTab', {
  type: 'ui-action',
  params: [
    {id: 'tabName', as: 'string'},
  ],
  impl: click('[tabname="%$tabName%"]')
})
  
component('keyboardEvent', {
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'type', as: 'string', options: 'keypress,keyup,keydown,blur'},
    {id: 'keyCode', as: 'number'},
    {id: 'keyChar', as: 'string'},
    {id: 'ctrl', as: 'string', options: 'ctrl,alt'},
    {id: 'doNotWaitForNextUpdate', as: 'boolean', type: 'boolean<>'},
    {id: 'expectedEffects', type: 'ui-action-effects'}
  ],
  impl: uiActions(
    Var('originatingUIAction', 'keyboardEvent %$keyChar% {? at %$selector%?}'),
    waitForSelector('%$selector%'),
    (ctx,{elemToTest},{selector,type,keyCode,keyChar,ctrl,expectedEffects}) => {
      const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : elemToTest
      jb.log('uiTest uiAction keyboardEvent',{elem,selector,type,keyCode,keyChar,ctx})
      if (!elem)
        return jb.logError('can not find elem for test uiAction keyboardEvent',{ elem,selector,type,keyCode,ctx})
      expectedEffects && expectedEffects.setLogs()

      const widgetId = jb.ui.parentWidgetId(elem) || ctx.vars.widgetId
      const ev = { widgetId, type, keyCode , ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt', key: keyChar, target: elem, currentTarget: elem}
      if (!elemToTest) {
        elem.value = elem.value || ''
        if (type == 'keyup')
          elem.value += keyChar
        return jb.test.activateFEHandlers(elem,type,ev,ctx)
      } else {
        const e = new KeyboardEvent(type,{ ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt', key: keyChar })
        Object.defineProperty(e, 'keyCode', { get : _ => keyChar ? keyChar.charCodeAt(0) : keyCode })
        Object.defineProperty(e, 'target', { get : _ => elem })
        elem.dispatchEvent(e)
      }
    },
    If('%$emulateFrontEndInTest%', uiActions(delay(1), FEUserRequest(), If(not('%$doNotWaitForNextUpdate%'), waitForNextUpdate()))),
    If(and(not('%$emulateFrontEndInTest%'), not('%$remoteUiTest%'), not('%$doNotWaitForNextUpdate%')), waitForNextUpdate()),
    If('%$expectedEffects%', '%$expectedEffects/check()%')
  )
})

component('changeEvent', {
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'value', as: 'string'},
    {id: 'doNotWaitForNextUpdate', as: 'boolean', type: 'boolean'},
    {id: 'expectedEffects', type: 'ui-action-effects'}
  ],
  impl: uiActions(
    Var('originatingUIAction', 'changeEvent to %$value% {? at %$selector%?}'),
    waitForSelector('%$selector%'),
    (ctx,{elemToTest},{selector, value,expectedEffects}) => {
      const type = 'change'
      const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : elemToTest
      jb.log('uiTest uiAction changeEvent',{elem,selector,type,ctx})
      if (!elem)
        return jb.logError('can not find elem for test uiAction keyboardEvent',{ elem,selector,type,ctx})
      expectedEffects && expectedEffects.setLogs()

      const widgetId = jb.ui.parentWidgetId(elem) || ctx.vars.widgetId
      const ev = { widgetId, type, target: elem, currentTarget: elem }
      if (!elemToTest) {
        elem.value = value
        return jb.test.activateFEHandlers(elem,type,ev,ctx)
      } else {
        const e = new Event(type)
        Object.defineProperty(e, 'target', { get : _ => elem })
        Object.defineProperty(e, 'value', { get : _ => value })
        elem.dispatchEvent(e)
      }
    },
    If('%$emulateFrontEndInTest%', uiActions(delay(1), FEUserRequest(), If(not('%$doNotWaitForNextUpdate%'), waitForNextUpdate()))),
    If(and(not('%$emulateFrontEndInTest%'), not('%$remoteUiTest%'), not('%$doNotWaitForNextUpdate%')), waitForNextUpdate()),
    If('%$expectedEffects%', '%$expectedEffects/check()%')
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
    waitForNextUpdate()
  )
})

component('runMethod', {
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'method', as: 'string'},
    {id: 'Data', defaultValue: '%%'},
    {id: 'ctxVars', as: 'single'},
    {id: 'doNotWaitForNextUpdate', as: 'boolean', type: 'boolean'}
  ],
  impl: uiActions(
    waitForSelector('%$selector%'),
    (ctx,{elemToTest},{selector,method,Data,ctxVars}) => {
      if (elemToTest) return
      const elem = jb.ui.elemOfSelector(selector,ctx)
      const cmpElem = elem && jb.ui.closestCmpElem(elem)
      jb.log('uiTest run method',{method,cmpElem,elem,ctx})
      const cmpId = cmpElem.getAttribute('cmp-id')
      jb.ui.cmps[cmpId].runBEMethod(method,Data,ctxVars ? {...ctx.vars, ...ctxVars} : ctx.vars)
      //jb.ui.runBEMethodByElem(cmpElem,method,Data,ctxVars ? {...ctx.vars, ...ctxVars} : ctx.vars)
    },
    If('%$doNotWaitForNextUpdate%', '', waitForNextUpdate())
  )
})

component('FEUserRequest', {
  type: 'ui-action',
  params: [],
  impl: ctx => {
    const userRequest = jb.ui.FEEmulator[ctx.vars.widgetId].userRequests.pop()
    jb.log('uiTest frontend check FEUserRequest', {ctx,userRequest})
    // if (userRequest)
    //   jb.log('uiTest frontend widgetUserRequest is played', {ctx,userRequest})
    return userRequest
  }
})

// expected effects

component('Effects', {
  type: 'ui-action-effects',
  params: [
    {id: 'effects', type: 'ui-action-effect[]', mandatory: true}
  ],
  impl: (_ctx,effects) => ({
    setLogs(ctx) {
      this.originalLogs = { ... jb.spy.includeLogs }
      const logsToCheck = effects.map(ef=>ef.logsToCheck(ctx)).join(',')
      logsToCheck.split(',').filter(x=>x).forEach(logName=>jb.spy.includeLogs[logName] = true)
    },
    check(ctx) {
      if (this.originalLogs != undefined)
        jb.spy.includeLogs = this.originalLogs
      effects.forEach(ef=>ef.check(ctx))
    }
  })
})

component('checkLog', {
  type: 'ui-action-effect',
  params: [
    {id: 'log', as: 'string', mandatory: true},
    {id: 'Data', dynamic: true, description: 'what to check', mandatory: true},
    {id: 'condition', type: 'boolean<>', dynamic: true, description: '%% is data', mandatory: true},
    {id: 'dataErrorMessage', as: 'string', dynamic: true},
    {id: 'conditionErrorMessage', as: 'string', dynamic: true}
  ],
  impl: (_ctx,log,data, condition,dataErrorMessage, conditionErrorMessage) => ({
    logsToCheck: () => log,
    check(ctx) {
      const { originatingUIAction } = ctx.vars
      const logs = jb.spy.search(log,{ slice: ctx.vars.logCounterAtBeginUIActions || 0, spy: jb.spy, enrich: true })
      if (!logs.length)
        return jb.logError(`can not find logs ${log} after action ${originatingUIAction}`,{ctx,log})
      const dataItems = logs.map(l=> jb.tosingle(data(ctx.setData(l)))).filter(x=>x)
      if (!dataItems.length)
        return jb.logError(dataErrorMessage(ctx) + `  after action ${originatingUIAction} using expression ${jb.utils.prettyPrint(data.profile,{singleLine:true})}`,{ctx,logs})
      const conditionItems = dataItems.find(dt => condition(ctx.setData(dt)))
      if (!conditionItems)
        jb.logError(conditionErrorMessage(ctx.setData(dataItems)) + ` after action ${originatingUIAction} using condition ${jb.utils.prettyPrint(condition.profile,{singleLine:true})}`,
          {dataItems, ctx})
    }
  })
})

component('checkDOM', {
  type: 'ui-action-effect',
  params: [
    {id: 'selector', as: 'string', mandatory: true},
    {id: 'calculate', type: 'data<>', dynamic: true, description: '%% is dom elem', mandatory: true},
    {id: 'expectedResult', type: 'boolean<>', dynamic: true, description: '%% is calc result', mandatory: true},
    {id: 'errorMessage', as: 'string', dynamic: true}
  ],
  impl: (ctx,selector,calculate, expectedResult, errorMessage) => ({
    logsToCheck: () => '',
    check(ctx) {
      const { originatingUIAction } = ctx.vars
      const elem = jb.ui.elemOfSelector(selector,ctx)
      jb.log('checkDOM elem',{elem,selector,ctx})
      if (!elem)
        return jb.logError(`checkDOM: can not find elem of selector ${selector} after action ${originatingUIAction}`,{ctx})
      const actualResult = calculate(ctx.setData(elem))
      const res = expectedResult(ctx.setData(actualResult))
      if (!res)
        return jb.logError(errorMessage(ctx.setVars({actualResult})) + ` after action ${originatingUIAction}`,{ctx})
    }
  })
})

component('compChange', {
  type: 'ui-action-effect',
  params: [
    {id: 'newText', dynamic: true, mandatory: true}
  ],
  impl: checkLog('delta', '%delta%', {
    log: 'delta',
    condition: contains('%$newText()%'),
    dataErrorMessage: 'no rendering updates',
    conditionErrorMessage: 'can not find %$newText()% in delta'
  })
})
