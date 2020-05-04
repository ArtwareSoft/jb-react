jb.pptr = { 
    hasPptrServer: () => typeof hasPptrServer != 'undefined',
    createProxySocket: () => new WebSocket(`ws:${(jb.studio.studioWindow || jb.frame).location.hostname || 'localhost'}:8090`),
    createComp(ctx,args) {
        return jb.pptr.hasPptrServer() ? this.createServerComp(ctx,args) : this.createProxyComp(ctx)
    },
    puppeteer() {
        return puppeteer
    },
    getOrCreateBrowser(showBrowser) {
        if (this._browser) return Promise.resolve(this._browser)
        return this.puppeteer().launch({headless: !showBrowser}).then(browser => this._browser = browser)
    },
    createServerComp(ctx,{showBrowser,actions}) {
        const {subject, subscribe, pipe, map} = jb.callbag
        const comp = {
            events: subject(),
            commands: subject(),
        }
        ctx.setVar('comp',comp).run(
            rx.pipe(
                rx.fromPromise(() => this.getOrCreateBrowser(showBrowser)),
                rx.var('browser'),
                () => source => jb.callbag.pipe(source, ...actions()),
                rx.subscribe('')
            )
        )
        pipe(comp.commands, map(cmd=> ctx.run(cmd)), subscribe(() => {}) )
        pipe(comp.events, subscribe( ev => ctx.vars.clientSocket.send(eventToJson(ev))))
        return comp

        function eventToJson(ev) {
            const vars = jb.objFromEntries(jb.entries(jb.path(ev,'ctx.vars')).filter(e=> ['string','boolean','number'].indexOf(typeof e[1]) != -1))
            return JSON.stringify({ ...ev, ctx: null, data: (ev.ctx || {}).data, vars })
        }
    },
    createProxyComp(ctx) {
        const {pipe,skip,take,toPromiseArray,subject,subscribe} = jb.callbag
        const receive = subject(), commands = subject()
        const socket = jb.pptr.createProxySocket()
        socket.onmessage = ({data}) => {
            const _data = JSON.parse(data)
            if (_data.error)
                jb.logError('error from puppeteer',[_data.error,ctx])
            _data.res && receive.next(_data.res)
        }
        socket.onerror = e => receive.error(e)
        socket.onclose = () => receive.complete()
        socket.onopen = () => loadServerCode().then(()=> commands.next({run: ctx.profile}))
        
        pipe(commands, subscribe(cmd => socket.send(JSON.stringify(cmd))))

        return { events: skip(1)(receive), commands }

        function loadServerCode() {
            const st = (jb.path(jb,'studio.studiojb') || jb).studio
            if (!st.host) return Promise.resolve()
            return toPromiseArray(pipe(receive,take(1))).then(([m]) =>{
//                if (m == 'loadCodeReq') {
                    return 'common,rx,puppeteer'.split(',').reduce((pr,module) => pr.then(() => {
                            const moduleFileName = `${st.host.pathOfDistFolder()}/${module}.js`
                            return st.host.getFile(moduleFileName).then( loadCode => socket.send(JSON.stringify({ loadCode, moduleFileName })))
                        }), Promise.resolve())
//                        .then(() => socket.send(JSON.stringify({ require: 'puppeteer', writeTo: 'puppeteer'})))
//                }
            })
        }
    },
}


;

jb.ns('pptr,rx')

jb.component('pptr.session', {
    type: 'rx',
    params: [
        {id: 'showBrowser', as: 'boolean' },
        {id: 'actions', type: 'rx[]', dynamic: true, templateValue: [] },
    ],
    impl: (ctx,showBrowser,actions) => jb.pptr.createComp(ctx,{showBrowser, actions})
})

jb.component('pptr.gotoPage', {
    type: 'rx',
    params: [
        {id: 'url', as: 'string', mandatory: true },
        {id: 'frame', type: 'pptr.frame', dynamic: true, defaultValue: pptr.mainFrame() },
        {id: 'waitUntil', as: 'string', options: [
            'load:load event is fired','domcontentloaded:DOMContentLoaded event is fired',
            'networkidle0:no more than 0 network connections for at least 500 ms',
            'networkidle2:no more than 2 network connections for at least 500 ms'].join(',')},
        {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait for in milliseconds' },
    ],
    impl: rx.innerPipe(rx.mapPromise( (ctx,{browser}) => browser.newPage()),
        rx.var('page'),
        rx.var('url', ({},{},{url}) => url),
        pptr.logActivity('start navigation','%$url%'),
        rx.doPromise( ({},{page},{url}) => page.goto(url)),
        rx.mapPromise((ctx,{},{frame}) => frame(ctx)),
        rx.var('frame'),
        rx.doPromise( (ctx,{frame},{waitUntil,timeout}) => frame.waitForNavigation({waitUntil, timeout})),
        pptr.logActivity('end navigation','%$url%')
    )
})

jb.component('pptr.logData', {
    type: 'rx',
    impl: rx.doPromise((ctx,{comp}) => comp.events.next({$: 'result-data', ctx }))
})

jb.component('pptr.logActivity', {
    type: 'rx',
    params: [
        {id: 'activity', as: 'string', mandatory: true },
        {id: 'description', as: 'string' },
    ],
    impl: rx.doPromise((ctx,{comp},{activity, description}) => comp.events.next({$: activity, description, ctx }))
})

jb.component('pptr.extractWithSelector', {
    type: 'rx',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'extract', as: 'string', options: 'value,innerHTML,outerHTML,href', defaultValue: 'innerHTML'},
        {id: 'multiple', as: 'boolean' },
    ],
    impl: rx.innerPipe(rx.mapPromise((ctx,{frame},{selector,extract,multiple}) => 
        frame.evaluate(`_jb_extract = '${extract}'`).then(()=>
                multiple ? frame.$$eval(selector, elems => elems.map(el=>el[_jb_extract]))
                : frame.$eval(selector, el => [el[_jb_extract]] ))), 
                rx.flatMap('%%'), 
                pptr.logData()
            )
})

jb.component('pptr.extractWithEval', {
    type: 'rx',
    description: 'evaluate javascript expression',
    params: [
        {id: 'expression', as: 'string'},
    ],
    impl: rx.innerPipe(rx.mapPromise((ctx,{frame},{expression}) => frame.evaluate(expression)), pptr.logData())
})

jb.component('pptr.eval', {
    type: 'rx',
    description: 'evaluate javascript expression',
    params: [
        {id: 'expression', as: 'string'},
    ],
    impl: rx.mapPromise((ctx,{frame},{expression}) => frame.evaluate(expression))
})

jb.component('pptr.mouseClick', {
    type: 'rx',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'button', as: 'string', options:'left,right,middle'},
        {id: 'clickCount', as: 'number', description: 'default is 1' },
        {id: 'delay', as: 'number', description: 'Time to wait between mousedown and mouseup in milliseconds. Defaults to 0' },
    ],
    impl: rx.mapPromise((ctx,{frame},{selector,button,clickCount,delay}) => frame.click(selector, {button,clickCount,delay}))
})

jb.component('pptr.waitForFunction', {
    type: 'rx',
    params: [
        {id: 'condition', as: 'string' },
        {id: 'polling', type: 'pptr.polling', defaultValue: pptr.raf() },
        {id: 'timeout', as: 'number', defaultValue: 30000, description: '0 to disable, maximum time to wait for in milliseconds' },
    ],
    impl: rx.mapPromise((ctx,{frame},{condition,polling,timeout}) => frame.waitForFunction(condition,{polling, timeout}))
})

jb.component('pptr.waitForSelector', {
    type: 'rx',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'visible', as: 'boolean', description: 'wait for element to be present in DOM and to be visible, i.e. to not have display: none or visibility: hidden CSS properties' },
        {id: 'hidden ', as: 'boolean', description: 'wait for element to not be found in the DOM or to be hidden' },
        {id: 'whenDone', type: 'action', dynamic: true, templateValue: pptr.endSession() },
        {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait for in milliseconds' },
    ],
    impl: rx.mapPromise((ctx,{frame},{selector,visible,hidden, timeout}) => frame.waitForSelector(selector,{visible,hidden, timeout}))
})

jb.component('pptr.waitForNavigation', {
    type: 'rx',
    params: [
        {id: 'waitUntil', as: 'string', options: [
            'load:load event is fired','domcontentloaded:DOMContentLoaded event is fired',
            'networkidle0:no more than 0 network connections for at least 500 ms',
            'networkidle2:no more than 2 network connections for at least 500 ms'].join(',')},
        {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait for in milliseconds' },
    ],
    impl: rx.mapPromise((ctx,{frame},{waitUntil,timeout}) => frame.waitForNavigation({waitUntil, timeout}))
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
    type: 'pptr.feature',
    impl: rx.innerPipe(
        pptr.repeatingAction('window.scrollPos = window.scrollPos || []; window.scrollPos.push(window.scrollY); window.scrollTo(0,document.body.scrollHeight)' ,500),
        pptr.waitForFunction('window.scrollPos && Math.max.apply(0,window.scrollPos.slice(-4)) == Math.min.apply(0,window.scrollPos.slice(-4))'))
})

// ************ frames *********

jb.component('pptr.mainFrame', {
    type: 'pptr.frame',
    impl: (ctx,{page}) => page.mainFrame()
})

jb.component('pptr.frameByIndex', {
    type: 'pptr.frame',
    params: [
        {id: 'index', as: 'number', defaultValue: 0, mandatory: true}
    ],    
    impl: (ctx,{page}) => page.frames()[index]
})

// page.mouse.move(100, 100);
// page.mouse.down();
// page.mouse.move(200, 200);
// page.mouse.up();;

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

