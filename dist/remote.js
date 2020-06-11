jb.remote = {
    workers: {},
    cbCounter: 1,
    counter: 1,
    remoteId: Symbol.for("remoteId"),
    remoteHash: {},
    pathOfDistFolder() {
        const host = jb.path(jb.studio,'studiojb.studio.host')
        return host && host.pathOfDistFolder() || typeof location != 'undefined' && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
    },
    remoteSource: (remote, id,logName) => {
        const {pipe,takeWhile,map,filter,talkbackNotifier,wrapWithSnifferWithLog} = jb.callbag
        return wrapWithSnifferWithLog(pipe(
            remote.messageSource, 
            filter(m=> m.id == id),
            talkbackNotifier( (t,d) => t == 2 && remote.postObj({$: 'talkback', id, t, d})),
            takeWhile(m=> m.$ != 'CBFinished'),
            filter(m=> m.data),
            map( ({data})=> new jb.jbCtx().ctx({data: data.data, vars: data.vars})),
        ),logName|| 'remoteSource',{ channel: id} )
    },
    remoteSink: (remote, id,logName) => source => {
        const {pipe,Do,talkbackSrc,filter,wrapWithSnifferWithLog} = jb.callbag
        return wrapWithSnifferWithLog(pipe(
            source,
            talkbackSrc(pipe(remote.messageSource, filter(m=> m.id == id && m.$ == 'talkback'))),
            Do(m=> remote.postObj({id, data: m})),
            Do(x=>console.log('remote sink',x))
        ),logName || 'remoteSink',{ channel: id})
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
                jb.initSpy({spyParam: 'remoteCallbag'})
                const {pipe,Do,fromEvent,map,subscribe} = jb.callbag
                self.messageSource = pipe(
                    fromEvent('message',self),
                    map(m=> jb.remote.evalFunctions(JSON.parse(m.data)))
                )
                self.postObj = m => postMessage(JSON.stringify(jb.remote.prepareForClone(m)))
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
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: worker.remoteCallbag()}
    ],
    impl: (ctx,rx,remote) => {
        const sourceId = jb.remote.cbCounter++
        const sinkId = jb.remote.cbCounter++
        jb.entries(jb.cbLogByPath||{}).filter(e=>e[0].indexOf(ctx.path) == 0).forEach(e=>e[1].result = []) // clean probe logs

        const {pipe,take,filter,replay,Do,subscribe} = jb.callbag
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
                remote.postObj({ $: 'innerCB', sourceId, sinkId, propName: 'rx', ctx })
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

jb.component('remote.sourceRx', {
    type: 'rx',
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: worker.remoteCallbag()}
    ],
    impl: (ctx,rx,remote) => {
        const sinkId = jb.remote.cbCounter++
        jb.entries(jb.cbLogByPath||{}).filter(e=>e[0].indexOf(ctx.path) == 0).forEach(e=>e[1].result = [])
        jb.delay(1).then(()=> remote).then(remote => remote.postObj({ $: 'sourceCB', sinkId, propName: 'rx', ctx }))
        return jb.remote.remoteSource(remote,sinkId,'inputFromRemote')
    }
})

jb.component('remote.onServer', {
    impl: ctx => jb.remote.onServer
});

(function(){

const storeId = Symbol.for("storeId")
const {pipe,map,filter,subscribe,take,toPromiseArray} = jb.callbag

jb.ui.serializeCtxOfVdom = function(vdom) {
    const store = {idCounter: 1, ctx: {}, data: {}, strs: []}
    mountCtxsOfVdom(vdom).forEach(ctxId=>serializeCtx(jb.ctxDictionary[ctxId], store))
    return JSON.stringify(store)

    function mountCtxsOfVdom(vdom) { // vdom or delta vdom
        return jb.unique([...([vdom['mount-ctx']] || []),
            ...(Object.keys(vdom)
                .filter(k=> vdom[k] && typeof vdom[k] === 'object')
                    .flatMap(k=>mountCtxsOfVdom(vdom[k])))
        ]).filter(x=>x)
    }
    function serializeCtx(ctx) {
        if (ctx == null) return
        // store.ctx[ctx.id] = store.ctx[ctx.id] || { id: ctx.id, path: ctx.path , $inProcess: true}
        // Object.assign(store.ctx[ctx.id], {
        //     componentContext: serializeCtx(ctx.componentContext),
        //     vars: serializeData(ctx.vars),
        //     data: serializeData(ctx.data)
        // })
        // delete store.ctx[ctx.id].$inProcess
        store.ctx[ctx.id] = store.ctx[ctx.id] || { id: ctx.id, path: ctx.path }
        return { $ctx: ctx.id }

        function serializeData(data) {
            if (data == null) return
            if (typeof data === 'number') return '#' + data
            if (typeof data === 'string' && data.match(/^#[0-9]+$/)) return '#' + data
            if (typeof data === 'string' && data.length > 10) {
                const index = store.strs.indexOf(data)
                if (index != -1) return { $str: index}
                store.strs.push(data)
                return { $str: store.strs.length -1 }
            }
            if (!data || typeof data !== 'object') return data

            if (data instanceof jb.jbCtx)
                 return { $ctx: serializeCtx(data,store) }

            if (data[storeId])
                return store.data[data[storeId]] = data[storeId]

            data[storeId] = store.idCounter++

            const ref = jb.asRef(data)
            const url = ref && ref.handler && ref.handler.urlOfRef(ref)
            if (url)
                store.data[data[storeId]] = url
            else
                store.data[data[storeId]] = jb.objFromEntries(jb.entries(data).map(e=> [e[0], serializeData(e[1])]))
            return data[storeId]
        }
    }
}

jb.ui.deserializeCtxStore = function(storeAsJson) {
    const store = JSON.parse(storeAsJson)
    const resolvedStore = { data: {}, ctx: {}}
    Object.keys(store.ctx).forEach(k=>deserializeCtx(k))
    return resolvedStore

    function deserializeCtx(id) {
        if (id.$ctx)
            return deserializeCtx(id.$ctx)
        const ctx = store.ctx[id]
        if (resolvedStore.ctx[id])
            return resolvedStore.ctx[id]
        resolvedStore.ctx[id] = new jb.jbCtx()
        Object.assign(resolvedStore.ctx[id], { id , path: ctx.path, $inProcess: true })
        Object.assign(resolvedStore.ctx[id], {
            componentContext: ctx.componentContext && deserializeCtx(ctx.componentContext),
            vars: deserializeData(ctx.vars) || {},
            data: deserializeData(ctx.data),
            profile: ctx.path.split('~').reduce((o,p) => o && o[p],jb.comps)
        })
        if (!resolvedStore.ctx[id].profile) {
            debugger
            ctx.path.split('~').reduce((o,p) => o && o[p],jb.comps)
        }
        delete resolvedStore.ctx[id].$inProcess
        return resolvedStore.ctx[id]

        function deserializeData(data) {
            if (data == null)
                return
            else if (typeof data === 'string')
                return data.match(/^#[0-9]+$/) ? +data.slice(1) : data.match(/^##[0-9]+$/) ? data.slice(1) : data
            else if (typeof data == 'object' && data.$ctx)
                return deserializeCtx(data.$ctx)
            else if (typeof data == 'object' && data.$str != null)
                return store.strs[data.$str]
            else if (typeof data == 'object')
                return jb.objFromEntries(jb.entries(data).map(e=>[e[0],deserializeData(e[1])]))
            else if (typeof data == 'number') {
                const id = data
                if (resolvedStore.data[id])
                    return resolvedStore.data[id]
                resolvedStore.data[id] = {$inProcess: true}
                Object.keys(store.data[id]).forEach(k=> resolvedStore.data[id][k] = deserializeData(store.data[id][k]))
                delete resolvedStore.data[id].$inProcess
                return resolvedStore.data[id]
            }
        }
    }
}

let messageCounter = 1;

if (jb.frame.workerId && jb.frame.workerId())
    Object.assign(jb.ui, {
        _stylesToAdd: [],
        widgets: {},
        activeElement() {},
        focus() {},
        updateRenderer({delta,elemId,cmpId,widgetId}) {
            const css = this._stylesToAdd.join('\n')
            this._stylesToAdd = []
            const store = jb.ui.serializeCtxOfVdom(delta)
            postMessage(`delta-${widgetId}>`+JSON.stringify({delta,elemId, cmpId, css, store}))
        },
        addStyleElem(innerHtml) {
            this._stylesToAdd.push(innerHtml)
        },
        handleBrowserEvent({cmpId,event,specificHandler,widgetId}) {
            const action = specificHandler ? specificHandler : `on${event.type}Handler`
            const elem = jb.ui.find(jb.ui.widgets[widgetId].top,`[cmp-id="${cmpId}"]`,{includeSelf: true})[0]
            if (elem && event.target.value != null)
                elem.value = event.target.value
            event.target = elem
            ;(elem.attributes.handlers || '').split(',').filter(x=>x.indexOf(action+'-') == 0).forEach(str=> {
                const ctx = jb.ctxDictionary[str.split('-')[1]]
                ctx && ctx.setVars({ev: event, widgetId}).runInner(ctx.profile.action,'action','action')
            })
        },
    })

function createWorker(workerId) {
    const workerReceive = ({data}) => { // this function is serialized and run on the worker
        const messageId = (data.match(/^([0-9]+)>/) || ['',''])[1]
        if (messageId)
            Promise.resolve(jb.exec(eval(data.slice(messageId.length+1))))
                .then(res=>postMessage( messageId+'>'+JSON.stringify(res)))
    }
    const workerCode = `
    self.workerId = () => ${workerId}
    importScripts('http://${location.host}/dist/jb-react-all.js')
    self.onmessage= ${workerReceive.toString()}`
    const worker = new Worker(URL.createObjectURL(new Blob([workerCode], {type: 'application/javascript'})));

    Object.assign(worker,{
        response: jb.callbag.subject(),
        onmessage(e) {
            const data = e.data
            const id = (data.match(/^([^>]+)>/) || ['',''])[1]
            jb.log('from-remote',data)
            worker.response.next(({id, data: data.slice(id.length+1) }))
        },
        handleBrowserEvent(el,event,specificHandler) {
            const widgetId = jb.ui.parents(el,{includeSelf: true}).filter(el=>el.getAttribute && el.getAttribute('widgetTop'))
                .map(el=>el.getAttribute('id'))[0]
            return this.exec(pipeline(
                        {$asIs: {
                            specificHandler,
                            cmpId: el.getAttribute('cmp-id'),
                            event: {type: event.type, target: { value: event.target.value}, scrollPercentFromTop: event.scrollPercentFromTop },
                            widgetId
                        }},
                        ctx => jb.ui.handleBrowserEvent(ctx.data)))
        },
        loadSource(sourceUrl) {
            if (!sourceUrl)
                return worker
            const script = pipeline(sourceUrl, ctx => importScripts(ctx.data))
            return worker.exec(script).then(()=>worker)
        },
        exec(prof) {
            const messageId = messageCounter++
            const message = messageId + '>'+ jb.prettyPrint(prof)
            jb.log('to-remote',message)
            console.log('to-remote: ' + message)
            worker.postMessage(message)
            return pipe(worker.response,
                    filter(({id}) => id == messageId),
                    take(1),
                    map(({data}) => data),
                    toPromiseArray)
        }
    })
    return worker
}

jb.ui.workers = {}

jb.component('worker.main', {
  type: 'remote',
  impl: ctx => ({
    getWorker() {
        if (jb.ui.mainWorker)
            return Promise.resolve(jb.ui.mainWorker)
        jb.ui.workers[1] = jb.ui.mainWorker = createWorker(1)
        return jb.ui.mainWorker.exec('"init"').then(()=>jb.ui.mainWorker) // wait for first dummy run with empty input
    },
    createWidget(ctx,main,widgetId) { // widget receives events and updates back with vdom deltas
            const widgetProf = pipeline({$asIs: {widgetId,main}}, // runs on worker
                ctx => {
                    const {main, widgetId} = ctx.data
                    const cmp = ctx.setData(null).setVar('widgetId',widgetId).run({$: main})
                    const top = jb.ui.h(cmp)
                    top.attributes = Object.assign(top.attributes || {},{ worker: 1, id: widgetId })
                    jb.ui.widgets[widgetId] = { top }
                    jb.ui.updateRenderer({delta: jb.ui.compareVdom({},top),elemId: widgetId,widgetId})
            })

            return this.getWorker().then( worker => {
                pipe(
                    worker.response,
                    filter(({id}) => id == `delta-${widgetId}`),
                    subscribe(({data}) => {
                        const _data = JSON.parse(data.replace(/"__undefined"/g,'null'))
                        console.log('delta-from-remote',_data)
                        const {delta,elemId,cmpId,css,store} = _data
                        jb.ui.mainWorker.ctxDictionary = jb.ui.mainWorker.ctxDictionary || {}
                        Object.assign(jb.ui.mainWorker.ctxDictionary,jb.ui.deserializeCtxStore(store).ctx)
                        const elem = jb.ui.document(ctx).querySelector('#'+elemId)
                            || jb.ui.document(ctx).querySelector(`[cmp-id="${cmpId}"]`)
                        elem && jb.ui.applyDeltaToDom(elem, delta)
                        css && jb.ui.addStyleElem(css)
                        jb.ui.findIncludeSelf(elem,'[interactive]').forEach(el=>
                            el._component ? el._component.recalcPropsFromElem() : jb.ui.mountInteractive(el))
                }))
                return worker.exec(widgetProf)
            })
        }
  })
})

jb.component('remote.initMainWorker', {
  type: 'control',
  params: [
    {id: 'sourceUrl', as: 'string'},
    {id: 'remote', type: 'remote', mandatory: true, defaultValue: worker.main()}
  ],
  impl: (ctx,sourceUrl,remote) => remote.getWorker().then(worker => worker.loadSource(sourceUrl))
})

jb.component('remote.widget', {
  type: 'control',
  params: [
    {id: 'main', as: 'string', description: 'main profile to run'},
    {id: 'id', as: 'string'},
    {id: 'remote', type: 'remote', mandatory: true, defaultValue: worker.main()}
  ],
  impl: (ctx,main,id,remote) => {
        const widgetId = id || 'widget' + ctx.id
        remote.createWidget(ctx,main,widgetId)
        return jb.ui.h('div',{id: widgetId, widgetTop: 'true'})
    }
})

})();

