
jb.extension('codeLoader', {
    initExtension() {
        return {
            coreComps: ['#extension','#core.run','#component','#jbm.extendPortToJbmProxy','#jbm.portFromFrame','#spy.initSpy','#codeLoader.getCodeFromRemote','codeLoader.getCode','waitFor'],
            existingFEPaths: {},
            loadedFElibs: {}
        }
    },
    existing() {
        const jbFuncs = Object.keys(jb).filter(x=> typeof jb[x] == 'function').map(x=>`#${x}`)
        const libs = Object.keys(jb).filter(x=> typeof jb[x] == 'object' && jb[x].__initialized)
        const funcs = libs.flatMap(lib=>Object.keys(jb[lib]).filter(x => typeof jb[lib][x] == 'function').map(x=>`#${lib}.${x}`) )
        return [...Object.keys(jb.comps), ...jbFuncs, ...funcs]
    },
    treeShake(ids, existing) {
        const _ids = ids.filter(x=>!existing[x])
        const dependent = jb.utils.unique(_ids.flatMap(id => jb.codeLoader.dependent(id).filter(x=>!existing[x])))
        const idsWithoutPartial = jb.utils.unique(_ids.map(id=>id.split('~')[0]))
        if (!dependent.length) return idsWithoutPartial
        const existingExtended = jb.objFromEntries([...Object.keys(existing), ..._ids ].map(x=>[x,true]) )
        return [ ...idsWithoutPartial, ...jb.codeLoader.treeShake(dependent, existingExtended)]
    },
    dependent(id) {
        const func = id[0] == '#' && id.slice(1)
        if (func && jb.path(jb,func) !== undefined)
            return jb.codeLoader.dependentOnFunc(jb.path(jb,func))
        else if (jb.comps[id])
            return jb.codeLoader.dependentOnObj(jb.comps[id])
        else if (id.match(/~/)) 
            return [jb.path(jb.comps,id.split('~'))].filter(x=>x)
                .flatMap(obj=> typeof obj === 'function' ? jb.codeLoader.dependentOnFunc(obj) : jb.codeLoader.dependentOnObj(obj))
        else
            jb.logError('codeLoader: can not find comp', {id})
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
        if (missing.length) 
            jb.log('codeLoader bring missing code',{obj, missing})
        return Promise.resolve(jb.codeLoader.getCodeFromRemote(missing))

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
        if (!ids.length) return
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
    startupCode: () => jb.codeLoader.code(jb.codeLoader.treeShake(jb.codeLoader.coreComps,{})),
    treeShakeFrontendFeatures(paths) { // treeshake the code of the FRONTEND features without the backend part
        const _paths = paths.filter(path=>! jb.codeLoader.existingFEPaths[path]) // performance - avoid tree shake if paths were processed before 
        if (!_paths.length) return []
        paths.forEach(path=>jb.codeLoader.existingFEPaths[path] = true)
        return jb.utils.unique(jb.codeLoader.treeShake(_paths,jb.codeLoader.existing()).map(path=>path.split('~')[0]).filter(id=>jb.codeLoader.missing(id)))
    },
    loadFELibsDirectly(libs) {
        if (typeof document == 'undefined') 
            return jb.logError('can not load front end libs to a frame without a document')
        const _libs = libs.filter(lib=>! jb.codeLoader.loadedFElibs[lib])
        if (!_libs.length) return []
        return _libs.reduce((pr,lib) => pr.then(loadFile(lib)).then(()=> jb.codeLoader.loadedFElibs[lib] = true), Promise.resolve())

        function loadFile(lib) {
            return new Promise(resolve => {
                const type = lib.indexOf('.css') == -1 ? 'script' : 'link'
                var s = document.createElement(type)
                s.setAttribute(type == 'script' ? 'src' : 'href',`/dist/${lib}`)
                if (type == 'script') 
                    s.setAttribute('charset','utf8') 
                else 
                    s.setAttribute('rel','stylesheet')
                s.onload = s.onerror = resolve
                document.head.appendChild(s);
            })
        }        
    },
})

jb.component('codeLoader.getCode',{
    impl: ({vars}) => {
        const treeShake = jb.codeLoader.treeShake(vars.ids.split(','),jb.objFromEntries(vars.existing.split(',').map(x=>[x,true])))
        jb.log('codeLoader treeshake',{...vars, treeShake})
        return jb.codeLoader.code(treeShake)
    }
})