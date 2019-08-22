(function() {
const st = jb.studio

let probeCounter = 0
st.Probe = class {
    constructor(ctx, noGaps) {
        if (ctx.probe)
            debugger
        this.noGaps = noGaps

        this.context = ctx.ctx({})
        this.probe = {}
        this.context.probe = this
        this.context.profile = st.valOfPath(this.context.path) // recalc latest version of profile
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
        const initial_resources = st.previewjb.valueByRefHandler.resources()
        const initial_comps = st.compsRefHandler.resources()
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
                st.previewjb.valueByRefHandler.resources(initial_resources)
                st.compsRefHandler.resources(initial_comps)
                    return this
            })
    }

    simpleRun() {
        const st = jb.studio
        return Promise.resolve(this.context.runItself()).then(res=>{
            if (st.isCompNameOfType(jb.compName(this.circuit),'control')) {
                const ctrl = jb.ui.h(res.reactComp())
                st.probeEl = st.probeEl || document.createElement('div')
                st.probeResEl = jb.ui.render(ctrl, st.probeEl, st.probeResEl)
                return ({element: st.probeResEl})
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
        const parentCtx = this.probe[_path][0].ctx, breakingPath = _path+'~'+breakingProp
        const obj = this.probe[_path][0].out
        if (obj[breakingProp] && typeof obj[breakingProp] == 'function')
            return Promise.resolve(obj[breakingProp]())
                .then(_=>this.handleGaps(_path))

    // use the ctx to run the breaking param if it has no side effects
        const hasSideEffect = st.previewjb.comps[st.compNameOfPath(breakingPath)] && (st.previewjb.comps[st.compNameOfPath(breakingPath)].type ||'').indexOf('has-side-effects') != -1
        if (!hasSideEffect)
            return Promise.resolve(parentCtx.runInner(parentCtx.profile[breakingProp],st.paramDef(breakingPath),breakingProp))
                .then(_=>this.handleGaps(_path))

        // could not solve the gap
        this.closestPath = _path
        this.result = this.probe[_path] || []
    }

    // called from jb_run
    record(context,parentParam) {
        if (this.id < probeCounter) {
            this.stopped = true
            return
        }
        const now = new Date().getTime()
        if (!this.outOfTime && now - this.startTime > this.maxTime && !context.vars.testID) {
            jb.log('probe',['out of time',context.path, context,this,now])
            this.outOfTime = true
            //throw 'out of time';
        }
        const path = context.path
        const input = context.ctx({probe: null})
        const out = input.runItself(parentParam,{noprobe: true})

        if (!this.probe[path]) {
            this.probe[path] = []
            this.probe[path].visits = 0
        }
        this.probe[path].visits++
        let found = null
        this.probe[path].forEach(x=>{
            found = jb.compareArrays(x.in.data,input.data) ? x : found
        })
        if (found)
            found.counter++
        else {
            const rec = {in: input, out: out, counter: 0, ctx: context}
            this.probe[path].push(rec)
        }
        return out
    }
}

const probeEmitter = new jb.rx.Subject()

jb.component('studio.probe',  /* studio_probe */ {
  type: 'data',
  params: [
    {id: 'path', as: 'string', dynamic: true}
  ],
  impl: (ctx,path) => {
        const _jb = st.previewjb
        /* Finding the best circuit
    1. direct selection
    2. closest in preview
    3. the page shown in studio
*/
        const circuitCtx = ctx.vars.pickSelection && ctx.vars.pickSelection.ctx
        if (circuitCtx && circuitCtx.path.indexOf('~fields~') != -1) {// fields are not good circuit. go up to the table
            const rowElem = ctx.vars.pickSelection.elem && ctx.vars.pickSelection.elem.closest('.jb-item')
            const rowCtx = rowElem && _jb.ctxDictionary[rowElem.getAttribute('jb-ctx')]
            const item = rowCtx && rowCtx.data
            if (item) {
                circuitCtx = circuitCtx.setVars({ $probe_item: item, $probe_index: Array.from(rowElem.parentElement.children).indexOf(rowElem) })
                st.highlight([rowElem])
            } else {
                circuitCtx = null
            }
        }
        else if (circuitCtx)
            jb.studio.highlightCtx(circuitCtx)
        if (!circuitCtx) {
            const circuitInPreview = st.closestCtxInPreview(path())
            if (circuitInPreview.ctx) {
            st.highlight([circuitInPreview.elem])
            circuitCtx = circuitInPreview.ctx
            }
        }
        if (!circuitCtx) {
            const circuit = jb.tostring(ctx.exp('%$circuit%','string') || ctx.exp('%$studio/project%.%$studio/page%'))
            circuitCtx = new _jb.jbCtx(new _jb.jbCtx(),{ profile: {$: circuit}, comp: circuit, path: '', data: null} )
        }
        return new (_jb.studio.Probe || st.Probe)(circuitCtx).runCircuit(path())

        // const req = {path: path(), circuitCtx: circuitCtx };
        // jb.delay(1).then(_=>probeEmitter.next(req));
        // const probeQueue = probeEmitter.buffer(probeEmitter.debounceTime(500))
        //     .map(x=>x && x[0]).filter(x=>x)
        //     .flatMap(req=>
        //       new (_jb.studio.Probe || st.Probe)(req.circuitCtx).runCircuit(req.path)
        //     );

        // return probeQueue.filter(x=>x.id == probeCounter).take(1).toPromise();
        //      .race(jb.rx.Observable.fromPromise(jb.delay(1000).then(_=>({ result: [] }))))
    }
})

})()
