/* jbm - a virtual jBart machine - can be implemented in same frame/sub frames/workers over the network
interface jbm : {
     uri : string // devtools►logPannel, studio►preview►debugView, ►debugView
     parent : jbm // null means root
     execScript(profile: any) : cb
     createCallbagSource(stripped ctx of cb_source) : cb
     createCalllbagOperator(stripped ctx of cb_operator) : (source => cb)
}
jbm interface can be implemented on the actual jb object or a jbm proxy via port

// port is used to send messages between two jbms
interface port {
     from: uri
     to: uri
     postMessage(m)
     onMessage({addListener(handler(m))})
     onDisconnect({addListener(handler)})
}
implementatios over frame(window,worker), websocket, connection 

Routing is implemented by remoteRoutingPort, first calclating the routing path, and sending to the message hop by hop to the destination.
The routing path is reversed to create response message
*/

var { rx,source,jbm,remote,net } = jb.ns('rx,source,jbm,remote,net')

Object.assign(jb, {
    uri: jb.uri || jb.frame.jbUri,
    ports: {},
    execScript: script => jb.exec(source.any(script)),
    createCallbagSource: ({profile,runCtx}) => new jb.jbCtx(runCtx,{}).run(profile), // must change ctx to current jb to use the right 'run' method
    createCalllbagOperator: ({profile,runCtx}) => new jb.jbCtx(runCtx,{}).run(profile),

    cbHandler: {
        counter: 0,
        map: {},
        newId() { return jb.uri + ':' + (jb.cbHandler.counter++) },
        get(id) { return jb.cbHandler.map[id] },
        getAsPromise(id,t) { 
            return jb.exec(waitFor({check: ()=> jb.cbHandler.map[id], interval: 5, times: 10}))
                .catch(err => jb.logError('cbLookUp - can not find cb',{id, uri: jb.uri}))
                .then(cb => {
                    if (t == 2) jb.cbHandler.removeEntry(id)
                    return cb
                })
        },
        addToLookup(cb) { 
            const id = jb.cbHandler.newId()
            jb.cbHandler.map[id] = cb
            return id 
        },
        removeEntry(ids) {
            jb.delay(1000).then(()=>
                jb.asArray(ids).filter(x=>x).forEach(id => delete jb.cbHandler.map[id]))
        },
    },
    net: {
        reverseRoutingProps(routingMsg) {
            return routingMsg && routingMsg.routingPath && {
                routingPath: [...routingMsg.routingPath.slice(0,-1).reverse(), routingMsg.from],
                from: routingMsg.to,
                to: routingMsg.from,
            }
        },
    },
    jbm: {
        childJbms: {},
        networkPeers: {},
        neighbourJbm: uri => [jb.parent, ...Object.values(jb.jbm.childJbms), ...Object.values(jb.jbm.networkPeers)].filter(x=>x).find(x=>x.uri == uri),
        portToForwardTo: (routingPath, jbUri) => routingPath && jb.ports[routingPath[routingPath.indexOf(jbUri)+1]],
        portFromFrame(frame,to) {
            if (jb.ports[to]) return jb.ports[to]
            const from = jb.uri
            const port = {
                frame, from, to,
                postMessage: m => { 
                    if (m.from != from || m.to != to)
                        jb.log(`remote forward from ${from} to ${to} send ${m.from} to ${m.to}`,{m})
                    else
                        jb.log(`remote sent from ${from} to ${to}`,{m})
                    frame.postMessage({from, to,...m}) 
                },
                onMessage: { addListener: handler => frame.addEventListener('message', _m => {
                    const m = _m.data
                    const arrivedToDest = m.routingPath && m.routingPath.slice(-1)[0] === jb.uri || (m.to == from && m.from == to)
                    if (arrivedToDest) {
                        jb.log(`remote received at ${from} from ${m.from} to ${m.to}`,{m})
                        handler(m)
                    } else {
                        const portToForwardTo = jb.jbm.portToForwardTo(m.routingPath, jb.uri)
                        if (portToForwardTo) {
                            jb.log(`remote gateway at ${from} from ${m.from} to ${m.to} forward to ${portToForwardTo.to}`,{portToForwardTo, m })
                            portToForwardTo.postMessage(m)
                        }
                    }
                })},
                onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
            }
            jb.ports[to] = port
            return port
        },
        extendPortToJbmProxy(port) {
            if (!port.createCalllbagSource) {
                Object.assign(port, {
                    uri: port.to,
                    createCallbagSource(remoteRun) {
                        const cbId = jb.cbHandler.newId()
                        port.postMessage({$:'CB.createSource', remoteRun, cbId })
                        return (t,d) => outboundMsg({cbId,t,d})
                    },
                    createCalllbagOperator(remoteRun) {
                        return source => {
                            const sourceId = jb.cbHandler.addToLookup(source)
                            const cbId = jb.cbHandler.newId()
                            this.postMessage({$:'CB.createOperator', remoteRun, sourceId, cbId })
                            return (t,d) => {
                                if (t == 2) console.log('send 2',cbId,sourceId)
                                outboundMsg({cbId,t,d})
                            }
                        }
                    },
                    execScript(script) {
                        return port.createCallbagSource(script)
                    }
                })
                initCommandListener()
            }
            return port

            function initCommandListener() {
                port.onMessage.addListener(m => {
                    if ((m.$ || '').indexOf('CB.') == 0)
                        handleCBCommnad(m)
                    else if (m.$ == 'CB')
                        inboundMsg(m)
                })
            }

            function outboundMsg({cbId,t,d}) { 
                port.postMessage({$:'CB', cbId,t, d: t == 0 ? jb.cbHandler.addToLookup(d) : d })
            }
            function inboundMsg(m) { 
                const {cbId,t,d} = m
                if (t == 2) jb.cbHandler.removeEntry(cbId)
                return jb.cbHandler.getAsPromise(cbId,t).then(cb=> cb && cb(t, t == 0 ? remoteCB(d,cbId,m) : d)) 
            }
            function remoteCB(cbId, localCbId, routingMsg) { 
                let talkback
                return (t,d) => {
                    if (t==2) jb.cbHandler.removeEntry([localCbId,talkback])
                    port.postMessage({$:'CB', cbId,t, d: t == 0 ? (talkback = jb.cbHandler.addToLookup(d)) : jb.remoteCtx.stripCBVars(d), ...jb.net.reverseRoutingProps(routingMsg) }) 
                }
            }
            function handleCBCommnad(cmd) {
                const {$,sourceId,cbId} = cmd
                const cbElem = jb.remoteCtx.deStrip(cmd.remoteRun)() // actually runs the ctx
                if ($ == 'CB.createSource')
                    jb.cbHandler.map[cbId] = cbElem
                else if ($ == 'CB.createOperator')
                    jb.cbHandler.map[cbId] = cbElem(remoteCB(sourceId, cbId,cmd) )
            }
        },
        pathOfDistFolder() {
            const pathOfDistFolder = jb.path(jb.studio,'studiojb.studio.host.pathOfDistFolder')
            const location = jb.path(jb.studio,'studioWindow.location') || jb.path(jb.frame,'location')
            return pathOfDistFolder && pathOfDistFolder() || location && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
        }    
    }
})

jb.component('jbm.worker', {
    type: 'jbm',
    params: [
        {id: 'id', as: 'string', defaultValue: 'w1' },
        {id: 'libs', as: 'array', defaultValue: ['common','rx','remote'] },
        {id: 'jsFiles', as: 'array' },
        {id: 'networkPeer', as: 'boolean', description: 'used for testing' },
    ],    
    impl: ({},name,libs,jsFiles,networkPeer) => {
        const childsOrNet = networkPeer ? jb.jbm.networkPeers : jb.jbm.childJbms
        if (childsOrNet[name]) return childsOrNet[name]
        const workerUri = networkPeer ? name : `${jb.uri}►${name}`
        const distPath = jb.jbm.pathOfDistFolder()
        const spyParam = ((jb.path(jb.frame,'location.href')||'').match('[?&]spy=([^&]+)') || ['', ''])[1]
        const parentOrNet = networkPeer ? `jbm.networkPeers['${jb.uri}']` : 'parent'
        const workerCode = [
`const jbUri = '${workerUri}'
function jbm_create(libs,uri) {
    return libs.reduce((jb,lib) => jbm_load_lib(jb,lib,uri), {uri})
}
function jbm_load_lib(jbm,lib,prefix) {
    const pre = prefix ? ('!'+prefix+'!') : '';
    importScripts('${distPath}/'+pre+lib+'-lib.js'); 
    jbmFactory[lib](jbm);
    return jbm
}
self.jb = jbm_create('${libs.join(',')}'.split(','),jbUri)`,
...jsFiles.map(path=>`importScripts('${distPath}/${path}.js');`),
`spy = jb.initSpy({spyParam: '${spyParam}'})
jb.${parentOrNet} = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(self,'${jb.uri}'))
`
].join('\n')

        const worker = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})))
        return childsOrNet[name] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(worker,workerUri))
    }
})

jb.component('jbm.child', {
    type: 'jbm',
    params: [
        {id: 'name', as: 'string', mandatory: true},
        {id: 'libs', as: 'array', defaultValue: ['common','rx','remote'] },
    ],    
    impl: ({},name,libs) => {
        if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
        return jb.frame.jbm_create && Promise.resolve(jb.frame.jbm_create(libs,`${jb.uri}►${name}`))
            .then(jbm=>{
                jb.jbm.childJbms[name] = jbm
                jbm.parent = jb
                return jbm
            })
    }
})

jb.component('jbm.byUri', {
    type: 'jbm',
    params: [
        { id: 'uri', as: 'string', dynamic: true}
    ],
    impl: ({},_uri) => {
        const uri = _uri()
        return jb.jbm.neighbourJbm(uri) || jb.jbm.extendPortToJbmProxy(remoteRoutingPort(jb.uri, uri))

        function remoteRoutingPort(from,to) {
            if (jb.ports[to]) return jb.ports[to]
            const routingPath = jb.exec(net.routingPath(from,to))
            if (routingPath.length == 1) {
                if (!jb.ports[routingPath[0]])
                    jb.logError(`routing - can not find port for ${routingPath[0]}`,{uri: jb.uri, from,to,routingPath})
                return jb.ports[routingPath[0]]
            }
            const nextPort = jb.ports[routingPath[0]]
    
            const port = {
                from, to,
                postMessage: m => { 
                    jb.log(`remote routing sent from ${from} to ${to}`,{m})
                    nextPort.postMessage({from, to,routingPath,...m}) 
                },
                onMessage: { addListener: handler => nextPort.onMessage.addListener(m => {
                    const arrivedToDest = m.routingPath && m.routingPath.slice(-1)[0] === jb.uri || (m.to == from && m.from == to)
                    if (arrivedToDest) {
                        jb.log(`remote routing received at ${from} from ${m.from} to ${m.to}`,{m})
                        handler(m)
                    } else if (m.routingPath) {
                        jb.logError('routing port can not be used as gateway',{uri: jb.uri, path: m.routingPath, port: this})
                    }
                })},
                onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
            }
            jb.ports[to] = port
            return port
        }
    }
})

jb.component('net.routingPath', {
    params: [
        { id: 'from', as: 'string' },
        { id: 'to', as: 'string' },
    ],
    impl: (ctx,from,to) => {
        const pp1 = from.split('►'), pp2 = to.split('►')
        const p1 = pp1.map((p,i) => pp1.slice(0,i+1).join('►'))
        const p2 = pp2.map((p,i) => pp2.slice(0,i+1).join('►'))
        let i =0;
        while (p1[i] === p2[i] && i < p1.length) i++;
        return [...p1.slice(i-1,-1).reverse(),...p2.slice(i)]
    }
})

jb.component('net.listSubJBms', {
    type: 'rx',
    category: 'source',
    impl: rx.merge(
        source.data(() => jb.uri),
        rx.pipe(
            source.data(() => Object.values(jb.jbm.childJbms || {})), 
            rx.concatMap(source.remote(net.listSubJBms(),'%%'))
        )
    )
})

jb.component('net.getRootParent', {
    type: 'rx',
    category: 'source',
    impl: source.any(() => jb.parent ? jb.parent.execScript(net.getRootParent()) : jb.uri)
})

jb.component('net.listAll', {
    type: 'rx',
    category: 'source',
    impl: rx.pipe(
        net.getRootParent(),
        rx.concat(
            remote.operator(net.listsubJBms(), jbm.byUri('%%')),
            remote.operator(
                rx.pipe(
                    source.data(() => jb.jbm.networkPeers || []),
                    remote.operator(net.listsubJBms(),'%%')
                ), 
                jbm.byUri('%%')
            )
        )
    )
})

jb.component('jbm.same', {
    type: 'jbm',
    impl: () => jb
})

jb.component('source.remote', {
    type: 'rx',
    macroByValue: true,
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.same() },
    ],
    impl: ({},rx,jbm) => 
        jbm.createCallbagSource(jbm.callbag ? rx : jb.remoteCtx.stripFunction(rx))
})

jb.component('remote.operator', {
    type: 'rx',
    macroByValue: true,
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.same()},
    ],
    impl: ({},rx,jbm) => jbm.createCalllbagOperator(jbm.callbag ? rx : jb.remoteCtx.stripFunction(rx))
})