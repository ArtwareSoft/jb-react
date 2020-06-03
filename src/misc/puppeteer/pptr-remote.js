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
    createProxySession(ctx,{processData,databindEvents}) {
        const {pipe,skip,take,map,filter,subject,subscribe,doPromise} = jb.callbag
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
        pipe(receive, filter(x=>x.$ == 'ResultData'), map(x=> ctx.setData(x.data)), processData, subscribe(message =>databindEvents && jb.push(databindEvents, message,ctx)))
        
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
    {id: 'processData', type: 'rx' , templateValue: rx.innerPipe() },
    {id: 'actions', type: 'rx[]', ignore: true, templateValue: []},
  ],
  impl: (ctx,showBrowser,databindEvents,processData) => jb.pptr.createSession(ctx,{showBrowser,databindEvents,processData})
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
        const socket = jb.pptr.pptrServer = jb.pptr.createProxySocket()
        socket.postObj = m => socket.send(JSON.stringify(jb.remote.prepareForClone(m)))
        socket.showBrowser = showBrowser

        const {pipe,Do,fromEvent,map,filter,subscribe} = jb.callbag
        socket.messageSource = pipe(
            fromEvent('message',socket),
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
            }), Promise.resolve())
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
    impl: If(pptr.onServer(), rx.mapPromise('%$func%'), remote.innerRx(rx.mapPromise('%$func%'),pptr.server()))
})

jb.component('pptr.doPromise', {
    type: 'rx',
    params: [
      {id: 'func', dynamic: true },
    ],
    impl: If(pptr.onServer(), rx.doPromise('%$func%'), remote.innerRx(rx.doPromise('%$func%'),pptr.server()))
})

  