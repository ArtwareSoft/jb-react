(function(){
const ui = jb.ui;

ui.ctrl = function(context,options) {
	var ctx = context.setVars({ $model: context.params });
	var styleOptions = defaultStyle(ctx) || {};
	if (styleOptions.jbExtend)  {// style by control
		styleOptions.ctxForPick = ctx;
		return styleOptions.jbExtend(options).applyFeatures(ctx).initField();
	}
	return new JbComponent(ctx).jbExtend(options).jbExtend(styleOptions).applyFeatures(ctx).initField();

	function defaultStyle(ctx) {
		var profile = context.profile;
		var defaultVar = '$theme.' + (profile.$ || '');
		if (!profile.style && context.vars[defaultVar])
			return ctx.run({$:context.vars[defaultVar]})
		return context.params.style ? context.params.style(ctx) : {};
	}
}

let cssId = 0;
const cssSelectors_hash = ui.cssSelectors_hash = {};

class JbComponent {
	constructor(ctx) {
		this.ctx = ctx;
		Object.assign(this, {jbInitFuncs: [], jbBeforeInitFuncs: [], jbRegisterEventsFuncs:[], jbAfterViewInitFuncs: [],
			jbComponentDidUpdateFuncs: [], willUpdateFuncs: [],jbDestroyFuncs: [], extendCtxOnceFuncs: [], modifierFuncs: [], 
			extendItemFuncs: [], enrichField: [], dynamicCss: [] });
		this.staticCssLines = [];

		this.jb_profile = ctx.profile;
		//		this.jb$title = (typeof title == 'function') ? title() : title; // for debug
	}
	initField() {
		this.field = {
			class: '',
			ctxId: ui.preserveCtx(this.ctx),
			control: (item,index) => this.getOrCreateItemField(item, () => this.ctx.setData(item).setVars({index: (index||0)+1}).runItself().reactComp())
		}
		this.enrichField.forEach(enrichField=>enrichField(this.field))
		let title = jb.tosingle(jb.val(this.ctx.params.title)) || (() => '');
		if (this.field.title !== undefined)
			title = this.field.title
		// make it always a function 
		this.field.title = typeof title == 'function' ? title : () => ''+title;
		this.itemfieldCache = new Map()
		return this
	}
	getOrCreateItemField(item, factory) {
		if (!this.itemfieldCache.get(item))
			this.itemfieldCache.set(item,factory())
		return this.itemfieldCache.get(item)
	}

	reactComp() {
		jb.log('createReactClass',[this.ctx, this]);
		var jbComp = this;
		const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,this.ctx) }}

		class ReactComp extends ui.Component {
			constructor(props) {
				super();
				this.jbComp = jbComp;
				this.ctx = this.originalCtx = jbComp.ctx; // this.ctx is re-calculated
				this.ctxForPick = jbComp.ctxForPick || jbComp.ctx;
				this.destroyed = new Promise(resolve=>this.resolveDestroyed = resolve);
				jbComp.extendCtxOnceFuncs.forEach(extendCtx =>
					tryWrapper(() => this.ctx = extendCtx(this.ctx,this) || this.ctx), 'extendCtx')
			
				Object.assign(this,(jbComp.styleCtx || {}).params); // assign style params to cmp
				jbComp.jbBeforeInitFuncs.forEach(init=> tryWrapper(() => init(this,props)), 'beforeinit');
				jbComp.jbInitFuncs.forEach(init=> tryWrapper(() => init(this,props)), 'init');
			}
			render(props,state) {
				jb.log('render',[this.ctx, state,props,this]);
				if (!jbComp.template || typeof jbComp.template != 'function')
					return ui.h('span',{display: 'none'});
				//console.log('render',jb.studio.shortTitle(this.ctx.path));
				try {
					let vdom = jbComp.template(this,state,ui.h);
					jbComp.modifierFuncs.forEach(modifier=>
						vdom = (vdom && typeof vdom === 'object') ? tryWrapper(() => modifier(vdom,this,state,ui.h) || vdom) : vdom
					)
					if (typeof vdom === 'object')
						ui.addClassToVdom(vdom, jbComp.jbCssClass(this,this.ctx))
					jb.log('renRes',[this.ctx, vdom, state,props,this]);
					return vdom;
				} catch (e) {
					jb.logException(e,'render',this.ctx,props,state);
					return ui.h('span',{display: 'none'});
				}
			}
    		componentDidMount() {
				jbComp.componentDidMount(this);
				jbComp.jbRegisterEventsFuncs.forEach(init=> tryWrapper(() => init(this), 'init'));
				jbComp.jbAfterViewInitFuncs.forEach(init=> tryWrapper(() => init(this), 'after view init'));
			}
			componentDidUpdate() {
				jbComp.jbComponentDidUpdateFuncs.forEach(f=> tryWrapper(() => f(this), 'componentDidUpdate'));
			}
	  		componentWillUnmount() {
				jbComp.jbDestroyFuncs.forEach(f=> tryWrapper(() => f(this), 'destroy'));
				this.resolveDestroyed();
			}
		};
		injectLifeCycleMethods(ReactComp,this);
		ReactComp.ctx = this.ctx;
		ReactComp.field = this.field;
		ReactComp.title = this.field.title();
		ReactComp.jbComp = jbComp;
		return ReactComp;
	}

	jbCssClass(cmp,ctx) {
		if (this.cachedClass)
			return this.cachedClass
		const cssLines = (this.staticCssLines || []).concat(this.dynamicCss.map(dynCss=>dynCss(cmp.ctx))).filter(x=>x)
		const cssKey = cssLines.join('\n')
		if (!cssKey) return ''
		if (!cssSelectors_hash[cssKey]) {
			cssId++;
			cssSelectors_hash[cssKey] = cssId;
			const cssStyle = cssLines.map(selectorPlusExp=>{
				const selector = selectorPlusExp.split('{')[0];
				const fixed_selector = selector.split(',').map(x=>x.trim()).map(x=>`.jb-${cssId}${x}`);
				return fixed_selector + ' { ' + selectorPlusExp.split('{')[1];
			}).join('\n');
			const remark = `/*style: ${ctx.profile.style && ctx.profile.style.$}, path: ${ctx.path}*/\n`;
			const style_elem = document.createElement('style');
			style_elem.innerHTML = remark + cssStyle;
			document.head.appendChild(style_elem);
		}
		const jbClass = `jb-${cssSelectors_hash[cssKey]}`
		if (!this.dynamicCss.length)
			this.cachedClass = jbClass
		return jbClass
	}
	componentDidMount(cmp) {
		const elem = cmp.base;
		if (!elem || !elem.setAttribute)
			return;
		let ctx = this.ctx;
	  	while (ctx.profile.__innerImplementation)
	  		ctx = ctx.componentContext._parent;
	  	const attachedCtx = this.ctxForPick || ctx;
	  	elem.setAttribute('jb-ctx',attachedCtx.id);
		ui.garbageCollectCtxDictionary();
		jb.ctxDictionary[attachedCtx.id] = attachedCtx;
	}

	applyFeatures(ctx) {
		var features = (ctx.params.features && ctx.params.features(ctx) || []);
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

    	this.template = this.template || options.template;

		if (options.beforeInit) this.jbBeforeInitFuncs.push(options.beforeInit);
		if (options.init) this.jbInitFuncs.push(options.init);
		if (options.afterViewInit) this.jbAfterViewInitFuncs.push(options.afterViewInit);
		if (options.componentWillUpdate) this.willUpdateFuncs.push(options.componentWillUpdate);
		if (options.destroy) this.jbDestroyFuncs.push(options.destroy);
		if (options.componentDidUpdate) this.jbComponentDidUpdateFuncs.push(options.componentDidUpdate);
		if (options.templateModifier) this.modifierFuncs.push(options.templateModifier);
		if (options.enrichField) this.enrichField.push(options.enrichField);
		if (options.dynamicCss) this.dynamicCss.push(options.dynamicCss);
		
		if (typeof options.class == 'string')
			this.modifierFuncs.push(vdom=> ui.addClassToVdom(vdom,options.class));
		// if (typeof options.class == 'function')
		// 	this.modifierFuncs.push(vdom=> ui.addClassToVdom(vdom,options.class()));
		// events
		const events = Object.getOwnPropertyNames(options).filter(op=>op.indexOf('on') == 0);
		events.forEach(op=>
			this.jbRegisterEventsFuncs.push(cmp=>
		       	  cmp[op] = cmp[op] || jb.rx.Observable.fromEvent(cmp.base, op.slice(2))
		       	  	.takeUntil( cmp.destroyed )));

		if (options.ctxForPick) this.ctxForPick=options.ctxForPick;
//		if (options.extendCtx) this.extendCtxFuncs.push(options.extendCtx);
		if (options.extendCtxOnce) this.extendCtxOnceFuncs.push(options.extendCtxOnce);
		if (options.extendItem)
			this.extendItemFuncs.push(options.extendItem);
		this.styleCtx = this.styleCtx || options.styleCtx;
		this.toolbar = this.toolbar || options.toolbar;
		this.noUpdates = this.noUpdates || options.noUpdates;

	   	if (options.css)
    		this.staticCssLines = (this.staticCssLines || [])
    			.concat(options.css.split(/}\s*/m)
    				.map(x=>x.trim())
    				.filter(x=>x)
    				.map(x=>x+'}')
    				.map(x=>x.replace(/^!/,' ')));

		(options.featuresOptions || []).forEach(f =>
			this.jbExtend(f, ctx))
		return this;
	}
}

function injectLifeCycleMethods(Comp,jbComp) {
	if (jbComp.willUpdateFuncs.length)
	  Comp.prototype.componentWillUpdate = function() {
		jbComp.willUpdateFuncs.forEach(f=>
			f(this));
	}
	if (jbComp.noUpdates)
		Comp.prototype.shouldComponentUpdate = _ => false;
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

ui.wrapWithLauchingElement = (f,context,elem,options={}) =>
	ctx2 => {
		if (!elem) debugger;
		return f(context.extendVars(ctx2).setVars({ $launchingElement: { el : elem, ...options }}));
	}


if (typeof $ != 'undefined' && $.fn)
    $.fn.findIncludeSelf = function(selector) {
			return this.find(selector).addBack(selector); }

jb.jstypes.renderable = value => {
  if (value == null) return '';
  if (Array.isArray(value))
  	return ui.h('div',{},value.map(item=>jb.jstypes.renderable(item)));
  value = jb.val(value,true);
  if (typeof(value) == 'undefined') return '';
  if (value.reactComp)
  	return ui.h(value.reactComp())
  else if (value.constructor && value.constructor.name == 'VNode')
  	return value;
  return '' + value;
}

ui.renderable = ctrl =>
	ctrl && ctrl.reactComp && ctrl.reactComp();

// prevent garbadge collection and preserve the ctx as long as it is in the dom
ui.preserveCtx = ctx => {
  jb.ctxDictionary[ctx.id] = ctx;
  return ctx.id;
}

ui.renderWidget = function(profile,top) {
	let formerReactElem, formerParentElem;
	let blockedParentWin = false
	try {
		const x = typeof window != 'undefined' && window.parent.jb
	} catch (e) {
		blockedParentWin = true
	}
	try {
		if (!blockedParentWin && typeof window != 'undefined' && window.parent != window && window.parent.jb)
			window.parent.jb.studio.initPreview(window,[Object.getPrototypeOf({}),Object.getPrototypeOf([])]);
	} catch(e) {
		jb.logException(e)
		return
	}

	doRender()

	function doRender() {
		if (formerReactElem)
			ui.render(ui.h('div',{}),formerParentElem,formerReactElem)

		top.innerHTML = '';
		const innerElem = formerParentElem = document.createElement('div');
		top.appendChild(innerElem);

		class R extends jb.ui.Component {
			constructor(props) {
				super();
				this.state.profile = profile;
				this.destroyed = new Promise(resolve=>this.resolveDestroyed = resolve);
				if (jb.studio.studioWindow) {
					const studioWin = jb.studio.studioWindow
					const st = studioWin.jb.studio;
					const project = studioWin.jb.resources.studio.project
					const page = studioWin.jb.resources.studio.page
					if (project && page)
						this.state.profile = {$: `${project}.${page}`}

					this.lastRenderTime = 0

					st.pageChange.takeUntil(this.destroyed).debounce(() => jb.delay(this.lastRenderTime*3 + 200))
						.filter(({page})=>page != this.state.profile.$)
						.subscribe(({page})=>
							this.setState({profile: {$: page }}));
					st.scriptChange.takeUntil(this.destroyed).debounce(() => jb.delay(this.lastRenderTime*3 + 200)).subscribe(_=>
							this.setState(null));
				}
			}
			render(pros,state) {
				const profToRun = state.profile;
				if (!jb.comps[profToRun.$]) return '';
				this.start = new Date().getTime()
				return ui.h(new jb.jbCtx().run(profToRun).reactComp())
			}
			componentDidUpdate() {
				this.lastRenderTime = new Date().getTime() - this.start
			}
			componentWillUnmount() {
				this.resolveDestroyed();
			}
		}
		jb.delay(10).then(()=>{
			formerReactElem = ui.render(ui.h(R),innerElem);
		})
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
	jb.log('setState',[cmp.ctx,state, ...arguments]);
	if (state == null && cmp.refresh)
		cmp.refresh();
	else
		cmp.setState(state || {});
	ui.stateChangeEm.next({cmp: cmp, opEvent: opEvent, watchedAt: watchedAt });
}

ui.watchRef = function(ctx,cmp,ref,includeChildren,delay,allowSelfRefresh) {
		if (!ref)
			jb.logError('null ref for watch ref',...arguments);
    	ui.refObservable(ref,cmp,{includeChildren, watchScript: ctx})
			.subscribe(e=>{
				let ctxStack=[]; for(let innerCtx=e.srcCtx; innerCtx; innerCtx = innerCtx.componentContext) ctxStack = ctxStack.concat(innerCtx)
				const callerPaths = ctxStack.filter(x=>x).map(ctx=>ctx.callerPath).filter(x=>x).filter(x=>x.indexOf('jb-editor') == -1)
				const callerPathsUniqe = jb.unique(callerPaths)
				if (callerPathsUniqe.length !== callerPaths.length)
					return jb.logError('circular watchRef',callerPaths)

				if (!allowSelfRefresh) {
					const callerPathsToCompare = callerPaths.map(x=> x.replace(/~features~?[0-9]*$/,'').replace(/~style$/,''))
					const ctxStylePath = ctx.path.replace(/~features~?[0-9]*$/,'')
					for(let i=0;i<callerPathsToCompare.length;i++)
						if (callerPathsToCompare[i].indexOf(ctxStylePath) == 0) // ignore - generated from a watchRef feature in the call stack
							return
				}
				if (ctx && ctx.profile && ctx.profile.$trace)
					console.log('ref change watched: ' + (ref && ref.path && ref.path().join('~')),e,cmp,ref,ctx);
				if (delay)
					return jb.delay(delay).then(()=> ui.setState(cmp,null,e,ctx))
				return ui.setState(cmp,null,e,ctx);
	      })
}

ui.databindObservable = (cmp,settings) =>
	cmp.databindRefChanged.flatMap(ref =>
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
ui.offset = el => {
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft
  }
}
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
    vdom.attributes.class = classes.concat([clz]).join(' ');
  if (!add)
    vdom.attributes.class = classes.filter(x=>x==clz).join(' ');
  return vdom;
}

ui.item = function(cmp,vdom,data) {
	cmp.jbComp.extendItemFuncs.forEach(f=>f(cmp,vdom,data));
	return vdom;
}

ui.toVdomOrStr = val => {
	const res1 = Array.isArray(val) ? val.map(v=>jb.val(v)): val;
	let res = jb.val((Array.isArray(res1) && res1.length == 1) ? res1[0] : res1);
	if (typeof res == 'boolean')
		res = '' + res;
	if (res && res.slice)
		res = res.slice(0,1000);
	return res;
}

// ****************** components ****************

jb.component('custom-style', { /* customStyle */
  typePattern: {

  },
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
  typePattern: {
    
  },
  category: 'advanced:10,all:20',
  params: [
    {id: 'control', type: 'control', mandatory: true, dynamic: true},
    {id: 'modelVar', as: 'string', mandatory: true}
  ],
  impl: (ctx,control,modelVar) =>
		control(ctx.setVars( jb.obj(modelVar,ctx.vars.$model)))
})

})()
