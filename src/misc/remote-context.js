jb.remoteCtx = {
    stripCtx(ctx) {
        if (!ctx) return null
        const isJS = typeof ctx.profile == 'function'
        const profText = jb.prettyPrint(ctx.profile)
        const vars = jb.objFromEntries(jb.entries(ctx.vars).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
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
        const vars = jb.objFromEntries(jb.entries(runCtx.vars).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(jb.path(runCtx.cmpCtx,'params')).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        return Object.assign({$: 'runCtx', id: runCtx.id, path, forcePath, param, profile, vars}, 
            Object.keys(params).length ? {cmpCtx: {params} } : {})
    },
    serailizeCtx(ctx) { return JSON.stringify(this.stripCtx(ctx)) },
    deStrip(data) {
        const stripedObj = typeof data == 'object' && jb.objFromEntries(jb.entries(data).map(e=>[e[0],this.deStrip(e[1])]))
        if (stripedObj && data.$ == 'runCtx')
            return (ctx2,data2) => (new jb.jbCtx().ctx({...stripedObj})).extendVars(ctx2,data2).runItself()
        if (Array.isArray(data))
            return data.map(x=>this.deStrip(x))
        return stripedObj || data
    }
}

