jb.extension('treeShake', {
    initExtension() {
        return {
            clientComps: ['#extension','#core.run','#component','#jbm.extendPortToJbmProxy','#jbm.portFromFrame','#spy.initSpy','#treeShake.getCodeFromRemote','#cbHandler.terminate','treeShake.getCode','waitFor'],
            existingFEPaths: {},
            loadedFElibs: {},
            loadingCode: {},
            server: jb.frame.jbInit,
            serverUrl: jb.frame.jbTreeShakeServerUrl,
            getJSFromUrl: jb.frame.jbGetJSFromUrl,
            baseUrl: typeof jb.frame.jbBaseUrl != 'undefined' ? jb.frame.jbBaseUrl : ''
        }
    },
    existing() {
        const jbFuncs = Object.keys(jb).filter(x=> typeof jb[x] == 'function').map(x=>`#${x}`)
        const libs = Object.keys(jb).filter(x=> typeof jb[x] == 'object' && jb[x].__extensions)
        const funcs = libs.flatMap(lib=>Object.keys(jb[lib]).filter(x => typeof jb[lib][x] == 'function').map(x=>`#${lib}.${x}`) )
        return [...Object.keys(jb.comps), ...jbFuncs, ...funcs]
    },
    treeShake(ids, existing) {
        const _ids = ids.filter(x=>!existing[x])
        const dependent = jb.utils.unique(_ids.flatMap(id => jb.treeShake.dependent(id).filter(x=>!existing[x])))
        const idsWithoutPartial = jb.utils.unique(_ids.map(id=>id.split('~')[0]))
        if (!dependent.length) return idsWithoutPartial
        const existingExtended = jb.objFromEntries([...Object.keys(existing), ..._ids ].map(x=>[x,true]) )
        return [ ...idsWithoutPartial, ...jb.treeShake.treeShake(dependent, existingExtended)]
    },
    dependent(id) {
        const func = id[0] == '#' && id.slice(1)
        if (func && jb.path(jb,func) !== undefined)
            return jb.treeShake.dependentOnFunc(jb.path(jb,func))
        else if (jb.comps[id])
            return jb.treeShake.dependentOnObj(jb.comps[id])
        else if (id.match(/~/)) 
            return [jb.path(jb.comps,id.split('~'))].filter(x=>x)
                .flatMap(obj=> typeof obj === 'function' ? jb.treeShake.dependentOnFunc(obj) : jb.treeShake.dependentOnObj(obj))
        else
            jb.logError('treeShake: can not find comp', {id})
        return []
    },
    dependentOnObj(obj, onlyMissing) {
        const isRemote = 'source.remote:rx,remote.operator:rx,remote.action:action,remote.data:data' // code run in remote is not dependent
        const vals = Object.keys(obj).filter(k=>!obj.$ || isRemote.indexOf(`${obj.$}:${k}`) == -1).map(k=>obj[k])
        return [
            ...(obj.$ ? [obj.$] : []),
            ...vals.filter(x=> x && typeof x == 'object').flatMap(x => jb.treeShake.dependentOnObj(x, onlyMissing)),
            ...vals.filter(x=> x && typeof x == 'function').flatMap(x => jb.treeShake.dependentOnFunc(x, onlyMissing)),
            ...vals.filter(x=> x && typeof x == 'string' && x.indexOf('%$') != -1).flatMap(x => jb.treeShake.dependentResources(x, onlyMissing)),
            ...vals.filter(x=> x && typeof x == 'string' && x.indexOf('__JBART_FUNC') == 0).flatMap(x => jb.treeShake.dependentOnFunc(x, onlyMissing)),
        ].filter(id=> !onlyMissing || jb.treeShake.missing(id)).filter(x=> x!= 'runCtx')
    },
    dependentOnFunc(func, onlyMissing) {
        if (!func) debugger
        const funcStr = typeof func == 'string' ? func : func.toString()
        const funcDefs = [...funcStr.matchAll(/{([a-zA-Z0-9_ ,]+)}\s*=\s*jb\.([a-zA-Z0-9_]+)\b[^\.]/g)] // {...} = jb.xx
            .map(line=>({ lib: line[2], funcs: line[1].split(',')}))
            .flatMap(({lib,funcs}) => funcs.map(f=>`#${lib}.${f.trim()}`))
        const funcUsage = [...funcStr.matchAll(/\bjb\.([a-zA-Z0-9_]+)\.?([a-zA-Z0-9_]*)\(/g)].map(e=>e[2] ? `#${e[1]}.${e[2]}` : `#${e[1]}`)
        const extraComps = [...funcStr.matchAll(/\/\/.?#jbLoadComponents:([ ,\.\-#a-zA-Z0-9_]*)/g)].map(e=>e[1]).flatMap(x=>x.split(',')).map(x=>x.trim()).filter(x=>x)
        //jb.log('treeShake dependent on func',{f: func.name || funcStr, funcDefs, funcUsage})
        return [ ...(func.__initFunc ? [func.__initFunc] : []), ...funcDefs, ...funcUsage, ...extraComps]
            .filter(x=>!x.match(/^#frame\./)).filter(id=> !onlyMissing || jb.treeShake.missing(id))
    },
    dependentResources(str, onlyMissing) {
        return Array.from(str.matchAll(/%\$([^%\.\/]*)/g)).map(x=>`dataResource.${x[1]}`)
            .filter(id => jb.comps[id])
            .filter(id=> !onlyMissing || jb.treeShake.missing(id))
    },
    code(ids) {
        jb.log('treeShake code',{ids})
        const funcs = ids.filter(cmpId => !jb.comps[cmpId])
        const cmps = ids.filter(cmpId => jb.comps[cmpId])
        const topLevel = jb.utils.unique(funcs.filter(x=>x.match(/#[a-zA-Z0-9_]+$/))).map(x=>x.slice(1))
        const topLevelCode = topLevel.length && `Object.assign(jb, ${jb.utils.prettyPrint(jb.objFromEntries(topLevel.map(x=>[x,jb.path(jb,x)])))}\n)` || ''
        const libsFuncs = jb.utils.unique(funcs.filter(x=>!x.match(/#[a-zA-Z0-9_]+$/))).map(x=>x.slice(1))
            .filter(x=>jb.path(jb,x)).map(funcId =>({funcId, lib: funcId.split('.')[0], ext: jb.path(jb,funcId).extId}))
            .filter(x=>!x.funcId.match(/\.__extensions/))
        const noExt = libsFuncs.filter(x=>!x.ext)
        if (noExt.length)
            debugger
        const extensions = jb.utils.unique(libsFuncs.map(x=>`${x.lib}#${x.ext}`)).map(x=>x.split('#'))
        const libsCode = extensions.map(([lib,ext]) => {
            const extObj = {
                ...jb.objFromEntries(libsFuncs.filter(x=>x.lib == lib && x.ext == ext)
                    .map(x=>[x.funcId.split('.').pop(), jb.path(jb,x.funcId)]) ),
                $phase: jb.path(jb,`${lib}.__extensions.${ext}.phase`),
                $requireLibs: jb.path(jb,`${lib}.__extensions.${ext}.requireLibs`),
                $requireFuncs: jb.path(jb,`${lib}.__extensions.${ext}.requireFuncs`),
                initExtension: jb.path(jb,`${lib}.__extensions.${ext}.init`),
            }
            const extCode = jb.utils.prettyPrint(Object.fromEntries(Object.entries(extObj).filter(([_, v]) => v != null)))
            return `jb.extension('${lib}', '${ext}', ${extCode})`
        }).join('\n\n')

        const compsCode = cmps.map(cmpId =>jb.treeShake.compToStr(cmpId)).join('\n\n')
            //jb.utils.prettyPrintComp(cmpId,jb.comps[cmpId],{noMacros: true})).join('\n\n')
        return [
            topLevelCode,libsCode,compsCode,
            `await jb.initializeLibs([${jb.utils.unique(libsFuncs.map(x=>x.lib)).map(l=>"'"+l+"'").join(',')}])`,
        ].join(';\n')

    },
    compToStr(cmpId) {
        const compWithLocation = { ...jb.comps[cmpId], location : jb.comps[cmpId][jb.core.location]}
        const content = JSON.stringify(compWithLocation,
            (k,v) => typeof v === 'function' ? '@@FUNC'+v.toString()+'FUNC@@' : v,2)
                .replace(/"@@FUNC([^@]+)FUNC@@"/g, (_,str) => str.replace(/\\\\n/g,'@@__N').replace(/\\r\\n/g,'\n').replace(/\\n/g,'\n').replace(/\\t/g,'').replace(/@@__N/g,'\\\\n') )
        return `jb.component('${cmpId}', ${content})`
    },
    async bringMissingCode(obj) {
        const missing = getMissingProfiles(obj)
        if (missing.length) 
            jb.log('treeShake bring missing code',{obj, missing})
        return Promise.resolve(jb.treeShake.getCodeFromRemote(missing))

        function getMissingProfiles(obj) {
            if (obj && typeof obj == 'object') 
                return jb.treeShake.dependentOnObj(obj,true)
            else if (typeof obj == 'function') 
                return jb.treeShake.dependentOnFunc(obj,true)
            return []
        }
    },
    missing(id) {
        return !(jb.comps[id] || id[0] == '#' && jb.path(jb, id.slice(1)))
    },
    async getCodeFromRemote(_ids) {
        const ids = _ids.filter(id => jb.treeShake.missing(id))
        if (!ids.length) return
        const vars = { ids: ids.join(','), existing: jb.treeShake.existing().join(',') }
        if (jb.treeShake.serverUrl) {
            const url = `${jbTreeShakeServerUrl}/jb-${ids[0]}-x.js?ids=${vars.ids}&existing=${vars.existing}`.replace(/#/g,'-')
            console.log(`treeShake: ${url}`)
            jb.log('treeShake getCode',{url,ids})
            return await jb['treeShake'].getJSFromUrl(url)
        }

        const stripedCode = {
            $: 'runCtx', path: '', vars,
            profile: {$: 'treeShake.getCode'}
        }
        jb.log('treeShake request code from remote',{ids, stripedCode})
        jb.treeShake.loadingCode[vars.ids] = true
        if (!jb.treeShake.codeServerJbm)
            jb.logError(`treeShake - missing codeServer jbm at ${jb.uri}`,{ids})
        return jb.treeShake.codeServerJbm && jb.treeShake.codeServerJbm['remoteExec'](stripedCode)
            .then(async code=> {
                jb.log('treeShake code arrived from remote',{ids, stripedCode, length: code.length, url: `${jb.uri}-${ids[0]}-x.js`, lines: 1+(code.match(/\n/g) || []).length })
                try {
                    jb.treeShake.totalCodeSize = (jb.treeShake.totalCodeSize || 0) + code.length
                    await eval(`(async function(jb) {${code}})(jb)\n//# sourceURL=${jb.uri}-${ids[0]}-x.js` )
                } catch(error) {
                    jb.log('treeShake eval error from remote',{error, ids, stripedCode})
                } finally {
                    delete jb.treeShake.loadingCode[vars.ids]
                }
            })
    },
    clientCode: () => jb.treeShake.code(jb.treeShake.treeShake(jb.treeShake.clientComps,{})),
    treeShakeFrontendFeatures(paths) { // treeshake the code of the FRONTEND features without the backend part
        const _paths = paths.filter(path=>! jb.treeShake.existingFEPaths[path]) // performance - avoid tree shake if paths were processed before 
        if (!_paths.length) return []
        paths.forEach(path=>jb.treeShake.existingFEPaths[path] = true)
        return jb.utils.unique(jb.treeShake.treeShake(_paths,jb.treeShake.existing()).map(path=>path.split('~')[0]).filter(id=>jb.treeShake.missing(id)))
    },
    async loadFELibsDirectly(libs) {
        if (typeof document == 'undefined') {
            debugger
            return jb.logError('can not load front end libs to a frame without a document')
        }
        const _libs = jb.utils.unique(libs).filter(lib=>! jb.treeShake.loadedFElibs[lib])
        return _libs.reduce((pr,lib) => pr.then(()=> loadFile(lib)).then(()=> jb.treeShake.loadedFElibs[lib] = true), Promise.resolve())

        function loadFile(lib) {
            return new Promise(resolve => {
                const type = lib.indexOf('.css') == -1 ? 'script' : 'link'
                var s = document.createElement(type)
                s.setAttribute(type == 'script' ? 'src' : 'href',`${jb.treeShake.baseUrl||''}/dist/${lib}`)
                if (type == 'script') 
                    s.setAttribute('charset','utf8') 
                else 
                    s.setAttribute('rel','stylesheet')
                s.onload = s.onerror = resolve
                document.head.appendChild(s)
            })
        }        
    },
})

jb.component('treeShake.getCode', {
    impl: ({vars}) => {
        const treeShake = jb.treeShake.treeShake(vars.ids.split(','),jb.objFromEntries(vars.existing.split(',').map(x=>[x,true])))
        jb.log('treeShake treeshake',{...vars, treeShake})
        return jb.treeShake.code(treeShake)
    }
})

// code loader client

jb.component('treeShake.getCodeFromRemote', {
    params: [
        {id: 'ids'}
    ],
    impl: async (ctx,ids) => ids && jb.treeShake.getCodeFromRemote(ids.split(','))
})

// jb.component('treeShake.settreeShakeJbm', {
//     params: [
//         {id: 'treeShakeUri' }
//     ],
//     impl: (ctx, uri) => jb.treeShake.codeServerJbm = ctx.run({$: 'jbm.byUri', uri}),
//     require: {$ : 'jbm.byUri'}
// })