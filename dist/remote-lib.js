if (typeof jbmFactory == 'undefined') jbmFactory = {};
jbmFactory['remote'] = function(jb) {
  jb.importAllMacros && eval(jb.importAllMacros());
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

jb.remoteCtx = {
    stripCtx(ctx) {
        if (!ctx) return null
        const isJS = typeof ctx.profile == 'function'
        const profText = jb.prettyPrint(ctx.profile)
        const vars = jb.objFromEntries(jb.entries(ctx.vars).filter(e => e[0] == '$disableLog' || profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const data = profText.match(/({data})|(ctx.data)|(%%)/) && this.stripData(ctx.data) 
        const params = jb.objFromEntries(jb.entries(isJS ? ctx.params: jb.entries(jb.path(ctx.cmpCtx,'params')))
            .filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const res = Object.assign({id: ctx.id, path: ctx.path, profile: ctx.profile, data, vars }, 
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
             return jb.objFromEntries(jb.entries(data).filter(e=> typeof e[1] != 'function').map(e=>[e[0],this.stripData(e[1])]))
    },
    stripFunction(f) {
        const {profile,runCtx,path,param,srcPath} = f
        if (!profile || !runCtx) return this.stripJS(f)
        const profText = jb.prettyPrint(profile)
        const profNoJS = this.stripJSFromProfile(profile)
        const vars = jb.objFromEntries(jb.entries(runCtx.vars).filter(e => e[0] == '$disableLog' || profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(jb.path(runCtx.cmpCtx,'params')).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],this.stripData(e[1])]))
        return Object.assign({$: 'runCtx', id: runCtx.id, path: [srcPath,path].join('~'), param, profile: profNoJS, data: this.stripData(runCtx.data), vars}, 
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
        if (typeof profile == 'function')
            return `__JBART_FUNC: ${profile.toString()}`
        else if (Array.isArray(profile))
            return profile.map(val => this.stripJS(val))
        else if (typeof profile == 'object')
            return jb.objFromEntries(jb.entries(profile).map(([id,val]) => [id, this.stripJS(val)]))
        return profile
    },
    stripJS(val) {
        return typeof val == 'function' ? `__JBART_FUNC: ${val.toString()}` : this.stripData(val)
    },
    serializeCmp(compId) {
        if (!jb.comps[compId])
            return jb.logError('no component of id ',{compId}),''
        return jb.prettyPrint({compId, ...jb.comps[compId],
            location: jb.comps[compId][jb.location], loadingPhase: jb.comps[compId][jb.loadingPhase]} )
    },
    deSerializeCmp(code) {
        if (!code) return
        try {
            const cmp = eval(`(function() { ${jb.importAllMacros()}; return ${code} })()`)
            const res = {...cmp, [jb.location]: cmp.location, [jb.loadingPhase]: cmp.loadingPhase }
            delete res.location
            delete res.loadingPhase
            jb.comps[res.compId] = res
        } catch (e) {
            jb.logException(e,'eval profile',{code})
        }        
    },
}

;

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
                            const timer = setTimeout(() => handlers[cbId] && reject({ type: 'error', desc: 'timeout' }), timeout)
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
    self.loaded = true
})`
        const worker = new Worker(URL.createObjectURL(new Blob([workerCode], {name: id, type: 'application/javascript'})))
        const workerJbm = childsOrNet[name] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(worker,workerUri))
        // wait for worker jbm to load
        const res = jb.exec(pipe(waitFor(remote.data(()=>self.loaded, ()=>workerJbm)), ()=>workerJbm, first()))
        res.uri = workerJbm.uri
        return res
    }
})

jb.component('jbm.child', {
    type: 'jbm',
    description: 'returns a promise at the first time. Clients needs to wait for the promise before using the jbm',
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
    impl: pipe(
		jbm.child('vDebugger',['vDebugger']),
		pipe(
        	remote.action(() => jb.studio.initLocalCompsRefHandler(jb.studio.compsRefOfjbm(jb.parent))	,'%%'),
			'%%'
		)
    )
})
;

jb.component('source.remote', {
    type: 'rx',
    macroByValue: true,
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.same() },
    ],
    impl: (ctx,rx,jbm) => {
        if (!jbm)
            return jb.logError('source.remote - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        const stripedRx = jbm.callbag ? rx : jb.remoteCtx.stripFunction(rx)
        if (jb.isPromise(jbm))
            return jb.callbag.pipe(jb.callbag.fromPromise(jbm), jb.callbag.concatMap(_jbm=> _jbm.createCallbagSource(stripedRx)))
        return jbm.createCallbagSource(stripedRx)
    }        
})

jb.component('remote.operator', {
    type: 'rx',
    macroByValue: true,
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.same()},
    ],
    impl: (ctx,rx,jbm) => {
        if (!jbm)
            return jb.logError('remote.operator - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        const stripedRx = jbm.callbag ? rx : jb.remoteCtx.stripFunction(rx)
        if (jb.isPromise(jbm)) {
            jb.log('jbm as promise in remote operator, adding request buffer', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
            return source => {
                const buffer = jb.callbag.replay(5)(source)
                return jb.callbag.pipe(jb.callbag.fromPromise(jbm),jb.callbag.concatMap(_jbm=> _jbm.createCalllbagOperator(stripedRx)(buffer)))
            }
        }
        return jbm.createCalllbagOperator(stripedRx)
    }
})

jb.component('remote.action', {
    type: 'action',
    description: 'exec a script on a remote node and returns a promise if not oneWay',
    params: [
      {id: 'action', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.same()},
      {id: 'oneway', as: 'boolean', description: 'do not wait for the respone' },
      {id: 'timeout', as: 'number', defaultValue: 10000 },
    ],
    impl: (ctx,action,jbm,oneway,timeout) => {
        if (!jbm)
            return jb.logError('remote.action - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        return Promise.resolve(jbm).then(_jbm => _jbm.remoteExec(jb.remoteCtx.stripFunction(action),{timeout,oneway,isAction: true}))
    }
})

jb.component('remote.data', {
    description: 'calc a script on a remote node and returns a promise',
    macroByValue: true,
    params: [
      {id: 'data', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.same()},
      {id: 'timeout', as: 'number', defaultValue: 10000 },
    ],
    impl: (ctx,data,jbm,timeout) => {
        if (!jbm)
            return jb.logError('remote.data - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        return Promise.resolve(jbm).then(_jbm=> _jbm.remoteExec(jb.remoteCtx.stripFunction(data),{timeout}))
    }
})

jb.component('remote.initShadowData', {
    type: 'action',
    description: 'shadow watchable data on remote jbm',
    params: [
      {id: 'src', as: 'ref' },
      {id: 'jbm', type: 'jbm'},
    ],
    impl: rx.pipe(
        source.watchableData({ref: '%$src%', includeChildren: 'yes'}),
        rx.map(obj(prop('op','%op%'), prop('path',({data}) => jb.pathOfRef(data.ref)))),
        sink.action(remote.action( 
            ctx => jb.doOp(jb.refOfPath(ctx.data.path), ctx.data.op, ctx),
            '%$jbm%')
        )
    )
})

/*** net comps */

jb.component('net.listSubJbms', {
    type: 'rx',
    category: 'source',
    impl: pipe(
        () => Object.values(jb.jbm.childJbms || {}),
        remote.data(net.listSubJbms(),'%%'),
        aggregate(list(() => jb.uri,'%%'))
    )
})

jb.component('net.getRootParentUri', {
    impl: () => jb.uri.split('►')[0]
})

jb.component('net.listAll', {
    impl: remote.data(
        pipe(
            () => Object.values(jb.jbm.networkPeers || {}),
            remote.data(net.listSubJbms(),'%%'),
            aggregate(list(net.listSubJbms() ,'%%'))
        )
        ,jbm.byUri(net.getRootParentUri())
    )
});


};