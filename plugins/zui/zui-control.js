
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
                arrayProps: new Set('calcProp,glAtt,uniform,varying,pivot,shaderDecl,shaderMainSnippet,vertexDecl,vertexMainSnippet,frontEndUniform,frontEndMethod,frontEndVar,css,cssClass,layoutProp,dependent'.split(',')),
                singular: new Set('calcMoreItemsData,zoomingSize,styleParams,children'.split(',')),
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
            this.childIndex = this.childIndex || 0
            const childrenCtx = (this.extendChildrenCtxFuncs || []).reduce((accCtx,extendChildrenCtx) => jb.utils.tryWrapper(() => 
                extendChildrenCtx.setVar(accCtx),'extendChildrenCtx',this.ctx), this.ctx)

            if (!Array.isArray(this.children) && this.children)
                this.children = this.children(childrenCtx).map((cmp,childIndex) =>cmp.init({childIndex}))

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
                vars = await this.enrichPropsFromDecendents(this.descendantsTillGrid())

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
            
            const glVars = this.glVars = mergeGlVars({
                glAtts: (this.glAtt || []).flatMap(att=> flatMapAtt(att)).map(att=> ({...att, calc: undefined, ar: att.calc(ctxToUse)})),
                uniforms: (this.uniform || []).flatMap(u=>flatMapUniform(u)).map(uniform=>({...uniform,
                    ...(typeof uniform.glVar == 'function' ? {glVar: uniform.glVar(ctxToUse)} : {}),
                    ...(uniform.imageF ? {...uniform.imageF(ctxToUse), imageF: undefined} : { value: uniform.val(ctxToUse), val: undefined })
                 })),
                varyings: (this.varying || []).flatMap(v=>v)
            })
            const vertexDecls = (this.vertexDecl || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index)).map(x=>x.code(ctxToUse))
            const shaderDecls = (this.shaderDecl || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index)).map(x=>x.code(ctxToUse))
            const vertexMainSnippets = (this.vertexMainSnippet || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index)).map(x=>x.code(ctxToUse))
            const shaderMainSnippets = (this.shaderMainSnippet || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index)).map(x=>x.code(ctxToUse))

            const glCode = [calcVertexCode(glVars,vertexDecls,vertexMainSnippets,this.title), calcShaderCode(glVars,shaderDecls,shaderMainSnippets,this.title)]
            const methods = (this.method||[]).map(h=>h.id).join(',')
            const frontEndMethods = (this.frontEndMethod || []).map(h=>({method: h.method, path: h.path}))
            const frontEndUniforms = (this.frontEndUniform || [])
            const frontEndVars = this.frontEndVar && jb.objFromEntries(this.frontEndVar.map(h=>[h.id, jb.val(h.value(ctxToUse))]))
            const noOfItems = (ctxToUse.vars.items||[]).length
            // this.sizeProps = {
            //     margin : glVars.uniforms.filter(u=>u.glVar == 'margin').map(u=>u.value)[0] || [0,0,0,0],
            //     borderWidth : glVars.uniforms.filter(u=>u.glVar == 'borderWidth').map(u=>u.value)[0] || [0,0,0,0],
            //     padding : glVars.uniforms.filter(u=>u.glVar == 'padding').map(u=>u.value)[0] || [0,0,0,0],
            //     size : glVars.uniforms.filter(u=>u.glVar == 'elemSize').map(u=>u.value)[0] || [0,0]
            // }
            const { id , title, layoutProps, inZoomingGrid, renderRole, zoomingSizeProfile, topOfWidget } = this
            let res = { id, title, ...glVars, glCode, frontEndMethods, frontEndVars, frontEndUniforms,
                topOfWidget, noOfItems, methods, zoomingSizeProfile, layoutProps, inZoomingGrid, renderRole }
            if (JSON.stringify(res).indexOf('null') != -1)
                jb.logError(`cmp ${this.title} has nulls in payload`, {cmp: this, ctx: this.ctx})
            if (this.children)
                res.childrenIds = this.children.map(({id})=>id).join(',')

            const supportedVars = Object.keys(varsInFeatures(glVars))
            ;(this.dependent||[]).forEach(({glVars,feature})=> {
                const unsupported = glVars.filter(v=> !supportedVars.includes(v))
                if (unsupported.length > 0)
                    jb.logError(`zui unsupported vars ${unsupported.join(',')}`, {feature, ctx: ctxToUse})
            })

            return this.extendedPayloadWithDescendants ? this.extendedPayloadWithDescendants(res,this.descendantsTillGrid()) : res

            function flatMapAtt(att) {
                return att.composite ? att.atts(ctxToUse).flatMap(att=>flatMapAtt(att)) : att
            }
            function flatMapUniform(u) {
                return u.composite ? u.uniforms.flatMap(u=>flatMapUniform(u)) : u
            }
            function calcVertexCode({uniforms,varyings,glAtts},declarations,mainSnippests,title) {
                return [
                    'precision highp float;\nprecision mediump int;',
                    ...uniforms.map(({glType,glVar,vecSize}) => `uniform ${glType} ${glVar}${vecSize ? `[${vecSize}]` : ''};`),
                    ...varyings.map(({glType,glVar}) => `varying ${glType} ${glVar};`),
                    ...glAtts.map(({glType,glVar}) => `attribute ${glType} _${glVar};varying ${glType} ${glVar};`),
                    ...declarations,
                    `\nvoid main() { // vertex ${title}`,
                    ...glAtts.map(({glType,glVar}) => `${glVar} = _${glVar};`),
                    ...mainSnippests,
                    ...varyings.map(({glVar,glCode}) => `${glVar} = ${glCode};`),
                    '}'
                  ].join('\n')
            }
            function calcShaderCode({uniforms,varyings,glAtts},declarations,mainSnippests,title) {
                return [
                    'precision highp float;\nprecision mediump int;',
                    ...uniforms.map(({glType,glVar,vecSize}) => `uniform ${glType} ${glVar}${vecSize ? `[${vecSize}]` : ''};`),
                    ...varyings.map(({glType,glVar}) => `varying ${glType} ${glVar};`),
                    ...glAtts.map(({glType,glVar}) => `varying ${glType} ${glVar};`),
                    ...declarations,
                    `\nvoid main() { // shader ${title}`,
                    ...mainSnippests,
                    '}'
                  ].join('\n')
            }
            function varsInFeatures({glAtts,uniforms,varyings}) {
                const glVars = {}
                ;[...glAtts.map(x=>({...x,glAtt: true})),...uniforms.map(x=>({...x, uniform: true})),...varyings]
                    .forEach(obj=>{ glVars[obj.glVar] = glVars[obj.glVar] || []; glVars[obj.glVar].push(obj )})
                return glVars
            }
            function mergeGlVars({glAtts,uniforms,varyings}) {
                const glVars = varsInFeatures({glAtts,uniforms,varyings})
                const filtered = Object.values(glVars).map(objs => {
                    if (objs.length == 1) return objs[0]
                    // sort by attribute/varying and then index
                    return objs.map((obj,index)=>({...obj,imp: obj.uniform ? 0 : 100,index}))
                        .sort((y,x) => x.imp - y.imp + x.index - y.index)[0]
                })
                
                {
                    const glAtts = [], uniforms = [],varyings = []
                    filtered.forEach(obj=>obj.glAtt ? glAtts.push(obj): obj.uniform ? uniforms.push(obj) : varyings.push(obj))
                    return {glAtts,uniforms,varyings}
                }
            }
        }
        findGlVar(glVar) {
            return [...this.glVars.uniforms,...this.glVars.glAtts].find(u=>u.glVar == glVar)
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