self.addEventListener('message', m => { // debugge asking to be debugged. Panel initiated the process by invoking jb.jbm.initDevToolsDebugge on debugee
    if (m.data && m.data.initDevToolsPeerOnDebugge) {
        if (self.jb) return
        const {spyParam, uri, distPath} = m.data.initDevToolsPeerOnDebugge
        const debuggeUri = uri
        console.log('chromeDebugger devtools gateway attached to debuggeUri',debuggeUri)

        if (debuggeUri) jbTreeShakeClient('devtools','http://localhost:8082').then(() => {
            self.spy = jb.spy.initSpy({spyParam})
            
            jb.component('jbm.connectToPanel', {
                type: 'jbm',
                params: [
                    { id: 'panelUri', as: 'string' }
                ],
                impl: ({}, panelUri) => {
                    const panelId = panelUri.split('•').pop()
                    disconnect()

                    const dtport = chrome.runtime.connect({name: 'devtools'})
                    const port = jb.jbm.childJbms[panelId] = jb.ports[panelUri] = jb.jbm.extendPortToJbmProxy(portFromDevToolsPort(dtport,panelUri))
                    port.onDisconnect.addListener(disconnect)
                    jb.log('chromeDebugger connected to panel',{uri: jb.uri, panelUri})

                    function disconnect() {
                        if (!jb.ports[panelUri]) return
                        jb.log('chromeDebugger disconnecting from panel',{uri: jb.uri, panelUri})
                        jb.ports[panelUri].dtport.disconnect()
                        delete jb.ports[panelUri]
                        delete jb.jbm.childJbms[panelId]
                    }
                }
            })
            jb.jbm.networkPeers[debuggeUri] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(self,debuggeUri,{blockContentScriptLoop: true}))
        })
    }
})

function portFromDevToolsPort(dtport,to) {
    const from = jb.uri
    const port = {
        dtport, from, to,
        postMessage: _m => { 
            const m = {from, to,..._m}
            jb.log(`remote sent from ${from} to ${to}`,{m})
            dtport.postMessage(m) 
        },
        onMessage: { addListener: handler => 
            dtport.onMessage.addListener(m => 
                jb.net.handleOrRouteMsg(from,to,handler,m)) },
        onDisconnect: { addListener: handler => { dtport.onDisconnect.addListener(handler)} }
    }
    return port
}

var jb_modules = {
    'core': [
      'src/core/jb-core.js',
      'src/core/core-utils.js',
      'src/core/jb-expression.js',
      'src/core/db.js',
      'src/core/jb-macro.js',
      'src/misc/spy.js',
    ]
}

async function jbTreeShakeClient(uri,baseUrl) {
  self.jb = { uri }
  const coreFiles= jb_modules.core.map(x=>`/${x}`)
  await coreFiles.reduce((pr,url) => pr.then(()=> jb_loadFile(url,baseUrl)), Promise.resolve())
  jb.noSupervisedLoad = false
  var { If,not,contains,writeValue,obj,prop,rx,source,sink,call,jbm,startup,remote,pipe,log,net,aggregate,list,runActions,Var } = 
    jb.macro.ns('If,not,contains,writeValue,obj,prop,rx,source,sink,call,jbm,startup,remote,pipe,log,net,aggregate,list,runActions,Var') // ns use in modules
  await 'loader/code-loader,core/jb-common,misc/jb-callbag,misc/rx-comps,misc/pretty-print,misc/remote-context,misc/jbm,misc/remote'.split(',').map(x=>`/src/${x}.js`)
    .reduce((pr,url)=> pr.then(() => jb_loadFile(url,baseUrl)), Promise.resolve())
  await jb.initializeLibs('core,callbag,utils,jbm,net,cbHandler,treeShake'.split(','))
  Object.values(jb.comps).filter(cmp => typeof cmp.impl == 'object').forEach(cmp => jb.macro.fixProfile(cmp.impl,jb.comps[cmp.impl.$]))  
}        

async function jb_loadFile(url, baseUrl) {
  baseUrl = baseUrl || ''
  await fetch(baseUrl+url).then(ret => ret.text()).then(code=>self.eval(`${code}//# sourceURL=${url}?devtools`))
}  
