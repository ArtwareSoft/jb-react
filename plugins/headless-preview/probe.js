
jb.component('probe', { watchableData: { path : '',  defaultMainCircuit: '', scriptChangeCounter: 1} })

jb.extension('probe', {
    initExtension() { return { 
        probeCounter: 0,
        singleVisitPaths: {},
        singleVisitCounters: {}
    }},
    async calcCircuit(ctx, probePath, defaultMainCircuit) {
        jb.log('prob calc circuit',{ctx, probePath})
        if (!probePath) 
            return jb.logError(`calcCircuitPath : no probe path`, {ctx,probePath, defaultMainCircuit})
        let circuitCtx = jb.ctxDictionary[ctx.exp('%$workspace/pickSelectionCtxId%')]
        if (circuitCtx) return { reason: 'pickSelection', circuitCtx }

        circuitCtx = jb.probe.closestCtxWithSingleVisit(probePath)
        if (circuitCtx) return { reason: 'closestCtxWithSingleVisit', circuitCtx }

        if (jb.path(jb.ui,'headless')) {
            const circuitElem = closestElemWithCtx(probePath)
            circuitCtx = circuitElem && jb.ctxDictionary[circuitElem.ctxId]
            if (circuitCtx) return { reason: 'closestElemWithCtx', circuitCtx }
        }
        circuitCtx = await findMainCircuit(probePath)
        if (circuitCtx) return { reason: 'mainCircuit', circuitCtx }

        return circuitCtx

        async function findMainCircuit(path) {
            const _ctx = new jb.core.jbCtx()
            const cmpId = path.split('~')[0]
            await jb.treeShake.getCodeFromRemote([cmpId])
            // #jbLoadComponents: tgp.componentStatistics
            const statistics = jb.exec({$: 'tgp.componentStatistics', cmpId})
            const comp = defaultMainCircuit || _ctx.exp('%$studio/circuit%') || (jb.path(jb.comps[cmpId],'impl.expectedResult') ? cmpId 
                    : (statistics.referredBy||[]).find(refferer=>jb.tgp.isOfType(refferer,'test'))) 
                || cmpId
            if (comp) {
                await jb.treeShake.getCodeFromRemote([comp])
                const res = _ctx.ctx({ profile: {$: comp}, comp, path: ''})
                if (jb.tgp.isOfType(comp,'control'))
                    return jb.ui.extendWithServiceRegistry(res)
                if (jb.tgp.isOfType(comp,'test'))
                    return jb.ui.extendWithServiceRegistry(res).setVars(
                        { testID: cmpId, singleTest: true, $testFinished: jb.callbag.subject() })
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
    Probe: class Probe {
        constructor(ctx, noGaps, defaultMainCircuit) {
            this.noGaps = noGaps

            this.circuitCtx = ctx.ctx({})
            this.probe = {}
            this.circuitCtx.probe = this
            this.circuitCtx.profile = jb.tgp.valOfPath(this.circuitCtx.path) || this.circuitCtx.profile // recalc latest version of profile
            this.id = ++jb.probe.probeCounter
            this.defaultMainCircuit = defaultMainCircuit
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
                this.active = true
                try {
                    this.cleanSignleVisits()
                    await this.simpleRun()
                    await this.handleGaps()
                } finally {
                    const testFinished = this.circuitCtx.vars.$testFinished
                    if (testFinished) {
                        testFinished.next(1)
                        testFinished.complete()
                    }                    
                }

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
                jb.logException(e,'probe run',{probe: this})
            } finally {
                this.active = false
            }
        }

        cleanSignleVisits() {
            if (this.defaultMainCircuit == this.circuitCtx.path)
                jb.probe.singleVisitCounters = {}
            Object.keys(jb.probe.singleVisitCounters).forEach(k=>k.indexOf(this.probePath) == 0 && (jb.probe.singleVisitCounters[k] = 0))
        }

        async simpleRun() {
            const res1 = this.circuitCtx.runItself()
            jb.log('probe simple run result',{probe: this, res1})
            const res2 = await res1
            const res = await jb.probe.resolve(res2)

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
            jb.probe.singleVisitPaths[ctx.path] = ctx
            jb.probe.singleVisitCounters[ctx.path] = (jb.probe.singleVisitCounters[ctx.path] || 0) + 1
            if (!this.active || this.probePath.indexOf(ctx.path) != 0) return
    
            if (this.id < jb.probe.probeCounter) {
                jb.log('probe probeCounter is larger than current',{ctx, probe: this,id, counter: jb.probe.probeCounter})
                this.active = false
                return
            }
            const now = new Date().getTime()
            if (now - this.startTime > this.maxTime && !ctx.vars.testID) {
                jb.log('probe timeout',{ctx, probe: this,now})
                this.active = false
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
	closestCtxWithSingleVisit(probePath) {
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

jb.component('probe.runCircuit', {
  type: 'data',
  params: [
    { id: 'probePath', as: 'string', defaultValue: '%$probe/path%'},
    { id: 'defaultMainCircuit', as: 'string', defaultValue: '%$probe/defaultMainCircuit%'},
  ],
  impl: async (ctx,probePath,defaultMainCircuit) => {
        jb.log('probe start run circuit',{ctx,probePath,defaultMainCircuit})
        const circuit = await jb.probe.calcCircuit(ctx, probePath, defaultMainCircuit)
        if (!circuit)
            return jb.logError(`probe can not infer circuitCtx from ${probePath}`, )
        return new jb.probe.Probe(circuit.circuitCtx,defaultMainCircuit).runCircuit(probePath)
    },
    require: {$: 'tgp.componentStatistics'}
})

jb.component('probe.calcCircuitPath', {
    type: 'data',
    params: [
      { id: 'probePath', as: 'string'},
      { id: 'defaultMainCircuit', as: 'string'},
    ],
    impl: async (ctx, probePath, defaultMainCircuit) => {
        const circuit = await jb.probe.calcCircuit(ctx, probePath, defaultMainCircuit)
        return circuit && { reason: circuit.reason, path: circuit.circuitCtx.path } || {}
    }
})

jb.component('jbm.wProbe', {
    type: 'jbm',
    params: [
        {id: 'id', defaultValue: 'wProbe' }
    ],    
    impl: jbm.worker({id: '%$id%', init: probe.initRemoteProbe()})
})

jb.component('jbm.nodeProbe', {
    type: 'jbm',
    impl: jbm.nodeContainer({init: probe.initRemoteProbe()})
})

jb.component('probe.initRemoteProbe', {
    type: 'action',
    impl: runActions(
        Var('dataResources',() => jb.studio.projectCompsAsEntries().map(e=>e[0]).filter(x=>x.match(/^dataResource/)).join(',')),
        remote.action(treeShake.getCodeFromRemote('%$dataResources%'),'%$jbm%'),
        remote.shadowResource('probe', '%$jbm%'),
        rx.pipe(
            watchableComps.scriptChange(),
            rx.log('preview change script'),
            rx.map(obj(prop('op','%op%'), prop('path','%path%'))),
            rx.var('cssOnlyChange',tgp.isCssPath('%path%')),
            sink.action(remote.action( {action: probe.handleScriptChangeOnPreview('%$cssOnlyChange%'), jbm: '%$jbm%', oneway: true}))
        )
    ),
})

jb.component('probe.handleScriptChangeOnPreview', {
    type: 'action',
    description: 'preview script change handler',
    params: [
        {id: 'cssOnlyChange', as: 'boolean' }
    ],
    impl: (ctx, cssOnlyChange) => {
        const {op, path} = ctx.data
        const handler = jb.watchableComps.startWatch()
        if (path[0] == 'probeTest.label1') return
        if (!jb.comps[path[0]])
            return jb.logError(`handleScriptChangeOnPreview - missing comp ${path[0]}`, {path, ctx})
        handler.makeWatchable(path[0])
        jb.log('probe handleScriptChangeOnPreview doOp',{ctx,op,path})
        handler.doOp(handler.refOfPath(path), op, ctx)

        const headlessWidgetId = Object.keys(jb.ui.headless)[0]
        const headless = jb.ui.headless[headlessWidgetId]
        if (!headless)
            return jb.logError(`handleScriptChangeOnPreview - missing headless ${headlessWidgetId} at ${jb.uri}`, {path, ctx})
        if (cssOnlyChange) {
            let featureIndex = path.lastIndexOf('features')
            if (featureIndex == -1) featureIndex = path.lastIndexOf('layout')
            const ctrlPath = path.slice(0, featureIndex).join('~')
            const elems = headless.body.querySelectorAll('[jb-ctx]')
                .map(elem=>({elem, path: jb.path(JSON.parse(elem.attributes.$__debug),'path') }))
                .filter(e => e.path == ctrlPath)
            elems.forEach(e=>jb.ui.refreshElem(e.elem,null,{cssOnly: e.elem.attributes.class ? true : false}))           
        } else {
            const ref = ctx.exp('%$probe/scriptChangeCounter%','ref')
            jb.db.writeValue(ref, +jb.val(ref)+1 ,ctx.setVars({headlessWidget: true}))
        }
    }
})
