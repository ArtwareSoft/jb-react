component('userInput.eventToRequest', {
    type: 'rx',
    impl: rx.map( (ctx,{widgetId}) => {
      if (!ctx.data.selector) return ctx.data
      const currentTarget = jb.ui.findIncludeSelf(jb.ui.widgetBody(ctx.setVars({headlessWidget: true,headlessWidgetId: widgetId})),ctx.data.selector)[0]
      return jb.ui.rawEventToUserRequest({ ...ctx.data, currentTarget, widgetId }, ctx.data.specificMethod)
    })
})

component('userInput.click', {
    type: 'user-input',
    params: [
      {id: 'selector', as: 'string', defaultValue: 'button'},
      {id: 'methodToActivate', as: 'string'}
    ],
    impl: (ctx,selector,methodToActivate) => ({ type: 'click', selector, specificMethod: methodToActivate })
})

component('userInput.setText', {
    type: 'user-input',
    params: [
      {id: 'value', as: 'string', mandatory: true},
      {id: 'selector', as: 'string', defaultValue: 'input,textarea'}
    ],
    impl: (ctx,value,selector) => ({ type: 'blur', target: {value}, selector })
})

component('userInput.keyboardEvent', {
    type: 'user-input',
    params: [
      {id: 'selector', as: 'string'},
      {id: 'type', as: 'string', options: ['keypress', 'keyup', 'keydown']},
      {id: 'keyCode', as: 'number'},
      {id: 'ctrl', as: 'string', options: ['ctrl', 'alt']}
    ],
    impl: (ctx,selector,type,keyCode,ctrl) => ({ selector, type, keyCode , ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt'})
})  

// ****** uiActions

component('uiAction.waitForSelector', {
  type: 'action',
  params: [
    {id: 'selector', as: 'string' },
  ],
  impl: waitFor((ctx,{},{selector}) => jb.ui.elemOfSelector(selector,ctx))
})

component('uiAction.waitForText', {
  type: 'action',
  params: [
    {id: 'text', as: 'string' },
  ],
  impl: waitFor((ctx,{},{text}) => {
    const body = jb.ui.widgetBody(ctx)
    const lookin = typeof body.outerHTML == 'function' ? body.outerHTML() : body.outerHTML
    return lookin.indexOf(text) != -1
  })
})

component('uiAction.waitForFESelector', {
  type: 'action',
  params: [
    {id: 'selector', as: 'string' },
  ],
  impl: waitFor((ctx,{},{selector}) => {
    const elem = jb.ui.elemOfSelector(selector,ctx)
    const cmpElem = elem && jb.ui.closestCmpElem(elem)
    if (!cmpElem) return false
    return !cmpElem.getAttribute('interactive') || jb.path(cmpElem,'_component.state.frontEndStatus') == 'ready'
  })
})

component('uiAction.waitForCompReady', {
  type: 'action',
  params: [
    {id: 'selector', as: 'string' },
  ],
  impl: waitFor((ctx,{},{selector}) => {
    const el = jb.ui.elemOfSelector(selector,ctx)
    const ctxId = el && el.getAttribute && el.getAttribute('full-cmp-ctx')
    return jb.path(jb.ctxDictionary[ctxId],'vars.cmp.ready') === true
  })
})

component('uiAction.scrollBy', {
      type: 'user-input',
      params: [
        {id: 'selector', as: 'string' },
        {id: 'scrollBy', as: 'number'},
      ],
      impl: runActions(
        uiAction.waitForFESelector('%$selector%'),
        (ctx,{elemToTest},{selector,scrollBy}) => {
          const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : elemToTest
          elem && elem.scrollBy(scrollBy,scrollBy)
          jb.log('test scroll on dom',{elem,ctx})
        }
      )
})

component('uiAction.setText', {
    type: 'ui-action',
    params: [
      {id: 'value', as: 'string', mandatory: true},
      {id: 'selector', as: 'string', defaultValue: 'input,textarea'}
    ],
    impl: runActions(
      uiAction.waitForFESelector('%$selector%'),
      (ctx,{elemToTest},{value,selector}) => {
          const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : elemToTest;
          jb.ui.findIncludeSelf(elem,'input,textarea').forEach(e=>e.value= value)
          const ev = { type: 'blur', currentTarget: elem, target: {value}}
          jb.log('test setText',{ev,elem,selector,ctx})
          jb.ui.handleCmpEvent(ev)
      })
})

component('uiAction.click', {
    type: 'ui-action',
    params: [
      {id: 'selector', as: 'string', defaultValue: 'button'},
    ],
    impl: runActions(
      uiAction.waitForFESelector('%$selector%'),
      (ctx,{elemToTest},{selector}) => {
        const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : elemToTest
        jb.log('test click',{elem,selector,ctx})
        elem && elem.click()
    })
})
  
component('uiAction.keyboardEvent', {
    type: 'ui-action',
    params: [
      {id: 'selector', as: 'string'},
      {id: 'type', as: 'string', options: ['keypress', 'keyup', 'keydown']},
      {id: 'keyCode', as: 'number'},
      {id: 'keyChar', as: 'string'},
      {id: 'ctrl', as: 'string', options: ['ctrl', 'alt']}
    ],
    impl: runActions(
      uiAction.waitForFESelector('%$selector%'),
      (ctx,{elemToTest},{selector,type,keyCode,keyChar,ctrl}) => {
        // const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : ctx.vars.elemToTest
        // const ev = ({ selector, type, keyCode , currentTarget: elem, target: elem, ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt'})
        // jb.log('test keyboardEvent',{ev,elem,selector,ctx})
        // jb.ui.handleCmpEvent(ev)

        const elem = selector ? ctx.vars.elemToTest.querySelector(selector) : elemToTest
        if (!elem) return
        if (keyChar && type == 'keyup')
          elem.value = elem.value + keyChar
        const e = new KeyboardEvent(type,{ ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt', key: keyChar })
        Object.defineProperty(e, 'keyCode', { get : _ => keyChar ? keyChar.charCodeAt(0) : keyCode })
        Object.defineProperty(e, 'target', { get : _ => elem })
        jb.log('test keyboardEvent',{e,elem,selector,type,keyCode,ctx})
        elem.dispatchEvent(e)
        //return jb.delay(1);
      })
})
