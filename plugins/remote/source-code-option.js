extension('jbm','source' , {
    calcCodeInPackage(codeInPackage) {
        return jb.asArray(codeInPackage).reduce((acc,option) => {
            if (option.plugIns) 
                acc.plugIns = [...(acc.plugIns || []), ...option.plugIns]
            else 
                Object.assign(acc,option)
            return acc
        } , {})
    }
})

// source-code
component('codePackage', {
  type: 'source-code',
  params: [
    {id: 'codePackage', type: 'code-package', mandatory: true},
    {id: 'codeInPackage', type: 'code-in-package[]', flattenArray: true},
  ],
  impl: (ctx,codePackage,codeInPackage) => ({ codePackage, ...jb.jbm.calcCodeInPackage(codeInPackage) })
})

component('treeShakeClient', {
  type: 'source-code',
  impl: codePackage(defaultPackage(),treeShakeClient())
})

component('project', {
  type: 'source-code',
  params: [
    {id: 'project', as: 'string', mandatory: true}
  ],
  impl: codePackage(defaultPackage(),project('%$project%'))
})

component('byPath', {
  description: 'decides about the needed code from a single source code path',
  type: 'source-code',
  params: [
    {id: 'path', as: 'string', mandatory: true},
    {id: 'loadTests', as: 'boolean', defaultValue: true},
  ],
  impl: (ctx,path,loadTests) => {
    const rep = (path.match(/projects\/([^\/]*)/) || ['',''])[1]
    const baseDir = rep && (path.slice(0,path.indexOf(`/${rep}/`)+1) + rep)
    const plugin = (path.match(/plugins\/([^\/]*)/) || ['',''])[1]
    const project = (path.match(/projects\/[^\/]+\/projects\/([^\/]+)/) || ['',''])[1]
    const codeInPackage = [
      ...(loadTests ? [{loadTests: true}] : []),
      ...(plugin ? [{plugIns: [plugin]}] : []),
      ...(project ? [{project}] : []),  
    ]
    if (rep == 'jbReact')
      return {codePackage: {$: 'defaultPackage'}, codeInPackage}
    
    return [
      {codePackage: {$: 'defaultPackage'}, codeInPackage: [] },
      {codePackage: {$: 'fileSystem', baseDir }, codeInPackage },
    ]
  }
})

// code in package
component('loadTests', {
  type: 'code-in-package',
  impl: ctx => ({loadTests: true})
})

component('plugIns', {
  type: 'code-in-package',
  params: [
    {id: 'plugIns', as: 'array', mandatory: true}
  ],
  impl: ctx => ctx.params
})

component('project', {
  type: 'code-in-package',
  params: [
    {id: 'project', as: 'string', mandatory: true}
  ],
  impl: ctx => ctx.params
})

component('treeShakeClient', {
  type: 'code-in-package',
  params: [
    {id: 'jbm', type: 'jbm', defaultValue: jbm.self() },
  ],
  impl: (ctx,jbm) => [{ codeServerUri : jbm.uri}, {plugins: ['tree-shake']}]
})

component('localPluginProvider', {
  type: 'code-in-package',
  params: [
    {id: 'codePackage', type: 'code-package[]', defaultValue: defaultPackage() },
  ],
  impl: ctx => ({ localPluginProvider : ctx.params })
})

component('remotePluginProvider', {
  type: 'code-in-package',
  params: [
    {id: 'jbm', type: 'jbm', mandatory: true },
    {id: 'codePackage', type: 'code-package', defaultValue: defaultPackage() },
  ],
  impl: (ctx,jbm,packages) => ({ remotePluginProvider : {codePackages, uri:jbm.uri} })
})

// code packages

component('defaultPackage', {
  type: 'code-package',
  impl: () => ({ $: 'defaultPackage' })
})

component('staticViaHttp', {
  type: 'code-package',
  params: [
    {id: 'baseUrl', as: 'string', mandatory: true },
  ],
  impl: ctx => ({ $: 'staticViaHttp', ...ctx.params, useFileSymbolsFromBuild: true })
})

component('jbStudioServer', {
  type: 'code-package',
  params: [
    {id: 'baseUrl', as: 'string', defaultValue: 'http://localhost:8080' },
  ],
  impl: ctx => ({ $: 'jbStudioServer', ...ctx.params })
})

component('fileSystem', {
  type: 'code-package',
  params: [
    {id: 'baseDir', as: 'string' },
  ],
  impl: ctx => ({ $: 'fileSystem', ...ctx.params })
})

component('zipFile', {
  type: 'code-package',
  params: [
    {id: 'path', as: 'string' },
  ],
  impl: ctx => ({ $: 'zipFile',  ...ctx.params })
})
