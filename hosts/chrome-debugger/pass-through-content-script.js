
if (!self.jbDebuggerPort) {
    //console.log('chromeDebugger connect',[])
    self.jbDebuggerPort = chrome.runtime.connect('olhkmcfheacikjmicbdmlminigmochih',{name: 'jbDebugger'})
    jbDebuggerPort.onMessage.addListener(m => {
        //console.log('chromeDebugger pass from panel',m)
        self.postMessage({...m, to: 'inspectedWindow'} , '*')
    })
    self.addEventListener('message', m => {
        if (m.source.parent == self && m.data.from == 'inspectedWindow') {
            m.data.to = ((m.data.cbId||'').match(/(.*):[0-9]+$/)||['',''])[1]
            //console.log('chromeDebugger pass from inspectedWindow',m.data)
            jbDebuggerPort.postMessage(m.data)
        }
    })
}
