using('common,pretty-print,rx')

component('source.remote', {
    type: 'rx<>',
    macroByValue: true,
    params: [
      {id: 'rx', type: 'rx<>', dynamic: true },
      {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self() },
    ],
    impl: (ctx,rx,jbm) => {
        if (!jbm)
            return jb.logError('source.remote - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        const stripedRx = jbm.callbag ? rx : jb.remoteCtx.stripFunction(rx)
        return jb.callbag.pipe(
            jb.callbag.fromPromise(jbm), jb.callbag.mapPromise(_jbm=>_jbm.rjbm()),
            jb.callbag.concatMap(rjbm => rjbm.createCallbagSource(stripedRx)))
    }        
})

component('remote.operator', {
    type: 'rx<>',
    macroByValue: true,
    params: [
      {id: 'rx', type: 'rx<>', dynamic: true },
      {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()},
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
            const vars = { ...jb.objFromEntries(jb.entries(dataObj.vars).filter(e => jb.remoteCtx.shouldPassVar(e[0],profText))), messageId: ++counter } 
            varsMap[counter] = dataObj.vars
            return { data: dataObj.data, vars}
        })
        const restoreDataObjVars = jb.callbag.map(dataObj => {
            const origVars = varsMap[dataObj.vars.messageId] 
            varsMap[dataObj.messageId] = null
            return origVars ? {data: dataObj.data, vars: Object.assign(origVars,dataObj.vars) } : dataObj
        })
        return source => jb.callbag.pipe(
            jb.callbag.fromPromise(jbm), jb.callbag.mapPromise(_jbm=>_jbm.rjbm()),
            jb.callbag.concatMap(rjbm => jb.callbag.pipe(
                source, jb.callbag.replay(5), cleanDataObjVars, rjbm.createCallbagOperator(stripedRx), restoreDataObjVars)))

        // if (jb.utils.isPromise(jbm)) {
        //     jb.log('jbm as promise in remote operator, adding request buffer', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        //     return source => jb.callbag.pipe(jb.callbag.fromPromise(jbm),
        //             jb.callbag.concatMap(_jbm=> jb.callbag.pipe(
        //                 source, jb.callbag.replay(5), cleanDataObjVars, _jbm.createCallbagOperator(stripedRx), restoreDataObjVars)))
        // }
        //return source => jb.callbag.pipe(source, cleanDataObjVars, jbm.createCallbagOperator(stripedRx), restoreDataObjVars)
    }
})

component('remote.action', {
    type: 'action<>',
    description: 'exec a script on a remote node and returns a promise if not oneWay',
    params: [
      {id: 'action', type: 'action', dynamic: true },
      {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()},
      {id: 'oneway', as: 'boolean', description: 'do not wait for the respone' },
      {id: 'timeout', as: 'number', defaultValue: 10000 },
      {id: 'require', as: 'string'},
    ],
    impl: async (ctx,action,jbm,oneway,timeout,require) => {
        if (!jbm)
            return jb.logError('remote.action - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        const rjbm = await (await jbm).rjbm()
        if (!rjbm || !rjbm.remoteExec)
            return jb.logError('remote.action - can not resolve jbm', {in: jb.uri, jbm, rjbm, jbmProfile: ctx.profile.jbm, jb, ctx})
        action.require = require
        return rjbm.remoteExec(jb.remoteCtx.stripFunction(action),{timeout,oneway,isAction: true})
    }
})

component('remote.data', {
  description: 'calc a script on a remote node and returns a promise',
  params: [
    {id: 'data', dynamic: true},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: jbm.self()},
    {id: 'timeout', as: 'number', defaultValue: 10000},
    {id: 'require', as: 'string'},
  ],
  impl: async (ctx,data,jbm,timeout,require) => {
        if (jbm == jb)
            return data()
        if (!jbm)
            return jb.logError('remote.data - can not find jbm', {in: jb.uri, jbm: ctx.profile.jbm, jb, ctx})
        const rjbm = await (await jbm).rjbm()
        if (!rjbm || !rjbm.remoteExec)
            return jb.logError('remote.data - can not resolve jbm', {in: jb.uri, jbm, rjbm, jbmProfile: ctx.profile.jbm, jb, ctx})
                
        data.require = require
        return rjbm.remoteExec(jb.remoteCtx.stripFunction(data),{timeout})
    }
})

component('remote.initShadowData', {
    type: 'action<>',
    description: 'shadow watchable data on remote jbm',
    params: [
      {id: 'src', as: 'ref' },
      {id: 'jbm', type: 'jbm<jbm>'}
    ],
    impl: rx.pipe(
        source.watchableData({ref: '%$src%', includeChildren: 'yes'}),
        rx.map(obj(prop('op','%op%'), prop('path',({data}) => jb.db.pathOfRef(data.ref)))),
        sink.action(remote.action( remote.updateShadowData('%%'), '%$jbm%'))
    )
})

component('remote.copyPassiveData', {
  type: 'action<>',
  description: 'shadow watchable data on remote jbm',
  params: [
    {id: 'resourceId', as: 'string'},
    {id: 'jbm', type: 'jbm<jbm>'}
  ],
  impl: runActions(
    Var('resourceCopy', '%${%$resourceId%}%'),
    remote.action(
      addComponent({
        id: '%$resourceId%',
        value: '%$resourceCopy%',
        type: 'passiveData'
      }),
      '%$jbm%'
    )
  )
})

component('remote.shadowResource', {
    type: 'action<>',
    description: 'shadow watchable data on remote jbm',
    params: [
      {id: 'resourceId', as: 'string' },
      {id: 'jbm', type: 'jbm<jbm>'},
    ],
    impl: runActions(
        Var('resourceCopy', '%${%$resourceId%}%'),
        remote.action(runActions(
            () => 'for loader - jb.watchable.initResourcesRef()',
            addComponent({id: '%$resourceId%', value: '%$resourceCopy%', type: 'watchableData' }))
        ,'%$jbm%'),
        rx.pipe(
            source.watchableData({ref: '%${%$resourceId%}%', includeChildren: 'yes'}),
            rx.map(obj(prop('op','%op%'), prop('path',({data}) => jb.db.pathOfRef(data.ref)))),
            sink.action(remote.action( remote.updateShadowData('%%'), '%$jbm%')
        ))
    ),
})

component('remote.updateShadowData', {
    type: 'action<>:0',
    description: 'internal - update shadow on remote jbm',
    params: [
        {id: 'entry' },
    ],
    impl: (ctx,{path,op}) => {
        jb.log('shadowData update',{op, ctx})
        const ref = jb.db.refOfPath(path)
        if (!ref)
            jb.logError('shadowData path not found at destination',{path, ctx})
        else
            jb.db.doOp(ref, op, ctx)
    }
})

/*** net comps */

component('net.listSubJbms', {
    type: 'rx<>',
    category: 'source',
    impl: pipe(
        () => Object.values(jb.jbm.childJbms || {}),
        log('test listSubJbms 1'),
        remote.data(net.listSubJbms(),'%%'),
        log('test listSubJbms 2'),
        aggregate(list(() => jb.uri,'%%'))
    )
})

component('net.getRootextentionUri', {
    impl: () => jb.uri.split('•')[0]
})

component('net.listAll', {
    impl: remote.data(
        pipe(
            () => Object.values(jb.jbm.networkPeers || {}),
            remote.data(net.listSubJbms(),'%%'),
            aggregate(list(net.listSubJbms() ,'%%'))
        )
        ,byUri(net.getRootextentionUri())
    )
})

// component('dataResource.yellowPages', { watchableData: {}})

// component('remote.useYellowPages', {
//     type: 'action<>',
//     impl: runActions(
//         Var('yp','%$yellowPages%'),
//         remote.action(({},{yp}) => component('dataResource.yellowPages', { watchableData: yp }), '%$jbm%'),
//         remote.initShadowData('%$yellowPages%', '%$jbm%'),
//     )
// })
