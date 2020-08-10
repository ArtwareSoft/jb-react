jb.component('userInput.eventToRequest', {
    type: 'rx',
    impl: rx.map( (ctx,{tstWidgetId}) => jb.ui.rawEventToUserRequest({ 
            ...ctx.data,
            currentTarget: jb.ui.findIncludeSelf(jb.ui.widgetBody(ctx.setVars({headlessWidget: true,widgetId: tstWidgetId})),ctx.data.selector)[0],
            widgetId: tstWidgetId
        }, ctx.data.specificMethod),
    )
})

jb.component('userInput.click', {
    type: 'user-input',
    params: [
      {id: 'selector', as: 'string'},
      {id: 'methodToActivate', as: 'string'}
    ],
    impl: (ctx,selector,methodToActivate) => ({ type: 'click', selector, specificMethod: methodToActivate })
})

jb.component('userInput.setText', {
    type: 'user-input',
    params: [
      {id: 'value', as: 'string', mandatory: true},
      {id: 'selector', as: 'string', defaultValue: 'input,textarea'}
    ],
    impl: (ctx,value,selector) => ({ type: 'blur', target: {value}, selector })
})

jb.component('userInput.keyboardEvent', {
    type: 'user-input',
    params: [
      {id: 'selector', as: 'string'},
      {id: 'type', as: 'string', options: ['keypress', 'keyup', 'keydown']},
      {id: 'keyCode', as: 'number'},
      {id: 'ctrl', as: 'string', options: ['ctrl', 'alt']}
    ],
    impl: (ctx,selector,type,keyCode,ctrl) => ({ selector, type, keyCode , ...{ ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt' } })
})  

// ****** uiActions

jb.component('uiAction.scrollBy', {
      type: 'user-input',
      params: [
        {id: 'selector', as: 'string' },
        {id: 'by', as: 'number'},
      ],
      impl: (ctx,selector,scrollBy) => {
        const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : ctx.vars.elemToTest
        elem && elem.scrollBy(scrollBy,scrollBy)
      }
})

jb.component('uiAction.setText', {
    type: 'ui-action',
    params: [
      {id: 'value', as: 'string', mandatory: true},
      {id: 'selector', as: 'string', defaultValue: 'input,textarea'}
    ],
    impl: (ctx,value,selector) => {
          const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : ctx.vars.elemToTest;
          jb.ui.findIncludeSelf(elem,'input,textarea').forEach(e=>e.value= value)
          const ev = { type: 'blur', currentTarget: elem, target: {value}}
          jb.ui.handleCmpEvent(ev)
          //return jb.delay(1);
      }
})

jb.component('uiAction.click', {
    type: 'ui-action',
    params: [
      {id: 'selector', as: 'string'},
    ],
    impl: (ctx,selector) => {
      const elem = selector ? jb.ui.elemOfSelector(selector,ctx) : ctx.vars.elemToTest
      elem && elem.click()
    }
})
  
jb.component('uiAction.keyboardEvent', {
    type: 'ui-action',
    params: [
      {id: 'selector', as: 'string'},
      {id: 'type', as: 'string', options: ['keypress', 'keyup', 'keydown']},
      {id: 'keyCode', as: 'number'},
      {id: 'ctrl', as: 'string', options: ['ctrl', 'alt']}
    ],
    impl: (ctx,selector,type,keyCode,ctrl) => {
        const elem = selector ? ctx.vars.elemToTest.querySelector(selector) : ctx.vars.elemToTest
        if (!elem) return
        const e = new KeyboardEvent(type,{ ctrlKey: ctrl == 'ctrl', altKey: ctrl == 'alt' })
        Object.defineProperty(e, 'keyCode', { get : _ => keyCode })
        elem.dispatchEvent(e)
        //return jb.delay(1);
      }
})
