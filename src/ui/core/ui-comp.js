jb.extension('ui','comp', {
    initExtension() {
        jb.core.jstypes.renderable = value => {
            if (value == null) return '';
            if (value instanceof jb.ui.VNode) return value;
            if (value instanceof jb.ui.JbComponent) return jb.ui.h(value)
            if (Array.isArray(value))
                return jb.ui.h('div',{},value.map(item=>jb.core.jstypes.renderable(item)));
            return '' + jb.val(value,true);
        }
    
        return {
            lifeCycle: new Set('init,extendCtx,templateModifier,followUp,destroy'.split(',')),
            arrayProps: new Set('enrichField,icon,watchAndCalcModelProp,css,method,calcProp,userEventProps,validations,frontEndMethod,frontEndLib,frontEndVar,eventHandler'.split(',')),
            singular: new Set('template,calcRenderProps,toolbar,styleParams,ctxForPick'.split(',')),
            cmpCounter: 1,
            cssHashCounter: 0,
            cssElemCounter: 0,
            propCounter: 0,
            cssHashMap: {},                
        }
    },
    hashCss(_cssLines,ctx,{existingClass, existingElemId} = {}) {
        const cssLines = (_cssLines||[]).filter(x=>x)
        const cssKey = cssLines.join('\n')
        if (!cssKey) return ''

        const widgetId = ctx.vars.headlessWidget && ctx.vars.headlessWidgetId
        const classPrefix = widgetId || 'jb'
        const cssMap = this.cssHashMap[classPrefix] = this.cssHashMap[classPrefix] || {}

        if (!cssMap[cssKey]) {
            if (existingClass) {
                const existingKey = Object.keys(cssMap).filter(k=>cssMap[k].classId == existingClass)[0]
                existingKey && delete cssMap[existingKey]
            } else {
                this.cssHashCounter++;
            }
            const classId = existingClass || `${classPrefix}⦾${this.cssHashCounter}`
            const elemId = existingElemId || `${classPrefix}⦾${(++jb.ui.cssElemCounter)}`
            cssMap[cssKey] = {classId, paths : {[ctx.path]: true}}
            const cssContent = linesToCssStyle(classId)
            jb.ui.insertOrUpdateStyleElem(ctx,cssContent,elemId,{classId})
        }
        Object.assign(cssMap[cssKey].paths, {[ctx.path] : true})
        return cssMap[cssKey].classId

        function linesToCssStyle(classId) {
            const cssStyle = cssLines.map(selectorPlusExp=>{
                const selector = selectorPlusExp.split('{')[0];
                const fixed_selector = selector.split(',').map(x=>x.trim().replace('|>',' '))
                    .map(x=>x.indexOf('~') == -1 ? `.${classId}${x}` : x.replace('~',`.${classId}`));
                return fixed_selector + ' { ' + selectorPlusExp.split('{')[1];
            }).join('\n');
            return `${cssStyle} /* ${ctx.path} */`
        }
    },
    JbComponent : class JbComponent {
        constructor(ctx,id,ver) {
            this.ctx = ctx // used to calc features
            const widgetId = ctx.vars.headlessWidget && ctx.vars.headlessWidgetId || ''
            this.cmpId = id || (widgetId ? (widgetId+'-'+(jb.ui.cmpCounter++)) : ''+(jb.ui.cmpCounter++))
            this.ver = ver || 1
            this.eventObservables = []
            this.cssLines = []
            this.contexts = []
            this.originators = [ctx]
        }
        init() {
            if (this.initialized) return
            jb.log('init uiComp',{cmp: this})
            const baseVars = this.ctx.vars
            this.ctx = (this.extendCtxFuncs||[])
                .reduce((acc,extendCtx) => jb.utils.tryWrapper(() => extendCtx(acc,this),'extendCtx',this.ctx), this.ctx.setVar('cmp',this))
            this.newVars = jb.objFromEntries(jb.entries(this.ctx.vars).filter(([k,v]) => baseVars[k] != v))
            this.renderProps = {}
            this.state = this.ctx.vars.$state
            this.calcCtx = this.ctx.setVar('$props',this.renderProps).setVar('cmp',this)
            this.initialized = true
        }
    
        calcRenderProps() {
            this.init()
            ;(this.initFuncs||[]).sort((p1,p2) => p1.phase - p2.phase)
                .forEach(f => jb.utils.tryWrapper(() => f.action(this.calcCtx, this.calcCtx.vars), 'init',this.ctx));
    
            this.toObserve = this.watchRef ? this.watchRef.map(obs=>({...obs,ref: obs.refF(this.ctx)})).filter(obs=>jb.db.isWatchable(obs.ref)) : []
            this.watchAndCalcModelProp && this.watchAndCalcModelProp.forEach(e=>{
                if (this.state[e.prop] != undefined) return // we have the value in the state, probably asynch value so do not calc again
                const modelProp = this.ctx.vars.$model[e.prop]
                if (!modelProp)
                    return jb.logError(`calcRenderProps: missing model prop for watchAndCalc "${e.prop}"`, {cmp: this, model: this.ctx.vars.$model, ctx: this.ctx})
                const ref = modelProp(this.ctx)
                if (jb.db.isWatchable(ref))
                    this.toObserve.push({id: e.prop, cmp: this, ref,...e})
                const val = jb.val(ref)
                this.renderProps[e.prop] = e.transformValue(this.ctx.setData(val == null ? e.defaultValue : val))
            })

            ;[...(this.calcProp || []),...(this.method || [])].forEach(
                p=>typeof p.value == 'function' && Object.defineProperty(p.value, 'name', { value: p.id }))
            const filteredPropsByPriority = (this.calcProp || []).filter(toFilter=> 
                    this.calcProp.filter(p=>p.id == toFilter.id && p.priority > toFilter.priority).length == 0)
            filteredPropsByPriority.sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
                .forEach(prop=> { 
                    const val = jb.val( jb.utils.tryWrapper(() => 
                        prop.value.profile === null ? this.calcCtx.vars.$model[prop.id] : prop.value(this.calcCtx),
                    `renderProp:${prop.id}`,this.ctx))
                    const value = val == null ? prop.defaultValue : val
                    Object.assign(this.renderProps, { ...(prop.id == '$props' ? value : { [prop.id]: value })})
                })
            ;(this.calcProp || []).filter(p => p.userStateProp && !this.state.refresh).forEach(p => this.state[p.id] = this.renderProps[p.id])
            Object.assign(this.renderProps,this.styleParams, this.state)
            return this.renderProps
        }

        renderVdom() {
            jb.log('uiComp start renderVdom', {cmp: this})
            this.calcRenderProps()
            if (this.ctx.probe && this.ctx.probe.outOfTime) return
            this.template = this.template || (() => '')
            const initialVdom = jb.utils.tryWrapper(() => this.template(this,this.renderProps,jb.ui.h), 'template',this.ctx) || {}
            const vdom = (this.templateModifierFuncs||[]).reduce((vd,modifier) =>
                    (vd && typeof vd === 'object') ? jb.utils.tryWrapper(() => modifier(vd,this,this.renderProps,jb.ui.h) || vd, 'templateModifier',this.ctx) 
                        : vd ,initialVdom)

            const observe = this.toObserve.map(x=>[
                x.ref.handler.urlOfRef(x.ref),
                x.includeChildren && `includeChildren=${x.includeChildren}`,
                x.strongRefresh && `strongRefresh`,  x.cssOnly && `cssOnly`, x.allowSelfRefresh && `allowSelfRefresh`, x.delay && `delay=${x.delay}`] 
                .filter(x=>x).join(';')).join(',')
            const methods = (this.method||[]).map(h=>`${h.id}-${jb.ui.preserveCtx(h.ctx.setVars({cmp: this, $props: this.renderProps, ...this.newVars}))}`).join(',')
            const eventhandlers = (this.eventHandler||[]).map(h=>`${h.event}-${jb.ui.preserveCtx(h.ctx.setVars({cmp: this}))}`).join(',')
            const originators = this.originators.map(ctx=>jb.ui.preserveCtx(ctx)).join(',')
            const usereventprops = (this.userEventProps||[]).join(',')
            const frontEndMethods = (this.frontEndMethod || []).map(h=>({method: h.method, path: h.path}))
            const frontEndLibs = (this.frontEndLib || [])
            const frontEndVars = this.frontEndVar && jb.objFromEntries(this.frontEndVar.map(h=>[h.id, jb.val(h.value(this.calcCtx))]))
            if (vdom instanceof jb.ui.VNode) {
                vdom.addClass(this.jbCssClass())
                vdom.attributes = Object.assign(vdom.attributes || {}, {
                        'jb-ctx': jb.ui.preserveCtx(this.originatingCtx()),
                        'cmp-id': this.cmpId, 
                        'cmp-ver': ''+this.ver,
                        'cmp-pt': this.ctx.profile.$,
                        'full-cmp-ctx': jb.ui.preserveCtx(this.calcCtx),
                    },
                    observe && {observe}, 
                    methods && {methods}, 
                    eventhandlers && {eventhandlers},
                    originators && {originators},
                    usereventprops && {usereventprops},
                    frontEndLibs.length && {$__frontEndLibs : JSON.stringify(frontEndLibs)},
                    frontEndMethods.length && {$__frontEndMethods : JSON.stringify(frontEndMethods) },
                    frontEndMethods.length && {interactive : 'true'}, 
                    frontEndVars && { $__vars : JSON.stringify(frontEndVars)},
                    this.state && { $__state : JSON.stringify(this.state)},
                    { $__debug: JSON.stringify({ path: (this.ctxForPick || this.calcCtx).path, callStack: jb.utils.callStack(this.calcCtx) }) },
                    this.ctxForPick && { 'pick-ctx': jb.ui.preserveCtx(this.ctxForPick) },
                )
            }
            jb.log('uiComp end renderVdom',{cmp: this, vdom})
            this.afterFirstRendering = true
            return vdom
        }
        renderVdomAndFollowUp() {
            const vdom = this.renderVdom()
            jb.delay(1).then(() => (this.followUpFuncs||[]).forEach(fu=> jb.utils.tryWrapper(() => { 
                jb.log(`backend uiComp followUp`, {cmp: this, fu, srcCtx: fu.srcCtx})
                fu.action(this.calcCtx)
                if (this.ver>1)
                    jb.ui.BECmpsDestroyNotification.next({ cmps: [{cmpId: this.cmpId, ver: this.ver-1}]})
            }, 'followUp',this.ctx) ) ).then(()=> this.ready = true)
            this.ready = false
            return vdom
        }
        hasBEMethod(method) {
            return (this.method||[]).filter(h=> h.id == method)[0]
        }
        runBEMethod(method, data, vars) {
            jb.log(`backend uiComp method ${method}`, {cmp: this,data,vars})
            if (jb.path(vars,'$state'))
                Object.assign(this.state,vars.$state)
            const methodImpls = (this.method||[]).filter(h=> h.id == method)
            methodImpls.forEach(h=> jb.ui.runCtxAction(h.ctx,data,{cmp: this,$state: this.state, $props: this.renderProps, ...vars}))
            if (methodImpls.length == 0)
                jb.logError(`no method ${method} in cmp`, {cmp: this, data, vars})
        }
        refresh(state,options) {
            const elem = jb.ui.elemOfCmp(this.ctx,this.cmpId)
            jb.log('backend uiComp refresh request',{cmp: this,elem,state,options})
            jb.ui.BECmpsDestroyNotification.next({ cmps: [{cmpId: this.cmpId, ver: this.ver, destroyCtxs: [] }] })
            elem && jb.ui.refreshElem(elem,state,options) // cmpId may be deleted
        }
        calcCssLines() {
            return jb.utils.unique((this.css || []).map(l=> typeof l == 'function' ? l(this.calcCtx): l)
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
                ctxId: jb.ui.preserveCtx(ctx),
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
            return this
        }

        jbExtend(_options,ctx) {
            if (!_options) return this;
            if (!ctx) debugger
            ctx = ctx || this.ctx;
            if (!ctx)
                console.logError('uiComp: no ctx provided for jbExtend',{_options,ctx})
            if (typeof _options != 'object')
                console.logError('uiComp: _options should be an object',{_options,ctx})
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

                if (jb.ui.lifeCycle.has(key)) {
                    this[key+'Funcs'] = this[key+'Funcs'] || []
                    this[key+'Funcs'].push(options[key])
                }
                if (jb.ui.arrayProps.has(key)) {
                    this[key] = this[key] || []
                    this[key].push(options[key])
                }
                if (jb.ui.singular.has(key))
                    this[key] = this[key] || options[key]
            })
            if (options.watchRef) {
                this.watchRef = this.watchRef || []
                this.watchRef.push({cmp: this,...options.watchRef});
            }

            // eventObservables
            this.eventObservables = this.eventObservables.concat(Object.keys(options).filter(op=>op.indexOf('on') == 0))

            jb.asArray(options.featuresOptions || []).filter(x=>x).forEach(f => this.jbExtend(f.$ ? ctx.run(f) : f , ctx))
            jb.asArray(jb.ui.inStudio() && options.studioFeatures).filter(x=>x).forEach(f => this.jbExtend(ctx.run(f), ctx))
            return this;
        }
    }
})
