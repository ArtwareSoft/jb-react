
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
    },
})    

extension('jbm', 'worker', {
    portFromWorkerToParent(parentPort,from,to) { return {
        parentPort, from, to,
        postMessage: _m => {
            const m = {from, to,..._m}
            jb.log(`transmit remote sent from ${from} to ${to}`,{m})
            parentPort.postMessage(m) 
        },
        onMessage: { addListener: handler => parentPort.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
    }},
    portFromParentToWorker(worker,from,to) { return {
        worker, from, to,
        postMessage: _m => {
            const m = {from, to,..._m}
            jb.log(`transmit remote sent from ${from} to ${to}`,{m})
            worker.postMessage(m) 
        },
        onMessage: { addListener: handler => worker.on('message', m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
    }},    
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
        const vscode = jbHost.isVscode ? 'vscode ' : ''
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

component('nodeWorker', {
  type: 'jbm',
  params: [
    {id: 'id', as: 'string'},
    {id: 'sourceCode', type: 'source-code<loader>', byName: true, defaultValue: treeShakeClientWithPlugins()},
    {id: 'init', type: 'action<>', dynamic: true},
    {id: 'usePackedCode', as: 'boolean', type: 'boolean<>'}
  ],
  impl: async (ctx,_id,sourceCode,init,usePackedCode) => {
    const id = (_id || 'w1').replace(/-/g,'__')
    if (jb.jbm.childJbms[id]) return jb.jbm.childJbms[id]
    if (!jbHost.isNode || jbHost.isVscode)
        return jb.logError(`nodeWorker ${id} can only run on pure nodejs`, {ctx})

    const { Worker } = require('worker_threads')
    const workerUri = `${jb.uri}•${id}`
    sourceCode.plugins = jb.utils.unique([...(sourceCode.plugins || []),'remote-jbm','tree-shake'])
    const baseDir = jbHost.jbReactDir
    const initJb = usePackedCode ? `jbLoadPacked({uri:'${workerUri}'})` : `Promise.resolve(jbInit('${workerUri}', ${JSON.stringify(sourceCode)}))`

    const workerCode = `
const fs = require('fs')
const { jbHost } = require('${jbHost.jbReactDir}/hosts/node/node-host.js')
const inspector = require('inspector')
const { parentPort } = require('worker_threads')
// inspector.open()
// inspector.waitForDebugger()

const { jbInit } = require('${jbHost.jbReactDir}/plugins/loader/jb-loader.js')

${initJb}.then(jb => {
globalThis.jb = jb;
jb.spy.initSpy({spyParam: "${jb.spy.spyParam}"});
jb.treeShake.codeServerJbm = jb.parent = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromWorkerToParent(parentPort,'${workerUri}','${jb.uri}'))
parentPort.postMessage({ $: 'workerReady' })
 })
//# sourceURL=${workerUri}-initJb.js`

    return jb.jbm.childJbms[id] = {
        uri: workerUri,
        rjbm() {
            if (this._rjbm) return this._rjbm
            if (this.waitingForPromise) return this.waitingForPromise
            const self = this
            return this.waitingForPromise = new Promise(resolve => {
              debugger
              const worker = new Worker(workerCode, { eval: true, execArgv: ["--inspect"] })
              worker.on('message', async function f1(m) {
                debugger
                if (m.$ == 'workerReady') {
                    if (self._rjbm) {
                        resolve(self._rjbm) // race condition
                    } else {
                        worker.off('message',f1)
                        const rjbm = self._rjbm = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromParentToWorker(worker,jb.uri,workerUri))
                        rjbm.worker = worker
                        await init(ctx.setVar('jbm',jb.jbm.childJbms[id]))
                        resolve(rjbm)
                    }
                }
              })
        })
      }
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

