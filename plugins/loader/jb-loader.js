const jb_plugins = null

function jbBrowserCodePackage(repo = '', fetchOptions= {}, useFileSymbolsFromBuild) {
  return {
    repo: repo.split('/')[0],
    _fetch(path) { return fetch(jbHost.baseUrl + path, fetchOptions) },
    fetchFile(path) { return this._fetch(path).then(x=>x.text()) },
    fetchJSON(path) { return this._fetch(path).then(x=>x.json()) },
    fileSymbols(path) { return useFileSymbolsFromBuild ? this.fileSymbolsFromStaticFileServer(path) 
      : this.fileSymbolsFromStudioServer(path) },
    fileSymbolsFromStudioServer(path) {
      return this.fetchJSON(`?op=fileSymbols&path=${repo}${path}`)
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
  fetchOptions: {},
  log(...args) { console.log (...args) },
  WebSocket_Browser: globalThis.WebSocket,
  codePackageFromJson(package) {
    if (package == null || package.$ == 'defaultPackage') return jbBrowserCodePackage('',{})
    if (package.$ == 'jbStudioServer' || package.$ == 'fileSystem')
        return jbBrowserCodePackage(`${package.repo}/`)
    if (package.$ == 'staticViaHttp')
        return jbBrowserCodePackage(`${package.repo}/`,{mode: 'cores'}, true)
  }
}

async function jbInit(uri, sourceCode , {multipleInFrame, initSpyByUrl} ={}) {
  const jb = { 
    uri,
    sourceCode,
    loadedFiles: {},
    plugins: {},
    createPlugins(plugins) {
      jbHost.defaultCodePackage = jbHost.defaultCodePackage || jbHost.codePackageFromJson()
      plugins.forEach(plugin=> {
        this.plugins[plugin.id] = this.plugins[plugin.id] || { ...plugin, codePackage : jbHost.defaultCodePackage }
      })
    },
    async loadPluginSymbols(codePackage,{loadProjects} = {}) {
      const jb = this
      const pluginsSymbols = await codePackage.fileSymbols('plugins')
      const projectSymbols = loadProjects ? await codePackage.fileSymbols('projects') : []
      ;[...pluginsSymbols,...projectSymbols.map(x=>({...x, isProject: true}))].map(entry =>{
        const id = pathToPluginId(entry.path)
        jb.plugins[id] = jb.plugins[id] || { id, codePackage, files: [], isProject: entry.isProject }
        jb.plugins[id].files.push(entry)
      })
    },
    async loadPlugins(plugins) {
      const jb = this
      await plugins.reduce( (pr,id) => pr.then( async ()=> {
        const plugin = jb.plugins[id]
        if (!plugin || plugin.loadingReq) return
        plugin.loadingReq = true
        await jb.loadPlugins(plugin.dependent)
        await Promise.all(plugin.files.map(fileSymbols =>jb.loadjbFile(fileSymbols.path,jb,{fileSymbols,plugin})))
      }), Promise.resolve() )
    },
    async loadjbFile(path,jb,{noSymbols, fileSymbols, plugin} = {}) {
      if (jb.loadedFiles[path]) return
      const _code = await plugin.codePackage.fetchFile(path)
      const sourceUrl = `${path}?${jb.uri}`.replace(/#/g,'')
      const code = `${_code}\n//# sourceURL=${sourceUrl}`
      const fileDsl = fileSymbols && fileSymbols.dsl
      const proxies = noSymbols ? {} : jb.objFromEntries(plugin.proxies.map(id=>jb.macro.registerProxy(id)) )
      const context = { jb, 
        ...(typeof require != 'undefined' ? {require} : {}),
        ...proxies,
        component:(...args) => jb.component(...args,{plugin,fileDsl}),
        extension:(...args) => jb.extension(plugin,...args),
        using: x=>jb.using(x), dsl: x=>jb.dsl(x), pluginDsl: x=>jb.pluginDsl(x)
      }
      try {
        //console.log(`loading ${path}`)
        const f = eval(`(function(${Object.keys(context)}) {${code}\n})`)
        f(...Object.values(context))
        jb.loadedFiles[path] = true
      } catch (e) {
        if (!handleUnknownComp((e.message.match(/^(.*) is not defined$/)||['',''])[1]))
          return jb.logException(e,`loadjbFile lib ${path}`,{context, code})
      }

    function handleUnknownComp(unknownCmp) {
      if (!unknownCmp) return
      try {
        const fixed = code.replace(new RegExp(`${unknownCmp}\\(`,'g'),`unknownCmp('${unknownCmp}',`)
        const f = eval(`(function(${Object.keys(context)}) {${fixed}\n})`)
        f(...Object.values(context))
        jb.loadedFiles[path] = true
        jb.logError(`loader unknown comp ${unknownCmp} in file ${sourceUrl}`,{})
        return true
      } catch(e) {}
    }
    }
  }
  if (!multipleInFrame) globalThis.jb = jb // multipleInFrame is used in jbm.child
  if (sourceCode.actualCode) {
    const f = eval(`(async function (jb) {${sourceCode.actualCode}\n})//# sourceURL=treeShakeClient?${jb.uri}`)
    await f(jb)
    return jb
  }

  const pluginPackages = Array.isArray(sourceCode.pluginPackages) ? sourceCode.pluginPackages : [sourceCode.pluginPackages]
  await pluginPackages.reduce( async (pr,codePackage)=> pr.then(() =>
    jb.loadPluginSymbols(jbHost.codePackageFromJson(codePackage),{loadProjects: sourceCode.projects && sourceCode.projects.length})), Promise.resolve());
  calcPluginDependencies(jb.plugins,jb)
  await ['jb-core','core-utils','jb-expression','db','jb-macro','spy'].map(x=>`/plugins/core/${x}.js`).reduce((pr,path) => 
    pr.then(()=> jb.loadjbFile(path,jb,{noSymbols: true, plugin: jb.plugins.core})), Promise.resolve())
  if (initSpyByUrl)
    jb.spy.initSpyByUrl()
  jb.noSupervisedLoad = false
  if (jb.jbm && treeShakeServerUri) jb.jbm.treeShakeServerUri = sourceCode.treeShakeServerUri
  const topPlugins = unique([
    ...((sourceCode.projects||[]).indexOf('*') != -1 ? Object.values(jb.plugins).filter(x=>x.isProject).map(x=>x.id).filter(x=>x!='*') : (sourceCode.projects || [])),
    ...((sourceCode.plugins||[]).indexOf('*') != -1 ? Object.values(jb.plugins).filter(x=>!x.isProject).map(x=>x.id).filter(x=>x!='*') : (sourceCode.plugins || [])) 
    ]).filter(x=>jb.plugins[x])

  await jb.loadPlugins(topPlugins)
  const libs = unique(topPlugins.flatMap(id=>jb.plugins[id].requiredLibs))

  const libsToInit = sourceCode.libsToInit ? sourceCode.libsToInit.split(','): libs
  await jb.initializeLibs(libsToInit)
  jb.utils.resolveLoadedProfiles()

  return jb

  function unique(ar,f = (x=>x) ) {
    const keys = {}, res = []
    ar.forEach(e=>{ if (!keys[f(e)]) { keys[f(e)] = true; res.push(e) } })
    return res
  }
  function pathToPluginId(path) {
    const tests = path.match(/-(tests|testers).js$/) || path.match(/\/tests\//) ? '-tests': ''
    return (path.match(/(plugins|projects)\/([^\/]+)/) || ['','',''])[2] + tests
  }
  function calcPluginDependencies(plugins) {
    Object.keys(plugins).map(id=>calcDependency(id))
    Object.values(plugins).map(plugin=>{
      const pluginDsls = unique(plugin.files.map(e=>e.pluginDsl).filter(x=>x))
      if (pluginDsls.length > 1)
        jb.logError(`plugin ${plugin.id} has more than one dsl`,{pluginDsls})
      plugin.dsl = pluginDsls[0]
    })
    // the virtual xx-tests plugin must have the same dsl as the plugin
    Object.values(plugins).filter(plugin=>plugin.id.match(/-tests$/)).forEach(plugin=>
      plugin.dsl = (jb.plugins[plugin.id.slice(0,-6)] || {}).dsl)

    function calcDependency(id,history={}) {
      const plugin = plugins[id]
      if (!plugin) {
        console.log('calcDependency: can not find plugin',{id, history})
        return []
      }
      if (plugin.dependent) return [id, ...plugin.dependent]
      if (history[id])
        return [`$circular:${id}`]
      const baseOfTest = id.match(/-tests$/) ? [id.slice(0,-6),'testing'] : []
      plugin.using = unique(plugin.files.flatMap(e=> unique(e.using)))
      const dslOfFiles = plugin.files.filter(fileSymbols=>fileSymbols.dsl && fileSymbols.dsl != plugin.dsl).map(({path,dsl}) => [path,dsl])
      if (dslOfFiles.length)
        plugin.dslOfFiles = dslOfFiles

      const dependent = unique([
        ...plugin.files.flatMap(e=> unique(e.using.flatMap(dep=>calcDependency(dep,{...history, [id]: true})))),
        ...baseOfTest.flatMap(dep=>calcDependency(dep,{...history, [id]: true}))]
      ).filter(x=>x !=`$circular:${id}`)

      plugin.circular = dependent.find(x=>x.match(/^\$circular:/))
      const ret = [id, ...dependent]
      if(!plugin.circular) {
        plugin.dependent = dependent
        plugin.requiredFiles = unique(ret.flatMap(_id=>plugins[_id].files), x=>x.path)
        plugin.requiredLibs = unique(ret.flatMap(_id=>plugins[_id].files).flatMap(x=>x.libs || []))
        plugin.proxies = unique(plugin.requiredFiles.flatMap(x=>x.ns))
      }

      return ret
    }
  }
}

if (typeof module != 'undefined') module.exports = { jbInit, jb_plugins };
