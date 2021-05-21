jb.extension('ui', 'watchRef', {
    initExtension_phase100() {
        // for loader: jb.watchable.WatchableValueByRef(
        jb.db.watchableHandlers.forEach(h=> jb.ui.subscribeToRefChange(h))
    },
    subscribeToRefChange: watchHandler => jb.utils.subscribe(watchHandler.resourceChange, e=> {
        const changed_path = watchHandler.removeLinksFromPath(e.insertedPath || watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //observe="resources://2~name;person~name
        const testTop = jb.path(e,'srcCtx.vars.testID') && jb.ui.widgetBody(e.srcCtx)
        const tops = [testTop, jb.path(jb.frame.document,'body'), ...Object.values(jb.ui.headless).map(x=>x && x.body) ].filter(x=>x)
        const elemsToCheck = tops.flatMap(top=> jb.ui.find(top,'[observe]').map(elem=>({top, elem})))
        // const body = !jb.frame.document || jb.path(e,'srcCtx.vars.testID') ? jb.ui.widgetBody(e.srcCtx) : jb.frame.document.body
        // const elemsToCheck = (jb.path(e,'srcCtx.vars.headlessWidget') ? headlessElemsToCheck() : jb.ui.find(body,'[observe]')) // top down order
        //     .filter(el => {
        //         const parentWidgetId = jb.ui.parentWidgetId(el)
        //         return !parentWidgetId || parentWidgetId.split('-')[0] == jb.uri // || ['tests',jb.uri].indexOf(parentWidgetId.split('-')[0]) != -1
        // })
        const elemsToCheckCtxBefore = elemsToCheck.map(({elem}) =>elem.getAttribute('jb-ctx'))
        const originatingCmpId = jb.path(e.srcCtx, 'vars.cmp.cmpId')
        jb.log('refresh check observable elements',{originatingCmpId,elemsToCheck,e,srcCtx:e.srcCtx})
        elemsToCheck.forEach(({elem, top},i) => {
            const cmpId = elem.getAttribute('cmp-id')
//            if (elem instanceof jb.ui.VNode ? headlessElemDetached(elem) : !jb.ui.parents(elem).find(el=>el == top))
            if (!jb.ui.parents(elem).find(el=>el == top))
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

        function headlessElemsToCheck() {
            const widgets = jb.path(e,'srcCtx.vars.headlessWidgetId') ? [jb.path(e,'srcCtx.vars.headlessWidgetId')] : Object.keys(jb.ui.headless)
            return widgets.flatMap(w=> jb.ui.find(jb.path(jb.ui.headless,[w,'body']),'[observe]'))
        }
        function headlessElemDetached(el) {
            const topParent = jb.ui.parents(el).pop()
            return !Object.values(jb.ui.headless).find(x=>x.body == topParent)
        }

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