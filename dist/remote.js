jb.remote = {
    servers: {
    },
    pathOfDistFolder() {
        const pathOfDistFolder = jb.path(jb.studio,'studiojb.studio.host.pathOfDistFolder')
        const location = jb.path(jb.studio,'studioWindow.location') || jb.path(jb.frame,'location')
        return pathOfDistFolder && pathOfDistFolder() || location && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
    },
    cbLookUp: {
        counter: 0,
        map: {},
        newId() { return (jb.frame.uri || 'main') + ':' + (this.counter++) },
        get(id) { return this.map[id] },
        waitFor(check,interval,times) {
            let count = 0
            return new Promise((resolve,reject) => {
                const toRelease = setInterval(() => {
                    count++
                    const v = check()
                    if (v || count >= times) clearInterval(toRelease)
                    if (v) resolve(v)
                    if (count >= times) reject('timeout')
                }, interval)
            })
        },
        getAsPromise(id) { 
            return this.waitFor(()=> this.map[id],5,10).then(cb => {
                if (!cb)
                    jb.logError('cbLookUp - can not find cb',id)
                return cb
            })
        },
        addToLookup(cb) { 
            const id = this.newId()
            this.map[id] = cb
            return id 
        }
    }
}

jb.remoteCBHandler = remote => ({
    cbLookUp: jb.remote.cbLookUp,
    addToLookup(cb) { return this.cbLookUp.addToLookup(cb) },
    inboundMsg({cbId,t,d}) { return this.cbLookUp.getAsPromise(cbId).then(cb=> cb(t, t == 0 ? this.remoteCB(d) : d)) },
    outboundMsg({cbId,t,d}) { remote.postObj({$:'CB', cbId,t, d: t == 0 ? this.addToLookup(d) : d }) },
    remoteCB(cbId) { return (t,d) => remote.postObj({$:'CB', cbId,t, d: t == 0 ? this.addToLookup(d) : this.stripeCtx(d) }) },
    remoteSource(remoteCtx) {
        const cbId = this.cbLookUp.newId()
        remote.postObj({$:'CB.createSource', ...remoteCtx, cbId })
        return (t,d) => this.outboundMsg({cbId,t,d})
    },
    remoteOperator(remoteCtx) {
        return source => {
            const sourceId = this.cbLookUp.addToLookup(source)
            const cbId = this.cbLookUp.newId()
            remote.postObj({$:'CB.createOperator', ...remoteCtx, sourceId, cbId })
            return (t,d) => this.outboundMsg({cbId,t,d})
        }
    },
    init() {
        remote.addEventListener('message', m => {
            const msg = m.data
            jb.log('remote',[`received from ${msg.from}`,msg])
            if ((msg.$ || '').indexOf('CB.') == 0)
                this.handleCBCommnad(msg)
            else if (msg.$ == 'CB')
                this.inboundMsg(msg)
        })
        return this
    },
    handleCBCommnad({$,profile,vars,path,sourceId,cbId}) {
        const ctx = new self.jb.jbCtx().ctx({profile,vars,path})
        if ($ == 'CB.createSource')
            this.cbLookUp.map[cbId] = ctx.runItself()
        else if ($ == 'CB.createOperator')
            this.cbLookUp.map[cbId] = ctx.runItself()(this.remoteCB(sourceId) )
    },
    stripeCtx(ctx) {
        return (ctx && ctx.vars) ? { ...ctx, vars: {}} : ctx
    }
})

jb.component('remote.worker', {
    type: 'remote',
    params: [
        {id: 'id', as: 'string', defaultValue: '0' },
        {id: 'libs', as: 'array', defaultValue: ['common','remote','rx'] },
    ],    
    impl: (ctx,id,libs) => {
        const uri = `worker:${id}`
        if (jb.remote.servers[uri]) return jb.remote.servers[uri]
        const distPath = jb.remote.pathOfDistFolder()
        const workerCode = [
            ...libs.map(lib=>`importScripts('${distPath}/${lib}.js')`),`
                self.uri = "${uri}"
                self.workerId = () => 1
                jb.remote.onServer = true
                jb.cbLogByPath = {}
                jb.initSpy({spyParam: 'remote'})
                self.postObj = m => { jb.log('remote',['sent from ${uri}',m]); self.postMessage({from: '${uri}',...m}) }
                self.CBHandler = jb.remoteCBHandler(self).init()
            `
        ].join('\n')
        const worker = jb.remote.servers[uri] = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})))
        worker.uri = uri
        worker.CBHandler = jb.remoteCBHandler(worker).init()
        worker.postObj = m => { jb.log('remote',[`sent to ${uri}`,m]); worker.postMessage({from: 'main', ...m}) }
        return worker
    }
})

jb.component('remote.local', {
    type: 'remote',
    impl: () => ({ uri: 'local'})
})

jb.component('source.remote', {
    type: 'rx',
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: remote.local() }
    ],
    impl: (ctx,rx,remote) => remote.uri == 'local' ? rx() : remote.CBHandler.remoteSource({profile: ctx.profile.rx, path: `${ctx.path}~rx`})
})

jb.component('remote.operator', {
    type: 'rx',
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: remote.local()}
    ],
    impl: (ctx,rx,remote) => remote.uri == 'local' ? rx() : remote.CBHandler.remoteOperator({profile: ctx.profile.rx, path: `${ctx.path}~rx`})
});

