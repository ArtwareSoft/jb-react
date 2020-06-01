jb.remote = {
    counter: 1,
    remoteSource: (remote, id) => jb.callbag.pipe(
        jb.callbag.fromEvent('message',remote),
        jb.callbag.map(m=> jb.remote.evalFunctions(JSON.parse(m.data))), 
        jb.callbag.filter(m=> m.id == id),
        jb.callbag.takeWhile(m=> !m.finished),
        jb.callbag.Do(m => m.$ == 'cbLogByPathDiffs' && jb.remote.updateCbLogs(m.diffs) ),
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
        if (typeof obj == 'function')
            return {$: '__func', code: obj.toString() }
        if (typeof obj == 'object') {
            if (obj.constructor.name == 'jbCtx')
                return { vars: jb.remote.prepareForClone(obj.vars,depth+1), data: jb.remote.prepareForClone(obj.data,depth+1), forcePath: obj.path }
            else if (!(obj.constructor.name||'').match(/^Object|Array$/))
                return obj.constructor.name
            else
                return jb.objFromEntries( jb.entries(obj).map(([id,val])=>[id,jb.remote.prepareForClone(val, depth+1)]))
        }
    },
    evalFunctions: obj => {
        if (Array.isArray(obj)) return obj.map(val => jb.remote.evalFunctions(val))
        if (obj && typeof obj == 'object' && obj.$ == '__func')
            return jb.eval(obj.code)
        if (obj && typeof obj == 'object')
            return jb.objFromEntries( jb.entries(obj).map(([id,val])=>[id, jb.remote.evalFunctions(val)]))
        return obj
    },
    startCommandListener() {
        const {pipe,Do,filter,fromEvent,map,subscribe} = jb.callbag
        pipe(
            fromEvent('message', self), 
            map(m=> jb.remote.evalFunctions(JSON.parse(m.data))),
            filter(m=> !m.id),
            subscribe(m=> {
                pipe(
                    m.$ == 'innerCB' && jb.remote.remoteSource(self, m.sourceId),
                    new jb.jbCtx().ctx(m.ctx).runInner(m.profile, {type: 'rx'} ,m.propName),
                    jb.remote.remoteSink(self, m.sinkId),
                    Do(e=> postMessage(JSON.stringify({$: 'cbLogByPathDiffs', id: m.sinkId, diffs: jb.remote.cbLogByPathDiffs(m.ctx.path)}))),
                    subscribe({complete: () => postMessage(JSON.stringify({id: m.sinkId, finished: true}))})
                )
            })
        )
    },
    cbLogByPathDiffs(path) {
        const entries = jb.entries(jb.cbLogByPath||{}).filter(e=>e[0].indexOf(path) == 0)
        const res = jb.objFromEntries(entries.map(e=>[e[0],e[1].slice(e[1].lastDiff||0)]))
        entries.forEach(e=>e[1].lastDiff = e[1].length)
        return res
    },
    updateCbLogs(diffs) {
        jb.cbLogByPath = jb.cbLogByPath || {}
        jb.entries(diffs||{}).forEach(e=>{
            jb.cbLogByPath[e[0]] = jb.cbLogByPath[e[0]] || { callbagLog: true, result: [] }
            jb.cbLogByPath[e[0]].result = jb.cbLogByPath[e[0]].result.concat(e[1])
        })
    }
}

jb.component('worker.remoteCallbag', {
    type: 'remote',
    params: [
        {id: 'libs', as: 'array', defaultValue: ['common','remote','rx'] },
    ],    
    impl: (ctx,libs) => {
        const host = jb.path(jb.studio,'studiojb.studio.host')
        const distPath = host && host.pathOfDistFolder() || `http://${location.host}/dist`
        const workerCode = [
            ...libs.map(lib=>`importScripts('${distPath}/${lib}.js')`),`
                self.workerId = () => 1
                jb.cbLogByPath = {}
                jb.remote.startCommandListener()`
        ].join('\n')
        const worker = new Worker(URL.createObjectURL(new Blob([workerCode], {type: 'application/javascript'})));
        worker.postObj = m => worker.postMessage(JSON.stringify(jb.remote.prepareForClone(m)))
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
        remote.postObj({ $: 'innerCB', sourceId, sinkId, propName: 'rx', profile: ctx.profile.rx, ctx })
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
        jb.delay(1).then(()=> remote.postObj({ $: 'sourceCB', sinkId, propName: 'rx', profile: ctx.profile.rx, ctx }))
        return jb.remote.remoteSource(remote,sinkId)
    }
})
