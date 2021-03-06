jb.extension('loader', {
    treeShake(comps, existing) {
        const _comps = comps.filter(x=>!existing[x])
        const dependent = jb.utils.unique(_comps.flatMap(cmpId => jb.loader.dependent(cmpId).filter(x=>!existing[x])))
        if (!dependent.length) return _comps
        const existingExtended = jb.objFromEntries([...Object.keys(existing), ..._comps ].map(x=>[x,true]) )
        return [ ..._comps, ...jb.loader.treeShake(dependent, existingExtended)]
    },
    dependent(cmpId) {
        if (jb.comps[cmpId])
            return dependentOnObj(jb.comps[cmpId])
        else if (jb.path(jb,cmpId.split('#').pop()) !== undefined)
            return dependentOnFunc(jb.path(jb,cmpId.split('#').pop()))
        else
            jb.logError('can not find comp', {cmpId})
        return []
        
        function dependentOnObj(obj) {
            return [
                ...(obj.$ ? [obj.$] : []),
                ... Object.values(obj).filter(x=> x && typeof x == 'object').flatMap(x => dependentOnObj(x)),
                ... Object.values(obj).filter(x=> x && typeof x == 'function').flatMap(x => dependentOnFunc(x)),
            ]
        }
        function dependentOnFunc(func) {
            return [
                ...[func.__initFunc].filter(x=>x),
                ...[...func.toString().matchAll(/\bjb\.([a-zA-Z0-9_]+)\.?([a-zA-Z0-9_]*)\(/g)].map(e=>e[2] ? `#${e[1]}.${e[2]}` : `#${e[1]}`)
            ]
        }
    },
    code(ids) {
        const funcs = ids.filter(cmpId => !jb.comps[cmpId])
        const cmps = ids.filter(cmpId => jb.comps[cmpId])
        console.log(1)
        const topLevel = jb.utils.unique(funcs.filter(x=>x.match(/#[a-zA-Z0-9_]+$/))).map(x=>x.slice(1))
        console.log(1,topLevel)
        const topLevelCode = `Object.assign(jb, ${jb.utils.prettyPrint(jb.objFromEntries(topLevel.map(x=>[x,jb.path(jb,x)])))}\n)`
        console.log(2,topLevelCode)
        const libs = jb.utils.unique(funcs.map(x=> (x.match(/#([a-z]+)\./) || ['',''])[1] ).filter(x=>x)) // group by
        const libsCode = libs.map(lib => {
            const funcsCode = jb.utils.prettyPrint(jb.objFromEntries(funcs.filter(x=>x.indexOf(lib) == 1).map(x=>[x.split('.').pop(),jb.path(jb,x.slice(1))])))
            return `jb.extension('${lib}', ${funcsCode})`
        }).join('\n\n')
        debugger

        const compsCode = cmps.map(cmpId =>jb.utils.prettyPrintComp(cmpId,jb.comps[cmpId],{noMacros: true})).join('\n\n')
        return [topLevelCode,libsCode,compsCode,'debugger'].join(';\n\n')
    },
    core: ['#extension','#core.run','#component','#jbm.extendPortToJbmProxy','#jbm.portFromFrame'],
})
