component('frontEnd.var', {
  type: 'feature',
  description: 'calculate in the BE and pass to frontEnd',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ frontEndVar: ctx.params })
})

component('frontEnd.varsFromBEProps', {
  type: 'feature',
  description: 'calculate in the BE and pass to frontEnd',
  params: [
    {id: 'idList', as: 'array', mandatory: true},
  ],
  impl: ({},idList) => idList.map(id => ({ frontEndVar: {id, value: ctx => ctx.vars.$props[id]} }))
})

component('action.runBEMethod', {
    type: 'action',
    description: 'can be activated on both FE & BE, assuming $cmp variable',
    macroByValue: true,
    params: [
      {id: 'method', as: 'string', dynamic: true },
      {id: 'data', defaultValue: '%%', dynamic: true },
      {id: 'ctxVars', dynamic: true },
    ],
    impl: (ctx,method,data,ctxVars) => jb.ui.runBEMethodByContext(ctx,method(),data(),ctxVars())
})

component('backend.dataMethod', {
  type: 'data',
  description: 'activated on BE',
  params: [
    {id: 'cmpId', as: 'string'},
    {id: 'method', as: 'string'},
    {id: 'data', defaultValue: '%%'},
    {id: 'ctxVars'}
  ],
  impl: ({} ,cmpId,method,data,ctxVars) => jb.ui.cmps[cmpId].runBEMethod(method,data,ctxVars,{dataMethod: true})
})

component('action.runFEMethod', {
  type: 'action',
  description: 'cab be activated in frontEnd only with $cmp variable',
  macroByValue: true,
  params: [
    {id: 'method', as: 'string', dynamic: true },
    {id: 'data', defaultValue: '%%', dynamic: true },
    {id: 'ctxVars', dynamic: true },
  ],
  impl: (ctx,method,data,ctxVars) => ctx.vars.cmp && ctx.vars.cmp.runFEMethod(method(),data(),ctxVars())
})

component('sink.BEMethod', {
    type: 'rx',
    category: 'sink',
    macroByValue: true,
    params: [
        {id: 'method', as: 'string', dynamic: true },
        {id: 'data', defaultValue: ({data}) => jb.frame.Event && data instanceof jb.frame.Event ? null : data, dynamic: true },
        {id: 'ctxVars', dynamic: true },
    ],
    impl: sink.action((ctx,{},{method,data,ctxVars}) => jb.ui.runBEMethodByContext(ctx,method(ctx),data(ctx),ctxVars(ctx)))
})

component('sink.FEMethod', {
  type: 'rx',
  category: 'sink',
  macroByValue: true,
  params: [
      {id: 'method', as: 'string', dynamic: true },
      {id: 'data', defaultValue: '%%', dynamic: true },
      {id: 'ctxVars', dynamic: true },
  ],
  impl: sink.action((ctx,{cmp},{method,data,ctxVars}) => cmp && cmp.runFEMethod(method(ctx),data(ctx),ctxVars(ctx)))
})

component('action.refreshCmp', {
  type: 'action',
  description: 'can be activated on both FE & BE, assuming $cmp variable',
  params: [
    {id: 'state', dynamic: true },
    {id: 'options', dynamic: true },
  ],
  impl: (ctx,stateF,optionsF) => {
    const cmp = ctx.vars.cmp, options = optionsF(ctx), state = stateF(ctx)
    jb.log('refresh uiComp',{cmp,ctx,state,options})
    cmp && cmp.refresh(state,{srcCtx: ctx, ...options},ctx)
    const tx = ctx.vars.userReqTx
    tx && tx.complete(`refresh cmp ${cmp.cmpId}`)
  }
})

component('sink.refreshCmp', {
  type: 'rx',
  description: 'can be activated on both FE & BE, assuming $cmp variable',
  params: [
    {id: 'state', dynamic: true},
    {id: 'options', dynamic: true}
  ],
  impl: sink.action(action.refreshCmp('%$state()%', '%$options()%'))
})

component('frontEnd.method', {
    type: 'feature',
    category: 'front-end',
    description: 'register as front end method, the context is limited to cmp & state. can be run with cmp.runFEMetod(id,data,vars)',
    params: [
        {id: 'method', as: 'string' },
        {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: (ctx,method,action) => ({ frontEndMethod: { method, path: ctx.path, action: action.profile} })
})

component('frontEnd.coLocation', {
  type: 'feature',
  category: 'front-end',
  description: 'front end can use backend variables',
  impl: () => ({ coLocation: true })
})

component('frontEnd.requireExternalLibrary', {
  type: 'feature',
  category: 'front-end',
  description: 'url or name of external library in dist path, js or css',
  params: [
      {id: 'libs', type: 'data[]', as: 'array' },
  ],
  impl: ({},libs) => libs.map(frontEndLib =>({ frontEndLib }))
})


component('frontEnd.enrichUserEvent', {
  type: 'feature',
  category: 'front-end',
  description: 'the result is assigned to userEvent, can use %$cmp%, %$ev%, %$userEvent%',
  params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({ frontEndMethod: { method: 'enrichUserEvent', path: ctx.path, action: action.profile} })
})

component('frontEnd.onRefresh', {
  type: 'feature',
  category: 'front-end',
  description: 'rerun on frontend when after refresh is activated',
  params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({ frontEndMethod: { method: 'onRefresh', path: ctx.path, action: action.profile} })
})

component('frontEnd.init', {
    type: 'feature',
    category: 'front-end',
    description: 'initializes the front end, mount, component did update. runs after props',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: (ctx,action) => ({ frontEndMethod: { method: 'init', path: ctx.path, action: action.profile} })
})

component('frontEnd.prop', {
    type: 'feature',
    category: 'front-end',
    description: 'assign front end property (calculated using the limited FE context). runs before init',
    params: [
      {id: 'id', as: 'string', mandatory: true },
      {id: 'value', mandatory: true, dynamic: true}
    ],
    impl: (ctx,id,value) => ({ frontEndMethod: { method: 'calcProps', path: ctx.path, _prop: id,
      action: (_ctx,{cmp}) => cmp[id] = value(_ctx) } })
})

component('frontEnd.onDestroy', {
    type: 'feature',
    description: 'destructs the front end',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: (ctx,action) => ({ frontEndMethod: { method: 'destroy', path: ctx.path, action: action.profile } })
})

component('source.frontEndEvent', {
    type: 'rx',
    category: 'source',
    description: 'assumes cmp in context',
    params: [
        {id: 'event', as: 'string', options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
    ],
    impl: //source.event('%$event%','%$cmp.base%')
    rx.pipe(source.event('%$event%','%$cmp.base%'), rx.takeUntil('%$cmp.destroyed%'))
})

component('rx.userEventVar', {
  type: 'rx',
  impl: rx.var('ev', ({data}) => jb.ui.buildUserEvent(data, jb.ui.closestCmpElem(data.currentTarget || data.target))),
})

component('frontEnd.flow', {
    type: 'feature',
    category: 'front-end',
    description: 'rx flow at front end',
    params: [
        {id: 'elems', type: 'rx[]', as: 'array', dynamic: true, mandatory: true, templateValue: []}
    ],
    impl: (ctx, elems) => ({ frontEndMethod: { 
      method: 'init', path: ctx.path, _flow: elems.profile,
      action: { $: 'rx.pipe', elems: _ctx => elems(_ctx) }
    }})
})

component('feature.onHover', {
    type: 'feature',
    description: 'on mouse enter',
    category: 'events',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true},
      {id: 'onLeave', type: 'action', mandatory: true, dynamic: true},
    ],
    impl: features(
        method('onHover','%$action()%'),
        method('onLeave','%$onLeave()%'),
        frontEnd.flow(source.frontEndEvent('mouseenter'), sink.BEMethod('onHover')),
        frontEnd.flow(source.frontEndEvent('mouseleave'), sink.BEMethod('onLeave'))
    )
})
  
component('feature.classOnHover', {
    type: 'feature',
    description: 'set css class on mouse enter',
    category: 'events',
    params: [
      {id: 'clz', type: 'string', defaultValue: 'item-hover', description: 'css class to add/remove on hover'}
    ],
    impl: features(
        frontEnd.flow(source.frontEndEvent('mouseenter'), sink.action(({},{cmp},{clz}) => jb.ui.addClass(cmp.base,clz))),
        frontEnd.flow(source.frontEndEvent('mouseleave'), sink.action(({},{cmp},{clz}) => jb.ui.removeClass(cmp.base,clz))),
    )
})

component('key.eventMatchKey', {
    type: 'boolean',
    params: [
        {id: 'event'},
        {id: 'key', as: 'string', description: 'E.g., a,27,Enter,Esc,Ctrl+C or Alt+V' },
    ],
    impl: (ctx, e, key) => {
      jb.log('keyboard search eventMatchKey',{e,key})
      if (!key) return;
      const dict = { tab: 9, delete: 46, tab: 9, esc: 27, enter: 13, right: 39, left: 37, up: 38, down: 40}
    
      key = key.replace(/-/,'+');
      const keyWithoutPrefix = key.split('+').pop()
      let keyCode = dict[keyWithoutPrefix.toLowerCase()]
      if (+keyWithoutPrefix)
        keyCode = +keyWithoutPrefix
      if (keyWithoutPrefix.length == 1)
        keyCode = keyWithoutPrefix.charCodeAt(0)
    
      if (key.match(/^[Cc]trl/) && !e.ctrlKey) return
      if (key.match(/^[Aa]lt/) && !e.altKey) return
      jb.log(`keyboard ${e.keyCode == keyCode ? 'found': 'notFound'} eventMatchKey`,{e,key,eventKey: e.keyCode,keyCode})
      return e.keyCode == keyCode
  }
})

component('key.eventToMethod', {
  type: 'boolean',
  params: [
      {id: 'event'},
      {id: 'elem' },
  ],
  impl: (ctx, event, elem) => {
    elem.keysHash = elem.keysHash || calcKeysHash()
        
    jb.log('keyboard search eventToMethod',{elem,event})
    const res = elem.keysHash.find(key=>key.keyCode == event.keyCode && event.ctrlKey == key.ctrl && event.altKey == key.alt)
    const resMethod = res && res.methodName
    jb.log(`keyboard ${res ? 'found': 'notFound'} eventToMethod`,{resMethod,elem,event})
    return resMethod

    function calcKeysHash() {
      const keys = elem.getAttribute('methods').split(',').map(x=>x.split('-')[0])
      .filter(x=>x.indexOf('onKey') == 0).map(x=>x.slice(5).slice(0,-7))
      const dict = { tab: 9, delete: 46, tab: 9, esc: 27, enter: 13, right: 39, left: 37, up: 38, down: 40}
  
      return keys.map(_key=>{
        const key = _key.replace(/-/,'+');
        const keyWithoutPrefix = key.split('+').pop()
        let keyCode = dict[keyWithoutPrefix.toLowerCase()]
        if (+keyWithoutPrefix)
          keyCode = +keyWithoutPrefix
        if (keyWithoutPrefix.length == 1)
          keyCode = keyWithoutPrefix.charCodeAt(0)
        return { keyCode, ctrl: !!key.match(/^[Cc]trl/), alt: !!key.match(/^[Aa]lt/), methodName: `onKey${_key}Handler` }
      })
    }
}
})

component('feature.onKey', {
    type: 'feature',
    category: 'events',
    params: [
      {id: 'key', as: 'string', description: 'E.g., a,27,Enter,Esc,Ctrl+C or Alt+V'},
      {id: 'action', type: 'action', mandatory: true, dynamic: true},
    ],
    impl: features(
        method(replace({find: '-', replace: '+', text: 'onKey%$key%Handler',useRegex: true}), call('action')),
        frontEnd.init(If(not('%$cmp.hasOnKeyHanlder%'), runActions(
          ({},{cmp}) => cmp.hasOnKeyHanlder = true,
          rx.pipe(
            source.frontEndEvent('keydown'), 
            rx.userEventVar(), 
            rx.map(key.eventToMethod('%%','%$el%')), 
            rx.filter('%%'), 
            rx.log('keyboard uiComp onKey %$key%'), 
            sink.BEMethod('%%'))
        ))),
      //   frontEnd.init((ctx,{cmp,el}) => {
      //     if (! cmp.hasOnKeyHanlder) {
      //       cmp.hasOnKeyHanlder = true
      //       ctx.run(rx.pipe(source.frontEndEvent('keydown'), rx.userEventVar(), 
      //         rx.map(key.eventToMethod('%%',el)), rx.filter('%%'), rx.log('keyboard uiComp onKey %$key%'), sink.BEMethod('%%')))
      //     }
      // })
    )
})

component('feature.keyboardShortcut', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'key', as: 'string', description: 'e.g. Alt+C'},
    {id: 'action', type: 'action', dynamic: true},
  ],
  impl: features(
    method(replace({find: '-', replace: '+', text: 'onKey%$key%Handler',useRegex: true}), call('action')),
    frontEnd.init((ctx,{cmp,el}) => {
      if (! cmp.hasDocOnKeyHanlder) {
        cmp.hasDocOnKeyHanlder = true
        ctx.run(rx.pipe(
          source.frontEndEvent('keydown'),
          rx.map(key.eventToMethod('%%',el)), 
          rx.filter('%%'), 
          rx.log('keyboardShortcut keyboard uiComp run handler'),
          sink.BEMethod('%%')
        ))
      }
    })
  )
})

component('feature.globalKeyboardShortcut', {
  type: 'feature',
  category: 'events',
  description: 'listen to events at the document level even when the component is not active',
  params: [
    {id: 'key', as: 'string', description: 'e.g. Alt+C'},
    {id: 'action', type: 'action', dynamic: true},
  ],
  impl: features(
    method(replace({find: '-', replace: '+', text: 'onKey%$key%Handler',useRegex: true}), call('action')),
    frontEnd.init((ctx,{cmp,el}) => {
      if (! cmp.hasDocOnKeyHanlder) {
        cmp.hasDocOnKeyHanlder = true
        ctx.run(rx.pipe(
          source.event('keydown','%$cmp.base.ownerDocument%'), 
          rx.takeUntil('%$cmp.destroyed%'),
          rx.map(key.eventToMethod('%%',el)), 
          rx.filter('%%'), 
          rx.log('keyboardShortcut keyboard uiComp run handler'),
          sink.BEMethod('%%')
        ))
      }
    })
  )
})

component('feature.onEnter', {
    type: 'feature',
    category: 'events',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: feature.onKey('Enter', call('action'))
})
  
component('feature.onEsc', {
    type: 'feature',
    category: 'events',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: feature.onKey('Esc',call('action'))
})

component('frontEnd.selectionKeySourceService', {
  type: 'feature',
  description: 'assign cmp.selectionKeySource with observable for meta-keys, also stops propagation !!!',
  params: [
    {id: 'autoFocs', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    service.registerBackEndService({
      id: 'selectionKeySource',
      service: obj(prop('cmpId', '%$cmp/cmpId%')),
      allowOverride: true
    }),
    frontEnd.var('autoFocs', '%$autoFocs%'),
    frontEnd.prop('selectionKeySource', (ctx,{cmp,el,autoFocs}) => {
      if (el.keydown_src) return
      const {pipe, takeUntil,subject} = jb.callbag
      el.keydown_src = subject()
      el.onkeydown = e => {
        if ([38,40,13,27].indexOf(e.keyCode) != -1) {
          jb.log('key source',{ctx, e})
          el.keydown_src.next((ctx.cmpCtx || ctx).dataObj(e))
          return false // stop propagation
        }
        return true
      }
      if (autoFocs)
        jb.ui.focus(el,'selectionKeySource',ctx)
      jb.log('register selectionKeySource',{cmp,cmp,el,ctx})
      return pipe(el.keydown_src, takeUntil(cmp.destroyed))
    })
  )
})

component('frontEnd.passSelectionKeySource', {
  type: 'feature',
  impl: frontEnd.var('selectionKeySourceCmpId', '%$$serviceRegistry/services/selectionKeySource/cmpId%')
})

component('source.findSelectionKeySource', {
  type: 'rx',
  category: 'source',
  description: 'used in front end, works with "selectionKeySourceService" and "passSelectionKeySource"',
  impl: rx.pipe(
    Var('clientCmp','%$cmp%'),
    source.merge( 
      source.data([]),
      (ctx,{cmp,selectionKeySourceCmpId}) => {
        jb.log('keyboard search selectionKeySource',{cmp,selectionKeySourceCmpId,ctx})
        const el = jb.ui.elemOfCmp(ctx,selectionKeySourceCmpId)
        const ret = jb.path(el, '_component.selectionKeySource')
        if (!ret)
          jb.log('keyboard selectionKeySource notFound',{cmp,selectionKeySourceCmpId,el,ctx})
        else
          jb.log('keyboard found selectionKeySource',{cmp,el,selectionKeySourceCmpId,ctx})
        return ret
      }
    ),
    rx.takeUntil('%$clientCmp.destroyed%'),
    rx.var('cmp','%$clientCmp%'),
    rx.log('keyboard from selectionKeySource')
  )
})
