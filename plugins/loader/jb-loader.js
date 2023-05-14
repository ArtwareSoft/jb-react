var jb_plugins = null
// [
//   'common','rx','tree-shake','pretty-print','watchable','ui',
//   'remote','testing','data-browser','remote-widget',
//   'probe','tgp','watchable-comps', 'workspace','vscode', 
//   'vega', 'zui','parsing','statistics','xml','jison'
// ];

globalThis.jbHost = globalThis.jbHost || { // browserHost - studioServer,worker and static
  fetch: (...args) => globalThis.fetch(...args),
  // isStatic: globalThis.location && globalThis.location.origin.indexOf('localhost') == -1,
  // isVsCodeView: globalThis.location && globalThis.location.origin == 'vscode-file://vscode-app',
  // isWorker: globalThis.importScripts != null,
  baseUrl: '',
  fetchOptions: {}, // {mode: 'cores'}
  log(...args) { console.log (...args) },
  WebSocket_Browser: globalThis.WebSocket,
  
  defaultCodePackage: {
    _fetch(path) { return fetch(jbHost.baseUrl + path, jbHost.fetchOptions) },
    fetchFile(path) { return this._fetch(path).then(x=>x.text()) },
    fetchJSON(path) { return this._fetch(path).then(x=>x.json()) },
    fileSymbols(path,useFileSymbolsFromBuild) { return useFileSymbolsFromBuild ? this.fileSymbolsFromStaticFileServer(path) 
      : this.fileSymbolsFromStudioServer(path) },
    fileSymbolsFromStudioServer(path) {
      return this.fetchJSON(`?op=fileSymbols&path=${path}`)
    },
    async fileSymbolsFromStaticFileServer(path) {
      if (!this.loadedSymbols) {
        this.loadedSymbols = [
          ...await this.fetchJSON(`/dist/symbols/plugins.json`),
          ...await this.fetchJSON(`/dist/symbols/projects.json`),
        ];
      }
      return this.loadedSymbols.filter(e=>e.path.indexOf(path+'/') == 1)
    },
  }
}

async function jbInit(uri, {projects, plugins, loadTests, multipleInFrame, doNoInitLibs,
    useFileSymbolsFromBuild, codeServerUri, codePackages }) {
  const jb = { 
    uri, 
    async loadCode({codePackge, projects, plugins, doNoInitLibs, loadTests}) {
      const pluginsSymbols = await codePackge.fileSymbols('plugins',useFileSymbolsFromBuild)
      const projectsSymbols = await (projects || []).map(x => `projects/${x}`)
        .reduce( async (acc,dir) => [...await acc, ...await codePackge.fileSymbols(dir,useFileSymbolsFromBuild)], [])
      jb.plugins = jb.plugins || {}
      pluginsSymbols.map(entry =>{
        const id = (entry.path.match(/plugins\/([^\/]+)/) || ['',''])[1]
        jb.plugins[id] = jb.plugins[id] || { id, files: [] }
        jb.plugins[id].files.push(entry)
      })
      calcPluginDependencies()
      const topPlugins = [...loadTests ? ['testing'] : [], ...(plugins || Object.keys(jb.plugins))]

      const coreTests = loadTests? jb.plugins.core.files.filter(x=>x.path.match(/tests/)) : []
      const _symbols = [...coreTests, ...topPlugins.flatMap(id => jb.plugins[id].requiredSymbols), ...projectsSymbols]
      const symbols = jb.utils.unique(_symbols,x=>x.path).filter(x=>loadTests || !x.path.match(/tests|tester/))
      await supervisedLoad(symbols,jb,doNoInitLibs)
      if (jb.jbm && codeServerUri) jb.jbm.codeServerUri = codeServerUri
      return jb        

      function calcPluginDependencies() {
        Object.keys(jb.plugins).map(id=>calcDependency(id))

        function calcDependency(id,history={}) {
          const plugin = jb.plugins[id]
          if (history[id]) return []
          plugin.dependent = jb.utils.unique(plugin.files.flatMap(e=> 
            jb.utils.unique(e.using.flatMap(dep=>calcDependency(dep,{...history, id})))
          ))
          const ret = [id, ...plugin.dependent]
          plugin.requiredSymbols = jb.utils.unique(ret.flatMap(_id=>jb.plugins[_id].files), x=>x.path)
          return ret
        }
      }
      async function supervisedLoad(symbols) {
        const ns = jb.utils.unique([...symbols.flatMap(x=>x.ns || []),'Var','remark','typeCast'])
        const libs = jb.utils.unique(symbols.flatMap(x=>x.libs))
        ns.forEach(id=> jb.macro.registerProxy(id))
        await Promise.all(symbols.map(fileSymbols=> jb.loadjbFile(fileSymbols.path,jb,{fileSymbols,codePackge})))
        !doNoInitLibs && await jb.initializeLibs(libs,codePackge)
        jb.utils.resolveLoadedProfiles()
      }      
    },
    async loadjbFile(url,jb,{noSymbols, fileSymbols, codePackage} = {}) {
      jb.loadedFiles = jb.loadedFiles || {}
      if (jb.loadedFiles[url]) return
      const package = codePackage || jbHost.defaultCodePackage
  
      const _code = await package.fetchFile(url)
      const code = `${_code}\n//# sourceURL=${url}?${jb.uri}`
      const context = { jb, 
        require: typeof require != 'undefined' && require,
        ...(jb.macro && !noSymbols ? jb.macro.proxies : {}),
        component: (...args) => jb.component(...args,fileSymbols && fileSymbols.dsl)
      }
      try {
        new Function(Object.keys(context), code).apply(null, Object.values(context))
        jb.loadedFiles[url] = true
      } catch (e) {
        return jb.logException(e,`loadjbFile lib ${url}`,{context, code})
      }
    }
  }
  if (!multipleInFrame) globalThis.jb = jb // multipleInFrame is used in jbm.child

  const coreFiles= ['jb-core','core-utils','jb-expression','db','jb-macro','spy'].map(x=>`/plugins/core/${x}.js`)
  await coreFiles.reduce((pr,url) => pr.then(()=> jb.loadjbFile(url,jb)), Promise.resolve())
  jb.noSupervisedLoad = false
  return jb.loadCode({codePackge: jbHost.defaultCodePackage, projects, plugins, doNoInitLibs, loadTests})
}

// async function jbInit1(uri, {projects, plugins, baseUrl, multipleInFrame, doNoInitLibs, useFileSymbolsFromBuild, loadTests }) {
//   const fileSymbols = useFileSymbolsFromBuild && fileSymbolsFromBuild || globalThis.jbFileSymbols || fileSymbolsFromHttp
//   const jb = { uri, baseUrl: baseUrl !== undefined ? baseUrl : typeof globalThis.jbBaseUrl != 'undefined' ? globalThis.jbBaseUrl : '' }
//   if (!multipleInFrame) // multipleInFrame is used in jbm.child
//     globalThis.jb = jb
//   const coreFiles= ['jb-core','core-utils','jb-expression','db','jb-macro','spy'].map(x=>`/plugins/core/${x}.js`)
//   await coreFiles.reduce((pr,url) => pr.then(()=> jbloadJSFile(url,jb)), Promise.resolve())
//   jb.noSupervisedLoad = false

//   const _plugins = loadTests ? ['testing', ...plugins] : plugins
//   const topRequiredModules = [...(_plugins || []).map(x => `plugins/${x}`), ...(projects || []).map(x => `projects/${x}`) ]

//   const coreTests = loadTests? (await fileSymbols('plugins/core')).filter(x=>x.path.match(/tests/)) : [] // do not load core files again!
//   const _symbols = [...coreTests, ...await topRequiredModules.reduce( async (acc,dir) => [...await acc, ...await fileSymbols(dir,'','pack-')], [])]
//   const symbols = jb.utils.unique(_symbols,x=>x.path).filter(x=>loadTests || !x.path.match(/tests|tester/))

//   await jbSupervisedLoad(symbols,jb,doNoInitLibs)

//   return jb

//   async function fileSymbolsFromHttp(path,include,exclude) {
//     const inc = include ? `&include=${include}` : ''
//     const exc = exclude ? `&exclude=${exclude}` : ''
//     return fetch(`${jb.baseUrl}?op=fileSymbols&path=${path}${inc}${exc}`).then(x=>x.json())
//   }
// }

// async function jbloadJSFile1(url,jb,{noSymbols, fileSymbols} = {}) {
//   globalThis.jbFetchFile = globalThis.jbFetchFile || (path => globalThis.fetch(path).then(x=>x.text()))
//   const fullUrl = jb.baseUrl.match(/\/$/) ? jb.baseUrl+url.replace(/^\//,'') : jb.baseUrl+url
//   const _code = await jbFetchFile(fullUrl)
//   const code = `${_code}\n//# sourceURL=${url}?${jb.uri}`
//   const context = { jb, 
//     require: typeof require != 'undefined' && require,
//     ...(jb.macro && !noSymbols ? jb.macro.proxies : {}),
//     component: (...args) => jb.component(...args,fileSymbols && fileSymbols.dsl)
//   }
//   try {
//     new Function(Object.keys(context), code).apply(null, Object.values(context))
//   } catch (e) {
//     return jb.logException(e,`jbloadJSFile lib ${url}`,{context, code})
//   }
// }

// async function jbSupervisedLoad(symbols, jb, doNoInitLibs) {
//   const ns = jb.utils.unique([...symbols.flatMap(x=>x.ns || []),'Var','remark','typeCast'])
//   const libs = jb.utils.unique(symbols.flatMap(x=>x.libs))
//   ns.forEach(id=> jb.macro.registerProxy(id))
//   await Promise.all(symbols.map(fileSymbols=> jbloadJSFile(fileSymbols.path,jb,{fileSymbols})))
//   //await symbols.reduce((pr,fileSymbols) => pr.then(()=> jbloadJSFile(fileSymbols.path,jb,{fileSymbols})), Promise.resolve())
//   !doNoInitLibs && await jb.initializeLibs(libs)
//   jb.utils.resolveLoadedProfiles()
// }

// var jbLoadedSymbols = null
// async function fileSymbolsFromBuild(path,_include,_exclude) {
//   globalThis.jbFetchJson = globalThis.jbFetchJson || (path => globalThis.fetch(path, {mode: 'cors'}).then(x=>x.json()))
//   const include = _include && new RegExp(_include), exclude = _exclude && new RegExp(_exclude)

//   if (!jbLoadedSymbols) {
//     jbLoadedSymbols = [
//       ...await globalThis.jbFetchJson(`${jb.baseUrl}/dist/symbols/src.json`),
//       ...await globalThis.jbFetchJson(`${jb.baseUrl}/dist/symbols/plugins.json`),
//       ...await globalThis.jbFetchJson(`${jb.baseUrl}/dist/symbols/projects.json`),
//     ];
//   }
//   return jbLoadedSymbols.filter(e=>e.path.indexOf(path+'/') == 1 && !(include && !include.test(e.path) || exclude && exclude.test(e.path)))
// }

if (typeof module != 'undefined') module.exports = { jbInit, jb_plugins }
//globalThis.jbloadJSFile = jbloadJSFile
