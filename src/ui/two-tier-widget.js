jb.ns('remote,rx')

Object.assign(jb.ui, {
    widgetUserRequests: jb.callbag.subject(),
    widgetRenderingSrc: jb.callbag.replayFirst(m=>m.widgetId)(jb.ui.renderingUpdates),
    widgets: {},
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
        const {delta,css} = ctx.data
        const {widgetBody, applyDeltaToDom, addStyleElem, refreshFrontEnd} = jb.ui
        const elem = widgetBody(ctx)
        if (elem) {
            applyDeltaToDom(elem, delta)
            refreshFrontEnd(elem)
        }
        css && addStyleElem(css)
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
        const cmp = ctrl(ctx.setVars({headlessWidget: true,widgetId}))
        const top = h(cmp)
        const body = h('div',{ widgetTop: true, headless: true, widgetId, remoteUri: ctx.vars.remoteUri },top)
        jb.ui.widgets[widgetId] = { body }
        renderingUpdates.next({widgetId, delta: compareVdom({},top), cmpId: cmp.cmpId})
        return userReqIn => (start, sink) => {
            if (start !== 0) return
            const talkback = []
            sink(0, function headless(t, d) {
                if (t == 1 && d == null)
                    talkback.forEach(tb=>tb(1))
            }) 
            widgetRenderingSrc(0, function headless(t, d) {
                if (t == 0) talkback.push(d)
                if (t === 2) sink(t,d)
                if (t === 1 && d && d.widgetId == widgetId) sink(t,ctx.dataObj(d))
            })
    
            userReqIn(0, function headless(t, d) {
              if (t == 0) talkback.push(d)
              if (t === 2) sink(t,d)
              if (t === 1 && d && d.data.widgetId == widgetId) handleUserReq(d.data)
//              if (t === 1 && d && d.data.destroyWidget) sink(2)
            })
        }
        // return userReqIn => ctx.run(rx.pipe(
        //     rx.merge(
        //         rx.pipe(()=>userReqIn, rx.log('headless user req'),
        //             rx.do(userReq => handleUserReq(userReq.data)) ),
        //         rx.pipe(source.callbag(()=>widgetRenderingSrc), rx.filter(`%widgetId% == ${widgetId}`),
        //             rx.log('headless rendering delta'), rx.var('rendering',true)),
        //     ),
        //     rx.takeWhile(not('%destroyWidget%')),
        //     rx.filter('%$rendering%'),
        // ))

        function handleUserReq(userReq) {
            if (userReq.$ == 'runCtxAction')
                jb.ui.runCtxAction(jb.ctxDictionary[userReq.ctxIdToRun],userReq.data,userReq.vars)
            if (userReq.$ == 'destroy') {
                jb.ui.BECmpsDestroyNotification.next({cmps: userReq.cmps, fromHeadless: true})
                if (userReq.destroyWidget) jb.delay(1).then(()=> {
                    console.log(`delete widget ${userReq.widgetId}`)
                    jb.delay(100).then(()=>delete jb.ui.widgets[userReq.widgetId])
                })
            }
        }
    }
})

jb.component('widget.twoTierWidget', {
    type: 'control',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'id', as: 'string'},
      {id: 'remote', type: 'remote', defaultValue: remote.local()},
    ],
    impl: controlWithFeatures({
        vars: Var('widgetId', (ctx,{},{id}) => id || 'widget' + ctx.id),
        control: widget.frontEndCtrl('%$widgetId%'),
        features: followUp.flow(
            source.callbag(() => jb.ui.widgetUserRequests),
            rx.log('userReq'),
            rx.filter('%widgetId% == %$widgetId%'),
            rx.takeWhile('%ev.type% != destroy'),
            //source.frontEndUserEvent('%$widgetId%'),
            rx.log('send to headless'),
            remote.innerRx(widget.headless(call('control'),'%$widgetId%'), '%$remote%'),
            rx.log('arrives from headless'),
            sink.frontEndDelta('%$widgetId%'),
        )
    })
})
