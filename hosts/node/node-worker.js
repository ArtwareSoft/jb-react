const fs = require('fs')
const WebSocketServer = require('websocket').server
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

function createWSServer() {
    return new Promise(resolve => {
        const port = pickRandomPort()
        const nodeServer = jbHost.http.createServer()
        nodeServer.once('error', err => { // if port is used, try another random port
            if (err.code === 'EADDRINUSE')
                createWSServer().then(res=>resolve(res))
        })
        
        new WebSocketServer({ httpServer: nodeServer }).on('request', request => {
            const client = request.accept('echo-protocol', request.origin)
            jb.treeShake.codeServerJbm = jb.parent = jb.ports[clientUri] = jb.jbm.extendPortToJbmProxy(jb.nodeContainer.portFromNodeWebSocket(client,clientUri));
            setInterval(()=>// kill itself if parent not answering
                jb.parent.remoteExec('ping',{timeout:10000}).catch(err=> err.timeout &&  process.exit(1))
            ,10000)
        })
        nodeServer.listen({port}, () => resolve(nodeServer.address()))
    })
}

function pickRandomPort() {
  const range = settings.ports.lastServerPort - settings.ports.firstServerPort
  return settings.ports.firstServerPort + Math.floor(Math.random() * range)
}

async function run() {
  const _host = require('os').hostname().replace(/-/g,'_')
  const uri = getProcessArgument('uri') || `${_host}_${process.pid}`
  const project = getProcessArgument('project') || ''
  // if (getProcessArgument('treeShake')) {
  //   // global.jbTreeShakeServerUrl = `http://localhost:${settings.ports.treeShake}`
  //   // global.jbGetJSFromUrl = jbGetJSFromUrl

  //   // //global.jb = { uri }
  //   // await jbGetJSFromUrl(`${jbTreeShakeServerUrl}/treeShake-client.js`)
  //   // await jbGetJSFromUrl(`${jbTreeShakeServerUrl}/jb-port.js?ids=-nodeContainer.portFromNodeWebSocket`)
  // } else {
  const { jbInit } = require(`${jbHost.jbReactDir}/plugins/loader/jb-loader.js`)
  const sourceCodeStr = getProcessArgument('sourceCode')
  const sourceCode = sourceCodeStr ? JSON.parse(sourceCodeStr) 
      : { plugins:_plugins ? _plugins.split(',') : [], project, pluginPackages: {$:'defaultPackage'} }
  sourceCode.plugins.push('remote')

  global.jb = await jbInit(uri, sourceCode)

  const { port } = await createWSServer()
  const pid = process.pid
  const host = 'localhost'
  process.stdout.write(JSON.stringify({port,host, uri,clientUri,pid, wsUrl: `ws://${host}:${port}`})) // returns the connection details to stdout
  // kill itself if not initialized
  setTimeout(() => {Object.keys(jb.ports).length == 0 && process.exit(1)}, 30000 )
}

run()
