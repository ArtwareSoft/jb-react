jb.extension('nodeContainer', {
    initExtension() { return { toRestart: [] } },
    connectFromBrowser: (url,serverUri,ctx) => new Promise( resolve => {
        const socket = new jb.frame.WebSocket(url,'echo-protocol')
        socket.onopen = () => resolve(jb.nodeContainer.portFromBrowserWebSocket(socket,serverUri))
        socket.onerror = err => { jb.logError('websocket error',{err,ctx}); resolve() }
    }),
    connectFromNodeClient: (url,serverUri,ctx) => new Promise( resolve => {
        const client = new (globalThis.vsWS || jb.frame.require('websocket')).client()
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
    connectFromTcpClient: (host,port,serverUri,ctx) => new Promise( resolve => {
        const client = new vsNet.Socket()
        const socket = client.connect(port, host, () => 
                resolve(jb.nodeContainer.portFromTcpSocket(socket,serverUri)))
        socket.on('error', err => {jb.logError('websocket client - connection failed',{ctx,err}); resolve() })
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
    portFromTcpSocket(socket,to,options) {
        if (jb.ports[to]) return jb.ports[to]
        const from = jb.uri
        const port = {
            socket, from, to,
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`remote sent from ${from} to ${to}`,{m})
                socket.write(JSON.stringify(m))
            },
            onMessage: { addListener: handler => socket.on('data', m => jb.net.handleOrRouteMsg(from,to,handler,JSON.parse(m.toString()),options)) },
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
    async spawnServlet() {
        const params = ['clientUri','modules','treeShake','spyParam']
        const servlet = child.spawn('node',[
          ...(getURLParam(req,'inspect') ? [`--inspect=${getURLParam(req,'inspect')}`] : []),
          './node-servlet.js',
          ...params.map(p=>getURLParam(req,p) && `-${p}:${getURLParam(req,p)}`).filter(x=>x)],{cwd: 'hosts/node'})
        res.setHeader('Content-Type', 'application/json; charset=utf8')
        servlet.stdout.on('data', data => res.end(data))        
    }    
})

jb.component('jbm.nodeContainer', {
  type: 'jbm',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'projects', as: 'array'},
    {id: 'host', as: 'string', dynamic: true, defaultValue: 'localhost'},
    {id: 'init', type: 'action', dynamic: true},
    {id: 'inspect', as: 'number'},
    {id: 'completionServer', as: 'boolean'},
    {id: 'urlBase', as: 'string' }
  ],
  impl: async (ctx,name,projects,host,init,inspect,completionServer,urlBase) => {
        jb.log('vscode jbm nodeContainer',{ctx,name})
        if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
        if (jb.nodeContainer.toRestart.indexOf(name) != -1) {
            jb.jbm.childJbms[name].remoteExec(jb.remoteCtx.stripJS(() => process.exit(0)), { oneway: true} )
            delete jb.jbm.childJbms[name]
            delete jb.ports[forkUri]
            jb.nodeContainer.toRestart.splice(indexOf(name),1)
        }
        const args = [
            ...(inspect ? [`-inspect=${inspect}`] : []),
            ...(name ? [`-uri:${jb.uri}__${name}`] : []),
            `-clientUri:${jb.uri}`,
            `-projects:${projects.join(',')}`,
            ...(completionServer ? [`-completionServer:true`] : []),
            ...(globalThis.vsFetch ? [`-tcp:true`] : []),
            `-spyParam:${jb.spy.spyParam}`]

        let servlet = await startServlet(args)
        if (!servlet.uri && args[0].indexOf('inspect') != -1) // inspect may cause problems
            servlet = await startServlet(args.slice(1))
        if (!servlet.uri)
            return jb.logError('jbm nodeContainer bad response from server',{ctx, servlet})
        
        const port = await (globalThis.vsFetch ? jb.nodeContainer.connectFromTcpClient(host(),servlet.port,servlet.uri,ctx)
            : jb.nodeContainer.connectFromBrowser(`ws://${host()}:${servlet.port}`,servlet.uri,ctx))
        const jbm = jb.jbm.childJbms[name] = jb.jbm.extendPortToJbmProxy(port)
        await init(ctx.setVar('jbm',jbm))
        return jbm

        function startServlet(args) {
            const url = `${urlBase}/?op=createJbm${args.map(x=>`${x.replace(/:/,'=').replace(/^-/,'&')}`).join('')}`
            if (globalThis.vsHttp)
                return jb.vscode.fetch(url)
            return jb.frame.fetch(url, {mode: 'cors'}).then(r => r.json())
        }
    }
})

jb.component('jbm.spawn', {
    type: 'jbm',
    params: [
        {id: 'id', as: 'string', mandatory: true},
        {id: 'projects', as: 'array'},
        {id: 'init', type: 'action', dynamic: true},
        {id: 'inspect', as: 'number'},
        {id: 'completionServer', as: 'boolean'},
    ],
    impl: async (ctx,name,projects,init,inspect,completionServer) => {
        jb.log('vscode jbm spawn',{ctx,name})
        if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
        const childUri = `${jb.uri}__${name}`
        if (jb.nodeContainer.toRestart.indexOf(name) != -1) {
            if (jb.path(jb.jbm.childJbms[name],'kill'))
              jb.jbm.childJbms[name].kill()
            delete jb.jbm.childJbms[name]
            delete jb.ports[forkUri]
            jb.nodeContainer.toRestart.splice(indexOf(name),1)
        }

        const args = [
            ...(inspect ? [`--inspect=${inspect}`] : []),            
            './node-servlet.js',
            `-uri:${childUri}`,
            `-clientUri:${jb.uri}`,
            `-projects:${projects.join(',')}`,
            ...(completionServer ? [`-completionServer:true`] : []),
            `-spyParam:${jb.spy.spyParam}`]
        const child = (globalThis.vsChild || require('child_process')).spawn('node', args, {cwd: globalThis.jbBaseUrl+'/hosts/node'})

        const command = `node --inspect-brk jb.js ${args.map(x=>`'${x}'`).join(' ')}`
        jb.vscode.stdout && jb.vscode.stdout.appendLine(command)

        const childConfStr = await new Promise(resolve => child.stdout.on('data', data => resolve('' + data)))
        let childConf
        try {
            childConf = JSON.parse(childConfStr)
        } catch(e) {
            jb.logError('jbm spawn can not parse child Conf', {childConfStr})
        }
        const port = await jb.nodeContainer.connectFromNodeClient(`ws://localhost:${childConf.port}`, childConf.uri,ctx)
        const jbm = jb.jbm.childJbms[childConf.uri] = jb.jbm.extendPortToJbmProxy(port)
        jbm.kill = child.kill
        jbm.pid = child.pid 
        await init(ctx.setVar('jbm',jbm))
        return jbm
  }
})

