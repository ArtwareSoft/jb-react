extension('jbm','source' , {
    unifyPluginsToLoad(codeInPackage) {
        return jb.asArray(codeInPackage).reduce((acc,option) => {
            if (option.plugins) 
                acc.plugins = [...(acc.plugins || []), ...option.plugins]
            else if (option.project) 
                acc.project = [...(acc.project || []), ...jb.asArray(option.project)]
            else 
                Object.assign(acc,option)
            return acc
        } , {})
    }
})

// source-code
component('sourceCode', {
  type: 'source-code',
  params: [
    {id: 'pluginsToLoad', type: 'plugins-to-load[]', flattenArray: true},
    {id: 'pluginPackages', type: 'plugin-package[]', flattenArray: true, defaultValue: defaultPackage()},
    {id: 'treeShakeServer', type: 'jbm', description: 'if used, tree shake is used to load extra code, use jbm.self for parent'},
    {id: 'libsToInit', as: 'string', description: 'Empty means load all libraries'},
  ],
  impl: (ctx,pluginsToLoad,pluginPackages,treeShakeServer,libsToInit) => ({ 
    ...(pluginPackages.length ? { pluginPackages } : {}),
    plugins:[], ...jb.jbm.unifyPluginsToLoad(pluginsToLoad.flatMap(x=>x)),
    ...(libsToInit ? {libsToInit} : {}),
    treeShakeServerUri: (treeShakeServer || {}).uri 
  })
})

component('treeShakeClient', {
  type: 'source-code',
  impl: sourceCode({pluginsToLoad: plugins('remote,tree-shake'), treeShakeServer : jbm.self()})
})

component('xServer', {
  type: 'source-code',
  impl: sourceCode({pluginsToLoad: plugins('remote,tree-shake,remote-widget'), treeShakeServer : jbm.self()})
})

component('project', {
  type: 'source-code',
  params: [
    {id: 'project', as: 'string', mandatory: true}
  ],
  impl: sourceCode(project('%$project%'))
})

// plugins-to-load

component('pluginsByPath', {
  type: 'plugins-to-load',
  params: [
    {id: 'path', as: 'string', mandatory: true, description: 'E.g. someDir/plugins/mycode.js'},
    {id: 'addTests', as: 'boolean', description: 'add plugin-tests'}
  ],
  impl: (ctx,_path,addTests) => {
    const rep = (_path.match(/projects\/([^/]*)\/(plugins|projects)/) || [])[1]
    const path = (_path.match(/projects(.*)/)||[])[1] || _path
    const tests = path.match(/-(tests|testers).js$/) || path.match(/\/tests\//) ? '-tests': ''

    return [
      ...pluginsOrProject(path.match(/plugins\/([^\/]+)/),'plugins'),
      ...pluginsOrProject(path.match(/projects\/([^\/]+)/),'project')
    ]

    function pluginsOrProject(matchResult,entry) {
      if (!matchResult) return []
      const res = matchResult[1] + tests
      return [{ [entry] : (!tests && addTests) ? [res, `${res}-tests`] : [res] }]
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
    {id: 'path', as: 'string', mandatory: true, description: 'E.g. someDir/plugins/xx-tests.js'}
  ],
  impl: (ctx,path) => {
    const rep = (path.match(/projects\/([^/]*)\/(plugins|projects)/) || [])[1]
    if (rep && rep != 'jb-react') {
      const repsBase = path.split('projects/')[0] + 'projects/'
      return [{ $: 'defaultPackage' }, { $: 'fileSystem', baseDir: repsBase + rep}]
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
    {id: 'baseUrl', as: 'string', mandatory: true },
  ],
  impl: ctx => ({ $: 'staticViaHttp', ...ctx.params, useFileSymbolsFromBuild: true })
})

component('jbStudioServer', {
  type: 'plugin-package',
  params: [
    {id: 'baseUrl', as: 'string', defaultValue: 'http://localhost:8080' },
  ],
  impl: ctx => ({ $: 'jbStudioServer', ...ctx.params })
})

component('fileSystem', {
  type: 'plugin-package',
  params: [
    {id: 'baseDir', as: 'string' },
  ],
  impl: ctx => ({ $: 'fileSystem', ...ctx.params })
})

component('zipFile', {
  type: 'plugin-package',
  params: [
    {id: 'path', as: 'string' },
  ],
  impl: ctx => ({ $: 'zipFile',  ...ctx.params })
})
