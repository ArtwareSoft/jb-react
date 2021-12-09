/* jbm - a virtual jBart machine - can be implemented in same frame/sub frames/workers over the network
interface jbm : {
     uri : string // devtools•logPanel, studio•preview•debugView, •debugView
     parent : jbm // null means root
     remoteExec(profile: any ,{timeout,oneway}) : Promise | void
     createCallbagSource(stripped ctx of cb_source) : cb
     createCallbagOperator(stripped ctx of cb_operator, {profText}) : (source => cb)
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

jb.extension('cbHandler', {
    initExtension() {
        return { counter: 0, map: {} }
    },
    newId: () => jb.uri + ':' + (jb.cbHandler.counter++),
    get: id => jb.cbHandler.map[id],
    getAsPromise(id,t) { 
        return jb.exec({$: 'waitFor', check: ()=> jb.cbHandler.map[id], interval: 5, times: 10})
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
        jb.delay(10).then(()=> // TODO: BUGGY delay - not sure why the delay is needed - test: remoteTest.workerByUri
            jb.asArray(ids).filter(x=>x).forEach(id => delete jb.cbHandler.map[id])
        )
    },
    terminate() {
        const keys = Object.keys(jb.cbHandler.map)
        keys.forEach(id => typeof jb.cbHandler.map[id] == 'function' && jb.cbHandler.map[id](2)) // close connetions - may cause problems in tests
        keys.forEach(id => delete jb.cbHandler.map[id])
    }
})

jb.extension('net', {
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
        if (jb.frame.terminated) {
            jb.log(`remote messsage arrived to terminated ${from}`,{from,to, m})
            return
        }
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
})

jb.extension('jbm', {
    initExtension() {
        Object.assign(jb, {
            uri: jb.uri || jb.frame.jbUri,
            ports: {},
            remoteExec: sctx => jb.treeShake.bringMissingCode(sctx).then(()=>jb.remoteCtx.deStrip(sctx)()),
            createCallbagSource: sctx => jb.remoteCtx.deStrip(sctx)(),
            createCallbagOperator: sctx => jb.remoteCtx.deStrip(sctx)(),
        })
        return { childJbms: {}, networkPeers: {}, notifyChildReady: {} }
    },
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
                createCallbagOperator(remoteRun) {
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
                        jb.log('remote exec request',{remoteRun,port,oneway,cbId})
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
                jb.log('remote command listener',{m})
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
                if (!h) 
                    return jb.logError('remote exec result arrived with no handler',{cbId:m.cbId, m})
                clearTimeout(h.timer)
                if (m.type == 'error') {
                    jb.logError('remote remoteExec', {m, h})
                    h.reject(m)
                } else {
                    h.resolve(m.result)
                }
                jb.cbHandler.removeEntry(m.cbId,m)
            })
        }            
        function remoteCB(cbId, localCbId, routingMsg) { 
            let talkback
            return (t,d) => {
                if (t==2) jb.cbHandler.removeEntry([localCbId,talkback],routingMsg)
                port.postMessage({$:'CB', cbId,t, d: t == 0 ? (talkback = jb.cbHandler.addToLookup(d)) : jb.remoteCtx.stripCBVars(d), ...jb.net.reverseRoutingProps(routingMsg) }) 
            }
        }
        async function handleCBCommnad(cmd) {
            const {$,sourceId,cbId,isAction} = cmd
            try {
                if (Object.keys(jb.treeShake.loadingCode).length) {
                    jb.log('remote waiting for loadingCode',{cmd, loading: Object.keys(jb.treeShake.loadingCode)})
                    await jb.exec({$: 'waitFor', timeout: 100, check: () => !Object.keys(jb.treeShake.loadingCode).length })
                }
                await jb.treeShake.bringMissingCode(cmd.remoteRun)
                const result = await jb.remoteCtx.deStrip(cmd.remoteRun)()
                if ($ == 'CB.createSource' && typeof result == 'function')
                    jb.cbHandler.map[cbId] = result
                else if ($ == 'CB.createOperator' && typeof result == 'function')
                    jb.cbHandler.map[cbId] = result(remoteCB(sourceId, cbId,cmd) )
                else if ($ == 'CB.exec')
                    port.postMessage({$:'execResult', cbId, result: isAction ? {} : jb.remoteCtx.stripData(result) , ...jb.net.reverseRoutingProps(cmd) })
            } catch(err) { 
                $ == 'CB.exec' && port.postMessage({$:'execResult', cbId, result: { type: 'error', err}, ...jb.net.reverseRoutingProps(cmd) })
            }
        }
    },
    pathOfDistFolder() {
        const pathOfDistFolder = jb.path(jb.studio,'studiojb.studio.host.pathOfDistFolder')
        const location = jb.path(jb.studio,'studioWindow.location') || jb.path(jb.frame,'location')
        return pathOfDistFolder && pathOfDistFolder() || location && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
    },
    initDevToolsDebugge() {
        if (jb.test && jb.test.runningTests && !jb.test.singleTest) 
            return jb.logError('jbart devtools is disables for multiple tests')
        if (!jb.jbm.networkPeers['devtools']) {
            jb.jbm.connectToPanel = panelUri => new jb.core.jbCtx().setVar('$disableLog',true).run(remote.action({
                    action: {$: 'jbm.connectToPanel', panelUri}, 
                    jbm: jbm.byUri('devtools'),
                    oneway: true
                })) // called directly by initPanel
            jb.jbm.networkPeers['devtools'] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(globalThis,'devtools',{blockContentScriptLoop: true}))
            globalThis.postMessage({initDevToolsPeerOnDebugge: {uri: jb.uri, distPath: jb.jbm.pathOfDistFolder(), spyParam: jb.path(jb,'spy.spyParam')}}, '*')
        }
    },
    terminateChild(id) {
        if (!jb.jbm.childJbms[id]) return
        const childJbm = jb.jbm.childJbms[id]
        childJbm.terminated = true
        jb.log('remote terminate child', {id})
        Object.keys(jb.ports).filter(x=>x.indexOf(childJbm.uri) == 0)
            .forEach(uri=>delete jb.ports[uri])
        delete jb.jbm.childJbms[id]
        childJbm.remoteExec(jb.remoteCtx.stripJS(() => {jb.cbHandler.terminate(); terminated = true; if (typeof close1 == 'function') close() } ), {oneway: true} )
    },
    terminateAllChildren() {
        Object.keys(jb.jbm.childJbms).forEach(id=>jb.jbm.terminateChild(id))
    }
})

jb.component('initJb.loadModules', {
    type: 'initJbCode',
    description: 'returns code that can be wrapped as Promise.resolve(${code}).then(jb=>...)',
    params: [
        { id: 'modules' , as: 'array' },
    ],
    impl: ({vars}, modules) => 
    `jbInit('${vars.uri}',${JSON.stringify({projects: modules, baseUrl: vars.baseUrl, multipleInFrame: vars.multipleJbmsInFrame})})`
})

jb.component('initJb.treeShakeClient', {
    type: 'initJbCode',
    impl: ({vars}) => `(async () => {
const jb = { uri: '${vars.uri}', baseUrl: typeof jbBaseUrl != 'undefined' ? jbBaseUrl : ''}
${jb.treeShake.clientCode()};
return jb
})()`
})

jb.component('jbm.worker', {
    type: 'jbm',
    params: [
        {id: 'id', as: 'string', defaultValue: 'w1' },
        {id: 'init' , type: 'action', dynamic: true },
        {id: 'initJbCode', type: 'initJbCode', dynamic: true, defaultValue: initJb.treeShakeClient() },
        {id: 'networkPeer', as: 'boolean', description: 'used for testing' },
    ],    
    impl: (ctx,name,init,initJbCodeF,networkPeer) => {
        const childsOrNet = networkPeer ? jb.jbm.networkPeers : jb.jbm.childJbms
        if (childsOrNet[name]) return childsOrNet[name]
        const workerUri = networkPeer ? name : `${jb.uri}•${name}`
        const parentOrNet = networkPeer ? `jb.jbm.gateway = jb.jbm.networkPeers['${jb.uri}']` : 'jb.parent'
        const initJbCode = initJbCodeF(ctx.setVars({uri: workerUri, multipleJbmsInFrame: false}))
        const workerCode = `
jbBaseUrl = location.origin || '';
importScripts(location.origin+'/src/loader/jb-loader.js');

Promise.resolve(${initJbCode})
    .then(jb => {
        globalThis.jb = jb;
        jb.treeShakeJbm = ${parentOrNet} = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(self,'${jb.uri}'))
        self.postMessage({ $: 'workerReady' })
    })
//# sourceURL=${workerUri}-initJb.js
`
        const worker = new Worker(URL.createObjectURL(new Blob([workerCode], {name, type: 'application/javascript'})))
        const result = new Promise(resolve=> {
            worker.addEventListener('message', async function f1(m) {
                if (m.data.$ == 'workerReady') {
                    worker.removeEventListener('message',f1)
                    childsOrNet[name] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(worker,workerUri))
                    childsOrNet[name].worker = worker
                    await init(ctx.setVar('jbm',childsOrNet[name]))
                    resolve(childsOrNet[name])
                }
            })
        })
        result.uri = workerUri
        return result
    }
})

jb.component('jbm.child', {
  type: 'jbm',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'initJbCode', type: 'initJbCode', dynamic: true, defaultValue: initJb.treeShakeClient()},
    {id: 'init', type: 'action', dynamic: true}
  ],
  impl: (ctx,name,initJbCodeF,init) => {
        if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
        const childUri = `${jb.uri}•${name}`
        const initJbCode = initJbCodeF(ctx.setVars({uri: childUri, multipleJbmsInFrame: true}))
        const _child = jb.frame.eval(`${initJbCode}
//# sourceURL=${childUri}-initJb.js
`)
        jb.jbm.childJbms[name] = _child
        const result = Promise.resolve(_child).then(child=>{
            initChild(child)
            return Promise.resolve(init(ctx.setVar('jbm',child))).then(()=>child)
        })
        result.uri = childUri
        return result

        function initChild(child) {
            child.spy.initSpy({spyParam: jb.spy.spyParam})
            jb.jbm.childJbms[name] = child
            child.parent = jb
            child.treeShakeJbm = jb.treeShakeJbm || jb // TODO: use codeLoaderUri
            child.ports[jb.uri] = {
                from: child.uri, to: jb.uri,
                postMessage: m => 
                    jb.net.handleOrRouteMsg(jb.uri,child.uri,jb.ports[child.uri].handler,m),
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
        }
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
        const childJbm = Object.values(jb.jbm.childJbms).find(x=>x.uri == uri)
        if (childJbm) return childJbm
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
            const pp1 = from.split('•'), pp2 = to.split('•')
            const p1 = pp1.map((p,i) => pp1.slice(0,i+1).join('•'))
            const p2 = pp2.map((p,i) => pp2.slice(0,i+1).join('•'))
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

jb.component('jbm.self', {
    type: 'jbm',
    impl: () => jb
})

jb.component('jbm.terminateChild', {
    type: 'action',
    params: [
        {id: 'id', as: 'string'}
    ],
    impl: (ctx,id) => jb.jbm.terminateChild(id)
})
