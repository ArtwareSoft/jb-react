jb.extension('ui', 'watchRef', {
    initExtension_phase100() {
        jb.db.watchableHandlers.forEach(h=> jb.ui.subscribeToRefChange(h))
    },
    subscribeToRefChange: watchHandler => jb.utils.subscribe(watchHandler.resourceChange, e=> {
        const changed_path = watchHandler.removeLinksFromPath(e.insertedPath || watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //observe="resources://2~name;person~name
        const body = !jb.frame.document || jb.path(e,'srcCtx.vars.headlessWidgetId') || jb.path(e,'srcCtx.vars.testID') ? jb.ui.widgetBody(e.srcCtx) : jb.frame.document.body
        const elemsToCheck = jb.ui.find(body,'[observe]') // top down order
        const elemsToCheckCtxBefore = elemsToCheck.map(el=>el.getAttribute('jb-ctx'))
        const originatingCmpId = jb.path(e.srcCtx, 'vars.cmp.cmpId')
        jb.log('refresh check observable elements',{originatingCmpId,elemsToCheck,e,srcCtx:e.srcCtx})
        elemsToCheck.forEach((elem,i) => {
            const cmpId = elem.getAttribute('cmp-id')
            if (!jb.ui.parents(elem).find(el=>el == body))
                return jb.log('observable elem was detached in refresh process',{originatingCmpId,cmpId,elem})
            if (elemsToCheckCtxBefore[i] != elem.getAttribute('jb-ctx')) 
                return jb.log('observable elem was refreshed from top in refresh process',{originatingCmpId,cmpId,elem})
            let refresh = false, strongRefresh = false, cssOnly = true, delay = 0
            elem.getAttribute('observe').split(',').map(obsStr=>observerFromStr(obsStr,elem)).filter(x=>x).forEach(obs=>{
                if (!obs.allowSelfRefresh && jb.ui.findIncludeSelf(elem,`[cmp-id="${originatingCmpId}"]`)[0]) 
                    return jb.log('blocking self refresh observableElems',{cmpId,originatingCmpId,elem, obs,e})
                const obsPath = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(obs.ref))
                if (!obsPath)
                    return jb.logError('observer ref path is empty',{originatingCmpId,cmpId,obs,e})
                strongRefresh = strongRefresh || obs.strongRefresh
                delay = delay || obs.delay
                cssOnly = cssOnly && obs.cssOnly
                const diff = jb.utils.comparePaths(changed_path, obsPath)
                const isChildOfChange = diff == 1
                const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
                const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
                if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure)
                    refresh = true
            })
            if (refresh) {
                jb.log('refresh from observable elements',{cmpId,originatingCmpId,elem,ctx: e.srcCtx,e})
                if (delay) 
                    jb.delay(delay).then(()=> jb.ui.refreshElem(elem,null,{srcCtx: e.srcCtx, strongRefresh, cssOnly}))
                else
                    jb.ui.refreshElem(elem,null,{srcCtx: e.srcCtx, strongRefresh, cssOnly})
            }
        })

        function observerFromStr(obsStr) {
            const parts = obsStr.split('://')
            const innerParts = parts[1].split(';')
            const includeChildren = ((innerParts[2] ||'').match(/includeChildren=([a-z]+)/) || ['',''])[1]
            const delay = +((parts[1].match(/delay=([0-9]+)/) || ['',''])[1])
            const strongRefresh = innerParts.indexOf('strongRefresh') != -1
            const cssOnly = innerParts.indexOf('cssOnly') != -1
            const allowSelfRefresh = innerParts.indexOf('allowSelfRefresh') != -1
            
            return parts[0] == watchHandler.resources.id && 
                { ref: watchHandler.refOfUrl(innerParts[0]), includeChildren, strongRefresh, cssOnly, allowSelfRefresh, delay }
        }
    })
})