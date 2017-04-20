import { h, render, Component } from 'preact';

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

jb.ui.ctrl = ctrl;
jb.ui.render = render;
jb.ui.h = h;
//jb.ui.Component = Component;

class JbComponent {
	constructor(ctx) {
		this.ctx = ctx;
		Object.assign(this, {jbInitFuncs: [], jbBeforeInitFuncs: [], jbAfterViewInitFuncs: [],jbCheckFuncs: [],jbDestroyFuncs: [], extendCtxFuncs: [] });
		this.cssFixes = [];

		this.jb_profile = ctx.profile;
		var title = jb.tosingle(jb.val(this.ctx.params.title)) || (() => ''); 
		this.jb_title = (typeof title == 'function') ? title : () => ''+title;
		this.jb$title = (typeof title == 'function') ? title() : title; // for debug
	}

	reactComp(ctx) {
		var jbComp = this;
		class ReactComp extends Component { // must start with Capital?
			constructor() {
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
					jbComp.jbBeforeInitFuncs.forEach(init=> init(this));
					jbComp.jbInitFuncs.forEach(init=> init(this));
			    } catch(e) { jb.logException(e,'') }
			}
		}; 
		ReactComp.prototype.render = this.template;
		this.applyFeatures(ctx);
		this.compileJsx();
		injectLifeCycleMethods(ReactComp,this);
		return ReactComp;
	}

	compileJsx() {
		// todo: compile template if string - cache result
	}

	initAfterViewInit(ctx,elem) { // should be called by the instantiator
	  	while (ctx.profile.__innerImplementation)
	  		ctx = ctx.componentContext._parent;
	  	var attachedCtx = this.ctxForPick || ctx;
	  	elem.setAttribute('jb-ctx',attachedCtx.id);
		garbageCollectCtxDictionary();
		jb.ctxDictionary[attachedCtx.id] = attachedCtx;

		// if (this.cssFixes.length > 0) {
		//   	var ngAtt = Array.from(elem.attributes).map(x=>x.name)
		//   		.filter(x=>x.match(/_ng/))[0];

		// 	var css = this.cssFixes
		// 		.map(x=>x.trim())
		// 		.map(x=>x.replace(/^!/,' ')) // replace the ! with space to allow internal selector
		// 		.map(x=>`[${ngAtt}]${x}`)
		// 		.join('\n');
		// 	if (!cssFixes_hash[css]) {
		// 		cssFixes_hash[css] = true;
		// 		$(`<style type="text/css">${css}</style>`).appendTo($('head'));
		// 	}
		// }
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
		if (options.jbEmitter) this.createjbEmitter = true;
		if (options.ctxForPick) this.ctxForPick=options.ctxForPick;
		if (options.extendCtx) 
			this.extendCtxFuncs.push(options.extendCtx);

	   	if (options.css)
    		options.styles = (options.styles || [])
    				.concat(options.css.split(/}\s*/m)
    				.map(x=>x.trim())
    				.filter(x=>x)
    				.map(x=>x+'}'));

		options.styles = options.styles && (options.styles || []).map(st=> context.exp(st)).map(x=>x.trim());
    	(options.styles || [])
    		.filter(x=>x.match(/^{([^]*)}$/m))
    		.forEach(x=> {
    			if (this.cssFixes.indexOf(x) == -1)
    				this.cssFixes.push('>*'+x);
    		});

    	(options.styles || [])
    		.filter(x=>x.match(/^:/m)) // for example :hover
    		.forEach(x=> {
    			if (this.cssFixes.indexOf(x) == -1)
    				this.cssFixes.push(x);
    		});

		(options.featuresOptions || []).forEach(f => 
			this.jbExtend(f, context))
		return this;
	}
}

function injectLifeCycleMethods(Comp,jbComp) {
	if (jbComp.jbAfterViewInitFuncs.length || jbComp.createjbEmitter)
	  Comp.prototype.componentDidMount = function() {
		jbComp.jbAfterViewInitFuncs.forEach(init=> init(this));
		if (this.jbEmitter) {
			this.jbEmitter.next('after-init');
			// delay(1).then(()=>{ 
			// 	if (this.jbEmitter && !this.jbEmitter.hasCompleted) {
			// 		this.jbEmitter.next('after-init-children');
			// 		if (this.readyCounter == null)
			// 			this.jbEmitter.next('ready');
			// 	}
			// })
		}
	}

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
	})
})
