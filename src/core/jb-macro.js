Object.assign(jb, {
    defComponents: (items,def) => items.forEach(item=>def(item))
})

jb.extension('macro', {
    initExtension() {
        return { proxies: {}, macroNs: {}, isMacro: Symbol.for('isMacro')}
    },
    ns: nsIds => {
        nsIds.split(',').forEach(nsId => jb.macro.registerProxy(nsId))
        return jb.macro.proxies
    },    
    titleToId: id => id.replace(/[_-]([a-zA-Z])/g, (_, letter) => letter.toUpperCase()),
    importAll: () => ['var { ',
        jb.utils.unique(Object.keys(jb.macro.proxies).map(x=>x.split('_')[0])).join(', '), 
    '} = jb.macro.proxies;'].join(''),
    newProxy: id => new Proxy(() => 0, {
        get: (o, p) => p === jb.macro.isMacro? true : jb.macro.getInnerMacro(id, p),
        apply: function (target, thisArg, allArgs) {
            const { args, system } = jb.macro.splitSystemArgs(allArgs)
            return Object.assign(jb.macro.argsToProfile(id, args), system)
        }
    }),
    getInnerMacro(ns, innerId) {
        return (...allArgs) => {
            const { args, system } = jb.macro.splitSystemArgs(allArgs)
            const out = { $: `${ns}.${innerId}` }
            if (args.length == 0)
                Object.assign(out)
            else if (args.length == 1 && typeof args[0] == 'object' && !Array.isArray(args[0]) && !jb.utils.compName(args[0])) // params by name
                Object.assign(out, args[0])
            else
                Object.assign(out, { $byValue: args })
            return Object.assign(out, system)
        }
    },    
    splitSystemArgs(allArgs) {
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
    },
    argsToProfile(cmpId, args) {
        const comp = jb.comps[cmpId]
        if (args.length == 0)
            return { $: cmpId }        
        if (!comp)
            return { $: cmpId, $byValue: args }
        const params = comp.params || []
        const firstParamIsArray = (params[0] && params[0].type || '').indexOf('[]') != -1
        if (params.length == 1 && firstParamIsArray) // pipeline, or, and, plus
            return { $: cmpId, [params[0].id]: args }
        const macroByProps = args.length == 1 && typeof args[0] === 'object' &&
            (params[0] && args[0][params[0].id] || params[1] && args[0][params[1].id])
        if ((comp.macroByValue || params.length < 3) && comp.macroByValue !== false && !macroByProps)
            return { $: cmpId, ...jb.objFromEntries(args.filter((_, i) => params[i]).map((arg, i) => [params[i].id, arg])) }
        if (args.length == 1 && !Array.isArray(args[0]) && typeof args[0] === 'object' && !args[0].$)
            return { $: cmpId, ...args[0] }
        if (args.length == 1 && params.length)
            return { $: cmpId, [params[0].id]: args[0] }
        if (args.length == 2 && params.length > 1)
            return { $: cmpId, [params[0].id]: args[0], [params[1].id]: args[1] }
        debugger;
    },
    fixProfile(profile) {
        if (!profile || !profile.constructor || ['Object','Array'].indexOf(profile.constructor.name) == -1) return
        Object.values(profile).forEach(v=>jb.macro.fixProfile(v))
        if (profile.$byValue) {
          if (!jb.comps[profile.$])
            return jb.logError('fixProfile - missing component', {compId: profile.$, profile})
          Object.assign(profile, jb.macro.argsToProfile(profile.$, profile.$byValue))
          delete profile.$byValue
        }
    },    
    registerProxy: id => {
        const proxyId = jb.macro.titleToId(id.split('.')[0])
        if (jb.frame[proxyId] && jb.frame[proxyId][jb.macro.isMacro]) return
        if (jb.frame[proxyId])
            return jb.logError(`register macro proxy: ${proxyId} + ' is reserved by system or libs. please use a different name`,{obj:jb.frame[proxyId]})
        
        jb.frame[proxyId] = jb.macro.proxies[proxyId] = jb.macro.newProxy(proxyId)
    }
})

jb.component('Var', {
  type: 'var,system',
  isSystem: true,
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: '%%'}
  ],
  macro: (result, self) => {
    result.$vars = result.$vars || []
    result.$vars.push(self)
  },
  impl: '' // for inteliscript
})

jb.component('remark', {
  type: 'system',
  isSystem: true,
  params: [
    {id: 'remark', as: 'string', mandatory: true}
  ],
  macro: (result, self) => Object.assign(result,{ remark: self.remark })
})