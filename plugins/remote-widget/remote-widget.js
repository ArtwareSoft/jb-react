using('remote,ui')

extension('ui', 'widget-frontend', {
  initExtension() {
    return {
      frontendWidgets: {},
    }
  },
  initFEWidget() { }
})

component('widget.frontEndCtrl', {
  type: 'control',
  params: [
    {id: 'widgetId', as: 'string'}
  ],
  impl: group({
    features: [
      htmlAttribute('widgetId', '%$widgetId%'),
      htmlAttribute('remoteUri', '%$remoteUri%'),
      htmlAttribute('widgetTop', 'true'),
      htmlAttribute('frontend', 'true')
    ]
  })
})

component('widget.newId', {
  params: [
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: () => jb}
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
    {id: 'elem', defaultValue: '%$cmp/el%'}
  ],
  impl: (ctx, elem) => {
    const widgetId = ctx.vars.FEWidgetId || jb.ui.frontendWidgetId(elem)
    return widgetId && jb.path(jb.ui.frontendWidgets[widgetId], 'jbm') || jb
  }
})

component('dataMethodFromBackend', {
  type: 'data',
  description: 'activated on FE to get data from BE',
  macroByValue: true,
  params: [
    {id: 'method', as: 'string'},
    {id: 'data', defaultValue: '%%'},
    {id: 'vars'}
  ],
  impl: remote.data(backend.dataMethod('%$cmp/cmpId%', '%$method%', { data: '%$data%' }), backEnd())
})

component('action.updateFrontEnd', {
  type: 'action',
  params: [
    {id: 'renderingUpdate', defaultValue: '%%'}
  ],
  impl: (ctx, renderingUpdate) => {
    if (renderingUpdate.$ == 'updates')
      return renderingUpdate.updates.reduce((pr, inner) => pr.then(() => frontEndDelta(inner)), Promise.resolve())
    else
      return frontEndDelta(renderingUpdate)

    async function frontEndDelta(renderingUpdate) {
      const { delta, css, widgetId, cmpId, assumedVdom } = renderingUpdate
      const {headlessWidget, useFrontEndInTest} = ctx.vars
      if (css)
        return (useFrontEndInTest || !headlessWidget) && jb.ui.insertOrUpdateStyleElem(ctx, css, renderingUpdate.elemId, { classId: renderingUpdate.classId })
      await jb.treeShake.getCodeFromRemote(jb.treeShake.treeShakeFrontendFeatures(pathsOfFEFeatures(delta)))
      await jb.treeShake.loadFELibsDirectly(feLibs(delta))
      const ctxToUse = ctx.setVars({ headlessWidget: false, FEwidgetId: widgetId })
      const elem = cmpId ? jb.ui.find(jb.ui.widgetBody(ctxToUse), `[cmp-id="${cmpId}"]`)[0] : jb.ui.widgetBody(ctxToUse)
      try {
        const res = elem && jb.ui.applyDeltaToCmp({ delta, ctx: ctxToUse, cmpId, elem, assumedVdom })
        if (jb.path(res, 'recover')) {
          jb.log('headless frontend recover widget request', { widgetId, ctx, elem, cmpId, ...res })
          jb.ui.sendUserReq({ $: 'recoverWidget', widgetId, ...res })
        }
      } catch (e) {
        jb.logException(e, 'headless frontend apply delta', { ctx, elem, cmpId })
      }

      function pathsOfFEFeatures(obj) {
        if (!obj || typeof obj != 'object') return []
        if (obj.$__frontEndMethods)
          return JSON.parse(obj.$__frontEndMethods).map(x => x.path)
        return Object.values(obj).flatMap(x => pathsOfFEFeatures(x))
      }
      function feLibs(obj) {
        if (!obj || typeof obj != 'object') return []
        if (obj.$__frontEndLibs)
          return JSON.parse(obj.$__frontEndLibs)
        return Object.values(obj).flatMap(x => feLibs(x))
      }
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
        source.remote({
          rx: rx.pipe(
            source.callbag(() => jb.ui.widgetUserRequests),
            rx.log('remote widget userReq'),
            rx.filter('%widgetId% == %$widgetId%'),
            rx.takeWhile(({ data }) => data.$$ != 'destroy', true)
          ),
          jbm: byUri('%$frontEndUri%')
        }),
        widget.headless('%$control()%', '%$widgetId%'),
        sink.action(remote.action(action.updateFrontEnd('%%'), byUri('%$frontEndUri%')))
      ),
      jbm: '%$backend%',
      require: 'action.updateFrontEnd'
    })
  )
})

component('remote.widget', {
  type: 'control',
  params: [
    {id: 'control', type: 'control', dynamic: true, composite: true},
    {id: 'jbm', type: 'jbm<jbm>', defaultValue: worker()},
    {id: 'transactiveHeadless', as: 'boolean', type: 'boolean'}
  ],
  impl: group({
    controls: controlWithFeatures({
      vars: [
        Var('widgetId', widget.newId('%$resolvedJbm%'))
      ],
      control: widget.frontEndCtrl('%$widgetId%'),
      features: followUp.flow(
        source.callbag(() => jb.ui.widgetUserRequests),
        rx.log('remote widget userReq'),
        rx.filter('%widgetId% == %$widgetId%'),
        rx.takeWhile(({ data }) => data.$$ != 'destroy', true),
        rx.log('remote widget sent to headless'),
        remote.operator({
          rx: widget.headless(call('control'), '%$widgetId%', {
            transactiveHeadless: '%$transactiveHeadless%'
          }),
          jbm: '%$resolvedJbm%'
        }),
        rx.log('remote widget arrived from headless'),
        sink.action(action.updateFrontEnd('%%'))
      )
    }),
    features: group.wait('%$jbm%', { varName: 'resolvedJbm' })
  })
})

component('action.renderXwidget', {
  type: 'action',
  params: [
    {id: 'selector', as: 'string'},
    {id: 'widgetId', as: 'string'}
  ],
  impl: (ctx, selector, widgetId) => {
    const elem = selector ? jb.ui.widgetBody(ctx).querySelector(selector) : jb.ui.widgetBody(ctx)
    if (!elem)
      return jb.logError('renderXwidget - can not find top elem', { body: jb.ui.widgetBody(ctx), ctx, selector })
    jb.ui.renderWidget({ $: 'widget.frontEndCtrl', widgetId: widgetId }, elem)
  },
  dependency: [widget.frontEndCtrl()]
})

// headless

extension('ui', 'headless', {
  $phase: 1100,
  $requireFuncs: '#ui.render',

  initExtension() { // 1100 is after ui phase (100)
    return {
      headless: {},
    }
  },
  createHeadlessWidget(widgetId, ctrl, reqCtx, { recover } = {}) {
    const ctxToUse = jb.ui.extendWithServiceRegistry(reqCtx.setVars({
        ...(recover && { recover: true }), headlessWidget: true, headlessWidgetId: widgetId
      }))
    if (jb.ui.headless[widgetId]) {
      if (!recover) jb.logError('headless widgetId already exists', { widgetId, ctx: reqCtx })
      jb.ui.destroyHeadless(widgetId)
    }
    jb.log('create headless widget', { widgetId, path: ctrl.runCtx.path })
    const cmp = ctrl(ctxToUse)
    jb.ui.headless[widgetId] = {} // used by styles
    const top = jb.ui.h(cmp)
    const body = jb.ui.h('div', { widgetTop: true, headless: true, widgetId, ...(reqCtx.vars.remoteUri && { remoteUri: reqCtx.vars.remoteUri }) }, top)
    top.parentNode = body
    jb.ui.headless[widgetId].body = body
    jb.log('headless widget created', { widgetId, body })
    const delta = { children: { resetAll: true, toAppend: [jb.ui.stripVdom(top)] } }
    jb.ui.sendRenderingUpdate(ctxToUse, { widgetId, delta, reqCtx })
    reqCtx.vars.userReqTx && reqCtx.vars.userReqTx.complete('createHeadlessWidget')
  },
  handleUserReq(userReq, sink, _ctx) {
    const reqCtx = _ctx.vars.transactiveHeadless ? _ctx.setVars({ userReqTx: jb.ui.userReqTx({ userReq, ctx: _ctx }) }) : _ctx
    const { widgetId } = userReq
    const tx = reqCtx.vars.userReqTx
    if (tx)
      tx.onComplete(update => sink(1, reqCtx.dataObj(update)))
    jb.log('headless widget handle userRequset', {widgetId, tx, userReq, reqCtx, ctx: _ctx})

    if (userReq.$ == 'userRequest') {
      const cmp = jb.ui.cmps[userReq.cmpId]
      if (!cmp)
        return jb.logError(`headless widget handleUserRequest. no cmp ${userReq.cmpId}`, { userReq })
      const vars = userReq.vars
      if (jb.path(vars, '$updateCmpState.cmpId') == jb.path(reqCtx.vars, 'cmp.cmpId') && jb.path(vars, '$updateCmpState.state'))
        Object.assign(reqCtx.vars.cmp.state, vars.$updateCmpState.state)

      cmp.runBEMethod(userReq.method, userReq.data, vars, reqCtx)
    } else if (userReq.$ == 'createHeadlessWidget') {
      jb.ui.createHeadlessWidget(widgetId, userReq.ctrl, reqCtx)
    } else if (userReq.$ == 'recoverWidget') {
      jb.log('recover headless widget', { userReq })
    } else if (userReq.$$ == 'destroy') {
      jb.log('destroy headless widget request', { widgetId: userReq.widgetId, userReq })
      jb.ui.BECmpsDestroyNotification.next({ cmps: userReq.cmps, destroyLocally: true })
      if (userReq.destroyWidget) jb.delay(1).then(() => {
        jb.log('destroy headless widget', { widgetId: userReq.widgetId, userReq })
        delete jb.ui.headless[userReq.widgetId]
      }) // the delay is needed for tests
      sink(2)
    }
  },
  destroyHeadless(widgetId) {
    jb.ui.destroyAllDialogEmitters()
    jb.ui.unmount(jb.ui.headless[widgetId])
    delete jb.ui.headless[widgetId]
  }
})

component('widget.headless', {
  type: 'rx',
  params: [
    {id: 'control', type: 'control', dynamic: true},
    {id: 'widgetId', as: 'string'},
    {id: 'transactiveHeadless', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx, ctrl, widgetId, transactiveHeadless) => {
    const renderingUpdates = jb.callbag.filter(m => m.widgetId == widgetId)(jb.ui.renderingUpdates)

    return userReqIn => (start, sink) => {
      if (start !== 0) return
      const talkback = []
      sink(0, function headless(t, d) {
        if (t == 1 && (d == undefined || d == null))
          talkback.forEach(tb => tb(1))
      })
      if (!transactiveHeadless)
        renderingUpdates(0, function headless(t, d) {
          if (t == 1 && d) {
            const updatesCounter = jb.ui.headless[widgetId].updatesCounter = (jb.ui.headless[widgetId].updatesCounter || 0) + 1
            jb.log(`headless widget delta out ${updatesCounter}`, { updatesCounter, widgetId, t, d, ctx, json: { widgetId, delta: d.delta } })
            sink(t, ctx.dataObj(d))
          }
          if (t == 0) talkback.push(d)
          if (t === 2) sink(t, d)
        })
      jb.ui.handleUserReq({ $: 'createHeadlessWidget', ctrl, widgetId }, sink, ctx.setVars({transactiveHeadless}))

      userReqIn(0, function headless(t, d) {
        if (t == 0) {
          jb.log('headless widget register FE', { widgetId, t, d, ctx })
          talkback.push(d)
        }
        if (t === 2) {
          jb.log('headless widget unregister FE', { widgetId, t, d, ctx })
          sink(t, d)
        }
        if (t === 1 && d && d.data.widgetId == widgetId) {
          jb.log('headless widget userRequset in', { widgetId, t, d, ctx })
          jb.ui.handleUserReq(d.data, sink, ctx.setVars({transactiveHeadless}))
        }
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
  impl: text('', {
    style: text.htmlTag('div'),
    features: features(
      frontEnd.coLocation(),
      htmlAttribute('widgetId', 'client'),
      htmlAttribute('widgetTop', 'true'),
      htmlAttribute('frontend', 'true'),
      frontEnd.var('ctrlProfile', ({ }, { }, { control }) => control.profile),
      frontEnd.init((ctx, { el, ctrlProfile }) => {
        jb.ui.renderWidget(ctrlProfile, el, ctx.setVars({
          FEWidgetId: jb.ui.frontendWidgetId(el.parentNode),
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
  impl: remote.action(({}, {}, { cmpId, action }) => action(jb.ui.cmps[cmpId].calcCtx), backEnd())
})
