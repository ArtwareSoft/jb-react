(function(){
const ui = jb.ui
let cssId = 0, cmpId = 0;
ui.propCounter = 0
const cssSelectors_hash = ui.cssSelectors_hash = {};
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,this.ctx) }}
const lifeCycle = new Set('init,componentDidMount,componentWillUpdate,componentDidUpdate,destroy,extendCtx,templateModifier,extendItem'.split(','))
const arrayProps = new Set('enrichField,dynamicCss,watchAndCalcRefProp,staticCssLines,ctxForPick,defHandler,interactiveProp,calcProp'.split(','))
const singular = new Set('template,calcRenderProps,toolbar,styleCtx,calcHash'.split(','))

class JbComponent {
    constructor(ctx) {
        this.ctx = this.originatingCtx = ctx // used to calc features
        this.cmpId = cmpId++
        this.eventObservables = []
        this.staticCssLines = []
        this.contexts = []
    }
    init() {
        jb.log('initCmp',[this]);
        this.originatingCtx = this.ctxForPick && this.ctxForPick[0] || this.originatingCtx;
        this.ctx = (this.extendCtxFuncs||[])
            .reduce((acc,extendCtx) => tryWrapper(() => extendCtx(acc,this),'extendCtx'), this.originatingCtx)
        this.renderProps = {}
        this.state = this.ctx.vars.$state
        this.calcCtx = this.ctx.setVar('props',this.renderProps).setVar('cmp',this)

        this.renderProps.cmpHash = this.calcHash && tryWrapper(() => this.calcHash(this.calcCtx))
        this.initialized = true
        return this.renderProps.cmpHash
    }
 
    renderVdom() {
        jb.log('renderVdom',[this]);
        if (!this.initialized)
            this.init();
        (this.initFuncs||[]).forEach(f=> tryWrapper(() => this.calcCtx.run(f), 'init'));
   
        this.toObserve = this.watchRef ? this.watchRef.map(obs=>({...obs,ref: obs.refF(this.ctx)})).filter(obs=>jb.isWatchable(obs.ref)) : []
        this.watchAndCalcRefProp && this.watchAndCalcRefProp.forEach(e=>{
            const ref = this.ctx.vars.$model[e.prop](this.ctx)
            if (jb.isWatchable(ref))
                this.toObserve.push({id: e.prop, cmp: this, ref,...e})
            this.renderProps[e.prop] = (e.transformValue || (x=>x))(jb.val(ref))
        })

        //Object.assign(this,(this.styleCtx || {}).params); // temporary for compatability
        Object.assign(this.renderProps,(this.styleCtx || {}).params, this.state);
        
        const filteredPropsByPriority = (this.calcProp || []).filter(toFilter=> 
                this.calcProp.filter(p=>p.id == toFilter.id && p.priority > toFilter.priority).length == 0)
        filteredPropsByPriority.sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            .forEach(prop=> Object.assign(this.renderProps, { [prop.id]: jb.val(prop.value(this.calcCtx))}))
        jb.log('renderProps',[this.renderProps, this])
        const initialVdom = tryWrapper(() => this.template(this,this.renderProps,ui.h), 'template')
        const vdom = (this.templateModifierFuncs||[]).reduce((vdom,modifier) =>
                (vdom && typeof vdom === 'object')
                    ? tryWrapper(() => modifier(vdom,this,this.renderProps,ui.h) || vdom, 'templateModifier') 
                    : vdom     
        ,initialVdom)

        if (typeof vdom === 'object') ui.addClassToVdom(vdom, this.jbCssClass())
        // vdom = vdom || ui.h('span',{display: 'none'})
        const toObserve = this.toObserve.map(x=>[x.ref.handler.urlOfRef(x.ref),
            x.includeChildren ? `includeChildren=${x.includeChildren}` : ''
        ].join(';')).join(',')
        const handlers = (this.defHandler||[]).map(h=>`${h.id}-${ui.preserveCtx(h.ctx)}`).join(',')
        const interactiveProps = (this.interactiveProp||[]).map(h=>`${h.id}-${ui.preserveCtx(h.ctx)}`).join(',')
        if (typeof vdom == 'object') {
            ui.addClassToVdom(vdom, this.jbCssClass())
            vdom.attributes = Object.assign(vdom.attributes || {}, {
                    cmpId: this.cmpId,
                    'jb-ctx': ui.preserveCtx(this.originatingCtx)}, 
                    toObserve ? {toObserve} : {}, 
                    handlers ? {handlers} : {}, 
                    interactiveProps ? {interactiveProps} : {}, 
                    this.renderProps.cmpHash != null ? {cmpHash: this.renderProps.cmpHash} : {}
            )
        }
        this.vdom = vdom
        jb.log('renRes',[this.ctx, vdom, this]);
        return vdom
    }

    componentDidMount(elem) {
        const mountedCmp = {
            cmpId: this.cmpId,
            state: this.state,
            base: elem,
            refresh(state, options) {
                jb.log('refreshReq',[...arguments])
                !this._deleted && ui.refreshElem(elem,{...this.state, ...state},options) 
            },
            destroy() {
                mountedCmp._deleted = true
                mountedCmp.resolveDestroyed() // notifications to takeUntil(cmp.destroyed) observers
                ;(this.destroyFuncs||[]).forEach(f=> tryWrapper(() => f(this), 'destroy'));
            },
            vdom: this.vdom,
            status: 'init',
            destroyFuncs: this.destroyFuncs
        }
        mountedCmp.ctx = this.ctx.setVar('cmp',mountedCmp)
        mountedCmp.destroyed = new Promise(resolve=>mountedCmp.resolveDestroyed = resolve)
        elem._component = mountedCmp

        ;(this.defHandler||[]).forEach(h=>mountedCmp[h.id] = () => { // not essential, used for cmp debug
            const ctx = jb.ctxDictionary[h.ctx.id]
            ctx.setVar('cmp',mountedCmp).runInner(ctx.profile.action,'action','action')
        })
        ;(this.interactiveProp||[]).forEach(h=> {
            const ctx = jb.ctxDictionary[h.ctx.id]
            mountedCmp[h.id] = jb.val(ctx.setVar('state',mountedCmp.state).runInner(ctx.profile.value,'value','value'))
        })
        

        jb.unique(this.eventObservables)
            .forEach(op => mountedCmp[op] = jb.rx.Observable.fromEvent(elem, op.slice(2)).takeUntil( mountedCmp.destroyed ))
        ;(this.componentDidMountFuncs||[]).forEach(f=> tryWrapper(() => f(mountedCmp), 'componentDidMount'))
        mountedCmp.status = 'ready'
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

    field() {
        if (this._field) return this._field
        const ctx = this.originatingCtx
        this._field = {
            class: '',
            ctxId: ui.preserveCtx(ctx),
            control: (item,index,noCache) => this.getOrCreateItemField(item, () => ctx.setData(item).setVars({index: (index||0)+1}).runItself(),noCache),
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

    applyFeatures(ctx) {
        this.contexts.push(ctx)
        const features = (ctx.params.features && ctx.params.features(ctx) || []);
        features.forEach(f => this.jbExtend(f,ctx));
        if (ctx.params.style && ctx.params.style.profile && ctx.params.style.profile.features) {
            jb.asArray(ctx.params.style.profile.features)
                .forEach((f,i)=>
                    this.jbExtend(ctx.runInner(f,{type:'feature'},ctx.path+'~features~'+i),ctx))
        }
        return this;
    }

    jbExtend(_options,ctx) {
        if (!_options) return this;
        ctx = ctx || this.originatingCtx;
        if (!ctx)
            console.log('no ctx provided for jbExtend');
        if (typeof _options != 'object')
            debugger;
        const options = _options.$ ? ctx.run(_options) : _options
        if (Array.isArray(options)) {
            options.forEach(o=>this.jbExtend(o,ctx))
            return this
        }

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

        // eventObservables
        this.eventObservables = this.eventObservables.concat(Object.keys(options).filter(op=>op.indexOf('on') == 0))

        if (options.css)
            this.staticCssLines = (this.staticCssLines || []).concat(options.css.split(/}\s*/m)
                .map(x=>x.trim()).filter(x=>x)
                .map(x=>x+'}')
                .map(x=>x.replace(/^!/,' ')));

        jb.asArray(options.featuresOptions || []).forEach(f => this.jbExtend(f.$ ? ctx.run(f) : f , ctx))
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