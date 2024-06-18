extension('ui','comp', {
    initExtension() {
        jb.core.jstypes.renderable = value => {
            if (value == null) return '';
            if (value instanceof jb.ui.VNode) return value;
            if (value.isBEComp) return jb.ui.h(value)
            if (Array.isArray(value))
                return jb.ui.h('div',{},value.map(item=>jb.core.jstypes.renderable(item)));
            return '' + jb.val(value,true);
        }
        return {
            lifeCycle: new Set('init,extendCtx,templateModifier,followUp,destroy'.split(',')),
            arrayProps: new Set('enrichField,icon,watchAndCalcModelProp,css,method,calcProp,userEventProps,validations,frontEndMethod,frontEndLib,frontEndVar'.split(',')),
            singular: new Set('template,calcRenderProps,toolbar,styleParams,pathForPick,coLocation'.split(',')),
            cmpCounter: 1,
            cssHashCounter: 0,
            cssElemCounter: 0,
            propCounter: 0,
            cssHashMap: {},
            cmps: {},
            headless: {}              
        }
    },
    typeRules: [
        { isOfWhenEndsWith: ['feature<>','feature<>'] },
        { isOfWhenEndsWith: ['style<>',['feature<>', 'style<>' ]] }
    ],
    h(cmpOrTag,attributes,children) {
        if (cmpOrTag instanceof jb.ui.VNode) return cmpOrTag // Vdom
        if (cmpOrTag && cmpOrTag.renderVdom)
            return cmpOrTag.renderVdomAndFollowUp()
    
        return new jb.ui.VNode(cmpOrTag,attributes,children)
    },
    ctrl(origCtx,options) {
        const styleByControl = jb.path(origCtx,'cmpCtx.profile.$') == 'styleByControl'
        const $state = (origCtx.vars.$refreshElemCall || styleByControl) ? origCtx.vars.$state : {}
        const cmpId = origCtx.vars.$cmpId, cmpVer = origCtx.vars.$cmpVer
        if (!origCtx.vars.$serviceRegistry) {
            //debugger
            jb.logError('no serviceRegistry',{ctx: origCtx})
        }
        const ctx = origCtx.setVars({
            $model: { ctx: origCtx, ...origCtx.params},
            $state,
            $serviceRegistry: origCtx.vars.$serviceRegistry,
            $refreshElemCall : undefined, $props : undefined, cmp: undefined, $cmpId: undefined, $cmpVer: undefined 
        })
        const styleOptions = runEffectiveStyle(ctx) || {}
        if (styleOptions.isBEComp)  {// style by control
            return styleOptions.orig(ctx).jbExtend(options,ctx).applyParamFeatures(ctx)
        }
        return new jb.ui.JbComponent(ctx,cmpId,cmpVer).jbExtend(options,ctx).jbExtend(styleOptions,ctx).applyParamFeatures(ctx)
    
        function runEffectiveStyle(ctx) {
            const profile = origCtx.profile
            const defaultVar = '$theme.' + (profile.$ || '')
            if (!profile.style && origCtx.vars[defaultVar])
                return ctx.run({$:origCtx.vars[defaultVar]})
            return origCtx.params.style ? origCtx.params.style(ctx) : {}
        }
    },
    garbageCollectUiComps({forceNow,clearAll,ctx}) {
        if (!forceNow)
            return jb.delay(1000).then(()=>jb.ui.garbageCollectUiComps({forceNow: true, clearAll, ctx}))
   
        // remove unused cmps from dictionary
        const usedCmps = new Map(querySelectAllWithWidgets(`[cmp-id]`).map(el=>[el.getAttribute('cmp-id'),el.getAttribute('ctx-id')]))
        const maxUsed = Object.values(usedCmps).map(x=> +x || 0).sort((x,y)=>x-y)[0] || (clearAll ? Number.MAX_SAFE_INTEGER : 0)
        const removedCmps = []
        Object.keys(jb.ui.cmps).filter(id=> (usedCmps.get(id) || 0) < maxUsed && !usedCmps.get(id)).forEach(id=> {removedCmps.push(id); delete jb.ui.cmps[id] })

        // remove unused vars from resources
        const removedResources = []
        // const ctxToPath = ctx => Object.values(ctx.vars).filter(v=>jb.db.isWatchable(v)).map(v => jb.db.asRef(v))
        //     .map(ref=>jb.db.refHandler(ref).pathOfRef(ref)).flat()
        // const globalVarsUsed = jb.utils.unique(Object.keys(usedCmps).map(id=>jb.path(jb.ui.cmps[id],'calcCtx')).filter(x=>x).map(ctx=>ctxToPath(ctx)).flat())
        Object.keys(jb.db.resources).filter(id=>id.indexOf(':') != -1)
            .filter(id=>{
                const cmpId = id.split(':').pop() // no ':' in cmpID or var name
                return (usedCmps.get(cmpId) || 0) < maxUsed && !usedCmps.get(cmpId)
            })
            .forEach(id => { removedResources.push(id); delete jb.db.resources[id]})

        // remove front-end widgets
        const usedWidgets = jb.objFromEntries(
            Array.from(querySelectAllWithWidgets(`[widgetid]`)).filter(el => el.getAttribute('frontend')).map(el => [el.getAttribute('widgetid'),1]))
        const removeWidgets = Object.keys(jb.ui.frontendWidgets||{}).filter(id=>!usedWidgets[id])

        removeWidgets.forEach(widgetId => {
            jb.ui.sendUserReq({$$:'destroy', widgetId, destroyWidget: true, cmps: [] })
            if (jb.ui.frontendWidgets) delete jb.ui.frontendWidgets[widgetId]
        })
        
        // remove component follow ups
        const removeFollowUps = Object.keys(jb.ui.followUps).flatMap(cmpId=> {
            const curVer = Array.from(querySelectAllWithWidgets(`[cmp-id="${cmpId}"]`)).map(el=>+el.getAttribute('cmp-ver'))[0]
            return jb.ui.followUps[cmpId].flatMap(({cmp})=>cmp).filter(cmp => !curVer || cmp.ver > curVer)
        })
        if (removeFollowUps.length)
            jb.ui.BECmpsDestroyNotification.next({ cmps: removeFollowUps})

        jb.log('garbageCollect',{maxUsed,removedCmps,removedResources,removeWidgets,removeFollowUps,ctx})

        function querySelectAllWithWidgets(query) {
            return jb.ui.headless ? [...Object.values(jb.ui.headless).filter(x=>x.body).flatMap(w=>w.body.querySelectorAll(query,{includeSelf:true})), 
                ...Array.from(jb.frame.document && document.querySelectorAll(query) || [])].filter(x=>x) : []
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
    refreshElem(elem, state, options = {}) {
        if (jb.path(elem,'_component.state.frontEndStatus') == 'initializing' || jb.ui.findIncludeSelf(elem,'[__refreshing]')[0]) 
            return jb.logError('circular refresh',{elem, state, options})
        const cmpId = elem.getAttribute('cmp-id'), cmpVer = +elem.getAttribute('cmp-ver')
        const cmpBefore = jb.ui.cmps[cmpId]
        if (!cmpBefore)
            return jb.logError('refresh elem. can not find former cmp',{cmpId})
        const _ctx = cmpBefore.originatingCtx()
        const {methodBeforeRefresh, opVal} = options
        methodBeforeRefresh && cmpBefore && methodBeforeRefresh.split(',').forEach(m=>cmpBefore.runBEMethod(m,opVal))
        if (!_ctx) 
            return jb.logError('refreshElem - no ctx for elem',{elem, cmpId, cmpVer})
        const strongRefresh = jb.path(options,'strongRefresh')
        const newState = strongRefresh ? {refresh: true } 
            : { ...jb.path(elem._component,'state'), refreshSource: jb.path(options,'refreshSource'), refresh: true, ...state} // strongRefresh kills state
        let ctx = _ctx.setVars({$model: null, $state: newState, $refreshElemCall: true, $cmpId: cmpId
            , $cmpVer: cmpVer+1, $OnlyCalcDialog: _ctx.profile.$ == 'openDialog'})
        ctx._parent = null
        if (options && options.extendCtx)
            ctx = options.extendCtx(ctx)
//        ctx = ctx.setVar('$refreshElemCall',true).setVar('$cmpId', cmpId).setVar('$cmpVer', cmpVer+1) // special vars for refresh
        if (ctx.vars.$previewMode && jb.watchableComps && jb.watchableComps.handler) // updating to latest version of profile - todo: moveto studio
            ctx.profile = jb.watchableComps.handler.valOfPath(ctx.path.split('~')) || ctx.profile
        elem.setAttribute('__refreshing','')
        const cmp = ctx.runItself()
        jb.log('refresh elem start',{cmp,ctx,newState ,elem, state, options})

        const className = elem.className != null ? elem.className : jb.path(elem.attributes.class) || ''
        const existingClass = (className.match(/[•a-zA-Z0-9_-]+⦾[0-9]*/)||[''])[0]
        if (jb.path(options,'cssOnly') && existingClass) {
            const { headlessWidget, headlessWidgetId } = ctx.vars
            if (headlessWidget) {
                const existingElemId = jb.entries(jb.ui.headless[headlessWidgetId].styles||{}).find(([id,text])=>text.indexOf(existingClass) != -1)[0]
                jb.log('css only refresh headelss element',{existingElemId, cmp, lines: cmp.cssLines,ctx,elem, state, options})
                jb.ui.hashCss(cmp.calcCssLines(),cmp.ctx,{existingClass, existingElemId})
            } else {
                const existingElem = Array.from(document.querySelectorAll('style')).find(el=>el.innerText.indexOf(existingClass) != -1)
                const existingElemId = existingElem.getAttribute('elemId')
                jb.log('css only refresh element',{existingElemId, existingElem, cmp, lines: cmp.cssLines,ctx,elem, state, options})
                jb.ui.hashCss(cmp.calcCssLines(),cmp.ctx,{existingClass, existingElemId})
            }
        } else {
            jb.log('do refresh element',{cmp,ctx,elem, state, options})
            cmp && jb.ui.applyNewVdom(elem, jb.ui.h(cmp), {strongRefresh, ctx, srcCtx: options.srcCtx})
        }
        elem.removeAttribute('__refreshing')
        jb.ui.refreshNotification.next({cmp,ctx,elem, state, options})
        //jb .studio.execInStudio({ $$:'animate.refreshElem', elem: () => elem })
    },
    JbComponent : class JbComponent {
        constructor(ctx,id,ver) {
            this.ctx = ctx // used to calc features
            this.cmpId = id || `${jb.uri}-${jb.ui.cmpCounter++}`
            //const widgetId = ctx.vars.headlessWidget && ctx.vars.headlessWidgetId || ''
            //id || (widgetId ? (widgetId+'-'+(jb.ui.cmpCounter++)) : ''+(jb.ui.cmpCounter++))
            this.ver = ver || 1
            this.eventObservables = []
            this.cssLines = []
            this.contexts = []
            this.originators = [ctx]
            this.isBEComp = true
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
            this.calcCtx = this.ctx.setVars({$props: this.renderProps, cmp: this})
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
            ;(this.calcProp || []).forEach(prop=> 
                prop._priority = jb.utils.tryWrapper(() => prop.priority ? prop.priority(this.calcCtx) : 1, `renderPropPriority:${prop.id}`,this.ctx) )

            const filteredPropsByPriority = (this.calcProp || []).filter(toFilter=> 
                    this.calcProp.filter(p=>p.id == toFilter.id && p._priority > toFilter._priority).length == 0)
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
                x.methodBeforeRefresh && `methodBeforeRefresh=${x.methodBeforeRefresh}`,
                x.strongRefresh && `strongRefresh`,  x.cssOnly && `cssOnly`, x.allowSelfRefresh && `allowSelfRefresh`, x.delay && `delay=${x.delay}`] 
                .filter(x=>x).join(';')).join(',')
                this.calcCtx
            const methods = (this.method||[]).map(h=>h.id).join(',')
            const usereventprops = (this.userEventProps||[]).join(',')
            const colocation = this.coLocation
            const frontEndMethods = (this.frontEndMethod || []).map(h=>({method: h.method, path: h.path}))
            const frontEndLibs = (this.frontEndLib || [])
            const frontEndVars = this.frontEndVar && jb.objFromEntries(this.frontEndVar.map(h=>[h.id, jb.val(h.value(this.calcCtx))]))
            const passive = (frontEndMethods.length + frontEndLibs.length) == 0 && !this.followUpFuncs && !observe && !methods
            const hasAtts = (!passive) || this.ctx.vars.$previewMode || jb.path(vdom.attributes.id)
            if (vdom instanceof jb.ui.VNode) {
                vdom.addClass(this.jbCssClass())
                vdom.attributes = Object.assign(vdom.attributes || {}, Object.keys(this.state||{}).length && { $__state : JSON.stringify(this.state)})
                vdom.attributes = Object.assign(vdom.attributes,  {
                        'ctx-id': ''+ this.ctx.id,
                        'cmp-id': this.cmpId, 
                        'cmp-ver': ''+this.ver,
                        'cmp-pt': this.ctx.profile.$,
            //            'full-cmp-ctx': jb.ui .preserveCtx(this.calcCtx),
                })
                if (hasAtts) Object.assign(vdom.attributes,
                    observe && {observe}, 
                    methods && {methods},
                    this.ctx.vars.uiTest && {uiTest: this.ctx.vars.uiTest},
                    usereventprops && {usereventprops},
                    colocation && {colocation},
                    frontEndLibs.length && {$__frontEndLibs : JSON.stringify(frontEndLibs)},
                    frontEndMethods.length && {$__frontEndMethods : JSON.stringify(frontEndMethods) },
                    (frontEndMethods.length + frontEndLibs.length)  && {interactive : 'true'}, 
                    frontEndVars && { $__vars : JSON.stringify(frontEndVars)},                    
                    (this.ctx.vars.$previewMode || this.pathForPick) && { $__debug: JSON.stringify({ 
                        path: this.pathForPick || this.originatingCtx().path,
                        callStack: jb.utils.callStack(this.calcCtx) 
                    }) },
                )
            }
            if (this.ctx.vars.$previewMode)
                this.callStack = jb.utils.callStack(this.calcCtx)
        
            jb.log('uiComp end renderVdom',{cmp: this, vdom})
            this.afterFirstRendering = true
            jb.ui.cmps[this.cmpId] = this
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
        runBEMethod(method, data, vars, options = {}) {
            const {doNotUseUserReqTx, dataMethod, userReqTx} = options
            jb.log(`backend uiComp method ${method}`, {cmp: this,data,vars,doNotUseUserReqTx, dataMethod, userReqTx})
            if (jb.path(vars,'$state'))
                Object.assign(this.state,vars.$state)
            const tActions = (this.method||[]).filter(h=> h.id == method).map(h => ctx => {
                const _vars = { ...vars, userReqTx: userReqTx || (!doNotUseUserReqTx && ctx.vars.userReqTx) }
                this.runMethodObject(h,data,_vars)
                userReqTx && userReqTx.complete(`method ${method}`)                        
            })
            if (dataMethod && tActions[0])
                return this.runMethodObject((this.method||[]).filter(h=> h.id == method)[0],data,vars)

            const tx = this.calcCtx.vars.userReqTx
            if (tx)
                tx.completeByChildren(tActions, this.calcCtx)
            else
                tActions.forEach(action => action(this.calcCtx))
    
            if (tActions.length == 0)
                jb.logError(`no method ${method} in cmp`, {cmp: this, data, vars})
        }
        refresh(state,options,ctx) {
            const elem = jb.ui.elemOfCmp(ctx,this.cmpId)
            jb.log('backend uiComp refresh request',{ctx, cmp: this,elem,state,options})
            jb.ui.BECmpsDestroyNotification.next({ cmps: [{cmpId: this.cmpId, ver: this.ver, destroyCtxs: [] }] })
            elem && jb.ui.refreshElem(elem,state,options) // cmpId may be deleted
        }
        runMethodObject(methodObj,data, vars) {
            return methodObj.ctx.setData(data).setVars({
                cmp: this,$state: this.state, $props: this.renderProps, ...vars, ...this.newVars, $model: this.calcCtx.vars.$model
            }).runInner(methodObj.ctx.profile.action,'action','action')
        }
        destroy(reqCtx = {}) {
            (this.method||[]).filter(h=> h.id == 'destroy').forEach(h => this.runMethodObject(h,null,reqCtx.vars))
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
                // ctxId: jb.ui .preserveCtx(ctx),
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
            const comp = ctx.profile && ctx.profile.$ && jb.comps[ctx.profile.$]
            if (comp && (comp.type || '').split(/,|-/).indexOf('control') == -1)
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
                jb.logError('uiComp: no ctx provided for jbExtend',{_options,ctx})
            if (typeof _options != 'object')
                jb.logError('uiComp: _options should be an object',{_options,ctx})
            const options = _options.$ ? ctx.run(_options, 'feature<>') : _options
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
            if (options.cmpId)
                this.cmpId = options.cmpId

            // eventObservables
            this.eventObservables = this.eventObservables.concat(Object.keys(options).filter(op=>op.indexOf('on') == 0))

            jb.asArray(options.featuresOptions || []).filter(x=>x).forEach(f => this.jbExtend(f.$ ? ctx.run(f, 'feature<>') : f , ctx))
            jb.asArray(jb.ui.inStudio() && options.studioFeatures).filter(x=>x).forEach(f => this.jbExtend(ctx.run(f, 'feature<>'), ctx))
            return this;
        }
    }
})

component('uiPlugin.dslDeclarations', {
  type: 'dslDeclaration',
  impl: () => jb.ui.initDslDeclarations()
})
