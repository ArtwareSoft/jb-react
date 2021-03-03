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
      {id: 'jbm', type: 'jbm', defaultValue: jbm.same()},
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
        rx.map(obj(prop('op','%op%'), prop('path',({data}) => jb.db.pathOfRef(data.ref)))),
        sink.action(remote.action( 
            ctx => jb.db.doOp(jb.db.refOfPath(ctx.data.path), ctx.data.op, ctx),
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