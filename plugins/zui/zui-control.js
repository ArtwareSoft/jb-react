extension('zui','control' , {
    initExtension() { return {  fCounter: 0, cmpCounter: 1,  } },
    typeRules: [
        { isOfWhenEndsWith: ['feature<zui>','feature<zui>'] },
        { isOfWhenEndsWith: ['style<zui>',['feature<zui>', 'style<zui>' ]] }
    ],    
    ctrl(origCtx,featuresProfile) {
        const ctxBefore = origCtx.setVars({ $model: { ctx: origCtx, ...origCtx.params} })
        const cmp = new jb.zui.BeComp(ctxBefore)
        const ctx = ctxBefore.setVars({cmp})
        cmp.ctx = ctx
        applyFeatures(featuresProfile)
        applyFeatures(origCtx.params.style && origCtx.params.style(ctx))
        jb.path(ctx.params.features,'profile') && applyFeatures(ctx.params.features(ctx), 10)
        cmp.applyFeatures = applyFeatures
        return cmp

        function applyFeatures(featuresProfile, priority = 0) {
            if (!featuresProfile) return cmp
            if (typeof featuresProfile != 'object')
                jb.logError('zui comp: featuresProfile should be an object',{featuresProfile,ctx})
            const feature = featuresProfile.$ ? ctx.run(featuresProfile, 'feature<>') : featuresProfile
            if (Array.isArray(feature)) {
                feature.forEach(f=>applyFeatures(f,priority))
                return cmp
            }

            const categories = jb.zui.featureCategories || (jb.zui.featureCategories = {
                lifeCycle: new Set('init,extendCtx,extendChildrenCtx,destroy'.split(',')),
                arrayProps: new Set('calcProp,frontEndMethod,frontEndVar,css,cssClass,layoutProp'.split(',')),
                singular: new Set('calcMoreItemsData,zoomingSize,zoomingCss,styleParams,children,html,htmlOfItem'.split(',')),
            })
    
            Object.keys(feature).filter(key=>key!='srcPath').forEach(key=>{
                if (typeof feature[key] == 'function')
                    Object.defineProperty(feature[key], 'name', { value: key })
                if (feature.srcPath) feature[key].srcPath = feature.srcPath
                feature[key].priority = Math.max(feature[key].priority || 0, priority)
    
                if (categories.lifeCycle.has(key)) {
                    cmp[key+'Funcs'] = cmp[key+'Funcs'] || []
                    cmp[key+'Funcs'].push(feature[key])
                } else if (categories.arrayProps.has(key)) {
                    cmp[key] = cmp[key] || []
                    cmp[key].push(feature[key])
                } else if (categories.singular.has(key)) {
                    cmp[key] && jb.logError(`zui applyFeatures - redefine singular feature ${key}`, {feature, ctx})
                    cmp[key] = feature[key] || cmp[key]
                } else {
                    jb.logError(`zui applyFeatures - unknown feature ${key}`, {feature, ctx})
                }
            })
    
            applyFeatures(feature.featuresOptions,priority)
            return cmp
        }
    },
    BeComp : class BeComp {
        constructor(ctx) {
            this.id = '' + jb.zui.cmpCounter++
            this.title = `${ctx.profile.$}-${this.id}`
            this.clz = this.title
        }
        init(settings) {
            Object.assign(this,settings || {}) 
            const sortedExtendCtx = (this.extendCtxFuncs || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            this.ctx = sortedExtendCtx.reduce((accCtx,extendCtx) => jb.utils.tryWrapper(() => 
                extendCtx.setVar(accCtx),'extendCtx',this.ctx), this.ctx)
            this.props = {}
            this.calcCtx = this.ctx.setVars({$props: this.props })
            const { inZoomingGrid, renderRole } = this.ctx.vars
            ;['inZoomingGrid', 'renderRole'].forEach(p=>this[p]=this.ctx.vars[p])

            const sortedInit = (this.initFuncs || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            sortedInit.forEach(init=>jb.utils.tryWrapper(() => init.action(this.calcCtx),'init', this.ctx))
            
            // assign all layout props directly into cmp
            this.layoutProps = (this.layoutProp||[]).reduce((acc,obj) => ({...acc,...obj}), {})
            //Object.assign(this, this.zoomingSize || {}, this.layoutProps, {zoomingSizeProfile: jb.path(this.zoomingSize,'profile')})
            this.zoomingSizeProfile = jb.path(this.zoomingSize,'profile')
            const childrenCtx = (this.extendChildrenCtxFuncs || []).reduce((accCtx,extendChildrenCtx) => jb.utils.tryWrapper(() => 
                extendChildrenCtx.setVar(accCtx),'extendChildrenCtx',this.ctx), this.ctx)

            if (!Array.isArray(this.children) && this.children)
                this.children = this.children(childrenCtx).map(cmp =>cmp.init())

            return this
        }
        descendantsTillGrid() {
            return (this.children||[]).filter(cmp=>!cmp.extendedPayloadWithDescendants).reduce((acc,cmp) => [...acc,cmp,...cmp.descendantsTillGrid()], [])
        }
        allDescendants() {
            return (this.children||[]).reduce((acc,cmp) => [...acc,cmp,...cmp.allDescendants()], [])
        }
        valByScale(pivotId,item) {
            return this.pivot.find(({id}) => id == pivotId).scale(item)
        }
        
        async calcPayload(vars) {
            if (this.ctx.probe && this.ctx.probe.outOfTime) return {}
            if (!this.props)
                return jb.logError(`glPayload - cmp ${this.title} not initialized`,{cmp: this, ctx: cmp.ctx})
            if (this.enrichPropsFromDecendents)
                vars = {...vars, ...await this.enrichPropsFromDecendents(this.descendantsTillGrid())}
            if (this.enrichCtxFromDecendents)
                vars = {...vars, ...await this.enrichCtxFromDecendents(this.descendantsTillGrid()) }

            const ctxToUse = vars ? this.calcCtx.setVars(vars) : this.calcCtx
            ;[...(this.calcProp || []),...(this.method || [])].forEach(p=>typeof p.value == 'function' && Object.defineProperty(p.value, 'name', { value: p.id }))    
            const sortedProps = (this.calcProp || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            await sortedProps.reduce((pr,prop)=> pr.then(async () => {
                    const val = jb.val( await jb.utils.tryWrapper(async () => 
                        prop.value.profile === null ? ctxToUse.vars.$model[prop.id] : await prop.value(ctxToUse),`prop:${prop.id}`,this.ctx))
                    const value = val == null ? prop.defaultValue : val
                    Object.assign(this.props, { ...(prop.id == '$props' ? value : { [prop.id]: value })})
                }), Promise.resolve())
            Object.assign(this.props, this.styleParams)
            
            const methods = (this.method||[]).map(h=>h.id).join(',')
            const frontEndMethods = (this.frontEndMethod || []).map(h=>({method: h.method, path: h.path}))
            const frontEndVars = this.frontEndVar && jb.objFromEntries(this.frontEndVar.map(h=>[h.id, jb.val(h.value(ctxToUse))]))
            const noOfItems = (ctxToUse.vars.items||[]).length

            const zoomingCssProfile = jb.path(this.zoomingCss,'profile')
            this.calcHtmlOfItem = item => this.htmlOfItem ? this.htmlOfItem(ctxToUse.setVars({item}).setData(item)) : ''
            const html = this.html && this.html(ctxToUse)
            const css = (this.css || []).flatMap(x=>x(ctxToUse))

            const { id , title, layoutProps, inZoomingGrid, renderRole, zoomingSizeProfile, topOfWidget, clz } = this
            let res = { id, title, frontEndMethods, frontEndVars, topOfWidget, noOfItems, methods, zoomingCssProfile,  html, css, clz,
                zoomingSizeProfile, layoutProps, inZoomingGrid, renderRole }
            if (JSON.stringify(res).indexOf('null') != -1)
                jb.logError(`cmp ${this.title} has nulls in payload`, {cmp: this, ctx: this.ctx})
            if (this.children)
                res.childrenIds = this.children.map(({id})=>id).join(',')

            return this.extendedPayloadWithDescendants ? this.extendedPayloadWithDescendants(res,this.descendantsTillGrid()) : res
        }
        runBEMethod(method, data, vars, options = {}) {
            const {doNotUseUserReqTx, dataMethod, userReqTx} = options
            jb.log(`backend uiComp method ${method}`, {cmp: this,data,vars,doNotUseUserReqTx, dataMethod, userReqTx})
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
        runMethodObject(methodObj,data, vars) {
            return methodObj.ctx.setData(data).setVars({
                cmp: this, $props: this.props, ...vars, ...this.newVars, $model: this.calcCtx.vars.$model
            }).runInner(methodObj.ctx.profile.action,'action','action')
        }
    }
})