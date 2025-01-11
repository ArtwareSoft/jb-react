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
        appData.suggestedContextChips = jb.path(domain.sample,'suggestedContextChips') || []

        frontEnd.initFE(screenSizeForTest,userData)
        
        const widget = {
            frontEnd,
            async init() {
                const ctxForBe = ctxToUse.setVars({screenSize: frontEnd.screenSize, widget: this})
                const appCmp = control(ctxForBe).applyFeatures(features,20)
                appCmp.init()
                await frontEnd.handlePayload(await appCmp.calcPayload())
                frontEnd.beAppCmpProxy = appCmp // should be jbm and activated by jbm.remoteExec
                await frontEnd.runBEMethodAndUpdate(appCmp.id,'updateZuiControl',ctx)
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

        initFE(screenSizeForTest,userData) {
            this.ctx = new jb.core.jbCtx().setVars({widget: this, canUseConsole: ctx.vars.quiet, uiTest: ctx.vars.uiTest, userData})
            this.screenSize = (!ctx.vars.uiTest && jb.frame.window) ? [window.innerWidth,window.innerHeight] : screenSizeForTest
            this.ctx.probe = ctx.probe
        },
        async runBEMethodAndUpdate(cmpId,method,ctx) { // should use jbm
            const cmp = this.beAppCmpProxy.id == cmpId ? this.beAppCmpProxy : this.beAppCmpProxy.allDescendants().find(x=>x.id == cmpId)
            if (!cmp)
                return jb.logError(`runBEMethodAndUpdate can not find cmp ${cmpId} to run method ${method}`, {ctx})
            const payload = await cmp[method](this.ctx.vars.userData)
            await frontEnd.handlePayload(payload)        
        },
        async handlePayload(_payload) {
            const payload = _payload.id ? {[_payload.id] : _payload }: _payload
            const ctx = this.ctx
            Object.entries(payload).map(([id,be_data]) => {
                if (id == 'userData') {
                    this.userData = be_data
                } else if (id == 'appData') {
                    this.appData = be_data
                } else {
                    const cmp = this.cmps[id] = newFECmp(id, be_data)
                    this.cmpsData[id] = { ...(this.cmpsData[id] || {}), ...be_data }
                }
            })
            jb.log('zui handlePayload loaded in FE',{cmpsData: this.cmpsData, payload,ctx})
            // dirty - build itemlist layout calculator only after loading its ancestors
            const layoutTop =  Object.values(this.cmps).find(cmp => cmp.buildLayoutCalculator)
            layoutTop && layoutTop.buildLayoutCalculator(ctx)

            this.renderRequest = true

            function newFECmp(cmpId, be_data) {
                const cmp = new (class FECmp {}) // used for serialization filtering
                const fromBeData = { notReady, title, gridElem, frontEndMethods, layoutProps, renderRole, clz, html, css } = be_data
                Object.assign(cmp, { id: cmpId, state: {}, flows: [], vars: be_data.frontEndVars || {}, ...fromBeData })
                if (cmp.html && jb.frame.document) {
                    if (be_data.containerClass) {
                        const container = document.querySelector(be_data.containerClass)
                        container.classList.add('hidden')
                        setTimeout(() => {
                            container.innerHTML = cmp.html
                            container.classList.remove('hidden')
                        }, 500)
                    } else if (be_data.appCmp && !document.querySelector(`.${cmp.clz}`)) {
                        const temp = document.createElement('div')
                        temp.innerHTML = cmp.html
                        cmp.base = temp.children[0]
                        cmp.base.classList.add(cmp.clz)
                        document.body.appendChild(cmp.base)
                    }
                }
                if (cmp.css)
                    jb.zui.setCmpCss(cmp)

                if (cmp.notReady) return cmp
                cmp.destroyed = new Promise(resolve=> cmp.resolveDestroyed = resolve)
                jb.zui.runFEMethod(cmp,'calcProps',{silent:true,ctx})
                jb.zui.runFEMethod(cmp,'init',{silent:true,ctx})
                ;(be_data.frontEndMethods ||[]).map(m=>m.method).filter(m=>['init','calcProps'].indexOf(m) == -1)
                    .forEach(method=> cmp[method] = ctx => jb.zui.runFEMethod(cmp,method,{silent:true,ctx}))

                cmp.state.frontEndStatus = 'ready'
                return cmp
            }
        },
        renderCmps(ctx) {
            const ctxToUse = this.itemlistCmp.enrichCtxWithItemSize(ctx).setVars({widget: this})
            if (this.ctx.vars.canUseConsole) console.log(this.state.zoom, ...this.state.center)
            Object.values(this.cmps).filter(cmp=>!cmp.notReady && cmp.renderRole !='zoomingGridElem')
                .forEach(cmp=>cmp.render ? cmp.render(ctxToUse) : this.renderCmp(cmp,ctxToUse))
        },
        renderCmp(cmp,ctx) {
            if (cmp.base) {
                if (!this.itemlistCmp.base.querySelector(`.${cmp.clz}`)) this.itemlistCmp.base.appendChild(cmp.base)
                cmp.zoomingCss && cmp.zoomingCss(ctx)
                cmp.base.style.display = 'block'
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
