pluginDsl('jbm')

component('worker', {
  type: 'jbm',
  params: [
      {id: 'id', as: 'string'},
      {id: 'sourceCode', type: 'source-code', defaultValue: treeShakeClient() },
      {id: 'init' , type: 'action<>', dynamic: true },
      {id: 'networkPeer', as: 'boolean', description: 'used for testing' },
  ],    
  impl: (ctx,_id,sourceCode,init,networkPeer) => {
      const id = _id || ctx.vars.groupWorkerId || 'w1'
      const childsOrNet = networkPeer ? jb.jbm.networkPeers : jb.jbm.childJbms
      if (childsOrNet[id]) return childsOrNet[id]
      const workerUri = networkPeer ? id : `${jb.uri}•${id}`
      const parentOrNet = networkPeer ? `jb.jbm.gateway = jb.jbm.networkPeers['${jb.uri}']` : 'jb.parent'
      sourceCode.plugins = jb.utils.unique([...(sourceCode.plugins || []),'remote','tree-shake'])

      const workerCode = `
importScripts(location.origin+'/plugins/loader/jb-loader.js');
jbHost.baseUrl = location.origin || '';

Promise.resolve(jbInit('${workerUri}', ${JSON.stringify(sourceCode)})
.then(jb => {
  globalThis.jb = jb;
  jb.spy.initSpy({spyParam: "${jb.spy.spyParam}"});
  jb.treeShake.codeServerJbm = ${parentOrNet} = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(self,'${jb.uri}'))
  self.postMessage({ $: 'workerReady' })
}))
//# sourceURL=${workerUri}-initJb.js`

      return childsOrNet[id] = {
          uri: workerUri,
          rjbm() {
              if (this._rjbm) return this._rjbm
              const self = this
              return new Promise(resolve => {
                  const worker = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})))
                  worker.addEventListener('message', async function f1(m) {
                      if (m.data.$ == 'workerReady') {
                          if (self._rjbm) {
                              resolve(self._rjbm) // race condition
                          } else {
                              worker.removeEventListener('message',f1)
                              const rjbm = self._rjbm = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(worker,workerUri))
                              rjbm.worker = worker
                              await init(ctx.setVar('jbm',childsOrNet[id]))
                              resolve(rjbm)
                          }
                      }
                  })
              })
          }
      }
  }
})

component('child', {
type: 'jbm',
params: [
  {id: 'id', as: 'string'},
  {id: 'sourceCode', type: 'source-code', defaultValue: treeShakeClient() },
  {id: 'init', type: 'action', dynamic: true}
],
impl: (ctx,_id,sourceCode,init) => {
    const id = _id || ctx.vars.groupWorkerId || 'child1'
    if (jb.jbm.childJbms[id]) return jb.jbm.childJbms[id]
    const childUri = `${jb.uri}•${id}`
    sourceCode.plugins = jb.utils.unique([...(sourceCode.plugins || []),'remote','tree-shake'])

    return jb.jbm.childJbms[id] = {
        uri: childUri,
        async rjbm() {
            if (this._rjbm) return this._rjbm
            const child = this.child = await jbInit(childUri, sourceCode, {multipleInFrame: true})
            child.rjbm = () => this._rjbm
            this._rjbm = initChild(child)
            await init(ctx.setVar('jbm',child))
            return this._rjbm
        }
    }

    function initChild(child) {
        child.spy.initSpy({spyParam: jb.spy.spyParam})
        child.parent = jb
        child.treeShake.codeServerJbm = jb.treeShake.codeServerJbm || jb // TODO: use codeLoaderUri
        child.ports[jb.uri] = {
            from: child.uri, to: jb.uri,
            postMessage: m => 
                jb.net.handleOrRouteMsg(jb.uri,child.uri,jb.ports[child.uri].handler, {from: child.uri, to: jb.uri,...m}),
            onMessage: { addListener: handler => child.ports[jb.uri].handler = handler }, // only one handler
        }
        child.jbm.extendPortToJbmProxy(child.ports[jb.uri])
        jb.ports[child.uri] = {
            from: jb.uri,to: child.uri,
            postMessage: m => 
                child.net.handleOrRouteMsg(child.uri,jb.uri,child.ports[jb.uri].handler , {from: jb.uri, to: child.uri,...m}),
            onMessage: { addListener: handler => jb.ports[child.uri].handler = handler }, // only one handler
        }
        return jb.jbm.extendPortToJbmProxy(jb.ports[child.uri])
    }
  }
})

component('byUri', {
  type: 'jbm',
  params: [
      { id: 'uri', as: 'string', dynamic: true}
  ],
  impl: ({},_uri) => {
      const uri = _uri()
      return findNeighbourJbm(uri) || {
          uri,
          rjbm() {
              this._rjbm = this._rjbm || jb.jbm.extendPortToJbmProxy(remoteRoutingPort(jb.uri, uri),{doNotinitCommandListener: true})
              return this._rjbm
          }
      }

      function remoteRoutingPort(from,to) {
          if (jb.ports[to]) return jb.ports[to]
          const routingPath = calcRoutingPath(from,to)
          if (routingPath.length == 2 && jb.ports[routingPath[1]])
              return jb.ports[routingPath[1]]
          let nextPort = jb.ports[routingPath[1]]
          if (!nextPort && jb.jbm.gateway) {
              routingPath.splice(1,0,jb.jbm.gateway.uri)
              nextPort = jb.jbm.gateway
          }
          if (!nextPort) {
              debugger
              return jb.logError(`routing - can not find next port`,{routingPath, uri: jb.uri, from,to})
          }
  
          const port = {
              from, to,
              postMessage: _m => { 
                  const m = {from, to,routingPath,..._m}
                  jb.log(`remote routing sent from ${from} to ${to}`,{m})
                  nextPort.postMessage(m)
              },
              onMessage: { addListener: handler => nextPort.onMessage.addListener(m => jb.net.handleOrRouteMsg(from,to,handler,m)) },
              onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
          }
          jb.ports[to] = port
          return port
      }

      function calcRoutingPath(from,to) {
          const pp1 = from.split('•'), pp2 = to.split('•')
          const p1 = pp1.map((p,i) => pp1.slice(0,i+1).join('•'))
          const p2 = pp2.map((p,i) => pp2.slice(0,i+1).join('•'))
          let i =0;
          while (p1[i] === p2[i] && i < p1.length) i++;
          const path_to_shared_parent = i ? p1.slice(i-1) : p1.slice(i) // i == 0 means there is no shared parent, so network is used
          return [...path_to_shared_parent.reverse(),...p2.slice(i)]
      }
      function findNeighbourJbm(uri) {
          return [jb, jb.parent, ...Object.values(jb.jbm.childJbms), ...Object.values(jb.jbm.networkPeers)].filter(x=>x).find(x=>x.uri == uri)
      }
  }
})

component('jbm.self', {
  type: 'jbm',
  impl: () => {
      jb.rjbm = jb.rjbm || (() => jb)
      return jb
  }
})

component('parent', {
  type: 'jbm',
  impl: () => jb.parent
})

component('jbm.start', {
  type: 'data<>,action<>',
  params: [ 
      {id: 'jbm', type: 'jbm', mandatory: true}
  ],
  impl: pipe('%$jbm%', '%rjbm()%' ,'%$jbm%',first()) // ctx => ctx.data.rjbm()
})

// component('jbm.terminateChild', {
//     type: 'action<>',
//     params: [
//         {id: 'id', as: 'string'}
//     ],
//     impl: (ctx,id) => jb.jbm.terminateChild(id)
// })

component('workerGroupByKey', {
  type: 'jbm',
  params: [
    {id: 'groupId', as: 'string', description: 'used as prefix', mandatory: true },
    {id: 'genericJbm', type: 'jbm', composite: true, mandatory: true},
    {id: 'key', as: 'string', dynamic: true, mandatory: true, description: 'specialized worker for each key' },
  ],
  impl: () => {} //pipe (Var('groupWorkerId', '%$groupId%-%$key()%'),'%$genericJbm()%')
})