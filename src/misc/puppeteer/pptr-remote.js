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
        const {subject, subscribe, pipe, mapPromise} = jb.callbag
        const comp = {
            events: subject(),
            commands: subject(),
        }
        ctx.setVar('comp',comp).run(
            rx.pipe(
                rx.fromPromise(() => this.getOrCreateBrowser(showBrowser)),
                rx.var('browser'),
                ...actions
            )
        )
        pipe(comp.commands, mapPromise(cmd=> Promise.resolve(ctx.run(cmd))), subscribe(() => {}) )
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
                    return 'common,callbag,puppeteer'.split(',').reduce((pr,module) => pr.then(() => {
                            const moduleFileName = `${st.host.pathOfDistFolder()}/${module}.js`
                            return st.host.getFile(moduleFileName).then( loadCode => socket.send(JSON.stringify({ loadCode, moduleFileName })))
                        }), Promise.resolve())
//                        .then(() => socket.send(JSON.stringify({ require: 'puppeteer', writeTo: 'puppeteer'})))
//                }
            })
        }
    },
}


