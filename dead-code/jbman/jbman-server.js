const fs = require('fs')
const http = require('http')
const WebSocketServer = require('websocket').server
const child = require('child_process')
const jbBaseUrl = __dirname.replace(/\\/g,'/').replace(/\/hosts\/node$/,'').replace(/\/bin\/jbman$/,'');
const { log, getProcessArgument, getURLParam} = require(`${jbBaseUrl}/hosts/node/node-utils.js`)
const nodeContainerUrl = `${jbBaseUrl}/hosts/node/node-container.js`

let settings = { verbose: getProcessArgument('verbose') }
try {
  Object.assign(settings,JSON.parse(fs.readFileSync(`${jbBaseUrl}/jbart.json`)))
  log('settings',settings)
} catch(e) {}

// ** nodeContainer
const processes = {}
const nodeContainer = http.createServer()
nodeContainer.listen(settings.ports.nodeContainer, () => log(`nodeContainer at: http://localhost:${nodeContainer.address().port}`))
new WebSocketServer({ httpServer: nodeContainer }).on('request', function(request) {
    const client = request.accept('echo-protocol', request.origin)
    log((new Date()) + ' nodeContainer client accepted.')
    client.on('message', _m => {
        const m = JSON.parse(_m.utf8Data)
        log('Received m', m)
        if (m.$ == 'createJbm') {
            // TODO: check finished process for reuse
            const server = child.fork(nodeContainerUrl)
            const childUri = `node${server.pid}`
            processes[childUri] = { initMessage: m, server }
            server.on('message', m => {
                console.log('container - received message from child',m)
                if (m.$ == 'readyForInit')
                    server.send(processes[childUri].initMessage)
                else
                    client.sendUTF(JSON.stringify(m))
            })
        } else {
            processes[m.to] && processes[m.to].server.send(m)
        }
    })
    client.on('close', () => log((new Date()) + ' Peer ' + client.remoteAddress + ' disconnected.'))
})
