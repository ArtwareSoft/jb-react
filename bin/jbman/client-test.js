const fs = require('fs')
const jbBaseUrl = __dirname.replace(/\\/g,'/').replace(/\/hosts\/node$/,'').replace(/\/bin\/jbman$/,'')
const { log, getProcessArgument} = require(`${jbBaseUrl}/bin/utils.js`)

let settings = { verbose: getProcessArgument('verbose') }
try {
  Object.assign(settings,JSON.parse(fs.readFileSync(`${jbBaseUrl}/jbart.json`)))
  log('settings',settings)
} catch(e) {}

global.jbInNode = true
const uri = `node${process.pid}`
global.jb = { uri }
async function run() {
    await requireFromUrl(`http://localhost:${settings.ports.codeLoader}/codeloader-client.js`)
    spy = jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})

    await requireFromUrl(`http://localhost:${settings.ports.codeLoader}/jb-test.js?ids=-test.runOneTest,dataTest.datum&modules=path=projects/tests,path=projects/tests`)
    const res = await jb.test.runOneTest('dataTest.datum')
    console.log(res)
}
// process.on('message', (m, socket) => {
//   if (m.$ != 'initSocket') return
//   jb.jbm.extendPortToJbmProxy(jb.jbm.portFromNodeSocket(socket,m.clientUri))
//   socket.send({$: 'ready', serverUri: uri})
// })

const vm = require('vm'), fetch = require('node-fetch')
async function requireFromUrl(url) { 
    const response = await fetch(url)
    const code = await response.text()
    vm.runInThisContext(code, url)
};

run().then(()=>console.log('finished'))

// const fs = require('fs')
// const jbBaseUrl = __dirname.replace(/\\/g,'/').replace(/\/hosts\/nodejs$/,'').replace(/\/bin\/jbman$/,'');
// const { log, getProcessArgument} = require(`${jbBaseUrl}/bin/utils.js`)
// global.jbInNode = true
// let settings = { verbose: getProcessArgument('verbose') }
// try {
//   Object.assign(settings,JSON.parse(fs.readFileSync(`${jbBaseUrl}/jbart.json`)))
//   log('settings',settings)
// } catch(e) {}

// const jbCodeLoader = require('./dev-codelLoader.js')


// // createJbm Test
// const WebSocketClient = require('websocket').client
// const serviceRegistration = new WebSocketClient()
// serviceRegistration.on('connectFailed', err => log(`serviceRegistration connectFailed : ${err.toString() }`))
// serviceRegistration.on('connect', connection => {
//     log('WebSocket serviceRegistration Connected')
//     connection.on('error', err => log(`serviceRegistration Connection Error: ${err.toString() }`))
//     connection.on('close', () => log(`serviceRegistration Connection closed`))
//     connection.on('message', function(message) {
//         if (message.type === 'utf8')
//             log("Received: '" + message.utf8Data + "'")
//     })  
//     if (!connection.connected)
//         return log('error - serviceRegistration not connected')
//     connection.sendUTF('1111' + new Date().getTime())
// })
// serviceRegistration.connect(`ws://localhost:${settings.ports.serviceRegistration}`, 'echo-protocol')