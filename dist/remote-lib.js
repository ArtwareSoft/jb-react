if (typeof jbmFactory == 'undefined') jbmFactory = {};
jbmFactory['remote'] = function(jb) {
  jb.importAllMacros && eval(jb.importAllMacros());
jb.remoteCtx = {
    stripCtx(ctx) {
        if (!ctx) return null
        const isJS = typeof ctx.profile == 'function'
        const profText = jb.prettyPrint(ctx.profile)
        const vars = jb.objFromEntries(jb.entries(ctx.vars).filter(e => e[0] == '$disableLog' || profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(isJS ? ctx.params: jb.entries(jb.path(ctx.cmpCtx,'params')))
            .filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const res = Object.assign({id: ctx.id, path: ctx.path, profile: ctx.profile, vars }, 
            isJS ? {params,vars} : Object.keys(params).length ? {cmpCtx: {params} } : {} )
        return res
    },
    stripData(data) {
        if (data == null) return
        if (['string','boolean','number'].indexOf(typeof data) != -1) return data
        if (typeof data == 'function')
             return this.stripFunction(data)
        if (data instanceof jb.jbCtx)
             return this.stripCtx(data)
        if (Array.isArray(data))
             return data.slice(0,100).map(x=>this.stripData(x))
        if (typeof data == 'object' && ['VNode','Object','Array'].indexOf(data.constructor.name) == -1)
            return { $$: data.constructor.name}
        if (typeof data == 'object' && data.comps)
            return { uri : data.uri}
        if (typeof data == 'object')
             return jb.objFromEntries(jb.entries(data).map(e=>[e[0],this.stripData(e[1])]))
    },
    stripFunction({profile,runCtx,path, forcePath, param}) {
        if (!profile || !runCtx) return
        const profText = jb.prettyPrint(profile)
        const profNoJS = this.stripJSFromProfile(profile)
        const vars = jb.objFromEntries(jb.entries(runCtx.vars).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(jb.path(runCtx.cmpCtx,'params')).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        return Object.assign({$: 'runCtx', id: runCtx.id, path, forcePath, param, profile: profNoJS, vars}, 
            Object.keys(params).length ? {cmpCtx: {params} } : {})
    },
    serailizeCtx(ctx) { return JSON.stringify(this.stripCtx(ctx)) },
    deStrip(data) {
        if (typeof data == 'string' && data.match(/^__JBART_FUNC:/))
            return eval(data.slice(14))
        const stripedObj = typeof data == 'object' && jb.objFromEntries(jb.entries(data).map(e=>[e[0],this.deStrip(e[1])]))
        if (stripedObj && data.$ == 'runCtx')
            return (ctx2,data2) => (new jb.jbCtx().ctx({...stripedObj})).extendVars(ctx2,data2).runItself()
        if (Array.isArray(data))
            return data.map(x=>this.deStrip(x))
        return stripedObj || data
    },
    stripCBVars(cbData) {
        const res = jb.remoteCtx.stripData(cbData)
        if (res && res.vars)
            res.vars = jb.objFromEntries(jb.entries(res.vars).filter(e=>e[0].indexOf('$')!=0))

        return res
    },
    stripJSFromProfile(profile) {
        if (typeof profile == 'object')
            return jb.objFromEntries(jb.entries(profile)
                .map(([id,val]) => [id, typeof val == 'function' ? `__JBART_FUNC: ${val.toString()}` : this.stripData(val)]))
        return profile
    }
}

;

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
});

jb.component('prettyPrint', {
  params: [
    {id: 'profile', defaultValue: '%%'},
    {id: 'forceFlat', as: 'boolean', type: 'boolean'},
  ],
  impl: (ctx,profile) => jb.prettyPrint(jb.val(profile),{ ...ctx.params, comps: jb.studio.previewjb.comps})
})

jb.prettyPrintComp = function(compId,comp,settings={}) {
  if (comp) {
    return `jb.component('${compId}', ${jb.prettyPrint(comp,{ initialPath: compId, ...settings })})`
  }
}

jb.prettyPrint = function(val,settings = {}) {
  if (val == null) return ''
  return jb.prettyPrintWithPositions(val,settings).text;
}

jb.prettyPrint.advanceLineCol = function({line,col},text) {
  const noOfLines = (text.match(/\n/g) || '').length
  const newCol = noOfLines ? text.match(/\n(.*)$/)[1].length : col + text.length
  return { line: line + noOfLines, col: newCol }
}
jb.prettyPrint.spaces = Array.from(new Array(200)).map(_=>' ').join('');

jb.prettyPrintWithPositions = function(val,{colWidth=120,tabSize=2,initialPath='',noMacros,comps,forceFlat} = {}) {
  comps = comps || jb.comps
  if (!val || typeof val !== 'object')
    return { text: val != null && val.toString ? val.toString() : JSON.stringify(val), map: {} }

  const res = valueToMacro({path: initialPath, line:0, col: 0, depth :1}, val)
  res.text = res.text.replace(/__fixedNL__/g,'\n')
  return res

  function processList(ctx,items) {
    const res = items.reduce((acc,{prop, item}) => {
      const toAdd = typeof item === 'function' ? item(acc) : item
      const toAddStr = toAdd.text || toAdd, toAddMap = toAdd.map || {}, toAddPath = toAdd.path || ctx.path
      const startPos = jb.prettyPrint.advanceLineCol(acc,''), endPos = jb.prettyPrint.advanceLineCol(acc,toAddStr)
      const map = { ...acc.map, ...toAddMap, [[toAddPath,prop].join('~')]: [startPos.line, startPos.col, endPos.line, endPos.col] }
      return { text: acc.text + toAddStr, map, unflat: acc.unflat || toAdd.unflat, ...endPos}
    }, {text: '', map: {}, ...ctx})
    return {...ctx, ...res}
  }

  function joinVals(ctx, innerVals, open, close, flat, isArray) {
    const {path, depth} = ctx
    const _open = typeof open === 'string' ? [{prop: '!open', item: open}] : open
    const openResult = processList(ctx,[..._open, {prop: '!open-newline', item: () => newLine()}])
    const arrayOrObj = isArray? 'array' : 'obj'

    const beforeClose = innerVals.reduce((acc,{innerPath, val}, index) =>
      processList(acc,[
        {prop: `!${arrayOrObj}-prefix-${index}`, item: isArray ? '' : fixPropName(innerPath) + ': '},
        {prop: '!value', item: ctx => {
            const ctxWithPath = { ...ctx, path: [path,innerPath].join('~'), depth: depth +1 }
            return {...ctxWithPath, ...valueToMacro(ctxWithPath, val, flat)}
          }
        },
        {prop: `!${arrayOrObj}-separator-${index}`, item: () => index === innerVals.length-1 ? '' : ',' + (flat ? ' ' : newLine())},
      ])
    , {...openResult, unflat: false} )
    const _close = typeof close === 'string' ? [{prop: '!close', item: close}] : close
    const result = processList(beforeClose, [{prop: '!close-newline', item: () => newLine(-1)}, ..._close])

    const unflat = shouldNotFlat(result)
    if ((forceFlat || !unflat) && !flat)
      return joinVals(ctx, innerVals, open, close, true, isArray)
    return {...result, unflat}

    function newLine(offset = 0) {
      return flat ? '' : '\n' + jb.prettyPrint.spaces.slice(0,(depth+offset)*tabSize)
    }

    function shouldNotFlat(result) {
      const long = result.text.replace(/\n\s*/g,'').split('__fixedNL__')[0].length > colWidth
      if (!jb.studio.valOfPath)
        return result.unflat || long
      const val = jb.studio.valOfPath(path)
      const paramProps = path.match(/~params~[0-9]+$/)
      const paramsParent = path.match(/~params$/)
      const ctrls = path.match(/~controls$/) && Array.isArray(val) // && innerVals.length > 1// jb.studio.isOfType(path,'control') && !arrayElem
      const customStyle = jb.studio.compNameOfPath && jb.studio.compNameOfPath(path) === 'customStyle'
      const moreThanTwoVals = innerVals.length > 2 && !isArray
      const top = !path.match(/~/g)
      return !paramProps && (result.unflat || paramsParent || customStyle || moreThanTwoVals || top || ctrls || long)
    }
    function fixPropName(prop) {
      return prop.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ? prop : `'${prop}'`
    }
  }

  function profileToMacro(ctx, profile,flat) {
    const id = [jb.compName(profile)].map(x=> x=='var' ? 'variable' : x)[0]
    const comp = comps[id]
    if (comp)
      jb.fixMacroByValue(profile,comp)
    if (noMacros || !id || !comp || ',object,var,'.indexOf(`,${id},`) != -1) { // result as is
      const props = Object.keys(profile)
      if (props.indexOf('$') > 0) { // make the $ first
        props.splice(props.indexOf('$'),1);
        props.unshift('$');
      }
      return joinVals(ctx, props.map(prop=>({innerPath: prop, val: profile[prop]})), '{', '}', flat, false)
    }
    const macro = jb.macroName(id)

    const params = comp.params || []
    const firstParamIsArray = params.length == 1 && (params[0] && params[0].type||'').indexOf('[]') != -1
    const vars = (profile.$vars || []).map(({name,val},i) => ({innerPath: `$vars~${i}`, val: {$: 'Var', name, val }}))
    const remark = profile.remark ? [{innerPath: 'remark', val: {$remark: profile.remark}} ] : []
    const systemProps = vars.concat(remark)
    const openProfileByValueGroup = [{prop: '!profile', item: macro}, {prop:'!open-by-value', item:'('}]
    const closeProfileByValueGroup = [{prop:'!close-by-value', item:')'}]
    const openProfileSugarGroup = [{prop: '!profile', item: macro}, {prop:'!open-sugar', item:'('}]
    const closeProfileSugarGroup = [{prop:'!close-sugar', item: ')'}]
    const openProfileGroup = [{prop: '!profile', item: macro}, {prop:'!open-profile', item:'({'}]
    const closeProfileGroup = [{prop:'!close-profile', item:'})'}]

    if (firstParamIsArray) { // pipeline, or, and, plus
      const vars = (profile.$vars || []).map(({name,val}) => ({$: 'Var', name, val }))
      const args = vars.concat(jb.asArray(profile[params[0].id]))
        .map((val,i) => ({innerPath: params[0].id + '~' + i, val}))
      return joinVals(ctx, args, openProfileSugarGroup, closeProfileSugarGroup, flat, true)
    }
    const keys = Object.keys(profile).filter(x=>x != '$')
    const oneFirstArg = keys.length === 1 && params[0] && params[0].id == keys[0]
    const twoFirstArgs = keys.length == 2 && params.length >= 2 && profile[params[0].id] && profile[params[1].id]
    if ((params.length < 3 && comp.macroByValue !== false) || comp.macroByValue || oneFirstArg || twoFirstArgs) {
      const args = systemProps.concat(params.map(param=>({innerPath: param.id, val: propOfProfile(param.id)})))
      for(let i=0;i<5;i++)
        if (args.length && (!args[args.length-1] || args[args.length-1].val === undefined)) args.pop()
      return joinVals(ctx, args, openProfileByValueGroup, closeProfileByValueGroup, flat, true)
    }
    const remarkProp = profile.remark ? [{innerPath: 'remark', val: profile.remark} ] : []
    const systemPropsInObj = remarkProp.concat(vars.length ? [{innerPath: 'vars', val: vars.map(x=>x.val)}] : [])
    const args = systemPropsInObj.concat(params.filter(param=>propOfProfile(param.id) !== undefined)
        .map(param=>({innerPath: param.id, val: propOfProfile(param.id)})))
    const open = args.length ? openProfileGroup : openProfileByValueGroup
    const close = args.length ? closeProfileGroup : closeProfileByValueGroup
    return joinVals(ctx, args, open, close, flat, false)

    function propOfProfile(paramId) {
      const isFirst = params[0] && params[0].id == paramId
      return isFirst && profile['$'+id] || profile[paramId]
    }
  }

  function valueToMacro({path, line, col, depth}, val, flat) {
    const ctx = {path, line, col, depth}
    let result = doValueToMacro()
    if (typeof result === 'string')
      result = { text: result, map: {}}
    return result

    function doValueToMacro() {
      if (Array.isArray(val)) return arrayToMacro(ctx, val, flat);
      if (val === null) return 'null';
      if (val === undefined) return 'undefined';
      if (typeof val === 'object') return profileToMacro(ctx, val, flat);
      if (typeof val === 'function') return val.toString().replace(/\n/g,'__fixedNL__')
      if (typeof val === 'string' && val.indexOf("'") == -1 && val.indexOf('\n') == -1)
        return processList(ctx,[
          {prop: '!value-text-start', item: "'"},
          {prop: '!value-text', item: JSON.stringify(val).slice(1,-1)},
          {prop: '!value-text-end', item: "'"},
        ])
      else if (typeof val === 'string' && val.indexOf('\n') != -1)
        return processList(ctx,[
          {prop: '!value-text-start', item: "`"},
          {prop: '!value-text', item: val.replace(/`/g,'\\`')},
          {prop: '!value-text-end', item: "`"},
        ])
      else
        return JSON.stringify(val); // primitives
    }
  }

  function arrayToMacro(ctx, array, flat) {
    const vals = array.map((val,i) => ({innerPath: i, val}))
    const openArray = [{prop:'!open-array', item:'['}]
    const closeArray = [{prop:'!close-array', item:']'}]

    return joinVals(ctx, vals, openArray, closeArray, flat, true)
  }
}

;


};