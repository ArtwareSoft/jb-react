// var {rx, remote, widget, jbm} = jb.ns('remote,rx,widget,jbm')

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

jb.component('widget.newId', {
    params: [
        {id: 'jbm', type: 'jbm', defaultValue: () => jb },
    ],
    impl: (ctx, jbm) => {
        const id = jbm.uri + '-' + ctx.id
        jb.ui.frontendWidgets = jb.ui.frontendWidgets || {}
        jb.ui.frontendWidgets[id] = jbm
        return id
    }
})

jb.component('action.frontEndDelta', {
    type: 'action',
    impl: async ctx => {
        const {delta,css,widgetId,cmpId,assumedVdom} = ctx.data
        if (css) 
            return !ctx.vars.headlessWidget && jb.ui.addStyleElem(ctx,css)
        await jb.codeLoader.getCodeFromRemote(jb.codeLoader.treeShakeFrontendFeatures(pathsOfFEFeatures(delta)))
        await jb.codeLoader.loadFELibsDirectly(feLibs(delta))
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

        function pathsOfFEFeatures(obj) {
            if (!obj || typeof obj != 'object') return []
            if (obj.$__frontEndMethods) 
                return JSON.parse(obj.$__frontEndMethods).map(x=>x.path)
            return Object.values(obj).flatMap(x=>pathsOfFEFeatures(x))
        }
        function feLibs(obj) {
            if (!obj || typeof obj != 'object') return []
            if (obj.$__frontEndLibs) 
                return JSON.parse(obj.$__frontEndLibs)
            return Object.values(obj).flatMap(x=>feLibs(x))
        }        
    }
})

jb.component('remote.widget', {
    type: 'control',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'jbm', type: 'jbm' },
    ],
    impl: controlWithFeatures({
        vars: Var('widgetId', widget.newId('%$jbm%')),
        control: widget.frontEndCtrl('%$widgetId%'),
        features: followUp.flow(
            source.callbag(() => jb.ui.widgetUserRequests),
            rx.log('remote widget userReq'),
            rx.filter('%widgetId% == %$widgetId%'),
            rx.takeWhile(({data}) => data.$ != 'destroy',true),
            //source.frontEndUserEvent('%$widgetId%'),
            rx.log('remote widget sent to headless'),
            remote.operator(widget.headless(call('control'),'%$widgetId%'), '%$jbm%'),
            rx.log('remote widget arrived from headless'),
            sink.action(action.frontEndDelta('%$widgetId%')),
        )
    })
})

jb.component('action.renderXwidget', {
    type: 'action',
    params: [
        {id: 'selector', as: 'string', defaultValue: 'body' },
        {id: 'widgetId', as: 'string' },
    ],
    impl: ({},selector,widgetId) => 
        jb.ui.renderWidget({$: 'widget.frontEndCtrl', widgetId: widgetId}, document.querySelector(selector)),
    dependency: widget.frontEndCtrl()
})

jb.component('remote.widgetFrontEnd', {
    type: 'action',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'jbm', type: 'jbm' },
      {id: 'selector', as: 'string', defaultValue: 'body', description: 'root selector to put widget in. e.g. #main' },
    ],
    impl: runActions(
        Var('widgetId', widget.newId()),
        remote.action(action.renderXwidget('%$selector%','%$widgetId%'), '%$jbm%' ),
        rx.pipe(
            source.remote(
                rx.pipe(
                    source.callbag(() => jb.ui.widgetUserRequests),
                    rx.log('remote widget userReq'),
                    rx.filter('%widgetId% == %$widgetId%'),
                    rx.takeWhile(({data}) => data.$ != 'destroy',true),
             ), '%$jbm%' ),
            widget.headless('%$control()%','%$widgetId%'),
            sink.action(remote.action(action.frontEndDelta('%$widgetId%'),'%$jbm%'))
        )
    )
})

jb.extension('ui','headless', {
    initExtension_phase1100() { // 1100 is after ui phase (100)
        return {
            widgetRenderingSrc: jb.callbag.replay(100)(jb.ui.renderingUpdates),
            headless: {},
        }
    },
    createHeadlessWidget(widgetId, ctrl,ctx,{recover} = {}) {
        const ctxToUse = jb.ui.extendWithServiceRegistry(ctx.setVars(
            {...(recover && { recover: true}), headlessWidget: true, headlessWidgetId: widgetId }))
        const cmp = ctrl(ctxToUse)
        const top = jb.ui.h(cmp)
        const body = jb.ui.h('div',{ widgetTop: true, headless: true, widgetId, ...(ctx.vars.remoteUri && { remoteUri: ctx.vars.remoteUri })},top)
        if (jb.ui.headless[widgetId]) {
            if (!recover) jb.logError('headless widgetId already exists',{widgetId,ctx})
            jb.ui.unmount(jb.ui.headless[widgetId])
        }
        if (recover && !jb.ui.headless[widgetId])
            jb.logError('headless recover no existing widget',{widgetId,ctx})
        jb.ui.headless[widgetId] = { body }
        jb.log('headless widget created',{widgetId,body})
        const delta = { children: {resetAll : true, toAppend: [jb.ui.stripVdom(top)]} }
        jb.ui.renderingUpdates.next({widgetId, delta })
    },
    handleUserReq(userReq, sink) {
        jb.log('headless widget handle userRequset',{widgetId: userReq.widgetId,userReq})
        if (userReq.$ == 'runCtxAction') {
            const ctx = jb.ctxDictionary[userReq.ctxIdToRun]
            if (!ctx)
                return jb.logError(`headless widget runCtxAction. no ctxId ${userReq.ctxIdToRun}`,{userReq})
            jb.ui.runCtxActionAndUdateCmpState(ctx,userReq.data,userReq.vars)
        } else if (userReq.$ == 'recoverWidget') {
            jb.log('recover headless widget',{userReq})
            //createHeadlessWidget({ recover: true })
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
})

jb.component('widget.headless', {
    type: 'rx',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'widgetId', as: 'string'},
    ],
    impl: (ctx,ctrl,widgetId) => {
        const filteredSrc = jb.callbag.filter(m=>m.widgetId == widgetId)(jb.ui.widgetRenderingSrc)
        jb.ui.createHeadlessWidget(widgetId,ctrl,ctx)
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
              if (t === 1 && d && d.data.widgetId == widgetId) jb.ui.handleUserReq(d.data,sink)
            })
        }
    }
})

jb.component('widget.headlessWidgets', {
    impl: () => Object.keys(jb.ui.headless)
})