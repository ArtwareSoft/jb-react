extension('ui', 'frontend', {
    async refreshFrontEnd(elem, {content, emulateFrontEndInTest, widgetId} = {}) {
        if (jb.ui.isHeadless(elem)) return
        if (!(elem instanceof jb.ui.VNode)) {
            const libs = jb.utils.unique(jb.ui.feLibs(content))
            if (libs.length) {
                jb.ui.addClass(elem,'jb-loading-libs')
                await jb.ui.loadFELibsDirectly(libs)
                jb.ui.removeClass(elem,'jb-loading-libs')
            }
        }
        jb.ui.findIncludeSelf(elem,'[interactive]').forEach(el=> {
            const coLocation = jb.ui.parents(el,{includeSelf: true}).find(_elem=>_elem.getAttribute && _elem.getAttribute('colocation') == 'true')
            const coLocationCtx = coLocation && jb.ui.cmps[el.getAttribute('cmp-id')].calcCtx
            return el._component ? el._component.newVDomApplied(content) : new jb.ui.frontEndCmp(el,{coLocationCtx, emulateFrontEndInTest, widgetId}) 
        })
    },
    feLibs(elem) {
        if (!elem || typeof elem != 'object') return []
        const res = (elem.attributes && elem.attributes.$__frontEndLibs) ? JSON.parse(elem.attributes.$__frontEndLibs) : []
        const children = jb.path(elem.children,'toAppend') || (Array.isArray(elem.children) ? elem.children : [])
        return [...res, ...(children.flatMap(x =>jb.ui.feLibs(x)))]
        //return Object.keys(obj).filter(k=> ['parentNode','attributes'].indexOf(k) == -1).flatMap(k =>jb.ui.feLibs(obj[k]))
    },
    frontEndCmp: class frontEndCmp {
        constructor(elem, {coLocationCtx, emulateFrontEndInTest, widgetId}= {}) {
            this.ctx = coLocationCtx || jb.ui.parents(elem,{includeSelf: true}).map(elem=>elem.ctxForFE).filter(x=>x)[0] || new jb.core.jbCtx()
            if (emulateFrontEndInTest)
                this.ctx = this.ctx.setVars({emulateFrontEndInTest, widgetId, uiTest: elem.getAttribute('uiTest')})
            this.state = { ...elem.state, frontEndStatus: 'initializing' }
            this.base = elem
            this.cmpId = elem.getAttribute('cmp-id')
            this.ver= elem.getAttribute('cmp-ver')
            this.pt = elem.getAttribute('cmp-pt')
            this.destroyed = new Promise(resolve=>this.resolveDestroyed = resolve)
            this.flows= []
            elem._component = this
            this.runFEMethod('calcProps',null,null,true)
            this.runFEMethod('init',null,null,true)
            this.runFEMethod('initOrRefresh',null,{FELifeCycle: 'constructor'},true)
            this.state.frontEndStatus = 'ready'
            this.props = coLocationCtx && this.ctx.vars.$props
        }
        runFEMethod(method,data,_vars,silent) {
            if (this.state.frontEndStatus != 'ready' && ['onRefresh','initOrRefresh','init','calcProps'].indexOf(method) == -1)
                return jb.logError('frontend - running method before init', {cmp: {...this}, method,data,_vars})
            const toRun = (this.base.frontEndMethods || []).filter(x=>x.method == method).sort((p1,p2) => (p1.phase || 0) - (p2.phase ||0))
            if (toRun.length == 0 && !silent)
                return jb.logError(`frontend - no method ${method}`,{cmp: {...this}})
            toRun.forEach(({path}) => jb.utils.tryWrapper(() => {
                const profile = path.split('~').reduce((o,p)=>o && o[p],jb.comps)
                if (!profile)
                    return jb.logError('runFEMethod - can not get profile',{method, path})
                const srcCtx = new jb.core.jbCtx(this.ctx, { profile, path, forcePath: path })
                const feMEthod = jb.core.run(srcCtx)
                const el = this.base
                const vars = {cmp: this, $state: this.state, el, ...this.base.vars, ..._vars }
                const ctxToUse = this.ctx.setData(data).setVars(vars)
                const {_prop, _flow } = feMEthod.frontEndMethod
                if (_prop)
                    jb.log(`frontend before calc prop ${_prop}`,{data, vars, cmp: {...this}, srcCtx, ...feMEthod.frontEndMethod, el,ctxToUse})
                else if (_flow)
                    jb.log(`frontend start flow ${jb.ui.rxPipeName(_flow)}`,{data, vars, cmp: {...this}, srcCtx, ...feMEthod.frontEndMethod, el, ctxToUse})
                else 
                    jb.log(`frontend run method ${method}`,{data, vars, cmp: {...this}, srcCtx , ...feMEthod.frontEndMethod,el,ctxToUse})
                const res = ctxToUse.run(feMEthod.frontEndMethod.action, jb.utils.dslType(profile.$$))
                if (_prop)
                    jb.log(`frontend prop ${_prop} value`,{res, cmp: {...this}})
                if (_flow && res) this.flows.unshift({flow: res, profile: _flow})
            }, `frontEnd-${method}`,this.ctx))
        }
        enrichUserEvent(ev, {userEvent , ctx}) {
            (this.base.frontEndMethods || []).filter(x=>x.method == 'enrichUserEvent').map(({path}) => jb.utils.tryWrapper(() => {
                const actionPath = path+'~action'
                const profile = actionPath.split('~').reduce((o,p)=>o && o[p],jb.comps)
                if (!profile)
                    return jb.logError('enrichUserEvent - can not get profile',{method, path})
                const vars = {cmp: this, $state: this.state, el: this.base, ...this.base.vars, ev, userEvent }
                Object.assign(userEvent, jb.core.run( new jb.core.jbCtx(ctx || this.ctx, { vars, profile, path: actionPath })))
            }, 'enrichUserEvent', ctx || this.ctx))
        }
        refresh(state, options) {
            jb.log('frontend refresh request',{cmp: {...this} , state, options})
            if (this._deleted) return
            Object.assign(this.state, state)
            this.base.state = this.state
            jb.ui.refreshElem(this.base,this.state,options)
        }
        refreshFE(state) {
            if (this._deleted) return
            Object.assign(this.state, state)
            this.base.state = this.state
            this.state.frontEndStatus = 'refreshing'
            this.runFEMethod('initOrRefresh',null,{FELifeCycle: 'refreshFE'},true)
            this.runFEMethod('onRefresh',null,null,true)
            this.state.frontEndStatus = 'ready'
        }    
        newVDomApplied(vdom) {
            Object.assign(this.state,{...this.base.state}) // update state from BE
            jb.log('frontend newVDomApplied',{cmp: this,ctx: this.ctx,vdom})
            this.ver= this.base.getAttribute('cmp-ver')
            this.state.frontEndStatus = 'refreshing'
            this.runFEMethod('initOrRefresh',null,{FELifeCycle: 'newVDomApplied'},true)
            this.runFEMethod('onRefresh',null,null,true)
            this.state.frontEndStatus = 'ready'
        }
        destroyFE() {
            jb.log(`frontend destroy`,{cmp: {...this}, ctx: this.ctx})
            this._deleted = true
            this.flows.forEach(({flow, profile})=> {
                flow.dispose()
                jb.log(`frontend end flow ${jb.ui.rxPipeName(profile)}`,{cmp: {...this}, ctx: this.ctx})
            })
            this.runFEMethod('destroy',null,null,true)
            this.resolveDestroyed() // notifications to takeUntil(this.destroyed) observers
        }
    }
})

