jb.remote = {
    counter: 1,
    remoteSource: (remote, id) => jb.callbag.pipe(
        jb.callbag.fromEvent('message',remote),
        jb.callbag.map(m=> jb.remote.evalFunctions(JSON.parse(m.data))), 
        jb.callbag.filter(m=> m.id == id),
        jb.callbag.takeWhile(m=> !m.finished),
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
        const {pipe,filter,fromEvent,map,subscribe} = jb.callbag

        pipe(
            fromEvent('message', self), 
            map(m=> jb.remote.evalFunctions(JSON.parse(m.data))),
            filter(m=> !m.id),
            subscribe(m=> pipe(
                    m.$ == 'innerCB' && jb.remote.remoteSource(self, m.sourceId),
                    new jb.jbCtx().ctx(m.ctx).runInner(m.profile, {type: 'rx'} ,m.propName),
                    jb.remote.remoteSink(self, m.sinkId),
                    subscribe({complete: () => postMessage(JSON.stringify({id: m.sinkId, finished: true}))})
            ))
        )
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
        return source => (start,sink) => {
            if (start!=0) return
            jb.delay(10).then(()=> jb.callbag.subscribe(()=>{})(jb.remote.remoteSink(remote,sourceId)(source)))
            const remoteSource = jb.remote.remoteSource(remote,sinkId)
            remoteSource(0, (t,d) => sink(t,d))
        }
//        pipe(source,jb.remote.remoteSink(remote,sourceId), block, () => jb.remote.remoteSource(remote,sinkId))
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
        jb.delay(1).then(()=> remote.postObj({ $: 'sourceCB', sinkId, propName: 'rx', profile: ctx.profile.rx, ctx }))
        return jb.remote.remoteSource(remote,sinkId)
    }
})
