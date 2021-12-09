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
    params: [
        {id: 'event', defaultValue: '%%'}
    ],
    impl: async (ctx,ev) => {
        const {delta,css,widgetId,cmpId,assumedVdom} = ev
        if (css) 
            return !ctx.vars.headlessWidget && jb.ui.insertOrUpdateStyleElem(ctx,css,ev.elemId, {classId: ev.classId})
        await jb.treeShake.getCodeFromRemote(jb.treeShake.treeShakeFrontendFeatures(pathsOfFEFeatures(delta)))
        await jb.treeShake.loadFELibsDirectly(feLibs(delta))
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

jb.component('remote.distributedWidget', {
    type: 'action',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'backend', type: 'jbm', defaultValue: jbm.self() },
      {id: 'frontend', type: 'jbm' },
      {id: 'selector', as: 'string', defaultValue: 'body', description: 'root selector to put widget in. e.g. #main' },
    ],
    impl: remote.action(runActions(
        Var('widgetId', widget.newId()),
        Var('frontEndUri', '%$frontend/uri%'),
        remote.action(action.renderXwidget('%$selector%','%$widgetId%'), jbm.byUri('%$frontEndUri%') ),
        rx.pipe(
            source.remote(
                rx.pipe(
                    source.callbag(() => jb.ui.widgetUserRequests),
                    rx.log('remote widget userReq'),
                    rx.filter('%widgetId% == %$widgetId%'),
                    rx.takeWhile(({data}) => data.$$ != 'destroy',true),
             ), jbm.byUri('%$frontEndUri%') ),
            widget.headless('%$control()%','%$widgetId%'),
            sink.action(remote.action(action.frontEndDelta('%%'), jbm.byUri('%$frontEndUri%')))
        )
    ), '%$backend%')
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
            rx.takeWhile(({data}) => data.$$ != 'destroy',true),
            //source.frontEndUserEvent('%$widgetId%'),
            rx.log('remote widget sent to headless'),
            remote.operator(widget.headless(call('control'),'%$widgetId%'), '%$jbm%'),
            rx.log('remote widget arrived from headless'),
            sink.action(action.frontEndDelta('%%')),
        )
    })
})

jb.component('action.renderXwidget', {
    type: 'action',
    params: [
        {id: 'selector', as: 'string', defaultValue: 'body' },
        {id: 'widgetId', as: 'string' },
    ],
    impl: (ctx,selector,widgetId) => {
        const elem = selector ? jb.ui.widgetBody(ctx).querySelector(selector) : jb.ui.widgetBody(ctx)
        if (!elem)
            return jb.logError('renderXwidget - can not find top elem',{body: jb.ui.widgetBody(ctx), ctx,selector})
        jb.ui.renderWidget({$: 'widget.frontEndCtrl', widgetId: widgetId}, elem)
    },
    dependency: [ widget.frontEndCtrl() ]
})

jb.extension('ui','headless', {
    $phase: 1100,
    $requireFuncs: 'jb.ui.render',

    initExtension() { // 1100 is after ui phase (100)
        // for loader : jb.ui.render( 
        return {
            widgetRenderingSrc: jb.callbag.replay(100)(jb.ui.renderingUpdates),
            headless: {},
        }
    },
    createHeadlessWidget(widgetId, ctrl,ctx,{recover} = {}) {
        const ctxToUse = jb.ui.extendWithServiceRegistry(ctx.setVars(
            {...(recover && { recover: true}), headlessWidget: true, headlessWidgetId: widgetId }))
        if (jb.ui.headless[widgetId]) {
            if (!recover) jb.logError('headless widgetId already exists',{widgetId,ctx})
            jb.ui.destroyHeadless(widgetId)
        }
        const cmp = ctrl(ctxToUse)
        jb.ui.headless[widgetId] = {} // used by styles
        const top = jb.ui.h(cmp)
        const body = jb.ui.h('div',{ widgetTop: true, headless: true, widgetId, ...(ctx.vars.remoteUri && { remoteUri: ctx.vars.remoteUri })},top)
        top.parentNode = body
        jb.ui.headless[widgetId].body = body
        // if (recover && !jb.ui.headless[widgetId])
        //     jb.logError('headless recover no existing widget',{widgetId,ctx})
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
        } else if (userReq.$$ == 'destroy') {
            jb.log('destroy headless widget request',{widgetId: userReq.widgetId,userReq})
            jb.ui.BECmpsDestroyNotification.next({cmps: userReq.cmps, destroyLocally: true})
            if (userReq.destroyWidget) jb.delay(1).then(()=> {
                    jb.log('destroy headless widget',{widgetId: userReq.widgetId,userReq})
                    delete jb.ui.headless[userReq.widgetId]
                }) // the delay is needed for tests
            sink(2)
        }
    },
    destroyHeadless(widgetId) {
        jb.ui.unmount(jb.ui.headless[widgetId])
        delete jb.ui.headless[widgetId]
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
                if (t == 1 && (d == undefined || d == null))
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