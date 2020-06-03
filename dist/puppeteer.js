jb.ns('pptr')

jb.pptr = {
    getOrCreateBrowser(showBrowser) {
        if (this._browser) return Promise.resolve(this._browser)
        return this.puppeteer().launch({headless: !showBrowser, 
            args: ['--disable-features=site-per-process','--enable-devtools-experiments'],
            }).then(browser => this._browser = browser)
    },
    runMethod(ctx,method,...args) {
        const obj = [ctx.data,ctx.vars.frame,ctx.vars.page].filter(x=>x && x[method])[0]
        return obj && Promise.resolve().then(()=>obj[method](...args)).catch(err=> {
            ctx.vars.pptrSession.events.next({$: 'Error', message: err.message, stack: err.stack, ctx })
            return null
        })
    }
}

jb.component('pptr.runMethodOnPptr', {
    type: 'rx,pptr',
    description: 'run method on the current object on pptr server using pptr api',
    params: [
      {id: 'method', as: 'string', mandatory: true},
      {id: 'args', as: 'array'},
    ],
    impl: pptr.mapPromise((ctx,{},{method,args}) => jb.pptr.runMethod(ctx,method,args)),
})

jb.component('pptr.getOrCreateBrowser', {
    type: 'rx,pptr',
    description: 'run method on the current object on pptr server using pptr api',
    params: [
      {id: 'method', as: 'string', mandatory: true},
      {id: 'args', as: 'array'},
    ],
    impl: pptr.mapPromise((ctx,{},{method,args}) => jb.pptr.runMethod(ctx,method,args)),
})

jb.component('pptr.server', {
    type: 'remote',
    params: [
        {id: 'showBrowser', as: 'boolean', defaultValue: true},
        {id: 'libs', as: 'array', defaultValue: ['common','remote','rx','puppeteer'] },
    ],
    impl: (ctx,showBrowser, libs) => {
        if (jb.pptr.pptrServer) return jb.pptr.pptrServer
        const {pipe,Do,fromEvent,map,filter,subscribe} = jb.callbag
        const socket = jb.pptr.pptrServer = jb.pptr.createProxySocket()
        socket.postObj = m => socket.send(JSON.stringify(jb.remote.prepareForClone(m)))
        socket.showBrowser = showBrowser
        pipe(
            fromEvent('close',socket),
            Do(e => {
                const host = jb.path(jb.studio,'studiojb.studio.host')
                if (host && e.code == 1006)
                    host.showError('puppeteer server is down. please activate or install from https://github.com/ArtwareSoft/jb-puppeteer-server.git')
                else if (host && e.code != 1000)
                    host.showError('puppeteer server error: ' + e.code)
            }),
            subscribe(()=>{})
        )

        socket.messageSource = pipe(
            fromEvent('message',socket),
            takeUntil(fromEvent('close',socket)),
            map(m=> jb.remote.evalFunctions(JSON.parse(m.data)))
        )
        pipe(socket.messageSource, filter(m => m.res == 'loadCodeReq'), subscribe(() => socket.sendCodeToServer()))

        pipe(
            socket.messageSource,
            Do(m => m.$ == 'cbLogByPathDiffs' && jb.remote.updateCbLogs(m.diffs) ),
            subscribe(()=>{})
        )
        socket.sendCodeToServer = () => {
            const host = jb.path(jb.studio,'studiojb.studio.host')
            if (!host) return Promise.resolve()
            return libs.reduce((pr,module) => pr.then(() => {
                const moduleFileName = host.locationToPath(`${host.pathOfDistFolder()}/${module}.js`)
                return host.getFile(moduleFileName).then(loadCode => socket.postObj({ loadCode, moduleFileName }))
            }), Promise.resolve()).then(() => socket.postObj({ loadCode: 'pptr.remote.onServer = true', moduleFileName: '' }))
        }
        return socket
    }
})

jb.component('pptr.refreshServerCode', {
    type: 'action',
    params: [
        {id: 'remote', type: 'remote', defaultValue: pptr.server()}
    ],
    impl: '%$remote.sendCodeToServer()%'
})

jb.component('pptr.mapPromise', {
    type: 'rx',
    params: [
      {id: 'func', dynamic: true },
    ],
    impl: If(remote.onServer(), rx.mapPromise('%$func%'), remote.innerRx(rx.mapPromise('%$func%'),pptr.server()))
})

jb.component('pptr.doPromise', {
    type: 'rx',
    params: [
      {id: 'func', dynamic: true },
    ],
    impl: If(remote.onServer(), rx.doPromise('%$func%'), remote.innerRx(rx.doPromise('%$func%'),pptr.server()))
})

;

jb.ns('pptr,rx')

jb.component('pptr.newPage', {
  type: 'rx,pptr',
  params: [
    {id: 'url', as: 'string', dynamic: true, mandatory: true},
    {id: 'waitUntil', as: 'string', defaultValue: 'load', options: 'load:load event is fired,domcontentloaded:DOMContentLoaded event is fired,networkidle0:no more than 0 network connections for at least 500 ms,networkidle2:no more than 2 network connections for at least 500 ms'},
    {id: 'timeout', as: 'number', defaultValue: 20000, description: 'maximum time to wait for in milliseconds'}
  ],
  impl: rx.innerPipe(
    rx.var('url', '%$url()%'),
    pptr.mapPromise(({},{browser}) => browser.newPage()),
    rx.var('page', '%%'),
    pptr.doPromise(
        (ctx,{url},{waitUntil,timeout}) => jb.pptr.runMethod(ctx,'goto',url,{waitUntil, timeout})
      )
  )
})

jb.component('pptr.selectElement', {
    type: 'rx,pptr',
    params: [
        {id: 'select', type: 'pptr.selector', mandatory: true },
        {id: 'startAt', defaultValue: '%%', dynamic: true },
        {id: 'retryInterval', as: 'number', defaultValue: 300, description: '0 means no retries' },
        {id: 'retryTimes', as: 'number', defaultValue: 30 },
    ],
    impl: rx.innerPipe(
        rx.map('%$startAt()%'),
        rx.retry({ 
            operator: '%$select%', 
            interval: '%$retryInterval%', 
            times: '%$retryTimes%', 
//            onRetry: (ctx,{pptrSession},{retryTimes}) => pptrSession.events.next({$: 'Activity', activity: `retry ${ctx.data} of ${retryTimes}`, ctx}) 
        }),
        rx.var('%$resultVar%')),
})

jb.component('pptr.querySelector', {
  type: 'rx,pptr,pptr.selector',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'multiple', as: 'boolean', description: 'querySelectorAll'}
  ],
  impl: pptr.mapPromise(
    (ctx,{},{selector,multiple}) => jb.pptr.runMethod(ctx, multiple ? '$$' : '$',selector)
  )
})

jb.component('pptr.xpath', {
    type: 'rx,pptr,pptr.selector',
    params: [
        {id: 'xpath', as: 'string', mandatory: true, description: "e.g, //*[contains(text(), 'Hello')]" },
    ],
    impl: pptr.mapPromise((ctx,{},{xpath}) => jb.pptr.runMethod(ctx,'$x',xpath)),
})

jb.component('pptr.jsFunction', {
  type: 'rx,pptr,pptr.selector',
  params: [
    {id: 'expression', as: 'string', mandatory: true}
  ],
  impl: pptr.mapPromise(
    (ctx,{frame,page},{expression}) => (frame || page).waitForFunction(expression,{},ctx.data)
  )
})

jb.component('pptr.jsProperty', {
    type: 'rx,pptr,pptr.selector',
    params: [
        {id: 'propName', as: 'string',  options: 'value,innerHTML,outerHTML,href,textContent', mandatory: true}
    ],
    impl: pptr.mapPromise((ctx,{},{propName}) => jb.pptr.runMethod(ctx,'evaluate',eval(`x => x && x.${propName} `),ctx.data))
})

jb.component('pptr.elementWithText', {
    type: 'rx,pptr,pptr.selector',
    description: 'look for a node with text',
    params: [
        {id: 'text', as: 'string', mandatory: true },
    ],
    impl: rx.innerPipe(
        pptr.mapPromise((ctx,{},{text}) => jb.pptr.runMethod(ctx,'$x',`//*[contains(text(),'${text}')]`,ctx.data)),
        rx.flatMapArrays()
    )
})

// jb.component('pptr.extractBySelector', {
//     type: 'rx,pptr',
//     params: [
//         {id: 'selector', as: 'string' },
//         {id: 'propName', as: 'string', options: 'value,innerHTML,outerHTML,href,textContent', defaultValue: 'textContent'},
//         {id: 'multiple', as: 'boolean' },
//         {id: 'timeout', as: 'number', defaultValue: 5000, description: 'maximum time to wait in milliseconds' },
//     ],
//     impl: rx.innerPipe(
//         pptr.mapPromise((ctx,{},{selector,multiple}) => jb.pptr.runMethod(ctx,multiple ? '$$' : '$',selector)),
//         pptr.getProperty('%$propName%'),
//         pptr.logData()
//     )
// })

// jb.component('pptr.waitForSelector', {
//     type: 'rx,pptr',
//     params: [
//         {id: 'selector', as: 'string' },
//         {id: 'visible', as: 'boolean', description: 'wait for element to be present in DOM and to be visible, i.e. to not have display: none or visibility: hidden CSS properties' },
//         {id: 'hidden ', as: 'boolean', description: 'wait for element to not be found in the DOM or to be hidden' },
//         {id: 'timeout', as: 'number', defaultValue: 5000, description: 'maximum time to wait for in milliseconds' },
//     ],
//     impl: pptr.doPromise((ctx,{},{selector,visible,hidden, timeout}) => jb.pptr.runMethod(ctx,'waitForSelector',selector,{visible,hidden, timeout}))
// })

// jb.component('pptr.extractWithEval', {
//   type: 'rx,pptr',
//   description: 'evaluate javascript expression',
//   params: [
//     {id: 'expression', as: 'string', mandatory: true}
//   ],
//   impl: rx.innerPipe(
//     pptr.mapPromise((ctx,{},{expression}) => jb.pptr.runMethod(ctx,'evaluate',expression)),
//     pptr.logData()
//   )
// })

// jb.component('pptr.getProperty', {
//     type: 'rx,pptr',
//     description: 'get property of object',
//     params: [
//       {id: 'propName', as: 'string',  options: 'value,innerHTML,outerHTML,href,textContent', mandatory: true}
//     ],
//     impl: pptr.mapPromise((ctx,{},{propName}) => jb.pptr.runMethod(ctx,'evaluate',eval(`x => x && x.${propName} `))),
// })

// jb.component('pptr.waitForFunction', {
//     type: 'rx,pptr',
//     params: [
//         {id: 'condition', as: 'string' },
//         {id: 'noReturnValue', as: 'boolean' },
//         {id: 'polling', type: 'pptr.polling', defaultValue: pptr.raf() },
//         {id: 'timeout', as: 'number', defaultValue: 5000, description: '0 to disable, maximum time to wait for in milliseconds' },
//     ],
//     impl: If('%$noReturnValue%', 
//         pptr.doPromise((ctx,{},{condition,polling,timeout}) => jb.pptr.runMethod(ctx,'waitForFunction',condition,{polling, timeout})),
//         pptr.mapPromise((ctx,{},{condition,polling,timeout}) => jb.pptr.runMethod(ctx,'waitForFunction',condition,{polling, timeout})))
// })

// jb.component('pptr.evaluate', {
//   type: 'rx,pptr',
//   description: 'evaluate javascript expression',
//   params: [
//     {id: 'expression', as: 'string', mandatory: true},
//     {id: 'noReturnValue', as: 'boolean' },
//   ],
//   impl: If('%$noReturnValue%', 
//     pptr.doPromise((ctx,{},{condition,polling,timeout}) => jb.pptr.runMethod(ctx,'evaluate',condition,{polling, timeout})),
//     pptr.mapPromise((ctx,{},{condition,polling,timeout}) => jb.pptr.runMethod(ctx,'evaluate',condition,{polling, timeout})))
// })


jb.component('pptr.mouseClick', {
    type: 'rx,pptr',
    description: 'clicks on current element',
    params: [
        {id: 'button', as: 'string', options:'left,right,middle'},
        {id: 'clickCount', as: 'number', description: 'default is 1' },
        {id: 'delay', as: 'number', description: 'Time to wait between mousedown and mouseup in milliseconds. Defaults to 0' },
    ],
    impl: pptr.doPromise(({data},{},args) => data && data.constructor.name == 'ElementHandle' && data.click(args))
})

jb.component('pptr.type', {
    description: 'enter input form field data',
    type: 'rx,pptr',
    params: [
        {id: 'text', as: 'string', mandatory: true },
        {id: 'enterAtEnd', as: 'boolean', defaultValue: true },
        {id: 'delay', as: 'number', defaultValue: 100, description: 'time between clicks' },
    ],
    impl: pptr.doPromise((ctx,{},{text, enterAtEnd, delay}) => jb.pptr.runMethod(ctx,'type', text + (enterAtEnd ? String.fromCharCode(13): ''), {delay}))
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
    impl: pptr.evaluate('setInterval(() => { %$action% } ,%$intervalTime%)')
})

jb.component('pptr.endlessScrollDown', {
    type: 'rx,pptr',
    impl: rx.innerPipe(
        pptr.repeatingAction('window.scrollPos = window.scrollPos || []; window.scrollPos.push(window.scrollY); window.scrollTo(0,document.body.scrollHeight)' ,500),
        pptr.waitForFunction('window.scrollPos && Math.max.apply(0,window.scrollPos.slice(-4)) == Math.min.apply(0,window.scrollPos.slice(-4))'))
})

// ************ frames *********

jb.component('pptr.gotoInnerFrameBody', {
    type: 'rx,pptr',
    impl: pptr.selectElement(pptr.jsFunction("document.querySelector('iframe').contentDocument.body"))
})

jb.component('pptr.javascriptOnPptr', {
    type: 'rx,pptr',
    description: 'advanced, run the function on the pptr server using pptr api',
    params: [
        {id: 'func', dynamic: true, mandatory: true}
    ],
    impl: pptr.mapPromise((ctx,{},{func}) => func(ctx))
})

jb.component('pptr.contentFrame', {
    type: 'rx,pptr',
    description: 'retruns a frame object of the current element',
    impl: pptr.mapPromise(({data}) => data.contentFrame && data.contentFrame())
})

// page.mouse.move(100, 100);
// page.mouse.down();
// page.mouse.move(200, 200);
// page.mouse.up();
// await page.type('#mytextarea', 'Hello'); // Types instantly
// await page.type('#mytextarea', 'World', {delay: 100}); // Types slower, like a user
//page.setJavaScriptEnabled(enabled);

jb.ns('pptr')

jb.component('pptr.crawler', {
    type: 'pptr.crawler',
    params: [
        {id: 'rootUrl', as: 'string'},
        {id: 'pageCrawlers', type: 'pptr.page-crawler[]' },
        {id: 'resultData', defaultValue: '%$pptr.resultData%' },
        {id: 'resultIndex', defaultValue: '%$pptr.requestQueue/resultIndex%', description: 'watchable data to get get events about data changes' },
        {id: 'requestQueue', defaultValue: '%$pptr.requestQueue/mainQueue%', description: '{url, vars?, nextPptrPageType? }' },
    ]
})

jb.component('pptr.pageCrawler', {
    type: 'pptr.page-crawler',
    params: [
        {id: 'url', as: 'string' },
        {id: 'features', type: 'pptr.feature[]', as: 'array', dynamic: true ,flattenArray: true},
        {id: 'extract', type: 'pptr.extract', mandatory: true },
        {id: 'transformToResultItems', dynamic: true, description: 'single or array, better to have id'},
        {id: 'transformToUrlRequests', dynamic: true, templateValue: obj(prop('url','%%')), description: 'optional props: varsForFollowing, nextPptrPageType' },
    ]
})


// move to data file
jb.component('pptr.resultData', { passiveData: {

}})

jb.component('pptr.requestQueue', { watchableData: {
    mainQueue: {},
    resultIndex: {}
}})
;

