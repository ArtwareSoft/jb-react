jb.remote = {
    workers: {},
    counter: 1,
    remoteId: Symbol.for("remoteId"),
    remoteHash: {},
    pathOfDistFolder() {
        const host = jb.path(jb.studio,'studiojb.studio.host')
        return host && host.pathOfDistFolder() || typeof location != 'undefined' && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
    },
    remoteSource: (remote, id) => jb.callbag.pipe(
        remote.messageSource, 
        jb.callbag.filter(m=> m.id == id),
        jb.callbag.takeWhile(m=> !m.finished),
        jb.callbag.filter(m=> m.data),
        jb.callbag.map(m=> new jb.jbCtx().ctx({data: m.data.data, vars: m.data.vars, profile: '', forcePath: ''}))
    ),
    remoteSink: (remote, id) => source => jb.callbag.pipe(
        source, 
        jb.callbag.map(m => ({ data: jb.remote.prepareForClone(m), id } )), 
        jb.callbag.Do(m => remote.postMessage(JSON.stringify(m)))
    ),
    prepareForClone: (obj,depth) => {
        depth = depth || 0
        if (obj == null || depth > 5) return
        if (['string','boolean','number'].indexOf(typeof obj) != -1) return obj
        if (Array.isArray(obj)) return obj.map(val => jb.remote.prepareForClone(val, depth+1))
        if (typeof obj == 'function') {
            const funcParams = jb.objFromEntries('profile,runCtx,path,srcPath,forcePath,param'.split(',')
                .map(k=>[k,jb.remote.prepareForClone(obj[k],depth+1)]))
            funcParams.valOrDefault = funcParams.profile
            return {$: '__func', funcParams, code: obj.toString() }
        }
        if (typeof obj == 'object') {
            if (jb.remote.remoteClassList.indexOf(obj.constructor.name) != -1 && !obj[jb.remote.remoteId])
                obj[jb.remote.remoteId] = jb.remote.counter++
            if (obj[jb.remote.remoteId]) {
                jb.remote.remoteHash[obj[jb.remote.remoteId]] = obj
                return {$: '__remoteObj', __id: obj[jb.remote.remoteId], ...jb.objFromEntries( jb.entries(obj).map(([id,val])=>[id,jb.remote.prepareForClone(val, depth+1)])) }
            }
            if (obj.constructor.name == 'jbCtx')
                return { 
                    vars: jb.remote.prepareForClone(obj.vars,depth+1),
                    data: jb.remote.prepareForClone(obj.data,depth+1),
                    componentContext: {params: jb.remote.prepareForClone(jb.path(obj.componentContext,'params'),depth+1) },
                    forcePath: obj.path
                }
            else if (!(obj.constructor.name||'').match(/^Object|Array$/))
                return obj.constructor.name
            else
                return jb.objFromEntries( jb.entries(obj).map(([id,val])=>[id,jb.remote.prepareForClone(val, depth+1)]))
        }
    },
    evalFunctions: obj => {
        if (Array.isArray(obj)) 
            return obj.map(val => jb.remote.evalFunctions(val))
        else if (obj && typeof obj == 'object' && obj.$ == '__func' && obj.funcParams && obj.funcParams.path != null)
            return jb.eval(`({valOrDefault,runCtx,path,srcPath,forcePath,param}) => ${obj.code.replace(/jb_run/g,'jb.run')}`)(obj.funcParams)
        else if (obj && typeof obj == 'object' && obj.$ == '__func')
            return jb.eval(obj.code)
        else if (obj && typeof obj == 'object' && obj.$ == '__remoteObj' && jb.remote.onServer )
            return jb.remote.remoteHash[obj.__id]
        else if (obj && typeof obj == 'object')
            return jb.objFromEntries( jb.entries(obj).map(([id,val])=>[id, jb.remote.evalFunctions(val)]))
        return obj
    },
    startCommandListener() {
        const {pipe,Do,filter,subscribe} = jb.callbag
        pipe(
            self.messageSource,
            filter(m=> !m.id),
            subscribe(m=> {
                pipe(
                    m.$ == 'innerCB' && jb.remote.remoteSource(self, m.sourceId),
                    new jb.jbCtx().ctx(m.ctx).runInner(m.profile, {type: 'rx'} ,m.propName),
                    jb.remote.remoteSink(self, m.sinkId),                    
                    Do(e=> postMessage(JSON.stringify({$: 'cbLogByPathDiffs', id: m.sinkId, diffs: jb.remote.cbLogByPathDiffs(m.ctx.forcePath)}))),
                    subscribe({complete: () => postMessage(JSON.stringify({id: m.sinkId, finished: true}))})
                )
            })
        )
    },
    cbLogByPathDiffs(path) {
        const entries = jb.entries(jb.cbLogByPath||{}).filter(e=>e[0].indexOf(path) == 0)
        const res = jb.objFromEntries(entries.map(e=>[e[0],e[1].result.slice(e[1].lastDiff||0)]))
        entries.forEach(e=>e[1].lastDiff = e[1].result.length)
        return res
    },
    updateCbLogs(diffs) {
        jb.cbLogByPath = jb.cbLogByPath || {}
        jb.entries(diffs||{}).forEach(e=>{
            jb.cbLogByPath[e[0]] = jb.cbLogByPath[e[0]] || { callbagLog: true, result: [] }
            jb.cbLogByPath[e[0]].result = jb.cbLogByPath[e[0]].result.concat(e[1])
        })
    },
    createSampleObject(val) { // used by tests
        class tst {
            constructor(d) { this.d = val}
            m1() { return this.d}
        }
        return new tst(val)
    },
    remoteClassList: ['tst']
}

jb.component('worker.remoteCallbag', {
    type: 'remote',
    params: [
        {id: 'id', as: 'string', defaultValue: 'mainWorker' },
        {id: 'libs', as: 'array', defaultValue: ['common','remote','rx'] },
    ],    
    impl: (ctx,id,libs) => {
        if (jb.remote.workers[id]) 
            return jb.remote.workers[id]
        const distPath = jb.remote.pathOfDistFolder()
        const workerCode = [
            ...libs.map(lib=>`importScripts('${distPath}/${lib}.js')`),`
                self.workerId = () => 1
                jb.remote.onServer = true
                jb.cbLogByPath = {}
                const {pipe,Do,fromEvent,map,subscribe} = jb.callbag
                self.messageSource = pipe(
                    fromEvent('message',self),
                    map(m=> jb.remote.evalFunctions(JSON.parse(m.data)))
                )                
                jb.remote.startCommandListener()`
        ].join('\n')
        const worker = jb.remote.workers[id] = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})));
        worker.postObj = m => worker.postMessage(JSON.stringify(jb.remote.prepareForClone(m)))

        const {pipe,Do,fromEvent,map,subscribe} = jb.callbag
        worker.messageSource = pipe(
            fromEvent('message',worker),
            map(m=> jb.remote.evalFunctions(JSON.parse(m.data)))
        )

        pipe(
            worker.messageSource,
            Do(m => m.$ == 'cbLogByPathDiffs' && jb.remote.updateCbLogs(m.diffs) ),
            subscribe(()=>{})
        )
        return worker
    }
})

jb.component('remote.innerRx', {
    type: 'rx',
    params: [
      {id: 'rx', type: 'rx' },
      {id: 'remote', type: 'remote', defaultValue: worker.remoteCallbag()}
    ],
    impl: (ctx,rx,remote) => {
        const sourceId = jb.remote.counter++
        const sinkId = jb.remote.counter++
        jb.delay(1).then(()=>remote).then(remote => remote.postObj({ $: 'innerCB', sourceId, sinkId, propName: 'rx', profile: ctx.profile.rx, ctx }))
        jb.entries(jb.cbLogByPath||{}).filter(e=>e[0].indexOf(ctx.path) == 0).forEach(e=>e[1].result = [])
        return source => (start,sink) => {
            if (start!=0) return
            jb.delay(10).then(()=> jb.callbag.subscribe(()=>{})(jb.remote.remoteSink(remote,sourceId)(source)))
            const remoteSource = jb.remote.remoteSource(remote,sinkId)
            remoteSource(0, (t,d) => sink(t,d))
        }
    }
})

jb.component('remote.sourceRx', {
    type: 'rx',
    params: [
      {id: 'rx', type: 'rx' },
      {id: 'remote', type: 'remote', defaultValue: worker.remoteCallbag()}
    ],
    impl: (ctx,rx,remote) => {
        const sinkId = jb.remote.counter++
        jb.entries(jb.cbLogByPath||{}).filter(e=>e[0].indexOf(ctx.path) == 0).forEach(e=>e[1].result = [])
        jb.delay(1).then(()=>remote).then(remote => remote.postObj({ $: 'sourceCB', sinkId, propName: 'rx', profile: ctx.profile.rx, ctx }))
        return jb.remote.remoteSource(remote,sinkId)
    }
})

jb.component('remote.onServer', {
    impl: ctx => jb.remote.onServer
})