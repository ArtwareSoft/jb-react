
jb.extension('probe', {
    initExtension() { return { probeCounter: 0 } },
    Probe: class Probe {
        constructor(ctx, noGaps) {
            this.noGaps = noGaps

            this.circuitCtx = ctx.ctx({})
            this.probe = {}
            this.circuitCtx.probe = this
            this.circuitCtx.profile = jb.tgp.valOfPath(this.circuitCtx.path) || this.circuitCtx.profile // recalc latest version of profile
            this.id = ++jb.probe.probeCounter
        }

        async runCircuit(probePath,maxTime) {
            this.maxTime = maxTime || 50
            this.startTime = new Date().getTime()
            jb.log('probe run circuit',{probePath, probe: this})
            this.result = []
            this.result.visits = 0
            this.probe[probePath] = this.result
            this.probePath = probePath
            const initial_resources = jb.db.resources
            const initial_comps = jb.watchableComps.handler.resources()

            try {
                if (jb.tgp.isExtraElem(probePath) && !probePath.match(/~0$/)) {
                    const formerIndex = Number(probePath.match(/~([0-9]*)$/)[1])-1
                    this.probePath = probePath.replace(/[0-9]*$/,formerIndex)
                    this.extraElem = true
                }
                await this.simpleRun()
                await this.handleGaps()

                await (this.result || []).reduce((pr,item,i) =>
                    pr.then(_=>jb.probe.resolve(item.out)).then(resolved=> this.result[i].out =resolved), Promise.resolve())
                this.completed = true
                this.totalTime = new Date().getTime()-this.startTime
                jb.log('probe completed',{probePath, probe: this})
                // ref to values
                this.result.forEach(obj=> { obj.out = jb.val(obj.out) ; obj.in.data = jb.val(obj.in.data)})
                if (this.extraElem)
                    this.result.forEach(obj=> obj.in.data = obj.out)

                if (jb.db.resources.studio.project) { // studio and probe development
                    jb.db.watchableValueByRef && jb.db.watchableValueByRef.resources(initial_resources,null,{source: 'probe'})
                    initial_comps && jb.watchableComps.handler.resources(initial_comps,null,{source: 'probe'})
                }
                return this
            } catch (e) {
                jb.logException(e,'probe run',{probe: this})
            }
        }

        simpleRun() {
            return jb.probe.resolve(this.circuitCtx.runItself()).then(res=>{
                if (res && res.renderVdom) {
                    const vdom = res.renderVdom()
                    return ({props: res.renderProps, vdom , cmp: res})
                }
                else if (jb.tgp.isCompNameOfType(jb.utils.compName(this.circuitCtx.profile),'table-field')) {
                    const item = this.circuitCtx.vars.$probe_item
                    const index = this.circuitCtx.vars.$probe_index
                    return res.control ? res.control(item) : res.fieldData(item,index)
                }
                return res
            })
        }

        handleGaps(formerGap) {
            if (this.result.length > 0 || this.noGaps)
                return
            // find closest path
            let _path = jb.tgp.parentPath(this.probePath),breakingProp=''
            while (!this.probe[_path] && _path.indexOf('~') != -1) {
                breakingProp = _path.split('~').pop()
                _path = jb.tgp.parentPath(_path)
            }
            if (!this.probe[_path] || formerGap == _path) { // can not break through the gap
                this.closestPath = _path
                this.result = this.probe[_path] || []
                return
            }
            if (!breakingProp) return

            // check if parent ctx returns object with method name of breakprop as in dialog.onOK
            // TODO: generalized for all actions - breaking props may be non action props
            const parentCtx = this.probe[_path][0].in, breakingPath = _path+'~'+breakingProp
            const obj = this.probe[_path][0].out
            const compName = jb.tgp.compNameOfPath(breakingPath)
            if (jb.comps[`${compName}.probe`])
                return jb.probe.resolve(parentCtx.runInner({...parentCtx.profile[breakingProp], $: `${compName}.probe`},
                    jb.tgp.paramDef(breakingPath),breakingProp))
                        .then(_=>this.handleGaps(_path))

            const hasSideEffect = jb.comps[compName] && (jb.comps[jb.tgp.compNameOfPath(breakingPath)].type ||'').indexOf('has-side-effects') != -1
            if (obj && !hasSideEffect && obj[breakingProp] && typeof obj[breakingProp] == 'function')
                return jb.probe.resolve(obj[breakingProp]())
                    .then(_=>this.handleGaps(_path))

            if (!hasSideEffect) {
                const innerProf = parentCtx.profile[breakingProp]
                if (innerProf.$)
                    return jb.probe.resolve(parentCtx.runInner(innerProf,jb.tgp.paramDef(breakingPath),breakingProp))
                        .then(_=>this.handleGaps(_path))
            }

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
	closestCtxOfLastRun(probePath) {
        if (!jb.ctxByPath) return
		let path = probePath.split('~')
        if (jb.tgp.isExtraElem(probePath)) {
            if (probePath.match(/items~0$/)) {
                const pipelineCtx = jb.ctxByPath[path.slice(0,-2).join('~')]
                if (pipelineCtx)
                    return pipelineCtx.setVars(pipelineCtx.profile.$vars || {})
            } else if (probePath.match(/items~[1-9][0-9]*$/)) {
                const formerIndex = Number(probePath.match(/items~([1-9][0-9]*)$/)[1])-1
                path[path.length-1] = formerIndex
            }
        }

        const res = jb.tgp.parents(path.join('~')).map(path=>jb.ctxByPath[path]).find(x=>x)
		// for (;path.length > 0 && !jb.ctxByPath[path.join('~')];path.pop());
		// if (path.length)
		// 	res = jb.ctxByPath[path.join('~')]
			
		if ((jb.path(res,'profile.$') ||'').indexOf('rx.') != 0) // ignore rx ctxs
			return res
	},
})

jb.component('probe.runCircuit', {
  type: 'data',
  params: [
    { id: 'circuitPath', as: 'string'},
    { id: 'probePath', as: 'string'},    
  ],
  impl: async (ctx,circuitPath,probePath) => {
        jb.log('new probe',{ctx,circuitPath,probePath})
        if (!probePath) 
            return jb.logError(`no probe path`, {ctx,circuitPath})
        // if (jb.cbLogByPath && jb.cbLogByPath[probePath])
        //     return { result: jb.cbLogByPath[probePath] }
        let circuitCtx = null
        if (!circuitCtx)
            circuitCtx = jb.ctxDictionary[ctx.exp('%$studio/pickSelectionCtxId%')]
        if (!circuitCtx)
            circuitCtx = jb.probe.closestCtxOfLastRun(circuitPath)
        if (!circuitCtx && jb.path(jb.ui,'headless')) {
            const circuitElem = closestElemWithCtx(circuitPath)
            circuitCtx = circuitElem && jb.ctxDictionary[circuitElem.ctxId]
        }
        const circuitPath2 = circuitPath || probePath
        const circuitComp = circuitPath2.split('~')[0]
        if (circuitComp) {
            await jb.treeShake.bringMissingCode({$: circuitComp})
            circuitCtx = findMainCircuit(circuitPath2)
        }
        // if (circuitCtx)
        //     jb.studio.highlightCtx(circuitCtx.id) // fix: show send it to the view
        if (!circuitCtx)
            return jb.logError(`probe can not infer circuitCtx from ${circuitPath} and ${probePath}`, )
        return new jb.probe.Probe(circuitCtx).runCircuit(probePath)

        function findMainCircuit(path) {
            const _ctx = new jb.core.jbCtx()
            const cmpId = path.split('~')[0]
            const statistics = jb.exec({$: 'tgp.componentStatistics', cmpId})
            const comp = ctx.exp('%$studio/circuit%') 
                || (jb.path(jb.comps[cmpId],'impl.expectedResult') ? cmpId 
                    : (statistics.referredBy||[]).find(refferer=>jb.tgp.isOfType(refferer,'test'))) 
                || cmpId
            if (comp) {
                const res = _ctx.ctx({ profile: {$: comp}, comp, path: ''})
                if (jb.tgp.isOfType(comp,'control'))
                    return jb.ui.extendWithServiceRegistry(res)
                return res
            }
        }
        function closestElemWithCtx(path) {
            const candidates = Object.values(jb.ui.headless).flatMap(x=>x.body.querySelectorAll('[jb-ctx]'))
                .map(elem =>({elem, path: jb.path(elem,'debug.path'), callStack: jb.path(elem,'debug.callStack'), ctxId: elem.getAttribute('jb-ctx') }))
                .filter(e => [e.path, ...(e.callStack ||[])].filter(x=>x).some(p => p.indexOf(path) == 0))
            return candidates.sort((e2,e1) => 1000* (e1.path.length - e2.path.length) + (+e1.ctxId.match(/[0-9]+/)[0] - +e2.ctxId.match(/[0-9]+/)[0]) )[0] || {}
        }        
    },
    require: {$: 'tgp.componentStatistics'}
})


