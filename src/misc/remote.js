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
        return jbm.createCallbagSource(jbm.callbag ? rx : jb.remoteCtx.stripFunction(rx))
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
        return jbm.createCalllbagOperator(jbm.callbag ? rx : jb.remoteCtx.stripFunction(rx))
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
        return jbm.remoteExec(jb.remoteCtx.stripFunction(action),{timeout,oneway})
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
        return jbm.remoteExec(jb.remoteCtx.stripFunction(data),{timeout})
    }
})

jb.component('remote.shadowData', {
    description: 'shadow watchable data on remote jbm',
    macroByValue: true,
    params: [
      {id: 'src', as: 'ref', dynamic: true },
      {id: 'target', as :'string', description: 'ref as expression on target jbm. e.g. %$people%'},
      {id: 'jbm', type: 'jbm'},
    ],
    impl: rx.pipe(
        source.watchableData('%$src()%'),
        rx.map('%op%'),
        sink.action(remote.action( 
            (ctx,{},{target}) => jb.doOp(jb.exp(target,'ref'), ctx.data, ctx),
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
})