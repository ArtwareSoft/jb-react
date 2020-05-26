jb.pptr = {
    isPptrServer: () => typeof hasPptrServer != 'undefined',
    createProxySocket: () => new WebSocket(`ws:${(jb.studio.studioWindow || jb.frame).location.hostname || 'localhost'}:8090`),
    createSession(ctx,args) {
        return jb.pptr.isPptrServer() ? this.createServerSession(ctx,args) : this.createProxySession(ctx,args)
    },
    puppeteer() {
        return puppeteer
    },
    getOrCreateBrowser(showBrowser) {
        if (this._browser) return Promise.resolve(this._browser)
        return this.puppeteer().launch({headless: !showBrowser, 
            args: ['--disable-features=site-per-process','--enable-devtools-experiments'],
            }).then(browser => this._browser = browser)
    },
    createServerSession(ctx,{showBrowser}) {
        const {subject, subscribe, pipe, Do } = jb.callbag
        const pptrSession = {
            events: subject(),
            commands: subject(),
        }
        const actions = jb.asArray(ctx.profile.actions)
        let lastCtx = ctx
        const wrappedActions = actions.flatMap( (action,i) => action ? [
                rx.var('actionIndex',i),
                rx.doPromise( ctx => pptrSession.events.next({$: 'Started', ctx })),
                actions[i],
                rx.catchError( err => { pptrSession.events.next({$: 'Error', err: err && err.data || err, ctx }); return lastCtx }),
                rx.doPromise( ctx => {
                    lastCtx = ctx
                    pptrSession.events.next({$: 'Emit', ctx }) 
                }),
        ] : [])


        ctx.run(
            rx.pipe(
                Var('$throw',true),
                rx.fromPromise(() => this.getOrCreateBrowser(showBrowser)),
                rx.var('browser'),
                rx.mapPromise(({},{browser}) => browser.newPage()),
                rx.var('page', '%%'),
                rx.var('pptrSession',pptrSession),
                ...wrappedActions,
                rx.catchError(err =>pptrSession.events.next({$: 'Error', err })),
                rx.subscribe('')
            )
        )
        pipe(pptrSession.commands, Do(cmd=> ctx.run(cmd)), subscribe(() => {}) )
        pipe(pptrSession.events, subscribe( ev => ctx.vars.clientSocket.send(eventToJson(ev))))
        return pptrSession

        function eventToJson(ev) {
            ev.ctx = ev.ctx || {}
            const res = { ...ev, err: chopObj(ev.err,3), ctx: null, vars: chopObj(ev.ctx.vars,3), data: chopObj(ev.ctx.data ,3) }
            res.vars && res.vars.pptrSession && delete res.vars['pptrSession']
            
            return JSON.stringify(res)
        }
        function chopObj(obj, depth) {
            if (depth < 1) return
            if (obj == null) obj = 'null'
            if (obj._remoteObject) obj = obj._remoteObject
            else if (typeof obj == 'object') {
                if (obj.constructor.name == 'Frame') obj = `Frame: ${obj._url}`
                else if (obj.message && obj.stack) obj = {$: 'Error', message: obj.message, stack: obj.stack}
                else if (obj.constructor.name == 'ElementHandle') obj = `Elem: ${obj._remoteObject.description}`
                else if (!(obj.constructor.name||'').match(/^Object|Array$/))
                    obj = obj.constructor.name
            }
            if (['string','boolean','number'].indexOf(typeof obj) != -1) return obj
            if (Array.isArray(obj)) return obj.map(val =>chopObj(val, depth-1))
            return obj && typeof obj == 'object' && jb.objFromEntries( jb.entries(obj).map(([id,val])=>[id,chopObj(val, depth-1)]).filter(e=>e[1] != null) )
        }
    },
    createProxySession(ctx,{databindEvents}) {
        const {pipe,skip,take,subject,subscribe,doPromise} = jb.callbag
        const receive = subject(), commands = subject()
        const socket = jb.pptr.createProxySocket()
        socket.onmessage = ({data}) => {
            const message = JSON.parse(data)
            if (message.vars)
                message.path = [ctx.path,'actions',message.vars.actionIndex].join('~')
            jb.log('pptr'+(message.$ ||''),[message])
            receive.next(message)
        }
        socket.onerror = e => receive.error(e)
        socket.onclose = e => {
            const host = jb.path(jb.studio,'studiojb.studio.host')
            if (host && e.code == 1006)
                host.showError('puppeteer server is down. please install and run from https://github.com/ArtwareSoft/jb-puppeteer-server.git')
            else if (host && e.code != 1000)
                host.showError('puppeteer server error: ' + e.code)
            receive.complete()
        }
        socket.onopen = () => pipe(commands, subscribe(cmd => socket.send(cmd.run ? jb.prettyPrint(cmd,{noMacros: true}) : JSON.stringify(cmd))))

        const pptrSession = { events: skip(1)(receive), commands }
        jb.pptr._proxySession = pptrSession
        pipe(receive,take(1),
            doPromise(m => m.res == 'loadCodeReq' && ctx.setVar('pptrSession',pptrSession).run(pptr.sendCodeToServer())),
            subscribe(()=> pptrSession.commands.next({run: ctx.profile})))
        pipe(receive,subscribe(message =>databindEvents && jb.push(databindEvents, message,ctx)))
        
        return pptrSession
    },
    runMethod(ctx,method,...args) {
        const obj = [ctx.data,ctx.vars.frame,ctx.vars.page].filter(x=>x && x[method])[0]
        return obj && Promise.resolve().then(()=>obj[method](...args)).catch(err=> {
            ctx.vars.pptrSession.events.next({$: 'Error', message: err.message, stack: err.stack, ctx })
            return null
        })
    }
}

jb.component('pptr.sendCodeToServer', {
    type: 'action',
    params: [
      {id: 'modules', as: 'string', defaultValue: 'common,rx,puppeteer'},
    ],
    impl: (ctx,modules) => {
        const host = jb.path(jb.studio,'studiojb.studio.host')
        if (!host) return Promise.resolve()
        return modules.split(',').reduce((pr,module) => pr.then(() => {
            const moduleFileName = host.locationToPath(`${host.pathOfDistFolder()}/${module}.js`)
            return host.getFile(moduleFileName).then(loadCode => {
                const session = ctx.vars.pptrSession || jb.pptr._proxySession
                session && session.commands.next({ loadCode, moduleFileName })
            })
        }), Promise.resolve())
    }
})

jb.component('pptr.session', {
  description: 'starts puppeteer session, returns object that can be used to interact with the server',
  type: 'action,rx,has-side-effects',
  category: 'source',
  params: [
    {id: 'showBrowser', as: 'boolean'},
    {id: 'databindEvents', as: 'ref', description: 'bind events from puppeteer to array (watchable)'},
    {id: 'actions', type: 'rx[]', ignore: true, templateValue: []}
  ],
  impl: (ctx,showBrowser,databindEvents) => jb.pptr.createSession(ctx,{showBrowser,databindEvents})
})

jb.component('pptr.logData', {
    type: 'rx,pptr',
    impl: rx.doPromise(
      (ctx,{pptrSession}) => pptrSession.events.next({$: 'ResultData', ctx })
    )
})

jb.component('pptr.logActivity', {
    type: 'rx,pptr',
    params: [
        {id: 'activity', as: 'string', mandatory: true },
        {id: 'description', as: 'string' },
    ],
    impl: rx.doPromise((ctx,{pptrSession},{activity, description}) => pptrSession.events.next({$: 'Activity', activity, description, ctx }))
})

jb.component('pptr.runMethodOnPptr', {
    type: 'rx,pptr',
    description: 'run method on the current object on pptr server using pptr api',
    params: [
      {id: 'method', as: 'string', mandatory: true},
      {id: 'args', as: 'array'},
    ],
    impl: rx.mapPromise((ctx,{},{method,args}) => jb.pptr.runMethod(ctx,method,args)),
})
;

jb.ns('pptr,rx')

jb.component('pptr.gotoPage', {
  type: 'rx,pptr',
  params: [
    {id: 'url', as: 'string', mandatory: true},
    {id: 'waitUntil', as: 'string', defaultValue: 'load', options: 'load:load event is fired,domcontentloaded:DOMContentLoaded event is fired,networkidle0:no more than 0 network connections for at least 500 ms,networkidle2:no more than 2 network connections for at least 500 ms'},
    {id: 'timeout', as: 'number', defaultValue: 20000, description: 'maximum time to wait for in milliseconds'}
  ],
  impl: rx.innerPipe(
    rx.var('url', '%$url%'),
    rx.doPromise(
        (ctx,{},{url,waitUntil,timeout}) => jb.pptr.runMethod(ctx,'goto',url,{waitUntil, timeout})
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
        {id: 'selector', as: 'string' },
        {id: 'multiple', as: 'boolean', description: 'querySelectorAll' },
    ],
    impl: rx.mapPromise((ctx,{},{selector,multiple}) => jb.pptr.runMethod(ctx, multiple ? '$$' : '$',selector)),
})

jb.component('pptr.xpath', {
    type: 'pptr.selector',
    params: [
        {id: 'xpath', as: 'string', mandatory: true, description: "e.g, //*[contains(text(), 'Hello')]" },
    ],
    impl: rx.mapPromise((ctx,{},{xpath}) => jb.pptr.runMethod(ctx,'$x',xpath)),
})

jb.component('pptr.jsFunction', {
    type: 'pptr.selector',
    params: [
        {id: 'expression', as: 'string', mandatory: true },
    ],
    impl: rx.mapPromise((ctx,{frame,page},{expression}) => (frame || page).waitForFunction(expression,{},ctx.data))
})

jb.component('pptr.jsProperty', {
    type: 'pptr.selector',
    params: [
        {id: 'propName', as: 'string',  options: 'value,innerHTML,outerHTML,href,textContent', mandatory: true}
    ],
    impl: rx.mapPromise((ctx,{},{propName}) => jb.pptr.runMethod(ctx,'evaluate',eval(`x => x && x.${propName} `,ctx.data)))
})

jb.component('pptr.elementWithText', {
    type: 'pptr.selector',
    description: 'look for a node with text',
    params: [
        {id: 'text', as: 'string', mandatory: true },
    ],
    impl: rx.innerPipe(
        rx.mapPromise((ctx,{},{text}) => jb.pptr.runMethod(ctx,'$x',`//*[contains(text(),'${text}')]`,ctx.data)),
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
//         rx.mapPromise((ctx,{},{selector,multiple}) => jb.pptr.runMethod(ctx,multiple ? '$$' : '$',selector)),
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
//     impl: rx.doPromise((ctx,{},{selector,visible,hidden, timeout}) => jb.pptr.runMethod(ctx,'waitForSelector',selector,{visible,hidden, timeout}))
// })

// jb.component('pptr.extractWithEval', {
//   type: 'rx,pptr',
//   description: 'evaluate javascript expression',
//   params: [
//     {id: 'expression', as: 'string', mandatory: true}
//   ],
//   impl: rx.innerPipe(
//     rx.mapPromise((ctx,{},{expression}) => jb.pptr.runMethod(ctx,'evaluate',expression)),
//     pptr.logData()
//   )
// })

// jb.component('pptr.getProperty', {
//     type: 'rx,pptr',
//     description: 'get property of object',
//     params: [
//       {id: 'propName', as: 'string',  options: 'value,innerHTML,outerHTML,href,textContent', mandatory: true}
//     ],
//     impl: rx.mapPromise((ctx,{},{propName}) => jb.pptr.runMethod(ctx,'evaluate',eval(`x => x && x.${propName} `))),
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
//         rx.doPromise((ctx,{},{condition,polling,timeout}) => jb.pptr.runMethod(ctx,'waitForFunction',condition,{polling, timeout})),
//         rx.mapPromise((ctx,{},{condition,polling,timeout}) => jb.pptr.runMethod(ctx,'waitForFunction',condition,{polling, timeout})))
// })

// jb.component('pptr.evaluate', {
//   type: 'rx,pptr',
//   description: 'evaluate javascript expression',
//   params: [
//     {id: 'expression', as: 'string', mandatory: true},
//     {id: 'noReturnValue', as: 'boolean' },
//   ],
//   impl: If('%$noReturnValue%', 
//     rx.doPromise((ctx,{},{condition,polling,timeout}) => jb.pptr.runMethod(ctx,'evaluate',condition,{polling, timeout})),
//     rx.mapPromise((ctx,{},{condition,polling,timeout}) => jb.pptr.runMethod(ctx,'evaluate',condition,{polling, timeout})))
// })


jb.component('pptr.mouseClick', {
    type: 'rx,pptr',
    description: 'clicks on current element',
    params: [
        {id: 'button', as: 'string', options:'left,right,middle'},
        {id: 'clickCount', as: 'number', description: 'default is 1' },
        {id: 'delay', as: 'number', description: 'Time to wait between mousedown and mouseup in milliseconds. Defaults to 0' },
    ],
    impl: rx.doPromise(({data},{},args) => data && data.constructor.name == 'ElementHandle' && data.click(args))
})

jb.component('pptr.type', {
    description: 'enter input form field data',
    type: 'rx,pptr',
    params: [
        {id: 'text', as: 'string', mandatory: true },
        {id: 'enterAtEnd', as: 'boolean', defaultValue: true },
        {id: 'delay', as: 'number', defaultValue: 100, description: 'time between clicks' },
    ],
    impl: rx.doPromise((ctx,{},{text, enterAtEnd, delay}) => jb.pptr.runMethod(ctx,'type', text + (enterAtEnd ? String.fromCharCode(13): ''), {delay}))
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
    type: 'pptr',
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
    impl: rx.mapPromise((ctx,{},{func}) => func(ctx))
})

jb.component('pptr.contentFrame', {
    type: 'rx,pptr',
    description: 'retruns a frame object of the current element',
    impl: rx.mapPromise(({data}) => data.contentFrame && data.contentFrame())
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

