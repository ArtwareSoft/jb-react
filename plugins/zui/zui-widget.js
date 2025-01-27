dsl('zui')

component('widget', {
  type: 'widget',
  params: [
    {id: 'control', type: 'control', dynamic: true},
    {id: 'screenSizeForTest', as: 'array', defaultValue: [600,600]},
    {id: 'frontEnd', type: 'widget_frontend'},
    {id: 'domain', type: 'domain'},
    {id: 'features', type: 'feature'},
    {id: 'userData', type: 'user_data', defaultValue: userData()},
    {id: 'appData', type: 'app_data', defaultValue: appData()},
  ],
  impl: ctx => {
        const {screenSizeForTest, control, frontEnd, userData, appData, domain, features} = ctx.params
        const ctxToUse = ctx.setVars({userData, appData, domain})
        userData.query = jb.path(domain.sample,'query') || ''
        userData.contextChips = jb.path(domain.sample,'contextChips') || []
        userData.preferedLlmModel = jb.path(domain.sample,'preferedLlmModel') || ''
        appData.suggestedContextChips = jb.path(domain.sample,'suggestedContextChips') || []
        appData.totalCost = '$0.00'
        
        frontEnd.initFE(screenSizeForTest,{userData,appData})
        
        const widget = {
            frontEnd,
            appData,
            async init() {
                const ctxForBe = ctxToUse.setVars({screenSize: frontEnd.screenSize, widget: this})
                const appCmp = control(ctxForBe).applyFeatures(features,20)
                appCmp.init()
                frontEnd.beAppCmpProxy = appCmp // should be jbm and activated by jbm.remoteExec
                await frontEnd.handlePayload(await appCmp.calcPayload())
                //await frontEnd.runBEMethodAndUpdate(appCmp.id,'updateZuiControl',ctx)
                return this
            }
        }
        return widget
    }
})

component('widgetFE', {
  type: 'widget_frontend',
  impl: (ctx) => ({
        cmps: {},
        cmpsData: {},
        renderCounter: 1,
        state: {tCenter: [1,1], tZoom : 2, zoom: 2, center: [1,1], speed: 3, sensitivity: 5},

        initFE(screenSizeForTest,{userData,appData}) {
            this.userData = userData
            this.appData = appData
            this.ctx = new jb.core.jbCtx().setVars({widget: this, canUseConsole: ctx.vars.quiet, uiTest: ctx.vars.uiTest})
            this.screenSize = (!ctx.vars.uiTest && jb.frame.window) ? [window.innerWidth,window.innerHeight] : screenSizeForTest
            this.ctx.probe = ctx.probe
        },
        async runBEMethodAndUpdate(cmpId,method,ctx) { // should use jbm
            const cmp = this.beAppCmpProxy.id == cmpId ? this.beAppCmpProxy : this.beAppCmpProxy.allDescendants().find(x=>x.id == cmpId)
            if (!cmp)
                return jb.logError(`runBEMethodAndUpdate can not find cmp ${cmpId} to run method ${method}`, {ctx})
            const payload = await cmp[method](this.userData)
            await this.handlePayload(payload)        
        },
        BERxSource(cmpId,sourceId,ctx) { // should use jbm
            const cmp = this.beAppCmpProxy.id == cmpId ? this.beAppCmpProxy : this.beAppCmpProxy.allDescendants().find(x=>x.id == cmpId)
            if (!cmp)
                return jb.logError(`runBERxSource can not find cmp ${cmpId} to run source ${sourceId}`, {ctx})
            return cmp.activateDataSource(sourceId)
        },
        async handlePayload(_payload) {
            const payload = _payload.id ? {[_payload.id] : _payload }: _payload
            const ctx = this.ctx
            Object.entries(payload).forEach(([id,be_data]) => {
                jb.log(`zui handlePayload ${id}`,{be_data, ctx})
                if (id == 'userData') {
                    Object.assign(this.userData, be_data)
                } else if (id == 'appData') {
                    Object.assign(this.appData, be_data)
                } else if (this.cmps[id]) {
                    this.cmps[id].handlePayload(ctx.setVars({be_data}))
                } else {
                    this.cmps[id] = newFECmp(id, be_data)
                    this.cmpsData[id] = { ...(this.cmpsData[id] || {}), ...be_data } // for test
                }
            })
            this.renderRequest = true

            function newFECmp(cmpId, be_data) {
                const cmp = new (class FECmp {}) // used for serialization filtering
                const fromBeData = { title, frontEndMethods, layoutProps, detailsLevel, clz, html, templateHtmlItem, css } = be_data
                Object.assign(cmp, { id: cmpId, state: {}, flows: [], vars: be_data.frontEndVars || {}, ...fromBeData })
                if (cmp.html && jb.frame.document) {
                    const temp = document.createElement('div')
                    temp.innerHTML = cmp.html
                    cmp.base = temp.children[0]
                    cmp.base.classList.add(cmp.clz)
                }
                if (cmp.css)
                    jb.zui.setCmpCss(cmp)

                cmp.destroyed = new Promise(resolve=> cmp.resolveDestroyed = resolve)
                jb.zui.runFEMethod(cmp,'calcProps',{silent:true,ctx})
                jb.zui.runFEMethod(cmp,'init',{silent:true,ctx})
                ;(be_data.frontEndMethods ||[]).map(m=>m.method).filter(m=>['init','calcProps'].indexOf(m) == -1)
                    .forEach(method=> {
                        const path = (cmp.frontEndMethods || []).find(x=>x.method == method).path
                        const func = path.split('~').reduce((o,p)=>o && o[p],jb.comps).action
                        cmp[method] = ctx => func(ctx,{...ctx.vars, ...cmp.vars, cmp})
                    })

                cmp.state.frontEndStatus = 'ready'
                return cmp
            }
        }
    })
})

extension('zui', 'frontend', {
    setCmpCss(cmp) {
        jb.zui.setCss(cmp.clz, cmp.css.join('\n'))
    },
    setCssVars(cssClass,cssVars) {
        const cssVarRules = Object.entries(cssVars).map(([key, value]) => `--${key}: ${value};`).join('\n')
        const content = `.${cssClass} { ${cssVarRules} }`
        jb.zui.setCss(`vars-${cssClass}`,content)
    },
    setCss(id,content) {
        const document = jb.frame.document
        if (!document) return
        let styleTag = document.getElementById(id)
        if (!styleTag) {
          styleTag = document.createElement('style')
          styleTag.id = id
          document.head.appendChild(styleTag)
        }
        styleTag.textContent = Array.isArray(content)? content.join('\n') : content
    },
    rxPipeName: profile => (jb.path(profile, '0.event') || jb.path(profile, '0.$') || '') + '...' + jb.path(profile, 'length'),
    runFEMethod(cmp,method,{data,_vars,silent,ctx} = {}) {
        if (cmp.state.frontEndStatus != 'ready' && ['onRefresh','initOrRefresh','init','calcProps'].indexOf(method) == -1)
            return jb.logError('frontend - running method before init', {cmp, method,data,_vars})
        const toRun = (cmp.frontEndMethods || []).filter(x=>x.method == method).sort((p1,p2) => (p1.phase || 0) - (p2.phase ||0))
        if (toRun.length == 0 && !silent)
            return jb.logError(`frontend - no method ${method}`,{cmp})
        let methodResult = null
        toRun.forEach(({path}) => jb.utils.tryWrapper(() => {
            const profile = path.split('~').reduce((o,p)=>o && o[p],jb.comps)
            if (!profile)
                return jb.logError('runFEMethod - can not get profile',{method, path})
            const srcCtx = new jb.core.jbCtx(ctx, { profile, path, forcePath: path })
            const feMEthod = jb.core.run(srcCtx)
            const vars = {cmp, $state: cmp.state, ...cmp.vars, ..._vars }
            const ctxToUse = ctx.setData(data).setVars(vars)
            const {_prop, _flow } = feMEthod.frontEndMethod
            if (_prop)
                jb.log(`frontend before calc prop ${_prop}`,{data, vars, cmp, srcCtx, ...feMEthod.frontEndMethod, ctxToUse})
            else if (_flow)
                jb.log(`frontend start flow ${jb.zui.rxPipeName(_flow)}`,{data, vars, cmp, srcCtx, ...feMEthod.frontEndMethod,  ctxToUse})
            else 
                jb.log(`frontend run method ${method}`,{data, vars, cmp, srcCtx , ...feMEthod.frontEndMethod,ctxToUse})
            methodResult = ctxToUse.run(feMEthod.frontEndMethod.profile, jb.utils.dslType(profile.$$))
            if (_prop)
                jb.log(`frontend prop ${_prop} value`,{methodResult, cmp})
            if (_flow && methodResult) cmp.flows.unshift({flow: methodResult, profile: _flow})
        }, `frontEnd-${method}`,ctx))
        return methodResult
    }
})

component('zui.backEndSource', {
  type: 'rx<>',
  params: [
    {id: 'sourceId', as: 'string'}
  ],
  impl: rx.pipe((ctx,{cmp,widget}, {sourceId}) => widget.BERxSource(cmp.id,sourceId,ctx), rx.switchToLocalVars())
})

component('rx.switchToLocalVars', {
  type: 'rx<>',
  category: 'operator',
  impl: ctx => jb.callbag.map(jb.utils.addDebugInfo(ctx2 => ctx.dataObj(ctx2.data),ctx))
})