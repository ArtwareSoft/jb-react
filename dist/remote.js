jb.remoteCtx = {
    stripCtx(ctx) {
        if (!ctx) return null
        const isJS = typeof ctx.profile == 'function'
        const profText = jb.prettyPrint(ctx.profile)
        const vars = jb.objFromEntries(jb.entries(ctx.vars).filter(e => e[0] == '$disableLog' || profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(isJS ? ctx.params: jb.entries(jb.path(ctx.cmpCtx,'params')))
            .filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const res = Object.assign({id: ctx.id, path: ctx.path, profile: ctx.profile, vars }, 
            isJS ? {params,vars} : Object.keys(params).length ? {cmpCtx: {params} } : {} )
        return res
    },
    stripData(data) {
        if (data == null) return
        if (['string','boolean','number'].indexOf(typeof data) != -1) return data
        if (typeof data == 'function')
             return this.stripFunction(data)
        if (data instanceof jb.jbCtx)
             return this.stripCtx(data)
        if (Array.isArray(data))
             return data.map(x=>this.stripData(x))
        if (typeof data == 'object' && ['VNode','Object','Array'].indexOf(data.constructor.name) == -1)
            return { $$: data.constructor.name}
        if (typeof data == 'object')
             return jb.objFromEntries(jb.entries(data).map(e=>[e[0],this.stripData(e[1])]))
    },
    stripFunction({profile,runCtx,path, forcePath, param}) {
        if (!profile || !runCtx) return
        const profText = jb.prettyPrint(profile)
        const profNoJS = this.stripJSFromProfile(profile)
        const vars = jb.objFromEntries(jb.entries(runCtx.vars).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(jb.path(runCtx.cmpCtx,'params')).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        return Object.assign({$: 'runCtx', id: runCtx.id, path, forcePath, param, profile: profNoJS, vars}, 
            Object.keys(params).length ? {cmpCtx: {params} } : {})
    },
    serailizeCtx(ctx) { return JSON.stringify(this.stripCtx(ctx)) },
    deStrip(data) {
        if (typeof data == 'string' && data.match(/^__JBART_FUNC:/))
            return eval(data.slice(14))
        const stripedObj = typeof data == 'object' && jb.objFromEntries(jb.entries(data).map(e=>[e[0],this.deStrip(e[1])]))
        if (stripedObj && data.$ == 'runCtx')
            return (ctx2,data2) => (new jb.jbCtx().ctx({...stripedObj})).extendVars(ctx2,data2).runItself()
        if (Array.isArray(data))
            return data.map(x=>this.deStrip(x))
        return stripedObj || data
    },
    stripCBVars(cbData) {
        const res = jb.remoteCtx.stripData(cbData)
        if (res && res.vars)
            res.vars = jb.objFromEntries(jb.entries(res.vars).filter(e=>e[0].indexOf('$')!=0))

        return res
    },
    stripJSFromProfile(profile) {
        if (typeof profile == 'object')
            return jb.objFromEntries(jb.entries(profile)
                .map(([id,val]) => [id, typeof val == 'function' ? `__JBART_FUNC: ${val.toString()}` : this.stripData(val)]))
        return profile
    }
}

;


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
        const port = {
            from,to,
            postMessage: m => { 
                jb.log(`remote sent from ${from} to ${to}`,{m})
                frame.postMessage({from, to,...m}) 
            },
            onMessage: { addListener: handler => frame.addEventListener('message', m => {
                if (m.data.to != from || m.data.from != to) return
                jb.log(`remote received at ${from} from ${m.data.from} to ${m.data.to}`,{m: m.data})
                handler(m.data)
            })},
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
        }
        return port
    },
    extendPortWithCbHandler: port => Object.assign(port, {
        cbHandler: {
            counter: 0,
            map: {},
            newId() { return port.from + ':' + (this.counter++) },
            get(id) { return this.map[id] },
            getAsPromise(id,t) { 
                return jb.exec(waitFor({check: ()=> this.map[id], interval: 5, times: 10}))
                    .catch(err => jb.logError('cbLookUp - can not find cb',{id}))
                    .then(cb => {
                        if (t == 2) this.removeEntry(id)
                        return cb
                    })
            },
            addToLookup(cb) { 
                const id = this.newId()
                this.map[id] = cb
                return id 
            },
            removeEntry(ids) {
                jb.delay(1000).then(()=>
                    jb.asArray(ids).filter(x=>x).forEach(id => delete this.map[id]))
            },
            inboundMsg({cbId,t,d}) { 
                if (t == 2) this.removeEntry(cbId)
                return this.getAsPromise(cbId,t).then(cb=> cb && cb(t, t == 0 ? this.remoteCB(d,cbId) : d)) 
            },
            outboundMsg({cbId,t,d}) { 
                port.postMessage({$:'CB', cbId,t, d: t == 0 ? this.addToLookup(d) : d })
            },
            remoteCB(cbId, localCbId) { 
                let talkback
                return (t,d) => {
                    if (t==2) this.removeEntry([localCbId,talkback])
                    port.postMessage({$:'CB', cbId,t, d: t == 0 ? (talkback = this.addToLookup(d)) : jb.remoteCtx.stripCBVars(d) }) 
                }
            },
            handleCBCommnad(cmd) {
                const {$,sourceId,cbId} = cmd
                const cbElem = jb.remoteCtx.deStrip(cmd.remoteRun)() // actually runs the ctx
                if ($ == 'CB.createSource')
                    this.map[cbId] = cbElem
                else if ($ == 'CB.createOperator')
                    this.map[cbId] = cbElem(this.remoteCB(sourceId, cbId) )
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
                return (t,d) => {
                    if (t == 2) console.log('send 2',cbId,sourceId)
                    this.cbHandler.outboundMsg({cbId,t,d})
                }
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
                jb.cbLogByPath = {}
                self.spy = jb.initSpy({spyParam: '${spyParam}'})
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
});

