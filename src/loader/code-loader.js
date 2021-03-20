
jb.extension('codeLoader', {
    existing() {
        const jbFuncs = Object.keys(jb).filter(x=> typeof jb[x] == 'function').map(x=>`#${x}`)
        const libs = Object.keys(jb).filter(x=> typeof jb[x] == 'object' && jb[x].__initialized)
        const funcs = libs.flatMap(lib=>Object.keys(jb[lib]).filter(x => typeof jb[lib][x] == 'function').map(x=>`#${lib}.${x}`) )
        return [...Object.keys(jb.comps), ...jbFuncs, ...funcs]
    },
    treeShake(comps, existing) {
        const _comps = comps.filter(x=>!existing[x])
        const dependent = jb.utils.unique(_comps.flatMap(cmpId => jb.codeLoader.dependent(cmpId).filter(x=>!existing[x])))
        if (!dependent.length) return _comps
        const existingExtended = jb.objFromEntries([...Object.keys(existing), ..._comps ].map(x=>[x,true]) )
        return [ ..._comps, ...jb.codeLoader.treeShake(dependent, existingExtended)]
    },
    dependent(cmpId) {
        const func = cmpId[0] == '#' && cmpId.slice(1)
        if (func && jb.path(jb,func) !== undefined)
            return jb.codeLoader.dependentOnFunc(jb.path(jb,func))
        else if (jb.comps[cmpId])
            return jb.codeLoader.dependentOnObj(jb.comps[cmpId])
        else
            jb.logError('codeLoader: can not find comp', {cmpId})
        return []
    },
    dependentOnObj(obj, onlyMissing) {
        const isRemote = 'source.remote:rx,remote.operator:rx,remote.action:action,remote.data:data' // code run in remote is not dependent
        const vals = Object.keys(obj).filter(k=>!obj.$ || isRemote.indexOf(`${obj.$}:${k}`) == -1).map(k=>obj[k])
        return [
            ...(obj.$ ? [obj.$] : []),
            ...vals.filter(x=> x && typeof x == 'object').flatMap(x => jb.codeLoader.dependentOnObj(x, onlyMissing)),
            ...vals.filter(x=> x && typeof x == 'function').flatMap(x => jb.codeLoader.dependentOnFunc(x, onlyMissing)),
            ...vals.filter(x=> x && typeof x == 'string' && x.indexOf('__JBART_FUNC') == 0).flatMap(x => jb.codeLoader.dependentOnFunc(x, onlyMissing)),
        ].filter(id=> !onlyMissing || jb.codeLoader.missing(id)).filter(x=> x!= 'runCtx')
    },
    dependentOnFunc(func, onlyMissing) {
        if (!func) debugger
        const funcStr = typeof func == 'string' ? func : func.toString()
        const funcDefs = [...funcStr.matchAll(/{([a-zA-Z0-9_ ,]+)}\s*=\s*jb\.([a-zA-Z0-9_]+)\b/g)] // {...} = jb.xx
            .map(line=>({ lib: line[2], funcs: line[1].split(',')}))
            .flatMap(({lib,funcs}) => funcs.map(f=>`#${lib}.${f.trim()}`))
        const funcUsage = [...funcStr.matchAll(/\bjb\.([a-zA-Z0-9_]+)\.?([a-zA-Z0-9_]*)\(/g)].map(e=>e[2] ? `#${e[1]}.${e[2]}` : `#${e[1]}`)
        //jb.log('codeLoader dependent on func',{f: func.name || funcStr, funcDefs, funcUsage})

        return [ ...(func.__initFuncs || []), ...funcDefs, ...funcUsage]
            .filter(x=>!x.match(/^#frame\./)).filter(id=> !onlyMissing || jb.codeLoader.missing(id))
    },
    code(ids) {
        jb.log('codeLoader code',{ids})
        const funcs = ids.filter(cmpId => !jb.comps[cmpId])
        const cmps = ids.filter(cmpId => jb.comps[cmpId])
        const topLevel = jb.utils.unique(funcs.filter(x=>x.match(/#[a-zA-Z0-9_]+$/))).map(x=>x.slice(1))
        const topLevelCode = topLevel.length && `Object.assign(jb, ${jb.utils.prettyPrint(jb.objFromEntries(topLevel.map(x=>[x,jb.path(jb,x)])))}\n)` || ''
        const libs = jb.utils.unique(funcs.map(x=> (x.match(/#([a-zA-Z0-9_]+)\./) || ['',''])[1] ).filter(x=>x)) // group by
        const libsCode = libs.map(lib => {
            const funcsCode = jb.utils.prettyPrint(jb.objFromEntries(funcs.filter(x=>x.indexOf(lib) == 1).map(x=>[x.split('.').pop(),jb.path(jb,x.slice(1))])))
            return `jb.extension('${lib}', ${funcsCode})`
        }).join('\n\n')

        const compsCode = cmps.map(cmpId =>jb.codeLoader.compToStr(cmpId)).join('\n\n')
            //jb.utils.prettyPrintComp(cmpId,jb.comps[cmpId],{noMacros: true})).join('\n\n')
        return [topLevelCode,libsCode,compsCode,`jb.initializeLibs([${libs.map(l=>"'"+l+"'").join(',')}])`].join(';\n\n')
    },
    compToStr(cmpId) {
        const content = JSON.stringify(jb.comps[cmpId],
            (k,v) => typeof v === 'function' ? '@@FUNC'+v.toString()+'FUNC@@' : v,2)
                .replace(/"@@FUNC([^@]+)FUNC@@"/g, (_,str) => str.replace(/\\\\n/g,'@@__N').replace(/\\r\\n/g,'\n').replace(/\\n/g,'\n').replace(/\\t/g,'').replace(/@@__N/g,'\\\\n') )
        return `jb.component('${cmpId}', ${content})`
    },
    bringMissingCode(obj) {
        const missing = getMissingProfiles(obj)
        jb.log('codeLoader bring missing code 1',{obj, missing})
        if (missing.length) 
            jb.log('codeLoader bring missing code',{obj, missing})
        return Promise.resolve(missing.length && jb.codeLoader.getCodeFromRemote(missing))

        function getMissingProfiles(obj) {
            if (obj && typeof obj == 'object') 
                return jb.codeLoader.dependentOnObj(obj,true)
            else if (typeof obj == 'function') 
                return jb.codeLoader.dependentOnFunc(obj,true)
            return []
        }
    },
    missing(id) {
        return !(jb.comps[id] || id[0] == '#' && jb.path(jb, id.slice(1)))
    },
    getCodeFromRemote(ids) {
        const stripedCode = {
            $: 'runCtx', path: '',
            profile: {$: 'codeLoader.getCode'},
            vars: { ids: ids.join(','), existing: jb.codeLoader.existing().join(',') }
        }
        jb.log('codeLoader request code from remote',{ids, stripedCode})
        return jb.codeLoaderJbm && jb.codeLoaderJbm['remoteExec'](stripedCode)
            .then(code=> {
                jb.log('codeLoader code arrived from remote',{ids, stripedCode, length: code.length, url: `${jb.uri}-${ids[0]}-x.js`, lines: 1+(code.match(/\n/g) || []).length })
                try {
                    jb.codeLoader.totalCodeSize = (jb.codeLoader.totalCodeSize || 0) + code.length
                    eval(`(function(jb) {${code}})(jb)\n//# sourceURL=${jb.uri}-${ids[0]}-x.js` )
                } catch(error) {
                    jb.log('codeLoader eval error from remote',{error, ids, stripedCode})
                }
            })
    },
    startupCode: () => codeLoader.code(jb.codeLoader.treeShake(codeLoader.coreComps(),{})),
    coreComps: () => ['#extension','#core.run','#component','#jbm.extendPortToJbmProxy','#jbm.portFromFrame','#spy.initSpy','#codeLoader.getCodeFromRemote','codeLoader.getCode','waitFor'],
})

jb.component('codeLoader.getCode',{
    impl: ({vars}) => {
        const treeShake = jb.codeLoader.treeShake(vars.ids.split(','),jb.objFromEntries(vars.existing.split(',').map(x=>[x,true])))
        jb.log('codeLoader treeshake',{...vars, treeShake})
        return jb.codeLoader.code(treeShake)
    }
})