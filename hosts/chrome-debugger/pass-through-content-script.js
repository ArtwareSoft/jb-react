self.panelPorts = {}
console.log('chromeDebugger pass through init')
chrome.runtime.sendMessage('inspectedCreated')

self.addEventListener('message', m => {
    if (m.data.from == 'inspectedStudio' && m.data.$ == 'connectToPanel') {
        console.log('chromeDebugger connectToPanel request',{m})
        const port = self.panelPorts[m.data.panelUri] = chrome.runtime.connect({name: 'jbDebugger'})
        port.onMessage.addListener(msg => {
            console.log('chromeDebugger message received from panel at content-script',msg)
            self.postMessage(msg)
        })
        port.onDisconnect.addListener(() => delete self.panelPorts[m.data.from])
    }
    if (m.data.from == 'inspectedStudio' && m.data.cbId) {
        m.data.to = ((m.data.cbId||'').match(/(.*):[0-9]+$/)||['',''])[1]
        console.log('chromeDebugger pass from inspectedStudio to content-script',m.data,self.panelPorts)
        self.panelPorts[m.data.to] && self.panelPorts[m.data.to].postMessage(m.data)
    }
    if (m.data.runProfile) {
        console.log('content-script runProfile',m.data)
        const port = Object.values(self.panelPorts)[0]
        port && port.postMessage(m.data)
    }
})

