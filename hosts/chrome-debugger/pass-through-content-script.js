jbModuleUrl = 'http://localhost:8082'
function jbm_create(libs,uri) { 
    return libs.reduce((pr,lib) => pr.then(jb => jbm_load_lib(jb,lib,uri)), Promise.resolve({uri})) 
}
  
async function jbm_load_lib(jbm,lib,prefix) {
    const pre = prefix ? `!${prefix}!` : ''
    const res = await fetch(`${jbModuleUrl}/dist/${pre}${lib}-lib.js`)
    const script = await res.text()
    eval([script,`//# sourceURL=${pre}${lib}-lib.js`].join('\n'))
    self.jbmFactory = jbmFactory
    jbmFactory[lib](jbm)
    return jbm
}

self.addEventListener('message', m => { // debugge asking to be debugged - panel initiated the process by jb.jbm.initDevToolsDebugge
    if (m.data && m.data.initDevToolsPeerOnDebugge) {
        if (self.jb) return
        const {spyParam, uri} = m.data.initDevToolsPeerOnDebugge
        const debuggeUri = uri
        chrome.runtime.sendMessage({notify: 'content-script-initialized', debuggeUri})
        console.log('devtools gateway attached to debuggeUri',debuggeUri)

        if (debuggeUri) jbm_create(['common','rx','remote'],'devtools').then(jb => {
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
/*
        

    self.panelPorts = {}
    //console.log('chromeDebugger pass through init')
    chrome.runtime.sendMessage('inspectedCreated')

    self.addEventListener('message', m => {
        if (m.data.from == 'inspectedStudio' && m.data.$ == 'connectToPanel') {
            //console.log('chromeDebugger connectToPanel request',{m})
            const port = self.panelPorts[m.data.panelUri] = chrome.runtime.connect({name: 'jbDebugger'})
            port.onMessage.addListener(msg => {
                //console.log('chromeDebugger message received from panel at content-script',msg)
                self.postMessage(msg)
            })
            port.onDisconnect.addListener(() => delete self.panelPorts[m.data.from])
        }
        if (m.data.from == 'inspectedStudio' && m.data.cbId) {
            m.data.to = ((m.data.cbId||'').match(/(.*):[0-9]+$/)||['',''])[1]
            //console.log('chromeDebugger pass from inspectedStudio to content-script',m.data,self.panelPorts)
            self.panelPorts[m.data.to] && self.panelPorts[m.data.to].postMessage(m.data)
        }
        if (m.data.runProfile) {
            //console.log('content-script runProfile',m.data)
            const port = Object.values(self.panelPorts)[0]
            port && port.postMessage(m.data)
        }
    })

*/

