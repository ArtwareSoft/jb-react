dsl('loader')

extension('loader','main' , {
    shortFilePath(fullFilePath) {
        const elems = fullFilePath.split('/').reverse()
        return '/' + elems.slice(0,elems.findIndex(x=> x == 'plugins' || x == 'projects')+1).reverse().join('/')
    },
    unifyPluginsToLoad(pluginsToLoad, plugins) {
        return jb.asArray(pluginsToLoad).reduce((acc,item) => {
            const plugins = jb.utils.unique([...(acc.plugins || []), ...(item.plugins || [])])
            return {...acc, ...item, plugins}
        } , { plugins })
    },
    pluginOfFilePath(fullFilePath, addTests) {
      return jb.pathToPluginId(jb.loader.shortFilePath(fullFilePath),addTests)
    },
    pluginsByCtx(ctx) {
      return ctx.probe ? ['probe-core','tgp-formatter'] : []
    },
    mergeSourceCodes(sc1,sc2) {
      if (!sc1) return sc2
      if (!sc2) return sc1
      const plugins = jb.utils.unique([...(sc1.plugins || []), ...(sc2.plugins || [])])
      const projects = jb.utils.unique([...(sc1.projects || []), ...(sc2.projects || [])])
      const pluginPackages = jb.utils.unique([...(sc1.pluginPackages || []), ...(sc2.pluginPackages || [])], package => package.repo || 'default')
      return {plugins, projects, pluginPackages}
    },
    pluginsOfProfile(prof, comps = jb.comps) {
        if (!prof || typeof prof != 'object') return []
        if (!prof.$$)
            return jb.utils.unique(Object.values(prof).flatMap(x=>jb.loader.pluginsOfProfile(x)))
        const comp = comps[prof.$$]
        if (!comp) {
            debugger
            jb.logError(`cmd - can not find comp ${prof.$$} please provide sourceCode`,{ctx})
            return []
        }
        return jb.utils.unique([comp.$plugin,...Object.values(prof).flatMap(x=>jb.loader.pluginsOfProfile(x))]).filter(x=>x)
    }    
})

// source-code
component('sourceCode', {
  type: 'source-code',
  params: [
    {id: 'pluginsToLoad', type: 'plugins-to-load[]'},
    {id: 'pluginPackages', type: 'plugin-package[]'}, // , defaultValue: defaultPackage()
    {id: 'libsToInit', as: 'string', description: 'empty means load all libraries'},
    {id: 'actualCode', as: 'string', description: 'alternative to plugins'}
  ],
  impl: (ctx,pluginsToLoad,pluginPackages,libsToInit,actualCode) => ({ 
    ...(pluginPackages.filter(x=>x).length ? { pluginPackages : pluginPackages.filter(x=>x)} : {}),
    ...jb.loader.unifyPluginsToLoad(pluginsToLoad, jb.loader.pluginsByCtx(ctx)),
    ...(libsToInit ? {libsToInit} : {}),
    ...(actualCode ? {actualCode} : {}),
  })
})

component('sourceCodeByTgpPath', {
  type: 'source-code',
  params: [
    {id: 'tgpPath', as: 'string', mandatory: true},
    {id: 'tgpModel'}
  ],
  impl: sourceCode(
    plugins(({},{},{tgpModel, tgpPath}) => {
    const comps = tgpModel ? tgpModel.comps : jb.comps
    return jb.path(comps[tgpPath.split('~')[0]],'$plugin') || ''
  })
  )
})

component('plugins', {
  type: 'source-code',
  params: [
    {id: 'plugins', mandatory: true}
  ],
  impl: sourceCode(plugins('%$plugins%'))
})

component('extend', {
  type: 'source-code',
  params: [
    {id: 'sourceCode', type: 'source-code', mandatory: true},
    {id: 'with', type: 'source-code', mandatory: true},
  ],
  impl: (ctx,sc1,sc2) => jb.loader.mergeSourceCodes(sc1,sc2)
})

component('project', {
  type: 'source-code',
  params: [
    {id: 'project', as: 'string', mandatory: true}
  ],
  impl: sourceCode(project('%$project%'))
})

component('sameAsParent', {
  type: 'source-code',
  impl: () => jb.sourceCode
})
// plugins-to-load

component('pluginsByPath', {
  type: 'plugins-to-load',
  params: [
    {id: 'filePath', as: 'string', mandatory: true, description: 'E.g. someDir/plugins/mycode.js'},
    {id: 'addTests', as: 'boolean', description: 'add plugin-tests', type: 'boolean', byName: true}
  ],
  impl: (ctx,fullFilePath,addTests) => {
    const filePath = jb.loader.shortFilePath(fullFilePath)
    const plugins = [jb.loader.pluginOfFilePath(fullFilePath,addTests)]
    const project = jb.path(filePath.match(/projects\/([^\/]+)/),'1')
    return { plugins, ...(project ? {projects: [project]} : {}) }
  }
})

component('loadAll', {
  type: 'plugins-to-load',
  impl: ctx => ({ plugins: ['*'] })
})

component('plugins', {
  type: 'plugins-to-load',
  params: [
    {id: 'plugins', mandatory: true}
  ],
  impl: (ctx,plugins) => ({ plugins: Array.isArray(plugins) ? plugins : plugins.split(',') })
})

component('project', {
  type: 'plugins-to-load',
  params: [
    {id: 'project', as: 'string', mandatory: true, description: '* for all'}
  ],
  impl: (ctx,project) => ({projects: [project]})
})


// plugin packages

component('packagesByPath', {
  type: 'plugin-package',
  params: [
    {id: 'path', as: 'string', mandatory: true, description: 'E.g. someDir/plugins/xx-tests.js'},
    {id: 'host', as: 'string', options: ',node,studio,static'}
  ],
  impl: (ctx,path,host) => {
    const repo = (path.match(/projects\/([^/]*)\/(plugins|projects)/) || [])[1]
    if (repo && repo != 'jb-react') {
      const repsBase = path.split('projects/')[0] + 'projects/'
      const package = (!host || host == 'node') ? { $: 'fileSystem', repo, baseDir: repsBase + repo} 
        : host == 'studio' ? { $: 'jbStudioServer', repo }
        : host == 'static' ? { $: 'staticViaHttp', repo } : null
      return [{ $: 'defaultPackage' }, package]
    }
  }
})

component('defaultPackage', {
  type: 'plugin-package',
  impl: () => ({ $: 'defaultPackage' })
})

component('staticViaHttp', {
  type: 'plugin-package',
  params: [
    {id: 'baseUrl', as: 'string', mandatory: true}
  ],
  impl: ctx => ({ $: 'staticViaHttp', ...ctx.params, useFileSymbolsFromBuild: true })
})

component('jbStudioServer', {
  type: 'plugin-package',
  params: [
    {id: 'repo', as: 'string'}
  ],
  impl: (ctx,repo) => repo && ({ $: 'jbStudioServer', ...ctx.params })
})

component('fileSystem', {
  type: 'plugin-package',
  params: [
    {id: 'baseDir', as: 'string'}
  ],
  impl: ctx => ({ $: 'fileSystem', ...ctx.params })
})

component('zipFile', {
  type: 'plugin-package',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: ctx => ({ $: 'zipFile',  ...ctx.params })
})

component('sourceCode.encodeUri', {
  params: [
    {id: 'sourceCode', type: 'source-code<loader>', mandatory: true}
  ],
  impl: (ctx,source) => jb.frame.encodeURIComponent(JSON.stringify(source))
})
