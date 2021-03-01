/* jbm - a virtual jBart machine - can be implemented in same frame/sub frames/workers over the network
interface jbm : {
     uri : string // devtools►logPanel, studio►preview►debugView, ►debugView
     parent : jbm // null means root
     remoteExec(profile: any, ,{timeout,oneway}) : Promise | void
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

var { rx,source,jbm,remote,net,pipe, aggregate } = jb.ns('rx,source,jbm,remote,net')

jb.execStripedCtx = stripedCtx => jb.remoteCtx.deStrip(stripedCtx)()

Object.assign(jb, {
    uri: jb.uri || jb.frame.jbUri,
    ports: {},
    remoteExec: stripedCtx => Promise.resolve(jb.execStripedCtx(stripedCtx)),
    createCallbagSource: jb.execStripedCtx, 
    createCalllbagOperator: jb.execStripedCtx,

    cbHandler: {
        counter: 0,
        map: {},
        newId() { return jb.uri + ':' + (jb.cbHandler.counter++) },
        get(id) { return jb.cbHandler.map[id] },
        getAsPromise(id,t) { 
            return jb.exec(waitFor({check: ()=> jb.cbHandler.map[id], interval: 5, times: 10}))
                .catch(err => jb.logError('cbLookUp - can not find cb',{id, in: jb.uri}))
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
        removeEntry(ids,m) {
            jb.log(`remote remove cb handlers at ${jb.uri}`,{ids,m})
            jb.delay(1000).then(()=>
                jb.asArray(ids).filter(x=>x).forEach(id => delete jb.cbHandler.map[id]))
        },
    },
    net: {
        reverseRoutingProps(routingMsg) {
            if (!routingMsg) return
            const rPath = routingMsg.routingPath && {
                routingPath: routingMsg.routingPath.slice(0).reverse(),
                from: routingMsg.to,
                to: routingMsg.from,
                $disableLog: jb.path(routingMsg,'remoteRun.vars.$disableLog')
            }
            const diableLog = jb.path(routingMsg,'remoteRun.vars.$disableLog') && {$disableLog: true}
            return { ...rPath, ...diableLog}
        },
        handleOrRouteMsg(from,to,handler,m, {blockContentScriptLoop} = {}) {
//            jb.log(`remote handle or route at ${from}`,{m})
            if (blockContentScriptLoop && m.routingPath && m.routingPath.join(',').indexOf([from,to].join(',')) != -1) return
            const arrivedToDest = m.routingPath && m.routingPath.slice(-1)[0] === jb.uri || (m.to == from && m.from == to)
            if (arrivedToDest) {
                jb.log(`remote received at ${from} from ${m.from} to ${m.to}`,{m})
                handler && handler(m)
            } else if (m.routingPath) {
                const path = m.routingPath
                const indexOfNextPort = path.indexOf(jb.uri)+1
                let nextPort = indexOfNextPort && jb.ports[path[indexOfNextPort]]
                if (!nextPort && jb.jbm.gateway) {
                    path.splice(path.indexOf(jb.uri),0,jb.jbm.gateway.uri)
                    nextPort = jb.jbm.gateway
                    jb.log(`remote gateway injected to routingPath at ${from} from ${m.from} to ${m.to} forward to ${nextPort.to}`,{nextPort, m })
                }
                if (!nextPort)
                    return jb.logError(`remote - no destination found and no gateway at ${from} from ${m.from} to ${m.to}`,{ m })
                jb.log(`remote forward at ${from} from ${m.from} to ${m.to} forward to ${nextPort.to}`,{nextPort, m })
                nextPort.postMessage(m)
            }            
        }
    },
    jbm: {
        childJbms: {},
        networkPeers: {},
        portFromFrame(frame,to,options) {
            if (jb.ports[to]) return jb.ports[to]
            const from = jb.uri
            const port = {
                frame, from, to,
                postMessage: _m => {
                    const m = {from, to,..._m}
                    jb.log(`remote sent from ${from} to ${to}`,{m})
                    frame.postMessage(m) 
                },
                onMessage: { addListener: handler => frame.addEventListener('message', m => jb.net.handleOrRouteMsg(from,to,handler,m.data,options)) },
                onDisconnect: { addListener: handler => { port.disconnectHandler = handler} }
            }
            jb.ports[to] = port
            return port
        },
        extendPortToJbmProxy(port,{doNotinitCommandListener} = {}) {
            if (port && !port.createCalllbagSource) {
                Object.assign(port, {
                    uri: port.to,
                    createCallbagSource(remoteRun) {
                        const cbId = jb.cbHandler.newId()
                        port.postMessage({$:'CB.createSource', remoteRun, cbId })
                        return (t,d) => outboundMsg({cbId,t,d})
                    },
                    createCalllbagOperator(remoteRun) {
                        return source => {
                            const sourceId = jb.cbHandler.addToLookup(Object.assign(source,{remoteRun}))
                            const cbId = jb.cbHandler.newId()
                            port.postMessage({$:'CB.createOperator', remoteRun, sourceId, cbId })
                            return (t,d) => {
                                if (t == 2) console.log('send 2',cbId,sourceId)
                                outboundMsg({cbId,t,d})
                            }
                        }
                    },
                    remoteExec(remoteRun, {oneway, timeout = 3000, isAction} = {}) {
                        if (oneway)
                            return port.postMessage({$:'CB.execOneWay', remoteRun, timeout })
                        return new Promise((resolve,reject) => {
                            const handlers = jb.cbHandler.map
                            const cbId = jb.cbHandler.newId()
                            const timer = setTimeout(() => {
                                const err = { type: 'error', desc: 'remote exec timeout', remoteRun, timeout }
                                jb.logError('remote exec timeout',err)
                                handlers[cbId] && reject(err)
                            }, timeout)
                            handlers[cbId] = {resolve,reject,remoteRun, timer}
                            port.postMessage({$:'CB.exec', remoteRun, cbId, isAction, timeout })
                        })
                    }
                })
                if (!doNotinitCommandListener)
                    initCommandListener()
            }
            return port

            function initCommandListener() {
                port.onMessage.addListener(m => {
                    if ((m.$ || '').indexOf('CB.') == 0)
                        handleCBCommnad(m)
                    else if (m.$ == 'CB')
                        inboundMsg(m)
                    else if (m.$ == 'execResult')
                        inboundExecResult(m)
                })
            }

            function outboundMsg({cbId,t,d}) { 
                port.postMessage({$:'CB', cbId,t, d: t == 0 ? jb.cbHandler.addToLookup(d) : d })
            }
            function inboundMsg(m) { 
                const {cbId,t,d} = m
                if (t == 2) jb.cbHandler.removeEntry(cbId,m)
                return jb.cbHandler.getAsPromise(cbId,t).then(cb=> cb && cb(t, t == 0 ? remoteCB(d,cbId,m) : d)) 
            }
            function inboundExecResult(m) { 
                jb.cbHandler.getAsPromise(m.cbId).then(h=>{
                    clearTimeout(h.timer)
                    if (m.type == 'error') {
                        jb.logError('remote remoteExec', {m, h})
                        h.reject(m)
                    } else {
                        h.resolve(m.result)
                    }
                })
                jb.cbHandler.removeEntry(m.cbId,m)
            }            
            function remoteCB(cbId, localCbId, routingMsg) { 
                let talkback
                return (t,d) => {
                    if (t==2) jb.cbHandler.removeEntry([localCbId,talkback],routingMsg)
                    port.postMessage({$:'CB', cbId,t, d: t == 0 ? (talkback = jb.cbHandler.addToLookup(d)) : jb.remoteCtx.stripCBVars(d), ...jb.net.reverseRoutingProps(routingMsg) }) 
                }
            }
            function handleCBCommnad(cmd) {
                const {$,sourceId,cbId,isAction} = cmd
                Promise.resolve(jb.remoteCtx.deStrip(cmd.remoteRun)()).then( result => {
                    if ($ == 'CB.createSource' && typeof result == 'function')
                        jb.cbHandler.map[cbId] = result
                    else if ($ == 'CB.createOperator' && typeof result == 'function')
                        jb.cbHandler.map[cbId] = result(remoteCB(sourceId, cbId,cmd) )
                    else if ($ == 'CB.exec')
                        port.postMessage({$:'execResult', cbId, result: isAction ? {} : jb.remoteCtx.stripData(result) , ...jb.net.reverseRoutingProps(cmd) })
                }).catch(err=> $ == 'CB.exec' && 
                    port.postMessage({$:'execResult', cbId, result: { type: 'error', err}, ...jb.net.reverseRoutingProps(cmd) }))
            }
        },
        pathOfDistFolder() {
            const pathOfDistFolder = jb.path(jb.studio,'studiojb.studio.host.pathOfDistFolder')
            const location = jb.path(jb.studio,'studioWindow.location') || jb.path(jb.frame,'location')
            return pathOfDistFolder && pathOfDistFolder() || location && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
        },
        initDevToolsDebugge() {
            if (self.jbRunningTests && !self.jbSingleTest) return
            if (!jb.jbm.networkPeers['devtools']) {
                jb.jbm.connectToPanel = panelUri => new jb.jbCtx().setVar('$disableLog',true).run(remote.action({
                        action: {$: 'jbm.connectToPanel', panelUri}, 
                        jbm: jbm.byUri('devtools'),
                        oneway: true
                    })) // called directly by initPanel
                jb.jbm.networkPeers['devtools'] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(self,'devtools',{blockContentScriptLoop: true}))
                self.postMessage({initDevToolsPeerOnDebugge: {uri: jb.uri, distPath: jb.jbm.pathOfDistFolder(), spyParam: jb.path(jb,'spy.spyParam')}}, '*')
            }
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
        const baseUrl = jb.path(jb.frame,'location.origin') || jb.baseUrl || ''
        const parentOrNet = networkPeer ? `jb.jbm.gateway = jb.jbm.networkPeers['${jb.uri}']` : 'jb.parent'
        const settings = { uri: workerUri, libs: libs.join(','), baseUrl, distPath, jsFiles }
        const jbObj = { uri: workerUri, baseUrl, distPath }
        const jb_loader_code = [jb_dynamicLoad.toString(),jb_loadProject.toString(),jbm_create.toString(),
            jb_modules ? `self.jb_modules= ${JSON.stringify(jb_modules)}` : ''
        ].join(';\n\n')
        const workerCode = `
${jb_loader_code};
jb = ${JSON.stringify(jbObj)}
jb_loadProject(${JSON.stringify(settings)}).then(() => {
    self.spy = jb.initSpy({spyParam: '${spyParam}'})
    self.${parentOrNet} = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(self,'${jb.uri}'))
    console.log('worker loaded')
    postMessage('loaded')
    self.loaded = true
})`
        const worker = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})))
        // wait for worker jbm to load
        const promise = new Promise(resolve => jb.exec(rx.pipe(
            source.event('message', () =>worker),
            rx.take(1),
            sink.action(() => resolve(childsOrNet[name] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(worker,workerUri))))
        )))
        promise.uri = workerUri
        return promise
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
        const childUri = `${jb.uri}►${name}`
        const res = jb.frame.jbm_create && Promise.resolve(jb.frame.jbm_create(libs, { loadFromDist: true, uri: childUri, distPath: jb.distPath}))
            .then(child => {
                jb.jbm.childJbms[name] = child
                child.parent = jb
                child.ports[jb.uri] = {
                    from: child.uri, to: jb.uri,
                    postMessage: m => jb.net.handleOrRouteMsg(jb.uri,child.uri,jb.ports[child.uri].handler,m),
                    onMessage: { addListener: handler => child.ports[jb.uri].handler = handler }, // only one handler
                }
                child.jbm.extendPortToJbmProxy(child.ports[jb.uri])
                jb.ports[child.uri] = {
                    from: jb.uri,to: child.uri,
                    postMessage: m => 
                        child.net.handleOrRouteMsg(child.uri,jb.uri,child.ports[jb.uri].handler ,m),
                    onMessage: { addListener: handler => jb.ports[child.uri].handler = handler }, // only one handler
                }
                jb.jbm.extendPortToJbmProxy(jb.ports[child.uri])
                jb.spy && child.initSpy({spyParam: jb.spy.spyParam})
                return child
            })
        res.uri = childUri
        return res
    }
})

jb.component('jbm.byUri', {
    type: 'jbm',
    params: [
        { id: 'uri', as: 'string', dynamic: true}
    ],
    impl: ({},_uri) => {
        const uri = _uri()
        if (uri == jb.uri) return jb
        return calcNeighbourJbm(uri) || jb.jbm.extendPortToJbmProxy(remoteRoutingPort(jb.uri, uri),{doNotinitCommandListener: true})

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
            if (!nextPort)
                return jb.logError(`routing - can not find next port`,{routingPath, uri: jb.uri, from,to})
    
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
            const pp1 = from.split('►'), pp2 = to.split('►')
            const p1 = pp1.map((p,i) => pp1.slice(0,i+1).join('►'))
            const p2 = pp2.map((p,i) => pp2.slice(0,i+1).join('►'))
            let i =0;
            while (p1[i] === p2[i] && i < p1.length) i++;
            const path_to_shared_parent = i ? p1.slice(i-1) : p1.slice(i) // i == 0 means there is no shared parent, so network is used
            return [...path_to_shared_parent.reverse(),...p2.slice(i)]
        }
        function calcNeighbourJbm(uri) {
            return [jb.parent, ...Object.values(jb.jbm.childJbms), ...Object.values(jb.jbm.networkPeers)].filter(x=>x).find(x=>x.uri == uri)
        }

    }
})

jb.component('jbm.same', {
    type: 'jbm',
    impl: () => jb
})

jb.component('jbm.vDebugger', {
    type: 'jbm',
    impl: ctx => Promise.resolve(ctx.run(jbm.child('vDebugger',['vDebugger']),)).then(jbm=>{
        jbm.studio.initLocalCompsRefHandler(jbm.studio.compsRefOfjbm(jbm.parent))
        return jbm
    })
})
