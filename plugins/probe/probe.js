using('tgp-model-data,tgp')

component('probe', { watchableData: { path : '',  
defaultMainCircuit: /sourceCode=/.test(jb.path(globalThis,'location.href')||'') ? (jb.path(globalThis,'location.pathname')||'').split('/')[3] : '',
scriptChangeCounter: 1} })

extension('probe', 'main', {
    initExtension() { return { 
        probeCounter: 0,
        singleVisitPaths: {},
        singleVisitCounters: {}
    }},
    async calcCircuit(ctx, probePath) {
        jb.log('probe calc circuit',{ctx, probePath})
        if (!probePath) 
            return jb.logError(`calcCircuitPath : no probe path`, {ctx,probePath})
        let circuitCtx = jb.path(jb.ui.cmps[ctx.exp('%$workspace/pickSelectionCmpId%')],'calcCtx')
        if (circuitCtx) return { reason: 'pickSelection', circuitCtx }

        circuitCtx = await jb.probe.closestCtxWithSingleVisit(probePath)
        if (circuitCtx) return { reason: 'closestCtxWithSingleVisit', circuitCtx }

        if (jb.path(jb.ui,'headless')) {
            const circuitCtx = closestElemWithCmp(probePath).ctx
            if (circuitCtx) return { reason: 'closestElemWithCmp', circuitCtx }
        }
        circuitCtx = await findMainCircuit(probePath)
        if (circuitCtx) 
            return { reason: 'mainCircuit', circuitCtx }

        return circuitCtx

        async function findMainCircuit(path) {
            const _ctx = new jb.core.jbCtx()
            const cmpId = path.split('~')[0]
            jb.treeShake.codeServerJbm && await jb.treeShake.getCodeFromRemote([cmpId])
            const circuitCmpId = _ctx.exp('%$studio/circuit%') 
                    || _ctx.exp('%$probe/defaultMainCircuit%') 
                    || jb.path(jb.utils.getCompById(cmpId),'circuit')
                    || jb.path(jb.utils.getCompById(cmpId),'impl.expectedResult') && cmpId // test
                    || findTest(cmpId) || cmpId
            if (circuitCmpId && !jb.utils.getCompById(circuitCmpId,{silent: true}) && !jb.treeShake.codeServerJbm) {
                return jb.logError(`calcCircuit. can not bring circuit comp ${circuitCmpId}`,{probePath,cmpId,ctx})
            }
        
            if (circuitCmpId) {
                jb.treeShake.codeServerJbm && await jb.treeShake.getCodeFromRemote([circuitCmpId])
                const res = _ctx.ctx({ profile: {$: circuitCmpId}, comp : circuitCmpId, path: ''})
                if (jb.tgp.isOfType(circuitCmpId,'control'))
                    return jb.ui.extendWithServiceRegistry(res)
                if (jb.tgp.isOfType(circuitCmpId,'test'))
                    return jb.ui.extendWithServiceRegistry(res).setVars(
                        { testID: cmpId, singleTest: true })
                return res
            }
        }
        function closestElemWithCmp(path) {
            const candidates = Object.values(jb.ui.headless).flatMap(x=>x.body.querySelectorAll('[cmp-id]'))
                .map(elem => jb.ui.cmps[elem.getAttribute('cmp-id')]).filter(x=>x)
                .filter(cmp => [cmp.ctx.path, ...(cmp.callStack ||[])].filter(x=>x).some(p => p.indexOf(path) == 0))
            return candidates.sort((cmp2,cmp1) => 1000* (cmp1.ctx.path.length - cmp2.ctx.path.length) + 
                (cmp1.ctx.id - cmp2.ctx.id) ) [0] || {}
        }
        function findTest(cmpId) {
            // #jbLoadComponents: tgp.componentStatistics
            const statistics = jb.exec({$: 'tgp.componentStatistics', cmpId})
            const lookFor = cmpId.split('.').pop()
            const tests = (statistics.referredBy||[]).filter(refferer=>jb.tgp.isCompNameOfType(refferer,'test'))
            const testWithSameName = tests.filter(id=>id.indexOf(lookFor) != -1)[0]
            return testWithSameName || tests[0]
        }
    },
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
            const initial_comps = jb.watchableComps && jb.watchableComps.handler.resources()

            try {
                if (jb.tgp.isExtraElem(probePath) && !probePath.match(/~0$/)) {
                    const formerIndex = Number(probePath.match(/~([0-9]*)$/)[1])-1
                    this.probePath = probePath.replace(/[0-9]*$/,formerIndex)
                    this.extraElem = true
                }
                this.active = true
                this.cleanSingleVisits()
                this.circuitRes = await this.simpleRun()
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

                if (jb.path(jb.db.resources,'studio.project')) { // studio and probe development
                    jb.db.watchableValueByRef && jb.db.watchableValueByRef.resources(initial_resources,null,{source: 'probe'})
                    initial_comps && jb.watchableComps.handler.resources(initial_comps,null,{source: 'probe'})
                }
                return this
            } catch (e) {
                if (e != 'probe tails')
                    jb.logException(e,'probe run',{probe: this})
            } finally {
                this.active = false
            }
        }

        cleanSingleVisits() {
            if (this.defaultMainCircuit == this.circuitCtx.path)
                jb.probe.singleVisitCounters = {}
            Object.keys(jb.probe.singleVisitCounters).forEach(k=>k.indexOf(this.probePath) == 0 && (jb.probe.singleVisitCounters[k] = 0))
        }

        async simpleRun() {
            const res1 = this.circuitCtx.runItself()
            jb.log('probe simple run result',{probe: this, res1})
            const res2 = await res1
            const res = await jb.probe.resolve(res2)
            this.simpleVisits = jb.path(this.probe[this.probePath],'visits')

            jb.log('probe simple run resolved',{probe: this, res})
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
            if (jb.utils.getCompById(`${compName}.probe`,{silent:true})) {
                parentCtx.profile[breakingProp][jb.core.CT] = { ...parentCtx.profile[breakingProp][jb.core.CT], comp: null }
                return jb.probe.resolve(parentCtx.runInner(jb.utils.resolveDetachedProfile({...parentCtx.profile[breakingProp], $: `${compName}.probe`}),
                    jb.tgp.paramDef(breakingPath),breakingProp))
                        .then(_=>this.handleGaps(_path))
            }

            const hasSideEffect = jb.utils.getCompById(compName,{silent:true}) && (jb.utils.getCompById(jb.tgp.compNameOfPath(breakingPath)).type ||'').indexOf('has-side-effects') != -1
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
        alternateProfile(ctx) {
            return ctx.profile
        }

        // called from jb_run
        record(ctx,out) {
            jb.probe.singleVisitPaths[ctx.path] = ctx
            jb.probe.singleVisitCounters[ctx.path] = (jb.probe.singleVisitCounters[ctx.path] || 0) + 1
            if (!this.active || this.probePath.indexOf(ctx.path) != 0) return
    
            if (this.id < jb.probe.probeCounter) {
                jb.log('probe probeCounter is larger than current',{ctx, probe: this, counter: jb.probe.probeCounter})
                this.active = false
                throw 'probe tails'
                return
            }
            const now = new Date().getTime()
            if (now - this.startTime > this.maxTime && !ctx.vars.testID) {
                jb.log('probe timeout',{ctx, probe: this,now})
                this.active = false
                throw 'probe tails'
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
	async closestCtxWithSingleVisit(probePath) {
        const cmpId = probePath.split('~')[0]
        jb.treeShake.codeServerJbm && await jb.treeShake.getCodeFromRemote([cmpId])

		let path = probePath.split('~')
        if (jb.tgp.isExtraElem(probePath)) {
            if (probePath.match(/items~0$/)) {
                const pipelinePath = path.slice(0,-2).join('~')
                const pipelineCtx = jb.probe.singleVisitCounters[pipelinePath] == 1 && jb.probe.singleVisitPaths[pipelinePath]
                if (pipelineCtx)
                    return pipelineCtx.setVars(pipelineCtx.profile.$vars || {})
            } else if (probePath.match(/items~[1-9][0-9]*$/)) {
                const formerIndex = Number(probePath.match(/items~([1-9][0-9]*)$/)[1])-1
                path[path.length-1] = formerIndex
            }
        }

        const res = jb.tgp.parents(path.join('~'))
            .filter(path=>jb.probe.singleVisitCounters[path] == 1)
            .map(path=>jb.probe.singleVisitPaths[path])
            .filter(ctx=>(jb.path(ctx,'profile.$') ||'').indexOf('rx.') != 0)
            [0]
			
	    return res
	},
})

component('probe.runCircuit', {
  type: 'data',
  params: [
    {id: 'probePath', as: 'string', defaultValue: '%$probe/path%'}
  ],
  impl: async (ctx,probePath) => {
        jb.log('probe start run circuit',{ctx,probePath})
        const circuit = await jb.probe.calcCircuit(ctx, probePath)
        if (!circuit)
            return jb.logError(`probe can not infer circuitCtx from ${probePath}`, )
        jb.utils.resolveDetachedProfile(circuit.circuitCtx.profile)

        return new jb.probe.Probe(circuit.circuitCtx).runCircuit(probePath)
    },
  require: tgp.componentStatistics()
})

component('probe.calcCircuitPath', {
  type: 'data',
  params: [
    {id: 'probePath', as: 'string'}
  ],
  impl: async (ctx, probePath) => {
        const circuit = await jb.probe.calcCircuit(ctx, probePath)
        return circuit && { reason: circuit.reason, path: (circuit.circuitCtx.path || '').split('~impl')[0] } || {}
    }
})

component('probe.stripProbeResult', {
  params: [
    {id: 'result'}
  ],
  impl: (ctx,result) => (result || []).map ( x => ({out: x.out,in: {data: x.in.data, params: jb.path(x.in.cmpCtx,'params'), vars: x.in.vars}}))
})
