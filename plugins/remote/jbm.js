jb.pluginDsl('jbm')
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
        if (jb.cbHandler.map[id] && jb.cbHandler.map[id].terminated)
            return Promise.resolve(() => () => {})
        return jb.exec({$: 'waitFor', check: ()=> jb.cbHandler.map[id], interval: 5, times: 10})
            .catch(err => {
                if (!jb.terminated)
                    jb.logError('cbLookUp - can not find cb',{id, in: jb.uri})
                return () => {}
            })
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
    removeEntry(ids,m,delay=10) {
        jb.log(`remote remove cb handlers at ${jb.uri}`,{ids,m})
        jb.delay(delay).then(()=> // TODO: BUGGY delay - not sure why the delay is needed - test: remoteTest.workerByUri
            jb.asArray(ids).filter(x=>x).forEach(id => {
                jb.cbHandler.map[id].terminated = true
            } )
        )
    },
    terminate() {
        Object.keys(jb.cbHandler.map).forEach(k=>delete jb.cbHandler[k])
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
        if (jb.terminated) {
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
            frame, from, to, handlers: [],
            postMessage: _m => {
                const m = {from, to,..._m}
                jb.log(`remote sent from ${from} to ${to}`,{m})
                frame.postMessage(m) 
            },
            onMessage: { addListener: handler => { 
                function h(m) { jb.net.handleOrRouteMsg(from,to,handler,m.data,options) }
                port.handlers.push(h); 
                return frame.addEventListener('message', h) 
            }},
            onDisconnect: { addListener: handler => { port.disconnectHandler = handler} },
            terminate() {
                port.handlers.forEach(h=>frame.removeEventListener('message',h))
            }
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
                            if (!handlers[cbId] || handlers[cbId].terminated) return
                            const err = { type: 'error', desc: 'remote exec timeout', remoteRun, timeout }
                            jb.logError('remote exec timeout',{timer, uri: jb.uri, h: handlers[cbId]})
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
                if (jb.terminated) return // TODO: removeEventListener
                jb.log(`remote command from ${m.from} ${m.$}`,{m})
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
            return jb.cbHandler.getAsPromise(cbId,t).then(cb=> !jb.terminated && cb && cb(t, t == 0 ? remoteCB(d,cbId,m) : d)) 
        }
        function inboundExecResult(m) { 
            jb.cbHandler.getAsPromise(m.cbId).then(h=>{
                if (jb.terminated) return
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
                if (Object.keys(jb.treeShake.loadingCode || {}).length) {
                    jb.log('remote waiting for loadingCode',{cmd, loading: Object.keys(jb.treeShake.loadingCode)})
                    await jb.exec({$: 'waitFor', timeout: 100, check: () => !Object.keys(jb.treeShake.loadingCode).length })
                }
                await jb.treeShake.bringMissingCode(cmd.remoteRun)
                const deStrip = jb.remoteCtx.deStrip(cmd.remoteRun)
                const result = await (typeof deStrip == 'function' ? deStrip() : deStrip)
                if ($ == 'CB.createSource' && typeof result == 'function')
                    jb.cbHandler.map[cbId] = result
                else if ($ == 'CB.createOperator' && typeof result == 'function')
                    jb.cbHandler.map[cbId] = result(remoteCB(sourceId, cbId,cmd) )
                else if ($ == 'CB.exec')
                    port.postMessage({$:'execResult', cbId, result: isAction ? {} : jb.remoteCtx.stripData(result) , ...jb.net.reverseRoutingProps(cmd) })
            } catch(err) { 
                jb.logException(err,'remote handleCBCommnad',{cmd})
                $ == 'CB.exec' && port.postMessage({$:'execResult', cbId, result: { type: 'error', err}, ...jb.net.reverseRoutingProps(cmd) })
            }
        }
    },
    pathOfDistFolder() {
        const pathOfDistFolder = jb.path(jb.studio,'studiojb.studio.host.pathOfDistFolder')
        const location = jb.path(jb.frame,'location')
        return pathOfDistFolder && pathOfDistFolder() || location && location.href.match(/^[^:]*/)[0] + `://${location.host}/dist`
    },
    async initDevToolsDebugge() {
        if (jb.test && jb.test.runningTests && !jb.test.singleTest) 
            return jb.logError('jbart devtools is disables for multiple tests')
        if (!jb.jbm.networkPeers['devtools']) {
            jb.jbm.networkPeers['devtools'] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(globalThis,'devtools',{blockContentScriptLoop: true}))
            globalThis.postMessage({initDevToolsPeerOnDebugge: {uri: jb.uri, distPath: jb.jbm.pathOfDistFolder(), spyParam: jb.path(jb,'spy.spyParam')}}, '*')
            await jb.exec({$: 'waitFor', check: ()=> jb.jbm.devtoolsInitialized, interval: 500, times: 10})
            jb.log(`chromeDebugger devtools initialized. adding connectToPanel func on debugee`,{uri: jb.uri})
            jb.jbm.connectToPanel = panelUri => {
                jb.log(`chromeDebugger invoking connectToPanel comp ${panelUri} on devltools`,{uri: jb.uri})
                new jb.core.jbCtx().setVar('$disableLog',true).run(remote.action({
                    action: {$: 'jbm.connectToPanel', panelUri}, 
                    jbm: byUri('devtools'),
                    oneway: true
                })) } // will be called directly by initPanel using eval
        }
    },
    async terminateChild(id,childsOrNet = jb.jbm.childJbms) {
        if (!childsOrNet[id]) return
        const childJbm = await childsOrNet[id]
        const rjbm = await childJbm.rjbm()
        rjbm.terminated = childJbm.terminated = true
        jb.log('remote terminate child', {id})
        Object.keys(jb.ports).filter(x=>x.indexOf(childJbm.uri) == 0).forEach(uri=>{
                if (jb.ports[uri].terminate)
                    jb.ports[uri].terminate()
                delete jb.ports[uri]
            })
        delete childsOrNet[id]
        rjbm.remoteExec(jb.remoteCtx.stripJS(() => {jb.cbHandler.terminate(); terminated = true; if (typeof close1 == 'function') close() } ), {oneway: true} )
        return rjbm.remoteExec(jb.remoteCtx.stripJS(() => {
            jb.cbHandler.terminate(); 
            jb.terminated = true;
            jb.delay(100).then(() => typeof close == 'function' && close()) // close worker
            return 'terminated' 
        }), { oneway: true} )
    },
    terminateAllChildren() {
        return Promise.all([
            ...Object.keys(jb.jbm.childJbms).map(id=>jb.jbm.terminateChild(id,jb.jbm.childJbms)),
            ...Object.keys(jb.jbm.networkPeers).map(id=>jb.jbm.terminateChild(id,jb.jbm.networkPeers)),
        ])
    }
})

component('worker', {
    type: 'jbm',
    params: [
        {id: 'id', as: 'string', defaultValue: 'w1' },
        {id: 'init' , type: 'action<>', dynamic: true },
        {id: 'sourceCodeOptions', type: 'source-code-option[]', flattenArray: true, defaultValue: treeShakeClient() },
        {id: 'networkPeer', as: 'boolean', description: 'used for testing' },
    ],    
    impl: (ctx,id,init,sourceCodeOptions,networkPeer) => {
        const childsOrNet = networkPeer ? jb.jbm.networkPeers : jb.jbm.childJbms
        if (childsOrNet[id]) return childsOrNet[id]
        const workerUri = networkPeer ? id : `${jb.uri}•${id}`
        const parentOrNet = networkPeer ? `jb.jbm.gateway = jb.jbm.networkPeers['${jb.uri}']` : 'jb.parent'
        const initOptions = jb.jbm.calcInitOptions(sourceCodeOptions)
        const workerCode = `
importScripts(location.origin+'/plugins/loader/jb-loader.js');
jbHost.baseUrl = location.origin || '';

Promise.resolve(jbInit('${workerUri}', ${JSON.stringify(initOptions)})
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
    {id: 'id', as: 'string', mandatory: true},
    {id: 'sourceCodeOptions', type: 'source-code-option[]', flattenArray: true, defaultValue: treeShakeClient() },
    {id: 'init', type: 'action', dynamic: true}
  ],
  impl: (ctx,id,sourceCodeOptions,init) => {
        if (jb.jbm.childJbms[id]) return jb.jbm.childJbms[id]
        const childUri = `${jb.uri}•${id}`
        const initOptions = jb.jbm.calcInitOptions(sourceCodeOptions)
//        const _child = jbInit(childUri, {...initOptions, multipleInFrame: true})
        // jb.jbm.childJbms[id] = _child
        // const result = Promise.resolve(_child).then(child=>{
        //     initChild(child)
        //     return Promise.resolve(init(ctx.setVar('jbm',child))).then(()=>child)
        // })
        // result.uri = childUri
        return jb.jbm.childJbms[id] = {
            uri: childUri,
            async rjbm() {
                if (this._rjbm) return this._rjbm
                const child = this.child = await jbInit(childUri, {...initOptions, multipleInFrame: true})
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

