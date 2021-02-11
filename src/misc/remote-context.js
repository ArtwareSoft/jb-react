jb.remoteCtx = {
    stripCtx(ctx) {
        if (!ctx) return null
        const isJS = typeof ctx.profile == 'function'
        const profText = jb.prettyPrint(ctx.profile)
        const vars = jb.objFromEntries(jb.entries(ctx.vars).filter(e => e[0] == '$disableLog' || profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const data = profText.match(/({data})|(ctx.data)|(%%)/) && this.stripData(ctx.data) 
        const params = jb.objFromEntries(jb.entries(isJS ? ctx.params: jb.entries(jb.path(ctx.cmpCtx,'params')))
            .filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const res = Object.assign({id: ctx.id, path: ctx.path, profile: ctx.profile, data, vars }, 
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
             return data.slice(0,100).map(x=>this.stripData(x))
        if (typeof data == 'object' && ['VNode','Object','Array'].indexOf(data.constructor.name) == -1)
            return { $$: data.constructor.name}
        if (typeof data == 'object' && data.comps)
            return { uri : data.uri}
        if (typeof data == 'object')
             return jb.objFromEntries(jb.entries(data).filter(e=> typeof e[1] != 'function').map(e=>[e[0],this.stripData(e[1])]))
    },
    stripFunction(f) {
        const {profile,runCtx,path,param,srcPath} = f
        if (!profile || !runCtx) return this.stripJS(f)
        const profText = jb.prettyPrint(profile)
        const profNoJS = this.stripJSFromProfile(profile)
        const vars = jb.objFromEntries(jb.entries(runCtx.vars).filter(e => e[0] == '$disableLog' || profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(jb.path(runCtx.cmpCtx,'params')).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        return Object.assign({$: 'runCtx', id: runCtx.id, path: [srcPath,path].join('~'), param, profile: profNoJS, data: this.stripData(runCtx.data), vars}, 
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
        if (typeof profile == 'function')
            return `__JBART_FUNC: ${profile.toString()}`
        else if (Array.isArray(profile))
            return profile.map(val => this.stripJS(val))
        else if (typeof profile == 'object')
            return jb.objFromEntries(jb.entries(profile).map(([id,val]) => [id, this.stripJS(val)]))
        return profile
    },
    stripJS(val) {
        return typeof val == 'function' ? `__JBART_FUNC: ${val.toString()}` : this.stripData(val)
    },
    serializeCmp(compId) {
        if (!jb.comps[compId])
            return jb.logError('no component of id ',{compId}),''
        return jb.prettyPrint({compId, ...jb.comps[compId],
            location: jb.comps[compId][jb.location], loadingPhase: jb.comps[compId][jb.loadingPhase]} )
    },
    deSerializeCmp(code) {
        if (!code) return
        try {
            const cmp = eval('('+code+')')
            const res = {...cmp, [jb.location]: cmp.location, [jb.loadingPhase]: cmp.loadingPhase }
            delete res.location
            delete res.loadingPhase
            jb.comps[res.compId] = res
        } catch (e) {
            jb.logException(e,'eval profile',{code})
        }        
    },
}

