import { h, render, Component } from 'preact';
import update from 'immutability-helper';

var ui = jb.ui;

function ctrl(context,options) {
	var ctx = context.setVars({ $model: context.params });
	var styleOptions = defaultStyle(ctx);
	if (styleOptions.reactComp)  {// style by control
		styleOptions.ctxForPick = ctx;
		return styleOptions.reactComp(ctx);
	}
	return new JbComponent(ctx).jbExtend(options).jbExtend(styleOptions).reactComp(ctx);

	function defaultStyle(ctx) {
		var profile = context.profile;
		var defaultVar = '$theme.' + (profile.$ || '');
		if (!profile.style && context.vars[defaultVar])
			return ctx.run({$:context.vars[defaultVar]})
		return context.params.style(ctx);
	}
}

var cssId = 0;
var cssSelectors_hash = {};

class JbComponent {
	constructor(ctx) {
		this.ctx = ctx;
		Object.assign(this, {jbInitFuncs: [], jbBeforeInitFuncs: [], jbAfterViewInitFuncs: [],jbCheckFuncs: [],jbDestroyFuncs: [], extendCtxFuncs: [], modifierFuncs: [] });
		this.cssSelectors = [];

		this.jb_profile = ctx.profile;
		var title = jb.tosingle(jb.val(this.ctx.params.title)) || (() => ''); 
		this.jb_title = (typeof title == 'function') ? title : () => ''+title;
		this.jb$title = (typeof title == 'function') ? title() : title; // for debug
	}

	reactComp(ctx) {
		var jbComp = this;
		class ReactComp extends Component { // must start with Capital?
			constructor(props) {
				super();
				this.ctx = jbComp.ctx;
				try {
					if (jbComp.createjbEmitter)
						this.jbEmitter = this.jbEmitter || new jb.rx.Subject();
		    		this.refreshCtx = _ => {
						jbComp.extendCtxFuncs.forEach(extendCtx => {
			    			this.ctx = extendCtx(this.ctx,this);
			    		})
			    		return this.ctx;
			    	}
			    	this.refreshCtx();
					Object.assign(props,(jbComp.styleCtx || {}).params);
					jbComp.jbBeforeInitFuncs.forEach(init=> init(this));
					jbComp.jbInitFuncs.forEach(init=> init(this));
			    } catch(e) { jb.logException(e,'') }
			}
			render(props,state) {
				var vdom = jbComp.template(props,state,jbComp.ctx);
				jbComp.modifierFuncs.forEach(modifier=> vdom = modifier(vdom,props,state) || vdom);
				return vdom;
			}
    		componentDidMount() {
				jbComp.injectCss(this);
				jbComp.jbAfterViewInitFuncs.forEach(init=> init(this));
				if (this.jbEmitter)
					this.jbEmitter.next('after-init');
			}
		}; 
		this.applyFeatures(ctx);
		this.compileJsx();
		injectLifeCycleMethods(ReactComp,this);
		return ReactComp;
	}

	compileJsx() {
		// todo: compile template if string - cache result
	}

	injectCss(cmp) { // should be called by the instantiator
		var elem = cmp.base;
		var ctx = this.ctx;
	  	while (ctx.profile.__innerImplementation)
	  		ctx = ctx.componentContext._parent;
	  	var attachedCtx = this.ctxForPick || ctx;
	  	elem.setAttribute('jb-ctx',attachedCtx.id);
		garbageCollectCtxDictionary();
		jb.ctxDictionary[attachedCtx.id] = attachedCtx;

		if (this.cssSelectors && this.cssSelectors.length > 0) {
			var cssKey = this.cssSelectors.join('\n');
			if (!cssSelectors_hash[cssKey]) {
				cssId++;
				cssSelectors_hash[cssKey] = cssId;
				var cssStyle = this.cssSelectors.map(x=>`.jb-${cssId}${x}`).join('\n');
				$(`<style type="text/css">${cssStyle}</style>`).appendTo($('head'));
			}
			elem.classList.add(`jb-${cssId}`);
		}
	}

	applyFeatures(context) {
		var features = (context.params.features && context.params.features(context) || []);
		features.forEach(f => this.jbExtend(f,context));
		if (context.params.style && context.params.style.profile && context.params.style.profile.features) {
			jb.toarray(context.params.style.profile.features)
				.forEach((f,i)=>
					this.jbExtend(context.runInner(f,{type:'feature'},context.path+'~features~'+i),context))
		}
		return this;
	}
	jbExtend(options,context) {
    	if (!options) return this;
    	context = context || this.ctx;
    	if (!context)
    		console.log('no context provided for jbExtend');
    	if (typeof options != 'object')
    		debugger;

    	this.template = this.template || options.template;

		if (options.beforeInit) this.jbBeforeInitFuncs.push(options.beforeInit);
		if (options.init) this.jbInitFuncs.push(options.init);
		if (options.afterViewInit) this.jbAfterViewInitFuncs.push(options.afterViewInit);
		if (options.doCheck) this.jbCheckFuncs.push(options.doCheck);
		if (options.destroy) this.jbDestroyFuncs.push(options.destroy);
		if (options.templateModifier) this.modifierFuncs.push(options.templateModifier);

		if (options.jbEmitter) this.createjbEmitter = true;
		if (options.ctxForPick) this.ctxForPick=options.ctxForPick;
		if (options.extendCtx) 
			this.extendCtxFuncs.push(options.extendCtx);
		this.styleCtx = this.styleCtx || options.styleCtx;

	   	if (options.css)
    		this.cssSelectors = (this.cssSelectors || [])
    			.concat(options.css.split(/}\s*/m)
    				.map(x=>x.trim())
    				.filter(x=>x)
    				.map(x=>x+'}')
    				.map(x=>x.replace(/^!/,' '))
    			);

		(options.featuresOptions || []).forEach(f => 
			this.jbExtend(f, context))
		return this;
	}
}

function injectLifeCycleMethods(Comp,jbComp) {
	if (jbComp.jbCheckFuncs.length || jbComp.createjbEmitter)
	  Comp.prototype.componentWillUpdate = function() {
		jbComp.jbCheckFuncs.forEach(f=> 
			f(this));
		this.refreshModel && this.refreshModel();
		this.jbEmitter && this.jbEmitter.next('check');
	}
	if (jbComp.createjbEmitter)
	  Comp.prototype.componentDidUpdate = function() {
		this.jbEmitter.next('after-update');
	}
	if (jbComp.jbDestroyFuncs.length || jbComp.createjbEmitter)
	  Comp.prototype.componentWillUnmount = function() {
		jbComp.jbDestroyFuncs.forEach(f=> 
			f(this));
		this.jbEmitter && this.jbEmitter.next('destroy');
		this.jbEmitter && this.jbEmitter.complete();
	}
}

function garbageCollectCtxDictionary() {
	var now = new Date().getTime();
	ui.ctxDictionaryLastCleanUp = ui.ctxDictionaryLastCleanUp || now;
	var timeSinceLastCleanUp = now - ui.ctxDictionaryLastCleanUp;
	if (timeSinceLastCleanUp < 10000) 
		return;
	ui.ctxDictionaryLastCleanUp = now;

	var used = Array.from(document.querySelectorAll('[jb-ctx]')).map(e=>Number(e.getAttribute('jb-ctx'))).sort((x,y)=>x-y);
	var dict = Object.getOwnPropertyNames(jb.ctxDictionary).map(x=>Number(x)).sort((x,y)=>x-y);
	var lastUsedIndex = 0;
	for(var i=0;i<dict.length;i++) {
		while (used[lastUsedIndex] < dict[i])
			lastUsedIndex++;
		if (used[lastUsedIndex] > dict[i])
			delete jb.ctxDictionary[''+dict[i]];
	}
}

ui.wrapWithLauchingElement = (f,context,elem) => 
	_ =>
		f(context.setVars({ $launchingElement: { $el : $(elem) }}));


// ****************** data binding

ui.pathId = 0;
ui.resourceVersions = {}

ui.writeValue = (to,value,settings) => {
  if (!to) 
  	return jb.logError('writeValue: empty "to"');

  if (to.$jb_parent && to.$jb_parent[to.$jb_property] === jb.val(value)) return;

  if (to.$jb_val) // will handle the change by iteself 
    return to.$jb_val(jb.val(value));

  if (to.$jb_parent) {
  	var res = pathOfObject(to.$jb_parent,ui.resources);
  	if (res) {
  		var op = {}, resource = res[0], path = res.concat([to.$jb_property]);
  		jb.path(op,path,{$set: value});
  		ui.resources = ui.update(ui.resources,op);
  		ui.resourceVersions[resource] = ui.resourceVersions[resource] ? ui.resourceVersions[resource]+1 : 1;
  		ui.resourceChange.next({op: op});
  	} else {
  		jb.logError('writeValue: can not find parent in resources');
    	to.$jb_parent[to.$jb_property] = jb.val(value);
    }
  }
}

ui.updateJbParent = function(wrapper) {
	if (! wrapper.$jb_path) { // first time - look in all resources
		var found = find(wrapper.$jb_parent,ui.resources);
	} else { 
		var resource = wrapper.$jb_path[0];
		if (wrapper.$jb_resourceV == ui.resourceVersions[resource]) return;

		var found = find(wrapper.$jb_parent,ui.resources[resource]);
		if (found)
			found.$jb_path = [resource].concat(found.$jb_path);
	}

	if (found) {
		Object.assign(wrapper,found);
		wrapper.$jb_resourceV = ui.resourceVersions[wrapper.$jb_path[0]];
	}
	
	function find(obj,lookIn) {
		if (typeof lookIn != 'object') 
			return;
		if ((lookIn.$jb_id && lookIn.$jb_id === obj.$jb_id) || lookIn === obj)
			return { $jb_path: [], $jb_parent: lookIn};
		for(var p in lookIn) {
			var res = find(obj,lookIn[p]);
			if (res) {
				res.$jb_path = [p].concat(res.$jb_path);
				return res;
			}
		}
	}
}

var pathCache = [];
function updatePathCache(hit) {
	pathCache.unshift(hit);
	if (pathCache.length>5)
		pathCache.pop();
}
function pathOfObjectWithCache(obj,lookIn) {
	for(var i=0;i<pathCache.length;i++) {
		var res = pathOfObject(obj,jb.path(lookIn,pathCache[i]));
		if (res) {
			updatePathCache(pathCache[i]);
			return pathCache[i].concat(res);
		}
	}
	var res = pathOfObject(obj,lookIn);
	if (res)
		updatePathCache(res);
	return res;
}

function pathOfObject(obj,lookIn) {
	if (typeof lookIn != 'object') 
		return;
	if (lookIn.$jb_id && lookIn.$jb_id === obj.$jb_id) 
		return [];
	if (lookIn === obj) {
		lookIn.$jb_id = ++ui.pathId;
		return [];
	}
	for(var p in lookIn) {
		var res = pathOfObject(obj,lookIn[p]);
		if (res) 
			return [p].concat(res);
	}
}

// ****************** components

jb.component('custom-style', {
	typePattern: /.*-style/,
	params: [
		{ id: 'template', as: 'single', essential: true, dynamic: true, ignore: true },
		{ id: 'css', as: 'string' },
    	{ id: 'features', type: 'feature[]', dynamic: true },
	],
	impl: (context,css,features) => ({
		template: context.profile.template,
		css: css,
		featuresOptions: features(),
		styleCtx: context._parent
	})
})

ui.ctrl = ctrl;
ui.render = render;
ui.h = h;
ui.update = update;
ui.resourceChange = new jb.rx.Subject();
