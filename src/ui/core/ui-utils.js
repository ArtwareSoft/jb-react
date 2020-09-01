Object.assign(jb.ui,{
    focus(elem,logTxt,srcCtx) {
        if (!elem) debugger;
        // block the preview from stealing the studio focus
        const now = new Date().getTime();
        const lastStudioActivity = jb.studio.lastStudioActivity || jb.path(jb,['studio','studioWindow','jb','studio','lastStudioActivity'])
        jb.log('focus',['request',srcCtx, logTxt, now - lastStudioActivity, elem,srcCtx])
        if (jb.studio.previewjb == jb && jb.path(jb.frame.parent,'jb.resources.studio.project') != 'studio-helper' && lastStudioActivity && now - lastStudioActivity < 1000)
            return
        jb.delay(1).then(_=> {
          jb.log('focus',['apply',srcCtx,logTxt,elem,srcCtx])
          elem.focus()
        })
    },
    withUnits: v => (v === '' || v === undefined) ? '' : (''+v||'').match(/[^0-9]$/) ? v : `${v}px`,
    propWithUnits: (prop,v) => (v === '' || v === undefined) ? '' : `${prop}: ` + ((''+v||'').match(/[^0-9]$/) ? v : `${v}px`) + ';',
    fixCssLine: css => css.indexOf('\n') == -1 && ! css.match(/}\s*/) ? `{ ${css} }` : css,
    preserveCtx(ctx) {
        jb.ctxDictionary[ctx.id] = ctx
        return ctx.id
    },
    inStudio() { return jb.studio && jb.studio.studioWindow },
    inPreview() {
        try {
            return !jb.ui.inStudio() && jb.frame.parent && jb.frame.parent.jb.studio.initPreview
        } catch(e) {}
    },
    widgetBody(ctx) {
      // if (ctx.vars.tstWidgetId)
      //   return jb.path(jb.ui.widgets[ctx.vars.tstWidgetId],'body')
      // if (ctx.vars.headlessWidget)
      //   return jb.path(jb.ui.widgets[ctx.vars.widgetId],'body')
      const widgetId = ctx.vars.widgetId
      const top = ctx.vars.elemToTest || 
        ctx.vars.tstWidgetId && jb.path(jb.ui.widgets[ctx.vars.tstWidgetId],'body') ||
        ctx.vars.headlessWidget && jb.path(jb.ui.widgets[widgetId],'body') ||
        jb.path(ctx.frame().document,'body')
      return widgetId ? jb.ui.findIncludeSelf(top,`[widgetId="${widgetId}"]`)[0] : top
    },
    ctxOfElem: (elem,att) => elem && elem.getAttribute && jb.ctxDictionary[elem.getAttribute(att || 'jb-ctx')],
    parentCmps: el => jb.ui.parents(el).map(el=>el._component).filter(x=>x),
    closestCmpElem: elem => jb.ui.parents(elem,{includeSelf: true}).find(el=> el.getAttribute && el.getAttribute('cmp-id') != null),
    widgetOfElem(elem) {
      const el = jb.ui.parents(elem,{includeSelf: true}).filter(el=>el.getAttribute && el.getAttribute('widgettop'))[0]
      return el ? jb.objFromEntries(['widgetid','frontend','headless'].map(p=>[p,el.getAttribute(p)]).filter(e=>e[1]))
         : { widgetId: 'default'}
    },
    elemOfCmp: (ctx,cmpId) => jb.ui.findIncludeSelf(jb.ui.widgetBody(ctx),`[cmp-id="${cmpId}"]`)[0],
    fromEvent: (cmp,event,elem,options) => jb.callbag.pipe(
          jb.callbag.fromEvent(event, elem || cmp.base, options),
          jb.callbag.takeUntil(cmp.destroyed)
    ),
    renderWidget(profile,topElem) {
      if (!jb.ui.renderWidgetInStudio && jb.path(jb.frame,'parent.jb.ui.renderWidgetInStudio'))
        eval('jb.ui.renderWidgetInStudio= ' + jb.frame.parent.jb.ui.renderWidgetInStudio.toString())
      if (jb.frame.parent != jb.frame && jb.ui.renderWidgetInStudio)
        return jb.ui.renderWidgetInStudio(profile,topElem)
      else
        return jb.ui.render(jb.ui.h(jb.ui.extendWithServiceRegistry().run(profile)),topElem)    
    },
    extendWithServiceRegistry(_ctx) {
      const ctx = _ctx || new jb.jbCtx()
      return ctx.setVar('$serviceRegistry',{baseCtx: ctx, parentRegistry: ctx.vars.$serviceRegistry, services: {}})
    }
})

// ***************** inter-cmp services

jb.component('feature.serviceRegistey', {
  type: 'feature',
  impl: () => ({extendCtx: ctx => jb.ui.extendWithServiceRegistry(ctx) })
})

jb.component('service.registerBackEndService', {
  type: 'data',
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true },
    {id: 'service', mandatory: true, dynamic: true },
  ],
  impl: feature.init((ctx,{$serviceRegistry},{id,service}) => {
    const _id = id(ctx), _service = service(ctx)
    jb.log('registerService',[_id,_service,ctx.componentContext])
    if ($serviceRegistry.services[_id])
      jb.logError('overridingService',[_id,$serviceRegistry.services[_id],_service,ctx])
    $serviceRegistry.services[_id] = _service
  })
})


// ****************** html utils ***************
Object.assign(jb.ui, {
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
    activeElement() { return document.activeElement },
    find(el,selector,options) {
      if (!el) return []
      if (jb.path(el,'constructor.name') == 'jbCtx')
          el = jb.ui.widgetBody(el) // el is ctx
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
    index: el => Array.from(el.parentNode.children).indexOf(el),
    limitStringLength(str,maxLength) {
        if (typeof str == 'string' && str.length > maxLength-3)
          return str.substring(0,maxLength) + '...';
        return str;
    },
    addHTML(el,html) {
        const elem = document.createElement('div');
        elem.innerHTML = html;
        el.appendChild(elem.firstChild)
    },
    addStyleElem(innerHtml,workerId) {
      if (workerId) {
        jb.ui.workerStyleElems = jb.ui.workerStyleElems || {}
        jb.ui.workerStyleElems[workerId] = jb.ui.workerStyleElems[workerId] || []
        jb.ui.workerStyleElems[workerId].push(innerHtml)
      } else {
        const style_elem = document.createElement('style');
        style_elem.innerHTML = innerHtml;
        document.head.appendChild(style_elem);
      }
    },
    valueOfCssVar(varName,parent) {
      parent = parent || document.body
      el = parent.ownerDocument.createElement('div')
      el.style.display = 'none'
      el.style.color = `var(--${varName})`
      parent.appendChild(el)
      const ret = getComputedStyle(el).color
      parent.removeChild(el)
      return ret
    }
})

jb.objectDiff = function(newObj, orig) {
    if (orig === newObj) return {}
    if (!jb.isObject(orig) || !jb.isObject(newObj)) return newObj
    const deletedValues = Object.keys(orig).reduce((acc, key) =>
        newObj.hasOwnProperty(key) ? acc : { ...acc, [key]: jb.frame.workerId && jb.frame.workerId() ? '__undefined' : undefined}
    , {})

    return Object.keys(newObj).reduce((acc, key) => {
      if (!orig.hasOwnProperty(key)) return { ...acc, [key]: newObj[key] } // return added r key
      const difference = jb.objectDiff(newObj[key], orig[key])
      if (jb.isObject(difference) && jb.isEmpty(difference)) return acc // return no diff
      return { ...acc, [key]: difference } // return updated key
    }, deletedValues)
}

// ****************** components ****************

jb.component('action.applyDeltaToCmp', {
  type: 'action',
  params: [
    {id: 'delta', mandatory: true },
    {id: 'cmpId', as: 'string', mandatory: true },
  ],
  impl: (ctx,delta,cmpId) => jb.ui.applyDeltaToCmp(delta,ctx,cmpId)
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
    const elem = jb.path(ctx.vars.cmp,'base')
    if (elem)
      return jb.ui.focus(elem,desc,ctx)
    const delta = {attributes: {$focus: desc}}
    jb.ui.applyDeltaToCmp(delta,ctx,cmpId)
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
          styleParams: ctx.componentContext.params
    })
})

jb.component('styleByControl', {
  typePattern: t => /\.style$/.test(t),
  category: 'advanced:10,all:20',
  params: [
    {id: 'control', type: 'control', mandatory: true, dynamic: true},
    {id: 'modelVar', as: 'string', mandatory: true}
  ],
  impl: (ctx,control,modelVar) => control(ctx.setVar(modelVar,ctx.vars.$model))
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
