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
                rx.doPromise( () => comp.events.next({$: 'ActionStarted', path: ctx.path + `~actions~${i}` })),
                actions[i],
                rx.doPromise( () => comp.events.next({$: 'ActionEnded', path: ctx.path + `~actions~${i}` })),
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
            return JSON.stringify({ ...ev, err: chopObj(ev.err,3), ctx: null, vars: chopObj(ev.ctx.vars,3), data: chopObj(ev.ctx.data ,2) } )
        }
        function chopObj(obj, depth) {
            if (depth < 1) return
            if (['string','boolean','number'].indexOf(typeof obj) != -1) return obj
            if (typeof obj == 'object' && !(obj.constructor.name||'').match(/^Object|Array$/)) return obj.constructor.name
            return typeof obj == 'object' && jb.objFromEntries( jb.entries(obj).map(([id,val])=>[id,chopObj(val, depth-1)]))
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
            jb.log('pptr'+(message.$ ||''),[message]) // pptrActionStarted,pptrActionEnded,pptrActivity,pptrResultData
            receive.next(message)
        }
        socket.onerror = e => receive.error(e)
        socket.onclose = () => receive.complete()
        socket.onopen = () => pipe(commands, subscribe(cmd => socket.send(cmd.run ? jb.prettyPrint(cmd,{noMacros: true}) : JSON.stringify(cmd))))

        const comp = { events: skip(1)(receive), commands }
        jb.pptr._proxyComp = comp
        pipe(receive,take(1),
            doPromise(m => m == 'loadCodeReq' && ctx.setVar('comp',comp).run(pptr.sendCodeToServer())),
            subscribe(()=> comp.commands.next({run: ctx.profile})))
        pipe(receive,subscribe(message =>jb.push(databindEvents, message,ctx)))
        
        return comp
    },
}

jb.component('pptr.sendCodeToServer', {
    type: 'action',
    params: [
      {id: 'modules', as: 'string', defaultValue: 'common,rx,puppeteer'},
    ],
    impl: (ctx,modules) => {
        const st = (jb.path(jb,'studio.studiojb') || jb).studio
        if (!st.host) return Promise.resolve()
        return modules.split(',').reduce((pr,module) => pr.then(() => {
            const moduleFileName = `${st.host.pathOfDistFolder()}/${module}.js`
            return st.host.getFile(moduleFileName).then( 
                loadCode => (ctx.vars.comp || jb.pptr._proxyComp).commands.next({ loadCode, moduleFileName }))
        }), Promise.resolve())
    }
})

jb.component('pptr.session', {
    description: 'starts puppeteer session, returns object that can be used to interact with the server',
    type: 'rx,has-side-effects',
    category: 'source',    
    params: [
        {id: 'showBrowser', as: 'boolean' },
        {id: 'databindEvents', as: 'ref', description: 'bind events from puppeteer to array (watchable)' },
        {id: 'actions', type: 'rx[]', ignore: true, templateValue: [] },
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
