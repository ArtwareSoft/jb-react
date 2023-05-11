const fs = require('fs')
const WebSocketServer = require('websocket').server
//const http = require('http')

//global.jbBaseUrl = __dirname.replace(/\\/g,'/').replace(/\/hosts\/node$/,'')
const { jbHost } = require('./node-host.js')
const { getProcessArgument } = jbHost

let settings = { verbose: getProcessArgument('verbose') }
try {
  Object.assign(settings,JSON.parse(fs.readFileSync(`${jbHost.jbReactDir}/jbart.json`)))
} catch(e) {}

const clientUri = getProcessArgument('clientUri')
if (!clientUri) {
    console.log('{"err":"missing clientUri"}')
    exit(1)
}
const inspect = false; //getProcessArgument('inspect')

function createWSServer() {
    return new Promise(resolve => {
        const port = pickRandomPort()
        const nodeServer = jbHost.http.createServer()
        nodeServer.once('error', err => { // if port is used, try another random port
            if (err.code === 'EADDRINUSE')
                createWSServer().then(port=>resolve(port))
        })
        
        new WebSocketServer({ httpServer: nodeServer }).on('request', request => {
            const client = request.accept('echo-protocol', request.origin)
            jb.treeShake.codeServerJbm = jb.parent = jb.ports[clientUri] = jb.jbm.extendPortToJbmProxy(jb.nodeContainer.portFromNodeWebSocket(client,clientUri));
            !inspect && setInterval(()=>// kill itself if parent not answering
                jb.parent.remoteExec('ping',{timeout:10000}).catch(err=> err.timeout &&  process.exit(1))
            ,10000)
        })
        nodeServer.listen({port}, () => resolve(nodeServer.address().port))
    })
}

function pickRandomPort() {
  const range = settings.ports.lastServerPort - settings.ports.firstServerPort
  return settings.ports.firstServerPort + Math.floor(Math.random() * range)
}

async function run() {
  const hostname = require('os').hostname().replace(/-/g,'_')
  const uri = getProcessArgument('uri') || `${hostname}_${process.pid}`
  const projects = (getProcessArgument('projects') || '').split(',').filter(x=>x)
  if (getProcessArgument('treeShake')) {
    global.jbTreeShakeServerUrl = `http://localhost:${settings.ports.treeShake}`
    global.jbGetJSFromUrl = jbGetJSFromUrl

    //global.jb = { uri }
    await jbGetJSFromUrl(`${jbTreeShakeServerUrl}/treeShake-client.js`)
    await jbGetJSFromUrl(`${jbTreeShakeServerUrl}/jb-port.js?ids=-nodeContainer.portFromNodeWebSocket`)
  // } else if (getProcessArgument('completionServer')) {
  //   const { jbInit, jb_plugins } = require(`${jbBaseUrl}/plugins/loader/jb-loader.js`)
  //   global.jb = await jbInit(uri,{ projects, plugins: jb_plugins, doNoInitLibs: true })
  //   await jb.initializeLibs(['utils','watchable','immutable','watchableComps','tgp','tgpTextEditor','vscode','jbm','cbHandler','treeShake'])
  //   await jb.vscode.initServer(getProcessArgument('clientUri'))
  } else {
    const { jbInit, jb_plugins } = require(`${jbHost.jbReactDir}/plugins/loader/jb-loader.js`)
    global.jb = await jbInit(uri,{ projects, plugins: jb_plugins, loadTests: getProcessArgument('loadTests') })
  }
  spy = jb.spy.initSpy({spyParam: getProcessArgument('spyParam') || 'remote'})

  const port = await createWSServer()
  const pid = process.pid
  process.stdout.write(JSON.stringify({port,uri,clientUri,pid})) // returns the connection details to stdout
  // kill itself if not initialized
  setTimeout(() => {Object.keys(jb.ports).length == 0 && process.exit(1)}, 30000 )
}

run()
