(function() {
const st = jb.studio

let probeCounter = 0
st.Probe = class {
    constructor(ctx, noGaps) {
        this.noGaps = noGaps

        this.context = ctx.ctx({})
        this.probe = {}
        this.context.probe = this
        this.context.profile = st.valOfPath(this.context.path) || this.context.profile // recalc latest version of profile
        this.circuit = this.context.profile
        this.id = ++probeCounter
    }

    runCircuit(pathToTrace,maxTime) {
        const st = jb.studio
        this.maxTime = maxTime || 50
        this.startTime = new Date().getTime()
        jb.log('probe',['runCircuit',pathToTrace, this])
        this.result = []
        this.result.visits = 0
        this.probe[pathToTrace] = this.result
        this.pathToTrace = pathToTrace
        const initial_resources = st.previewjb.resources
        const initial_comps = st.compsRefHandler && st.compsRefHandler.resources()
        if (st.probeDisabled) {
            this.completed = false
            this.remark = 'probe disabled'
            return Promise.resolve(this)
        }

        return this.simpleRun()
        // .catch(e => jb.logException(e,'probe run'))
            .then( res =>
            this.handleGaps())
            .catch(e => jb.logException(e,'probe run'))
            .then(() => // resolve all top promises in result.out
            (this.result || []).reduce((pr,item,i) =>
                pr.then(_=>Promise.resolve(item.out)).then(resolved=> this.result[i].out =resolved),
            Promise.resolve())
            )
            .then(() =>{
                this.completed = true
                this.totalTime = new Date().getTime()-this.startTime
                jb.log('probe',['completed',pathToTrace, this.result, this.totalTime, this])
                // make values out of ref
                this.result.forEach(obj=> { obj.out = jb.val(obj.out) ; obj.in.data = jb.val(obj.in.data)})
                st.previewjb.watchableValueByRef && st.previewjb.watchableValueByRef.resources(initial_resources,null,{source: 'probe'})
                initial_comps && st.compsRefHandler.resources(initial_comps,null,{source: 'probe'})
                return this
            })
    }

    simpleRun() {
        const st = jb.studio
        return Promise.resolve(this.context.runItself()).then(res=>{
            if (res.renderVdom) {
                const vdom = res.renderVdom()
                return ({props: res.renderProps, vdom , cmp: res})
            }
            else if (st.isCompNameOfType(jb.compName(this.circuit),'table-field')) {
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
        let _path = st.parentPath(this.pathToTrace),breakingProp=''
        while (!this.probe[_path] && _path.indexOf('~') != -1) {
            breakingProp = _path.split('~').pop()
            _path = st.parentPath(_path)
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
        const hasSideEffect = st.previewjb.comps[st.compNameOfPath(breakingPath)] && (st.previewjb.comps[st.compNameOfPath(breakingPath)].type ||'').indexOf('has-side-effects') != -1
        if (obj && !hasSideEffect && obj[breakingProp] && typeof obj[breakingProp] == 'function')
            return Promise.resolve(obj[breakingProp]())
                .then(_=>this.handleGaps(_path))

        if (!hasSideEffect)
            return Promise.resolve(parentCtx.runInner(parentCtx.profile[breakingProp],st.paramDef(breakingPath),breakingProp))
                .then(_=>this.handleGaps(_path))

        // could not solve the gap
        this.closestPath = _path
        this.result = this.probe[_path] || []
    }

    // called from jb_run
    record(ctx,out) {
        if (this.id < probeCounter) {
            this.stopped = true
            return
        }
        const now = new Date().getTime()
        if (!this.outOfTime && now - this.startTime > this.maxTime && !ctx.vars.testID) {
            jb.log('probe',['out of time',ctx.path, ctx,this,now])
            this.outOfTime = true
            //throw 'out of time';
        }
        const path = ctx.path
        if (!this.probe[path]) {
            this.probe[path] = []
            this.probe[path].visits = 0
        }
        this.probe[path].visits++
        const found = this.probe[path].find(x=>jb.compareArrays(x.in.data,ctx.data))
        if (found)
            found.counter++
        else
            this.probe[path].push({in: ctx, out, counter: 0})

        return out
    }
}

jb.component('studio.probe', {
  type: 'data',
  params: [
    {id: 'path', as: 'string', dynamic: true}
  ],
  impl: (ctx,pathF) => {
        const _jb = st.previewjb, path = pathF()
        if (!path) return
        let circuitCtx = null
        if (jb.path(_jb.comps,[path.split('~')[0],'testData']))
            circuitCtx = st.closestTestCtx(path)
        if (!circuitCtx)
            circuitCtx = _jb.ctxDictionary[ctx.exp('%$studio/pickSelectionCtxId%')]
        if (!circuitCtx) {
            const circuitInPreview = st.closestCtxInPreview(path)
            circuitCtx = circuitInPreview && circuitInPreview.ctx
        }
        if (!circuitCtx)
            circuitCtx = st.closestCtxOfLastRun(path)
        if (!circuitCtx)
            circuitCtx = st.closestTestCtx(path)
        if (!circuitCtx) {
            const circuit = jb.tostring(ctx.exp('%$circuit%') || ctx.exp('%$studio/project%') && ctx.run(studio.currentPagePath()))
            circuitCtx = new _jb.jbCtx(new _jb.jbCtx(),{ profile: {$: circuit}, comp: circuit, path: '', data: null} )
        }
        if (circuitCtx)
            jb.studio.highlightCtx(circuitCtx)
        return new (_jb.studio.Probe || st.Probe)(circuitCtx).runCircuit(path)
    }
})

})()
