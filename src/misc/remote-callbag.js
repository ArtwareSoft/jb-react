jb.remote = {
    servers: {
    },
    pathOfDistFolder() {
        const pathOfDistFolder = jb.path(jb.studio,'studiojb.studio.host.pathOfDistFolder')
        const location = jb.path(jb.studio,'studioWindow.location') || jb.path(jb.frame,'location')
        return pathOfDistFolder && pathOfDistFolder() || location && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
    },
}

jb.remoteCBHandler = remote => ({
    counter: 0,
    cbLookUp: {},
    newId() { return remote.uri + (this.counter++) },
    addToLookup(cb) { 
        const id = this.newId()
        this.cbLookUp[id] = cb
        return id 
    },
    inboundMsg({cbId,t,d}) { return this.getCB(cbId).then(cb=> cb(t, t == 0 ? this.remoteCB(d) : d)) },
    outboundMsg({cbId,t,d}) { remote.postObj({$:'CB', cbId,t, d: t == 0 ? this.addToLookup(d) : d }) },
    getCB(cbId) { return jb.delay(this.cbLookUp[cbId] ? 0 : 10).then(()=>this.cbLookUp[cbId]) },
    remoteCB: cbId => (t,d) => remote.postObj({$:'CB', cbId,t, d: t == 0 ? this.addToLookup(d) : d }),
    remoteSource(remoteCtx) {
        const cbId = this.newId()
        remote.postObj({$:'CB.createSource', ...remoteCtx, cbId })
        return (t,d) => this.outboundMsg({cbId,t,d})
    },
    remoteOperator(remoteCtx) {
        return source => {
            const sourceId = this.addToLookup(source)
            remote.postObj({$:'CB.createOperator', ...remoteCtx, sourceId })
        }
    },
    handleCBCommnad({$,profile,vars,path,sourceId,cbId}) {
        debugger
        const ctx = new self.jb.jbCtx().ctx({profile,vars,path})
        if ($ == 'CB.createSource')
            this.cbLookUp[cbId] = ctx.runItself()
        else if ($ == 'CB.createOperator')
            ctx.runItself()(this.remoteCB(sourceId) )
    }
})

jb.component('remote.worker', {
    type: 'remote',
    params: [
        {id: 'id', as: 'string', defaultValue: 'mainWorker' },
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
                self.postObj = m => { jb.log('remote',['sent from ${uri}',m]); self.postMessage(m) }
                debugger
                self.CBHandler = jb.remoteCBHandler(self)
                self.addEventListener('message', msg => jb.log('remote',['reveiced at ${uri}',msg]))
                self.addEventListener('message', msg => (msg.data.$ || '').indexOf('CB.') == 0 && self.CBHandler.handleCBCommnad(msg.data))
                self.addEventListener('message', msg => (msg.data.$ == 'CB') && self.CBHandler.inboundMsg(msg.data))
            `
        ].join('\n')
        const worker = jb.remote.servers[uri] = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})))
        worker.uri = uri
        worker.CBHandler = jb.remoteCBHandler(worker)
        worker.postObj = m => worker.postMessage(m)
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
    impl: ({},rx,remote) => remote.uri == 'local' ? rx() : remote.CBHandler.remoteOperator(rx.ctx)
})