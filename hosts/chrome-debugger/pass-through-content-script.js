self.addEventListener('message', m => { 
    // debugge asking to be debugged. Panel initiated the process by invoking jb.jbm.initDevToolsDebugge on debugee
    if (m.data && m.data.initDevToolsPeerOnDebugge) {
        if (self.jb) return
        const {spyParam, uri, distPath} = m.data.initDevToolsPeerOnDebugge
        const debuggeUri = uri
        console.log('chromeDebugger devtools gateway attached to debuggeUri',debuggeUri)
        const baseUrl = 'http://localhost:8082'

        if (debuggeUri) jb_loadFile('/plugins/loader/jb-loader.js',baseUrl).then(() => jbInit('devtools',{baseUrl})).then(jb => {
            self.jb = jb
            self.spy = jb.spy.initSpy({spyParam})
            
            jb.component('jbm.connectToPanel', {
                type: 'jbm<jbm>',
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
            jb.log('chromeDebugger devtools jbm initialized',{uri: jb.uri})
            jb.jbm.networkPeers[debuggeUri].remoteExec(jb.remoteCtx.stripJS(() => jb.jbm.devtoolsInitialized = true), { oneway: true} )
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
            dtport.onMessage.addListener(m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
        onDisconnect: { addListener: handler => { dtport.onDisconnect.addListener(handler)} }
    }
    return port
}

async function jb_loadFile(url, baseUrl) {
  baseUrl = baseUrl || ''
  console.log('jb_loadFile',url)
  await fetch(baseUrl+url).then(ret => ret.text()).then(code=>self.eval(`${code}//# sourceURL=${url}?devtools`))
}  
       

