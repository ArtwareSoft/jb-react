(function() {
const deltaTransformerI = {
    transform({data,vars}) {}, // return output with no delta calculation
    delta(delta, {init, cache}) {} // return { dOutput, dCache}
}

/*
no dependencies on variables but on refs that the vars depend upon them
when using var we detect its node and its dependencies and add it to the dependencies 
*/
const deltaNodeI = {
    refDependencies() {}, // return [{ref,includeChildren}] // includeChildren: yes,no,structure
    recalc(delta, ctx) {}, // returns val
    recalcResultCtx(delta, ctx) {} // for vars node
}



recalPipelineNode = { // returns ctx for next elem
    list: (delta,ctx) => {
        const changeDetector = {}
        const res = listNodes.map(n=>n.recalc(delta,ctx,changeDetector))
        listNodes.resCtx = changeDetector.change ? ctx.setData(res) : listNodes.resCtx
        return listNodes.resCtx
    },
    map: (delta,ctx) => mapNode.resCtx = mapNode.recal(delta,ctx),
    flatMap: (delta,ctx) => {
        
    }
}

function createDeltaNode(ctx) {
    const ctxWithoutVars = ctx.profile.$vars && Object.assign({}, ctx, { profile: Object.assign({},ctx.profile, {$vars: undefined}) })
    const ctxAfterVars = calcVars(ctx)

    return {
        ctx,
        ctxWithoutVars,
        ...calcRecordingDependencies(ctx,ctxWithoutVars),
        recalc(delta) {
            return isNodeDependent(this,delta) ? recalcNode(node,delta) : this.res
        }
    }
}

function recalcNode(node, delta) {
    return Object.assign(node, calcRecordingDependencies(node.ctx)).res
}

function calcRecordingDependencies(ctx) {

    return {vars,dependencies,res}
}

deltaCache = { deltaNodes, deltaDependencies }

function calcDeltaComp(ctx) {
    const dependenciesAgg = {}
    const vars = calcVarNodes(ctx.profile.$vars,dependenciesAgg)
    const agg = calcAggNodes(ctx.profile,dependenciesAgg)
    const res = ctx.runItself()
    return { vars, aggergtors, res, dependencies: dependenciesAgg[ctx.path] }
}

function applyDeltaOnCmp(delta,cmp) {
    if (isDeltaRelevant(delta,cmp.dependencies)) {

        const deltaAcc = cmp.vars.reduce((deltaAcc,varCmp) => {
            if (isDeltaRelevant(delta,varCmp.dependencies)) {
                const { res, dependenciesAgg } = calcRecordingDependencies(varCmp.ctx)
                if (diff(res,cmp.ref).length == 0)
                    return
                const res = Object.assign({},delta)
                res.varsChanged.push(varCmp.ctx.id)
                return res
            }
        }, delta)
    }
}

function calcVarNodesAndDependencies(ctx) {

}

delta = {
    op: {},
    varsChanged: [] // ctxIds of vars
}

function calcVarNodes(ctx, dependenciesAgg) {
    const varNodes = []
    let growingCtx = ctx
    for(let varname in ctx.$vars || {}) {
        const varCtx = new jbCtx(growingCtx,{profile: ctx.$vars[varname],path: '$vars~'+varname})
        varNodes.push(calcDeltaNode(varCtx))
        growingCtx = growingCtx.setVars({[varname]: varCtx.runItself() })
    }
    return varNodes;
}

})()