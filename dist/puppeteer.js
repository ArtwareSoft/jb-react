jb.pptr = { hasPptrServer: typeof hasPptrServer != 'undefined' }

Object.assign(jb.pptr, {
    getOrCreateBrowser(showBrowser) {
        if (this._browser) return Promise.resolve(this._browser)
        return this.impl.launch({headless: !showBrowser}).then(browser => this._browser = browser)
    },
    createComp(ctx,url,extract,features) {
        const comp = jb.pptr.hasPptrServer ? this.createServerComp(...arguments) : this.createProxyComp(ctx.profile)
        comp.dataEm = jb.callbag.filter(e => e.$ == 'result-data')(comp.em)
        jb.callbag.subscribe(e => comp.results.push(e.data))(comp.dataEm)
        return comp
    },
    closeBrowser() {
        if (jb.pptr.hasPptrServer) {
            this._browser && this._browser.close()
        } else {
            socket = new WebSocket(`ws:${location.hostname}:8090`)
            socket.onopen = () => socket.send(JSON.stringify({profile: {$: 'pptr.closeBrowser'}}))
        }
    },
    createServerComp(ctx,url,extract,features,showBrowser) {
        const comp = {
            em: jb.callbag.subject(),
            results: [],
            endSession() {
                comp.em.next({profile: extract.ctx.profile, path: extract.ctx.path}) // for debug/logs
                return Promise.resolve(extract.do(comp)).then(x=> {
                    jb.asArray(x).forEach(data=>comp.em.next({$: 'result-data', data}));
                    comp.em.complete()
                })
            }
        }

        jb.pptr.getOrCreateBrowser(showBrowser)
            .then(browser => browser.newPage())
            .then(page=> (comp.page = page).goto(url))
            .then(()=>applyFeatures())
            .catch(e => console.log(e))

//        pipe(comp.em, last(), subscribe(e=> comp.page.close()))

        return comp

        function applyFeatures() {
            features.forEach((f,i)=>f.index = i)
            features.filter(f=>f && !f.phase).forEach(f=>Object.assign(comp,f))
            const sortedFeatures = features.filter(f=>f.phase).sort((x1,x2) => x2.phase * 1000 + x2.index - x1.phase*1000 - x1.index)
            if (sortedFeatures.length == 0)
                comp.endSession()
            return sortedFeatures.reduce((pr,feature) => pr.then(()=>comp.em.next({feature})).then(feature.do(comp)), Promise.resolve())
        }
    },

    createProxyComp(profile) {
        const {pipe,skip,take,toPromiseArray,subject} = jb.callbag
        const receive = subject()
        socket = new WebSocket(`ws:${location.hostname}:8090`)
        socket.onmessage = ({data}) => receive.next(JSON.parse(data).res)
        socket.onerror = e => receive.error(e)
        socket.onclose = () => receive.complete()
        socket.onopen = () => loadServerCode().then(() => socket.send(JSON.stringify({profile})))
        return { em: skip(1)(receive), results: [] }

        function loadServerCode() {
            const st = (jb.path(jb,'studio.studiojb') || jb).studio
            if (!st.host) return Promise.resolve()
            return toPromiseArray(pipe(receive,take(1))).then(([m]) =>{
                if (m == 'loadCodeReq') {
                    return 'common,callbag,puppeteer'.split(',').reduce((pr,module) => 
                        pr.then(() => st.host.getFile(`${st.host.pathOfDistFolder()}/${module}.js`)
                            .catch(e=> console.log(e))
                            .then( loadCode => socket.send(JSON.stringify({ loadCode, moduleFileName: `${st.host.pathOfDistFolder()}/${module}.js` })))),
                        Promise.resolve() )
                            .then(() => socket.send(JSON.stringify({ require: 'puppeteer', writeTo: 'jb.pptr.impl'})))
                }
            })
        }
    },
})

// if (! jb.pptr.hasPptrServer) Object.assign(jb.pptr, { // mock for debugger
//     impl: {
//         launch: () => Promise.resolve({
//             newPage: () => Promise.resolve({
//                 close:() => Promise.resolve({}),
//                 $eval:() => Promise.resolve({}),
//                 $$eval:() => Promise.resolve({}),
//                 mainFrame: () => jb.pptr.frame,
//                 frames: () => [jb.pptr.frame]
//             })
//         })
//     },
//     frame: {
//         evalute: () => Promise.resolve({}),
//         click: () => Promise.resolve({}),
//         waitForFunction: () => Promise.resolve({}),
//         waitForSelector: () => Promise.resolve({}),
//         waitForNavigation: () => Promise.resolve({}),
//     }
// })
;

jb.ns('pptr')

jb.component('pptr.headlessPage', {
    type: 'pptr.page',
    params: [
        {id: 'url', as: 'string', mandatory: true },
        {id: 'extract', type: 'pptr.extract', defaultValue: pptr.extractContent('body') },
        {id: 'features', type: 'pptr.features[]', as: 'array', flattenArray: true},
        {id: 'showBrowser', as: 'boolean' },
    ],
    impl: (...args) => jb.pptr.createComp(...args)
})

jb.component('pptr.htmlFromPage', {
    type: 'data',
    params: [
        {id: 'page', type: 'pptr.page', mandatory: true, dynamic: true },
    ],
    impl: (ctx,page) => {
        const cmp = page()
        return jb.callbag.toPromiseArray(cmp.em).then(() => cmp.results.join(''))
    }
})

jb.component('pptr.endSession', {
    type: 'action',
    impl: ctx => ctx.vars.pptrPage && ctx.vars.pptrPage.endSession()
})

jb.component('pptr.closeBrowser', {
    type: 'action',
    impl: () => jb.pptr.closeBrowser()
})

jb.component('pptr.extractContent', {
    type: 'pptr.extract',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'extract', as: 'string', options: 'value,innerHTML,outerHTML,href', defaultValue: 'innerHTML'},
        {id: 'multiple', as: 'boolean' },
    ],
    impl: (ctx,selector,extract,multiple) => ({ ctx, do: 
        ({page}) => multiple? page.$$eval(selector, elems => elems.map(el=>el[extract])): 
            page.$eval(selector, 
                el => el.innerHTML) })
})

jb.component('pptr.evaluate', {
    type: 'pptr.feature',
    description: 'evaluate in page context',
    params: [
        {id: 'expression', as: 'string'},
        {id: 'phase', as: 'number', defaultValue: 3, description: 'feature activation order'},
        {id: 'whenDone', type: 'action', dynamic: true },
        {id: 'frame', type: 'pptr.frame', defaultValue: pptr.mainFrame() },
    ],
    impl: (ctx,expression,phase,whenDone,frame) => ({ ctx, phase, do: cmp => frame(cmp.page).evalute(expression).then(() => whenDone(ctx.setVar('pptrPage',cmp))) })
})

jb.component('pptr.repeatingAction', {
    type: 'pptr.feature',
    params: [
        {id: 'action', as: 'string' },
        {id: 'intervalTime', as: 'number', defaultValue: 500 },
        {id: 'phase', as: 'number', defaultValue: 100, description: 'feature activation order'}
    ],
    impl: pptr.evaluate('setInterval(() => %$action% ,%$intervalTime%)','%$phase%')
})

jb.component('pptr.click', {
    type: 'pptr.feature',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'phase', as: 'number', defaultValue: 100, description: 'feature activation order'},
        {id: 'whenDone', type: 'action', dynamic: true },
        {id: 'button', as: 'string', options:'left,right,middle'},
        {id: 'clickCount', as: 'number', description: 'default is 1' },
        {id: 'delay', as: 'number', description: 'Time to wait between mousedown and mouseup in milliseconds. Defaults to 0' },
        {id: 'frame', type: 'pptr.frame', defaultValue: pptr.mainFrame() },
    ],
    impl: (ctx,selector,phase,whenDone,button,clickCount,delay,frame) => ({ ctx, phase, do: cmp => 
        frame(cmp.page).click(selector, {button,clickCount,delay}).then(() => whenDone(ctx.setVar('pptrPage',cmp))) })
})

jb.component('pptr.waitForFunction', {
    type: 'pptr.feature',
    params: [
        {id: 'condition', as: 'string' },
        {id: 'polling', type: 'pptr.polling', defaultValue: pptr.raf() },
        {id: 'timeout', as: 'number', defaultValue: 30000, description: '0 to disable, maximum time to wait for in milliseconds' },
        {id: 'whenDone', type: 'action', dynamic: true, templateValue: pptr.endSession() },
        {id: 'frame', type: 'pptr.frame', defaultValue: pptr.mainFrame() },
        {id: 'phase', as: 'number', defaultValue: 10, description: 'phase of registration'}
    ],
    impl: (ctx,condition,polling,timeout,whenDone,frame,phase) => 
        ({ ctx, phase, do: cmp => frame(cmp.page).waitForFunction(condition,{polling, timeout})
            .then(() => whenDone(ctx.setVar('pptrPage',cmp))) })
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

jb.component('pptr.waitForSelector', {
    type: 'pptr.feature',
    params: [
        {id: 'selector', as: 'string' },
        {id: 'visible', as: 'boolean', description: 'wait for element to be present in DOM and to be visible, i.e. to not have display: none or visibility: hidden CSS properties' },
        {id: 'hidden ', as: 'boolean', description: 'wait for element to not be found in the DOM or to be hidden' },
        {id: 'whenDone', type: 'action', dynamic: true, templateValue: pptr.endSession() },
        {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait for in milliseconds' },
        {id: 'frame', type: 'pptr.frame', defaultValue: pptr.mainFrame() },
        {id: 'phase', as: 'number', defaultValue: 10, description: 'phase of registration'}
    ],
    impl: (ctx,selector,visible,hidden,whenDone,timeout,frame,phase) => 
        ({ ctx, phase, do: cmp => frame(cmp.page).waitForSelector(selector,{visible,hidden, timeout})}.then(()=>whenDone(ctx.setVar('pptrPage',comp))))
})

jb.component('pptr.waitForNavigation', {
    type: 'pptr.feature',
    params: [
        {id: 'waitUntil', as: 'string', options: [
            'load:load event is fired','domcontentloaded:DOMContentLoaded event is fired',
            'networkidle0:no more than 0 network connections for at least 500 ms',
            'networkidle2:no more than 2 network connections for at least 500 ms'].join(',')},
        {id: 'whenDone', type: 'action', dynamic: true, templateValue: pptr.endSession() },
        {id: 'timeout', as: 'number', defaultValue: 30000, description: 'maximum time to wait for in milliseconds' },
        {id: 'frame', type: 'pptr.frame', defaultValue: pptr.mainFrame() },
        {id: 'phase', as: 'number', defaultValue: 10, description: 'phase of registration'}
    ],
    impl: (ctx,waitUntil,whenDone,timeout,phase) => 
        ({ ctx, phase, do: cmp => frame(cmp.page).waitForNavigation({waitUntil, timeout})}.then(()=>whenDone(ctx.setVar('pptrPage',comp))))
})

jb.component('pptr.delay', {
    type: 'pptr.feature',
    params: [
      {id: 'mSec', as: 'number', defaultValue: 1},
      {id: 'phase', as: 'number', defaultValue: 10, description: 'phase of registration'},
      {id: 'whenDone', type: 'action', dynamic: true },
    ],
    impl: (ctx,mSec,phase) => ({ ctx, phase, do: comp => jb.delay(mSec).then(()=>whenDone(ctx.setVar('pptrPage',comp))) })
})

jb.component('pptr.pageId', {
    type: 'pptr.feature',
    params: [
        {id: 'id', as: 'string' },
    ],
    impl: ctx => ctx.params
})


jb.component('pptr.features', {
    type: 'pptr.feature',
    params: [
        {id: 'features', type: 'pptr.feature[]', as: 'array', flattenArray: true },
    ],
    impl: '%$features%'
})

jb.component('pptr.endlessScrollDown', {
    type: 'pptr.feature',
    impl: pptr.features(
        pptr.repeatingAction('scrollPos = scrollPos || []; scrollPos.push(window.scrollY); window.scrollBy(0,100)'),
        pptr.waitForFunction('Math.max.apply(0,scrollPos.slice(-4)) == Math.min.apply(0,scrollPos.slice(-4))')
    )
})

// ************ control *******

jb.component('pptr.control', {
    type: 'control',
    params: [
      {id: 'page', type: 'pptr.page', mandatory: true, dynamic: true },
    ],
    impl: (ctx,page) => {
        const comp = page()
        return ctx.run(html({
            html: () => comp.results.join(''),
            features: watchObservable(comp.dataEm)
        })) 
    }
})

// ************ frames *********

jb.component('pptr.mainFrame', {
    type: 'pptr.frame',
    impl: () => page => page.mainFrame()
})

jb.component('pptr.frameByIndex', {
    type: 'pptr.frame',
    params: [
        {id: 'index', as: 'number', defaultValue: 0, mandatory: true}
    ],    
    impl: (ctx,index) => page => page.frames()[index]
});

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
        {id: 'features', type: 'pptr.features[]', as: 'array', flattenArray: true},
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

