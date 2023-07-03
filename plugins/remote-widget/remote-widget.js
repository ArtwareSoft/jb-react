using('remote,ui')

extension('ui','widget-frontend', {
    initExtension() { return { 
        frontendWidgets : {},
    }},
    initFEWidget() {}
})

component('widget.frontEndCtrl', {
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

component('widget.newId', {
    params: [
        {id: 'jbm', type: 'jbm<jbm>', defaultValue: () => jb },
    ],
    impl: (ctx, jbm) => {
        jb.ui.initFEWidget() // dummy to get constrcutor
        const id = jbm.uri + '-' + ctx.id
        jb.ui.frontendWidgets[id] = { jbm }
        return id
    }
})

component('backEnd', {
    type: 'jbm<jbm>',
    params: [
        {id: 'elem', defaultValue: '%$cmp/el%' },
    ],
    impl: (ctx,elem) => {
        const widgetId = ctx.vars.FEWidgetId || jb.ui.frontendWidgetId(elem)
        return widgetId && jb.path(jb.ui.frontendWidgets[widgetId],'jbm') || jb
    }
})

component('dataMethodFromBackend', {
  type: 'data',
  description: 'activated on FE to get data from BE, assuming $cmp variable',
  macroByValue: true,
  params: [
    {id: 'method', as: 'string'},
    {id: 'data', defaultValue: '%%' },
    {id: 'vars' }
  ],
  impl: pipe(
    Var(
      'ctxIdToRun',
      (ctx,{cmp},{method})=>{
      const elem = cmp && cmp.base 
      if (!elem)
        return jb.logError(`frontEnd.dataMethodFromBackend, no elem found`, {method})
      const ctxIdToRun = jb.ui.ctxIdOfMethod(elem,method)
      if (!ctxIdToRun)
        return jb.logError(`no method in cmp: ${method}`, {elem})
      return ctxIdToRun
    }
    ),
    remote.data(backend.dataMethod({ctxIdToRun: '%$ctxIdToRun%', method: '%$method%', data: '%$data%'}), backEnd())
  )
})

component('action.frontEndDelta', {
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
                jb.ui.sendUserReq({$: 'recoverWidget', widgetId, ...res })
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

component('remote.distributedWidget', {
  type: 'action',
  params: [
    {id: 'control', type: 'control', dynamic: true},
    {id: 'backend', type: 'jbm<jbm>', defaultValue: jbm.self()},
    {id: 'frontend', type: 'jbm<jbm>'},
    {id: 'selector', as: 'string', description: 'root selector to put widget in. e.g. #main'}
  ],
  impl: runActions(
    Var('widgetId', widget.newId()),
    Var('frontEndUri', '%$frontend/uri%'),
    remote.action(action.renderXwidget('%$selector%', '%$widgetId%'), byUri('%$frontEndUri%')),
    remote.action({
      action: rx.pipe(
        source.remote(
          rx.pipe(
            source.callbag(() => jb.ui.widgetUserRequests),
            rx.log('remote widget userReq'),
            rx.filter('%widgetId% == %$widgetId%'),
            rx.takeWhile(({data}) => data.$$ != 'destroy', true)
          ),
          byUri('%$frontEndUri%')
        ),
        widget.headless('%$control()%', '%$widgetId%'),
        sink.action(remote.action(action.frontEndDelta('%%'), byUri('%$frontEndUri%')))
      ),
      jbm: '%$backend%',
      require: 'action.frontEndDelta'
    })
  )
})

component('remote.widget', {
  type: 'control',
  params: [
    {id: 'control', type: 'control', dynamic: true, composite: true},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: worker()}
  ],
  impl: group({
    controls: controlWithFeatures(
      Var('widgetId', widget.newId('%$resolvedJbm%')),
      widget.frontEndCtrl('%$widgetId%'),
      followUp.flow(
        source.callbag(() => jb.ui.widgetUserRequests),
        rx.log('remote widget userReq'),
        rx.filter('%widgetId% == %$widgetId%'),
        rx.takeWhile(({data}) => data.$$ != 'destroy', true),
        rx.log('remote widget sent to headless'),
        remote.operator(widget.headless(call('control'), '%$widgetId%'), '%$resolvedJbm%'),
        rx.log('remote widget arrived from headless'),
        sink.action(action.frontEndDelta('%%'))
      )
    ),
    features: group.wait({for: '%$jbm%', varName: 'resolvedJbm'})
  })
})

component('action.renderXwidget', {
  type: 'action',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'widgetId', as: 'string'}
  ],
  impl: (ctx,selector,widgetId) => {
        const elem = selector ? jb.ui.widgetBody(ctx).querySelector(selector) : jb.ui.widgetBody(ctx)
        if (!elem)
            return jb.logError('renderXwidget - can not find top elem',{body: jb.ui.widgetBody(ctx), ctx,selector})
        jb.ui.renderWidget({$: 'widget.frontEndCtrl', widgetId: widgetId}, elem)
    },
  dependency: [
    widget.frontEndCtrl()
  ]
})

extension('ui','headless', {
    $phase: 1100,
    $requireFuncs: 'jb.ui.render',

    initExtension() { // 1100 is after ui phase (100)
        // for loader : jb.ui.render( 
        return {
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
        jb.log('create headless widget', {widgetId, path: ctrl.runCtx.path})
        const cmp = ctrl(ctxToUse)
        jb.ui.headless[widgetId] = {} // used by styles
        const top = jb.ui.h(cmp)
        const body = jb.ui.h('div',{ widgetTop: true, headless: true, widgetId, ...(ctx.vars.remoteUri && { remoteUri: ctx.vars.remoteUri })},top)
        top.parentNode = body
        jb.ui.headless[widgetId].body = body
        jb.log('headless widget created',{widgetId,body})
        const delta = { children: {resetAll : true, toAppend: [jb.ui.stripVdom(top)]} }
        return {widgetId, userReqId: 'init', delta, ctx }
    },
    handleUserReq(userReq, sink) {
        jb.log('headless widget handle userRequset',{widgetId: userReq.widgetId,userReq})
        if (userReq.$ == 'runCtxAction') {
            const ctx = jb.ctxDictionary[userReq.ctxIdToRun]
            if (!ctx)
                return jb.logError(`headless widget runCtxAction. no ctxId ${userReq.ctxIdToRun}`,{userReq})
            const vars = userReq.vars
            if (jb.path(vars,'$updateCmpState.cmpId') == jb.path(ctx.vars,'cmp.cmpId') && jb.path(vars,'$updateCmpState.state'))
                Object.assign(ctx.vars.cmp.state,vars.$updateCmpState.state)
    
            if (userReq.method)
                jb.ui.runBEMethodByContext(ctx,userReq.method,userReq.data,vars)                
            else
                jb.ui.runCtxAction(ctx,userReq.data,vars)

        } else if (userReq.$ == 'recoverWidget') {
            jb.log('recover headless widget',{userReq})
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

component('widget.headless', {
    type: 'rx',
    params: [
      {id: 'control', type: 'control', dynamic: true },
      {id: 'widgetId', as: 'string'},
    ],
    impl: (ctx,ctrl,widgetId) => {
        const renderingUpdates = jb.callbag.filter(m=>m.widgetId == widgetId)(jb.ui.renderingUpdates)

        return userReqIn => (start, sink) => {
            if (start !== 0) return
            const talkback = []
            sink(0, function headless(t, d) {
                if (t == 1 && (d == undefined || d == null))
                    talkback.forEach(tb=>tb(1))
            })
            renderingUpdates(0, function headless(t, d) {
                if (t == 1 && d)
                    jb.log('headless widget delta out',{widgetId,t,d,ctx, json: {widgetId,delta: d.delta} })
                if (t == 0) talkback.push(d)
                if (t === 2) sink(t,d)
                if (t === 1 && d) sink(t,ctx.dataObj(d))
            })
            const initialDelta = jb.ui.createHeadlessWidget(widgetId,ctrl,ctx)
            jb.log('headless widget initial delta out',{widgetId, ctx, json: {widgetId, initialDelta} })
            sink(1,ctx.dataObj(initialDelta))
    
            userReqIn(0, function headless(t, d) {
              jb.log('headless widget userRequset in',{widgetId,t,d,ctx})
              if (t == 0) talkback.push(d)
              if (t === 2) sink(t,d)
              if (t === 1 && d && d.data.widgetId == widgetId) jb.ui.handleUserReq(d.data,sink)
            })
        }
    }
})

component('widget.headlessWidgets', {
    impl: () => Object.keys(jb.ui.headless || {}),
    dependency: widget.headless()
})

component('frontEnd.widget', {
  type: 'control',
  params: [
    {id: 'control', type: 'control', dynamic: true}
  ],
  impl: text({
    text: '',
    style: text.htmlTag('div'),
    features: features(
      frontEnd.coLocation(),
      htmlAttribute('widgetTop', 'true'),
      htmlAttribute('frontend', 'true'),
      frontEnd.var('ctrlProfile', ({},{},{control}) => control.profile),
      frontEnd.init((ctx,{el,ctrlProfile}) => {
        jb.ui.renderWidget(ctrlProfile, el, ctx.setVars({ 
            FEWidgetId: jb.ui.frontendWidgetId(el.parentNode),
            frontEndCmpCtxId: el.getAttribute('full-cmp-ctx')
        }))
      })
    )
  })
})

component('runInBECmpContext', {
  type: 'action',
  category: 'mutable:100',
  params: [
    {id: 'cmpId', as: 'string', mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true}
  ],
  impl: remote.action(
    ({},{frontEndCmpCtxId},{action}) => action(jb.ctxDictionary[frontEndCmpCtxId]),
    backEnd()
  )
})
