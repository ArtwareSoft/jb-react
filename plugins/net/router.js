
component('viaRouter', {
  type: 'jbm<jbm>',
  params: [
    {id: 'uri', as: 'string'}
  ],
  impl: (ctx, uri) => {
    return jb.jbm.networkPeers[uri] = jb.jbm.networkPeers[uri] || { uri,
          async rjbm() {
            if (this._rjbm) return this._rjbm
            await jb.exec(jbm.start(router()), 'action<>')
            const routerPort = jb.ports.router
            const routingPath = [jb.uri, 'router' , uri]
            if (!routerPort)
                return jb.logError(`viaRouter - router was not initialized`,{ctx})
  
            this._rjbm = this._rjbm || jb.jbm.extendPortToJbmProxy(remoteRoutingPort(jb.uri, uri, routerPort, routingPath))
//                {doNotinitCommandListener: true})
            return this._rjbm
          }
      }

      function remoteRoutingPort(from,to, routerPort, routingPath) {          
          const port = {
              routerPort, routingPath, // for debug
              from, to,
              postMessage: _m => { 
                  const m = {from, to,routingPath,..._m}
                  jb.log(`remote routing sent from ${from} to ${to}`,{m})
                  routerPort.postMessage(m)
              },
              onMessage: { addListener: handler => routerPort.onMessage.addListener(m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
              onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
          }
          jb.ports[to] = port
          return port
      }
  }
})

component('router', {
  type: 'jbm<jbm>',
  params: [
    {id: 'routerWSUrl', as: 'string', defaultValue: 'ws://localhost:8085'},
  ],
  impl: async (ctx,routerWSUrl) => {
        return jb.jbm.networkPeers.router = jb.jbm.networkPeers.router || { uri: 'router',
            async rjbm() {
                if (this._rjbm) return this._rjbm
                const method = 'connectFrom' + (jbHost.WebSocket_WS ? 'VSCodeClient' 
                    : jbHost.WebSocket_Browser ? 'Browser' : 'NodeClient')
                const port = await jb.webSocket[method](`${routerWSUrl}?clientUri=${jb.uri}`, 'router',ctx)
                jb.log(`remote connected to router`,{ctx,routerWSUrl})
            
                this._rjbm = this._rjbm || (jb.ports.router = jb.jbm.extendPortToJbmProxy(port))
                return this._rjbm
            }
        }
    }
})