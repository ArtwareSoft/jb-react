
//if (!self.jbDebuggerPort) {
    console.log('chromeDebugger inspectedWindow content-script')
//    self.jbDebuggerPort = chrome.runtime.connect('olhkmcfheacikjmicbdmlminigmochih',{name: 'jbDebugger'})
    self.jbDebuggerPort = chrome.runtime.connect({name: 'jbDebugger'})
    jbDebuggerPort.onMessage.addListener(m => {
        console.log('chromeDebugger message received from panel at content-script',m)
        self.postMessage({...m, to: 'inspectedWindow'} , '*')
    })
    self.addEventListener('message', m => {
        if (m.source.parent == self && m.data.from == 'inspectedWindow') {
            m.data.to = ((m.data.cbId||'').match(/(.*):[0-9]+$/)||['',''])[1]
            console.log('chromeDebugger pass from inspectedWindow to content-script',m.data)
            jbDebuggerPort.postMessage(m.data)
        }
    })
//}
