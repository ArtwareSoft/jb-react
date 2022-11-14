var jb_modules = {
  'core': [
    'src/core/jb-core.js',
    'src/core/core-utils.js',
    'src/core/jb-expression.js',
    'src/core/db.js',
    'src/core/jb-macro.js',
    'src/misc/spy.js',
  ],
}

var jb_plugins = ['data-browser','headless-preview','tgp','watchable-comps', 'workspace', 'space','vega']; // list of plugins to be used by studio

async function jbInit(uri, {projects, plugins, baseUrl, multipleInFrame, doNoInitLibs }) {
  const fileSymbols = globalThis.jbFileSymbols || fileSymbolsFromHttp
  const jb = { uri, baseUrl: baseUrl !== undefined ? baseUrl : typeof globalThis.jbBaseUrl != 'undefined' ? globalThis.jbBaseUrl : '' }
  if (!multipleInFrame) // multipleInFrame is used in jbm.child
    globalThis.jb = jb
  const coreFiles= jb_modules.core.map(x=>`/${x}`)
  await coreFiles.reduce((pr,url) => pr.then(()=> jbloadJSFile(url,jb)), Promise.resolve())
  jb.noSupervisedLoad = false

  const srcSymbols = await fileSymbols('src','','pack-|jb-loader').then(x=>x.filter(x=>coreFiles.indexOf(x.path) == -1))
  const topRequiredModules = [...(plugins || []).map(x => `plugins/${x}`), ...(projects || []).map(x => `projects/${x}`)]
  
  const symbols = await topRequiredModules.reduce( async (acc,dir) => [...await acc, ...await fileSymbols(dir,'','pack-')], [])
  await jbSupervisedLoad([...srcSymbols,...symbols],jb,doNoInitLibs)

  return jb

  async function fileSymbolsFromHttp(path,include,exclude) {
    const inc = include ? `&include=${include}` : ''
    const exc = exclude ? `&exclude=${exclude}` : ''
    return fetch(`${jb.baseUrl}?op=fileSymbols&path=${path}${inc}${exc}`).then(x=>x.json())
  }
}

async function jbloadJSFile(url,jb,{noSymbols, fileSymbols} = {}) {
  globalThis.jbFetchFile = globalThis.jbFetchFile || (path => globalThis.fetch(path).then(x=>x.text()))
  const code = await jbFetchFile(jb.baseUrl+url)
  const dsl = fileSymbols && fileSymbols.dsl ? `$$dsl_${fileSymbols.dsl}$` : ''
  const prefixCode = jb.macro && jb.macro.importAll()
  const funcId = '__'+dsl+url.replace(/[^a-zA-Z0-9]/g,'_')
  const wrappedCode = noSymbols ? code : `function ${funcId}(jb) {${prefixCode}; ${code}\n}`
  try {
    globalThis.eval(`${wrappedCode}//# sourceURL=${url}?${jb.uri}`)
    !noSymbols && globalThis[funcId](jb)
  } catch (e) {
    return jb.logException(e,`jbloadJSFile lib ${url}`,{wrappedCode, code})
  }
}

async function jbSupervisedLoad(symbols, jb, doNoInitLibs) {
  const ns = jb.utils.unique([...symbols.flatMap(x=>x.ns || []),'Var','remark','typeCast'])
  const libs = jb.utils.unique(symbols.flatMap(x=>x.libs))
  ns.forEach(id=> jb.macro.registerProxy(id))
  await symbols.reduce((pr,fileSymbols) => pr.then(()=> jbloadJSFile(fileSymbols.path,jb,{fileSymbols})), Promise.resolve())
  !doNoInitLibs && await jb.initializeLibs(libs)
  jb.utils.resolveLoadedProfiles()
}

if (typeof module != 'undefined') module.exports = { jbInit, jb_plugins }
globalThis.jbloadJSFile = jbloadJSFile