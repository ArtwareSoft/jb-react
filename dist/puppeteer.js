jb.pptr = {
    hasPptrServer: () => typeof hasPptrServer != 'undefined',
    createProxySocket: () => new WebSocket(`ws:${(jb.studio.studioWindow || jb.frame).location.hostname || 'localhost'}:8090`),
    createComp(ctx,args) {
        return jb.pptr.hasPptrServer() ? this.createServerComp(ctx,args) : this.createProxyComp(ctx,args)
    },
    puppeteer() {
        return puppeteer
    },
    getOrCreateBrowser(showBrowser) {
        if (this._browser) return Promise.resolve(this._browser)
        return this.puppeteer().launch({headless: !showBrowser}).then(browser => this._browser = browser)
    },
    createServerComp(ctx,{showBrowser}) {
        const {subject, subscribe, pipe, map, Do } = jb.callbag
        const comp = {
            events: subject(),
            commands: subject(),
        }
        const actions = jb.asArray(ctx.profile.actions)
        const wrappedActions = actions.flatMap( (action,i) => action ? [
                rx.doPromise( ctx => comp.events.next({$: 'Started', ctx, path: `actions~${i}` })),
                actions[i],
                rx.catchError( error => { comp.events.next({$: 'Error', error, path: `actions~${i}`, ctx }); return ctx }),
                rx.doPromise( ctx => comp.events.next({$: 'Emit', ctx, path: `actions~${i}` })),
        ] : [])

        ctx.run(
            rx.pipe(
                rx.fromPromise(() => this.getOrCreateBrowser(showBrowser)),
                rx.var('browser'),
                rx.mapPromise(({},{browser}) => browser.newPage()),
                rx.var('page', ({data}) => data),
                rx.var('comp',comp),
                ...wrappedActions,
                rx.catchError(err =>comp.events.next({$: 'error', err })),
                rx.subscribe('')
            )
        )
        pipe(comp.commands, map(cmd=> ctx.run(cmd)), subscribe(() => {}) )
        pipe(comp.events, subscribe( ev => ctx.vars.clientSocket.send(eventToJson(ev))))
        return comp

        function eventToJson(ev) {
            ev.ctx = ev.ctx || {}
            const res = { ...ev, err: chopObj(ev.err,3), ctx: null, vars: chopObj(ev.ctx.vars,3), data: chopObj(ev.ctx.data ,2) }
            res.vars && res.vars.comp && delete res.vars['comp']
            
            return JSON.stringify(res)
        }
        function chopObj(obj, depth) {
            if (depth < 1) return
            if (obj == null) obj = 'null'
            if (typeof obj == 'object') {
                if (obj.constructor.name == 'Frame') obj = `Frame: ${obj._url}`
                else if (obj.constructor.name == 'ElementHandle') obj = `Elem: ${obj.toString()}`
                else if (!(obj.constructor.name||'').match(/^Object|Array$/))
                    obj = obj.constructor.name
            }
            if (['string','boolean','number'].indexOf(typeof obj) != -1) return obj
            return obj && typeof obj == 'object' && jb.objFromEntries( jb.entries(obj).map(([id,val])=>[id,chopObj(val, depth-1)]).filter(e=>e[1] != null) )
        }
    },
    createProxyComp(ctx,{databindEvents}) {
        const {pipe,skip,take,subject,subscribe,doPromise} = jb.callbag
        const receive = subject(), commands = subject()
        const socket = jb.pptr.createProxySocket()
        socket.onmessage = ({data}) => {
            const message = JSON.parse(data)
            if (message.error)
                jb.logError('error from puppeteer',[message.error,ctx])
            message.path = [ctx.path,message.path ||''].join('~')
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

        const comp = { events: skip(1)(receive), commands }
        jb.pptr._proxyComp = comp
        pipe(receive,take(1),
            doPromise(m => m.res == 'loadCodeReq' && ctx.setVar('comp',comp).run(pptr.sendCodeToServer())),
            subscribe(()=> comp.commands.next({run: ctx.profile})))
        pipe(receive,subscribe(message =>databindEvents && jb.push(databindEvents, message,ctx)))
        
        return comp
    },
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
            return host.getFile(moduleFileName).then( 
                loadCode => (ctx.vars.comp || jb.pptr._proxyComp).commands.next({ loadCode, moduleFileName }))
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
  impl: (ctx,showBrowser,databindEvents) => jb.pptr.createComp(ctx,{showBrowser,databindEvents})
})

jb.component('pptr.remoteActions', {
    type: 'action,has-side-effects',
    params: [
        {id: 'actions', type: 'pptr[]', ignore: true },
        {id: 'session', defaultValue: '%$pptrSession%' },
    ],
    impl: ctx => jb.asArray(ctx.profile.actions).forEach(profile => ctx.params.session && ctx.params.session.commands.next({run: profile}))
})
;

jb.ns('pptr,rx')

jb.component('pptr.gotoPage', {
  type: 'rx,pptr',
  params: [
    {id: 'url', as: 'string', mandatory: true},
    {id: 'waitUntil', as: 'string', defaultValue: 'load', options: 'load:load event is fired,domcontentloaded:DOMContentLoaded event is fired,networkidle0:no more than 0 network connections for at least 500 ms,networkidle2:no more than 2 network connections for at least 500 ms'},
    {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait for in milliseconds'}
  ],
  impl: rx.innerPipe(
    rx.var('url', ({},{},{url}) => url),
    rx.doPromise(
        ({},{page},{url,waitUntil,timeout}) => page.goto(url,{waitUntil, timeout})
      ),
    rx.mapPromise(({},{page}) => page.title()),
    rx.var('pageTitle'),
    pptr.gotoMainFrame()
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

jb.component('pptr.Info', {
    type: 'rx,pptr',
    params: [
        {id: 'info', as: 'string', mandatory: true },
        {id: 'description', as: 'string' },
    ],
    impl: rx.doPromise((ctx,{comp},{info, description}) => comp.events.next({$: 'Info', info, description, ctx }))
})

jb.component('pptr.Error', {
    type: 'rx,pptr',
    params: [
        {id: 'error', as: 'string', mandatory: true },
        {id: 'description', as: 'string' },
    ],
    impl: rx.doPromise((ctx,{comp},{error, description}) => comp.events.next({$: 'Error', error, description, ctx }))
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
                rx.flatMapArrays('%%'),
        pptr.logData()
    )
})

jb.component('pptr.querySelector', {
    type: 'rx,pptr',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'multiple', as: 'boolean', description: 'querySelectorAll' },
    ],
    impl: rx.mapPromise((ctx,{frame},{selector,multiple}) => multiple ? frame.$$(selector) : frame.$(selector)),
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
    {id: 'expression', as: 'string', mandatory: true}
  ],
  impl: rx.innerPipe(
    rx.mapPromise((ctx,{frame},{expression}) => frame.evaluate(expression)),
    pptr.logData()
  )
})

jb.component('pptr.eval', {
  type: 'rx,pptr',
  description: 'evaluate javascript expression',
  params: [
    {id: 'expression', as: 'string', mandatory: true},
    {id: 'varName', as: 'string', description: 'leave empty for no vars'}
  ],
  impl: If('%$varName%', rx.innerPipe(
            rx.mapPromise((ctx,{frame},{expression}) => frame.evaluate(expression)),
            rx.var('%$varName%')
        ), rx.mapPromise((ctx,{frame},{expression}) => frame.evaluate(expression)))
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
        rx.doPromise((ctx,{frame},{text, enterAtEnd, selector,delay}) => frame.type(selector, text + (enterAtEnd ? String.fromCharCode(13): ''), {delay}))
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

jb.component('pptr.gotoMainFrame', {
  type: 'rx,pptr',
  impl: rx.var(
    'frame',
    (ctx,{page}) => page.mainFrame()
  )
})

jb.component('pptr.contentFrame', {
    type: 'rx,pptr',
    impl: rx.innerPipe(
        rx.mapPromise(({data}) => Promise.resolve().then(() => data.contentFrame())),
        rx.var('frame')
    )
})

jb.component('pptr.gotoFrameById', {
    type: 'rx,pptr',
    params: [
      {id: 'frameId', as: 'string', mandatory: true }
    ],
    impl: rx.innerPipe(
        pptr.querySelector('#%$frameId%'),
        pptr.contentFrame(),
    )
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

