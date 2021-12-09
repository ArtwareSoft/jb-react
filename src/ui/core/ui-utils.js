jb.extension('ui', {
    focus(elem,logTxt,srcCtx) {
        if (!elem) debugger
        // block the preview from stealing the studio focus
        const now = new Date().getTime()
        const lastStudioActivity = jb.studio.lastStudioActivity 
          || jb.path(jb,['studio','studioWindow','jb','studio','lastStudioActivity'])

        jb.log('focus request',{srcCtx, logTxt, timeDiff: now - lastStudioActivity, elem,srcCtx})
        if (jb.studio.previewjb == jb && jb.path(jb.ui.parentFrameJb(),'resources.studio.project') != 'studio-helper' && lastStudioActivity && now - lastStudioActivity < 1000)
            return
        jb.log('focus dom',{elem,srcCtx,logTxt})
        jb.delay(1).then(() => elem.focus())
    },
    withUnits: v => (v === '' || v === undefined) ? '' : (''+v||'').match(/[^0-9]$/) ? v : `${v}px`,
    propWithUnits: (prop,v) => (v === '' || v === undefined) ? '' : `${prop}: ` + ((''+v||'').match(/[^0-9]$/) ? v : `${v}px`) + ';',
    fixCssLine: css => css.indexOf('\n') == -1 && ! css.match(/}\s*/) ? `{ ${css} }` : css,
    preserveCtx(ctx) {
        jb.ctxDictionary[ctx.id] = ctx
        return ''+ctx.id
    },
    inStudio() { return jb.studio && jb.studio.studioWindow },
    parentFrameJb() {
      try {
        return jb.frame.parent && jb.frame.parent.jb
      } catch(e) {}
    },
//    inPreview: () => !jb.ui.inStudio() && jb.ui.parentFrameJb() && jb.ui.parentFrameJb().studio.initPreview,
    widgetBody(ctx) {
      const {elemToTest,tstWidgetId,headlessWidget,FEwidgetId, headlessWidgetId} = ctx.vars
      const top = elemToTest ||
        tstWidgetId && jb.path(jb,`ui.headless.${tstWidgetId}.body`) ||
        tstWidgetId && jb.path(jb,`parent.ui.headless.${tstWidgetId}.body`) ||
        headlessWidget && jb.path(jb,`ui.headless.${headlessWidgetId}.body`) ||
        jb.path(jb.frame.document,'body')
      return FEwidgetId ? jb.ui.findIncludeSelf(top,`[widgetid="${FEwidgetId}"]`)[0] : top
    },
    ctxOfElem: (elem,att) => elem && elem.getAttribute && jb.ctxDictionary[elem.getAttribute(att || 'jb-ctx')],
    parentCmps: el => jb.ui.parents(el).map(el=>el._component).filter(x=>x),
    closestCmpElem: elem => jb.ui.parents(elem,{includeSelf: true}).find(el=> el.getAttribute && el.getAttribute('cmp-id') != null),
    headlessWidgetId: elem => jb.ui.parents(elem,{includeSelf: true})
        .filter(el=>el.getAttribute && el.getAttribute('widgettop') && el.getAttribute('headless'))
        .map(el=>el.getAttribute('widgetid'))[0],
    frontendWidgetId: elem => jb.ui.parents(elem,{includeSelf: true})
        .filter(el=>el.getAttribute && el.getAttribute('widgettop') && el.getAttribute('frontend'))
        .map(el=>el.getAttribute('widgetid'))[0],
    parentWidgetId: elem => jb.ui.parents(elem,{includeSelf: true})
        .filter(el=>el.getAttribute && el.getAttribute('widgettop'))
        .map(el=>el.getAttribute('widgetid'))[0],    
    elemOfCmp: (ctx,cmpId) => jb.ui.findIncludeSelf(jb.ui.widgetBody(ctx),`[cmp-id="${cmpId}"]`)[0],
    fromEvent: (cmp,event,elem,options) => jb.callbag.pipe(
          jb.callbag.fromEvent(event, elem || cmp.base, options),
          jb.callbag.takeUntil(cmp.destroyed)
    ),
    renderWidget: (profile,topElem,ctx) => jb.ui.render(jb.ui.h(jb.ui.extendWithServiceRegistry(ctx).run(profile)),topElem),
    extendWithServiceRegistry(_ctx) {
      const ctx = _ctx || new jb.core.jbCtx()
      return ctx.setVar('$serviceRegistry',{baseCtx: ctx, parentRegistry: ctx.vars.$serviceRegistry, services: {}})
    },
    //cmpV: cmp => cmp ? `${cmp.cmpId};${cmp.ver}` : '',
    rxPipeName: profile => (jb.path(profile,'0.event') || jb.path(profile,'0.$') || '') + '...'+jb.path(profile,'length')
})

// ***************** inter-cmp services

// var { feature, action } = jb.ns('feature')

jb.component('feature.serviceRegistey', {
  type: 'feature',
  impl: () => ({extendCtx: ctx => jb.ui.extendWithServiceRegistry(ctx) })
})

jb.component('service.registerBackEndService', {
  type: 'data',
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true },
    {id: 'service', mandatory: true, dynamic: true },
    {id: 'allowOverride', as: 'boolean' },
  ],
  impl: feature.init((ctx,{$serviceRegistry},{id,service,allowOverride}) => {
    const _id = id(ctx), _service = service(ctx)
    jb.log('register service',{id: _id, service: _service, ctx: ctx.cmpCtx})
    if ($serviceRegistry.services[_id] && !allowOverride)
      jb.logError('overridingService ${_id}',{id: _id, service: $serviceRegistry.services[_id], service: _service,ctx})
    $serviceRegistry.services[_id] = _service
  })
  // feature.initValue({to: '%$$serviceRegistry/services/{%$id()%}%', value: '%$service()%', alsoWhenNotEmpty: true}),
})


// ****************** html utils ***************
jb.extension('ui', {
    outerWidth(el) {
        const style = getComputedStyle(el)
        return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight)
    },
    outerHeight(el) {
        const style = getComputedStyle(el)
        return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom)
    },
    offset: el => el.getBoundingClientRect(),
    parents(el,{includeSelf} = {}) {
        const res = []
        el = includeSelf ? el : el && el.parentNode
        while(el) {
          res.push(el)
          el = el.parentNode
        }
        return res
    },
    closest(el,query) {
        while(el) {
          if (jb.ui.matches(el,query)) return el
          el = el.parentNode
        }
    },
    scrollIntoView: el => el.scrollIntoViewIfNeeded && el.scrollIntoViewIfNeeded(),
    activeElement: () => document.activeElement,
    find(el,selector,options) {
      if (!el) return []
      if (jb.path(el,'constructor.name') == 'jbCtx')
          el = jb.ui.widgetBody(el)
      if (!el) return []
      return el instanceof jb.ui.VNode ? el.querySelectorAll(selector,options) :
          [... (options && options.includeSelf && jb.ui.matches(el,selector) ? [el] : []),
            ...Array.from(el.querySelectorAll(selector))]
    },
    findIncludeSelf: (el,selector) => jb.ui.find(el,selector,{includeSelf: true}),
    addClass: (el,clz) => el && el.classList && el.classList.add(clz),
    removeClass: (el,clz) => el && el.classList && el.classList.remove(clz),
    hasClass: (el,clz) => el && el.classList && el.classList.contains(clz),
    matches: (el,query) => el && el.matches && el.matches(query),
    indexOfElement: el => Array.from(el.parentNode.children).indexOf(el),
    limitStringLength: (str,maxLength) => 
      (typeof str == 'string' && str.length > maxLength-3) ? str.substring(0,maxLength) + '...' : str,
    addHTML(el,html) {
        const elem = document.createElement('div')
        elem.innerHTML = html
        el.appendChild(elem.firstChild)
    },
    insertOrUpdateStyleElem(ctx,innerText,elemId,{classId} = {}) {
      const widgetId = ctx.vars.headlessWidget && ctx.vars.headlessWidgetId
      if (widgetId && !ctx.vars.previewOverlay) { // headless
        if (!jb.ui.headless[widgetId])
          return
        jb.ui.headless[widgetId].styles = jb.ui.headless[widgetId].styles || {}
        jb.ui.headless[widgetId].styles[elemId] = innerText
        jb.ui.renderingUpdates.next({widgetId, css: innerText, elemId, classId })
      } else if (jb.frame.document) { // FE or local
        let elem = document.querySelector(`head>style[elemId="${elemId}"]`)
        if (!elem) {
          elem = document.createElement('style')
          elem.setAttribute('elemId',elemId)
          document.head.appendChild(elem)
        }
        elem.setAttribute('src',`${classId || ''} ${ctx.path}`)
        elem.innerText = innerText
      }
    },
    valueOfCssVar(varName,parent) {
      parent = parent || document.body
      if (!parent) {
        jb.logError('valueOfCssVar: no parent')
        return 'red'
      }
      el = parent.ownerDocument.createElement('div')
      el.style.display = 'none'
      el.style.color = `var(--${varName})`
      parent.appendChild(el)
      const ret = getComputedStyle(el).color
      parent.removeChild(el)
      return ret
    }
})

// ****************** components ****************

jb.component('action.applyDeltaToCmp', {
  type: 'action',
  params: [
    {id: 'delta', mandatory: true },
    {id: 'cmpId', as: 'string', mandatory: true },
    {id: 'assumedVdom' },
  ],
  impl: (ctx,delta,cmpId,assumedVdom) => 
    jb.ui.applyDeltaToCmp({ctx,delta,cmpId,assumedVdom})
})

jb.component('sink.applyDeltaToCmp', {
  type: 'rx',
  params: [
    {id: 'delta', dynamic: true, mandatory: true},
    {id: 'cmpId', as: 'string', mandatory: true },
  ],
  impl: sink.action(action.applyDeltaToCmp('%$delta()%','%$cmpId%'))
})

jb.component('action.focusOnCmp', {
  description: 'runs both in FE and BE',
  type: 'action',
  params: [
    {id: 'description', as: 'string'},
    {id: 'cmpId', as: 'string', defaultValue: '%$cmp/cmpId%' },
  ],
  impl: (ctx,desc,cmpId) => {
    const frontEndElem = jb.path(ctx.vars.cmp,'base')
    if (frontEndElem) {
      jb.log('frontend focus on cmp',{frontEndElem,ctx,desc,cmpId})
      return jb.ui.focus(frontEndElem,desc,ctx)
    } else {
      jb.log('backend focus on cmp',{frontEndElem,ctx,desc,cmpId})
      const delta = {attributes: {$focus: desc}}
      jb.ui.applyDeltaToCmp({delta,ctx,cmpId})
    }
  }
})

jb.component('customStyle', {
  typePattern: t => /\.style$/.test(t),
  category: 'advanced:10,all:10',
  params: [
    {id: 'template', as: 'single', mandatory: true, dynamic: true, ignore: true},
    {id: 'css', as: 'string'},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: (ctx,css,features) => ({
          template: ctx.profile.template,
          css: css,
          featuresOptions: features(),
          styleParams: ctx.cmpCtx.params
    })
})

jb.component('styleByControl', {
  typePattern: t => /\.style$/.test(t),
  category: 'advanced:10,all:20',
  params: [
    {id: 'control', type: 'control', mandatory: true, dynamic: true},
    {id: 'modelVar', as: 'string', mandatory: true}
  ],
  impl: (ctx,control,modelVar) => control(ctx.setVar(modelVar, ctx.vars.$model))
})

jb.component('styleWithFeatures', {
  typePattern: t => /\.style$/.test(t),
  description: 'customize, add more features to style',
  category: 'advanced:10,all:20',
  params: [
    {id: 'style', type: '$asParent', mandatory: true, composite: true},
    {id: 'features', type: 'feature[]', templateValue: [], dynamic: true, mandatory: true}
  ],
  impl: (ctx,style,features) => {
    if (style instanceof jb.ui.JbComponent)
      return style.jbExtend(features(),ctx)
    return style && {...style,featuresOptions: (style.featuresOptions || []).concat(features())}
  }
})

jb.component('controlWithFeatures', {
  type: 'control',
  description: 'customize, add more features to control',
  category: 'advanced:10,all:20',
  params: [
    {id: 'control', type: 'control', mandatory: true},
    {id: 'features', type: 'feature[]', templateValue: [], mandatory: true}
  ],
  impl: (ctx,control,features) => control.jbExtend(features,ctx).orig(ctx)
})

jb.component('renderWidget', {
  type: 'action',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'selector', as: 'string', defaultValue: 'body'}
  ],
  impl: (ctx, control, selector) => jb.ui.render(jb.ui.h(control(jb.ui.extendWithServiceRegistry(ctx))), document.querySelector(selector))
})