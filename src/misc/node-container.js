jb.extension('nodeContainer', {
    connect: (url,serverUri,ctx) => new Promise( resolve => {
        const socket = new jb.frame.WebSocket(url,'echo-protocol')
        socket.onopen = () => resolve(jb.nodeContainer.portFromBrowserWebSocket(socket,serverUri))
        socket.onerror = err => { jb.logError('websocket error',{err,ctx}); resolve() }
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
    },    
})

jb.component('jbm.nodeContainer', {
  type: 'jbm',
  params: [
    {id: 'modules', as: 'array', dynamic: true},
    {id: 'host', as: 'string', dynamic: true, defaultValue: 'localhost'},
    {id: 'init', type: 'action', dynamic: true}
  ],
  impl: async (ctx,modules,host,init) => {
        const modulesParam = modules.length ? `&modules=${modules().join(',')}` : ''
        const servlet = await jb.frame.fetch(`/?op=createJbm&clientUri=${jb.uri}${modulesParam}&spyParam=${jb.spy.spyParam}`, {mode: 'cors'}).then(r => r.json())
        const port = await jb.nodeContainer.connect(`ws://${host()}:${servlet.port}`,servlet.uri,ctx)
        const remoteNode = jb.jbm.childJbms[servlet.uri] = jb.jbm.extendPortToJbmProxy(port)
        await init(ctx.setVar('jbm',remoteNode))
        return remoteNode
    }
})

