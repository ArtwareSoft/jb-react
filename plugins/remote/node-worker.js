
extension('webSocket', 'client', {
    initExtension() { return { toRestart: [], servers: {} } },
    connectFromBrowser: (wsUrl,serverUri,ctx) => new Promise( resolve => {
        const socket = new jbHost.WebSocket_Browser(wsUrl,'echo-protocol')
        jb.log('remote web socket connect request',{wsUrl,serverUri,ctx})
        socket.onopen = () => resolve(jb.webSocket.portFromBrowserWebSocket(socket,serverUri))
        socket.onerror = err => { jb.logError('websocket error',{err,ctx}); resolve() }
    }),
    connectFromNodeClient: (wsUrl,serverUri,ctx) => new Promise( resolve => {
        const W3CWebSocket = jbHost.require('websocket').w3cwebsocket
        const socket = new W3CWebSocket(wsUrl, 'echo-protocol')
        jb.log('remote web socket connect request',{wsUrl,serverUri,ctx})
        socket.onopen = () => { resolve(jb.webSocket.portFromW3CSocket(socket,serverUri)) }
        socket.onerror = err => { jb.logError('websocket error',{err,socket,ctx}); resolve() }
    }),
    connectFromVSCodeClient: (wsUrl,serverUri,ctx) => new Promise( resolve => {
        const client = new jbHost.WebSocket_WS(wsUrl)
        client.on('error', err => {jb.logError('websocket client - connection failed',{ctx,err}); resolve() })
        client.on('open', () => resolve(jb.webSocket.portFromVSCodeWebSocket(client,serverUri)))
    }),
    // connectFromNodeClient: (wsUrl,serverUri,ctx) => new Promise( resolve => {
    //     const WebSocketClient = require('websocket').client
    //     if (!WebSocketClient)
    //         return jb.logError('connectFromNodeClient can not import webSocket client',{ctx})
    //     const client = new WebSocketClient()
    //     if (!client)
    //         return jb.logError('connectFromNodeClient can not create webSocket client',{ctx,WebSocketClient})

    //     //const client = new globalThis.require('websocket').client
    //     client.on('connectFailed', err => {jb.logError('websocket client - connection failed',{ctx,err}); resolve() })
    //     client.on('connect', socket => {
    //         if (!socket.connected) {
    //             jb.logError('websocket client not connected',{ctx})
    //             resolve()
    //         } else {
    //             resolve(jb.webSocket.portFromNodeWebSocket(socket,serverUri))
    //         }
    //     })
    //     client.connect(wsUrl, 'echo-protocol')  
    // }),
    portFromW3CSocket(socket,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            socket, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`transmit remote sent from ${from} to ${to}`,{m})
                socket.send(JSON.stringify(m))
            },
            onMessage: { addListener: handler => socket.onmessage = m => jb.net.handleOrRouteMsg(from,to,handler,JSON.parse(m.data),options) },
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
        }
        jb.ports[to] = port
        return port
    },    
    portFromVSCodeWebSocket(socket,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            socket, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`transmit remote sent from ${from} to ${to}`,{m})
                socket.send(JSON.stringify(m))
            },
            onMessage: { addListener: handler => socket.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,JSON.parse(m.utf8Data),options)) },
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
        }
        jb.ports[to] = port
        return port
    },
    portFromNodeWebSocket(socket,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            socket, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`transmit remote sent from ${from} to ${to}`,{m})
                socket.sendUTF(JSON.stringify(m))
            },
            onMessage: { addListener: handler => socket.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,JSON.parse(m.utf8Data),options)) },
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
        }
        jb.ports[to] = port
        return port
    },
    portFromBrowserWebSocket(socket,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            socket, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`transmit remote sent from ${from} to ${to}`,{m})
                socket.send(JSON.stringify(m))
            },
            onMessage: { addListener: handler => socket.addEventListener('message',m => jb.net.handleOrRouteMsg(from,to,handler,JSON.parse(m.data),options)) },
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
        }
        jb.ports[to] = port
        return port
    },
    portFromNodeChildProcess(proc,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            proc, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`transmit remote sent from ${from} to ${to}`,{m})
                proc.send(m) 
            },
            onMessage: { addListener: handler => proc.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,m,options)) },
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
        }
        jb.ports[to] = port
        return port
    }
})

component('remoteNodeWorker', {
  type: 'jbm',
  params: [
    {id: 'id', as: 'string'},
    {id: 'sourceCode', type: 'source-code<loader>', byName: true, defaultValue: treeShakeClientWithPlugins()},
    {id: 'init', type: 'action<>', dynamic: true},
    {id: 'initiatorUrl', as: 'string', defaultValue: 'http://localhost:8082'},
    {id: 'workerDetails'}
  ],
  impl: async (ctx,_id,sourceCode,init,initiatorUrl,workerDetails) => {
        const id = (_id || 'nodeWorker1').replace(/-/g,'__')
        const vscode = jbHost.WebSocket_WS ? 'vscode ' : ''
        jb.log(`${vscode}remote node worker`,{ctx,id})
        const nodeWorkerUri = `${jb.uri}__${id}`
        const restart = (jb.webSocket.toRestart||[]).indexOf(id)
        if (jb.jbm.childJbms[id] && restart == -1) return jb.jbm.childJbms[id]
        if (restart != -1) {
            jb.jbm.childJbms[id].remoteExec(jb.remoteCtx.stripJS(() => process.exit(0)), { oneway: true} )
            delete jb.jbm.childJbms[id]
            delete jb.ports[nodeWorkerUri]
            jb.webSocket.toRestart.splice(restart,1)
        }
        const args = [
            ['-uri',id],
            ['-clientUri', jb.uri],
            ['-sourceCode', JSON.stringify(sourceCode)],
        ].filter(x=>x[1])

        if (!workerDetails) {
            workerDetails = await startNodeWorker(args)
            if (!workerDetails.uri && args[0][0] == 'inspect') // inspect may cause problems
                workerDetails = await startNodeWorker(args.slice(1))
        }
        jb.log(`${vscode}remote jbm details`,{ctx,workerDetails})

        if (!workerDetails.uri)
            return jb.logError('jbm webSocket bad response from server',{ctx, workerDetails})
        
        const method = 'connectFrom' + (jbHost.WebSocket_WS ? 'VSCodeClient' 
            : jbHost.WebSocket_Browser ? 'Browser' : 'NodeClient')
        const port = await jb.webSocket[method](workerDetails.wsUrl, workerDetails.uri,ctx)
        jb.log(`${vscode}remote connected to port`,{ctx,workerDetails})

        const jbm = jb.jbm.childJbms[id] = {
            ...workerDetails,
            async rjbm() {
                if (this._rjbm) return this._rjbm
                this._rjbm = jb.ports[nodeWorkerUri] = jb.jbm.extendPortToJbmProxy(port)
                await init(ctx.setVar('jbm',jb.jbm.childJbms[id]))
                return this._rjbm
            }
        }
        return jbm

        function startNodeWorker(args) {
            const url = `${initiatorUrl}/?op=createNodeWorker&args=${encodeURIComponent(JSON.stringify(args.map(([k,v])=>`${k}:${v}`)))}`
            return jbHost.fetch(url).then(r => r.json())
        }
    }
})

// component('spawn', {
//     type: 'jbm',
//     params: [
//         {id: 'id', as: 'string', mandatory: true},
//         {id: 'projects', as: 'array'},
//         {id: 'init', type: 'action', dynamic: true},
//         {id: 'inspect', as: 'number'},
//         // {id: 'completionServer', as: 'boolean'},
//     ],
//     impl: async (ctx,name,projects,init,inspect) => {
//         jb.log('vscode jbm spawn',{ctx,name})
//         if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
//         const childUri = `${jb.uri}__${name}`
//         // if (jb.webSocket.toRestart.indexOf(name) != -1) {
//         //     if (jb.path(jb.jbm.childJbms[name],'kill'))
//         //       jb.jbm.childJbms[name].kill()
//         //     delete jb.jbm.childJbms[name]
//         //     delete jb.ports[forkUri]
//         //     jb.webSocket.toRestart.splice(indexOf(name),1)
//         // }

//         const args = [
//             ...(inspect ? [`--inspect=${inspect}`] : []),            
//             './node-servlet.js',
//             `-uri:${childUri}`,
//             `-clientUri:${jb.uri}`,
//             `-projects:${projects.join(',')}`,
// //            ...(completionServer ? [`-completionServer:true`] : []),
//             `-spyParam:${jb.spy.spyParam}`]
//         const child = jbHost.child_process.spawn('node', args, {cwd: jbHost.jbReactDir+'/hosts/node'})

//         const command = `node --inspect-brk jb.js ${args.map(x=>`'${x}'`).join(' ')}`
//         jb.vscode.stdout && jb.vscode.log(command)

//         const childDetailsStr = await new Promise(resolve => child.stdout.on('data', data => resolve('' + data)))
//         let childDetails
//         try {
//             childDetails = JSON.parse(childDetailsStr)
//         } catch(e) {
//             jb.logError('jbm spawn can not parse child Conf', {childDetailsStr})
//         }
//         const port = await jb.webSocket.connectFromNodeClient(`ws://localhost:${childDetails.port}`, childDetails.uri,ctx)
//         const jbm = jb.jbm.childJbms[childDetails.uri] = jb.jbm.extendPortToJbmProxy(port)
//         jbm.kill = child.kill
//         jbm.pid = child.pid 
//         await init(ctx.setVar('jbm',jbm))
//         return jbm
//   }
// })

