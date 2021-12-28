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

async function jbInit(uri, {projects, repos, baseUrl, multipleInFrame, fileSymbolsFunc }) {
  fileSymbols = fileSymbolsFunc || fileSymbolsFromHttp
  const jb = { uri, baseUrl: baseUrl !== undefined ? baseUrl : typeof globalThis.jbBaseUrl != 'undefined' ? globalThis.jbBaseUrl : '' }
  if (!multipleInFrame) // multipleInFrame is used in jbm.child
    globalThis.jb = jb
  const coreFiles= jb_modules.core.map(x=>`/${x}`)
  await coreFiles.reduce((pr,url) => pr.then(()=> jbloadJSFile(url,jb)), Promise.resolve())
  jb.noSupervisedLoad = false

  const srcSymbols = await fileSymbols('src','','pack-|jb-loader').then(x=>x.filter(x=>coreFiles.indexOf(x.path) == -1))
  const topRequiredModules = ['plugins', ...(repos || []).map(repo => `${repo}/plugins`), ...(projects || []).map(x => `projects/${x}`)]
  
  const symbols = await topRequiredModules.reduce( async (acc,dir) => [...await acc, ...await fileSymbols(dir,'','pack-')], [])
  await jbSupervisedLoad([...srcSymbols,...symbols],jb)

  return jb

  async function fileSymbolsFromHttp(path,include,exclude) {
    const inc = include ? `&include=${include}` : ''
    const exc = exclude ? `&exclude=${exclude}` : ''
    return fetch(`${jb.baseUrl}?op=fileSymbols&path=${path}${inc}${exc}`).then(x=>x.json())
  }
}

async function jbloadJSFile(url,jb,{noSymbols} = {}) {
  globalThis.jbFetchFile = globalThis.jbFetchFile || (path => globalThis.fetch(path).then(x=>x.text()))
  const code = await jbFetchFile(jb.baseUrl+url)
  if (noSymbols) try {
    return globalThis.eval(`${code}//# sourceURL=${url}?${jb.uri}`)
  } catch (e) {
    jb.logException(e,`eval lib ${url}`,{code})
  }
  const funcId = '__'+url.replace(/[^a-zA-Z0-9]/g,'_')
    globalThis.eval(`function ${funcId}(jb) {${jb.macro ? jb.macro.importAll(): ''}; ${code}
  }//# sourceURL=${url}?${jb.uri}`)
    globalThis[funcId](jb)
}

async function jbSupervisedLoad(symbols, jb) {
  const ns = jb.utils.unique([...symbols.flatMap(x=>x.ns || []),'Var','remark'])
  const libs = jb.utils.unique(symbols.flatMap(x=>x.libs))
  ns.forEach(id=> jb.macro.registerProxy(id))
  await symbols.reduce((pr,symbol) => pr.then(()=> jbloadJSFile(symbol.path,jb)), Promise.resolve())
//  jb.treeShake.baseUrl = baseUrl !== undefined ? baseUrl : typeof globalThis.jbBaseUrl != 'undefined' ? globalThis.jbBaseUrl : ''
  await jb.initializeLibs(libs)
  Object.keys(jb.comps).forEach(comp => jb.macro.fixProfile(jb.comps[comp],comp))
}

// async function jb_treeShakeClient(uri,baseUrl,loadJBFile) {
//   globalThis.jb = { uri }
//   const coreFiles= jb_modules.core.map(x=>`/${x}`)
//   await coreFiles.reduce((pr,url) => pr.then(()=> loadJBFile(url,baseUrl,globalThis.jb)), Promise.resolve())
//   jb.noSupervisedLoad = false
//   var { If,not,contains,writeValue,obj,prop,rx,source,sink,call,jbm,remote,pipe,log,net,aggregate,list,runActions,Var,http } = 
//     jb.macro.ns('If,not,contains,writeValue,obj,prop,rx,source,sink,call,jbm,remote,pipe,log,net,aggregate,list,runActions,Var,http') // ns use in modules
//   await 'loader/code-loader,core/jb-common,misc/jb-callbag,misc/rx-comps,misc/pretty-print,misc/remote-context,misc/jbm,misc/remote,misc/net'.split(',').map(x=>`/src/${x}.js`)
//     .reduce((pr,url)=> pr.then(() => loadJBFile(url,baseUrl,jb)), Promise.resolve())
//   await jb.initializeLibs('core,callbag,utils,jbm,net,cbHandler,treeShake,websocket'.split(','))
//   Object.keys(jb.comps).forEach(comp => jb.macro.fixProfile(jb.comps[comp],comp))
// }

if (typeof module != 'undefined') module.exports = { jbInit }
globalThis.jbloadJSFile = jbloadJSFile