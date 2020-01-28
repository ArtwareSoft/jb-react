(function(){

const storeId = Symbol.for("storeId")

function serializeCtxOfVdom(vdom,store) {
    const store = {idCounter: 1}
    const ctx = jb.path(vdom,'attributes.mount-ctx')
    ctx && serializeCtx(ctx,store)
    (vdom.children || []).forEach(vd=>serializeCtxOfVdom(vd,store))
    return JSON.stringify(store)
}

function serializeCtx(ctx,store) {
    store.ctx[ctx.id] = store.ctx[ctx.id] || { id: ctx.id, path: ctx.path, 
        parent: serializeData(ctx._parent), 
        componentContext: serializeData(ctx.componentContext), 
        vars: serializeData(ctx.vars), 
        data: serializeData(data),
    }
    return store.ctx[ctx.id]

    function serializeData(data) {
        if (typeof data === 'number') return '#' + data
        if (typeof data === 'string' && data.match(/^#[0-9]+$/)) return '#' + data
        if (!data || typeof data !== 'object') return data

        if (data[storeId]) return data[storeId]
        data[storeId] = store.idCounter++

        const ref = jb.asRef(data)
        const url = ref && ref.handler && ref.handler.urlOfRef(ref)
        store.data[storeId] = url ? url :
            data instanceof jb.jbCtx ? serializeCtx(data,store) : 
            jb.objFromEntries(jb.entries(data).map(e=> [e[0], serializeData(e[1])]))
        return store.data[storeId]
    }    
}

function deserializeCtxStore(storeAsJson) {
    const store = JSON.parse(storeAsJson)
    store.res = {}
    store.ctx = jb.objFromEntries(jb.entries(store.ctx).map(e=>[e[0], deserializeCtx(e[1],store)]))
}

function deserializeCtx(ctx,store) {
    return deserializeData(ctx)

    function deserializeData(data) {
        if (typeof data === 'string')
            return data.match(/^#[0-9]+$/) ? +data.slice(1) : data.match(/^##[0-9]+$/) ? data.slice(1) : data
        if (!data || typeof data !== 'object') return data

        const id = data
        store.res[id] = store.res[id] || jb.objFromEntries(jb.entries(store.data[id]).map(e=> [e[0], deserializeData(e[1])]))

        return store.res[id]
    }
}

})()