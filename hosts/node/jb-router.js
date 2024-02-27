const fs = require('fs')
const WebSocketServer = require('websocket').server
const { jbHost } = require('./node-host.js')
const { getProcessArgument, getURLParam } = jbHost

;(async function run() {
    let settings = { verbose: getProcessArgument('verbose'), ports: { 'jb-router' : 8085} }
    try {
        Object.assign(settings,JSON.parse(fs.readFileSync(`${jbHost.jbReactDir}/jbart.json`)))
    } catch(e) {}
    const port = settings.ports['jb-router']
    
    const uri = 'router'
    const { jbInit } = require(`${jbHost.jbReactDir}/plugins/loader/jb-loader.js`)
    const sourceCode = { plugins: ['remote', 'net']}
    global.jb = await jbInit(uri, sourceCode)
    jb.spy.initSpy({spyParam: 'remote'})
    
    const httpServer = jbHost.http.createServer()
    httpServer.once('error', err => {
        const message = err.code === 'EADDRINUSE' ? ` port ${port} is taken` : ''
        jb.logError(`jb-router error.${message}` ,{err})
    })
    
    new WebSocketServer({ httpServer }).on('request', request => {
        const clientUri = getURLParam(request.httpRequest,'clientUri')
        const client = request.accept('echo-protocol', request.origin)
        jb.log('remote router new client',{clientUri, existingPort: jb.ports[clientUri]})
        jb.jbm.networkPeers[clientUri] = jb.ports[clientUri] = null;
        jb.jbm.networkPeers[clientUri] = jb.ports[clientUri] = 
            jb.jbm.extendPortToJbmProxy(jb.webSocket.portFromNodeWebSocket(client,clientUri))
    })
    httpServer.listen({port})
})()
