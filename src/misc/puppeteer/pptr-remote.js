jb.ns('pptr')

jb.pptr = {
    initCallbagServer(ws) { // server side
        const {pipe,fromEvent,map} = jb.callbag
        global.messageSource = pipe(
            fromEvent('message',ws),
            map(m=> jb.remote.evalFunctions(JSON.parse(m)))
        )
        jb.remote.startCommandListener()
    },
    connect() { // cliet side
        return new Promise((resolve, reject) => {
            const socket = new WebSocket(`ws:${(jb.studio.studioWindow || jb.frame).location.hostname || 'localhost'}:8090`)
            socket.onopen = () => resolve(socket)
            socket.onerror = err => reject(err)
            socket.onclose = e => {
                const host = jb.path(jb.studio,'studiojb.studio.host')
                if (host && e.code == 1006)
                    host.showError('puppeteer server is down. please activate or install from https://github.com/ArtwareSoft/jb-puppeteer-server.git')
                else if (host && e.code != 1000)
                    host.showError('puppeteer server error: ' + e.code)
            }
            socket.postObj = m => socket.send(JSON.stringify(jb.remote.prepareForClone(m)))
        })
    },
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

jb.component('pptr.start', {
    type: 'rx,pptr',
    description: 'run method on the current object on pptr server using pptr api',
    params: [
      {id: 'showBrowser', as: 'boolean', defaultValue: true},
    ],
    impl: If(remote.onServer(), 
        rx.pipe(rx.fromPromise( (ctx, {}, {showBrowser}) => jb.pptr.getOrCreateBrowser(showBrowser)), rx.var('browser') ),
        remote.sourceRx(pptr.getOrCreateBrowser('%$showBrowser%'), pptr.server()))
})

jb.component('pptr.server', {
    type: 'remote',
    params: [
        {id: 'libs', as: 'array', defaultValue: ['common','remote','rx','puppeteer'] },
    ],
    impl: (ctx,libs) => {
        if (jb.pptr.pptrServer) return jb.pptr.pptrServer
        return jb.pptr.connect().then(socket=>sendCode(socket)).then(([socket]) => {
            jb.pptr.pptrServer = socket
            const {pipe,Do,fromEvent,map,takeUntil,subscribe} = jb.callbag
            socket.messageSource = pipe(
                fromEvent('message',socket),
                takeUntil(fromEvent('close',socket)),
                map(m=> jb.remote.evalFunctions(JSON.parse(m.data)))
            )
            pipe(
                socket.messageSource,
                Do(m => m.$ == 'cbLogByPathDiffs' && jb.remote.updateCbLogs(m.diffs) ),
                subscribe(()=>{})
            )
            return socket
        })
        function sendCode(socket) {
            const {toPromiseArray,pipe,take,doPromise,fromEvent,map} = jb.callbag
            socket.sendCodeToServer = () => 
                    libs.reduce((pr,lib) => pr.then(() => loadLibFile(lib)), Promise.resolve())
                    .then(() => socket.postObj({ loadCode: 'pptr.remote.onServer = true', moduleFileName: '' }));
    
            return toPromiseArray(pipe(
                fromEvent('message',socket),
                map(m=> JSON.parse(m.data)),
                take(1), 
                doPromise( m => m.res == 'loadCodeReq' && socket.sendCodeToServer()), 
                map(()=>socket)
            ))

            function loadLibFile(lib) {
                const host = jb.path(jb.studio,'studiojb.studio.host')
                if (host) {
                    const moduleFileName = host.locationToPath(`${host.pathOfDistFolder()}/${lib}.js`)
                    return host.getFile(moduleFileName).then(loadCode => socket.postObj({ loadCode, moduleFileName }))
                } else if (typeof fetch != 'undefined' && typeof location != 'undefined' ) {
                    const moduleFileName = location.href.match(/^[^:]*/)[0] + `://${location.host}/dist/${lib}.js`
                    return fetch(moduleFileName).then(x=>x.text()).then(loadCode => socket.postObj({ loadCode, moduleFileName }))
                }
            }
        }
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

