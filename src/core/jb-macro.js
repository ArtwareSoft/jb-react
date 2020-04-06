Object.assign(jb, {
    macroDef: Symbol('macroDef'), macroNs: {}, 
    macroName: id => id.replace(/[_-]([a-zA-Z])/g, (_, letter) => letter.toUpperCase()),
    ns: nsIds => nsIds.split(',').forEach(nsId => jb.registerMacro(nsId + '.$dummyComp', {})),
    registerMacro: (id, profile) => {
        const macroId = jb.macroName(id).replace(/\./g, '_')
        const nameSpace = id.indexOf('.') != -1 && jb.macroName(id.split('.')[0])

        if (checkId(macroId))
            registerProxy(macroId)
        if (nameSpace && checkId(nameSpace, true) && !jb.frame[nameSpace]) {
            registerProxy(nameSpace, true)
            jb.macroNs[nameSpace] = true
        }

        function registerProxy(proxyId) {
            jb.frame[proxyId] = new Proxy(() => 0, {
                get: (o, p) => {
                    if (typeof p === 'symbol') return true
                    return jb.frame[proxyId + '_' + p] || genericMacroProcessor(proxyId, p)
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
            if (jb.frame[macroId] && !jb.frame[macroId][jb.macroDef]) {
                jb.logError(macroId + ' is reserved by system or libs. please use a different name')
                return false
            }
            if (jb.frame[macroId] !== undefined && !isNS && !jb.macroNs[macroId] && !macroId.match(/_\$dummyComp$/))
                jb.logError(macroId.replace(/_/g,'.') + ' is defined more than once, using last definition ' + id)
            return true;
        }

        function processMacro(args) {
            if (args.length == 0)
                return { $: id }
            const params = profile.params || []
            const firstParamIsArray = (params[0] && params[0].type || '').indexOf('[]') != -1
            if (params.length == 1 && firstParamIsArray) // pipeline, or, and, plus
                return { $: id, [params[0].id]: args }
            const macroByProps = args.length == 1 && typeof args[0] === 'object' &&
                (params[0] && args[0][params[0].id] || params[1] && args[0][params[1].id])
            if ((profile.macroByValue || params.length < 3) && profile.macroByValue !== false && !macroByProps)
                return { $: id, ...jb.objFromEntries(args.filter((_, i) => params[i]).map((arg, i) => [params[i].id, arg])) }
            if (args.length == 1 && !Array.isArray(args[0]) && typeof args[0] === 'object' && !args[0].$)
                return { $: id, ...args[0] }
            if (args.length == 1 && params.length)
                return { $: id, [params[0].id]: args[0] }
            if (args.length == 2 && params.length > 1)
                return { $: id, [params[0].id]: args[0], [params[1].id]: args[1] }
            debugger;
        }
        //const unMacro = macroId => macroId.replace(/([A-Z])/g, (all, s) => '-' + s.toLowerCase())
        function genericMacroProcessor(ns, macroId) {
            return (...allArgs) => {
                const { args, system } = splitSystemArgs(allArgs)
                const out = { $: `${ns}.${macroId}` }
                if (args.length == 1 && typeof args[0] == 'object' && !jb.compName(args[0]))
                    Object.assign(out, args[0])
                else
                    Object.assign(out, { $byValue: args })
                return Object.assign(out, system)
            }
        }
    }
})
