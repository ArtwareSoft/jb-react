extension('ui', 'api', {
  renderWidget(profile, topElem, settings = {}) { // {ctx, widgetId} = settings
    const widgetId = settings.widgetId || topElem.getAttribute('id') || 'main'
    const ctx = (settings.ctx || new jb.core.jbCtx()).setVars({widgetId})
    return jb.ui.render(jb.ui.h(jb.ui.extendWithServiceRegistry(ctx).run(profile)), topElem, { ctx })
  }
})

extension('ui', 'utils', {
  initExtension() {
    return {
      FELibLoaderPromises: {}
    }
  },
  focus(elem, logTxt, ctx) {
    if (!elem) debugger
    // block the preview from stealing the studio focus
    const now = new Date().getTime()
    const lastStudioActivity = jb.path(jb, ['studio', 'lastStudioActivity']) || jb.path(jb, ['studio', 'studioWindow', 'jb', 'studio', 'lastStudioActivity']) || 0

    jb.log('focus request', { ctx, logTxt, timeDiff: now - lastStudioActivity, elem })
    jb.log('focus dom', { elem, ctx, logTxt })
    jb.delay(1).then(() => elem.focus())
  },
  withUnits: v => (v === '' || v === undefined) ? '' : ('' + v || '').match(/[^0-9]$/) ? v : `${v}px`,
  propWithUnits: (prop, v) => (v === '' || v === undefined) ? '' : `${prop}: ` + (('' + v || '').match(/[^0-9]$/) ? v : `${v}px`) + ';',
  fixCssLine: css => css.indexOf('\n') == -1 && !css.match(/}\s*/) ? `{ ${css} }` : css,
  inStudio() { return jb.studio && jb.studio.studioWindow },
  isMobile: () => typeof navigator != 'undefined' && /Mobi|Android/i.test(navigator.userAgent),
  parentFrameJb() {
    try {
      return jb.frame.parent && jb.frame.parent.jb
    } catch (e) { }
  },
  widgetBody(ctx) {
    const { elemToTest, FEWidgetId, headlessWidgetId, widgetId, uiTest } = ctx.vars
    const body = elemToTest ||
      headlessWidgetId && jb.path(jb, `ui.headless.${headlessWidgetId}.body`) ||
      uiTest && jb.path(Object.values(jb.ui.FEEmulator)[0], 'body') ||
      jb.path(jb.frame.document, 'body')
      
      return FEWidgetId ? jb.ui.findIncludeSelf(body, `[widgetid="${FEWidgetId}"]`)[0] : body
  },
  // widgetBody(ctx) {
  //   const { elemToTest, widgetId, headlessWidget, FEWidgetId, headlessWidgetId, uiTest, emulateFrontEndInTest, FEEMulator } = ctx.vars
  //   const top = elemToTest ||
  //     FEEMulator && jb.path(jb, `ui.FEEmulator.${headlessWidgetId}.body`) ||
  //     uiTest && headlessWidget && jb.path(jb, `ui.headless.${headlessWidgetId}.body`) ||
  //     uiTest && jb.path(jb, `ui.FEEmulator.${headlessWidgetId}.body`) ||
  //     uiTest && jb.path(jb, `parent.ui.headless.${headlessWidgetId}.body`) ||
  //     widgetId && jb.path(jb, `ui.headless.${widgetId}.body`) ||
  //     headlessWidget && jb.path(jb, `ui.headless.${headlessWidgetId}.body`) ||
  //     jb.path(jb.frame.document, 'body')
  //   return FEWidgetId ? jb.ui.findIncludeSelf(top, `[widgetid="${FEWidgetId}"]`)[0] : top
  // },
  cmpCtxOfElem: (elem) => elem && elem.getAttribute && jb.path(jb.ui.cmps[elem.getAttribute('cmp-id')],'calcCtx'),
  parentCmps: el => jb.ui.parents(el).map(el => el._component).filter(x => x),
  closestCmpElem: elem => jb.ui.parents(elem, { includeSelf: true }).find(el => el.getAttribute && el.getAttribute('cmp-id') != null),
  headlessWidgetId: elem => jb.ui.parents(elem, { includeSelf: true })
    .filter(el => el.getAttribute && el.getAttribute('widgettop') && el.getAttribute('headless'))
    .map(el => el.getAttribute('widgetid'))[0],
  frontendWidgetId: elem => jb.ui.parents(elem, { includeSelf: true })
    .filter(el => el.getAttribute && el.getAttribute('widgettop') && el.getAttribute('frontend'))
    .map(el => el.getAttribute('widgetid'))[0],
  parentWidgetId: elem => jb.ui.parents(elem, { includeSelf: true })
    .filter(el => el.getAttribute && el.getAttribute('widgettop'))
    .map(el => el.getAttribute('widgetid'))[0],
  elemOfCmp: (ctx, cmpId) => jb.ui.findIncludeSelf(jb.ui.widgetBody(ctx), `[cmp-id="${cmpId}"]`)[0],
  fromEvent: (cmp, event, elem, options) => jb.callbag.pipe(
    jb.callbag.fromEvent(event, elem || cmp.base, options),
    jb.callbag.takeUntil(cmp.destroyed)
  ),
  extendWithServiceRegistry(_ctx) {
    const ctx = _ctx || new jb.core.jbCtx()
    return ctx.setVar('$serviceRegistry', { baseCtx: ctx, parentRegistry: ctx.vars.$serviceRegistry, services: {} })
  },
  //cmpV: cmp => cmp ? `${cmp.cmpId};${cmp.ver}` : '',
  rxPipeName: profile => (jb.path(profile, '0.event') || jb.path(profile, '0.$') || '') + '...' + jb.path(profile, 'length')
})

// ***************** inter-cmp services

component('feature.serviceRegistey', {
  type: 'feature',
  impl: () => ({ extendCtx: ctx => jb.ui.extendWithServiceRegistry(ctx) })
})

component('service.registerBackEndService', {
  type: 'feature',
  params: [
    {id: 'id', as: 'string', mandatory: true, dynamic: true},
    {id: 'service', mandatory: true, dynamic: true},
    {id: 'allowOverride', as: 'boolean', type: 'boolean'}
  ],
  impl: feature.init((ctx, { $serviceRegistry }, { id, service, allowOverride }) => {
    const _id = id(ctx), _service = service(ctx)
    jb.log('register service', { id: _id, service: _service, ctx: ctx.cmpCtx })
    if ($serviceRegistry.services[_id] && !allowOverride)
      jb.logError('overridingService ${_id}', { id: _id, service: $serviceRegistry.services[_id], service: _service, ctx })
    $serviceRegistry.services[_id] = _service
  })
})


// ****************** html utils ***************
extension('ui', 'html', {
  outerWidth(el) {
    if (el instanceof jb.ui.VNode) return 0
    const style = getComputedStyle(el)
    return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight)
  },
  outerHeight(el) {
    if (el instanceof jb.ui.VNode) return 0
    const style = getComputedStyle(el)
    return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom)
  },
  children(el) {
    return (el instanceof jb.ui.VNode) ? (el.children || []) : [...(el.children || [])]
  },
  clientRect(el) {
      if (!el || el instanceof jb.ui.VNode) return { top: 0, left: 0}
      return el.getBoundingClientRect()
  },
  isHeadless: el => jb.ui.parents(el, {includeSelf: true}).pop().headless,
  parents(el, { includeSelf } = {}) {
    const res = []
    el = includeSelf ? el : el && el.parentNode
    while (el) {
      res.push(el)
      el = el.parentNode
    }
    return res
  },
  closest(el, query) {
    while (el) {
      if (jb.ui.matches(el, query)) return el
      el = el.parentNode
    }
  },
  scrollIntoView: el => el.scrollIntoViewIfNeeded && el.scrollIntoViewIfNeeded(),
  activeElement: () => jb.path(jb.frame.document,'activeElement'),
  querySelectorAll(el, selector, options) {
    if (!el) return []
    if (jb.path(el, 'constructor.name') == 'jbCtx') {
      jb.logError('jb.utils.find ctx instead of el',{ctx: el})
      el = jb.ui.widgetBody(el)
    }
    if (!el) return []
    return el instanceof jb.ui.VNode ? el.querySelectorAll(selector, options) :
      [... (options && options.includeSelf && jb.ui.matches(el, selector) ? [el] : []),
      ...Array.from(el.querySelectorAll(selector))]
  },
  findIncludeSelf: (el, selector) => jb.ui.querySelectorAll(el, selector, { includeSelf: true }),
  addClass: (el, clz) => el && el.addClass ? el.addClass(clz) : el.classList && el.classList.add(clz),
  removeClass: (el, clz) => el && el.removeClass ? el.removeClass(clz) : el.classList && el.classList.remove(clz),
  hasClass: (el, clz) => el && el.hasClass ? el.hasClass(clz) : el.classList && el.classList.contains(clz),
  getStyle: (el, prop) => el && el.getStyle ? el.getStyle(prop) : el.style[prop],
  setStyle: (el, prop,val) => el && el.setStyle ? el.setStyle(prop,val) : el.style[prop] = val,
  matches: (el, query) => el && el.matches && el.matches(query),
  indexOfElement: el => Array.from(el.parentNode.children).indexOf(el),
  limitStringLength: (str, maxLength) =>
    (typeof str == 'string' && str.length > maxLength - 3) ? str.substring(0, maxLength) + '...' : str,
  addHTML(el, html) {
    const elem = document.createElement('div')
    elem.innerHTML = html
    el.appendChild(elem.firstChild)
  },
  insertOrUpdateStyleElem(ctx, innerText, elemId, { classId } = {}) {
    const { headlessWidget, headlessWidgetId, previewOverlay, FEwidgetId, useFrontEndInTest} = ctx.vars

    if (useFrontEndInTest && !headlessWidget && FEwidgetId) {
      const widgetId = headlessWidgetId
      const widget = jb.ui.FEEmulator[widgetId]
      if (!widget)
        return
      widget.styles = widget.styles || {}
      widget.styles[elemId] = innerText
    } else if (headlessWidget && !previewOverlay) { // headless
      const widgetId = headlessWidgetId
      if (!jb.ui.headless[widgetId])
        return
      jb.ui.headless[widgetId].styles = jb.ui.headless[widgetId].styles || {}
      jb.ui.headless[widgetId].styles[elemId] = innerText
      jb.ui.sendRenderingUpdate(ctx, { widgetId, css: innerText, elemId, classId })
    } else if (jb.frame.document) { // FE or local
      let elem = document.querySelector(`head>style[elemId="${elemId}"]`)
      if (!elem) {
        elem = document.createElement('style')
        elem.setAttribute('elemId', elemId)
        document.head.appendChild(elem)
      }
      elem.setAttribute('src', `${classId || ''} ${ctx.path}`)
      jb.log('css update', { innerText, elemId })
      elem.textContent = innerText
    }
  },
  valueOfCssVar(varName, parent) {
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
  },
  async loadFELibsDirectly(libs) {
      if (!libs.length) return
      if (typeof document == 'undefined') {
          return jb.logError('can not load front end libs to a frame without a document')
      }
      const libsToLoad = jb.utils.unique(libs)
      libsToLoad.forEach(lib=> jb.ui.FELibLoaderPromises[lib] = jb.ui.FELibLoaderPromises[lib] || loadFELib(lib) )
      jb.log('FELibs toLoad',{libsToLoad})
      return libsToLoad.reduce((pr,lib) => pr.then(()=> jb.ui.FELibLoaderPromises[lib]), Promise.resolve())

      async function loadFELib(lib) {
        if (jbHost.loadFELib) return jbHost.loadFELib(lib)
          if (lib.match(/js$/)) {
            const code = await jb.frame.fetch(`${jb.baseUrl||''}/dist/${lib}`).then(x=>x.text())
            eval(code)
          } else if (lib.match(/css$/)) {
              const code = await jb.frame.fetch(`${jb.baseUrl||''}/dist/${lib}`).then(x=>x.text())
              const style = document.createElement('style')
              style.type = 'text/css'
              style.innerHTML = code
              document.head.appendChild(style)
          } else if (lib.match(/woff2$/)) {
            const [fontName,weight,_lib] = lib.split(':')
            const arrayBuffer = await jb.frame.fetch(`${jb.baseUrl||''}/dist/${_lib}`).then(x=>x.arrayBuffer())
            const CHUNK_SIZE = 0x8000
            const chunks = []
            const uint8Array = new Uint8Array(arrayBuffer)
            for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE)
              chunks.push(String.fromCharCode(...uint8Array.subarray(i, i + CHUNK_SIZE)))
            const base64Font = btoa(chunks.join(''))
    
            const _weight = weight ? `font-weight: ${weight};` : ''
            const fontFace = `
            @font-face {
                font-family: '${fontName}';
                src: url(data:font/woff2;base64,${base64Font}) format('woff2');
                ${_weight}
            }`
    
            const style = document.createElement('style')
            style.textContent = fontFace
            document.head.appendChild(style)
          }
        }
    }
})

extension('ui', 'beautify', {
  beautifyXml(xml) {
    return xml.trim().split(/>\s*</).reduce((acc, node) => {
      const pad = Math.max(0, acc[1] + (node.match(/^\w[^>]*[^\/]/) ? 1 : node.match(/^\/\w/) ? -1 : 0))
      return [acc[0] + new Array(pad).join('  ') + '<' + node + '>\n', pad]
    }, ['', 0])[0].slice(1, -2)
  },
  beautifyDelta(delta) {
    const childs = delta.children || []
    const childrenAtts = childs && ['sameOrder', 'resetAll', 'deleteCmp'].filter(p => childs[p]).map(p => p + '="' + childs[p] + '"').join(' ')
    const childrenArr = childs.length ? Array.from(Array(childs.length).keys()).map(i => childs[i]) : []
    const children = (childrenAtts || childrenArr.length) && `<children ${childrenAtts || ''}>${childrenArr.map(ch => jb.ui.vdomToHtml(ch)).join('')}</children>`
    const toAppend = childs && childs.toAppend && `<toAppend>${childs.toAppend.map(ch => jb.ui.vdomToHtml(ch)).join('')}</toAppend>`
    return jb.ui.beautifyXml(`<delta ${jb.entries(delta.attributes).map(([k, v]) => k + '="' + v + '"').join(' ')}>
            ${[children, toAppend].filter(x => x).join('')}</delta>`)
  },
})

// ****************** components ****************

component('runFEMethodFromBackEnd', {
  type: 'action',
  description: 'invoke FE Method from the backend. used with library objects like codemirror',
  params: [
    {id: 'selector', as: 'string', byName: true, defaultValue: '[cmp-id="%$cmp/cmpId%"]'},
    {id: 'method', as: 'string'},
    {id: 'Data'},
    {id: 'Vars'}
  ],
  impl: (ctx, selector, method, data, vars) => {
    const elem = jb.ui.elemOfSelector(selector,ctx)
    const cmpElem = elem && jb.ui.closestCmpElem(elem)
    const delta = { attributes: { $runFEMethod: JSON.stringify({method, data, vars}) }}
    cmpElem && jb.ui.applyNewVdom(cmpElem,null,{ ctx, delta } )
  }
})

component('ui.applyNewVdom', {
  type: 'action',
  params: [
    {id: 'elem', mandatory: true, byName: true},
    {id: 'vdom', mandatory: true},
    {id: 'strongRefresh', as: 'boolean', description: 'restart FE flows', type: 'boolean'},
  ],
  impl: (ctx, elem, vdom, strongRefresh) => jb.ui.applyNewVdom(elem, vdom, { ctx, strongRefresh })
})

component('ui.applyDeltaToCmp', {
  type: 'action',
  params: [
    {id: 'delta', mandatory: true, byName: true},
    {id: 'cmpId', as: 'string', mandatory: true},
    {id: 'assumedVdom'}
  ],
  impl: (ctx, delta, cmpId, assumedVdom) => jb.ui.applyDeltaToCmp({ ctx, delta, cmpId, assumedVdom })
})

component('sink.applyDeltaToCmp', {
  type: 'rx',
  params: [
    {id: 'delta', dynamic: true, mandatory: true},
    {id: 'cmpId', as: 'string', mandatory: true}
  ],
  impl: sink.action(ui.applyDeltaToCmp('%$delta()%', '%$cmpId%'))
})

component('action.focusOnCmp', {
  description: 'runs both in FE and BE',
  type: 'action',
  params: [
    {id: 'description', as: 'string'},
    {id: 'cmpId', as: 'string', defaultValue: '%$cmp/cmpId%'}
  ],
  impl: (ctx, desc, cmpId) => {
    const frontEndElem = jb.path(ctx.vars.cmp, 'base')
    if (frontEndElem) {
      jb.log('frontend focus on cmp', { frontEndElem, ctx, desc, cmpId })
      return jb.ui.focus(frontEndElem, desc, ctx)
    } else {
      jb.log('backend focus on cmp', { frontEndElem, ctx, desc, cmpId })
      const delta = { attributes: { $focus: desc } }
      jb.ui.applyDeltaToCmp({ delta, ctx, cmpId })
    }
  }
})

component('customStyle', {
  type: 'style',
  typePattern: t => /\.style$/.test(t),
  category: 'advanced:10,all:10',
  params: [
    {id: 'template', as: 'single', mandatory: true, dynamic: true, ignore: true, byName: true},
    {id: 'css', as: 'string', newLinesInCode: true},
    {id: 'features', type: 'feature[]', typeAsParent: t=>t.replace(/style/,'feature'), dynamic: true}
  ],
  impl: (ctx, css, features) => ({
    template: ctx.profile.template,
    css: css,
    featuresOptions: features(),
    styleParams: ctx.cmpCtx.params
  })
})

component('styleByControl', {
  type: 'style',
  typePattern: t => /\.style$/.test(t),
  category: 'advanced:10,all:20',
  params: [
    {id: 'control', type: 'control', mandatory: true, dynamic: true},
    {id: 'modelVar', as: 'string', mandatory: true}
  ],
  impl: (ctx, control, modelVar) => control(ctx.setVar(modelVar, ctx.vars.$model))
})

component('styleWithFeatures', {
  type: 'style',
  typePattern: t => /\.style$/.test(t),
  description: 'customize, add more features to style',
  category: 'advanced:10,all:20',
  params: [
    {id: 'style', type: '$asParent', mandatory: true, composite: true},
    {id: 'features', type: 'feature[]', templateValue: [], typeAsParent: t=>t.replace(/style/,'feature'), dynamic: true, mandatory: true}
  ],
  impl: (ctx, style, features) => {
    if (style.isBEComp)
      return style.jbExtend(features(), ctx)
    return style && { ...style, featuresOptions: (style.featuresOptions || []).concat(features()) }
  }
})

component('controlWithFeatures', {
  type: 'control',
  description: 'customize, add more features to control',
  category: 'advanced:10,all:20',
  params: [
    {id: 'control', type: 'control', mandatory: true},
    {id: 'features', type: 'feature[]', templateValue: [], mandatory: true}
  ],
  impl: (ctx, control, features) => control.jbExtend(features, ctx).orig(ctx)
})

component('renderWidget', {
  type: 'action',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'selector', as: 'string', defaultValue: 'body'}
  ],
  impl: (ctx, control, selector) => {
    const el = document.querySelector(selector)
    if (!el)
      return jb.logError('renderWidget can not find element for selector', { selector })
    jb.ui.unmount(el)
    el.innerHTML = ''
    jb.ui.render(jb.ui.h(control(jb.ui.extendWithServiceRegistry(ctx))), el, { ctx })
  }
})

component('querySelectorAll', {
  type: 'data',
  params: [
    {id: 'selector', as: 'string' },
  ],
  impl: (ctx, selector) => jb.ui.querySelectorAll(jb.ui.widgetBody(ctx),selector)
})

component('querySelector', {
  type: 'data',
  params: [
    {id: 'selector', as: 'string' },
  ],
  impl: (ctx, selector) => jb.ui.querySelectorAll(jb.ui.widgetBody(ctx),selector)[0]
})
