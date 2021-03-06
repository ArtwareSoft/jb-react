Object.assign(jb, {
    component(_id,comp) {
      const id = jb.macroName(_id)
      try {
        const errStack = new Error().stack.split(/\r|\n/)
        const line = errStack.filter(x=>x && x != 'Error' && !x.match(/at Object.component/)).shift()
        comp[jb.core.location] = line ? (line.split('at eval (').pop().match(/\\?([^:]+):([^:]+):[^:]+$/) || ['','','','']).slice(1,3) : ['','']
        comp[jb.core.project] = comp[jb.core.location][0].split('?')[1]
        comp[jb.core.location][0] = comp[jb.core.location][0].split('?')[0]
      
        if (comp.watchableData !== undefined) {
          jb.comps[jb.db.addDataResourcePrefix(id)] = comp
          return jb.db.resource(jb.db.removeDataResourcePrefix(id),comp.watchableData)
        }
        if (comp.passiveData !== undefined) {
          jb.comps[jb.db.addDataResourcePrefix(id)] = comp
          return jb.db.passive(jb.db.removeDataResourcePrefix(id),comp.passiveData)
        }
      } catch(e) {
        console.log(e)
      }
  
      jb.comps[id] = comp;
  
      // fix as boolean params to have type: 'boolean'
      (comp.params || []).forEach(p=> {
        if (p.as == 'boolean' && ['boolean','ref'].indexOf(p.type) == -1)
          p.type = 'boolean'
      })
      comp[jb.core.loadingPhase] = jb.frame.jbLoadingPhase
      jb.registerMacro && jb.registerMacro(id)
    },    
    macroName: id => id.replace(/[_-]([a-zA-Z])/g, (_, letter) => letter.toUpperCase()),
    ns: nsIds => {
        nsIds.split(',').forEach(nsId => jb.registerMacro(nsId))
        return jb.macro
    },
    importAllMacros: () => ['var { ',
        jb.utils.unique(Object.keys(jb.macro).map(x=>x.split('_')[0])).join(', '), 
    '} = jb.macro;'].join(''),
    registerMacro: id => {
        const macroId = jb.macroName(id).replace(/\./g, '_')
        const nameSpace = id.indexOf('.') != -1 && jb.macroName(id.split('.')[0])

        if (checkId(macroId))
            registerProxy(macroId)
        if (nameSpace && checkId(nameSpace, true) && !jb.macro[nameSpace]) {
            registerProxy(nameSpace, true)
            jb.core.macroNs[nameSpace] = true
        }

        function registerProxy(proxyId) {
            jb.macro[proxyId] = new Proxy(() => 0, {
                get: (o, p) => {
                    if (typeof p === 'symbol') return true
                    return jb.macro[proxyId + '_' + p] || genericMacroProcessor(proxyId, p)
                },
                apply: function (target, thisArg, allArgs) {
                    const { args, system } = splitSystemArgs(allArgs)
                    return Object.assign(processMacro(args), system)
                }
            })
        }

        function splitSystemArgs(allArgs) {
            const args = [], system = {} // system props: constVar, remark
            allArgs.forEach(arg => {
                if (arg && typeof arg === 'object' && (jb.comps[arg.$] || {}).isSystem)
                    jb.comps[arg.$].macro(system, arg)
                else
                    args.push(arg)
            })
            if (args.length == 1 && typeof args[0] === 'object') {
                jb.asArray(args[0].vars).forEach(arg => jb.comps[arg.$].macro(system, arg))
                args[0].remark && jb.comps.remark.macro(system, args[0])
            }
            return { args, system }
        }

        function checkId(macroId, isNS) {
            if (jb.frame[macroId] && !jb.frame[macroId][jb.core.macroDef]) {
                jb.logError(macroId + ' is reserved by system or libs. please use a different name')
                return false
            }
            if (Object.keys(jb.macro[macroId] ||{}).length && !isNS && !jb.core.macroNs[macroId])
                jb.logError(macroId.replace(/_/g,'.') + ' is defined more than once, using last definition ' + id)
            return true
        }

        function processMacro(args) {
            const _id = id; //.replace(/\.\$forwardDef$/,'')
            const _profile = jb.comps[_id]
            if (!_profile) {
                jb.logError('forward def ' + _id + ' was not implemented')
                return { $: _id }
            }
            if (args.length == 0)
                return { $: _id }
            const params = _profile.params || []
            const firstParamIsArray = (params[0] && params[0].type || '').indexOf('[]') != -1
            if (params.length == 1 && firstParamIsArray) // pipeline, or, and, plus
                return { $: _id, [params[0].id]: args }
            const macroByProps = args.length == 1 && typeof args[0] === 'object' &&
                (params[0] && args[0][params[0].id] || params[1] && args[0][params[1].id])
            if ((_profile.macroByValue || params.length < 3) && _profile.macroByValue !== false && !macroByProps)
                return { $: _id, ...jb.objFromEntries(args.filter((_, i) => params[i]).map((arg, i) => [params[i].id, arg])) }
            if (args.length == 1 && !Array.isArray(args[0]) && typeof args[0] === 'object' && !args[0].$)
                return { $: _id, ...args[0] }
            if (args.length == 1 && params.length)
                return { $: _id, [params[0].id]: args[0] }
            if (args.length == 2 && params.length > 1)
                return { $: _id, [params[0].id]: args[0], [params[1].id]: args[1] }
            debugger;
        }
        //const unMacro = macroId => macroId.replace(/([A-Z])/g, (all, s) => '-' + s.toLowerCase())
        function genericMacroProcessor(ns, macroId) {
            return (...allArgs) => {
                const { args, system } = splitSystemArgs(allArgs)
                const out = { $: `${ns}.${macroId}` }
                if (args.length == 1 && typeof args[0] == 'object' && !jb.utils.compName(args[0]))
                    Object.assign(out, args[0])
                else
                    Object.assign(out, { $byValue: args })
                return Object.assign(out, system)
            }
        }
    }
})
