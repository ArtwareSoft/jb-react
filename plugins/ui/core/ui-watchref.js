using('watchable,common')

extension('ui', 'watchRef', {
    $phase: 100,
    $requireFuncs: '#watchable.WatchableValueByRef',
    initExtension() {
        jb.db.watchableHandlers.forEach(h=> jb.ui.subscribeToRefChange(h))
    },
    subscribeToRefChange: watchHandler => jb.utils.subscribe(watchHandler.resourceChange, e=> {
        const {opVal, srcCtx } = e
        const changed_path = watchHandler.removeLinksFromPath(e.insertedPath || watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //observe="resources://2~name;person~name
        const testTop = jb.path(e,'srcCtx.vars.testID') && jb.ui.widgetBody(srcCtx)
        const tops = [testTop, jb.path(jb.frame.document,'body'), ...Object.values(jb.ui.headless).map(x=>x && x.body) ].filter(x=>x)
        const elemsToCheck = tops.flatMap(top=> jb.ui.find(top,'[observe]').map(elem=>({top, elem})))

        const elemsToCheckCtxIdBefore = elemsToCheck.map(({elem}) =>elem.getAttribute('cmp-ver'))
        const originatingCmpId = jb.path(srcCtx, 'vars.cmp.cmpId')
        jb.log(`refresh check observable elements : ${changed_path}`,{originatingCmpId,elemsToCheck,e,srcCtx })
        const refreshActions = elemsToCheck.map(({elem, top},i) => {
            const FEWidgetId = jb.ui.frontendWidgetId(elem)
            if (FEWidgetId && FEWidgetId != 'client') return

            const cmpId = elem.getAttribute('cmp-id')
            if (cmpId.indexOf('-') != -1 && cmpId.split('-')[0] != jb.uri)
                return
            let refresh = false, strongRefresh = false, cssOnly = true, delay = 0, methodBeforeRefresh = ''
            elem.getAttribute('observe').split(',').map(obsStr=>observerFromStr(obsStr,elem)).filter(x=>x).forEach(obs=>{
                if (!obs.allowSelfRefresh && jb.ui.findIncludeSelf(elem,`[cmp-id="${originatingCmpId}"]`)[0]) 
                    return jb.log('blocking self refresh observableElems',{cmpId,originatingCmpId,elem, obs,e})
                const obsPath = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(obs.ref))
                if (!obsPath)
                    return jb.logError('observer ref path is empty',{originatingCmpId,cmpId,obs,e})
                strongRefresh = strongRefresh || obs.strongRefresh
                delay = delay || obs.delay
                cssOnly = cssOnly && obs.cssOnly
                methodBeforeRefresh = [methodBeforeRefresh,obs.methodBeforeRefresh || ''].filter(x=>x).join(',')
                const diff = jb.utils.comparePaths(changed_path, obsPath)
                const isChildOfChange = diff == 1
                const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
                const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
                if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure)
                    refresh = true
            })
            if (refresh)
                return ctx => applyRefreshAstAction({ctx, delay,elem, methodBeforeRefresh, strongRefresh, cssOnly, cmpId, originatingCmpId, top, i})
        }).filter(x=>x)
        const tx = srcCtx.vars.userReqTx
        if (tx)
            tx.completeByChildren(refreshActions, srcCtx)
        else
            refreshActions.forEach(action => action(srcCtx))

        async function applyRefreshAstAction({ctx, delay,elem, methodBeforeRefresh, strongRefresh, cssOnly,cmpId, originatingCmpId, top, i}) {
            await doApply()
            const tx = ctx.vars.userReqTx
            tx && tx.complete()

            function doApply() {
                if (!jb.ui.parents(elem).find(el=>el == top))
                    return jb.log('observable elem was detached in refresh process',{originatingCmpId,cmpId,elem})
                if (elemsToCheckCtxIdBefore[i] != elem.getAttribute('cmp-ver'))
                    return jb.log('observable elem was refreshed from top in refresh process',{originatingCmpId,cmpId,elem})
                jb.log('refresh from observable elements',{cmpId,originatingCmpId,elem,ctx,e})
                if (delay)
                    jb.delay(delay).then(()=> jb.ui.refreshElem(elem,null,{srcCtx : ctx, strongRefresh, methodBeforeRefresh, opVal, cssOnly}))
                else
                    jb.ui.refreshElem(elem,null,{srcCtx: ctx, methodBeforeRefresh, opVal, strongRefresh, cssOnly})
            }
        }

        function observerFromStr(obsStr) {
            const parts = obsStr.split('://')
            const innerParts = parts[1].split(';')
            const includeChildren = ((innerParts[2] ||'').match(/includeChildren=([a-z]+)/) || ['',''])[1]
            const delay = +((parts[1].match(/delay=([0-9]+)/) || ['',''])[1])
            const methodBeforeRefresh = (parts[1].match(/methodBeforeRefresh=([a-zA-Z0-9_]+)/) || ['',''])[1]
            const strongRefresh = innerParts.indexOf('strongRefresh') != -1
            const cssOnly = innerParts.indexOf('cssOnly') != -1
            const allowSelfRefresh = innerParts.indexOf('allowSelfRefresh') != -1
            
            return parts[0] == watchHandler.resources.id && 
                { ref: watchHandler.refOfUrl(innerParts[0]), includeChildren, methodBeforeRefresh, strongRefresh, cssOnly, allowSelfRefresh, delay }
        }
    })
})