Object.assign(jb, {
    defComponents: (items,def) => items.forEach(item=>def(item)),
    defOperator: (id, {detect, extractAliases, registerComp}) => operators.push({id, detect, extractAliases, registerComp})
})

// debugger eval(jb.macro.importAll().replace(/, location/,''))

jb.extension('macro', {
    initExtension() {
        return { proxies: {}, macroNs: {}, isMacro: Symbol.for('isMacro') }
        // for loader jb.macro.importAll()
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
            return { $: id, $byValue: args, ...system }
        }
    }),
    getInnerMacro(ns, innerId) {
        return (...allArgs) => {
            const { args, system } = jb.macro.splitSystemArgs(allArgs)
            // const out = { $: `${ns}.${innerId}` }
            // if (args.length == 0)
            //     Object.assign(out)
            // else if (jb.macro.isParamsByNameArgs(args))
            //     Object.assign(out, args[0])
            // else
            //     Object.assign(out, { $byValue: args })
            // return Object.assign(out, system)

            return { $: `${ns}.${innerId}`, 
                ...(args.length == 0 ? {} : jb.macro.isParamsByNameArgs(args) ? args[0] : { $byValue: args }),
                ...system
            }
        }
    },
    isParamsByNameArgs : args => args.length == 1 && typeof args[0] == 'object' && !Array.isArray(args[0]) && !jb.utils.compName(args[0]),    
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
            args[0].typeCast && jb.comps.typeCast.macro(system, args[0])
        }
        return { args, system }
    },
    argsToProfile(cmpId, comp, args) { // todo - fix dsl type
        if (args.length == 0)
            return { $: cmpId }        
        if (!comp)
            return { $: cmpId, $byValue: args }
        const params = comp.params || []
        const singleParamAsArray = (params[0] && params[0].type || '').indexOf('[]') != -1
        if (params.length == 1 && singleParamAsArray) // pipeline, or, and, plus
            return { $: cmpId, [params[0].id]: args }
        const macroByProps = args.length == 1 && typeof args[0] === 'object' &&
            (params[0] && args[0][params[0].id] || params[1] && args[0][params[1].id])
        if ((comp.macroByValue || params.length < 3) && comp.macroByValue !== false && !macroByProps)
            return { $: cmpId, ...jb.objFromEntries(args.filter((_, i) => params[i]).map((arg, i) => [params[i].id, arg])) }
        if (args.length == 1 && !Array.isArray(args[0]) && typeof args[0] === 'object' && !args[0].$)
            return { $: cmpId, ...args[0] }
        if (args.length == 1 && params.length)
            return { $: cmpId, [params[0].id]: args[0] }
        if (args.length >= 2 && params.length > 1)
            return { $: cmpId, [params[0].id]: args[0], [params[1].id]: args[1] }
        debugger;
    },
    registerProxy: id => {
        const proxyId = jb.macro.titleToId(id.split('.')[0])
        if (jb.frame[proxyId] && jb.frame[proxyId][jb.macro.isMacro]) return
        // if (jb.frame[proxyId])
        //     return jb.logError(`register macro proxy: ${proxyId} ' is reserved by system or libs. please use a different name`,{obj:jb.frame[proxyId]})
        
        jb.macro.proxies[proxyId] = jb.macro.newProxy(proxyId)
        //jb.frame[proxyId] = jb.macro.proxies[proxyId]
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
  macro: (result, self) => Object.assign(result,{ remark: self.remark || self.$byValue[0] })
})

jb.component('typeCast', {
  type: 'system',
  isSystem: true,
  params: [
    {id: 'typeCast', as: 'string', mandatory: true, description: 'e.g. type1<myDsl>'}
  ],
  macro: (result, self) => Object.assign(result,{ $typeCast: self.typeCast || self.$byValue[0]})
})