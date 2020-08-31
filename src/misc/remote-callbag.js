jb.remote = {
    servers: {},
    pathOfDistFolder() {
        const pathOfDistFolder = jb.path(jb.studio,'studiojb.studio.host.pathOfDistFolder')
        const location = jb.path(jb.studio,'studioWindow.location') || jb.path(jb.frame,'location')
        return pathOfDistFolder && pathOfDistFolder() || location && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
    },
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
    cbLookUp: {
        counter: 0,
        map: {},
        newId() { return (jb.frame.uri || 'main') + ':' + (this.counter++) },
        get(id) { return this.map[id] },
        getAsPromise(id,t) { 
            if (t == 2) this.removeEntry(id)
                
            return jb.remote.waitFor(()=> this.map[id],5,10).then(cb => {
                if (!cb)
                    jb.logError('cbLookUp - can not find cb',id)
                return cb
            })
        },
        addToLookup(cb) { 
            const id = this.newId()
            this.map[id] = cb
            return id 
        },
        removeEntry(id) {
            jb.delay(100).then(()=> delete this.map[id])
        }
    },
}

jb.remoteCBHandler = remote => ({
    cbLookUp: jb.remote.cbLookUp,
    addToLookup(cb) { return this.cbLookUp.addToLookup(cb) },
    inboundMsg({cbId,t,d}) { return this.cbLookUp.getAsPromise(cbId,t).then(cb=> cb(t, t == 0 ? this.remoteCB(d) : d)) },
    outboundMsg({cbId,t,d}) { 
        remote.postObj({$:'CB', cbId,t, d: t == 0 ? this.addToLookup(d) : d })
        if (t == 2) this.cbLookUp.removeEntry(cbId)
    },
    remoteCB(cbId) { return (t,d) => remote.postObj({$:'CB', cbId,t, d: t == 0 ? this.addToLookup(d) : this.stripVars(d) }) },
    remoteSource(remoteRun) {
        const cbId = this.cbLookUp.newId()
        remote.postObj({$:'CB.createSource', remoteRun, cbId })
        return (t,d) => this.outboundMsg({cbId,t,d})
    },
    remoteOperator(remoteRun) {
        return source => {
            const sourceId = this.cbLookUp.addToLookup(source)
            const cbId = this.cbLookUp.newId()
            remote.postObj({$:'CB.createOperator', remoteRun, sourceId, cbId })
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
    handleCBCommnad(cmd) {
        const {$,sourceId,cbId} = cmd
        const cbElem = jb.remoteCtx.deStrip(cmd.remoteRun)()
        if ($ == 'CB.createSource')
            this.cbLookUp.map[cbId] = cbElem
        else if ($ == 'CB.createOperator')
            this.cbLookUp.map[cbId] = cbElem(this.remoteCB(sourceId) )
    },
    stripVars(cbData) {
        if (cbData && cbData.vars)
            return { ...cbData, vars: jb.objFromEntries(jb.entries(cbData.vars)
                    .filter(e=>e[0].indexOf('$')!=0)
                    .map(e=>[e[0], jb.remoteCtx.stripData(e[1])]))
                }
        return cbData
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
            ...libs.map(lib=>`importScripts('${distPath}/!${uri}!${lib}.js')`),`
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
    macroByValue: true,
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: remote.local() },
    ],
    impl: (ctx,rx,remote) => remote.uri == 'local' ? rx() : 
        remote.CBHandler.remoteSource(jb.remoteCtx.stripFunction(rx))
})

jb.component('remote.operator', {
    type: 'rx',
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: remote.local()},
    ],
    impl: (ctx,rx,remote) => remote.uri == 'local' ? rx() : 
        remote.CBHandler.remoteOperator(jb.remoteCtx.stripFunction(rx))
})