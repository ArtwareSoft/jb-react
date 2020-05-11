(function(){
const ui = jb.ui;

// ****************** jbart ui utils ***************
Object.assign(jb.ui,{
    focus(elem,logTxt,srcCtx) {
        if (!elem) debugger;
        // block the preview from stealing the studio focus
        const now = new Date().getTime();
        const lastStudioActivity = jb.studio.lastStudioActivity || jb.path(jb,['studio','studioWindow','jb','studio','lastStudioActivity']);
        jb.log('focus',['request',srcCtx, logTxt, now - lastStudioActivity, elem,srcCtx]);
          if (jb.studio.previewjb == jb && lastStudioActivity && now - lastStudioActivity < 1000)
            return;
          jb.delay(1).then(_=> {
               jb.log('focus',['apply',srcCtx,logTxt,elem,srcCtx]);
            elem.focus()
          })
    },
    wrapWithLauchingElement: (f,ctx,elem,options={}) => ctx2 => {
        if (!elem) debugger;
        return f(ctx.extendVars(ctx2).setVars({ $launchingElement: { el : elem, ...options }}));
    },
    withUnits: v => (v === '' || v === undefined) ? '' : (''+v||'').match(/[^0-9]$/) ? v : `${v}px`,
    propWithUnits: (prop,v) => (v === '' || v === undefined) ? '' : `${prop}: ` + ((''+v||'').match(/[^0-9]$/) ? v : `${v}px`) + ';',
    fixCssLine: css => css.indexOf('\n') == -1 && ! css.match(/}\s*/) ? `{ ${css} }` : css,
    ctxDictOfElem: elem => {
      const runningWorkerId = jb.frame.workerId && jb.frame.workerId()
      const workerIdAtElem = elem.getAttribute('worker')
      const _jb = workerIdAtElem == 'preview' ? jb.studio.previewjb
        : !runningWorkerId && workerIdAtElem ? jb.ui.workers[elem.getAttribute('worker')]
        : jb
      return _jb.ctxDictionary
    },
    ctxOfElem: (elem,att) => elem && elem.getAttribute && jb.ui.ctxDictOfElem(elem)[elem.getAttribute(att || 'jb-ctx')],
    preserveCtx(ctx) {
        jb.ctxDictionary[ctx.id] = ctx
        return ctx.id
    },
    inStudio() { return jb.studio && jb.studio.studioWindow },
    inPreview() {
        try {
            return !ui.inStudio() && jb.frame.parent && jb.frame.parent.jb.studio.initPreview
        } catch(e) {}
    },
    parentCmps(el) {
        if (!el) return []
        const parents = jb.ui.parents(el)
        const dialogElem = parents[parents.length-5]
        return (jb.ui.hasClass(dialogElem,'jb-dialog')
                ? parents.slice(0,-4).concat(jb.ui.ctxOfElem(dialogElem).exp('%$$launchingElement.el._component.base%') || [])
                : parents)
            .map(el=>el._component).filter(x=>x)
    },
    closestCmp(el) {
        return el._component || this.parentCmps(el)[0]
    },
    document(ctx) {
        if (jb.frame.workerId && jb.frame.workerId(ctx))
            return jb.ui.widgets[ctx.vars.widgetId].top
        return ctx.vars.elemToTest || ctx.frame().document
    },
    item(cmp,vdom,data) {
        cmp.extendItemFuncs && cmp.extendItemFuncs.forEach(f=>f(cmp,vdom,data));
        return vdom;
    },
    fromEvent: (cmp,event,elem,options) => jb.callbag.pipe(
          jb.callbag.fromEvent(event, elem || cmp.base, options),
          jb.callbag.takeUntil(cmp.destroyed)
    ),
    upDownEnterEscObs(cmp) { // and stop propagation !!!
      const {pipe, takeUntil,subject} = jb.callbag
      const keydown_src = subject();
      cmp.base.onkeydown = e => {
        if ([38,40,13,27].indexOf(e.keyCode) != -1) {
          keydown_src.next(e);
          return false;
        }
        return true;
      }
      return pipe(keydown_src, takeUntil(cmp.destroyed))
    }
})

// ****************** html utils ***************
Object.assign(jb.ui, {
    outerWidth(el) {
        const style = getComputedStyle(el);
        return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
    },
    outerHeight(el) {
        const style = getComputedStyle(el);
        return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
    },
    offset(el) { return el.getBoundingClientRect() },
    parents(el,{includeSelf} = {}) {
        const res = []
        el = includeSelf ? el : el && el.parentNode;
        while(el) {
          res.push(el);
          el = el.parentNode;
        }
        return res
    },
    closest(el,query) {
        while(el) {
          if (ui.matches(el,query)) return el;
          el = el.parentNode;
        }
    },
    activeElement() { return document.activeElement },
    find(el,selector,options) {
      if (!el) return []
      if (jb.path(el,'constructor.name') == 'jbCtx')
          el = this.document(el) // el is ctx
      if (!el) return []
      return el instanceof jb.ui.VNode ? el.querySelectorAll(selector,options) :
          [... (options && options.includeSelf && ui.matches(el,selector) ? [el] : []),
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

ui.renderWidget = function(profile,top) {
	let blockedParentWin = false // catch security execption from the browser if parent is not accessible
	try {
		const x = typeof window != 'undefined' && window.parent.jb
	} catch (e) {
		blockedParentWin = true
	}
	try {
		if (!blockedParentWin && typeof window != 'undefined' && window.parent != window && window.parent.jb)
			window.parent.jb.studio.initPreview(window,[Object.getPrototypeOf({}),Object.getPrototypeOf([])]);
	} catch(e) {
		return jb.logException(e)
    }

    let currentProfile = profile
    let lastRenderTime = 0, fixedDebounce = 500

    if (jb.studio.studioWindow) {
        const studioWin = jb.studio.studioWindow
        const st = studioWin.jb.studio;
        const project = studioWin.jb.resources.studio.project
        const page = studioWin.jb.resources.studio.page
        if (project && page)
            currentProfile = {$: page}

        const {pipe,debounceTime,filter,subscribe} = jb.callbag
        pipe(st.pageChange, filter(({page})=>page != currentProfile.$), subscribe(({page})=> doRender(page)))
        
        pipe(st.scriptChange, filter(e=>isCssChange(st,e.path)),
          subscribe(({path}) => {
            let featureIndex = path.lastIndexOf('features')
            if (featureIndex == -1) featureIndex = path.lastIndexOf('layout')
            const ctrlPath = path.slice(0,featureIndex).join('~')
            const elems = Array.from(document.querySelectorAll('[jb-ctx]'))
              .map(elem=>({elem, ctx: jb.ctxDictionary[elem.getAttribute('jb-ctx')] }))
              .filter(e => e.ctx && e.ctx.path == ctrlPath)
            elems.forEach(e=>jb.ui.refreshElem(e.elem,null,{cssOnly: true}))
        }))

        pipe(st.scriptChange, filter(e=>!isCssChange(st,e.path)),
            filter(e=>(jb.path(e,'path.0') || '').indexOf('dataResource.') != 0), // do not update on data change
            debounceTime(() => Math.min(2000,lastRenderTime*3 + fixedDebounce)),
            subscribe(() =>{
                doRender()
                jb.ui.dialogs.reRenderAll()
        }))
    }
    const elem = top.ownerDocument.createElement('div')
    top.appendChild(elem)

    doRender()

  function isCssChange(st,path) {
    const compPath = pathOfCssFeature(st,path)
    return compPath && (st.compNameOfPath(compPath) || '').match(/^(css|layout)/)
  }

  function pathOfCssFeature(st,path) {
    const featureIndex = path.lastIndexOf('features')
    if (featureIndex == -1) {
      const layoutIndex = path.lastIndexOf('layout')
      return layoutIndex != -1 && path.slice(0,layoutIndex+1).join('~')
    }
    const array = Array.isArray(st.valOfPath(path.slice(0,featureIndex+1).join('~')))
    return path.slice(0,featureIndex+(array?2:1)).join('~')
  }

	function doRender(page) {
        if (page) currentProfile = {$: page}
        const profileToRun = ['dataTest','uiTest'].indexOf(jb.path(jb.comps[currentProfile.$],'impl.$')) != -1 ? { $: 'test.showTestInStudio', testId: currentProfile.$} : currentProfile
        const cmp = new jb.jbCtx().run(profileToRun)
        const start = new Date().getTime()
        jb.ui.unmount(top)
        top.innerHTML = ''
        jb.ui.render(ui.h(cmp),top)
        lastRenderTime = new Date().getTime() - start
  }
}

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

jb.component('defaultTheme', {
  impl: ctx => ui.addStyleElem(`
    body {
      /* vscode compatible with light theme */
      --jb-font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "Ubuntu", "Droid Sans", sans-serif;
      --jb-font-size: 13px;
      --jb-font-weight: normal;
      --jb-foreground: #616161;
    
      --jb-menu-background: #ffffff;
      --jb-menu-foreground: #616161;
      --jb-menu-selectionBackground: #0074e8;
      --jb-menu-selectionForeground: #ffffff;
      --jb-menu-separatorBackground: #888888;
      --jb-menubar-selectionBackground: rgba(0, 0, 0, 0.1);
      --jb-menubar-selectionForeground: #333333;
      --jb-titleBar-activeBackground: #dddddd;
      --jb-titleBar-activeForeground: #333333;
      --jb-titleBar-inactiveBackground: rgba(221, 221, 221, 0.6);
      --jb-titleBar-inactiveForeground: rgba(51, 51, 51, 0.6);
      --jb-dropdown-background: #ffffff;
      --jb-dropdown-border: #cecece;
      --jb-errorForeground: #a1260d;
    
      --jb-input-background: #ffffff;
      --jb-input-foreground: #616161;  
      --jb-textLink-activeForeground: #034775;
      --jb-textLink-foreground: #006ab1;
    
      --jb-icon-foreground: #424242;
    
      --jb-list-activeSelectionBackground: #0074e8;
      --jb-list-activeSelectionForeground: #ffffff;
    
    
    /* mdc mappaing */
      --mdc-theme-primary: #616161; /* The theme primary color*/
      --mdc-theme-secondary: var(--jb-titleBar-activeBackground);
      --mdc-theme-background: var(--jb-input-background);
      --mdc-theme-surface: var(--jb-input-background);
      --mdc-theme-error: var(--jb-errorForeground);
    
      --mdc-theme-on-primary: var(--jb-input-foreground); /* Primary text on top of a theme primary color background */
      --mdc-theme-on-secondary: var(--jb-input-foreground);
      --mdc-theme-on-surface: --jb-input-foreground;
      --mdc-theme-on-error: var(--jb-input-background);
    
      --mdc-theme-text-primary-on-background: var(--jb-input-foreground); /* Primary text on top of the theme background color. */
      --mdc-theme-text-secondary-on-background: var(--jb-input-foreground);
      --mdc-theme-text-hint-on-background: var(--jb-input-foreground);
      --mdc-theme-text-disabled-on-background: var(--jb-input-foreground);
      --mdc-theme-text-icon-on-background: var(--jb-input-foreground);
      
      --mdc-theme-text-primary-on-light: var(--jb-input-foreground); /* Primary text on top of a light-colored background */
      --mdc-theme-text-secondary-on-light: var(--jb-input-foreground);
      --mdc-theme-text-hint-on-light: var(--jb-input-foreground);
      --mdc-theme-text-disabled-on-light: var(--jb-input-foreground);
      --mdc-theme-text-icon-on-light: var(--jb-input-foreground);
                                
      --mdc-theme-text-primary-on-dark: var(--jb-menu-selectionForeground);
      --mdc-theme-text-secondary-on-dark: var(--jb-menu-selectionForeground);
      --mdc-theme-text-hint-on-dark: var(--jb-menu-selectionForeground);
      --mdc-theme-text-disabled-on-dark: var(--jb-menu-selectionForeground);
      --mdc-theme-text-icon-on-dark: var(--jb-menu-selectionForeground);
    /* jBart only */
      --jb-dropdown-shadow: #a8a8a8;
      --jb-tree-value: red;
      --jb-expandbox-background: green;
 `)
})

})()
