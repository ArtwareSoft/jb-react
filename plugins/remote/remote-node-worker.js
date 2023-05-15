jb.dsl('jbm')

jb.extension('nodeContainer', {
    initExtension() { return { toRestart: [], servers: {} } },
    connectFromBrowser: (url,serverUri,ctx) => new Promise( resolve => {
        const socket = new jbHost.WebSocket_Browser(url,'echo-protocol')
        socket.onopen = () => resolve(jb.nodeContainer.portFromBrowserWebSocket(socket,serverUri))
        socket.onerror = err => { jb.logError('websocket error',{err,ctx}); resolve() }
    }),
    connectFromVSCodeClient: (url,serverUri,ctx) => new Promise( resolve => {
        const client = new jbHost.WebSocket_WS(url)
        client.on('error', err => {jb.logError('websocket client - connection failed',{ctx,err}); resolve() })
        client.on('open', () => resolve(jb.nodeContainer.portFromVSCodeWebSocket(client,serverUri)))
    }),
    connectFromNodeClient: (url,serverUri,ctx) => new Promise( resolve => {
        const client = new jb.frame.require('websocket').client()
        client.on('connectFailed', err => {jb.logError('websocket client - connection failed',{ctx,err}); resolve() })
        client.on('connect', socket => {
          if (!socket.connected) {
            jb.logError('websocket client not connected',{ctx})
            resolve()
          } else {
            resolve(jb.nodeContainer.portFromNodeWebSocket(socket,serverUri))
          }
        })
        client.connect(url, 'echo-protocol')  
    }),
    portFromVSCodeWebSocket(socket,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            socket, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`remote sent from ${from} to ${to}`,{m})
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
                jb.log(`remote sent from ${from} to ${to}`,{m})
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
                jb.log(`remote sent from ${from} to ${to}`,{m})
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
                jb.log(`remote sent from ${from} to ${to}`,{m})
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
    {id: 'id', as: 'string', mandatory: true},
    {id: 'projects', as: 'array'},
    {id: 'host', as: 'string', dynamic: true, defaultValue: 'localhost'},
    {id: 'init', type: 'action', dynamic: true},
    {id: 'loadTests', as: 'boolean'},
    {id: 'inspect', as: 'number'},
    {id: 'studioServerUrl', as: 'string'},
    {id: 'spyParam', as: 'string'},
    {id: 'restartSource', type: 'rx', description: 'rx event to restrat'}
  ],
  impl: async (ctx,name,projects,host,init,loadTests,inspect,studioServerUrl,spyParam) => {
        jb.log('vscode remote jbm nodeContainer',{ctx,name})
        const servletUri = `${jb.uri}__${name}`
        const restart = (jb.nodeContainer.toRestart||[]).indexOf(name)
        if (jb.jbm.childJbms[name] && restart == -1) return jb.jbm.childJbms[name]
        if (restart != -1) {
            jb.jbm.childJbms[name].remoteExec(jb.remoteCtx.stripJS(() => process.exit(0)), { oneway: true} )
            delete jb.jbm.childJbms[name]
            delete jb.ports[servletUri]
            jb.nodeContainer.toRestart.splice(restart,1)
        }
        const args = [
            ...(inspect ? [`-inspect=${inspect}`] : []),
            ...(name ? [`-uri:${servletUri}`] : []),
            `-loadTests:${loadTests}`,
            `-clientUri:${jb.uri}`,
            `-projects:${projects.join(',')}`,
            `-spyParam:${spyParam}`]

        let childDetails = await startServlet(args)
        if (!childDetails.uri && args[0].indexOf('inspect') != -1) // inspect may cause problems
            childDetails = await startServlet(args.slice(1))
        jb.log('vscode remote jbm details',{ctx,childDetails})

        if (!childDetails.uri)
            return jb.logError('jbm nodeContainer bad response from server',{ctx, childDetails})
        
        const method = 'connectFrom' + (jbHost.WebSocket_WS ? 'VSCodeClient' 
            : jbHost.WebSocket_Browser ? 'Browser' : 'NodeClient')
        const port = await jb.nodeContainer[method](`ws://${host()}:${childDetails.port}`,childDetails.uri,ctx)
        jb.log('vscode remote connected to port',{ctx,childDetails})

        const jbm = jb.jbm.childJbms[name] = jb.ports[servletUri] = jb.jbm.extendPortToJbmProxy(port)
        jbm.pid = childDetails.pid
        await init(ctx.setVar('jbm',jbm))
        return jbm

        function startServlet(args) {
            const url = `${studioServerUrl}/?op=createJbm${args.map(x=>`${x.replace(/:/,'=').replace(/^-/,'&')}`).join('')}`
            return jbHost.fetch(url).then(r => r.json())
//            return jb.frame.fetch(url, {mode: 'cors'}).then(r => r.json())
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
//         // if (jb.nodeContainer.toRestart.indexOf(name) != -1) {
//         //     if (jb.path(jb.jbm.childJbms[name],'kill'))
//         //       jb.jbm.childJbms[name].kill()
//         //     delete jb.jbm.childJbms[name]
//         //     delete jb.ports[forkUri]
//         //     jb.nodeContainer.toRestart.splice(indexOf(name),1)
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
//         jb.vscode.stdout && jb.vscode.stdout.appendLine(command)

//         const childDetailsStr = await new Promise(resolve => child.stdout.on('data', data => resolve('' + data)))
//         let childDetails
//         try {
//             childDetails = JSON.parse(childDetailsStr)
//         } catch(e) {
//             jb.logError('jbm spawn can not parse child Conf', {childDetailsStr})
//         }
//         const port = await jb.nodeContainer.connectFromNodeClient(`ws://localhost:${childDetails.port}`, childDetails.uri,ctx)
//         const jbm = jb.jbm.childJbms[childDetails.uri] = jb.jbm.extendPortToJbmProxy(port)
//         jbm.kill = child.kill
//         jbm.pid = child.pid 
//         await init(ctx.setVar('jbm',jbm))
//         return jbm
//   }
// })

