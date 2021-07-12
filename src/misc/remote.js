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
        if (jb.utils.isPromise(jbm)) {
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
