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
    fixCssLine: css => css.indexOf('/n') == -1 && ! css.match(/}\s*/) ? `{ ${css} }` : css,
    ctxOfElem: elem => elem && elem.getAttribute && elem.getAttribute('jb-ctx') && jb.ctxDictionary[elem.getAttribute('jb-ctx')],
    resultCtxOfElem: elem => elem && elem.getAttribute && elem.getAttribute('outCtx') && jb.ctxDictionary[elem.getAttribute('jb-ctx')],
    preserveCtx(ctx) {
        jb.ctxDictionary[ctx.id] = ctx
        return ctx.id
    },
    inStudio() { return jb.studio && jb.studio.studioWindow },
    inPreview() { 
        try {   
            return !ui.inStudio() && jb.frame.parent.jb.studio.initPreview
        } catch(e) {}
    },
    parentCmps(cmp) {
        if (!cmp) return []
        const parents = jb.ui.parents(cmp.base)
        const dialogElem = parents[parents.length-5]
        return (jb.ui.hasClass(dialogElem,'jb-dialog') 
                ? parents.slice(0,-4).concat(jb.ui.ctxOfElem(dialogElem).exp('%$$launchingElement.el._component.base%') || []) 
                : parents)
            .map(el=>el._component).filter(x=>x)
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
    parents(el) {
        const res = [];
        el = el.parentNode;
        while(el) {
          res.push(el);
          el = el.parentNode;
        }
        return res;
    },
    closest(el,query) {
        while(el) {
          if (ui.matches(el,query)) return el;
          el = el.parentNode;
        }
    },
    find(el,query) { return typeof el == 'string' ? Array.from(document.querySelectorAll(el)) : Array.from(el.querySelectorAll(query)) },
    findIncludeSelf: (el,query) => (ui.matches(el,query) ? [el] : []).concat(Array.from(el.querySelectorAll(query))),
    addClass: (el,clz) => el.classList.add(clz),
    removeClass: (el,clz) => el.classList.remove(clz),
    hasClass: (el,clz) => el && el.classList.contains(clz),
    matches: (el,query) => el && el.matches && el.matches(query),
    index: el => Array.from(el.parentNode.children).indexOf(el),
    inDocument: el => el && (ui.parents(el).slice(-1)[0]||{}).nodeType == 9,
    addHTML: (el,html) => {
        const elem = document.createElement('div');
        elem.innerHTML = html;
        el.appendChild(elem.firstChild)
    },
    limitStringLength(str,maxLength) {
        if (typeof str == 'string' && str.length > maxLength-3)
          return str.substring(0,maxLength) + '...';
        return str;
    }
})

// ****************** vdom utils ***************
Object.assign(jb.ui, {
    addClassToVdom(vdom,clz) {
        vdom.attributes = vdom.attributes || {};
        if (vdom.attributes.class === undefined) vdom.attributes.class = ''
        if (clz && vdom.attributes.class.split(' ').indexOf(clz) == -1)
            vdom.attributes.class = [vdom.attributes.class,clz].filter(x=>x).join(' ');
        return vdom;
    },
    
    toggleClassInVdom(vdom,clz,add) {
      vdom.attributes = vdom.attributes || {};
      const classes = (vdom.attributes.class || '').split(' ').map(x=>x.trim()).filter(x=>x);
      if (add && classes.indexOf(clz) == -1)
        vdom.attributes.class = [...classes,clz].join(' ');
      if (!add)
        vdom.attributes.class = classes.filter(x=>x != clz).join(' ');
      return vdom;
    },
    
    item(cmp,vdom,data) {
        cmp.extendItemFuncs && cmp.extendItemFuncs.forEach(f=>f(cmp,vdom,data));
        return vdom;
    },
    
    toVdomOrStr(val) {
        if (val &&  (typeof val.then == 'function' || typeof val.subscribe == 'function'))
            return jb.synchArray(val).then(v => ui.toVdomOrStr(v[0]))
    
        const res1 = Array.isArray(val) ? val.map(v=>jb.val(v)): val
        let res = jb.val((Array.isArray(res1) && res1.length == 1) ? res1[0] : res1)
        if (res && res[ui.VNode] || Array.isArray(res)) return res
        if (typeof res === 'boolean' || typeof res === 'object')
            res = '' + res
        else if (typeof res === 'string')
            res = res.slice(0,1000)
        return res
    },
    
    hasClassInVdom: (vdom,clz) => (jb.path(vdom,'attributes.class') || '').split(' ').indexOf(clz) != -1,
    findInVdom: (vdom,clz) => ui.hasClassInVdom(vdom,clz) ? vdom : (vdom.children||[]).find(vd=>ui.findInVdom(vd,clz)),
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
    const debounceTime = () => Math.min(2000,lastRenderTime*3 + fixedDebounce)

    if (jb.studio.studioWindow) {
        const studioWin = jb.studio.studioWindow
        const st = studioWin.jb.studio;
        const project = studioWin.jb.resources.studio.project
        const page = studioWin.jb.resources.studio.page
        if (project && page)
            currentProfile = {$: `${project}.${page}`}

        st.pageChange.filter(({page})=>page != currentProfile.$).subscribe(({page})=> doRender(page))
        st.scriptChange.filter(e=>(jb.path(e,'path.0') || '').indexOf('data-resource.') != 0) // do not update on data change
            .debounce(() => jb.delay(debounceTime()))
            .subscribe(() =>{
                doRender()
                jb.ui.dialogs.reRenderAll()
            });
    }
    const elem = top.ownerDocument.createElement('div')
    top.appendChild(elem)

    doRender()

	function doRender(page) {
        if (page) currentProfile = {$: page}
        const cmp = new jb.jbCtx().run(currentProfile)
        const start = new Date().getTime()
        ui.applyVdomDiff(top.firstElementChild ,ui.h(cmp))
        lastRenderTime = new Date().getTime() - start
    }
}

jb.objectDiff = function(newObj, orig) {
    if (orig === newObj) return {}
    if (!jb.isObject(orig) || !jb.isObject(newObj)) return newObj
    const deletedValues = Object.keys(orig).reduce((acc, key) =>
        newObj.hasOwnProperty(key) ? acc : { ...acc, [key]: undefined }
    , {})

    return Object.keys(newObj).reduce((acc, key) => {
      if (!orig.hasOwnProperty(key)) return { ...acc, [key]: newObj[key] } // return added r key
      const difference = jb.objectDiff(newObj[key], orig[key])
      if (jb.isObject(difference) && jb.isEmpty(difference)) return acc // return no diff
      return { ...acc, [key]: difference } // return updated key
    }, deletedValues)
}

// ****************** components ****************

jb.component('custom-style', { /* customStyle */
    typePattern: /\.style$/,
    category: 'advanced:10,all:10',
    params: [
      {id: 'template', as: 'single', mandatory: true, dynamic: true, ignore: true},
      {id: 'css', as: 'string'},
      {id: 'features', type: 'feature[]', dynamic: true}
    ],
    impl: (context,css,features) => ({
          template: context.profile.template,
          css: css,
          featuresOptions: features(),
          styleCtx: context._parent
    })
})
  
jb.component('style-by-control', { /* styleByControl */
    typePattern: /\.style$/,
    category: 'advanced:10,all:20',
    params: [
      {id: 'control', type: 'control', mandatory: true, dynamic: true},
      {id: 'modelVar', as: 'string', mandatory: true}
    ],
    impl: (ctx,control,modelVar) => control(ctx.setVar(modelVar,ctx.vars.$model))
})
  
jb.component('style-with-features', { /* styleWithFeatures */
      typePattern: /\.style$/,
      description: 'customize, add more features to style',
      category: 'advanced:10,all:20',
      params: [
        {id: 'style', type: '$asParent', mandatory: true, composite: true },
        {id: 'features', type: 'feature[]', templateValue: [], dynamic: true, mandatory: true}
      ],
      impl: (ctx,style,features) => style && {...style,featuresOptions: (style.featuresOptions || []).concat(features())}
})  

jb.component('control-with-features', { /* controlWithFeatures */
    type: 'control',
    description: 'customize, add more features to control',
    category: 'advanced:10,all:20',
    params: [
        {id: 'control', type: 'control', mandatory: true},
        {id: 'features', type: 'feature[]', templateValue: [], mandatory: true}
    ],
    impl: (ctx,control,features) => control.jbExtend(features,ctx)
})  

})()
