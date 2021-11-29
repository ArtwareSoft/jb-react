if (typeof jbmFactory == 'undefined') jbmFactory = {};
jbmFactory['remote'] = function(jb) {
  jb.importAllMacros && eval(jb.importAllMacros());
jb.component('prettyPrint', {
  params: [
    {id: 'profile', defaultValue: '%%'},
    {id: 'forceFlat', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,profile) => jb.utils.prettyPrint(jb.val(profile),{ ...ctx.params, comps: jb.studio.previewjb.comps})
})

jb.extension('utils', 'prettyPrint', {
  initExtension() {
    return {
      emptyLineWithSpaces: Array.from(new Array(200)).map(_=>' ').join(''),
      fixedNLRegExp: new RegExp(`__fixedNL${''}__`,'g'), // avoid self replacement
      fixedNL: `__fixedNL${''}__`, // avoid self replacement
    }
  },
  prettyPrintComp(compId,comp,settings={}) {
    if (comp) {
      //const comp = Object.assign({}, _comp,{location: null})
      return `jb.component('${compId}', ${jb.utils.prettyPrint(comp,{ initialPath: compId, ...settings })})`
    }
  },
  
  prettyPrint(val,settings = {}) {
    if (val == null) return ''
    return jb.utils.prettyPrintWithPositions(val,settings).text;
  },
  
  advanceLineCol({line,col},text) {
    const noOfLines = (text.match(/\n/g) || '').length
    const newCol = noOfLines ? text.match(/\n(.*)$/)[1].length : col + text.length
    return { line: line + noOfLines, col: newCol }
  },

  prettyPrintWithPositions(val,{colWidth=120,tabSize=2,initialPath='',noMacros,comps,forceFlat} = {}) {
    comps = comps || jb.comps
    if (!val || typeof val !== 'object')
      return { text: val != null && val.toString ? val.toString() : JSON.stringify(val), map: {} }

    const res = valueToMacro({path: initialPath, line:0, col: 0, depth :1}, val, forceFlat)
    res.text = res.text.replace(jb.utils.fixedNLRegExp,'\n')
    return res

    function processList(ctx,items) {
      const res = items.reduce((acc,{prop, item}) => {
        const toAdd = typeof item === 'function' ? item(acc) : item
        const toAddStr = toAdd.text || toAdd, toAddMap = toAdd.map || {}, toAddPath = toAdd.path || ctx.path
        const startPos = jb.utils.advanceLineCol(acc,''), endPos = jb.utils.advanceLineCol(acc,toAddStr)
        const map = { ...acc.map, ...toAddMap, [[toAddPath,prop].join('~')]: [startPos.line, startPos.col, endPos.line, endPos.col] }
        return { text: acc.text + toAddStr, map, unflat: acc.unflat || toAdd.unflat, ...endPos}
      }, {text: '', map: {}, ...ctx})
      return {...ctx, ...res}
    }

    function joinVals(ctx, innerVals, open, close, flat, isArray) {
      const {path, depth} = ctx
      const _open = typeof open === 'string' ? [{prop: '!open', item: open}] : open
      const arrayOrProfile = isArray? 'array' : 'profile'
      const openResult = processList(ctx,[..._open, {prop: `!open-${arrayOrProfile}`, item: () => newLine()}])

      const beforeClose = innerVals.reduce((acc,{innerPath, val}, index) => {
        const fixedPropName = valueToMacro(ctx, val, flat).fixedPropName // used to serialize function memeber
        const semanticPrefix = isArray ? `array-prefix-${index}` : 'prop'
        const semanticSeparator = isArray ? `array-separator-${index}` : `obj-separator-${index}`
        return processList(acc,[
          {prop: `${innerPath}~!${semanticPrefix}`, item: isArray ? '' : fixedPropName || (fixPropName(innerPath) + ': ')},
          {prop: '!value', item: ctx => {
              const ctxWithPath = { ...ctx, path: [path,innerPath].join('~'), depth: depth +1 }
              return {...ctxWithPath, ...valueToMacro(ctxWithPath, val, flat)}
            }
          },
          {prop: `!${semanticSeparator}`, item: () => index === innerVals.length-1 ? '' : ',' + (flat ? ' ' : newLine())},
        ])}
      , {...openResult, unflat: false} )
      const _close = typeof close === 'string' ? [{prop: `!close-${arrayOrProfile}`, item: close}] : close
      const result = processList(beforeClose, [{prop: `!close-${arrayOrProfile}`, item: () => newLine(-1)}, ..._close])

      const unflat = shouldNotFlat(result)
      if ((forceFlat || !unflat) && !flat)
        return joinVals(ctx, innerVals, open, close, true, isArray)
      return {...result, unflat}

      function newLine(offset = 0) {
        return flat ? '' : '\n' + jb.utils.emptyLineWithSpaces.slice(0,(depth+offset)*tabSize)
      }

      function shouldNotFlat(result) {
        const long = result.text.replace(/\n\s*/g,'').split(jb.utils.fixedNL)[0].length > colWidth
        if (!jb.path(jb,'studio.valOfPath'))
          return result.unflat || long
        const val = jb.path(comps,path.split('~')) 
        const paramProps = path.match(/~params~[0-9]+$/)
        const paramsParent = path.match(/~params$/)
        const ctrls = path.match(/~controls$/) && Array.isArray(val)
        const moreThanTwoVals = innerVals.length > 2 && !isArray
        const top = !path.match(/~/g)
        return !paramProps && (result.unflat || paramsParent || moreThanTwoVals || top || ctrls || long)
      }
      function fixPropName(prop) {
        return prop.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ? prop : `'${prop}'`
      }
    }

    function profileToMacro(ctx, profile,flat) {
      const id = [jb.utils.compName(profile)].map(x=> x=='var' ? 'variable' : x)[0]
      const comp = comps[id]
      if (comp)
        jb.macro.fixProfile(profile)
      if (noMacros || !id || !comp || ',object,var,'.indexOf(`,${id},`) != -1) { // result as is
        const props = Object.keys(profile)
        if (props.indexOf('$') > 0) { // make the $ first
          props.splice(props.indexOf('$'),1);
          props.unshift('$');
        }
        return joinVals(ctx, props.map(prop=>({innerPath: prop, val: profile[prop]})), '{', '}', flat, false)
      }
      const macro = jb.macro.titleToId(id)

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
        while (args.length && (!args[args.length-1] || args[args.length-1].val === undefined)) args.pop() // cut the undefined's at the end
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

    function serializeFunction(func) {
      let asStr = func.toString().trim().replace(/^'([a-zA-Z_\-0-9]+)'/,'$1')
      if (func.fixedName)
        asStr = asStr.replace(/initExtension[^(]*\(/,`${func.fixedName}(`)
      const asynch = asStr.indexOf('async') == 0 ? 'async ' : ''
      const noPrefix = asStr.slice(asynch.length)
      const funcName = func.fixedName || func.name
      const header = noPrefix.indexOf(`${funcName}(`) == 0 ? funcName : noPrefix.indexOf(`function ${funcName}(`) == 0 ? `function ${funcName}` : ''
      const fixedPropName = header ? `${asynch}${header}` : ''
      return { text: asStr.slice(header.length+asynch.length).replace(/\n/g,jb.utils.fixedNL), fixedPropName, map: {} }
    }

    function valueToMacro({path, line, col, depth}, val, flat) {
      const ctx = {path, line, col, depth}
      let result = doValueToMacro()
      if (typeof result === 'string')
        result = { text: result, map: {}}
      return result

      function doValueToMacro() {
        if (Array.isArray(val)) return arrayToMacro(ctx, val, flat);
        if (val === null) return 'null'
        if (val === undefined) return 'undefined'
        if (typeof val === 'object') return profileToMacro(ctx, val, flat)
        if (typeof val === 'function') return serializeFunction(val)
    
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
          return JSON.stringify(val) || 'undefined'; // primitives or symbol
      }
    }

    function arrayToMacro(ctx, array, flat) {
      const vals = array.map((val,i) => ({innerPath: i, val}))
      const openArray = [{prop:'!open-array-char', item:'['}]
      const closeArray = [{prop:'!close-array-char', item:']'}]

      return joinVals(ctx, vals, openArray, closeArray, flat, true)
    }
  }
})
;

jb.extension('remoteCtx', {
    stripCtx(ctx) {
        if (!ctx) return null
        const isJS = typeof ctx.profile == 'function'
        const profText = jb.utils.prettyPrint(ctx.profile)
        const vars = jb.objFromEntries(jb.entries(ctx.vars).filter(e => e[0] == '$disableLog' || profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const data = jb.remoteCtx.usingData(profText) && jb.remoteCtx.stripData(ctx.data) 
        const params = jb.objFromEntries(jb.entries(isJS ? ctx.params: jb.entries(jb.path(ctx.cmpCtx,'params')))
            .filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const res = Object.assign({id: ctx.id, path: ctx.path, profile: ctx.profile, data, vars }, 
            isJS ? {params,vars} : Object.keys(params).length ? {cmpCtx: {params} } : {} )
        return res
    },
    stripData(data) {
        if (data == null) return
        if (['string','boolean','number'].indexOf(typeof data) != -1) return data
        if (typeof data == 'function')
             return jb.remoteCtx.stripFunction(data)
        if (data instanceof jb.core.jbCtx)
             return jb.remoteCtx.stripCtx(data)
        if (Array.isArray(data) && data.length > 100)
            jb.logError('stripData slicing large array',{data})
        if (Array.isArray(data))
             return data.slice(0,100).map(x=>jb.remoteCtx.stripData(x))
        if (typeof data == 'object' && ['DOMRect'].indexOf(data.constructor.name) != -1)
            return jb.objFromEntries(Object.keys(data.__proto__).map(k=>[k,data[k]]))
        if (typeof data == 'object' && ['VNode','Object','Array'].indexOf(data.constructor.name) == -1)
            return { $$: data.constructor.name}
        if (typeof data == 'object' && data.comps)
            return { uri : data.uri}
        if (typeof data == 'object')
             return jb.objFromEntries(jb.entries(data)
                .filter(e=> data.$ || typeof e[1] != 'function') // if not a profile, block functions
                .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
    },
    stripFunction(f) {
        const {profile,runCtx,path,param,srcPath} = f
        if (!profile || !runCtx) return jb.remoteCtx.stripJS(f)
        const profText = jb.utils.prettyPrint(profile)
        const profNoJS = jb.remoteCtx.stripJSFromProfile(profile)
        const vars = jb.objFromEntries(jb.entries(runCtx.vars).filter(e => e[0] == '$disableLog' || profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const params = jb.objFromEntries(jb.entries(jb.path(runCtx.cmpCtx,'params')).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))
            .map(e=>[e[0],jb.remoteCtx.stripData(e[1])]))
        const usingData = jb.remoteCtx.usingData(profText); //profText.match(/\bdata\b/) || profText.match(/%[^$]/)
        return Object.assign({$: 'runCtx', id: runCtx.id, path: [srcPath,path].filter(x=>x).join('~'), param, profile: profNoJS, data: usingData ? jb.remoteCtx.stripData(runCtx.data) : null, vars}, 
            Object.keys(params).length ? {cmpCtx: {params} } : {})
    },
    serailizeCtx(ctx) { return JSON.stringify(jb.remoteCtx.stripCtx(ctx)) },
    deStrip(data) {
        if (typeof data == 'string' && data.match(/^__JBART_FUNC:/))
            return eval(data.slice(14))
        const stripedObj = data && typeof data == 'object' && jb.objFromEntries(jb.entries(data).map(e=>[e[0],jb.remoteCtx.deStrip(e[1])]))
        if (stripedObj && data.$ == 'runCtx')
            return (ctx2,data2) => (new jb.core.jbCtx().ctx({...stripedObj})).extendVars(ctx2,data2).runItself()
        if (Array.isArray(data))
            return data.map(x=>jb.remoteCtx.deStrip(x))
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
            return profile.map(val => jb.remoteCtx.stripJS(val))
        else if (typeof profile == 'object')
            return jb.objFromEntries(jb.entries(profile).map(([id,val]) => [id, jb.remoteCtx.stripJS(val)]))
        return profile
    },
    stripJS(val) {
        return typeof val == 'function' ? `__JBART_FUNC: ${val.toString()}` : jb.remoteCtx.stripData(val)
    },
    serializeCmp(compId) {
        if (!jb.comps[compId])
            return jb.logError('no component of id ',{compId}),''
        return jb.utils.prettyPrint({compId, ...jb.comps[compId],
            location: jb.comps[compId][jb.core.location], loadingPhase: jb.comps[compId][jb.core.loadingPhase]} )
    },
    deSerializeCmp(code) {
        if (!code) return
        try {
            const cmp = eval(`(function() { ${jb.macro.importAll()}; return ${code} })()`)
            const res = {...cmp, [jb.core.location]: cmp.location, [jb.core.loadingPhase]: cmp.loadingPhase }
            delete res.location
            delete res.loadingPhase
            jb.comps[res.compId] = res
        } catch (e) {
            jb.logException(e,'eval profile',{code})
        }        
    },
    usingData: profText => profText.match(/({data})|(ctx.data)|(%[^$])/)
})

;

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
            remoteExec: sctx => jb.codeLoader.bringMissingCode(sctx).then(()=>jb.remoteCtx.deStrip(sctx)()),
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
            if (jb.codeLoader.loadingCode)
                await jb.exec({$: 'waitFor', timeout: 500, check: () => !jb.codeLoader.loadingCode })
                await jb.codeLoader.bringMissingCode(cmd.remoteRun)
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

jb.component('startup.codeLoaderServer', {
    type: 'startupCode',
    params: [
        { id: 'projects' , as: 'array' },
        { id: 'init' , type: 'action', dynamic: true },
    ],
    impl: ({vars}, projects, init) => `(function() { 
jb_modules = { core: ${JSON.stringify(jb_modules.core)} };
${jbInit.toString()}
${jbSupervisedLoad.toString()}
return jbInit('${vars.uri}',${JSON.stringify({projects, baseUrl: vars.baseUrl, multipleInFrame: vars.multipleJbmsInFrame})})
    .then(jb => { jb.exec(${JSON.stringify(init.profile || {})}); return jb })
})()`
})

jb.component('startup.codeLoaderClient', {
    type: 'startupCode',
    impl: ({vars}) => vars.multipleJbmsInFrame ? `(function () {
const jb = { uri: '${vars.uri}'}
globalThis.jbLoadingPhase = 'libs'
${jb.codeLoader.clientCode()};
jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})
globalThis.jbLoadingPhase = 'appFiles'
return jb
})()
` : `jb = { uri: '${vars.uri}'}
jbLoadingPhase = 'libs'
${jb.codeLoader.clientCode()};
spy = jb.spy.initSpy({spyParam: '${jb.spy.spyParam}'})
`
})

jb.component('jbm.worker', {
    type: 'jbm',
    params: [
        {id: 'id', as: 'string', defaultValue: 'w1' },
        {id: 'init' , type: 'action', dynamic: true },
        {id: 'startupCode', type: 'startupCode', dynamic: true, defaultValue: startup.codeLoaderClient() },
        {id: 'networkPeer', as: 'boolean', description: 'used for testing' },
    ],    
    impl: (ctx,name,init,startupCode,networkPeer) => {
        const childsOrNet = networkPeer ? jb.jbm.networkPeers : jb.jbm.childJbms
        if (childsOrNet[name]) return childsOrNet[name]
        const workerUri = networkPeer ? name : `${jb.uri}•${name}`
        const parentOrNet = networkPeer ? `jb.jbm.gateway = jb.jbm.networkPeers['${jb.uri}']` : 'jb.parent'
        const code = startupCode(ctx.setVars({uri: workerUri, multipleJbmsInFrame: false}))
        const workerCode = `
jbInWorker = true
jb_modules = { core: ${JSON.stringify(jb_modules.core)} };
${jbInit.toString()}
${jbSupervisedLoad.toString()}
function jb_loadFile(url, baseUrl) { 
    baseUrl = baseUrl || location.origin || ''
    return Promise.resolve(importScripts(baseUrl+url)) 
}
${code};
jb.codeLoaderJbm = ${parentOrNet} = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(self,'${jb.uri}'))
jbLoadingPhase = 'appFiles'
//# sourceURL=${workerUri}-startup.js
`
        const worker = new Worker(URL.createObjectURL(new Blob([workerCode], {name, type: 'application/javascript'})))
        childsOrNet[name] = jb.jbm.extendPortToJbmProxy(jb.jbm.portFromFrame(worker,workerUri))
        childsOrNet[name].worker = worker
        const result = Promise.resolve(init(ctx.setVar('jbm',childsOrNet[name]))).then(()=>childsOrNet[name])
        result.uri = workerUri
        return result
    }
})

jb.component('jbm.child', {
  type: 'jbm',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'startupCode', type: 'startupCode', dynamic: true, defaultValue: startup.codeLoaderClient()},
    {id: 'init', type: 'action', dynamic: true}
  ],
  impl: (ctx,name,startUpCode,init) => {
        if (jb.jbm.childJbms[name]) return jb.jbm.childJbms[name]
        const childUri = `${jb.uri}•${name}`
        const code = startUpCode(ctx.setVars({uri: childUri, multipleJbmsInFrame: true}))
        const _child = jb.frame.eval(`${code}
//# sourceURL=${childUri}-startup.js
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
            child.codeLoaderJbm = jb.codeLoaderJbm || jb // TODO: use codeLoaderUri
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
;

jb.component('source.remote', {
    type: 'rx',
    macroByValue: true,
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.self() },
    ],
    impl: (ctx,rx,jbm) => {
        if (!jbm)
            return jb.logError('source.remote - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        const stripedRx = jbm.callbag ? rx : jb.remoteCtx.stripFunction(rx)
        if (jb.utils.isPromise(jbm))
            return jb.callbag.pipe(jb.callbag.fromPromise(jbm), jb.callbag.concatMap(_jbm=> _jbm.createCallbagSource(stripedRx)))
        return jbm.createCallbagSource(stripedRx)
    }        
})

jb.component('remote.operator', {
    type: 'rx',
    macroByValue: true,
    params: [
      {id: 'rx', type: 'rx', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.self()},
    ],
    impl: (ctx,rx,jbm) => {
        if (!jbm)
            return jb.logError('remote.operator - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        const stripedRx = jbm.callbag ? rx : jb.remoteCtx.stripFunction(rx)
        const profText = jb.utils.prettyPrint(rx.profile)
        let counter = 0
        const varsMap = {}
        const cleanDataObjVars = jb.callbag.map(dataObj => {
            if (typeof dataObj != 'object' || !dataObj.vars) return dataObj
            const vars = { ...jb.objFromEntries(jb.entries(dataObj.vars).filter(e => profText.match(new RegExp(`\\b${e[0]}\\b`)))), messageId: ++counter } 
            varsMap[counter] = dataObj.vars
            return { data: dataObj.data, vars}
        })
        const restoreDataObjVars = jb.callbag.map(dataObj => {
            const origVars = varsMap[dataObj.vars.messageId] 
            varsMap[dataObj.messageId] = null
            return {data: dataObj.data, vars: Object.assign(origVars,dataObj.vars) }
        })

        if (jb.utils.isPromise(jbm)) {
            jb.log('jbm as promise in remote operator, adding request buffer', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
            return source => jb.callbag.pipe(jb.callbag.fromPromise(jbm),
                    jb.callbag.concatMap(_jbm=> jb.callbag.pipe(
                        source, jb.callbag.replay(5), cleanDataObjVars, _jbm.createCallbagOperator(stripedRx), restoreDataObjVars)))
        }
        return source => jb.callbag.pipe(source, cleanDataObjVars, jbm.createCallbagOperator(stripedRx), restoreDataObjVars)
    }
})

jb.component('remote.action', {
    type: 'action',
    description: 'exec a script on a remote node and returns a promise if not oneWay',
    params: [
      {id: 'action', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.self()},
      {id: 'oneway', as: 'boolean', description: 'do not wait for the respone' },
      {id: 'timeout', as: 'number', defaultValue: 10000 },
    ],
    impl: (ctx,action,jbm,oneway,timeout) => {
        if (!jbm)
            return jb.logError('remote.action - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        return Promise.resolve(jbm).then(_jbm => {
            if (!_jbm || !_jbm.remoteExec)
                return jb.logError('remote.action - can not resolve jbm', {in: jb.uri, jbm, _jbm, jbmProfile: ctx.profile.jbm, jb, ctx})
            return _jbm.remoteExec(jb.remoteCtx.stripFunction(action),{timeout,oneway,isAction: true})
        })
    }
})

jb.component('remote.data', {
    description: 'calc a script on a remote node and returns a promise',
    macroByValue: true,
    params: [
      {id: 'data', dynamic: true },
      {id: 'jbm', type: 'jbm', defaultValue: jbm.self()},
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
      {id: 'jbm', type: 'jbm'}
    ],
    impl: rx.pipe(
        source.watchableData({ref: '%$src%', includeChildren: 'yes'}),
        rx.map(obj(prop('op','%op%'), prop('path',({data}) => jb.db.pathOfRef(data.ref)))),
        sink.action(remote.action( remote.updateShadowData('%%'), '%$jbm%'))
    )
})

jb.component('remote.shadowResource', {
    type: 'action',
    description: 'shadow watchable data on remote jbm',
    params: [
      {id: 'resourceId', as: 'string' },
      {id: 'jbm', type: 'jbm'},
    ],
    impl: runActions(
        Var('resourceCopy', '%${%$resourceId%}%'),
        remote.action(addComponent({id: '%$resourceId%', value: '%$resourceCopy%', type: 'watchableData' }),'%$jbm%'),
        rx.pipe(
            source.watchableData({ref: '%${%$resourceId%}%', includeChildren: 'yes'}),
            rx.map(obj(prop('op','%op%'), prop('path',({data}) => jb.db.pathOfRef(data.ref)))),
            sink.action(remote.action( remote.updateShadowData('%%'), '%$jbm%')
        ))
    )
})

jb.component('remote.updateShadowData', {
    type: 'action:0',
    description: 'internal - update shadow on remote jbm',
    params: [
        {id: 'entry' },
    ],
    impl: (ctx,entry) => {
        jb.log('shadowData update',{op: entry.op, ctx})
        const ref = jb.db.refOfPath(entry.path)
        if (!ref)
            jb.logError('shadowData path not found at destination',{path: entry.path, ctx})
        else
            jb.db.doOp(ref, entry.op, ctx)
    }
})

jb.component('remote.copyPassiveData', {
    type: 'action',
    description: 'copy passive data to remote jbm',
    params: [
      {id: 'jbm', type: 'jbm'},
    ],
    impl: runActions(
        Var('passiveData', () => jb.db.passive()),
        remote.action( (ctx,passiveData) => Object.keys(passiveData).forEach(k=>jb.db.passive(k,passiveData[k])),
            '%$jbm%')
    )
})

/*** net comps */

jb.component('net.listSubJbms', {
    type: 'rx',
    category: 'source',
    impl: pipe(
        () => Object.values(jb.jbm.childJbms || {}),
        log('test listSubJbms 1'),
        remote.data(net.listSubJbms(),'%%'),
        log('test listSubJbms 2'),
        aggregate(list(() => jb.uri,'%%'))
    )
})

jb.component('net.getRootParentUri', {
    impl: () => jb.uri.split('•')[0]
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
})

jb.component('dataResource.yellowPages', { watchableData: {}})

jb.component('remote.useYellowPages', {
    type: 'action',
    impl: runActions(
        Var('yp','%$yellowPages%'),
        remote.action(({},{yp}) => jb.component('dataResource.yellowPages', { watchableData: yp }), '%$jbm%'),
        remote.initShadowData('%$yellowPages%', '%$jbm%'),
    )
})
;


};