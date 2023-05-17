jb.extension('jbm','source' , {
    calcInitOptions(sourceCodeOptions) {
        return jb.asArray(sourceCodeOptions).reduce((acc,option) => {
            if (option.plugIns) 
                acc.plugIns = [...(acc.plugIns || []), ...option.plugIns]
            else if (option.project) 
                acc.projects = [...(acc.projects || []), option.project]
            else if (option.package) 
                acc.codePackages = [...(acc.codePackages || []), option.package]
            else 
                Object.assign(acc,option)
            return acc
        } , {})
    }
})

component('loadTests', {
  type: 'source-code-option',
  impl: ctx => ({loadTests: true})
})

component('plugIns', {
  type: 'source-code-option',
  params: [
    {id: 'plugIns', as: 'array', mandatory: true}
  ],
  impl: ctx => ctx.params
})

component('project', {
  type: 'source-code-option',
  params: [
    {id: 'project', as: 'string', mandatory: true}
  ],
  impl: ctx => ctx.params
})

component('package', {
  type: 'source-code-option',
  params: [
    {id: 'package', type: 'package', mandatory: true},
    {id: 'plugIns', as: 'array', mandatory: true},
    {id: 'projects', as: 'array'}
  ],
  impl: ctx => ({ package : ctx.params })
})

component('treeShakeClient', {
  type: 'source-code-option',
  params: [
    {id: 'jbm', type: 'jbm', defaultValue: jbm.self() },
  ],
  impl: (ctx,jbm) => [{ codeServerUri : jbm.uri}, {plugins: ['tree-shake']}]
})

component('localPluginProvider', {
  type: 'source-code-option',
  params: [
    {id: 'packages', type: 'package[]', as: 'array', defaultValue: defaultPackage() },
  ],
  impl: ctx => ({ localPluginProvider : ctx.params })
})

component('remotePluginProvider', {
  type: 'source-code-option',
  params: [
    {id: 'jbm', type: 'jbm', mandatory: true },
    {id: 'packages', type: 'package[]', as: 'array', defaultValue: defaultPackage() },
  ],
  impl: (ctx,jbm,packages) => ({ remotePluginProvider : {packages, uri:jbm.uri} })
})

// source packages

component('defaultPackage', {
  type: 'package',
  impl: () => ({ defaultPackage : true })
})

component('staticViaHttp', {
  type: 'package',
  params: [
    {id: 'url', as: 'string', mandatory: true },
  ],
  impl: ctx => ({ staticViaHttp : ctx.params })
})

component('jbStudioServer', {
  type: 'package',
  params: [
    {id: 'url', as: 'string', defaultValue: 'http://localhost:8080' },
  ],
  impl: ctx => ({ jbStudioServer : ctx.params })
})

component('fileSystem', {
  type: 'package',
  params: [
    {id: 'baseDir', as: 'string' },
  ],
  impl: ctx => ({ fileSystem : ctx.params })
})

component('zipFile', {
  type: 'package',
  params: [
    {id: 'path', as: 'string' },
  ],
  impl: ctx => ({ zipFile : ctx.params })
})
