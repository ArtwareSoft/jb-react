jb.ns('pptr,rx')

jb.component('pptr.gotoPage', {
  type: 'rx,pptr',
  params: [
    {id: 'url', as: 'string', mandatory: true},
    {id: 'frame', type: 'pptr.frame', dynamic: true, defaultValue: pptr.mainFrame()},
    {id: 'waitUntil', as: 'string', defaultValue:'load', options: 'load:load event is fired,domcontentloaded:DOMContentLoaded event is fired,networkidle0:no more than 0 network connections for at least 500 ms,networkidle2:no more than 2 network connections for at least 500 ms'},
    {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait for in milliseconds'}
  ],
  impl: rx.innerPipe(
    rx.mapPromise(({},{browser}) => browser.newPage()),
    rx.var('page', ({data}) => data),
    rx.var('url', ({},{},{url}) => url),
    pptr.logActivity('start navigation', '%$url%'),
    rx.doPromise(({},{page},{url,waitUntil,timeout}) => page.goto(url,{waitUntil, timeout})),
    pptr.logActivity('after goto page', '%$url%'),
    rx.mapPromise((ctx,{},{frame}) => frame(ctx)),
    rx.var('frame'),
    pptr.logActivity('end navigation', '%$url%')
  )
})

jb.component('pptr.logData', {
    type: 'rx,pptr',
    impl: rx.doPromise((ctx,{comp}) => comp.events.next({$: 'result-data', ctx }))
})

jb.component('pptr.logActivity', {
    type: 'rx,pptr',
    params: [
        {id: 'activity', as: 'string', mandatory: true },
        {id: 'description', as: 'string' },
    ],
    impl: rx.doPromise((ctx,{comp},{activity, description}) => comp.events.next({$: activity, description, ctx }))
})

jb.component('pptr.extractBySelector', {
    type: 'rx,pptr',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'extract', as: 'string', options: 'value,innerHTML,outerHTML,href,textContent', defaultValue: 'textContent'},
        {id: 'multiple', as: 'boolean' },
        {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait in milliseconds' },
    ],
    impl: rx.innerPipe(
        rx.doPromise((ctx,{frame},{selector,timeout}) => frame.waitForSelector(selector,{timeout})),
        rx.mapPromise((ctx,{frame},{selector,extract,multiple}) => 
            frame.evaluate(`_jb_extract = '${extract}'`).then(()=>
                multiple ? frame.$$eval(selector, elems => elems.map(el=>el[_jb_extract]))
                : frame.$eval(selector, el => [el[_jb_extract]] ))), 
                rx.toMany('%%'), 
        pptr.logData()
    )
})

jb.component('pptr.waitForSelector', {
    type: 'rx,pptr',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'visible', as: 'boolean', description: 'wait for element to be present in DOM and to be visible, i.e. to not have display: none or visibility: hidden CSS properties' },
        {id: 'hidden ', as: 'boolean', description: 'wait for element to not be found in the DOM or to be hidden' },
        {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait for in milliseconds' },
    ],
    impl: rx.doPromise((ctx,{frame},{selector,visible,hidden, timeout}) => frame.waitForSelector(selector,{visible,hidden, timeout}))
})

jb.component('pptr.extractWithEval', {
    type: 'rx,pptr',
    description: 'evaluate javascript expression',
    params: [
        {id: 'expression', as: 'string'},
    ],
    impl: rx.innerPipe(rx.mapPromise((ctx,{frame},{expression}) => frame.evaluate(expression)), pptr.logData())
})

jb.component('pptr.eval', {
    type: 'rx,pptr',
    description: 'evaluate javascript expression',
    params: [
        {id: 'expression', as: 'string'},
    ],
    impl: rx.mapPromise((ctx,{frame},{expression}) => frame.evaluate(expression))
})

jb.component('pptr.mouseClick', {
    type: 'rx,pptr',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'button', as: 'string', options:'left,right,middle'},
        {id: 'clickCount', as: 'number', description: 'default is 1' },
        {id: 'delay', as: 'number', description: 'Time to wait between mousedown and mouseup in milliseconds. Defaults to 0' },
    ],
    impl: rx.mapPromise((ctx,{frame},{selector,button,clickCount,delay}) => frame.click(selector, {button,clickCount,delay}))
})

jb.component('pptr.waitForFunction', {
    type: 'rx,pptr',
    params: [
        {id: 'condition', as: 'string' },
        {id: 'polling', type: 'pptr.polling', defaultValue: pptr.raf() },
        {id: 'timeout', as: 'number', defaultValue: 30000, description: '0 to disable, maximum time to wait for in milliseconds' },
    ],
    impl: rx.mapPromise((ctx,{frame},{condition,polling,timeout}) => frame.waitForFunction(condition,{polling, timeout}))
})

jb.component('pptr.waitForNavigation', {
    type: 'rx,pptr',
    params: [
        {id: 'waitUntil', as: 'string', options: [
            'load:load event is fired','domcontentloaded:DOMContentLoaded event is fired',
            'networkidle0:no more than 0 network connections for at least 500 ms',
            'networkidle2:no more than 2 network connections for at least 500 ms'].join(',')},
        {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait for in milliseconds' },
    ],
    impl: rx.mapPromise((ctx,{frame},{waitUntil,timeout}) => frame.waitForNavigation({waitUntil, timeout}))
})

jb.component('pptr.type', {
    description: 'enter input form field data',
    type: 'rx,pptr',
    params: [
        {id: 'text', as: 'string', mandatory: true },
        {id: 'selector', as: 'string', defaultValue: 'form input[type=text]' },
        {id: 'enterAtEnd', as: 'boolean', defaultValue: true },
        {id: 'delay', as: 'number', defaultValue: 100, description: 'time between clicks' },
        {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait in milliseconds' },
    ],
    impl: rx.innerPipe(
        rx.doPromise((ctx,{frame},{selector,timeout}) => frame.waitForSelector(selector,{timeout})),
        rx.doPromise((ctx,{frame},{text, enterAtEnd, selector,delay}) => frame.type(selector, text + enterAtEnd ? String.fromCharCode(13): '', {delay}))
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

jb.component('pptr.mainFrame', {
    type: 'pptr.frame',
    impl: ctx => ctx.vars.page.mainFrame()
})

jb.component('pptr.frameByIndex', {
    type: 'pptr.frame',
    params: [
        {id: 'index', as: 'number', defaultValue: 0, mandatory: true}
    ],    
    impl: ctx => ctx.vars.page.frames()[index]
})

jb.component('pptr.function', {
    type: 'rx,pptr',
    params: [
        {id: 'fun', dynamic: true },
    ],
    impl: rx.doPromise((ctx,{},{func}) => func(ctx))
})

// page.mouse.move(100, 100);
// page.mouse.down();
// page.mouse.move(200, 200);
// page.mouse.up();
// await page.type('#mytextarea', 'Hello'); // Types instantly
// await page.type('#mytextarea', 'World', {delay: 100}); // Types slower, like a user
//page.setJavaScriptEnabled(enabled)