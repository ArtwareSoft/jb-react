(function(){
const ui = jb.ui
let cmpId = 1;
ui.propCounter = 0
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,this.ctx) }}
const lifeCycle = new Set('init,extendCtx,templateModifier,followUp,destroy'.split(','))
const arrayProps = new Set('enrichField,icon,watchAndCalcModelProp,css,method,calcProp,userEventProps,validations,frontEndMethod,eventHandler'.split(','))
const singular = new Set('template,calcRenderProps,toolbar,styleParams,calcHash,ctxForPick'.split(','))

Object.assign(jb.ui,{
    cssHashCounter: 0,
    cssHashMap: {},
    hashCss(_cssLines,ctx,{existingClass, cssStyleElem} = {}) {
        const cssLines = (_cssLines||[]).filter(x=>x)
        const cssKey = cssLines.join('\n')
        if (!cssKey) return ''

        const widgetId = ctx.vars.headlessWidget && ctx.vars.headlessWidgetId
        const classPrefix = widgetId ? 'w'+ widgetId : 'jb-'

        if (!this.cssHashMap[cssKey]) {
            if (existingClass) {
                const existingKey = Object.keys(this.cssHashMap).filter(k=>this.cssHashMap[k].classId == existingClass)[0]
                existingKey && delete this.cssHashMap[existingKey]
            } else {
                this.cssHashCounter++;
            }
            const classId = existingClass || `${classPrefix}${this.cssHashCounter}`
            this.cssHashMap[cssKey] = {classId, paths : {[ctx.path]: true}}
            const cssContent = linesToCssStyle(classId)
            if (cssStyleElem)
                cssStyleElem.innerText = cssContent
            else
                ui.addStyleElem(cssContent,widgetId)
        }
        Object.assign(this.cssHashMap[cssKey].paths, {[ctx.path] : true})
        return this.cssHashMap[cssKey].classId

        function linesToCssStyle(classId) {
            const cssStyle = cssLines.map(selectorPlusExp=>{
                const selector = selectorPlusExp.split('{')[0];
                const fixed_selector = selector.split(',').map(x=>x.trim().replace('|>',' '))
                    .map(x=>x.indexOf('~') == -1 ? `.${classId}${x}` : x.replace('~',`.${classId}`));
                return fixed_selector + ' { ' + selectorPlusExp.split('{')[1];
            }).join('\n');
            const remark = `/*style: ${ctx.profile.style && ctx.profile.style.$}, path: ${ctx.path}*/\n`;
            return remark + cssStyle
        }
    },
})

class JbComponent {
    constructor(ctx,id,ver) {
        this.ctx = ctx // used to calc features
        this.cmpId = id || cmpId++
        this.ver = ver || 1
        this.eventObservables = []
        this.cssLines = []
        this.contexts = []
        this.originators = [ctx]
    }
    init() {
        jb.log('initCmp',[this])
        const baseVars = this.ctx.vars
        this.ctx = (this.extendCtxFuncs||[])
            .reduce((acc,extendCtx) => tryWrapper(() => extendCtx(acc,this),'extendCtx'), this.ctx.setVar('cmp',this))
        this.newVars = jb.objFromEntries(jb.entries(this.ctx.vars).filter(([k,v]) => baseVars[k] != v))
        this.renderProps = {}
        this.state = this.ctx.vars.$state
        this.calcCtx = this.ctx.setVar('$props',this.renderProps).setVar('cmp',this)

        this.renderProps.cmpHash = this.calcHash && tryWrapper(() => this.calcHash(this.calcCtx))
        this.initialized = true
        return this.renderProps.cmpHash
    }
 
    calcRenderProps() {
        jb.log('renderVdom',[this])
        if (!this.initialized)
            this.init();
        (this.initFuncs||[]).sort((p1,p2) => p1.phase - p2.phase)
            .forEach(f =>  tryWrapper(() => f.action(this.calcCtx), 'init'));
   
        this.toObserve = this.watchRef ? this.watchRef.map(obs=>({...obs,ref: obs.refF(this.ctx)})).filter(obs=>jb.isWatchable(obs.ref)) : []
        this.watchAndCalcModelProp && this.watchAndCalcModelProp.forEach(e=>{
            if (this.state[e.prop] != undefined) return // we have the value in the state, probably asynch value so do not calc again
            const modelProp = this.ctx.vars.$model[e.prop]
            if (!modelProp)
                return jb.logError('calcRenderProps',`missing model prop "${e.prop}"`,this.ctx.vars.$model,this.ctx)
            const ref = modelProp(this.ctx)
            if (jb.isWatchable(ref))
                this.toObserve.push({id: e.prop, cmp: this, ref,...e})
            const val = jb.val(ref)
            this.renderProps[e.prop] = e.transformValue(this.ctx.setData(val == null ? '' : val))
            jb.log('calcRenderProp',[e.prop,this.renderProps[e.prop],this])    
        })

        ;[...(this.calcProp || []),...(this.method || [])].forEach(p=>typeof p.value == 'function' && Object.defineProperty(p.value, 'name', { value: p.id }))
        const filteredPropsByPriority = (this.calcProp || []).filter(toFilter=> 
                this.calcProp.filter(p=>p.id == toFilter.id && p.priority > toFilter.priority).length == 0)
        filteredPropsByPriority.sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            .forEach(prop=> { 
                const value = jb.val( tryWrapper(() => 
                    prop.value.profile === null ? this.calcCtx.vars.$model[prop.id] : prop.value(this.calcCtx),
                `renderProp:${prop.id}`))
                Object.assign(this.renderProps, { ...(prop.id == '$props' ? value : { [prop.id]: value })})
            })
        ;(this.calcProp || []).filter(p => p.userStateProp).forEach(p => this.state[p.id] = this.renderProps[p.id])
        Object.assign(this.renderProps,this.styleParams, this.state)
        jb.log('renderProps',[this.renderProps, this])
        return this.renderProps
    }

    renderVdom() {
        this.calcRenderProps()
        if (this.ctx.probe && this.ctx.probe.outOfTime) return
        this.template = this.template || (() => '')
        const initialVdom = tryWrapper(() => this.template(this,this.renderProps,ui.h), 'template') || {}
        const vdom = (this.templateModifierFuncs||[]).reduce((vd,modifier) =>
                (vd && typeof vd === 'object') ? tryWrapper(() => modifier(vd,this,this.renderProps,ui.h) || vd, 'templateModifier') 
                    : vd ,initialVdom)

        const observe = this.toObserve.map(x=>[
            x.ref.handler.urlOfRef(x.ref),
            x.includeChildren && `includeChildren=${x.includeChildren}`,
            x.strongRefresh && `strongRefresh`,  x.cssOnly && `cssOnly`, x.allowSelfRefresh && `allowSelfRefresh`,  
            x.phase && `phase=${x.phase}`].filter(x=>x).join(';')).join(',')
        const methods = (this.method||[]).map(h=>`${h.id}-${ui.preserveCtx(h.ctx.setVars({cmp: this, $props: this.renderProps, ...this.newVars}))}`).join(',')
        const eventHandlers = (this.eventHandler||[]).map(h=>`${h.event}-${ui.preserveCtx(h.ctx.setVars({cmp: this}))}`).join(',')
        const originators = this.originators.map(ctx=>ui.preserveCtx(ctx)).join(',')
        const userEventProps = (this.userEventProps||[]).join(',')
        const frontEndMethods = (this.frontEndMethod || []).map(h=>({method: h.method, path: h.path}))
        if (vdom instanceof jb.ui.VNode) {
            vdom.addClass(this.jbCssClass())
            vdom.attributes = Object.assign(vdom.attributes || {}, {
                    'jb-ctx': ui.preserveCtx(this.originatingCtx()),
                    'cmp-id': this.cmpId, 
                    'cmp-ver': this.ver,
                    'full-cmp-ctx': ui.preserveCtx(this.calcCtx),
                },
                observe && {observe}, 
                methods && {methods}, 
                eventHandlers && {eventHandlers},
                originators && {originators},
                userEventProps && {userEventProps},
                frontEndMethods.length && {$__frontEndMethods : JSON.stringify(frontEndMethods) },
                frontEndMethods.length && {interactive : true}, 
                this.state && { $__state : JSON.stringify(this.state)},
                this.ctxForPick && { 'pick-ctx': ui.preserveCtx(this.ctxForPick) },
                this.renderProps.cmpHash != null && {cmpHash: this.renderProps.cmpHash}
            )
        }
        jb.log('renRes',[this.ctx, vdom, this]);
        this.afterFirstRendering = true
        return vdom
    }
    renderVdomAndFollowUp() {
        const vdom = this.renderVdom()
        jb.delay(1).then(() => (this.followUpFuncs||[]).forEach(f=> tryWrapper(() => { 
            jb.log('followUp',[f,this])
            f(this.calcCtx) 
        }, 'followUp') ) )
        return vdom
    }
    hasBEMethod(method) {
        (this.method||[]).filter(h=> h.id == method)[0]
    }
    runBEMethod(method, data, vars) {
        jb.log('BEMethod',[method,this,data,vars])
        if (jb.path(vars,'$state'))
            Object.assign(this.state,vars.$state)
        const methodImpls = (this.method||[]).filter(h=> h.id == method)
        methodImpls.forEach(h=> jb.ui.runCtxAction(h.ctx,data,{cmp: this,$state: this.state, $props: this.renderProps, ...vars}))
        if (methodImpls.length == 0)
            jb.logError(`no method in cmp: ${method}`, this, data, vars)
    }
    refresh(state,options) {
        const elem = jb.ui.elemOfCmp(this.ctx,this.cmpId)
        jb.ui.BECmpsDestroyNotification.next({ cmps: [{cmpId: this.cmpId, ver: this.ver, destroyCtxs: [] }] })
        elem && jb.ui.refreshElem(elem,state,options) // cmpId may be deleted
    }
    calcCssLines() {
        return jb.unique(this.css.map(l=> typeof l == 'function' ? l(this.calcCtx): l)
        .flatMap(css=>css.split(/}\s*/m)
            .map(x=>x.trim()).filter(x=>x)
            .map(x=>x+'}')
            .map(x=>x.replace(/^!/,' '))))
    }
    jbCssClass() {
        return jb.ui.hashCss(this.calcCssLines() ,this.ctx)
    }
    originatingCtx() {
        return this.originators[this.originators.length-1]
    }

    field() {
        if (this._field) return this._field
        const ctx = this.originatingCtx()
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
    orig(ctx) {
        if (jb.comps[ctx.profile && ctx.profile.$].type.split(/,|-/).indexOf('control') == -1)
            debugger
        this.originators.push(ctx)
        return this
    }
    applyParamFeatures(ctx) {
        (ctx.params.features && ctx.params.features(ctx) || []).forEach(f => this.jbExtend(f,ctx))
        return this;
    }

    jbExtend(_options,ctx) {
        if (!_options) return this;
        if (!ctx) debugger
        ctx = ctx || this.ctx;
        if (!ctx)
            console.log('no ctx provided for jbExtend');
        if (typeof _options != 'object')
            debugger;
        const options = _options.$ ? ctx.run(_options) : _options
        if (Array.isArray(options)) {
            options.forEach(o=>this.jbExtend(o,ctx))
            return this
        }

        if (options.afterViewInit) 
            options.frontEnd = options.afterViewInit
        if (typeof options.class == 'string') 
            options.templateModifier = vdom => vdom.addClass(options.class)

        Object.keys(options).forEach(key=>{
            if (typeof options[key] == 'function')
                Object.defineProperty(options[key], 'name', { value: key })

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
            this.watchRef.push({cmp: this,...options.watchRef});
        }

        // eventObservables
        this.eventObservables = this.eventObservables.concat(Object.keys(options).filter(op=>op.indexOf('on') == 0))

        jb.asArray(options.featuresOptions || []).filter(x=>x).forEach(f => this.jbExtend(f.$ ? ctx.run(f) : f , ctx))
        jb.asArray(ui.inStudio() && options.studioFeatures).filter(x=>x).forEach(f => this.jbExtend(ctx.run(f), ctx))
        return this;
    }
}

ui.JbComponent = JbComponent

jb.jstypes.renderable = value => {
    if (value == null) return '';
    if (value instanceof ui.VNode) return value;
    if (value instanceof JbComponent) return ui.h(value)
    if (Array.isArray(value))
        return ui.h('div',{},value.map(item=>jb.jstypes.renderable(item)));
    return '' + jb.val(value,true);
}

})()