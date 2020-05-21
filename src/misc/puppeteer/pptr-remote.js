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
        let lastCtx = ctx
        const wrappedActions = actions.flatMap( (action,i) => action ? [
                rx.doPromise( ctx => comp.events.next({$: 'Started', ctx, path: `actions~${i}` })),
                actions[i],
                rx.catchError( err => { comp.events.next({$: 'Error', err: err && err.data || err, path: `actions~${i}`, ctx }); return lastCtx }),
                rx.doPromise( ctx => {
                    lastCtx = ctx; 
                    comp.events.next({$: 'Emit', ctx, path: `actions~${i}` }) 
                }),
        ] : [])


        ctx.run(
            rx.pipe(
                Var('$throw',true),
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
                else if (obj.constructor.name == 'Error') obj = {$: 'error', message: obj.message, stack: obj.stack}
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
