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

