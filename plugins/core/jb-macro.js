Object.assign(jb, {
    defComponents: (items,def) => items.forEach(item=>def(item)),
    defOperator: (id, {detect, extractAliases, registerComp}) => operators.push({id, detect, extractAliases, registerComp})
})

extension('macro', {
    initExtension() {
        return { proxies: {}, macroNs: {}, isMacro: Symbol.for('isMacro'), systemProps: ['remark', 'debug', 'disabled', 'log' ] }
    },  
    titleToId: id => id.replace(/-([a-zA-Z])/g, (_, letter) => letter.toUpperCase()),
//    proxiesKeys: () => jb.utils.unique(Object.keys(jb.macro.proxies).map(x=>x.split('_')[0])),
    newProxy: id => new Proxy(() => 0, {
        get: (o, p) => p === jb.macro.isMacro? true : jb.macro.getInnerMacro(id, p),
        apply: function (target, thisArg, allArgs) {
            const actualId = id[0] == '_' ? id.slice(1) : id
            const { args, system } = jb.macro.splitSystemArgs(allArgs)
            return { $: actualId, $byValue: args, ...system, ...(id[0] == '_' ? {$disabled:true} : {} ) }
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
            else if (arg && typeof arg === 'object' && (jb.comps[arg.$] || {}).isMacro)
                args.push(jb.comps[arg.$].macro(arg))
            else
                args.push(arg)
        })
        if (args.length == 1 && typeof args[0] === 'object') {
            jb.asArray(args[0].vars).forEach(arg => jb.comps[arg.$].macro(system, arg))
            delete args[0].vars
            args[0].remark && jb.comps.remark.macro(system, args[0])
        }
        return { args, system }
    },
    argsToProfile(cmpId, comp, args, topComp) {
        if (args.length == 0)
            return { $: cmpId }        
        if (!comp)
            return { $: cmpId, $byValue: args }
        const lastArg = args.length > 1 && args[args.length-1]
        const lastArgIsByName = lastArg && typeof lastArg == 'object' && !Array.isArray(lastArg) && !lastArg.$
        if (lastArgIsByName) // || topComp && topComp[jb.core.CT].mixed) 
            return jb.macro.mixedArgsToProfile(cmpId, comp, args)

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
    mixedArgsToProfile(cmpId, comp, args) {
        //console.error('%c mixedArgsToProfile: ','color: red', cmpId, comp)
        if (cmpId == 'asIs') return { $: 'asIs', $asIs: args[0] }
        const lastArg = args[args.length-1]
        const lastArgIsByName = lastArg && typeof lastArg == 'object' && !Array.isArray(lastArg) && !lastArg.$
        let argsByValue = lastArgIsByName ? args.slice(0,-1) : args
        const propsByName = lastArgIsByName ? lastArg : {}
        const onlyByName = lastArgIsByName && args.length == 1

        const params = comp.params || []
        const param0 = params[0] ? params[0] : {}
        const firstParamAsArray = param0.as == 'array' || (param0.type||'').indexOf('[]') != -1
        const varArgs = []
        while (argsByValue[0] && argsByValue[0].$ == 'Var')
            varArgs.push(argsByValue.shift())
        if (firstParamAsArray && argsByValue.length == 1)
            argsByValue = argsByValue[0]
        const firstProps = onlyByName ? [] : firstParamAsArray ? { [param0.id] : argsByValue } : jb.objFromEntries(argsByValue.map((v,i) => [params[i].id, v]))
        return { $: cmpId,
            ...(varArgs.length ? {$vars: varArgs} : {}),
            ...firstProps, ...propsByName
        }
    },
    registerProxy: id => {
        const proxyId = jb.macro.titleToId(id.split('.')[0]) //.split('_')[0]
        return [proxyId, jb.macro.proxies[proxyId] = jb.macro.proxies[proxyId] || jb.macro.newProxy(proxyId)]
        // return [proxyId,`_${proxyId}`].map(proxyId => {
        //     jb.macro.proxies[proxyId] = jb.macro.proxies[proxyId] || jb.macro.newProxy(proxyId)
        //     return [proxyId,jb.macro.proxies[proxyId]]
        // })
    }
})

component('Var', {
  type: 'var,system',
  isSystem: true,
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, type: 'data', mandatory: true, defaultValue: '%%'}
  ],
  macro: (result, self) => {
    result.$vars = result.$vars || []
    result.$vars.push(self)
  }
})

component('remark', {
  type: 'system',
  isSystem: true,
  params: [
    {id: 'remark', as: 'string', mandatory: true}
  ],
  macro: (result, self) => Object.assign(result,{ $remark: self.remark || self.$byValue[0] })
})

extension('syntaxConverter', 'onAddComponent', {
  initExtension() { 
    jb.core.onAddComponent.push({ 
//        match:(id,comp) => (jb.path(comp[jb.core.CT].plugin,'files') || []).find(x=>x.path.match(/amta/)),
        //match:(id,comp) => (jb.path(comp[jb.core.CT].plugin,'files') || []).find(x=>x.path.match(/tests/)),
        match:(id,comp) => false,
      register: (_id,_comp,dsl) => {
        //if (_id == 'amta.aa') debugger
        const comp = jb.syntaxConverter.fixProfile(_comp,_comp,_id)
        const id = jb.macro.titleToId(_id)
        jb.core.unresolvedProfiles.push({id,comp,dsl})
        comp[jb.core.CT] = _comp[jb.core.CT]
        return comp
      }
    })    
  },
  fixProfile(profile,origin,id) {
    if (profile === null) return
    if (!profile || jb.utils.isPrimitiveValue(profile) || typeof profile == 'function') return profile
    // if (profile.$ == 'uiTest') {
    //     if ((jb.path(profile.$byValue[0].userInput,'$') || '').indexOf('userInput.') == 0) {
    //         profile.$byValue[0].uiAction = profile.$byValue[0].userInput
    //         profile.$byValue[0].uiAction.$ = profile.$byValue[0].uiAction.$.slice('userInput.'.length)
    //     }
    // }
    // if (profile.$ == 'uiFrontEndTest' && profile.$byValue[0].action) {
    //     profile.$byValue[0].uiAction = profile.$byValue[0].action
    //     delete profile.$byValue[0].action
    // }

    // ;['pipeline','list','firstSucceeding','concat','and','or'].forEach(sugar => {
    //     if (profile['$'+sugar]) {
    //         profile.$ = sugar
    //         profile.items = profile['$'+sugar]
    //         delete profile['$'+sugar]
    //     }
    // })
    // ;['not'].forEach(sugar => {
    //     if (profile['$'+sugar]) {
    //         profile.$ = sugar
    //         profile.of = profile['$'+sugar]
    //         delete profile['$'+sugar]
    //     }
    // })
    if (jb.syntaxConverter.amtaFix)
        profile = jb.syntaxConverter.amtaFix(profile)

    const $vars = profile.$vars
    if ($vars && !Array.isArray($vars))
        profile.$vars = jb.entries($vars).map(([name,val]) => ({name,val}))

    if (profile.$)
        profile.$ = jb.macro.titleToId(profile.$)
    if (profile.remark) {
        profile.$remark = profile.remark
        delete profile.remark
    }
    
    if (profile.$ == 'object')
        return {$: 'obj', props: jb.entries(profile).filter(([x]) =>x!='$').map(([title,val]) => ({$: 'prop', title, val: jb.syntaxConverter.fixProfile(val,origin) }))}

    if (Array.isArray(profile)) 
        return profile.map(v=>jb.syntaxConverter.fixProfile(v,origin))

    return jb.objFromEntries(jb.entries(profile).map(([k,v]) => [k,jb.syntaxConverter.fixProfile(v,origin)]))
  }
})