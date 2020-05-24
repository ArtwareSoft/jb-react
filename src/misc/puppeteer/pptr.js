jb.ns('pptr,rx')

jb.component('pptr.gotoPage', {
  type: 'rx,pptr',
  params: [
    {id: 'url', as: 'string', mandatory: true},
    {id: 'waitUntil', as: 'string', defaultValue: 'load', options: 'load:load event is fired,domcontentloaded:DOMContentLoaded event is fired,networkidle0:no more than 0 network connections for at least 500 ms,networkidle2:no more than 2 network connections for at least 500 ms'},
    {id: 'timeout', as: 'number', defaultValue: 5000, description: 'maximum time to wait for in milliseconds'}
  ],
  impl: rx.innerPipe(
    rx.var('url', '%$url%'),
    rx.doPromise(
        (ctx,{},{url,waitUntil,timeout}) => jb.pptr.runMethod(ctx,'goto',url,{waitUntil, timeout})
      )
  )
})

jb.component('pptr.logData', {
  type: 'rx,pptr',
  impl: rx.doPromise(
    (ctx,{comp}) => comp.events.next({$: 'ResultData', ctx })
  )
})

jb.component('pptr.logActivity', {
    type: 'rx,pptr',
    params: [
        {id: 'activity', as: 'string', mandatory: true },
        {id: 'description', as: 'string' },
    ],
    impl: rx.doPromise((ctx,{comp},{activity, description}) => comp.events.next({$: 'Activity', activity, description, ctx }))
})

jb.component('pptr.extractBySelector', {
    type: 'rx,pptr',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'propName', as: 'string', options: 'value,innerHTML,outerHTML,href,textContent', defaultValue: 'textContent'},
        {id: 'multiple', as: 'boolean' },
        {id: 'timeout', as: 'number', defaultValue: 5000, description: 'maximum time to wait in milliseconds' },
    ],
    impl: rx.innerPipe(
        rx.mapPromise((ctx,{},{selector,multiple}) => jb.pptr.runMethod(ctx,multiple ? '$$' : '$',selector)),
        pptr.getProperty('%$propName%'),
        pptr.logData()
    )
})

jb.component('pptr.querySelector', {
    type: 'rx,pptr',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'multiple', as: 'boolean', description: 'querySelectorAll' },
    ],
    impl: rx.mapPromise((ctx,{},{selector,multiple}) => jb.pptr.runMethod(ctx,multiple ? '$$' : '$',selector)),
})

jb.component('pptr.waitForSelector', {
    type: 'rx,pptr',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'visible', as: 'boolean', description: 'wait for element to be present in DOM and to be visible, i.e. to not have display: none or visibility: hidden CSS properties' },
        {id: 'hidden ', as: 'boolean', description: 'wait for element to not be found in the DOM or to be hidden' },
        {id: 'timeout', as: 'number', defaultValue: 5000, description: 'maximum time to wait for in milliseconds' },
    ],
    impl: rx.doPromise((ctx,{},{selector,visible,hidden, timeout}) => jb.pptr.runMethod(ctx,'waitForSelector',selector,{visible,hidden, timeout}))
})

jb.component('pptr.extractWithEval', {
  type: 'rx,pptr',
  description: 'evaluate javascript expression',
  params: [
    {id: 'expression', as: 'string', mandatory: true}
  ],
  impl: rx.innerPipe(
    rx.mapPromise((ctx,{},{expression}) => jb.pptr.runMethod(ctx,'evaluate',expression)),
    pptr.logData()
  )
})

jb.component('pptr.getProperty', {
    type: 'rx,pptr',
    description: 'get property of object',
    params: [
      {id: 'propName', as: 'string',  options: 'value,innerHTML,outerHTML,href,textContent', mandatory: true}
    ],
    impl: rx.mapPromise((ctx,{},{propName}) => jb.pptr.runMethod(ctx,'evaluate',eval(`x => x && x.${propName} `))),
})

jb.component('pptr.eval', {
  type: 'rx,pptr',
  description: 'evaluate javascript expression',
  params: [
    {id: 'expression', as: 'string', mandatory: true},
    {id: 'varName', as: 'string', description: 'leave empty for no vars'}
  ],
  impl: If('%$varName%', rx.innerPipe(
            rx.mapPromise((ctx,{},{expression}) => jb.pptr.runMethod(ctx,'evaluate',expression)),
            rx.var('%$varName%')
        ), rx.mapPromise((ctx,{},{expression}) => jb.pptr.runMethod(ctx,'evaluate',expression)))
})

jb.component('pptr.mouseClick', {
    type: 'rx,pptr',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'button', as: 'string', options:'left,right,middle'},
        {id: 'clickCount', as: 'number', description: 'default is 1' },
        {id: 'delay', as: 'number', description: 'Time to wait between mousedown and mouseup in milliseconds. Defaults to 0' },
    ],
    impl: rx.mapPromise((ctx,{},{selector,button,clickCount,delay}) => jb.pptr.runMethod(ctx,'click',selector, {button,clickCount,delay}))
})

jb.component('pptr.waitForFunction', {
    type: 'rx,pptr',
    params: [
        {id: 'condition', as: 'string' },
        {id: 'polling', type: 'pptr.polling', defaultValue: pptr.raf() },
        {id: 'timeout', as: 'number', defaultValue: 5000, description: '0 to disable, maximum time to wait for in milliseconds' },
    ],
    impl: rx.mapPromise((ctx,{},{condition,polling,timeout}) => jb.pptr.runMethod(ctx,'waitForFunction',condition,{polling, timeout}))
})

jb.component('pptr.type', {
    description: 'enter input form field data',
    type: 'rx,pptr',
    params: [
        {id: 'text', as: 'string', mandatory: true },
        {id: 'selector', as: 'string', defaultValue: 'form input[type=text]' },
        {id: 'enterAtEnd', as: 'boolean', defaultValue: true },
        {id: 'delay', as: 'number', defaultValue: 100, description: 'time between clicks' },
    ],
    impl: rx.innerPipe(
        rx.waitForSelector('%$selector%'),
        rx.doPromise((ctx,{},{text, enterAtEnd, selector,delay}) => jb.pptr.runMethod(ctx,'type',selector, text + (enterAtEnd ? String.fromCharCode(13): ''), {delay}))
    )
})

jb.component('pptr.closeBrowser', {
    type: 'action',
    impl: (ctx,{browser}) => browser.close()
})

jb.component('pptr.repeatingAction', {
    type: 'pptr.action',
    params: [
        {id: 'action', as: 'string' },
        {id: 'intervalTime', as: 'number', defaultValue: 500 },
    ],
    impl: pptr.eval('setInterval(() => { %$action% } ,%$intervalTime%)')
})

jb.component('pptr.interval', {
    type: 'pptr.polling',
    description: 'the interval in milliseconds at which the function would be executed',
    params: [
        {id: 'intervalTime', as: 'number', defaultValue: 500, mandatory: true}
    ],
    impl: '%$intervalTime%'
})

jb.component('pptr.raf', {
    type: 'pptr.polling',
    description: 'to constantly execute pageFunction in requestAnimationFrame callback. This is the tightest polling mode which is suitable to observe styling changes',
    impl: () => 'raf'
})

jb.component('pptr.mutation', {
    type: 'pptr.polling',
    description: 'every DOM mutation',
    impl: () => 'mutation'
})

jb.component('pptr.endlessScrollDown', {
    type: 'pptr',
    impl: rx.innerPipe(
        pptr.repeatingAction('window.scrollPos = window.scrollPos || []; window.scrollPos.push(window.scrollY); window.scrollTo(0,document.body.scrollHeight)' ,500),
        pptr.waitForFunction('window.scrollPos && Math.max.apply(0,window.scrollPos.slice(-4)) == Math.min.apply(0,window.scrollPos.slice(-4))'))
})

// ************ frames *********

jb.component('pptr.gotoInnerFrameBody', {
    type: 'rx,pptr',
    impl: rx.innerPipe(
        pptr.waitForSelector('iframe'),
        pptr.waitForFunction("document.querySelector('iframe').contentDocument"),
        pptr.waitForFunction("document.querySelector('iframe').contentDocument.body")
    )
})

jb.component('pptr.javascriptOnPptr', {
    type: 'rx,pptr',
    description: 'run the function on the pptr server using pptr api',
    params: [
        {id: 'func', dynamic: true, mandatory: true}
    ],
    impl: rx.mapPromise((ctx,{},{func}) => func(ctx))
})

jb.component('pptr.runMethodOnPptr', {
    type: 'rx,pptr',
    description: 'run method on the current object on pptr server using pptr api',
    params: [
      {id: 'method', as: 'string', mandatory: true},
      {id: 'param1', as: 'string'},
      {id: 'param2', as: 'string'},
    ],
    impl: rx.mapPromise((ctx,{},{method,param1,param2}) => jb.pptr.runMethod(ctx,method,param1,param2)),
})

// page.mouse.move(100, 100);
// page.mouse.down();
// page.mouse.move(200, 200);
// page.mouse.up();
// await page.type('#mytextarea', 'Hello'); // Types instantly
// await page.type('#mytextarea', 'World', {delay: 100}); // Types slower, like a user
//page.setJavaScriptEnabled(enabled)