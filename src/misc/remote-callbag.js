jb.waitFor = jb.waitFor || ((check,interval = 50 ,times = 300) => {
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
})

jb.remote = {
    servers: {},
    pathOfDistFolder() {
        const pathOfDistFolder = jb.path(jb.studio,'studiojb.studio.host.pathOfDistFolder')
        const location = jb.path(jb.studio,'studioWindow.location') || jb.path(jb.frame,'location')
        return pathOfDistFolder && pathOfDistFolder() || location && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
    },
    cbPortFromFrame(frame,from,to) {
        return this.extendPortWithCbHandler(this.portFromFrame(frame,from,to)).initCommandListener()
    },
    portFromFrame(frame,from,to) {
        return {
            from,to,
            postMessage: m => { 
                jb.log(`remote sent from ${from} to ${to}`,{m})
                frame.postMessage({from: from, to: to,...m}) 
            },
            onMessage: { addListener: handler => frame.addEventListener('message', m => {
                jb.log(`remote received at ${from} from ${m.data.from} to ${m.data.to}`,{m.data})
                m.data.to == from && handler(m.data)
            })},
            onDisconnect: { addListener: handler => {} }
        }
    },
    extendPortWithCbHandler: port => Object.assign(port, {
        cbHandler: {
            counter: 0,
            map: {},
            newId() { return port.from + ':' + (this.counter++) },
            get(id) { return this.map[id] },
            getAsPromise(id,t) { 
                if (t == 2) this.removeEntry(id)
                    
                return jb.waitFor(()=> this.map[id],5,10).then(cb => {
                    if (!cb)
                        jb.logError('cbLookUp - can not find cb',{id})
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
            },
            inboundMsg({cbId,t,d}) { return this.getAsPromise(cbId,t).then(cb=> cb(t, t == 0 ? this.remoteCB(d) : d)) },
            outboundMsg({cbId,t,d}) { 
                port.postMessage({$:'CB', cbId,t, d: t == 0 ? this.addToLookup(d) : d })
                if (t == 2) this.removeEntry(cbId)
            },
            remoteCB(cbId) { return (t,d) => port.postMessage({$:'CB', cbId,t, d: t == 0 ? this.addToLookup(d) : jb.remoteCtx.stripCBVars(d) }) },
            handleCBCommnad(cmd) {
                const {$,sourceId,cbId} = cmd
                const cbElem = jb.remoteCtx.deStrip(cmd.remoteRun)()
                if ($ == 'CB.createSource')
                    this.map[cbId] = cbElem
                else if ($ == 'CB.createOperator')
                    this.map[cbId] = cbElem(this.remoteCB(sourceId) )
            },
        },        
        initCommandListener() {
            this.onMessage.addListener(m => {
                if ((m.$ || '').indexOf('CB.') == 0)
                    this.cbHandler.handleCBCommnad(m)
                else if (m.$ == 'CB')
                    this.cbHandler.inboundMsg(m)
            })
            return this
        },
        createRemoteSource(remoteRun) {
            const cbId = this.cbHandler.newId()
            this.postMessage({$:'CB.createSource', remoteRun, cbId })
            return (t,d) => this.cbHandler.outboundMsg({cbId,t,d})
        },
        createRemoteOperator(remoteRun) {
            return source => {
                const sourceId = this.cbHandler.addToLookup(source)
                const cbId = this.cbHandler.newId()
                this.postMessage({$:'CB.createOperator', remoteRun, sourceId, cbId })
                return (t,d) => this.cbHandler.outboundMsg({cbId,t,d})
            }
        },
    })
}

jb.component('remote.worker', {
    type: 'remote',
    params: [
        {id: 'id', as: 'string', defaultValue: '1' },
        {id: 'libs', as: 'array', defaultValue: ['common','remote','rx'] },
    ],    
    impl: (ctx,id,libs) => {
        const uri = `worker-${id}`
        if (jb.remote.servers[uri]) return jb.remote.servers[uri]
        const distPath = jb.remote.pathOfDistFolder()
        const spyParam = ((jb.path(jb.frame,'location.href')||'').match('[?&]spy=([^&]+)') || ['', ''])[1]
        const workerCode = [
            ...libs.map(lib=>`importScripts('${distPath}/!${uri}!${lib}.js')`),`
                //self.uri = '${uri}'
                //self.isWorker = true
                jb.cbLogByPath = {}
                jb.initSpy({spyParam: '${spyParam}'})
                self.spy = jb.spy
                self.portToMaster = jb.remote.cbPortFromFrame(self,'${uri}','master')
            `
        ].join('\n')
        const worker = jb.remote.servers[uri] = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})))
        worker.port = jb.remote.cbPortFromFrame(worker,'master',uri)
        worker.uri = uri
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
    impl: (ctx,rx,remote) => remote.port ? remote.port.createRemoteSource(jb.remoteCtx.stripFunction(rx)) : rx()
})

jb.component('remote.operator', {
    type: 'rx',
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: remote.local()},
    ],
    impl: (ctx,rx,remote) => remote.port ? remote.port.createRemoteOperator(jb.remoteCtx.stripFunction(rx)) : rx()
})