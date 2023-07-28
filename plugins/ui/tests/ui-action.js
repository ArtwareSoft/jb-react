dsl('test')

// uiAction works in both uiTest and uiFrontEndTest. 
// uiAction uses ctx.vars.elemToTest to decide whether to return a sourceCb of events (uiTest) or promise (uiFETest)

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
  ],
  impl: action(waitFor('%$check()%'))
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
    const updatesCounterAtBeginUIActions = jb.path(jb.ui.headless[ctx.vars.widgetId],'updatesCounter' || 0)
    const ctxToUse = ctx.setVars({updatesCounterAtBeginUIActions})
    if (isFE) return jb.asArray(ctx.profile.actions).filter(x=>x).reduce((pr,action,index) =>
				pr.finally(function runActions() {return ctxToUse.runInner(action, { as: 'single'}, `items~${index}` ) })
			,Promise.resolve())

    return (start, sink) => {
      let index = -1, talkback, currSrc, finished
      if (start != 0) return

      function nextSource() {
        index++;
        if (ctx.profile.actions.length <= index) {
          finished = true
          sink(2)
        }
        if (finished) return

        const action = ctx.profile.actions[index]
        currSrc = action && ctxToUse.runInner(action, { as: 'single'}, `items~${index}` )
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
    {id: 'selector', as: 'string' },
  ],
  impl: waitFor((ctx,{elemToTest},{selector}) => {
    const elem = jb.ui.elemOfSelector(selector,ctx)
    const cmpElem = elem && jb.ui.closestCmpElem(elem)
    if (!cmpElem) return false
    // if FETest, wait for the frontEnd cmp to be in ready state
    return !elemToTest || !cmpElem.getAttribute('interactive') || jb.path(cmpElem,'_component.state.frontEndStatus') == 'ready'
  })
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
    let done = false
    const { updatesCounterAtBeginUIActions, widgetId} = ctx.vars
    const widget = jb.ui.headless[widgetId] || jb.ui.FEEmulator[widgetId]
    if (!widget) {
      jb.logError('uiTest waitForNextUpdate can not find widget',{ctx, widgetId})
      return resolve()
    }    
    const currentCounter = widget.updatesCounter || 0
    const baseCounter = updatesCounterAtBeginUIActions != null ? updatesCounterAtBeginUIActions : currentCounter
    if (expectedCounter == 0)
      expectedCounter = baseCounter + 1

    jb.log('uiTest waitForNextUpdate started',{ctx, currentCounter, expectedCounter, baseCounter})
    if (currentCounter >= expectedCounter) {
      jb.log('uiTest waitForNextUpdate resolved - counter already reached',{ctx, currentCounter, expectedCounter, baseCounter})
      return resolve() 
    }
    jb.ui.renderingUpdates(0, (t,d) => {
      if (!widget) return
      let talkback = null
      if (t == 0)
        talkback = d
      const currentCounter = widget.updatesCounter || 0
      if (t == 1 && !done && d.widgetId == widgetId && currentCounter >= expectedCounter) {
        done = true
        talkback && talkback(2)
        jb.delay(1).then(() => {
          jb.log('uiTest waitForNextUpdate counter reached', {ctx, currentCounter, expectedCounter, baseCounter})
          resolve()
        })
      }
    })
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
          jb.log('test setText',{ev,currentTarget,selector,ctx})
          if (elemToTest) 
            jb.ui.handleCmpEvent(ev)
          else
            return jb.ui.rawEventToUserRequest(ev,{ctx})
      },
    If('%$doNotWaitForNextUpdate%', '', waitForNextUpdate())
  )
})

component('click', {
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string', defaultValue: 'button'},
    {id: 'methodToActivate', as: 'string'},
    {id: 'doNotWaitForNextUpdate', as: 'boolean', type: 'boolean'}
  ],
  impl: uiActions(
    waitForSelector('%$selector%'),
    (ctx,{elemToTest},{selector, methodToActivate}) => {
      const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : elemToTest
      jb.log('test uiAction click',{elem,selector,ctx})
      if (!elem) 
        return jb.logError(`click can not find elem ${selector}`, {ctx,elemToTest} )
      const widgetId = jb.ui.parentWidgetId(elem) || ctx.vars.widgetId
      if (elemToTest) 
        elem.click()
      else
        return jb.ui.rawEventToUserRequest({ type: 'click', currentTarget: elem, widgetId}, {specificMethod: methodToActivate, ctx})
    },
    If(or('%$remoteUiTest%','%$doNotWaitForNextUpdate%'), '', waitForNextUpdate())
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
      jb.log('test uiAction keyboardEvent',{elem,selector,type,keyCode,ctx})
      if (!elem)
        return jb.logError('can not find elem for test uiAction keyboardEvent',{ elem,selector,type,keyCode,ctx})

      const widgetId = jb.ui.parentWidgetId(elem) || ctx.vars.widgetId
      const ev = { widgetId, type, keyCode , ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt', key: keyChar}
      if (!elemToTest && !useFrontEndInTest) 
        return jb.ui.rawEventToUserRequest(ev, {ctx})
      if (!elemToTest && useFrontEndInTest) {
        const evForTest = {...ev, target: elem, currentTarget: elem}
        elem.value = elem.value || ''
        if (type == 'keyup')
          elem.value += keyChar
        ;(jb.path(elem.handlers,type) || []).forEach(h=>h(evForTest))
        return Promise.resolve()
      }
    
      if (keyChar && type == 'keyup')
        elem.value = elem.value + keyChar
      const e = new KeyboardEvent(type,{ ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt', key: keyChar })
      Object.defineProperty(e, 'keyCode', { get : _ => keyChar ? keyChar.charCodeAt(0) : keyCode })
      Object.defineProperty(e, 'target', { get : _ => elem })
      elem.dispatchEvent(e)
    },
    If(or('%$remoteUiTest%','%$useFrontEndInTest%', '%$doNotWaitForNextUpdate%'), '', waitForNextUpdate()),
    If('%$useFrontEndInTest%', FEUserRequest()),
  )
})

component('changeEvent', {
  type: 'ui-action',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'value', as: 'string'},
  ],
  impl: uiActions(
    waitForSelector('%$selector%'),
    (ctx,{elemToTest},{selector,value}) => {
      const type = 'change'
      const elem = selector ? ctx.vars.elemToTest.querySelector(selector) : elemToTest
      jb.log('test uiAction keyboardEvent',{elem,selector,ctx})
      if (!elem)
        return jb.logError('can not find elem for test uiAction keyboardEvent',{ elem,selector,ctx})

      const widgetId = jb.ui.parentWidgetId(elem) || ctx.vars.widgetId
      if (!elemToTest) 
        return jb.ui.rawEventToUserRequest({ widgetId, type, value }, {ctx})

      elem.value = value
      const e = new Event(type)
      Object.defineProperty(e, 'target', { get : _ => elem })
      elem.dispatchEvent(e)
    },
    waitForNextUpdate()
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
      jb.log('test scroll on dom',{elem,ctx})
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
    if (userRequest)
      jb.log('uiTest frontend widgetUserRequest is played', {ctx,userRequest})
    return userRequest
  },
})