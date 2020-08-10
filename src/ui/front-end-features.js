jb.ns('rx,key,frontEnd,sink')

jb.component('action.runBEMethod', {
    type: 'action',
    description: 'can be activated on both FE & BE, assuming $cmp variable',
    macroByValue: true,
    params: [
      {id: 'method', as: 'string', dynamic: true },
      {id: 'data', defaultValue: '%%', dynamic: true },
      {id: 'vars', dynamic: true },
    ],
    impl: (ctx,method,data,vars) => jb.ui.runBEMethodInAnyContext(ctx,method(),data(),vars())
})

jb.component('action.runFEMethod', {
  type: 'action',
  description: 'cab be activated in frontEnd only with $cmp variable',
  macroByValue: true,
  params: [
    {id: 'method', as: 'string', dynamic: true },
    {id: 'data', defaultValue: '%%', dynamic: true },
    {id: 'vars', dynamic: true },
  ],
  impl: (ctx,method,data,vars) => ctx.vars.cmp && ctx.vars.cmp.runFEMethod(method(),data(),vars())
})

jb.component('sink.BEMethod', {
    type: 'rx',
    category: 'sink',
    macroByValue: true,
    params: [
        {id: 'method', as: 'string', dynamic: true },
        {id: 'data', defaultValue: '%%', dynamic: true },
        {id: 'vars', dynamic: true },
    ],
    impl: sink.action((ctx,{},{method,data,vars}) => jb.ui.runBEMethodInAnyContext(ctx,method(ctx),data(ctx),vars(ctx)))
})

jb.component('sink.FEMethod', {
  type: 'rx',
  category: 'sink',
  macroByValue: true,
  params: [
      {id: 'method', as: 'string', dynamic: true },
      {id: 'data', defaultValue: '%%', dynamic: true },
      {id: 'vars', dynamic: true },
  ],
  impl: sink.action((ctx,{cmp},{method,data,vars}) => cmp && cmp.runFEMethod(method(ctx),data(ctx),vars(ctx)))
})

jb.component('action.refreshCmp', {
  type: 'action',
  description: 'can be activated on both FE & BE, assuming $cmp variable',
  params: [
    {id: 'state', dynamic: true },
    {id: 'options', dynamic: true },
  ],
  impl: (ctx,state,options) => ctx.vars.cmp && ctx.vars.cmp.refresh(state(ctx),{srcCtx: ctx, ...options(ctx)})
})

jb.component('sink.refreshCmp', {
  type: 'rx',
  description: 'can be activated on both FE & BE, assuming $cmp variable',
  params: [
    {id: 'state', dynamic: true },
    {id: 'options', dynamic: true },
  ],
  impl: sink.action(action.refreshCmp('%$state()%','%$options()%'))
})

jb.component('frontEnd.method', {
    type: 'feature',
    category: 'front-end',
    description: 'register as front end method, the context is limited to cmp & state. can be run with cmp.runFEMetod(id,data,vars)',
    params: [
        {id: 'method', as: 'string' },
        {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: (ctx,method,action) => ({ frontEndMethod: { method, path: ctx.path, action: action.profile} })
})

jb.component('frontEnd.enrichUserEvent', {
  type: 'feature',
  category: 'front-end',
  description: 'the result is assigned to userEvent, can use %$cmp%, %$ev%, %$userEvent%',
  params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({ frontEndMethod: { method: 'enrichUserEvent', path: ctx.path, action: action.profile} })
})

jb.component('frontEnd.onRefresh', {
  type: 'feature',
  category: 'front-end',
  description: 'rerun on frontend when after refresh is activated',
  params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({ frontEndMethod: { method: 'onRefresh', path: ctx.path, action: action.profile} })
})

jb.component('frontEnd.init', {
    type: 'feature',
    category: 'front-end',
    description: 'initializes the front end, mount, component did update',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: (ctx,action) => ({ frontEndMethod: { method: 'init', path: ctx.path, action: action.profile} })
})

jb.component('frontEnd.prop', {
    type: 'feature',
    category: 'front-end',
    description: 'assign front end property (calculated using the limited FE context)',
    params: [
      {id: 'id', as: 'string', mandatory: true },
      {id: 'value', mandatory: true, dynamic: true}
    ],
    impl: (ctx,id,value) => ({ frontEndMethod: { method: 'calcProps', path: ctx.path, 
      action: (_ctx,{cmp}) => cmp[id] = value(_ctx) } })
})

jb.component('frontEnd.onDestroy', {
    type: 'feature',
    description: 'destructs the front end',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: (ctx,action) => ({ frontEndMethod: { method: 'destroy', path: ctx.path, action: action.profile } })
})

jb.component('source.frontEndEvent', {
    type: 'rx',
    category: 'source',
    description: 'assumes cmp in context',
    params: [
        {id: 'event', as: 'string', options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
    ],
    impl: rx.pipe(source.event('%$event%','%$cmp.base%'), 
    rx.takeUntil('%$cmp.destroyed%'))
})

jb.component('frontEnd.addUserEvent', {
  type: 'rx',
  impl: rx.var('ev', ({data}) => jb.ui.buildUserEvent(data, jb.ui.closestCmpElem(data.currentTarget || data.target))),
})

jb.component('frontEnd.flow', {
    type: 'feature',
    category: 'front-end',
    description: 'rx flow at front end',
    params: [
        {id: 'elems', type: 'rx[]', as: 'array', dynamic: true, mandatory: true, templateValue: []}
    ],
    impl: (ctx, elems) => ({ frontEndMethod: { 
      method: 'init', path: ctx.path, 
      action: rx.pipe(_ctx => elems(_ctx))
    }})
})

jb.component('feature.keyboardShortcut', {
    type: 'feature',
    category: 'events',
    description: 'listen to events at the document level even when the component is not active',
    params: [
      {id: 'key', as: 'string', description: 'e.g. Alt+C'},
      {id: 'action', type: 'action', dynamic: true}
    ],
    impl: frontEnd.flow(
        source.event('%$event%','%$cmp.base.ownerDocument%'), 
        rx.takeUntil('%$cmp.destroyed%'),
        rx.filter(key.eventMatchKey('%%','%$key%')), 
        sink.BEMethod('Shortcut-%$key%'))
})
  
jb.component('feature.onEvent', {
    type: 'feature',
    category: 'events',
    params: [
      {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
      {id: 'action', type: 'action[]', mandatory: true, dynamic: true},
    ],
    impl: features(
        method('%$event%Handler', call('action')),
        htmlAttribute('on%$event%','%$event%Handler'),
//        frontEnd.flow(source.frontEndEvent('%$event%'), sink.BEMethod('%$event%Handler'))
    )
})
  
jb.component('feature.onHover', {
    type: 'feature',
    description: 'on mouse enter',
    category: 'events',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true},
      {id: 'onLeave', type: 'action', mandatory: true, dynamic: true},
    ],
    impl: features(
        method('onHover','%$action%'),
        method('onLeave','%$onLeave%'),
        frontEnd.flow(source.frontEndEvent('mouseenter'), sink.BEMethod('onHover')),
        frontEnd.flow(source.frontEndEvent('mouseleave'), sink.BEMethod('onLeave'))
    )
})
  
jb.component('feature.classOnHover', {
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

jb.component('key.eventMatchKey', {
    type: 'boolean',
    params: [
        {id: 'event'},
        {id: 'key', as: 'string', description: 'E.g., a,27,Enter,Esc,Ctrl+C or Alt+V' },
    ],
    impl: (ctx, e, key) => {
        if (!key) return;
      const dict = { tab: 9, delete: 46, tab: 9, esc: 27, enter: 13, right: 39, left: 37, up: 38, down: 40}
    
      key = key.replace(/-/,'+');
      const keyWithoutPrefix = key.split('+').pop()
      let keyCode = dict[keyWithoutPrefix.toLowerCase()]
      if (+keyWithoutPrefix)
        keyCode = +keyWithoutPrefix
      if (keyWithoutPrefix.length == 1)
        keyCode = keyWithoutPrefix.charCodeAt(0);
    
        if (key.match(/^[Cc]trl/) && !e.ctrlKey) return;
        if (key.match(/^[Aa]lt/) && !e.altKey) return;
        return e.keyCode == keyCode
  }
})

jb.component('feature.onKey', {
    type: 'feature',
    category: 'events',
    params: [
      {id: 'key', as: 'string', description: 'E.g., a,27,Enter,Esc,Ctrl+C or Alt+V'},
      {id: 'action', type: 'action', mandatory: true, dynamic: true},
    ],
    impl: features(
        method('on%$Key%Handler','%$action%'),
        frontEnd.flow(source.frontEndEvent('keydown'), rx.filter(key.eventMatchKey('%%','%$key%')), sink.BEMethod('on%$Key%Handler'))
    )
})
  
jb.component('feature.onEnter', {
    type: 'feature',
    category: 'events',
    params: [
      {id: 'action', type: 'action', mandatory: true, dynamic: true}
    ],
    impl: feature.onKey('Enter', call('action'))
})
  
jb.component('feature.onEsc', {
    type: 'feature',
    category: 'events',
    params: [
      {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
    ],
    impl: feature.onKey('Esc',call('action'))
})

jb.component('frontEnd.updateState', {
  type: 'rx',
  category: 'operator',
  description: 'set state for FE',
  params: [
    {id: 'prop', as: 'string', dynamic: true},
    {id: 'value', dynamic: true},
  ],
  impl: rx.do((ctx,{cmp},{prop,value}) => cmp.state[prop(ctx)] = value(ctx))
})

jb.component('frontEnd.selectionKeySourceService', {
  type: 'feature',
  description: 'assign cmp.selectionKeySource with observable for meta-keys, also stops propagation !!!',
  params: [
    {id: 'autoFocs', as: 'boolean' },
  ],
  impl: features(
    service.registerBackEndService('selectionKeySource', obj(prop('cmpId', ctx => ctx.exp('%$cmp/cmpId%')))),
    passPropToFrontEnd('autoFocs','%$autoFocs%'),
    frontEnd.prop('selectionKeySource', (ctx,{cmp,el,autoFocs}) => {
      const {pipe, takeUntil,subject} = jb.callbag
      const keydown_src = subject()
      el.onkeydown = e => {
        if ([38,40,13,27].indexOf(e.keyCode) != -1) {
          keydown_src.next(ctx.dataObj(e))
          return false // stop propagation
        }
        return true
      }
      if (autoFocs)
        jb.ui.focus(el,'selectionKeySource')
      return pipe(keydown_src, takeUntil(cmp.destroyed))
    })
  )
})

jb.component('frontEnd.passSelectionKeySource', {
  type: 'feature',
  impl: passPropToFrontEnd('selectionKeySourceCmpId', ctx => ctx.exp('%$serviceRegistry/services/selectionKeySource/cmpId%'))
})

jb.component('source.findSelectionKeySource', {
  type: 'rx',
  category: 'source',
  description: 'used in front end, works with "selectionKeySourceService" and "passSelectionKeySource"',
  impl: ctx => {
    const cmpId = ctx.vars.selectionKeySourceCmpId
    if (cmpId) {
      const el = jb.ui.elemOfCmp(ctx,cmpId)
      if (!el)
        jb.logError(`can not find selection source elem of cmpId ${cmpId}`,ctx)
      if (el && el._component.selectionKeySource)
        return el._component.selectionKeySource
    }
    //return jb.callbag.fromIter([])
  }
})