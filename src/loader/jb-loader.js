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

async function jbInit(uri, {projects, plugins, baseUrl, multipleInFrame, loadFileFunc, fileSymbolsFunc }) {
  // multipleInFrame is used in jbm.child
  const isWorker = typeof jbInWorker != 'undefined'
  baseUrl = baseUrl || isWorker && typeof location != 'undefined' && location.origin || ''
  jb_loadFile = loadFileFunc || (multipleInFrame ? jb_loadFileIntoClosure : jb_loadFileToFrame)
  fileSymbols = fileSymbolsFunc || fileSymbolsFromHttp
  const jb = { uri }
  if (!multipleInFrame)
    globalThis.jb = jb
  const coreFiles= jb_modules.core.map(x=>`/${x}`)
  await coreFiles.reduce((pr,url) => pr.then(()=> jb_loadFile(url,baseUrl,jb)), Promise.resolve())
  jb.noSupervisedLoad = false

  const _srcSymbols = await fileSymbols('src','','pack-|jb-loader')
  const srcSymbols = _srcSymbols.filter(x=>coreFiles.indexOf(x.path) == -1)
//  const allSymbols = [...srcSymbols, ...await fileSymbols('projects'),...await fileSymbols('plugins')]
//  const allSymbolsHash = jb.objFromEntries(allSymbols.map(x=>[x.path,x]))
  const topRequiredModules = [...(projects || []).map(x => `projects/${x}`), ...(plugins || []).map(x => `plugins/${x}`)]
  //const requiredSymbols = allSymbols.filter(x=> topRequiredModules.reduce((acc,m) => acc || x.path.indexOf(m) == 1, false))
  //const requiredSymbols = treeShake(topRequiredSymbols,{})
  
  const symbols = await topRequiredModules.reduce( async (acc,dir) => [...await acc, ...await fileSymbols(dir)], [])
  await jbSupervisedLoad([...srcSymbols,...symbols],{jb, jb_loadFile, baseUrl})

  // jb.treeShake.loadModules = async function(modules) { // helper function
  //   const symbols = await modules.reduce( async (acc,dir) => [...await acc, ...await fileSymbols(dir)], [])
  //   await jbSupervisedLoad(symbols,{jb, jb_loadFile, baseUrl})      
  // }
  return jb

  // function treeShake(ids, existing) {
  //   const _ids = ids.filter(x=>!existing[x])
  //   const dependent = jb.utils.unique(_ids.flatMap(id =>jb.path(allSymbolsHash[id],'import.1')||[]).filter(x=>!existing[x]))
  //   if (!dependent.length) return _ids
  //   const existingExtended = { ...existing,  ...jb.objFromEntries(_ids.map(x=>[x,true])) }
  //   return [ ..._ids, ...jb.treeShake.treeShake(dependent, existingExtended)]
  // }

  async function fileSymbolsFromHttp(path,include,exclude) {
    const inc = include ? `&include=${include}` : ''
    const exc = exclude ? `&exclude=${exclude}` : ''
    return fetch(`${baseUrl}?op=fileSymbols&path=${path}${inc}${exc}`).then(x=>x.json())
  }

  async function jb_loadFileIntoClosure(url, baseUrl,jb) {
    const code = await fetch(baseUrl+url).then(x=>x.text())
    const funcId = '__'+url.replace(/[^a-zA-Z0-9]/g,'_')
    globalThis.eval(`function ${funcId}(jb) {${code}
  }//# sourceURL=${url}?${uri}`)
    globalThis[funcId](jb)
  }

  function jb_loadFileToFrame(url, baseUrl) {
    if (typeof jbInWorker != 'undefined') {
      return Promise.resolve(importScripts(baseUrl+url))
    } else {
      return new Promise(resolve => {
        const type = url.indexOf('.css') == -1 ? 'script' : 'link'
        var s = document.createElement(type)
        s.setAttribute(type == 'script' ? 'src' : 'href',baseUrl + url)
        if (type == 'script') 
          s.setAttribute('charset','utf8') 
        else 
          s.setAttribute('rel','stylesheet')
        s.onload = s.onerror = resolve
        document.head.appendChild(s);
      })
    }
  }  
}

async function jbSupervisedLoad(symbols, {jb, jb_loadFile, baseUrl} = {}) {
  const ns = jb.utils.unique([...symbols.flatMap(x=>x.ns || []),'Var','remark'])
  const libs = jb.utils.unique(symbols.flatMap(x=>x.libs))
  ns.forEach(id=> jb.macro.registerProxy(id))
  await symbols.reduce((pr,symbol) => pr.then(()=> jb_loadFile(symbol.path,baseUrl,jb)), Promise.resolve())
  jb.treeShake.baseUrl = baseUrl
  await jb.initializeLibs(libs)
  Object.keys(jb.comps).forEach(comp => jb.macro.fixProfile(jb.comps[comp],comp))
}

async function jb_treeShakeClient(uri,baseUrl) {
  globalThis.jb = { uri }
  const coreFiles= jb_modules.core.map(x=>`/${x}`)
  await coreFiles.reduce((pr,url) => pr.then(()=> jb_loadFile(url,baseUrl)), Promise.resolve())
  jb.noSupervisedLoad = false
  var { If,not,contains,writeValue,obj,prop,rx,source,sink,call,jbm,remote,pipe,log,net,aggregate,list,runActions,Var,http } = 
    jb.macro.ns('If,not,contains,writeValue,obj,prop,rx,source,sink,call,jbm,remote,pipe,log,net,aggregate,list,runActions,Var,http') // ns use in modules
  await 'loader/code-loader,core/jb-common,misc/jb-callbag,misc/rx-comps,misc/pretty-print,misc/remote-context,misc/jbm,misc/remote,misc/net'.split(',').map(x=>`/src/${x}.js`)
    .reduce((pr,url)=> pr.then(() => jb_loadFile(url,baseUrl)), Promise.resolve())
  await jb.initializeLibs('core,callbag,utils,jbm,net,cbHandler,treeShake,websocket'.split(','))
  Object.keys(jb.comps).forEach(comp => jb.macro.fixProfile(jb.comps[comp],comp))
}

if (typeof module != 'undefined') module.exports = { jbInit }
