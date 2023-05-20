const jb_plugins = null

function jbBrowserCodePackage(baseUrl = '', fetchOptions= {}, useFileSymbolsFromBuild) {
  return {
    _fetch(path) { return fetch((baseUrl || jbHost.baseUrl) + path, fetchOptions) },
    fetchFile(path) { return this._fetch(path).then(x=>x.text()) },
    fetchJSON(path) { return this._fetch(path).then(x=>x.json()) },
    fileSymbols(path) { return useFileSymbolsFromBuild ? this.fileSymbolsFromStaticFileServer(path) 
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

globalThis.jbHost = globalThis.jbHost || { // browserHost - studioServer,worker and static
  fetch: (...args) => globalThis.fetch(...args),
  baseUrl: '',
  fetchOptions: {}, // {mode: 'cores'}
  log(...args) { console.log (...args) },
  WebSocket_Browser: globalThis.WebSocket,
  codePackageFromJson(package) {
    if (package == null || package.$ == 'defaultPackage') return jbBrowserCodePackage('',{})
    if (package.$ == 'jbStudioServer')
        return jbBrowserCodePackage(package.baseUrl)
    if (package.$ == 'staticViaHttp')
        return jbBrowserCodePackage(package.baseUrl,{mode: 'cores'}, true)
  }
}

async function jbInit(uri, _sourceCode , {multipleInFrame, doNoInitLibs}={}) {
  const sourceCode = Array.isArray(_sourceCode) ? _sourceCode : [_sourceCode]
  const jb = { 
    uri,
    loadedFiles: {},
    async loadPluginSymbols(codePackage,project) {
      const jb = this
      const pluginsSymbols = await codePackage.fileSymbols('plugins')
      const projectSymbols = project ? await codePackage.fileSymbols(`projects/${project}`) : []
      jb.plugins = jb.plugins || {}
      ;[...pluginsSymbols,...projectSymbols].map(entry =>{
        const tests = entry.path.match(/-(tests|testers).js$/) || entry.path.match(/\/tests\//) ? '-tests': ''
        const id = (entry.path.match(/^.(plugins|projects)\/([^\/]+)/) || ['','',''])[2] + tests
        jb.plugins[id] = jb.plugins[id] || { id, codePackage, files: [] }
        jb.plugins[id].files.push(entry)
      })
    },
    async loadProject(project,codePackage = jbHost.codePackageFromJson(), doNoInitLibs) {
      const jb = this
      const projectSymbols = project ? await codePackage.fileSymbols(`projects/${project}`) : []
      jb.plugins = jb.plugins || {}
      projectSymbols.map(entry =>{
        const tests = entry.path.match(/-(tests|testers).js$/) || entry.path.match(/\/tests\//) ? '-tests': ''
        const id = (entry.path.match(/^.(plugins|projects)\/([^\/]+)/) || ['','',''])[2] + tests
        jb.plugins[id] = jb.plugins[id] || { id, codePackage, files: [] }
        jb.plugins[id].files.push(entry)
      })
      calcPluginDependencies(jb.plugins)
      const libs = await jb.loadPlugins([project])
      !doNoInitLibs && await jb.initializeLibs(unique(libs))
      jb.utils.resolveLoadedProfiles()
    },
    async loadPlugins(plugins) {
      const jb = this
      let libs = []
      await plugins.reduce( (pr,id) => pr.then( async ()=> {
        const plugin = jb.plugins[id]
        if (!plugin || plugin.loadingReq) return
        plugin.loadingReq = true
        const _libs = await jb.loadPlugins(plugin.dependent)
        await Promise.all(plugin.files.map(fileSymbols =>{
          libs = unique([...libs,..._libs,...fileSymbols.libs])
          return jb.loadjbFile(fileSymbols.path,jb,{fileSymbols,plugin})
        }))
      }), Promise.resolve() )
      return libs
    },
    async loadjbFile(path,jb,{noSymbols, fileSymbols, plugin} = {}) {
      if (jb.loadedFiles[path]) return
      const _code = await plugin.codePackage.fetchFile(path)
      const code = `${_code}\n//# sourceURL=${path}?${jb.uri}`
      const dsl = fileSymbols && fileSymbols.dsl || plugin && plugin.dsl
      const proxies = noSymbols ? {} : jb.objFromEntries(unique(plugin.requiredFiles.flatMap(x=>x.ns)).map(id=>[id,jb.macro.registerProxy(id)]))
      const context = { jb, 
        ...(typeof require != 'undefined' ? {require} : {}),
        ...proxies,
        component:(...args) => jb.component(plugin,dsl,...args),
        extension:(...args) => jb.extension(plugin,...args),
        using: x=>jb.using(x), dsl: x=>jb.dsl(x), pluginDsl: x=>jb.pluginDsl(x)
      }
      try {
        //console.log(`loading ${path}`)
        new Function(Object.keys(context), code).apply(null, Object.values(context))
        jb.loadedFiles[path] = true
      } catch (e) {
        return jb.logException(e,`loadjbFile lib ${path}`,{context, code})
      }
    }
  }
  if (!multipleInFrame) globalThis.jb = jb // multipleInFrame is used in jbm.child

  await sourceCode.reduce( async (pr,{codePackage, project})=> pr.then(() =>
    jb.loadPluginSymbols(jbHost.codePackageFromJson(codePackage),project)), Promise.resolve());
  calcPluginDependencies(jb.plugins,jb)
  await ['jb-core','core-utils','jb-expression','db','jb-macro','spy'].map(x=>`/plugins/core/${x}.js`).reduce((pr,path) => 
    pr.then(()=> jb.loadjbFile(path,jb,{noSymbols: true, plugin: jb.plugins.core})), Promise.resolve())
  jb.noSupervisedLoad = false
  const codeServerUri = sourceCode.reduce((acc,{codeServerUri}) => acc || codeServerUri, '')
  const loadTests = sourceCode.reduce((acc,{loadTests}) => acc || loadTests, false)
  if (jb.jbm && codeServerUri) jb.jbm.codeServerUri = codeServerUri

  const topPlugins = sourceCode.reduce((acc,{plugins,project}) => {
      const _plugins = (!project && !plugins) || (plugins||[])[0] == '*' ? Object.keys(jb.plugins) : (plugins||[])
      return [...acc,..._plugins,project]}
      , [])
    .filter(x=>x).flatMap(x=>loadTests ? [x,`${x}-tests`] : [x])

  const libs = await jb.loadPlugins(topPlugins)
  !doNoInitLibs && await jb.initializeLibs(unique(libs))
  jb.utils.resolveLoadedProfiles()
  return jb

  function unique(ar,f = (x=>x) ) {
    const keys = {}, res = []
    ar.forEach(e=>{ if (!keys[f(e)]) { keys[f(e)] = true; res.push(e) } })
    return res
  }
  function calcPluginDependencies(plugins) {
    Object.keys(plugins).map(id=>calcDependency(id))
    Object.values(plugins).map(plugin=>{
      const pluginDsls = unique(plugin.files.map(e=>e.pluginDsl).filter(x=>x))
      if (pluginDsls.length > 1)
        jb.logError(`plugin ${plugin.id} has more than one dsl`,{pluginDsls})
      plugin.dsl = pluginDsls[0]
    })

    function calcDependency(id,history={}) {
      const plugin = plugins[id]
      if (!plugin)
        jb.logError('calcDependency: can not find plugin',{id, history})
      if (!plugin || history[id]) return []
      if (plugin.dependent) return [id, ...plugin.dependent]
      const baseOfTest = id.match(/-tests$/) ? [id.slice(0,-6),'testing'] : []
      plugin.dependent = unique([
        ...plugin.files.flatMap(e=> unique(e.using.flatMap(dep=>calcDependency(dep,{...history, [id]: true})))),
        ...baseOfTest.flatMap(dep=>calcDependency(dep,{...history, [id]: true}))]
      )
      const ret = [id, ...plugin.dependent]
      plugin.requiredFiles = unique(ret.flatMap(_id=>plugins[_id].files), x=>x.path)
      return ret
    }
  }
}

if (typeof module != 'undefined') module.exports = { jbInit, jb_plugins };
