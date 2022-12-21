jb.extension('ui', 'frontend', {
    refreshFrontEnd(elem, {content} = {}) {
        jb.treeShake.loadFELibsDirectly(jb.ui.feLibs(content)).then(()=> 
            jb.ui.findIncludeSelf(elem,'[interactive]').forEach(el=> {
                const coLocation = jb.ui.parents(elem,{includeSelf: true}).find(elem=>elem.getAttribute && elem.getAttribute('colocation') == 'true')
                const coLocationCtx = coLocation && jb.ctxDictionary[elem.getAttribute('jb-ctx')]
                return el._component ? el._component.newVDomApplied() : new jb.ui.frontEndCmp(el,coLocationCtx) 
            }))
    },
    feLibs(obj) {
        if (!obj || typeof obj != 'object') return []
        if (obj.attributes && obj.attributes.$__frontEndLibs) 
            return JSON.parse(obj.attributes.$__frontEndLibs)
        return Object.keys(obj).filter(k=> ['parentNode','attributes'].indexOf(k) == -1).flatMap(k =>jb.ui.feLibs(obj[k]))
    },
    frontEndCmp: class frontEndCmp {
        constructor(elem, coLocationCtx) {
            this.ctx = jb.ui.parents(elem,{includeSelf: true}).map(elem=>elem.ctxForFE).filter(x=>x)[0] || coLocationCtx || new jb.core.jbCtx()
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
                    jb.log(`frontend uiComp calc prop ${_prop}`,{cmp: {...this}, srcCtx, ...feMEthod.frontEndMethod, el,ctxToUse})
                else if (_flow)
                    jb.log(`frontend uiComp start flow ${jb.ui.rxPipeName(_flow)}`,{cmp: {...this}, srcCtx, ...feMEthod.frontEndMethod, el, ctxToUse})
                else 
                    jb.log(`frontend uiComp run method ${method}`,{cmp: {...this}, srcCtx , ...feMEthod.frontEndMethod,el,ctxToUse})
                const res = ctxToUse.run(feMEthod.frontEndMethod.action)
                if (_flow && res) this.flows.push(res)
            }, `frontEnd-${method}`,this.ctx))
        }
        enrichUserEvent(ev, userEvent) {
            (this.base.frontEndMethods || []).filter(x=>x.method == 'enrichUserEvent').map(({path}) => jb.utils.tryWrapper(() => {
                const actionPath = path+'~action'
                const profile = actionPath.split('~').reduce((o,p)=>o && o[p],jb.comps)
                if (!profile)
                    return jb.logError('enrichUserEvent - can not get profile',{method, path})
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

