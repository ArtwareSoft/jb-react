(function(){
const ui = jb.ui
let cssId = 0, cmpId = 0;
const cssSelectors_hash = ui.cssSelectors_hash = {};
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,this.ctx) }}
const lifeCycle = new Set('beforeInit,init,componentDidMount,componentWillUpdate,componentDidUpdate,destroy,extendCtx,templateModifier,extendItem'.split(','))
const arrayProps = new Set('enrichField,dynamicCss,contexts,watchAndCalcRefProp,staticCssLines,ctxForPick'.split(','))
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

        this.originatingCtx = this.ctxForPick && this.ctxForPick[0] || this.contexts[0];

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
        this.watchAndCalcRefProp && this.watchAndCalcRefProp.filter(e=>!state || !state[e.prop]).forEach(e=>{
            const ref = this.ctx.vars.$model[e.prop](this.ctx)
            this.state[e.prop] = (e.toState || (x=>x))(jb.val(ref))
        })
            
        this.state = Object.assign(this.state || {}, state)
        const vdomBefore = this.vdomBefore
        const vdomAfter = this.renderVdom()
        ui.applyVdomDiff(this.base, vdomBefore,vdomAfter,this)
        this.componentDidUpdateFuncs && this.componentDidUpdateFuncs.forEach(f=> tryWrapper(() => f(this), 'componentDidUpdate'));
    }
    strongRefresh() {
        const newCmp = this.originatingCtx.runItself()
        ui.applyVdomDiff(this.base, ui.h(this),ui.h(newCmp),newCmp)
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
                const fixed_selector = selector.split(',').map(x=>x.trim().replace('|>',' '))
                    .map(x=>x.indexOf('~') == -1 ? `.jb-${cssId}${x}` : x.replace('~',`.jb-${cssId}`));
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

        jb.asArray(options.featuresOptions || []).forEach(f => this.jbExtend(f, ctx))
        jb.asArray(ui.inStudio() && options.studioFeatures).forEach(f => this.jbExtend(ctx.run(f), ctx))
        return this;
    }
}

ui.JbComponent = JbComponent

jb.jstypes.renderable = value => {
    if (value == null) return '';
    if (value[ui.VNode]) return value;
    if (value instanceof JbComponent) return ui.h(value)
    if (Array.isArray(value))
        return ui.h('div',{},value.map(item=>jb.jstypes.renderable(item)));
    return '' + jb.val(value,true);
}

})()