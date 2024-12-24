const fs = require('fs')
const jbBaseUrl = __dirname.replace(/\\/g,'/').replace(/\/hosts\/node$/,'').replace(/\/bin\/jbman$/,'')
const { log, getProcessArgument, jbGetJSFromUrl} = require(`${jbBaseUrl}/hosts/node/node-utils.js`)

let settings = { verbose: getProcessArgument('verbose') }
try {
  Object.assign(settings,JSON.parse(fs.readFileSync(`${jbBaseUrl}/jbart.json`)))
  log('settings',settings)
} catch(e) {}

const uri = `node${process.pid}`
global.jb = { uri }
async function run() {
    await jbGetJSFromUrl(`http://localhost:${settings.ports.treeShake}/treeShake-client.js`)
    await jbGetJSFromUrl(`http://localhost:${settings.ports.treeShake}/jb-test.js?ids=remote.data,-jbm.portFromNodeWebSocket`)
    spy = jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})

    console.log(jb.jbm.portFromNodeWebSocket)
    
    const WebSocketClient = require('websocket').client
    const nodeContainer = new WebSocketClient()
    nodeContainer.on('connectFailed', err => log(`nodeContainer connectFailed : ${err.toString() }`))
    nodeContainer.on('connect', connection => {
        log('WebSocket nodeContainer Connected')
        connection.on('error', err => log(`nodeContainer Connection Error: ${err.toString() }`))
        connection.on('close', () => log(`nodeContainer Connection closed`))
        connection.on('message', async _m => {
            const m = JSON.parse(_m.utf8Data)
            log('Received from container',m)
            if (m.$ == 'ready') {
                jb.ports[m.from] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromNodeWebSocket(connection,m.serverUri))
                const res = await jb.exec({$: 'remote.data', data: 'hello', jbm: () => jb.ports[m.from]})
                console.log(res)
            }
        })  
        if (!connection.connected)
            return log('error - nodeContainer not connected')
        log('sending createJbm')
        connection.sendUTF(JSON.stringify({$: 'createJbm', clientUri: jb.uri}))
    })
    nodeContainer.connect(`ws://localhost:${settings.ports.nodeContainer}`, 'echo-protocol')
}
// process.on('message', (m, socket) => {
//   if (m.$ != 'initSocket') return
//   jb.jbm.extendPortToJbmProxy(jb.jbm.portFromNodeSocket(socket,m.clientUri))
//   socket.send({$: 'ready', serverUri: uri})
// })


run().then(()=>console.log('finished'))

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