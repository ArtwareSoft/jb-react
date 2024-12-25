dsl('zui')

component('widget', {
  type: 'widget',
  params: [
    {id: 'control', type: 'control', dynamic: true},
    {id: 'canvasSizeForTest', as: 'array', defaultValue: [600,600]},
    {id: 'frontEnd', type: 'widget_frontend'},
    {id: 'features', type: 'feature' }
  ],
  impl: ctx => {
        const {canvasSizeForTest, control, frontEnd, features} = ctx.params
        frontEnd.initFE(canvasSizeForTest)
        
        const widget = {
            frontEnd,
            async init() {
                const ctxForBe = ctx.setVars({canvasSize: frontEnd.canvasSize, widget: this, renderRole: 'fixed'})
                const beCmp = this.be_cmp = control(ctxForBe).applyFeatures(features,20)
                beCmp.init({topOfWidget: true})

                const _payload = await beCmp.calcPayload(beCmp)
                const payload = _payload.id ? {[_payload.id] : _payload }: _payload
                const beCmps = beCmp.allDescendants()
                await frontEnd.handlePayload(payload)
                frontEnd.beProxy = {
                    async beUpdateRequest(cmpIds) {
                        const updatePayload = {}
                        await cmpIds.reduce((pr,id) => pr.then(
                            async () => updatePayload[id] = await beCmps.find(cmp=>cmp.id==id).calcPayload()), Promise.resolve())
                        await frontEnd.handlePayload(updatePayload)
                    }
                }
            },
        }
        return widget
    }
})

component('app', {
    type: 'application',
    params: [
      {id: 'selector', as: 'string', defaultValue: 'body'},
    ],
    impl: (ctx, selector) => ({
        init(appSize) {
            if (!ctx.vars.uiTest && jb.frame.document) {
                jb.zui.setCss('app',`html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }`)
                const doc = jb.frame.document
                // const appElem = jb.frame.document.createElement('div')
                // app.innerHtml = 
                const canvas = doc.createElement('div')
                canvas.classList.add('widget-top')
                canvas.style.width = '100vw'
                canvas.style.height = '100vh'
                doc.querySelector(selector).appendChild(canvas)
                const rect = canvas.getBoundingClientRect()
                return { canvas, canvasSize: [rect.width, rect.height] }
            }
        }
        
    })
})

component('widgetFE', {
  type: 'widget_frontend',
  params: [
    {id: 'app', type: 'application', defaultValue: app() },
  ],
  impl: (ctx, app) => ({
        cmps: {},
        cmpsData: {},
        renderCounter: 1,
        state: {tCenter: [1,1], tZoom : 2, zoom: 2, center: [1,1]},

        initFE(canvasSizeForTest) {
            if (!ctx.vars.uiTest && jb.frame.document) {
                const {canvas,canvasSize} = app.init()
                this.canvas = canvas
                this.canvasSize = canvasSize
            } else {
                this.canvasSize = canvasSizeForTest
            }
            this.ctx = new jb.core.jbCtx().setVars({widget: this, canUseConsole: ctx.vars.quiet, uiTest: ctx.vars.uiTest})
            this.ctx.probe = ctx.probe
        },
        async handlePayload(payload) {
            const ctx = this.ctx
            Object.entries(payload).map(([cmpId,be_data]) => {
                const cmp = this.cmps[cmpId] = newFECmp(cmpId, be_data, this.canvas, this.canvas)
                this.cmpsData[cmpId] = { ...(this.cmpsData[cmpId] || {}), ...be_data }
                if (cmp.html && jb.frame.document) {
                    const temp = jb.frame.document.createElement('div')
                    temp.innerHTML = cmp.html
                    cmp.el = temp.children[0]
                }
                if (cmp.css)
                    jb.zui.setCmpCss(cmp)
            })
            jb.log('zui handlePayload loaded in FE',{cmpsData: this.cmpsData, payload,ctx})
            // dirty - build itemlist layout calculator only after loading its ancestors
            const layoutTop =  Object.values(this.cmps).find(cmp => cmp.buildLayoutCalculator)
            layoutTop && layoutTop.buildLayoutCalculator(ctx)

            this.renderRequest = true

            function newFECmp(cmpId, be_data, canvas) {
                const cmp = new (class FECmp {}) // used for serialization filtering
                const fromBeData = { notReady, title, gridElem, frontEndMethods, layoutProps, renderRole, clz, html, css } = be_data
                Object.assign(cmp, { id: cmpId, state: {}, flows: [], base: canvas, vars: be_data.frontEndVars || {}, ...fromBeData })
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
            if (this.ctx.vars.canUseConsole) console.log(this.state.zoom, ...this.state.center)
            Object.values(this.cmps).filter(cmp=>!cmp.notReady && !cmp.flowElem && cmp.renderRole !='zoomingGridElem')
                .forEach(cmp=>cmp.render ? cmp.render(this.ctx) : this.renderCmp(cmp,this.ctx))
        },        
        renderCmp(cmp,ctx) {
            const { itemlistCmp } = ctx.vars
            if (cmp.el && itemlistCmp) {
                if (!itemlistCmp.el.querySelector(`.${cmp.clz}`)) itemlistCmp.el.appendChild(cmp.el)
                cmp.zoomingCss && cmp.zoomingCss(ctx)
                cmp.el.style.display = 'block'
            }
        }
    })
})

extension('zui','html', {
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
})

extension('zui', 'frontend', {
    rxPipeName: profile => (jb.path(profile, '0.event') || jb.path(profile, '0.$') || '') + '...' + jb.path(profile, 'length'),
    runFEMethod(cmp,method,{data,_vars,silent,ctx} = {}) {
        if (cmp.state.frontEndStatus != 'ready' && ['onRefresh','initOrRefresh','init','calcProps'].indexOf(method) == -1)
            return jb.logError('frontend - running method before init', {cmp, method,data,_vars})
        const toRun = (cmp.frontEndMethods || []).filter(x=>x.method == method).sort((p1,p2) => (p1.phase || 0) - (p2.phase ||0))
        if (toRun.length == 0 && !silent)
            return jb.logError(`frontend - no method ${method}`,{cmp})
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
            const res = ctxToUse.run(feMEthod.frontEndMethod.action, jb.utils.dslType(profile.$$))
            if (_prop)
                jb.log(`frontend prop ${_prop} value`,{res, cmp})
            if (_flow && res) cmp.flows.unshift({flow: res, profile: _flow})
        }, `frontEnd-${method}`,ctx))
    }
})

component('session', {
    type: 'session',
    params: [
      {id: 'query', as: 'string'},
      {id: 'contextCrums', as: 'array'},
      {id: 'budget', type: 'budget'},
      {id: 'usage', type: 'usage' }
    ]
})