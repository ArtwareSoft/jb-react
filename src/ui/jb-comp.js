(function(){
const ui = jb.ui;

// react 
ui.VNode = Symbol.for("VNode")
ui.StrongRefresh = Symbol.for("StrongRefresh")
ui.RecalcVars = Symbol.for("RecalcVars")

function h(cmpOrTag,attributes,children) {
    if (cmpOrTag && cmpOrTag[ui.VNode]) return cmpOrTag // Vdom
    if (cmpOrTag && cmpOrTag.noNeedForCmpObject && cmpOrTag.noNeedForCmpObject())
        return cmpOrTag.renderVdom()
    if (Array.isArray(children) && children.length > 1)
        children = children.filter(x=>x).map(item=> typeof item == 'string' ? h('span',{},item) : item)
    if (children === "") children = null
    if (typeof children === 'string') children = [children]
    
    return {...{[typeof cmpOrTag === 'string' ? 'tag' : 'cmp'] : cmpOrTag} ,attributes,children,[ui.VNode]: true}
}

function applyVdomDiff(elem,vdomBefore,vdomAfter,cmp) {
    if (!elem && !vdomBefore && !vdomAfter) return
    jb.log('applyVdomDiff',[...arguments]);
    if (vdomBefore == null || elem == null) debugger
    if (typeof vdomAfter !== 'object') {
        if (vdomAfter === vdomBefore) return
        elem.nodeType == 3 ? elem.nodeValue = vdomAfter : elem.innerText = vdomAfter
        jb.log('htmlChange',['change text',elem,vdomBefore,vdomAfter,cmp]);
        elem.children && Array.from(elem.children).forEach(ch=>unmount(ch))
        return elem
    }
    if ((vdomBefore.tag || vdomBefore.cmp) != (vdomAfter.tag || vdomAfter.cmp)) {
        unmountNotification(elem)
        const replaceWith = render(vdomAfter,elem.parentElement,cmp)
        jb.log('htmlChange',['replaceChild',replaceWith,elem]);
        const res = elem.parentElement.replaceChild(replaceWith,elem)
        unbindCmps(elem)
        return res
    }
    if (vdomBefore.cmp) // same cmp
        return
    
    if (vdomBefore.attributes || vdomAfter.attributes)
        applyAttsDiff(elem, vdomBefore.attributes || {}, vdomAfter.attributes || {})
    if (vdomBefore.children || vdomAfter.children)
        applyChildrenDiff(elem, jb.asArray(vdomBefore.children), jb.asArray(vdomAfter.children),cmp)
    return elem
}

function applyAttsDiff(elem, vdomBefore, vdomAfter) {
    const keys = Object.keys(vdomBefore).filter(k=>k.indexOf('on') != 0)
    keys.forEach(key => isAttUndefined(key,vdomAfter) && elem.removeAttribute(key))
    keys.forEach(key => (vdomAfter[key] != vdomBefore[key]) && setAtt(elem,key,vdomAfter[key]))
}

function applyChildrenDiff(parentElem, vdomBefore, vdomAfter, cmp) {
    if (vdomBefore.length ==1 && vdomAfter.length == 1 && parentElem.childElementCount === 0 && parentElem.firstChild) 
        return applyVdomDiff(parentElem.firstChild, vdomBefore[0], vdomAfter[0], cmp)
    jb.log('applyChildrenDiff',[...arguments])
    if (vdomBefore.length != parentElem.childElementCount) {
        jb.log('applyChildrenDiff',['unexpected dom',...arguments])
        while(parentElem.firstChild) {
            unmount(parentElem.firstChild)
            parentElem.removeChild(parentElem.firstChild)
        }
    }
    let remainingBefore = vdomBefore.filter((e,i)=>parentElem.childNodes[i])
        .map((e,i)=> Object.assign({},e,{i, base: parentElem.childNodes[i]}))
    const unmountCandidates = remainingBefore.slice(0)
    const childrenMap = vdomAfter.map((toLocate,i)=> locateCurrentVdom1(toLocate,i,remainingBefore))
    vdomAfter.forEach((toLocate,i)=> childrenMap[i] = childrenMap[i] || locateCurrentVdom2(toLocate,i,remainingBefore))
    unmountCandidates.filter(toLocate => childrenMap.indexOf(toLocate) == -1 && toLocate.base).forEach(elem =>{
        unmountNotification(elem.base)
        parentElem.removeChild(elem.base)
        unbindCmps(elem.base)
        jb.log('htmlChange',['removeChild',elem.base]);
    })
    let lastElem = vdomAfter.reduce((prevElem,after,index) => {
        const current = childrenMap[index]
        const childElem = current ? applyVdomDiff(current.base,current,after,cmp) : render(after,parentElem,cmp)
        return putInPlace(childElem,prevElem)
    },null)
    lastElem = lastElem && lastElem.nextSibling
    while(lastElem) {
        parentElem.removeChild(lastElem)
        jb.log('htmlChange',['removeChild',lastElem]);
        lastElem = lastElem.nextSibling
    }

    function putInPlace(childElem,prevElem) {
        if (prevElem && prevElem.nextSibling != childElem) {
            parentElem.insertBefore(childElem, prevElem.nextSibling)
            jb.log('htmlChange',['insertBefore',childElem,prevElem && prevElem.nextSibling]);
        }
        return childElem
    }
    function locateCurrentVdom1(toLocate,index,remainingBefore) {
        const found = remainingBefore.findIndex(before=>sameSource(before,toLocate))
        if (found != -1)                
            return remainingBefore.splice(found,1)[0]
    }
    function locateCurrentVdom2(toLocate,index,remainingBefore) {
        const found = remainingBefore.findIndex(before=>before.tag && before.i == index && before.tag === toLocate.tag)
        if (found != -1)                
            return remainingBefore.splice(found,1)[0]
    }
}

function sameSource(vdomBefore,vdomAfter) {
    if (vdomBefore.cmp && vdomBefore.cmp === vdomAfter.cmp) return true
    const atts1 = vdomBefore.attributes || {}, atts2 = vdomAfter.attributes || {}
    if (atts1.cmpId && atts1.cmpId === atts2.cmpId || atts1.ctxId && atts1.ctxId === atts2.ctxId) return true
    if (compareCtxAtt('path',atts1,atts2) && compareCtxAtt('data',atts1,atts2)) return true
    if (compareAtts(['id','path','name'],atts1,atts2)) return true
}

function compareAtts(attsToCompare,atts1,atts2) {
    for(let i=0;i<attsToCompare.length;i++)
        if (atts1[attsToCompare[i]] && atts1[attsToCompare[i]] == atts2[attsToCompare[i]])
            return true
}

function compareCtxAtt(att,atts1,atts2) {
    const val1 = atts1.ctxId && jb.path(jb.ui.ctxDictionary[atts1.ctxId],att)
    const val2 = atts2.ctxId && jb.path(jb.ui.ctxDictionary[atts2.ctxId],att)
    return val1 && val2 && val1 == val2
}

function setAtt(elem,att,val) {
    if (val == null) return
    if (att == 'style' && typeof val === 'object') {
        elem.setAttribute(att,jb.entries(val).map(e=>`${e[0]}:${e[1]}`).join(';'))
        jb.log('htmlChange',['setAtt',...arguments]);
    } else if (att == 'value' && elem.tagName.match(/input|textarea/i) ) {
        const active = document.activeElement === elem
        if (elem.value == val) return
        elem.value = val
        if (active)
            elem.focus()
        jb.log('htmlChange',['setAtt',...arguments]);
    }
    else {
        elem.setAttribute(att,val)
        jb.log('htmlChange',['setAtt',...arguments]);
    }
}
function isAttUndefined(key,vdom) {
    return !vdom.hasOwnProperty(key) || (key == 'checked' && vdom[key] === false)
}

function unmount(elem) {
    unmountNotification(elem)
    unbindCmps(elem)
}
function unmountNotification(elem) {
    jb.log('unmount',[...arguments]);
    elem && elem.querySelectorAll && [elem, ...Array.from(elem.querySelectorAll('[cmpId]'))]
        .forEach(el=> {
            [el._component, ...(el._extraCmps || [])].filter(x=>x).map(cmp=> cmp.componentWillUnmount())
        })
    ui.garbageCollectCtxDictionary()
}
function unbindCmps(elem) {
    elem && elem.querySelectorAll && [elem, ...Array.from(elem.querySelectorAll('[cmpId]'))]
        .forEach(el=> el._extraCmps = el._component = null)
}

function render(vdom,parentElem,cmp) {
    jb.log('render',[...arguments]);
    let elem = null
    if (typeof vdom !== 'object') {
        jb.log('htmlChange',['innerText',...arguments])
        parentElem.nodeType == 3 ? parentElem.nodeValue = vdom : parentElem.innerText = vdom
    } else if (vdom.tag) {
        jb.log('htmlChange',['createElement',...arguments])
        elem = parentElem.ownerDocument.createElement(vdom.tag)
        jb.entries(vdom.attributes).filter(e=>e[0].indexOf('on') != 0 && !isAttUndefined(e[0],vdom.attributes)).forEach(e=>setAtt(elem,e[0],e[1]))
        jb.entries(vdom.attributes).filter(e=>e[0].indexOf('on') == 0).forEach(
                e=>elem.setAttribute(e[0],`jb.ui.handleCmpEvent(${typeof e[1] == 'string' && e[1] ? "'" + e[1] + "'" : '' })`))
        jb.asArray(vdom.children).map(child=> render(child,elem,cmp)).filter(x=>x)
            .forEach(chElem=>elem.appendChild(chElem))
        parentElem.appendChild(elem)
        jb.log('htmlChange',['appendChild',parentElem,elem])
    } else if (vdom.cmp) {
        elem = render(vdom.cmp.renderVdom(),parentElem, vdom.cmp)
        if (!elem) return // string
        vdom.cmp.base = elem
        if (elem._component) {
            elem._extraCmps = elem._extraCmps || []
            elem._extraCmps.push(vdom.cmp)
        } else {
            elem._component = vdom.cmp
        }
        parentElem.appendChild(elem)
        jb.log('htmlChange',['appendChild',parentElem,elem])
        vdom.cmp.componentDidMount()
    } 
    return elem
}

Object.assign(jb.ui, {
    h, render, unmount,
    handleCmpEvent(specificHandler) {
        const el = [event.currentTarget, ...jb.ui.parents(event.currentTarget)].find(el=> el.getAttribute && el.getAttribute('cmpId') != null)
        //const el = document.querySelector(`[cmpId="${cmpId}"]`)
        if (!el) return
        const methodPath = specificHandler ? specificHandler : `on${event.type}Handler`
        const path = ['_component',...methodPath.split('.')]
        const handler = jb.path(el,path)
        const obj = jb.path(el,path.slice(0,-1))
        handler && handler.call(obj,event,event.type)
    },
    ctrl(context,options) {
        const ctx = context.setVars({ $model: context.params });
        const styleOptions = defaultStyle(ctx) || {};
        if (styleOptions.jbExtend)  {// style by control
            return styleOptions.jbExtend(options).applyFeatures(ctx);
        }
        return new JbComponent(ctx).jbExtend(options).jbExtend(styleOptions).applyFeatures(ctx);
    
        function defaultStyle(ctx) {
            const profile = context.profile;
            const defaultVar = '$theme.' + (profile.$ || '');
            if (!profile.style && context.vars[defaultVar])
                return ctx.run({$:context.vars[defaultVar]})
            return context.params.style ? context.params.style(ctx) : {};
        }
    }
})


let cssId = 0, cmpId = 0;
const cssSelectors_hash = ui.cssSelectors_hash = {};
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,this.ctx) }}
const lifeCycle = new Set('beforeInit,init,componentDidMount,componentWillUpdate,componentDidUpdate,destroy,extendCtx,templateModifier,extendItem'.split(','))
const arrayProps = new Set('enrichField,dynamicCss,contexts,watchAndCalcRefProp,staticCssLines'.split(','))
const singular = new Set('template,calcState,toolbar,styleCtx'.split(','))

class JbComponent {
	constructor(ctx) {
        this.ctx = ctx
        this.cmpId = cmpId++
        this.registerEventsFuncs = []
        this.staticCssLines = []
        this.contexts = []
    }
    initIfNeeded() {
        if (this.initialized) return
        jb.log('initCmp',[this]);
        this.initialized = 'inProcess'

        this.ctxForPick = this.originatingCtx = this.contexts[0];
        this.destroyed = new Promise(resolve=>this.resolveDestroyed = resolve);
        this.extendCtxFuncs && this.extendCtxFuncs.forEach(extendCtx =>
            tryWrapper(() => this.ctx = extendCtx(this.ctx,this) || this.ctx), 'extendCtx')
        this.state = {}
    
        Object.assign(this,(this.styleCtx || {}).params); // assign style params to cmp to be used in render
        this.beforeInitFuncs && this.beforeInitFuncs.forEach(init=> tryWrapper(() => init(this)), 'beforeinit');
        this.initFuncs && this.initFuncs.forEach(init=> tryWrapper(() => init(this)), 'init');
        this.toObserve = this.watchRef ? this.watchRef.map(obs=>({...obs,ref: obs.refF(this.ctx)})).filter(obs=>jb.isWatchable(obs.ref)) : []
        this.watchAndCalcRefProp && this.watchAndCalcRefProp.forEach(e=>{
            const ref = this.ctx.vars.$model[e.prop](this.ctx)
            if (jb.isWatchable(ref))
                this.toObserve.push({id: e.prop, cmp: this, ref,...e})
            this.state[e.prop] = (e.toState || (x=>x))(jb.val(ref))
        })
        this.calcState && Object.assign(this.state,this.calcState(this))
        this.initialized = 'done'
        return this
    }
    noNeedForCmpObject() {
        this.initIfNeeded()
        return !this.refresh && !this.toObserve.length && !this.registerEventsFuncs.length 
            && !this.componentDidMountFuncs && !this.destroyFuncs
    }
    componentDidMount() {
        this.registerEventsFuncs.forEach(init=> tryWrapper(() => init(this), 'registerEvents'));
        this.componentDidMountFuncs && this.componentDidMountFuncs.forEach(init=> tryWrapper(() => init(this), 'componentDidMount'));
    }
    setState(state) {
        if (this.initialized != 'done')
            return jb.logError('setState',['setState called before initialization finished',this,state])
        if (typeof state === 'object' && state[ui.StrongRefresh])
            return this.strongRefresh()
        if (typeof state === 'object' && state[ui.RecalcVars]) {
            this.extendCtxFuncs && this.extendCtxFuncs.forEach(extendCtx => tryWrapper(() => this.ctx = extendCtx(this.ctx,this) || this.ctx), 'extendCtx')
            this.calcState && Object.assign(state,this.calcState(this))
        }
        this.watchAndCalcRefProp && this.watchAndCalcRefProp.filter(e=> !state[e.prop]).forEach(e=>{
            const ref = this.ctx.vars.$model[e.prop](this.ctx)
            this.state[e.prop] = (e.toState || (x=>x))(jb.val(ref))
        })
            
        this.state = Object.assign(this.state || {}, state)
        const vdomBefore = this.vdomBefore
        const vdomAfter = this.renderVdom()
        applyVdomDiff(this.base, vdomBefore,vdomAfter,this)
        this.componentDidUpdateFuncs && this.componentDidUpdateFuncs.forEach(f=> tryWrapper(() => f(this), 'componentDidUpdate'));
    }
    strongRefresh() {
        const newCmp = this.originatingCtx.runItself()
        applyVdomDiff(this.base, h(this),h(newCmp),newCmp)
    }
	field() {
        if (this._field) return this._field
        const ctx = this.contexts[0] // originating ctx
		this._field = {
			class: '',
			ctxId: ui.preserveCtx(ctx),
			control: (item,index,noCache) => this.getOrCreateItemField(item, () => ctx.setData(item).setVars({index: (index||0)+1}).runItself().reactComp(),noCache),
		}
		this.enrichField && this.enrichField.forEach(enrichField=>enrichField(this._field))
		let title = jb.tosingle(jb.val(ctx.params.title)) || (() => '');
		if (this._field.title !== undefined)
			title = this._field.title
		// make it always a function 
		this._field.title = typeof title == 'function' ? title : () => ''+title;
		this.itemfieldCache = new Map()
		return this._field
	}
	getOrCreateItemField(item,factory,noCache) {
		if (noCache)
			return factory()
		if (!this.itemfieldCache.get(item))
			this.itemfieldCache.set(item,factory())
		return this.itemfieldCache.get(item)
	}
    renderVdom() {
        this.initIfNeeded()
        const vdom = this.doRender() || ui.h('span',{display: 'none'})
        if (typeof vdom == 'object')
            vdom.attributes = Object.assign(vdom.attributes || {},{cmpId: this.cmpId, 'jb-ctx': ui.preserveCtx(this.originatingCtx) })
        return this.vdomBefore = vdom
    }
    doRender() {
        jb.log('renderVdom',[this]);
        if (!this.template || typeof this.template != 'function')
            return
        //console.log('render',jb.studio.shortTitle(this.ctx.path));
        try {
            let vdom = this.template(this,this.state,ui.h);
            this.templateModifierFuncs && this.templateModifierFuncs.forEach(modifier=>
                vdom = (vdom && typeof vdom === 'object') ? tryWrapper(() => modifier(vdom,this,this.state,ui.h) || vdom) : vdom
            )
            if (typeof vdom === 'object')
                ui.addClassToVdom(vdom, this.jbCssClass())
            jb.log('renRes',[this.ctx, vdom, this.state,this]);
            return vdom;
        } catch (e) {
            jb.logException(e,'render',this.ctx,this.state);
        }
    }
    componentWillUnmount() {
        this._destroyed = true
        jb.log('destroyCmp',[this]);
        this.destroyFuncs && this.destroyFuncs.forEach(f=> tryWrapper(() => f(this), 'destroy'));
        this.resolveDestroyed();
    }
    reactComp() { 
        return this
    }
	jbCssClass() {
		if (this.cachedClass)
            return this.cachedClass
        const ctx = this.ctx
		const cssLines = (this.staticCssLines || []).concat((this.dynamicCss || []).map(dynCss=>dynCss(ctx))).filter(x=>x)
		const cssKey = cssLines.join('\n')
		if (!cssKey) return ''
		if (!cssSelectors_hash[cssKey]) {
			cssId++;
			cssSelectors_hash[cssKey] = cssId;
			const cssStyle = cssLines.map(selectorPlusExp=>{
				const selector = selectorPlusExp.split('{')[0];
				const fixed_selector = selector.split(',').map(x=>x.trim().replace('|>',' ')).map(x=>`.jb-${cssId}${x}`);
				return fixed_selector + ' { ' + selectorPlusExp.split('{')[1];
			}).join('\n');
			const remark = `/*style: ${ctx.profile.style && ctx.profile.style.$}, path: ${ctx.path}*/\n`;
			const style_elem = document.createElement('style');
			style_elem.innerHTML = remark + cssStyle;
			document.head.appendChild(style_elem);
		}
		const jbClass = `jb-${cssSelectors_hash[cssKey]}`
		if (!this.dynamicCss)
			this.cachedClass = jbClass
		return jbClass
	}

	applyFeatures(ctx) {
        this.contexts.unshift(ctx)
		const features = (ctx.params.features && ctx.params.features(ctx) || []);
		features.forEach(f => this.jbExtend(f,ctx));
		if (ctx.params.style && ctx.params.style.profile && ctx.params.style.profile.features) {
			jb.asArray(ctx.params.style.profile.features)
				.forEach((f,i)=>
					this.jbExtend(ctx.runInner(f,{type:'feature'},ctx.path+'~features~'+i),ctx))
		}
		return this;
	}

    jbExtend(options,ctx) {
        if (!options) return this;
    	ctx = ctx || this.ctx;
    	if (!ctx)
    		console.log('no ctx provided for jbExtend');
    	if (typeof options != 'object')
            debugger;

        if (options.afterViewInit) options.componentDidMount = options.afterViewInit
		if (typeof options.class == 'string') options.templateModifier = vdom => ui.addClassToVdom(vdom,options.class)

        Object.keys(options).forEach(key=>{
            if (lifeCycle.has(key)) {
                this[key+'Funcs'] = this[key+'Funcs'] || []
                this[key+'Funcs'].push(options[key])
            }
            if (arrayProps.has(key)) {
                this[key] = this[key] || []
                this[key].push(options[key])
            }
            if (singular.has(key))
                this[key] = this[key] || options[key]
        })
        if (options.watchRef) {
            this.watchRef = this.watchRef || []
            this.watchRef.push(Object.assign({cmp: this},options.watchRef));
        }

		// events
		const events = Object.keys(options).filter(op=>op.indexOf('on') == 0);
		events.forEach(op=>
			this.registerEventsFuncs.push(cmp=>
                     cmp[op] = cmp[op] || jb.rx.Observable.fromEvent(cmp.base, op.slice(2))
		       	  	.takeUntil( cmp.destroyed )));

	   	if (options.css)
    		this.staticCssLines = (this.staticCssLines || [])
    			.concat(options.css.split(/}\s*/m)
    				.map(x=>x.trim())
    				.filter(x=>x)
    				.map(x=>x+'}')
    				.map(x=>x.replace(/^!/,' ')));

		(options.featuresOptions || []).forEach(f => this.jbExtend(f, ctx))
		return this;
    }
}

ui.garbageCollectCtxDictionary = function(force) {
	const now = new Date().getTime();
	ui.ctxDictionaryLastCleanUp = ui.ctxDictionaryLastCleanUp || now;
	const timeSinceLastCleanUp = now - ui.ctxDictionaryLastCleanUp;
	if (!force && timeSinceLastCleanUp < 10000)
		return;
	ui.ctxDictionaryLastCleanUp = now;
	jb.resourcesToDelete = jb.resourcesToDelete || []
	jb.log('garbageCollect',jb.resourcesToDelete)
	jb.resourcesToDelete.forEach(id => delete jb.resources[id])
	jb.resourcesToDelete = []

	const used = Array.from(document.querySelectorAll('[jb-ctx]')).map(e=>Number(e.getAttribute('jb-ctx'))).sort((x,y)=>x-y);
	const dict = Object.getOwnPropertyNames(jb.ctxDictionary).map(x=>Number(x)).sort((x,y)=>x-y);
	let lastUsedIndex = 0;
	for(let i=0;i<dict.length;i++) {
		while (used[lastUsedIndex] < dict[i])
			lastUsedIndex++;
		if (used[lastUsedIndex] != dict[i])
			delete jb.ctxDictionary[''+dict[i]];
	}
	const ctxToPath = ctx => jb.entries(ctx.vars).map(e=>e[1]).filter(v=>jb.isWatchable(v)).map(v => jb.asRef(v)).map(ref=>jb.refHandler(ref).pathOfRef(ref)).flat()
	const globalVarsUsed = jb.unique(used.map(x=>jb.ctxDictionary[''+x]).filter(x=>x).map(ctx=>ctxToPath(ctx)).flat())
	let iteratingOnVar = ''
	Object.keys(jb.resources).filter(id=>id.indexOf(':') != -1)
		.sort().reverse() // get the latest usages (largest ctxId) as first item in each group
		.forEach(id=>{
			if (iteratingOnVar != id.split(':')[0]) {
				iteratingOnVar = id.split(':')[0]
				return // do not delete the latest usage of a variable. It may not be bound yet
			}
			if (globalVarsUsed.indexOf(id) == -1)
				jb.resourcesToDelete.push(id)
	})
}

// ****************** generic utils ***************

ui.focus = function(elem,logTxt,srcCtx) {
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
}

ui.wrapWithLauchingElement = (f,context,elem,options={}) => ctx2 => {
		if (!elem) debugger;
		return f(context.extendVars(ctx2).setVars({ $launchingElement: { el : elem, ...options }}));
	}


if (typeof $ != 'undefined' && $.fn)
    $.fn.findIncludeSelf = function(selector) {
			return this.find(selector).addBack(selector); }

jb.jstypes.renderable = value => {
  if (value == null) return '';
  if (value[ui.VNode]) return value;
  if (value instanceof JbComponent) return h(value)
  if (Array.isArray(value))
  	return ui.h('div',{},value.map(item=>jb.jstypes.renderable(item)));
  return '' + jb.val(value,true);
}

ui.renderable = ctrl => ctrl //ctrl && ctrl.reactComp && ctrl.reactComp();

// prevent garbadge collection and preserve the ctx as long as it is in the dom
ui.preserveCtx = ctx => {
  jb.ctxDictionary[ctx.id] = ctx;
  return ctx.id;
}

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
    let vdomBefore = {}
    const debounceTime = () => Math.min(2000,lastRenderTime*3 + fixedDebounce)

    if (jb.studio.studioWindow) {
        const studioWin = jb.studio.studioWindow
        const st = studioWin.jb.studio;
        const project = studioWin.jb.resources.studio.project
        const page = studioWin.jb.resources.studio.page
        if (project && page)
            currentProfile = {$: `${project}.${page}`}

        st.pageChange.filter(({page})=>page != currentProfile.$).subscribe(({page})=> doRender(page))
        st.scriptChange
            .filter(e=>(jb.path(e,'path.0') || '').indexOf('data-resource.') != 0) // do not update on data change
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
        applyVdomDiff(top.firstChild, {},h(cmp),cmp)
        lastRenderTime = new Date().getTime() - start
    }
}

ui.cachedMap = mapFunc => {
	const cache = new Map();
	return item => {
		if (cache.has(item))
			return cache.get(item)
		const val = mapFunc(item);
		cache.set(item, val);
		return val;
	}
}

ui.limitStringLength = function(str,maxLength) {
  if (typeof str == 'string' && str.length > maxLength-3)
    return str.substring(0,maxLength) + '...';
  return str;
}

ui.stateChangeEm = new jb.rx.Subject();

ui.setState = function(cmp,state,opEvent,watchedAt) {
    jb.log('setState',[...arguments]);
    if ((state === false || state == null) && cmp.refresh) {
		cmp.refresh();
    } else {
        cmp.setState(state || cmp.calcState && cmp.calcState(cmp) || {});
    }
	ui.stateChangeEm.next({cmp,opEvent,watchedAt});
}

ui.subscribeToRefChange = watchHandler => watchHandler.resourceChange.subscribe(e=> {
    const changed_path = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(e.ref))
    if (!changed_path) debugger
    const observablesCmps = Array.from((e.srcCtx.vars.elemToTest || document).querySelectorAll('[cmpId]')).map(el=>el._component)
        .filter(cmp=>cmp && cmp.toObserve.length)// .sort((e1,e2) => ui.comparePaths(e1.ctx.path, e2.ctx.path))

    observablesCmps.forEach(cmp => {
        if (cmp._destroyed) return // can not use filter as cmp may be destroyed during the process
        const newState = {}
        let refresh = false
        cmp.toObserve.forEach(obs=>{
            if (checkCircularity(obs)) return
            let obsPath = jb.refHandler(obs.ref).pathOfRef(obs.ref)
            obsPath = obsPath && watchHandler.removeLinksFromPath(obsPath)
            if (!obsPath)
            return jb.logError('observer ref path is empty',obs,e)
            const diff = ui.comparePaths(changed_path, obsPath)
            const isChildOfChange = diff == 1
            const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
            const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
            if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure) {
                jb.log('notifyCmpObservable',['notify change',e.srcCtx,obs,e])
                refresh = true
                Object.assign(newState, obs.strongRefresh && {[ui.StrongRefresh]: true}, obs.recalcVars && {[ui.RecalcVars]: true})
            }
        })
        if (refresh)
            ui.setState(cmp,Object.getOwnPropertySymbols(newState).length ? newState : null,e,e.srcCtx)
    })
})
ui.subscribeToRefChange(jb.mainWatchableHandler)

function checkCircularity(obs) {
    let ctxStack=[]; for(let innerCtx=obs.srcCtx; innerCtx; innerCtx = innerCtx.componentContext) ctxStack = ctxStack.concat(innerCtx)
    const callerPaths = ctxStack.filter(x=>x).map(ctx=>ctx.callerPath).filter(x=>x)
        .filter(x=>x.indexOf('jb-editor') == -1)
        .filter(x=>!x.match(/^studio-helper/))
    const callerPathsUniqe = jb.unique(callerPaths)
    if (callerPathsUniqe.length !== callerPaths.length) {
        jb.logError('circular watchRef',callerPaths)
        return true
    }

    if (!obs.allowSelfRefresh && obs.srcCtx) {
        const callerPathsToCompare = callerPaths.map(x=> x.replace(/~features~?[0-9]*$/,'').replace(/~style$/,''))
        const ctxStylePath = obs.srcCtx.path.replace(/~features~?[0-9]*$/,'')
        for(let i=0;i<callerPathsToCompare.length;i++)
            if (callerPathsToCompare[i].indexOf(ctxStylePath) == 0) // ignore - generated from a watchRef feature in the call stack
                return true
    }
}

ui.databindObservable = (cmp,settings) =>
	cmp.databindRefChanged.merge(jb.rx.Observable.of(cmp.state.databindRef)).flatMap(ref =>
			(!cmp.watchRefOn && jb.isWatchable(ref) && jb.ui.refObservable(ref,cmp,settings)
				.map(e=>Object.assign({ref},e)) ) || [])


ui.refreshComp = (ctx,el) => {
	const nextElem = el.nextElementSibling;
	const newElem = ui.render(ui.h(ctx.runItself().reactComp()),el.parentElement,el);
	if (nextElem)
		newElem.parentElement.insertBefore(newElem,nextElem);
}

ui.outerWidth  = el => {
  const style = getComputedStyle(el);
  return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
}
ui.outerHeight = el => {
  const style = getComputedStyle(el);
  return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
}
ui.offset = el => el.getBoundingClientRect()

ui.parents = el => {
  const res = [];
  el = el.parentNode;
  while(el) {
    res.push(el);
    el = el.parentNode;
  }
  return res;
}
ui.closest = (el,query) => {
  while(el) {
    if (ui.matches(el,query)) return el;
    el = el.parentNode;
  }
}
ui.find = (el,query) => typeof el == 'string' ? Array.from(document.querySelectorAll(el)) : Array.from(el.querySelectorAll(query))
ui.findIncludeSelf = (el,query) => (ui.matches(el,query) ? [el] : []).concat(Array.from(el.querySelectorAll(query)))
ui.addClass = (el,clz) => el.classList.add(clz);
ui.removeClass = (el,clz) => el.classList.remove(clz);
ui.hasClass = (el,clz) => el.classList.contains(clz);
ui.matches = (el,query) => el && el.matches && el.matches(query)
ui.index = el => Array.from(el.parentNode.children).indexOf(el)
ui.inDocument = el => el && (ui.parents(el).slice(-1)[0]||{}).nodeType == 9
ui.addHTML = (el,html) => {
  const elem = document.createElement('div');
  elem.innerHTML = html;
  el.appendChild(elem.firstChild)
}

ui.withUnits = v => (v === '' || v === undefined) ? '' : (''+v||'').match(/[^0-9]$/) ? v : `${v}px`
ui.fixCssLine = css => css.indexOf('/n') == -1 && ! css.match(/}\s*/) ? `{ ${css} }` : css

// ****************** vdom utils ***************

ui.addClassToVdom = function(vdom,clz) {
	vdom.attributes = vdom.attributes || {};
	if (vdom.attributes.class === undefined) vdom.attributes.class = ''
	if (clz && vdom.attributes.class.split(' ').indexOf(clz) == -1)
		vdom.attributes.class = [vdom.attributes.class,clz].filter(x=>x).join(' ');
	return vdom;
}

ui.toggleClassInVdom = function(vdom,clz,add) {
  vdom.attributes = vdom.attributes || {};
  const classes = (vdom.attributes.class || '').split(' ').map(x=>x.trim()).filter(x=>x);
  if (add && classes.indexOf(clz) == -1)
    vdom.attributes.class = [...classes,clz].join(' ');
  if (!add)
    vdom.attributes.class = classes.filter(x=>x != clz).join(' ');
  return vdom;
}

ui.item = function(cmp,vdom,data) {
	cmp.extendItemFuncs && cmp.extendItemFuncs.forEach(f=>f(cmp,vdom,data));
	return vdom;
}

ui.toVdomOrStr = val => {
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
    impl: (ctx,control,modelVar) =>
          control(ctx.setVars( jb.obj(modelVar,ctx.vars.$model)))
  })
  
  jb.component('style-with-features', { 
      typePattern: /\.style$/,
      category: 'advanced:10,all:20',
      params: [
        {id: 'style', type: '$asParent', mandatory: true, composite: true },
        {id: 'features', type: 'feature[]', templateValue: [], dynamic: true, mandatory: true}
      ],
      impl: (ctx,style,features) => 
          style && Object.assign({},style,{featuresOptions: (style.featuresOptions || []).concat(features())})
  })  
  
})()
