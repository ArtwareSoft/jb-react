self.addEventListener('message', m => { // debugge asking to be debugged. Panel initiated the process by invoking jb.jbm.initDevToolsDebugge on debugee
    if (m.data && m.data.initDevToolsPeerOnDebugge) {
        if (self.jb) return
        const {spyParam, uri, distPath} = m.data.initDevToolsPeerOnDebugge
        const debuggeUri = uri
        console.log('devtools gateway attached to debuggeUri',debuggeUri)

        if (debuggeUri) jbm_create(['common','rx','remote'],{uri :'devtools', distPath}).then(jb => {
            self.jb = jb
            self.spy = jb.initSpy({spyParam})
            
            jb.component('jbm.connectToPanel', {
                type: 'jbm',
                params: [
                    { id: 'panelUri', as: 'string' }
                ],
                impl: ({}, panelUri) => {
                    const panelId = panelUri.split('►').pop()
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

function jbm_create(libs,{uri, distPath}) { 
    return libs.reduce((pr,lib) => pr.then(jb => jbm_load_lib(jb,lib,uri)), Promise.resolve({uri}))

    async function jbm_load_lib(jbm,lib,prefix) {
        const res = await fetch(`${distPath}/${lib}-lib.js?${prefix}`)
        const script = await res.text()
        eval([script,`//# sourceURL=${lib}-lib.js?${prefix}`].join('\n'))
        self.jbmFactory = jbmFactory
        jbmFactory[lib](jbm)
        return jbm
    }    
}
