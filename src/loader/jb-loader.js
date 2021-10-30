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

async function jb_codeLoaderServer(uri, {projects, baseUrl, multipleInFrame, loadFileFunc, getAllCodeFunc }) {
  // multipleInFrame is used for multiple jbms in the same frame
  const isWorker = typeof jbInWorker != 'undefined'
  baseUrl = baseUrl || isWorker && typeof location != 'undefined' && location.origin || ''
  jb_loadFile = loadFileFunc || (multipleInFrame ? jb_loadFileIntoClosure : jb_loadFileToFrame)
  getAllCode = getAllCodeFunc || getAllCodeFromHttp
  const jb = { uri }
  if (!multipleInFrame)
    globalThis.jb = jb
  const coreFiles= jb_modules.core.map(x=>`/${x}`)
  await coreFiles.reduce((pr,url) => pr.then(()=> jb_loadFile(url,baseUrl,jb)), Promise.resolve())
  jb.noCodeLoader = false

  const src = [...await getAllCode('src','','puppeteer|pptr-|pack-|jb-loader')].filter(x=>coreFiles.indexOf(x.path) == -1)
  const projectsCode = await projects.reduce( async (acc,project) => [...await acc, ...await getAllCode(`projects/${project}`)], [])

  await jb_evalCode([...src,...projectsCode],{jb, jb_loadFile, baseUrl})

  jb.codeLoader.loadModules = async function(modules) { // helper function
    const modulesCode = await modules.reduce( async (acc,dir) => [...await acc, ...await getAllCode(dir)], [])
    await jb_evalCode(modulesCode,{jb, jb_loadFile, baseUrl})      
  }
  return jb

  async function getAllCodeFromHttp(path,include,exclude) {
    const inc = include ? `&include=${include}` : ''
    const exc = exclude ? `&exclude=${exclude}` : ''
    return fetch(`${baseUrl}?op=getAllCode&path=${path}${inc}${exc}`).then(x=>x.json())
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

async function jb_evalCode(loadedCode, {jb, jb_loadFile, baseUrl} = {}) {
  const ns = jb.utils.unique([...loadedCode,{ns: ['Var','remark']}].flatMap(x=>x.ns))
  const libs = jb.utils.unique(loadedCode.flatMap(x=>x.libs))
  ns.forEach(id=> jb.macro.registerProxy(id))
  await loadedCode.map(x=>x.path).reduce((pr,url) => pr.then(()=> jb_loadFile(url,baseUrl,jb)), Promise.resolve())
  jb.codeLoader.baseUrl = baseUrl
  await jb.initializeLibs(libs)
  Object.values(jb.comps).forEach(comp => jb.macro.fixProfile(comp))
}

async function jb_codeLoaderClient(uri,baseUrl) {
  globalThis.jb = { uri }
  const coreFiles= jb_modules.core.map(x=>`/${x}`)
  await coreFiles.reduce((pr,url) => pr.then(()=> jb_loadFile(url,baseUrl)), Promise.resolve())
  jb.noCodeLoader = false
  var { If,not,contains,writeValue,obj,prop,rx,source,sink,call,jbm,remote,pipe,log,net,aggregate,list,runActions,Var,http } = 
    jb.macro.ns('If,not,contains,writeValue,obj,prop,rx,source,sink,call,jbm,remote,pipe,log,net,aggregate,list,runActions,Var,http') // ns use in modules
  await 'loader/code-loader,core/jb-common,misc/jb-callbag,misc/rx-comps,misc/pretty-print,misc/remote-context,misc/jbm,misc/remote,misc/net'.split(',').map(x=>`/src/${x}.js`)
    .reduce((pr,url)=> pr.then(() => jb_loadFile(url,baseUrl)), Promise.resolve())
  await jb.initializeLibs('core,callbag,utils,jbm,net,cbHandler,codeLoader,websocket'.split(','))
  Object.values(jb.comps).forEach(comp => jb.macro.fixProfile(comp))
}
