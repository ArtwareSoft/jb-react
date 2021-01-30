var {rx, remote, widget} = jb.ns('remote,rx,widget')

Object.assign(jb.ui, {
    widgetUserRequests: jb.callbag.subject(),
    widgetRenderingSrc: jb.callbag.replayWithTimeout(1000)(jb.ui.renderingUpdates),
    headless: {},
    frontendWidgets: {},
    newWidgetId(ctx, remote) {
        const id = remote.uri + '-' + ctx.id
        jb.ui.frontendWidgets[id] = remote
        return id
    }
})

jb.component('widget.frontEndCtrl', {
    type: 'control',
    params: [
      {id: 'widgetId', as: 'string'},
    ],
    impl: group({
        features: [
            htmlAttribute('widgetId','%$widgetId%'),
            htmlAttribute('remoteUri','%$remoteUri%'),
            htmlAttribute('widgetTop','true'),
            htmlAttribute('frontend','true'),
        ]
    })
})

jb.component('sink.frontEndDelta', {
    type: 'rx',
    impl: sink.action( ctx => {
        const {delta,css,widgetId,cmpId,assumedVdom} = ctx.data
        if (css) 
            return !ctx.vars.headlessWidget && jb.ui.addStyleElem(ctx,css)
        const ctxToUse = ctx.setVars({headlessWidget: false, FEwidgetId: widgetId})
        const elem = cmpId ? jb.ui.find(jb.ui.widgetBody(ctxToUse),`[cmp-id="${cmpId}"]`)[0] : jb.ui.widgetBody(ctxToUse)
        try {
            const res = elem && jb.ui.applyDeltaToCmp({delta,ctx: ctxToUse,cmpId,elem,assumedVdom})
            if (jb.path(res,'recover')) {
                jb.log('headless frontend recover widget request',{widgetId,ctx,elem,cmpId, ...res})
                jb.ui.widgetUserRequests.next({$: 'recoverWidget', widgetId, ...res })
            }
        } catch(e) {
            jb.logException(e,'headless frontend apply delta',{ctx,elem,cmpId})
        }
    })
})

jb.component('widget.headless', {
    type: 'rx',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'widgetId', as: 'string'},
    ],
    impl: (ctx,ctrl,widgetId) => {
        const {renderingUpdates, widgetRenderingSrc, h,unmount } = jb.ui
        const filteredSrc = jb.callbag.filter(m=>m.widgetId == widgetId)(widgetRenderingSrc)
        createWidget()
        return userReqIn => (start, sink) => {
            if (start !== 0) return
            const talkback = []
            sink(0, function headless(t, d) {
                if (t == 1 && d == null)
                    talkback.forEach(tb=>tb(1))
            })
            filteredSrc(0, function headless(t, d) {
                jb.log('headless widget delta out',{widgetId,t,d,ctx})
                if (t == 0) talkback.push(d)
                if (t === 2) sink(t,d)
                if (t === 1 && d) sink(t,ctx.dataObj(d))
            })
    
            userReqIn(0, function headless(t, d) {
              jb.log('headless widget userRequset in',{widgetId,t,d,ctx})
              if (t == 0) talkback.push(d)
              if (t === 2) sink(t,d)
              if (t === 1 && d && d.data.widgetId == widgetId) handleUserReq(d.data,sink)
            })
        }

        function createWidget(recover) {
            const ctxToUse = jb.ui.extendWithServiceRegistry(ctx.setVars(
                {...(recover && { recover: true}), headlessWidget: true, headlessWidgetId: widgetId
            }))
            const cmp = ctrl(ctxToUse)
            const top = h(cmp)
            const body = h('div',{ widgetTop: true, headless: true, widgetId, ...(ctx.vars.remoteUri && { remoteUri: ctx.vars.remoteUri })},top)
            if (jb.ui.headless[widgetId]) {
                if (!recover) jb.logError('headless widgetId already exists',{widgetId,ctx})
                unmount(jb.ui.headless[widgetId])
            }
            if (recover && !jb.ui.headless[widgetId])
                jb.logError('headless recover no existing widget',{widgetId,ctx})
            jb.ui.headless[widgetId] = { body }
            jb.log('headless widget created',{widgetId,body})
            const delta = { children: {resetAll : true, toAppend: [jb.ui.stripVdom(top)]} }
            renderingUpdates.next({widgetId, delta })
        }

        function handleUserReq(userReq, sink) {
            jb.log('headless widget handle userRequset',{widgetId: userReq.widgetId,userReq})
            if (userReq.$ == 'runCtxAction') {
                const ctx = jb.ctxDictionary[userReq.ctxIdToRun]
                if (!ctx)
                    return jb.logError(`headless widget runCtxAction. no ctxId ${userReq.ctxIdToRun}`,{userReq})
                jb.ui.runCtxActionAndUdateCmpState(ctx,userReq.data,userReq.vars)
            } else if (userReq.$ == 'recoverWidget') {
                jb.log('recover headless widget',{userReq})
                //createWidget(true)
            } else if (userReq.$ == 'destroy') {
                jb.log('destroy headless widget request',{widgetId: userReq.widgetId,userReq})
                jb.ui.BECmpsDestroyNotification.next({cmps: userReq.cmps, destroyLocally: true})
                if (userReq.destroyWidget) jb.delay(1).then(()=> {
                        jb.log('destroy headless widget',{widgetId: userReq.widgetId,userReq})
                        delete jb.ui.headless[userReq.widgetId]
                    }) // the delay is needed for tests
                sink(2)
            }
        }
    }
})

jb.component('widget.twoTierWidget', {
    type: 'control',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: jbm.worker({libs: ['common','ui-common','remote','two-tier-widget']}) },
    ],
    impl: controlWithFeatures({
        vars: Var('widgetId', (ctx,{},{remote}) => jb.ui.newWidgetId(ctx,remote)),
        control: widget.frontEndCtrl('%$widgetId%'),
        features: followUp.flow(
            source.callbag(() => jb.ui.widgetUserRequests),
            rx.log('twoTierWidget userReq'),
            rx.filter('%widgetId% == %$widgetId%'),
            rx.takeWhile(({data}) => data.$ != 'destroy',true),
            //source.frontEndUserEvent('%$widgetId%'),
            rx.log('twoTierWidget sent to headless'),
            remote.operator(widget.headless(call('control'),'%$widgetId%'), '%$remote%'),
            rx.log('twoTierWidget arrived from headless'),
            sink.frontEndDelta('%$widgetId%'),
        )
    })
})

jb.component('widget.headlessWidgets', {
    impl: () => Object.keys(jb.ui.headless)
})