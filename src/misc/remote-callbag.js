jb.remote = {
    cbCounter: 1,
    counter: 1,
    remoteId: Symbol.for("remoteId"),
    remoteHash: {},
    servers: {
        local: {
            runCtx(ctxIdToRun,vars) { return jb.ctxDictionary[ctxIdToRun].setVars(vars).runItself() }
        }
    },
    pathOfDistFolder() {
        const pathOfDistFolder = jb.path(jb.studio,'studiojb.studio.host.pathOfDistFolder')
        const location = jb.path(jb.studio,'studioWindow.location') || jb.path(jb.frame,'location')
        return pathOfDistFolder && pathOfDistFolder() || location && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
    },
    remoteSource: (remote, id,logName) => {
        const {pipe,takeWhile,map,filter,talkbackNotifier,jbLog} = jb.callbag
        return pipe(
            remote.messageSource, 
            filter(m=> m.id == id),
            talkbackNotifier( (t,d) => t == 2 && remote.postObj({$: 'talkback', id, t, d})),
            takeWhile(m=> m.$ != 'CBFinished'),
            filter(m=> m.data),
            map( ({data})=> new jb.jbCtx().ctx({data: data.data, vars: data.vars})),
            jbLog(logName || 'remote source')
        )
    },
    remoteSink: (remote, id,logName) => source => {
        const {pipe,Do,talkbackSrc,filter,jbLog} = jb.callbag
        return pipe(
            source,
            talkbackSrc(pipe(remote.messageSource, filter(m=> m.id == id && m.$ == 'talkback'))),
            Do(m=> remote.postObj({id, data: m})),
            jbLog(logName || 'remote source')
        )
    },
    prepareForClone: (obj,depth) => {
        depth = depth || 0
        if (obj == null || depth > 10) return
        if (['string','boolean','number'].indexOf(typeof obj) != -1) return obj
        if (Array.isArray(obj)) return obj.map(val => jb.remote.prepareForClone(val, depth+1))
        if (typeof obj == 'function') {
            const funcParams = jb.objFromEntries('profile,runCtx,path,forcePath,param'.split(',')
                .filter(k=>obj[k] != null).map(k=>[k,jb.remote.prepareForClone(obj[k],depth+1)]))
            return {$: '__func', funcParams, code: obj.toString() }
        }
        if (typeof obj == 'object') {
            if (jb.remote.remoteClassNames[obj.constructor.name] && !obj[jb.remote.remoteId])
                obj[jb.remote.remoteId] = jb.remote.counter++
            if (obj[jb.remote.remoteId]) {
                jb.remote.remoteHash[obj[jb.remote.remoteId]] = obj
                const debugProps = jb.objFromEntries([['name',obj.constructor.name], ...jb.entries(obj).filter(e=>(typeof e).match(/string|number|boolean/)).map(([id,val])=>[id,jb.remote.prepareForClone(val, depth+1)])])
                return {$: '__remoteObj', __id: obj[jb.remote.remoteId], ...debugProps }
            }
            if (obj.constructor.name == 'jbCtx')
                return { 
                    profile: jb.remote.prepareForClone(obj.profile,depth+1),
                    vars: jb.remote.prepareForClone(obj.vars,depth+1),
                    data: jb.remote.prepareForClone(obj.data,depth+1),
                    componentContext: {params: jb.remote.prepareForClone(jb.path(obj.componentContext,'params'),depth+1) },
                    path: obj.path,
                    forcePath: obj.forcePath,
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
        else if (obj && typeof obj == 'object' && obj.$ == '__func') {
            const resolvedParams = jb.remote.evalFunctions(obj.funcParams)
            if (obj.funcParams && obj.funcParams.path != null)
                return (({profile,runCtx,path,forcePath,param}) => (ctx2,data2) => {
                    const newCtx = new jb.jbCtx({},runCtx).extendVars(ctx2,data2).ctx({ profile, forcePath, path })
                    return jb.run(newCtx,param)
                }) (resolvedParams)
            else
                return jb.eval(obj.code)
        } else if (obj && typeof obj == 'object' && obj.$ == '__remoteObj' && jb.remote.onServer )
            return jb.remote.remoteHash[obj.__id]
        else if (obj && typeof obj == 'object')
            return jb.objFromEntries( jb.entries(obj).map(([id,val])=>[id, jb.remote.evalFunctions(val)]))
        return obj
    },
    startCommandListener() {
        const {pipe,Do,filter,subscribe} = jb.callbag
        pipe(
            jb.frame.messageSource,
            filter(m=> m.$ == 'innerCB' || m.$ == 'sourceCB'),
            Do(m=> jb.log('remoteCmdReceived',[m])),
            subscribe(m=> {
                pipe(
                    m.$ == 'innerCB' && jb.remote.remoteSource(jb.frame, m.sourceId,'inputInRemote'),
                    new jb.jbCtx().ctx(m.ctx).runInner(m.ctx.profile[m.propName], {type: 'rx'} ,m.propName),
                    jb.remote.remoteSink(jb.frame, m.sinkId,'outputInRemote'),                   
                    Do(m => m.debug && jb.frame.postObj({
                        $: 'cbLogByPathDiffs', id: m.sinkId, diffs: jb.remote.cbLogByPathDiffs(m.ctx.forcePath)})),
                    subscribe({
                        complete: () => jb.frame.postObj({$: 'CBFinished', id: m.sinkId }),
                        error: e => jb.frame.postObj({$: 'CBFinished', id: m.sinkId, e })
                    })
                )
                m.$ == 'innerCB' && jb.frame.postObj({ sinkId: m.sinkId, $: 'innerCBReady' })
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
    remoteClassNames: {tst: true}
}

jb.component('remote.worker', {
    type: 'remote',
    params: [
        {id: 'id', as: 'string', defaultValue: 'mainWorker' },
        {id: 'libs', as: 'array', defaultValue: ['common','remote','rx'] },
    ],    
    impl: (ctx,id,libs) => {
        const uri = `worker:${id}`
        if (jb.remote.servers[uri]) 
            return jb.remote.servers[uri]
        const distPath = jb.remote.pathOfDistFolder()
        const workerCode = [
            ...libs.map(lib=>`importScripts('${distPath}/${lib}.js')`),`
                self.workerId = () => 1
                jb.remote.onServer = true
                jb.cbLogByPath = {}
                jb.initSpy({spyParam: 'remoteCallbag'})
                const {pipe,Do,fromEvent,map,subscribe} = jb.callbag
                self.messageSource = pipe(
                    fromEvent('message',self),
                    map(m=> jb.remote.evalFunctions(JSON.parse(m.data)))
                )
                self.postObj = m => postMessage(JSON.stringify(jb.remote.prepareForClone(m)))
                jb.remote.startCommandListener()`
        ].join('\n')
        const worker = jb.remote.servers[uri] = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})))
        worker.uri = uri
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

jb.component('remote.local', {
    type: 'remote',
    impl: () => ({ uri: 'local'})
})

jb.component('remote.innerRx', {
    type: 'rx',
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: remote.local()}
    ],
    impl: (ctx,rx,remote) => {
        if (remote.uri == 'local') return rx(ctx.setVar('remoteUri',remote.uri))
        const sourceId = jb.remote.cbCounter++
        const sinkId = jb.remote.cbCounter++
        jb.entries(jb.cbLogByPath||{}).filter(e=>e[0].indexOf(ctx.path) == 0).forEach(e=>e[1].result = []) // clean probe logs

        const {pipe,take,filter,Do,subscribe} = jb.callbag
        const resCB = source => (start, sink) => {
            if (start != 0) return
            Promise.resolve(remote).then(remote => {
                pipe(remote.messageSource, 
                    filter(m=> m.sinkId == sinkId && m.$ == 'innerCBReady'),
                    Do(()=> jb.log('innerCBReady',[{sourceId, sinkId},ctx])),
                    take(1), 
                    subscribe(() => {
                        const remoteSource = jb.remote.remoteSource(remote,sinkId,'inputFromRemote')
                        remoteSource(0, (t,d) => sink(t,d))
                        pipe(source,
//                            Do( e => jb.log('innerCBDataSent',[e,{sourceId, sinkId},ctx],{modifier:x=>x}) )), 
                            jb.remote.remoteSink(remote,sourceId,'outputToRemote'),subscribe(() => {}))
                }))
                remote.postObj({ $: 'innerCB', sourceId, sinkId, propName: 'rx', ctx: ctx.setVar('remoteUri',remote.uri) })
                jb.log('innerCBCodeSent',[{sourceId, sinkId},ctx])
            })
            // let talkback
            // source(0, function innerRxTB(t, d) {
            //     if (t === 0) talkback = d
            // })
    
            // sink(0, function innerRxTB(t, d) {
            //     if (t ==2 || t == 1 && !d) talkback && talkback(t,d)
            // })
        }
        return resCB // source => pipe(source, replay(), resCB)
    }
})

jb.component('source.remote', {
    type: 'rx',
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: remote.local() }
    ],
    impl: (ctx,rx,remote) => {
        if (remote.uri == 'local') return rx()
        const sinkId = jb.remote.cbCounter++
        jb.entries(jb.cbLogByPath||{}).filter(e=>e[0].indexOf(ctx.path) == 0).forEach(e=>e[1].result = [])
        jb.delay(1).then(()=> remote).then(remote => remote.postObj({ $: 'sourceCB', sinkId, propName: 'rx', ctx }))
        return jb.remote.remoteSource(remote,sinkId,'inputFromRemote')
    }
})

jb.component('remote.onServer', {
    impl: ctx => jb.remote.onServer
})