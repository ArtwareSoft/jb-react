jb.extension('ui', 'frontend', {
    refreshFrontEnd(elem) {
        jb.ui.findIncludeSelf(elem,'[interactive]').forEach(el=> el._component ? el._component.newVDomApplied() : jb.ui.mountFrontEnd(el))
    },
    mountFrontEnd(elem, keepState) {
        new jb.ui.frontEndCmp(elem, keepState)
    },
    frontEndCmp: class frontEndCmp {
        constructor(elem, keepState) {
            this.ctx = jb.ui.parents(elem,{includeSelf: true}).map(elem=>elem.ctxForFE).filter(x=>x)[0] || new jb.core.jbCtx()
            this.state = { ...elem.state, ...(keepState && jb.path(elem._component,'state')), frontEndStatus: 'initializing' }
            this.base = elem
            this.cmpId = elem.getAttribute('cmp-id')
            this.ver= elem.getAttribute('cmp-ver')
            this.pt = elem.getAttribute('cmp-pt')
            this.destroyed = new Promise(resolve=>this.resolveDestroyed = resolve)
            this.flows= []
            elem._component = this
            this.runFEMethod('calcProps',null,null,true)
            this.runFEMethod('init',null,null,true)
            ;(elem.getAttribute('eventhandlers') || '').split(',').forEach(h=>{
                const [event,ctxId] = h.split('-')
                elem.addEventListener(event, ev => jb.ui.handleCmpEvent(ev,ctxId))
            })
            this.state.frontEndStatus = 'ready'
        }
        runFEMethod(method,data,_vars,silent) {
            if (this.state.frontEndStatus != 'ready' && ['init','calcProps'].indexOf(method) == -1)
                return jb.logError('frontEnd - running method before init', {cmp: {...this}, method,data,_vars})
            const toRun = (this.base.frontEndMethods || []).filter(x=>x.method == method)
            if (toRun.length == 0 && !silent)
                return jb.logError(`frontEnd - no method ${method}`,{cmp: {...this}})
            toRun.forEach(({path}) => jb.utils.tryWrapper(() => {
                const profile = path.split('~').reduce((o,p)=>o[p],jb.comps)
                const srcCtx = new jb.core.jbCtx(this.ctx, { profile, path, forcePath: path })
                const feMEthod = jb.core.run(srcCtx)
                const el = this.base
                const vars = {cmp: this, $state: this.state, el, ...this.base.vars, ..._vars }
                const ctxToUse = this.ctx.setData(data).setVars(vars)
                const {_prop, _flow } = feMEthod.frontEndMethod
                if (_prop)
                    jb.log(`frontend uiComp calc prop ${_prop}`,{cmp: {...this}, srcCtx, ...feMEthod.frontEndMethod, el,ctxToUse})
                else if (_flow)
                    jb.log(`frontend uiComp start flow ${jb.ui.rxPipeName(_flow)}`,{cmp: {...this}, srcCtx, ...feMEthod.frontEndMethod, el, ctxToUse})
                else 
                    jb.log(`frontend uiComp run method ${method}`,{cmp: {...this}, srcCtx , ...feMEthod.frontEndMethod,el,ctxToUse})
                const res = ctxToUse.run(feMEthod.frontEndMethod.action)
                if (_flow) this.flows.push(res)
            }, `frontEnd-${method}`,this.ctx))
        }
        enrichUserEvent(ev, userEvent) {
            (this.base.frontEndMethods || []).filter(x=>x.method == 'enrichUserEvent').map(({path}) => jb.utils.tryWrapper(() => {
                const actionPath = path+'~action'
                const profile = actionPath.split('~').reduce((o,p)=>o[p],jb.comps)
                const vars = {cmp: this, $state: this.state, el: this.base, ...this.base.vars, ev, userEvent }
                Object.assign(userEvent, jb.core.run( new jb.core.jbCtx(this.ctx, { vars, profile, path: actionPath })))
            }, 'enrichUserEvent',this.ctx))
        }
        refresh(state, options) {
            jb.log('frontend uiComp refresh request',{cmp: {...this} , state, options})
            if (this._deleted) return
            Object.assign(this.state, state)
            this.base.state = this.state
            ui.refreshElem(this.base,this.state,options)
        }
        refreshFE(state) {
            if (this._deleted) return
            Object.assign(this.state, state)
            this.base.state = this.state
            this.runFEMethod('onRefresh',null,null,true)
        }    
        newVDomApplied() {
            Object.assign(this.state,{...this.base.state}) // update state from BE
            this.ver= this.base.getAttribute('cmp-ver')
            this.runFEMethod('onRefresh',null,null,true)
        }
        destroyFE() {
            this._deleted = true
            this.flows.forEach(flow=>flow.dispose())
            this.runFEMethod('destroy',null,null,true)
            this.resolveDestroyed() // notifications to takeUntil(this.destroyed) observers
        }
    }
})

