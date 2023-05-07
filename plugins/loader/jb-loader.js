var jb_plugins = [
  'common','rx','tree-shake','pretty-print','watchable',
  'remote','testing','data-browser',
  'probe','tgp','watchable-comps', 'workspace','vscode', 
  'chart-model','vega', 'zui','scene3','parsing','statistics','xml','jison'
];

async function jbInit(uri, {projects, plugins, baseUrl, multipleInFrame, doNoInitLibs, useFileSymbolsFromBuild, noTests }) {
  const fileSymbols = useFileSymbolsFromBuild && fileSymbolsFromBuild || globalThis.jbFileSymbols || fileSymbolsFromHttp
  const jb = { uri, baseUrl: baseUrl !== undefined ? baseUrl : typeof globalThis.jbBaseUrl != 'undefined' ? globalThis.jbBaseUrl : '' }
  if (!multipleInFrame) // multipleInFrame is used in jbm.child
    globalThis.jb = jb
  const coreFiles= ['jb-core','core-utils','jb-expression','db','jb-macro','spy'].map(x=>`/plugins/core/${x}.js`)
  await coreFiles.reduce((pr,url) => pr.then(()=> jbloadJSFile(url,jb)), Promise.resolve())
  jb.noSupervisedLoad = false

  const srcSymbols = await fileSymbols('src','','pack-|jb-loader').then(x=>x.filter(x=>coreFiles.indexOf(x.path) == -1))
  const topRequiredModules = [...(plugins || []).map(x => `plugins/${x}`), ...(projects || []).map(x => `projects/${x}`)]

  const nonSrcSymbols = await topRequiredModules.reduce( async (acc,dir) => [...await acc, ...await fileSymbols(dir,'','pack-')], [])
  const symbols = jb.utils.unique([...srcSymbols,...nonSrcSymbols],x=>x.path).filter(x=>!(noTests && x.path.match(/tests/)))

  await jbSupervisedLoad(symbols,jb,doNoInitLibs)

  return jb

  async function fileSymbolsFromHttp(path,include,exclude) {
    const inc = include ? `&include=${include}` : ''
    const exc = exclude ? `&exclude=${exclude}` : ''
    return fetch(`${jb.baseUrl}?op=fileSymbols&path=${path}${inc}${exc}`).then(x=>x.json())
  }
}

async function jbloadJSFile(url,jb,{noSymbols, fileSymbols} = {}) {
  globalThis.jbFetchFile = globalThis.jbFetchFile || (path => globalThis.fetch(path).then(x=>x.text()))
  const fullUrl = jb.baseUrl.match(/\/$/) ? jb.baseUrl+url.replace(/^\//,'') : jb.baseUrl+url
  const _code = await jbFetchFile(fullUrl)
  const code = `${_code}\n//# sourceURL=${url}?${jb.uri}`
  const context = { jb, 
    require: typeof require != 'undefined' && require,
    ...(jb.macro && !noSymbols ? jb.macro.proxies : {}),
    component: (...args) => jb.component(...args,fileSymbols && fileSymbols.dsl)
  }
  try {
    new Function(Object.keys(context), code).apply(null, Object.values(context))
  } catch (e) {
    return jb.logException(e,`jbloadJSFile lib ${url}`,{context, code})
  }
  // const dsl = fileSymbols && fileSymbols.dsl ? `$$dsl_${fileSymbols.dsl}$` : ''
  // const prefixCode = jb.macro && jb.macro.importAll()
  // const funcId = '__'+dsl+url.replace(/[^a-zA-Z0-9]/g,'_')
  // const wrappedCode = noSymbols ? code : `function ${funcId}(jb) {${prefixCode}; ${code}\n}`
  // try {
  //   //console.log(`loading ${url}`)
  //   globalThis.eval(`${wrappedCode}//# sourceURL=${url}?${jb.uri}`)
  //   !noSymbols && globalThis[funcId](jb)
  // } catch (e) {
  //   return jb.logException(e,`jbloadJSFile lib ${url}`,{wrappedCode, code})
  // }
}

async function jbSupervisedLoad(symbols, jb, doNoInitLibs) {
  const ns = jb.utils.unique([...symbols.flatMap(x=>x.ns || []),'Var','remark','typeCast'])
  const libs = jb.utils.unique(symbols.flatMap(x=>x.libs))
  ns.forEach(id=> jb.macro.registerProxy(id))
  await Promise.all(symbols.map(fileSymbols=> jbloadJSFile(fileSymbols.path,jb,{fileSymbols})))
  //await symbols.reduce((pr,fileSymbols) => pr.then(()=> jbloadJSFile(fileSymbols.path,jb,{fileSymbols})), Promise.resolve())
  !doNoInitLibs && await jb.initializeLibs(libs)
  jb.utils.resolveLoadedProfiles()
}

var jbLoadedSymbols = null
async function fileSymbolsFromBuild(path,_include,_exclude) {
  globalThis.jbFetchJson = globalThis.jbFetchJson || (path => globalThis.fetch(path, {mode: 'cors'}).then(x=>x.json()))
  const include = _include && new RegExp(_include), exclude = _exclude && new RegExp(_exclude)

  if (!jbLoadedSymbols) {
    jbLoadedSymbols = [
      ...await globalThis.jbFetchJson(`${jb.baseUrl}/dist/symbols/src.json`),
      ...await globalThis.jbFetchJson(`${jb.baseUrl}/dist/symbols/plugins.json`),
      ...await globalThis.jbFetchJson(`${jb.baseUrl}/dist/symbols/projects.json`),
    ];
  }
  return jbLoadedSymbols.filter(e=>e.path.indexOf(path+'/') == 1 && !(include && !include.test(e.path) || exclude && exclude.test(e.path)))
}

if (typeof module != 'undefined') module.exports = { jbInit, jb_plugins }
globalThis.jbloadJSFile = jbloadJSFile
