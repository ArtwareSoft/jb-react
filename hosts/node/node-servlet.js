const fs = require('fs')
const WebSocketServer = require('websocket').server
const http = require('http')

global.jbBaseUrl = __dirname.replace(/\\/g,'/').replace(/\/hosts\/node$/,'')
const { getProcessArgument} = require(`${jbBaseUrl}/hosts/node/node-utils.js`)

let settings = { verbose: getProcessArgument('verbose') }
try {
  Object.assign(settings,JSON.parse(fs.readFileSync(`${jbBaseUrl}/jbart.json`)))
} catch(e) {}

const clientUri = getProcessArgument('clientUri')
if (!clientUri) {
    console.log('{"err":"missing clientUri"}')
    exit(1)
}

function createWSServer() {
    return new Promise(resolve => {
        const port = pickRandomPort()
        const nodeServer = http.createServer()
        nodeServer.once('error', err => { // if port is used, try another random port
            if (err.code === 'EADDRINUSE')
                createWSServer().then(port=>resolve(port))
        })
        
        new WebSocketServer({ httpServer: nodeServer }).on('request', request => {
            const client = request.accept('echo-protocol', request.origin)
            jb.treeShake.codeServerJbm = jb.parent = jb.ports[clientUri] = jb.jbm.extendPortToJbmProxy(jb.nodeContainer.portFromNodeWebSocket(client,clientUri))
            setInterval(()=>// kill itself if parent not answering
                jb.parent.remoteExec('ping',{timeout:10000}).catch(err=> err.timeout &&  process.exit(1))
            ,10000)
        })
        nodeServer.listen({port}, () => resolve(nodeServer.address().port))
    })

    function pickRandomPort() {
        const range = settings.ports.lastServerPort - settings.ports.firstServerPort
        return settings.ports.firstServerPort + Math.floor(Math.random() * range)
    }
}

async function run() {
  const hostname = require('os').hostname()
  const uri = `${hostname}-${process.pid}`
  if (getProcessArgument('treeShake')) {
    global.jbTreeShakeServerUrl = `http://localhost:${settings.ports.treeShake}`
    global.jbGetJSFromUrl = jbGetJSFromUrl

    global.jb = { uri }
    await jbGetJSFromUrl(`${jbTreeShakeServerUrl}/treeShake-client.js`)
    await jbGetJSFromUrl(`${jbTreeShakeServerUrl}/jb-port.js?ids=-nodeContainer.portFromNodeWebSocket`)
  } else {
    const { jbInit, jb_plugins } = require(`${jbBaseUrl}/src/loader/jb-loader.js`)
    const modules = (getProcessArgument('modules') || '').split(',').filter(x=>x)
    global.jb = await jbInit(uri,{ projects: modules, plugins: jb_plugins })
  }
  spy = jb.spy.initSpy({spyParam: getProcessArgument('spyParam') || 'remote'})

  const port = await createWSServer()
  process.stdout.write(JSON.stringify({port,uri,clientUri})) // returns the connection details to stdout
  // kill itself if not initialized
  setTimeout(() => {Object.keys(jb.ports).length == 0 && process.exit(1)}, 30000 )
}

run()
