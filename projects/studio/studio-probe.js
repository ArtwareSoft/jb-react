jb.extension('probe', {
    initExtension() { return { probeCounter: 0 } },
    Probe: class Probe {
        constructor(ctx, noGaps) {
            this.noGaps = noGaps

            this.context = ctx.ctx({})
            this.probe = {}
            this.context.probe = this
            this.context.profile = jb.studio.valOfPath(this.context.path) || this.context.profile // recalc latest version of profile
            this.circuit = this.context.profile
            this.id = ++jb.probe.probeCounter
        }

        runCircuit(pathToTrace,maxTime) {
            this.maxTime = maxTime || 50
            this.startTime = new Date().getTime()
            jb.log('probe run circuit',{pathToTrace, probe: this})
            this.result = []
            this.result.visits = 0
            this.probe[pathToTrace] = this.result
            this.pathToTrace = pathToTrace
            const initial_resources = jb.db.resources
            const initial_comps = jb.watchableComps.handler.resources()
            if (jb.studio.probeDisabled) {
                this.completed = false
                this.remark = 'probe disabled'
                return jb.probe.resolve(this)
            }

            return this.simpleRun()
            // .catch(e => jb.logException(e,'probe run'))
                .then( res =>
                this.handleGaps())
                .catch(e => jb.logException(e,'probe run',{probe: this}))
                .then(() => // resolve all top promises in result.out
                (this.result || []).reduce((pr,item,i) =>
                    pr.then(_=>jb.probe.resolve(item.out)).then(resolved=> this.result[i].out =resolved),
                jb.probe.resolve())
                )
                .then(() =>{
                    this.completed = true
                    this.totalTime = new Date().getTime()-this.startTime
                    jb.log('probe completed',{pathToTrace, probe: this})
                    // make values out of ref
                    this.result.forEach(obj=> { obj.out = jb.val(obj.out) ; obj.in.data = jb.val(obj.in.data)})
                    if (jb.db.resources.studio.project) { // studio and probe development
                        jb.db.watchableValueByRef && jb.db.watchableValueByRef.resources(initial_resources,null,{source: 'probe'})
                        initial_comps && jb.watchableComps.handler.resources(initial_comps,null,{source: 'probe'})
                    }
                    return this
                })
        }

        simpleRun() {
            const st = jb.studio
            return jb.probe.resolve(this.context.runItself()).then(res=>{
                if (res && res.renderVdom) {
                    const vdom = res.renderVdom()
                    return ({props: res.renderProps, vdom , cmp: res})
                }
                else if (jb.studio.isCompNameOfType(jb.utils.compName(this.circuit),'table-field')) {
                    const item = this.context.vars.$probe_item
                    const index = this.context.vars.$probe_index
                    return res.control ? res.control(item) : res.fieldData(item,index)
                }
                return res
            })
        }

        handleGaps(formerGap) {
            if (this.result.length > 0 || this.noGaps)
                return
            const st = jb.studio
            // find closest path
            let _path = jb.studio.parentPath(this.pathToTrace),breakingProp=''
            while (!this.probe[_path] && _path.indexOf('~') != -1) {
                breakingProp = _path.split('~').pop()
                _path = jb.studio.parentPath(_path)
            }
            if (!this.probe[_path] || formerGap == _path) { // can not break through the gap
                this.closestPath = _path
                this.result = this.probe[_path] || []
                return
            }
            if (!breakingProp) return

            // check if parent ctx returns object with method name of breakprop as in dialog.onOK
            const parentCtx = this.probe[_path][0].in, breakingPath = _path+'~'+breakingProp
            const obj = this.probe[_path][0].out
            const compName = jb.studio.compNameOfPath(breakingPath)
            if (jb.comps[`${compName}.probe`])
                return jb.probe.resolve(parentCtx.runInner({...parentCtx.profile[breakingProp], $: `${compName}.probe`},
                    jb.studio.paramDef(breakingPath),breakingProp))
                        .then(_=>this.handleGaps(_path))

            const hasSideEffect = jb.comps[compName] && (jb.comps[jb.studio.compNameOfPath(breakingPath)].type ||'').indexOf('has-side-effects') != -1
            if (obj && !hasSideEffect && obj[breakingProp] && typeof obj[breakingProp] == 'function')
                return jb.probe.resolve(obj[breakingProp]())
                    .then(_=>this.handleGaps(_path))

            if (!hasSideEffect)
                return jb.probe.resolve(parentCtx.runInner(parentCtx.profile[breakingProp],jb.studio.paramDef(breakingPath),breakingProp))
                    .then(_=>this.handleGaps(_path))

            // could not solve the gap
            this.closestPath = _path
            this.result = this.probe[_path] || []
        }

        // called from jb_run
        record(ctx,out) {
            if (this.id < jb.probe.probeCounter) {
                this.stopped = true
                return
            }
            const now = new Date().getTime()
            if (!this.outOfTime && now - this.startTime > this.maxTime && !ctx.vars.testID) {
                jb.log('probe timeout',{ctx, probe: this,now})
                this.outOfTime = true
                //throw 'out of time';
            }
            const path = ctx.path
            if (!this.probe[path]) {
                this.probe[path] = []
                this.probe[path].visits = 0
            }
            this.probe[path].visits++
            const found = this.probe[path].find(x=>jb.utils.compareArrays(x.in.data,ctx.data))
            if (found)
                found.counter++
            else
                this.probe[path].push({in: ctx, out, counter: 0})

            return out
        }
    },
    resolve(x) {
        if (jb.callbag.isCallbag(x)) return x
        return Promise.resolve(x)
    },
    findElemsByPathCondition: condition => Object.values(jb.ui.headless).flatMap(x=>x.body.querySelectorAll('[jb-ctx]'))
        .map(elem =>({elem, path: jb.path(elem,'debug.path'), callStack: jb.path(elem,'debug.callStack'), ctxId: elem.getAttribute('jb-ctx') }))
        .filter(e => [e.path, ...(e.callStack ||[])].filter(x=>x).some(path => condition(path))),
    closestCtxInPreview(_path) {
        const candidates = jb.probe.findElemsByPathCondition(p => p.indexOf(path) == 0)
        return candidates.sort((e2,e1) => 1000* (e1.path.length - e2.path.length) + (+e1.ctxId.match(/[0-9]+/)[0] - +e2.ctxId.match(/[0-9]+/)[0]) )[0] || {}
    }
})

jb.component('studio.probe', {
  type: 'data',
  params: [
    {id: 'path', as: 'string', dynamic: true}
  ],
  impl: (ctx,pathF) => {
        const path = pathF()
        jb.log('new probe',{ctx,path})
        if (!path) return
        if (jb.cbLogByPath && jb.cbLogByPath[path])
            return { result: jb.cbLogByPath[path] }
        let circuitCtx = null
        if (jb.path(jb.comps,[path.split('~')[0],'testData']))
            circuitCtx = jb.studio.closestTestCtx(path)
        if (!circuitCtx)
            circuitCtx = jb.ctxDictionary[ctx.exp('%$studio/pickSelectionCtxId%')]
        if (!circuitCtx) {
            const circuitInPreview = jb.probe.closestCtxInPreview(path)
            circuitCtx = circuitInPreview && circuitInPreview.ctx
        }
        if (!circuitCtx)
            circuitCtx = jb.studio.closestCtxOfLastRun(path)
        if (!circuitCtx)
            circuitCtx = jb.studio.closestTestCtx(path)
        if (!circuitCtx) {
            const circuit = jb.tostring(ctx.exp('%$studio/jbEditor/circuit%') || ctx.exp('%$studio/project%') && ctx.run(studio.currentPagePath()))
            circuitCtx = new jb.core.jbCtx(new jb.core.jbCtx(),{ profile: {$: circuit}, comp: circuit, path: '', data: null} )
        }
        if (circuitCtx)
            jb.studio.highlightCtx(circuitCtx.id)
        return new jb.probe.Probe(circuitCtx).runCircuit(path)
    }
})


