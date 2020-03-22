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
        updateRenderer(delta,elemId,cmpId,widgetId) {
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
                    jb.ui.updateRenderer(jb.ui.compareVdom({},top),widgetId,null,widgetId)
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

})()