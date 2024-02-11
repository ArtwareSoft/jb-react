dsl('loader')

extension('loader','main' , {
    shortFilePath(filePath) {
        const elems = filePath.split('/').reverse()
    return '/' + elems.slice(0,elems.findIndex(x=> x == 'plugins' || x == 'projects')+1).reverse().join('/')
    },
    unifyPluginsToLoad(pluginsToLoad) {
        return jb.asArray(pluginsToLoad).reduce((acc,item) => {
            const plugins = [...(acc.plugins || []), ...(item.plugins || [])]
            return {...acc, ...item, plugins}
        } , {})
    }
})

// source-code

component('sourceCode', {
  type: 'source-code',
  params: [
    {id: 'pluginsToLoad', type: 'plugins-to-load[]', flattenArray: true},
    {id: 'pluginPackages', type: 'plugin-package[]', flattenArray: true, defaultValue: defaultPackage()},
    {id: 'libsToInit', as: 'string', description: 'empty means load all libraries'},
    {id: 'actualCode', as: 'string', description: 'alternative to plugins'}
  ],
  impl: (ctx,pluginsToLoad,pluginPackages,libsToInit,actualCode) => ({ 
    ...(pluginPackages.filter(x=>x).length ? { pluginPackages : pluginPackages.filter(x=>x)} : {}),
    plugins:[], 
    ...jb.loader.unifyPluginsToLoad(pluginsToLoad),
    ...(libsToInit ? {libsToInit} : {}),
    ...(actualCode ? {actualCode} : {}),
  })
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
    {id: 'addTests', as: 'boolean', description: 'add plugin-tests', type: 'boolean'}
  ],
  impl: (ctx,filePath,addTests) => {
    const path = jb.loader.shortFilePath(filePath)
    const tests = path.match(/-(tests|testers).js$/) || path.match(/\/tests\//) ? '-tests': ''
    const plugins = [...calcPlugins(path.match(/plugins\/([^\/]+)/)), ...calcPlugins(path.match(/projects\/([^\/]+)/))]
    const project = jb.path(path.match(/projects\/([^\/]+)/),'1')
    return { plugins, ...(project ? {project} : {}) }

    function calcPlugins(matchResult) {
      if (!matchResult) return []
      const res = matchResult[1] + tests
      return (!tests && addTests) ? [res, `${res}-tests`] : [res]
    }
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
    {id: 'project', as: 'array', mandatory: true}
  ],
  impl: ctx => ctx.params
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
  impl: ctx => repo && ({ $: 'jbStudioServer', ...ctx.params })
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

