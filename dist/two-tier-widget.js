jb.ns('remote,rx')

Object.assign(jb.ui, {
    widgetUserRequests: jb.callbag.subject(),
    widgetRenderingSrc: jb.callbag.replayWithTimeout(1000)(jb.ui.renderingUpdates),
    headless: {},
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
        const {delta,css,widgetId,cmpId} = ctx.data
        if (css) 
            return !ctx.vars.headlessWidget && jb.ui.addStyleElem(css)
        const ctxToUse = ctx.setVars({headlessWidget: false, FEwidgetId: widgetId})
        const elem = cmpId ? null : jb.ui.widgetBody(ctxToUse)
        jb.ui.applyDeltaToCmp(delta,ctxToUse,cmpId,elem)
    })
})

jb.component('widget.headless', {
    type: 'rx',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'widgetId', as: 'string'},
    ],
    impl: (ctx,ctrl,widgetId) => {
        const {renderingUpdates, widgetRenderingSrc, compareVdom, h } = jb.ui
        const filteredSrc = jb.callbag.filter(m=>m.widgetId == widgetId)(widgetRenderingSrc)
        const cmp = ctrl(jb.ui.extendWithServiceRegistry(ctx.setVars({headlessWidget: true,headlessWidgetId: widgetId})))
        const top = h(cmp)
        const body = h('div',{ widgetTop: true, headless: true, widgetId, remoteUri: ctx.vars.remoteUri },top)
        jb.ui.headless[widgetId] = { body }
        jb.log('headless widget created',[widgetId,body])
        renderingUpdates.next({widgetId, delta: compareVdom({},top)})
        return userReqIn => (start, sink) => {
            if (start !== 0) return
            const talkback = []
            sink(0, function headless(t, d) {
                if (t == 1 && d == null)
                    talkback.forEach(tb=>tb(1))
            })
            filteredSrc(0, function headless(t, d) {
                jb.log('headless widget delta out',[widgetId,t,d])
                if (t == 0) talkback.push(d)
                if (t === 2) sink(t,d)
                if (t === 1 && d) sink(t,ctx.dataObj(d))
            })
    
            userReqIn(0, function headless(t, d) {
              jb.log('headless widget userRequset in',[widgetId,t,d])
              if (t == 0) talkback.push(d)
              if (t === 2) sink(t,d)
              if (t === 1 && d && d.data.widgetId == widgetId) handleUserReq(d.data)
//              if (t === 1 && d && d.data.destroyWidget) sink(2)
            })
        }

        function handleUserReq(userReq) {
            jb.log('headless widget handle userRequset',[userReq.widgetId,userReq])
            if (userReq.$ == 'runCtxAction')
                jb.ui.runCtxAction(jb.ctxDictionary[userReq.ctxIdToRun],userReq.data,userReq.vars)
            if (userReq.$ == 'destroy') {
                jb.ui.BECmpsDestroyNotification.next({cmps: userReq.cmps, destroyLocally: true})
                if (userReq.destroyWidget) jb.delay(1).then(()=> {
                    jb.log('destroy headless widget request',[userReq.widgetId,userReq])
                    jb.delay(100).then(()=>{ 
                        jb.log('destroy headless widget',[userReq.widgetId,userReq])
                        delete jb.ui.headless[userReq.widgetId]
                    }) // delay needed for tests
                })
            }
        }
    }
})

jb.component('widget.twoTierWidget', {
    type: 'control',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'remote', type: 'remote', defaultValue: remote.worker({libs: ['common','ui-common','remote','two-tier-widget']}) },
//      {id: 'id', as: 'string'},
    ],
    impl: controlWithFeatures({
        vars: Var('widgetId', ctx => 'widget' + ctx.id),
        control: widget.frontEndCtrl('%$widgetId%'),
        features: followUp.flow(
            source.callbag(() => jb.ui.widgetUserRequests),
            rx.log('twoTierWidget userReq'),
            rx.filter('%widgetId% == %$widgetId%'),
            rx.takeWhile('%ev.type% != destroy'),
            //source.frontEndUserEvent('%$widgetId%'),
            rx.log('twoTierWidget sent to headless'),
            remote.operator(widget.headless(call('control'),'%$widgetId%'), '%$remote%'),
            rx.log('twoTierWidget arrives from headless'),
            sink.frontEndDelta('%$widgetId%'),
        )
    })
})
;
