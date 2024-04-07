extension('remoteCtx', {
    initExtension() {
        return { allwaysPassVars: ['widgetId','disableLog','uiTest'], MAX_ARRAY_LENGTH: 10000, MAX_OBJ_DEPTH: 100}
    },
    stripCtx(ctx) {
        if (!ctx) return null
        const isJS = typeof ctx.profile == 'function'
        const profText = jb.utils.prettyPrint(ctx.profile)
        const vars = jb.objFromEntries(jb.entries(ctx.vars)
            .filter(e => jb.remoteCtx.shouldPassVar(e[0],profText))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const data = jb.remoteCtx.usingData(profText) && jb.remoteCtx.stripData(ctx.data)
        const params = jb.objFromEntries(jb.entries(isJS ? ctx.params: jb.entries(jb.path(ctx.cmpCtx,'params')))
            .filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const res = Object.assign({id: ctx.id, path: ctx.path, profile: ctx.profile, data, vars }, 
            isJS ? {params,vars} : Object.keys(params).length ? {cmpCtx: {params} } : {} )
        return res
    },
    stripData(data, { top, depth, path} = {}) {
        if (data == null || (path||'').match(/parentNode$/)) return
        const innerDepthAndPath = key => ({depth: (depth || 0) +1, top: top || data, path: [path,key].filter(x=>x).join('~') })

        if (['string','boolean','number'].indexOf(typeof data) != -1) return data
        if (typeof data == 'function')
             return jb.remoteCtx.stripFunction(data)
        if (data instanceof jb.core.jbCtx)
             return jb.remoteCtx.stripCtx(data)
        if (depth > jb.remoteCtx.MAX_OBJ_DEPTH) {
             jb.logError('stripData too deep object, maybe recursive',{top, path, depth, data})
             return
        }
 
        if (Array.isArray(data) && data.length > jb.remoteCtx.MAX_ARRAY_LENGTH)
            jb.logError('stripData slicing large array',{data})
        if (Array.isArray(data))
             return data.slice(0,jb.remoteCtx.MAX_ARRAY_LENGTH).map((x,i)=>jb.remoteCtx.stripData(x, innerDepthAndPath(i)))
        if (typeof data == 'object' && ['DOMRect'].indexOf(data.constructor.name) != -1)
            return jb.objFromEntries(Object.keys(data.__proto__).map(k=>[k,data[k]]))
        if (typeof data == 'object' && (jb.path(data.constructor,'name') || '').match(/Error$/))
            return {$$: 'Error', message: data.toString() }
        if (typeof data == 'object' && ['VNode','Object','Array'].indexOf(data.constructor.name) == -1)
            return { $$: data.constructor.name }
        if (typeof data == 'object' && data[jb.core.VERSION])
            return { uri : data.uri}
        if (typeof data == 'object')
             return jb.objFromEntries(jb.entries(data)
                .filter(e=> data.$ || typeof e[1] != 'function') // if not a profile, block functions
//                .map(e=>e[0] == '$' ? [e[0], jb.path(data,[jb.core.CT,'comp',jb.core.CT,'fullId']) || e[1]] : e)
                .map(e=>[e[0],jb.remoteCtx.stripData(e[1], innerDepthAndPath(e[0]) )]))
    },
    stripFunction(f) {
        const {profile,runCtx,path,param,srcPath,require} = f
        if (!profile || !runCtx) return jb.remoteCtx.stripJS(f)
        const profText = jb.utils.prettyPrint(profile, {noMacros: true})
        const profNoJS = jb.remoteCtx.stripJSFromProfile(profile)
        if (require) profNoJS._require = require.split(',').map(x=>x[0] == '#' ? `jb.${x.slice(1)}()` : {$: x})
        const vars = jb.objFromEntries(jb.entries(runCtx.vars).filter(e => jb.remoteCtx.shouldPassVar(e[0],profText))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(jb.path(runCtx.cmpCtx,'params')).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        let probe = null
        if (runCtx.probe && runCtx.probe.active && runCtx.probe.probePath.indexOf(runCtx.path) == 0) {
            const { probePath, maxTime, id } = runCtx.probe
            probe = { probePath, startTime: 0, maxTime, id, records: {}, visits: {}, active: true }
        }
        const usingData = jb.remoteCtx.usingData(profText); //profText.match(/\bdata\b/) || profText.match(/%[^$]/)
        return Object.assign({$: 'runCtx', id: runCtx.id, path: [srcPath,path].filter(x=>x).join('~'), param, probe, profile: profNoJS, data: usingData ? jb.remoteCtx.stripData(runCtx.data) : null, vars}, 
            Object.keys(params).length ? {cmpCtx: {params} } : {})

    },
    deStrip(data, _asIs) {
        if (typeof data == 'string' && data.match(/^@js@/))
            return eval(data.slice(4))
        const asIs = _asIs || (data && typeof data == 'object' && data.$$asIs)
        const stripedObj = data && typeof data == 'object' && jb.objFromEntries(jb.entries(data).map(e=>[e[0],jb.remoteCtx.deStrip(e[1],asIs)]))
        if (stripedObj && data.$ == 'runCtx' && !asIs)
            return (ctx2,data2) => {
                const ctx = new jb.core.jbCtx(jb.utils.resolveProfile(stripedObj, {topComp: stripedObj}),{}).extendVars(ctx2,data2)
                const res = ctx.runItself()
                if (ctx.probe) {
                    if (jb.utils.isCallbag(res))
                        return jb.callbag.pipe(res, jb.callbag.mapPromise(r=>jb.remoteCtx.wrapWithProbeResult(r,ctx)))
                    return jb.remoteCtx.wrapWithProbeResult(res,ctx)
                }
                return res
            }
        if (Array.isArray(data))
            return data.map(x=>jb.remoteCtx.deStrip(x,asIs))
        return stripedObj || data
    },
    stripCBVars(cbData) {
        const res = jb.remoteCtx.stripData(cbData)
        if (res && res.vars)
            res.vars = jb.objFromEntries(jb.entries(res.vars).filter(e=>e[0].indexOf('$')!=0))

        return res
    },
    stripJSFromProfile(profile) {
        if (typeof profile == 'function')
            return `@js@${profile.toString()}`
        else if (Array.isArray(profile))
            return profile.map(val => jb.remoteCtx.stripJS(val))
        else if (typeof profile == 'object')
            return jb.objFromEntries(jb.entries(profile).map(([id,val]) => [id, jb.remoteCtx.stripJS(val)]))
        return profile
    },
    stripJS(val) {
        return typeof val == 'function' ? `@js@${val.toString()}` : jb.remoteCtx.stripData(val)
    },
    // serializeCmp(compId) {
    //     if (!jb.comps[compId])
    //         return jb.logError('no component of id ',{compId}),''
    //     return jb.utils.prettyPrint({compId, ...jb.comps[compId],
    //         location: jb.comps[compId][jb.core.CT].location } )
    // },
    shouldPassVar: (varName, profText) => jb.remoteCtx.allwaysPassVars.indexOf(varName) != -1 || profText.match(new RegExp(`\\b${varName.split(':')[0]}\\b`)),
    usingData: profText => profText.match(/({data})|(ctx.data)|(%[^$])/),
    async wrapWithProbeResult(res,ctx) {
        await Object.values(ctx.probe.records).reduce((pr,valAr) => pr.then(
            () => valAr.reduce( async (pr,item,i) => { await pr; valAr[i].out = await valAr[i].out }, Promise.resolve())
        ), Promise.resolve())
        const filteredProbe = { ...ctx.probe, records: jb.objFromEntries(jb.entries(ctx.probe.records).map(([k,v])=>[k,v.filter(x=>!x.sent)])) }
        Object.values(ctx.probe.records).forEach(arr=>arr.forEach(r => r.sent = true))
        jb.log('remote context adding probe result',{probe: filteredProbe, records: filteredProbe.records, res, ctx})
        return { $: 'withProbeResult', res, probe: filteredProbe }
    },
    mergeProbeResult(ctx,res,from) {
        if (jb.path(res,'$') == 'withProbeResult') {
            if (ctx.probe && res.probe) {
              Object.keys(res.probe.records||{}).forEach(k=>ctx.probe.records[k] = res.probe.records[k].map(x =>({...x, from})) )
              Object.keys(res.probe.visits||{}).forEach(k=>ctx.probe.visits[k] = res.probe.visits[k] )
            }
            jb.log('merged probe result', {from, remoteProbeRes: res, records: res.probe.records})
            return res.res
        }
        return res
    }
})

component('remoteCtx.mergeProbeResult', {
    promote: 0,
    params: [
        {id: 'remoteResult', byName: true },
        {id: 'from', as: 'string'}
    ],
    impl: (ctx,remoteResult,from) => {
        if (jb.path(remoteResult,'$') == 'withProbeResult') {
            const { records, visits } = remoteResult.probe
            if (ctx.probe) {
              Object.keys(records||{}).forEach(k=>ctx.probe.records[k] = records[k].map(x =>({...x, from})) )
              Object.keys(visits||{}).forEach(k=>ctx.probe.visits[k] = visits[k] )
            }
            jb.log('merged probe result', {from, remoteResult, records })
            return remoteResult.res
        }
        return remoteResult
    }
})

component('remoteCtx.varsUsed', {
  promote: 0,
  params: [
    {id: 'profile' }
  ],
  impl: (ctx,profile) => {
    const profText = jb.utils.prettyPrint(profile||'', {noMacros: true})
    return (profText.match(/%\$[a-zA-Z0-9_]+/g) || []).map(x=>x.slice(2))
  }
})
