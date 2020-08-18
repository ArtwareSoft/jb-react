(function(){
const ui = jb.ui;
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,this && this.ctx) }}

function h(cmpOrTag,attributes,children) {
    if (cmpOrTag instanceof ui.VNode) return cmpOrTag // Vdom
    if (cmpOrTag && cmpOrTag.renderVdom)
        return cmpOrTag.renderVdomAndFollowUp()
   
    return new jb.ui.VNode(cmpOrTag,attributes,children)
}

function compareVdom(b,a) {
    const attributes = jb.objectDiff(a.attributes || {}, b.attributes || {})
    const children = childDiff(b.children || [],a.children || [])
    return { 
        ...(Object.keys(attributes).length ? {attributes} : {}), 
        ...(children ? {children} : {}),
        ...(a.tag != b.tag ? { tag: a.tag} : {})
    }

    function childDiff(b,a) {
        if (b.length == 0 && a.length ==0) return
        if (a.length == 1 && b.length == 1 && a[0].tag == b[0].tag)
            return { 0: {...compareVdom(b[0],a[0]),__afterIndex: 0}, length: 1 }
        jb.log('childDiff',[...arguments])
        const beforeWithIndex = b.map((e,i)=> ({i, ...e}))
        let remainingBefore = beforeWithIndex.slice(0)
        // locating before-objects in after-array. done in two stages. also calcualing the remaining before objects that were not found
        const afterToBeforeMap = a.map(toLocate => locateVdom(toLocate,remainingBefore))
        a.forEach((toLocate,i) => afterToBeforeMap[i] = afterToBeforeMap[i] || sameIndexSameTag(toLocate,i,remainingBefore))

        const reused = []
        const res = { length: beforeWithIndex.length }
        beforeWithIndex.forEach( (e,i) => {
            const __afterIndex = afterToBeforeMap.indexOf(e);
            if (__afterIndex == -1) {
                res [i] =  {$: 'delete', __afterIndex }
            } else {
                reused[__afterIndex] = true
                res [i] = { __afterIndex, ...compareVdom(e, a[__afterIndex]), ...(e.$remount ? {remount: true}: {}) }
            }
        })
        res.toAppend = a.flatMap((e,i) => reused[i] ? [] : [ Object.assign(e, {__afterIndex: i})])
//        res.toAppend = a.flatMap((e,i) => reused[i] ? [] : [{...compareVdom({},e), __afterIndex: i}])
        jb.log('childDiffRes',[res,...arguments])
        if (!res.length && !res.toAppend.length) return null
        return res

        function locateVdom(toLocate,remainingBefore) {
            const found = remainingBefore.findIndex(before=>sameSource(before,toLocate))
            if (found != -1)                
                return remainingBefore.splice(found,1)[0]
        }
        function sameIndexSameTag(toLocate,index,remainingBefore) {
            const found = remainingBefore.findIndex(before=>before.tag && before.i == index && before.tag === toLocate.tag)
            if (found != -1) {
                const ret = remainingBefore.splice(found,1)[0]
                if (ret.attributes.ctxId && !sameSource(ret,toLocate))
                    ret.$remount = true
                return ret
            }
        }
    }
}

function filterDelta(delta) { // for logging
    const doFilter = dlt => ({
        attributes: jb.objFromEntries(jb.entries(dlt.attributes)
            .filter(e=> ['jb-ctx','cmp-id','originators','__afterIndex','mount-ctx','frontEnd'].indexOf(e[0]) == -1)),
        children: dlt.children
    })
    return doFilter(delta)
}

function sameSource(vdomBefore,vdomAfter) {
    if (vdomBefore.cmp && vdomBefore.cmp === vdomAfter.cmp) return true
    const atts1 = vdomBefore.attributes || {}, atts2 = vdomAfter.attributes || {}
    if (atts1['cmp-id'] && atts1['cmp-id'] === atts2['cmp-id'] || atts1['jb-ctx'] && atts1['jb-ctx'] === atts2['jb-ctx']) return true
    if (compareCtxAtt('path',atts1,atts2) && compareCtxAtt('data',atts1,atts2)) return true
    if (compareAtts(['id','path','name'],atts1,atts2)) return true
}

function compareAtts(attsToCompare,atts1,atts2) {
    for(let i=0;i<attsToCompare.length;i++)
        if (atts1[attsToCompare[i]] && atts1[attsToCompare[i]] == atts2[attsToCompare[i]])
            return true
}

function compareCtxAtt(att,atts1,atts2) {
    const val1 = atts1.ctxId && jb.path(jb.ui.ctxDictionary[atts1.ctxId],att)
    const val2 = atts2.ctxId && jb.path(jb.ui.ctxDictionary[atts2.ctxId],att)
    return val1 && val2 && val1 == val2
}

// dom related functions

function applyNewVdom(elem,vdomAfter,{strongRefresh, ctx} = {}) {
    const widget = jb.ui.widgetOfElem(elem)
    jb.log('applyNewVdom',[widget,...arguments])
    if (widget.headless) {
        const cmpId = elem.getAttribute('cmp-id')
        const delta = compareVdom(elem,vdomAfter)
        if (elem != vdomAfter) { // update the elem
            Object.keys(elem).filter(x=>x !='parentNode').forEach(k=>delete elem[k])
            Object.assign(elem,vdomAfter)
            ;(vdomAfter.children ||[]).forEach(ch=>ch.parentNode = elem)
        }
        jb.ui.renderingUpdates.next({delta,cmpId,widgetId: widget.widgetid})
        return
    }
    const active = jb.ui.activeElement() === elem
    if (vdomAfter.tag != elem.tagName.toLowerCase() || strongRefresh) {
        unmount(elem)
        const newElem = render(vdomAfter,elem.parentElement)
        elem.parentElement.replaceChild(newElem,elem)
        jb.log('replaceTop',[newElem,elem])
        elem = newElem
    } else {
        const vdomBefore = elem instanceof ui.VNode ? elem : elemToVdom(elem)
        const delta = compareVdom(vdomBefore,vdomAfter)
        jb.log('applyDeltaTop',['apply',vdomBefore,vdomAfter,active,...arguments], {modifier: record => record.push(filterDelta(delta)) })
        applyDeltaToDom(elem,delta)
    }
    ui.refreshFrontEnd(elem)
    if (active) jb.ui.focus(elem,'apply Vdom diff',ctx)
    ui.garbageCollectCtxDictionary()
}

function refreshFrontEnd(elem) {
    ui.findIncludeSelf(elem,'[interactive]').forEach(el=> el._component ? el._component.newVDomApplied() : mountFrontEnd(el))
}

function elemToVdom(elem) {
    return {
        tag: elem.tagName.toLowerCase(),
        attributes: jb.objFromEntries([
            ...Array.from(elem.attributes).map(e=>[e.name,e.value]), 
            ...(jb.path(elem,'firstChild.nodeName') == '#text' ? [['$text',elem.firstChild.nodeValue]] : [])
        ]),
        ...( elem.childElementCount && !elem.getAttribute('jb_external') 
            ? { children: Array.from(elem.children).map(el=> elemToVdom(el)) } : {})
    }
}

function applyDeltaToDom(elem,delta) {
    jb.log('applyDelta',[...arguments])
    const children = delta.children
    if (delta.children) {
        const childrenArr = delta.children.length ? Array.from(Array(delta.children.length).keys()).map(i=>children[i]) : []
        const childElems = Array.from(elem.children)
        const toAppend = delta.children.toAppend || []
        const deleteCmp = delta.children.deleteCmp
        const sameOrder = childrenArr.reduce((acc,e,i) => acc && e.__afterIndex ==i, true) && !toAppend.length
            || !childrenArr.length && toAppend.reduce((acc,e,i) => acc && e.__afterIndex ==i, true)
        if (deleteCmp) {
            const toDelete = Array.from(elem.children).find(ch=>ch.getAttribute('cmp-id') == deleteCmp)
            if (toDelete) {
                unmount(toDelete)
                elem.removeChild(toDelete)
                jb.log('removeChild',[toDelete,elem,delta])
            }
        }
        childrenArr.forEach((e,i) => {
            if (e.$ == 'delete') {
                unmount(childElems[i])
                elem.removeChild(childElems[i])
                jb.log('removeChild',[childElems[i],e,elem,delta])
            } else {
                applyDeltaToDom(childElems[i],e)
                !sameOrder && (childElems[i].setAttribute('__afterIndex',e.__afterIndex))
            }
        })
        toAppend.forEach(e=>{
            const newElem = render(e,elem)
            jb.log('appendChild',[newElem,e,elem,delta])
            !sameOrder && (newElem.setAttribute('__afterIndex',e.__afterIndex))
        })
        if (!sameOrder) {
            Array.from(elem.children)
                .sort((x,y) => Number(x.getAttribute('__afterIndex')) - Number(y.getAttribute('__afterIndex')))
                .forEach(el=> {
                    const index = Number(el.getAttribute('__afterIndex'))
                    if (elem.children[index] != el)
                        elem.insertBefore(el, elem.children[index])
                    el.removeAttribute('__afterIndex')
                })
            }
        // remove leftover text nodes in mixed
        if (elem.childElementCount)
            Array.from(elem.childNodes).filter(ch=>ch.nodeName == '#text')
                .forEach(ch=>{
                    elem.removeChild(ch)
                    jb.log('removeChild',['remove leftover',ch,elem,delta])
                })
    }
    jb.entries(delta.attributes)
        .filter(e=> !(e[0] === '$text' && elem.firstElementChild) ) // elem with $text should not have children
        .forEach(e=> setAtt(elem,e[0],e[1]))
}

function applyDeltaToVDom(elem,delta) {
    jb.log('applyDelta',[...arguments])
    if (delta.children) {
        const toAppend = delta.children.toAppend || []
        toAppend.forEach(ch => {
            elem.children.push(ch);
            ch.parentNode = elem
        })
        const deleteCmp = delta.children.deleteCmp
        if (deleteCmp) {
            const index = elem.children.findIndex(ch=>ch.getAttribute('cmp-id') == deleteCmp)
            if (index != -1)
                elem.children.splice(index,1)
        }
    }

    Object.assign(elem.attributes,delta.attributes)
}

function setAtt(elem,att,val) {
    if (att[0] !== '$' && val == null) {
        elem.removeAttribute(att)
        jb.log('htmlChange',['remove',...arguments])
    } else if (att.indexOf('on-') == 0 && val != null && !elem[`registeredTo-${att}`]) {
        elem.addEventListener(att.slice(3), ev => jb.ui.handleCmpEvent(ev,val))
        elem[`registeredTo-${att}`] = true
    } else if (att.indexOf('on-') == 0 && val == null) {
        elem.removeEventListener(att.slice(3), ev => jb.ui.handleCmpEvent(ev,val))
        elem[`registeredTo-${att}`] = false
    } else if (att === 'checked' && elem.tagName.toLowerCase() === 'input') {
        elem.checked = !!val
        jb.log('htmlChange',['checked',...arguments])
    } else if (att.indexOf('$__input') === 0) {
        try {
            setInput(JSON.parse(val))
        } catch(e) {}
    } else if (att.indexOf('$__') === 0) {
        const id = att.slice(3)
        try {
            elem[id] = JSON.parse(val) || ''
        } catch (e) {}
        jb.log('htmlChange',[`data ${id}`,...arguments])
    } else if (att.indexOf('$vars__') === 0) {
        const id = att.slice(7)
        try {
            elem.vars = elem.vars || {}
            elem.vars[id] = JSON.parse(val) || ''
        } catch (e) {}
        jb.log('htmlChange',[`vars__ ${id}`,...arguments])
    } else if (att === '$focus' && val) {
        jb.ui.focus(elem,val)
    } else if (att === '$text') {
        elem.innerText = val || ''
        jb.log('htmlChange',['text',...arguments])
    } else if (att === '$html') {
        elem.innerHTML = val || ''
        jb.log('htmlChange',['html',...arguments])
    } else if (att === 'style' && typeof val === 'object') {
        elem.setAttribute(att,jb.entries(val).map(e=>`${e[0]}:${e[1]}`).join(';'))
        jb.log('htmlChange',['setAtt',...arguments])
    } else if (att == 'value' && elem.tagName.match(/select|input|textarea/i) ) {
        const active = document.activeElement === elem
        if (elem.value == val) return
        elem.value = val
        if (active)
            elem.focus()
        jb.log('htmlChange',['setAtt',...arguments])
    } else {
        elem.setAttribute(att,val)
        jb.log('htmlChange',['setAtt',...arguments])
    }

    function setInput({assumedVal,newVal,selectionStart}) {
        const el = jb.ui.findIncludeSelf(elem,'input,textarea')[0]
        if (!el) 
            return jb.logError('setInput: can not find input elem')
        if (assumedVal != el.value) 
            return jb.logError('setInput: assumed val is not as expected',assumedVal, el.value)
        el.value = newVal
        if (typeof selectionStart == 'number') 
            el.selectionStart = selectionStart
    }
}

function unmount(elem) {
    jb.log('unmount',[...arguments]);
    if (!elem || !elem.setAttribute) return

    const groupByWidgets = {}
    jb.ui.findIncludeSelf(elem,'[cmp-id]').forEach(el => {
        el._component && el._component.destroyFE()
        const widget = jb.ui.widgetOfElem(el) 
        if (widget.frontEnd) return
        groupByWidgets[widget.widgetid] = groupByWidgets[widget.widgetid] || { cmps: []}
        groupByWidgets[widget.widgetid].cmps.push(el.getAttribute('cmp-id'))
    })
    jb.entries(groupByWidgets).forEach(([widgetId,val])=>
        jb.ui.BECmpsDestroyNotification.next({
            destroyWidget: jb.ui.findIncludeSelf(elem,`[widgetid="${widgetId}"]`).length,
            cmps: val.cmps, 
            widgetId
        }))
}

function render(vdom,parentElem,prepend) {
    jb.log('render',[...arguments])
    function doRender(vdom,parentElem) {
        jb.log('htmlChange',['createElement',...arguments])
        const elem = createElement(parentElem.ownerDocument, vdom.tag)
        jb.entries(vdom.attributes).forEach(e=>setAtt(elem,e[0],e[1]))
        jb.asArray(vdom.children).map(child=> doRender(child,elem)).forEach(el=>elem.appendChild(el))
        prepend ? parentElem.prepend(elem) : parentElem.appendChild(elem)
        return elem
    }
    const res = doRender(vdom,parentElem)
    ui.findIncludeSelf(res,'[interactive]').forEach(el=> mountFrontEnd(el))
    return res
}

function createElement(doc,tag) {
    tag = tag || 'div'
    return (['svg','circle','ellipse','image','line','mesh','path','polygon','polyline','rect','text'].indexOf(tag) != -1) ?
        doc.createElementNS("http://www.w3.org/2000/svg", tag) : doc.createElement(tag)
}

// raw event enriched to userEvent and wrapped with userRequest
Object.assign(jb.ui, {
    handleCmpEvent(ev, specificMethod) {
        specificMethod = specificMethod == 'true' ? true : specificMethod
        // if (typeof specificMethod == 'string' && specificMethod.match(/-frontEnd$/))
        //     return jb.ui.runFrontEndMethod(ev, specificMethod.split('-frontEnd')[0])
        const userReq = jb.ui.rawEventToUserRequest(ev,specificMethod)
        if (!userReq) return
        //if (userReq.currentTarget.getAttribute('contenteditable')) return

        if (userReq.widgetId)
            jb.ui.widgetUserRequests.next(userReq)
        else
            jb.ui.runCtxAction(jb.ctxDictionary[userReq.ctxIdToRun],userReq.data,userReq.vars)
    },
    rawEventToUserRequest(ev, specificMethod) {
        const elem = jb.ui.closestCmpElem(ev.currentTarget)
        //const elem = jb.ui.parents(ev.currentTarget,{includeSelf: true}).find(el=> el.getAttribute && el.getAttribute('jb-ctx') != null)
        if (!elem) 
            return jb.logError('can not find closest elem with jb-ctx',elem)
        const method = specificMethod && typeof specificMethod == 'string' ? specificMethod : `on${ev.type}Handler`
        const ctxIdToRun = jb.ui.ctxIdOfMethod(elem,method)
        const widgetId = ev.widgetId || jb.ui.getWidgetId(elem)
        return ctxIdToRun && {$:'runCtxAction', widgetId, ctxIdToRun, vars: {ev: jb.ui.buildUserEvent(ev, elem)} }
    },
    buildUserEvent(ev, elem) {
        if (!ev) return null
        const userEvent = {
            value: (ev.target || {}).value, 
            elem: elem instanceof VNode ? {} : { 
                outerHeight: jb.ui.outerHeight(elem), outerWidth: jb.ui.outerWidth(elem), 
                clientRect: elem.getBoundingClientRect() 
            },
            ev: {},
        }
        const evProps = (elem.getAttribute('userEventProps') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] != 'elem')
        const elemProps = (elem.getAttribute('userEventProps') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] == 'elem').map(x=>x.split('.')[1])
        ;['type','keycode','clientX','clientY', ...evProps].forEach(prop=>userEvent.ev[prop] = ev[prop])
        ;['id', 'class', ...elemProps].forEach(prop=>userEvent.elem[prop] = elem.getAttribute(prop))
        elem._component && elem._component.enrichUserEvent(ev,userEvent)
        return userEvent
    },
    ctxIdOfMethod(elem,action) {
        return (elem.getAttribute('methods') || '').split(',').filter(x=>x.indexOf(action+'-') == 0)
            .map(str=>str.split('-')[1])
            .filter(x=>x)[0]
    },
    runCtxAction(ctx,data,vars) {
        ctx.setData(data).setVars(vars).runInner(ctx.profile.action,'action','action')        
    },
    runBEMethodInAnyContext(ctx,method,data,vars) {
        const cmp = ctx.vars.cmp
        if (cmp instanceof jb.ui.JbComponent)
            cmp.runBEMethod(method,data,vars ? {...ctx.vars, ...vars} : ctx.vars)
        else
            jb.ui.runBEMethod(cmp.base,method,data,{$state: cmp.state, ev: ctx.vars.ev, ...vars})
    },
    runBEMethod(elem,method,data,vars) {
        const widgetId = jb.ui.getWidgetId(elem)
        const ctxIdToRun = jb.ui.ctxIdOfMethod(elem,method)
        if (!ctxIdToRun)
            return jb.logError(`no method in cmp: ${method}`, elem, data, vars)

        if (widgetId)
            jb.ui.widgetUserRequests.next({$:'runCtxAction', widgetId, ctxIdToRun, data, vars })
        else {
            if (!jb.ctxDictionary[ctxIdToRun])
                return jb.logError(`no ctx found for method: ${method} ${ctxIdToRun}`, elem, data, vars)
            jb.log('BEMethod',[method,data,vars])
            jb.ui.runCtxAction(jb.ctxDictionary[ctxIdToRun],data,vars)
        }
    },
    getWidgetId(elem) {
        return jb.ui.parents(elem,{includeSelf: true}).filter(el=>el.getAttribute && el.getAttribute('widgettop')).map(el=>el.getAttribute('widgetid'))[0]
    }
})

Object.assign(jb.ui, {
    h, render, unmount, applyNewVdom, applyDeltaToDom, applyDeltaToVDom, elemToVdom, mountFrontEnd, compareVdom, refreshFrontEnd,
    BECmpsDestroyNotification: jb.callbag.subject(),
    renderingUpdates: jb.callbag.subject(),
    takeUntilCmpDestroyed(cmp) {
        const {pipe,take,filter,log,takeUntil} = jb.callbag
        return takeUntil(pipe(jb.ui.BECmpsDestroyNotification,
            log(`takeUntilCmpDestroyed ${cmp.cmpId}`),
            filter(x=>x.cmps.indexOf(''+cmp.cmpId) != -1),
            log(`Activated takeUntilCmpDestroyed ${cmp.cmpId}`),
            take(1),
        ))
    },
    ctrl(context,options) {
        const $state = context.vars.$refreshElemCall ? context.vars.$state : {}
        const cmpId = context.vars.$cmpId, cmpVer = context.vars.$cmpVer
        const ctx = context.setVars({
            $model: { ctx: context, ...context.params},
            $state,
            serviceRegistry: context.vars.serviceRegistry || {services: {}},
            $refreshElemCall : undefined, $props : undefined, cmp: undefined, $cmpId: undefined, $cmpVer: undefined 
        })
        const styleOptions = defaultStyle(ctx) || {}
        if (styleOptions instanceof ui.JbComponent)  {// style by control
            return styleOptions.orig(ctx).jbExtend(options,ctx).applyParamFeatures(ctx)
        }
        return new ui.JbComponent(ctx,cmpId,cmpVer).jbExtend(options,ctx).jbExtend(styleOptions,ctx).applyParamFeatures(ctx)
    
        function defaultStyle(ctx) {
            const profile = context.profile
            const defaultVar = '$theme.' + (profile.$ || '')
            if (!profile.style && context.vars[defaultVar])
                return ctx.run({$:context.vars[defaultVar]})
            return context.params.style ? context.params.style(ctx) : {}
        }
    },
    garbageCollectCtxDictionary(forceNow) {
        if (!forceNow)
            return jb.delay(1000).then(()=>ui.garbageCollectCtxDictionary(true))
   
        const used = 'jb-ctx,mount-ctx,pick-ctx,props-ctx,methods,frontEnd,originators'.split(',')
            .flatMap(att=>querySelectAllWithWidgets(`[${att}]`).flatMap(el => el.getAttribute(att).split(',').map(x=>Number(x.split('-').pop()))))
                    .sort((x,y)=>x-y)

        // remove unused ctx from dictionary
        const dict = Object.keys(jb.ctxDictionary).map(x=>Number(x)).sort((x,y)=>x-y)
        let lastUsedIndex = 0;
        const removedCtxs = [], removedResources = [], maxUsed = used.slice(-1)[0] || 0
        for(let i=0;i<dict.length && dict[i] < maxUsed;i++) {
            while (used[lastUsedIndex] < dict[i])
                lastUsedIndex++;
            if (used[lastUsedIndex] != dict[i]) {
                removedCtxs.push(dict[i])
                delete jb.ctxDictionary[''+dict[i]]
            }
        }
        // remove unused vars from resources
        const ctxToPath = ctx => Object.values(ctx.vars).filter(v=>jb.isWatchable(v)).map(v => jb.asRef(v))
            .map(ref=>jb.refHandler(ref).pathOfRef(ref)).flat()
        const globalVarsUsed = jb.unique(used.map(x=>jb.ctxDictionary[''+x]).filter(x=>x).map(ctx=>ctxToPath(ctx)).flat())
        Object.keys(jb.resources).filter(id=>id.indexOf(':') != -1)
            .filter(id=>globalVarsUsed.indexOf(id) == -1)
            .filter(id=>+id.split(':').pop < maxUsed)
            .forEach(id => { removedResources.push(id); delete jb.resources[id]})

        jb.log('garbageCollect',[maxUsed,removedCtxs,removedResources])

        function querySelectAllWithWidgets(query) {
            return jb.ui.widgets ? [...Object.values(jb.ui.widgets).flatMap(w=>w.body.querySelectorAll(query,{includeSelf:true})), ...Array.from(document.querySelectorAll(query))] : []
        }
    },
    applyDeltaToCmp(delta, ctx, cmpId) {
        const elem = jb.ui.elemOfCmp(ctx,cmpId)
        if (elem instanceof VNode) {
            jb.ui.applyDeltaToVDom(elem, delta)
            const widgetId = jb.ui.getWidgetId(elem)
            jb.ui.renderingUpdates.next({delta,cmpId,widgetId})
        } else if (elem) {
            jb.ui.applyDeltaToDom(elem, delta)
            jb.ui.refreshFrontEnd(elem)
        }        
    },
    refreshElem(elem, state, options) {
        if (jb.path(elem,'_component.state.frontEndStatus') == 'initializing') 
            return jb.logError('circular refresh',[...arguments])
        const cmpId = elem.getAttribute('cmp-id'), cmpVer = +elem.getAttribute('cmp-ver')
        const _ctx = ui.ctxOfElem(elem)
        if (!_ctx) 
            return jb.logError('refreshElem - no ctx for elem',elem)
        const strongRefresh = jb.path(options,'strongRefresh')
        let ctx = _ctx.setVar('$state', strongRefresh ? {refresh: true } : {refresh: true, ...jb.path(elem._component,'state'), ...state}) // strongRefresh kills state

        if (options && options.extendCtx)
            ctx = options.extendCtx(ctx)
        ctx = ctx.setVar('$refreshElemCall',true).setVar('$cmpId', cmpId).setVar('$cmpVer', cmpVer+1) // special vars for refresh
        if (jb.ui.inStudio()) // updating to latest version of profile
            ctx.profile = jb.execInStudio({$: 'studio.val', path: ctx.path})
        const cmp = ctx.profile.$ == 'openDialog' ? ctx.run(dialog.buildComp()) : ctx.runItself()
        jb.log('refreshElem',[ctx,cmp, ...arguments]);

        if (jb.path(options,'cssOnly')) {
            const existingClass = (elem.className.match(/(w|jb-)[0-9]+/)||[''])[0]
            const cssStyleElem = Array.from(document.querySelectorAll('style')).map(el=>({el,txt: el.innerText})).filter(x=>x.txt.indexOf(existingClass + ' ') != -1)[0].el
            jb.log('refreshElem',['hashCss',cmp.cssLines,ctx,cmp, ...arguments])
            return jb.ui.hashCss(cmp.calcCssLines(),cmp.ctx,{existingClass, cssStyleElem})
        }
        const hash = cmp.init()
        if (hash != null && hash == elem.getAttribute('cmpHash'))
            return jb.log('refreshElem',['stopped by hash', hash, ...arguments]);
        cmp && applyNewVdom(elem, h(cmp), {strongRefresh, ctx})
        //jb.execInStudio({ $: 'animate.refreshElem', elem: () => elem })
    },

    subscribeToRefChange: watchHandler => jb.subscribe(watchHandler.resourceChange, e=> {
        const changed_path = watchHandler.removeLinksFromPath(e.insertedPath || watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //observe="resources://2~name;person~name
        const findIn = jb.path(e,'srcCtx.vars.widgetId') || jb.path(e,'srcCtx.vars.testID') ? e.srcCtx : jb.frame.document
        const elemsToCheck = jb.ui.find(findIn,'[observe]')
        const elemsToCheckCtxBefore = elemsToCheck.map(el=>el.getAttribute('jb-ctx'))
        jb.log('notifyObservableElems',['elemsToCheck',elemsToCheck,e])
        elemsToCheck.forEach((elem,i) => {
            //.map((elem,i) => ({elem,i, phase: phaseOfElem(elem,i) })).sort((x1,x2)=>x1.phase-x2.phase).forEach(({elem,i}) => {
            if (elemsToCheckCtxBefore[i] != elem.getAttribute('jb-ctx')) return // the elem was already refreshed during this process, probably by its parent
            let refresh = false, strongRefresh = false, cssOnly = true
            elem.getAttribute('observe').split(',').map(obsStr=>observerFromStr(obsStr,elem)).filter(x=>x).forEach(obs=>{
                if (!obs.allowSelfRefresh && jb.ui.findIncludeSelf(elem,`[cmp-id="${jb.path(e.srcCtx, 'vars.cmp.cmpId')}"]`)[0]) 
                    return jb.log('notifyObservableElems',['blocking self refresh', elem, obs,e])
                const obsPath = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(obs.ref))
                if (!obsPath)
                    return jb.logError('observer ref path is empty',obs,e)
                strongRefresh = strongRefresh || obs.strongRefresh
                cssOnly = cssOnly && obs.cssOnly
                const diff = ui.comparePaths(changed_path, obsPath)
                const isChildOfChange = diff == 1
                const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
                const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
                if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure) {
                    jb.log('notifyObservableElem',['notify refresh',elem,e.srcCtx,obs,e])
                    refresh = true
                }
            })
            refresh && ui.refreshElem(elem,null,{srcCtx: e.srcCtx, strongRefresh, cssOnly})
        })

        function phaseOfElem(el,i) {
            return +((el.getAttribute('observe').match(/phase=([0-9]+)/) || ['',0])[1])*1000 + i
        }

        function observerFromStr(obsStr) {
            const parts = obsStr.split('://')
            const innerParts = parts[1].split(';')
            const includeChildren = ((innerParts[2] ||'').match(/includeChildren=([a-z]+)/) || ['',''])[1]
            const strongRefresh = innerParts.indexOf('strongRefresh') != -1
            const cssOnly = innerParts.indexOf('cssOnly') != -1
            const allowSelfRefresh = innerParts.indexOf('allowSelfRefresh') != -1
            
            return parts[0] == watchHandler.resources.id && 
                { ref: watchHandler.refOfUrl(innerParts[0]), includeChildren, strongRefresh, cssOnly, allowSelfRefresh }
        }
    })
})

class frontEndCmp {
    constructor(elem, keepState) {
        this.ctx = jb.ui.parents(elem,{includeSelf: true}).map(elem=>elem.ctxForFE).filter(x=>x)[0] || new jb.jbCtx()
        //this.ctx = new jb.jbCtx()
        this.state = { ...elem.state, ...(keepState && jb.path(elem._component,'state')), frontEndStatus: 'initializing' }
        this.base = elem
        this.cmpId = elem.getAttribute('cmp-id')
        this.destroyed = new Promise(resolve=>this.resolveDestroyed = resolve)
        elem._component = this
        this.runFEMethod('calcProps')
        this.runFEMethod('init')
        this.state.frontEndStatus = 'ready'
    }
    runFEMethod(method,data,_vars) {
        if (this.state.frontEndStatus != 'ready' && ['init','calcProps'].indexOf(method) == -1)
            return jb.logError('frontEnd - running method before init', [this, ...arguments])
        ;(this.base.frontEndMethods || []).filter(x=>x.method == method).forEach(({path}) => tryWrapper(() => {
            const profile = path.split('~').reduce((o,p)=>o[p],jb.comps)
            const feMEthod = jb.run( new jb.jbCtx(this.ctx, { profile, path }))
            const vars = {cmp: this, $state: this.state, el: this.base, ...this.base.vars, ..._vars }
            this.ctx.setData(data).setVars(vars).run(feMEthod.frontEndMethod.action)
        }, `frontEnd-${method}`))
    }
    enrichUserEvent(ev, userEvent) {
        (this.base.frontEndMethods || []).filter(x=>x.method == 'enrichUserEvent').map(({path}) => tryWrapper(() => {
            const actionPath = path+'~action'
            const profile = actionPath.split('~').reduce((o,p)=>o[p],jb.comps)
            const vars = {cmp: this, $state: this.state, el: this.base, ...this.base.vars, ev, userEvent }
            Object.assign(userEvent, jb.run( new jb.jbCtx(this.ctx, { vars, profile, path: actionPath })))
        }, 'enrichUserEvent'))
    }
    refresh(state, options) {
        jb.log('refreshReq',[...arguments])
        if (this._deleted) return
        Object.assign(this.state, state)
        this.base.state = this.state
        ui.refreshElem(this.base,this.state,options)
    }
    refreshFE(state) {
        if (this._deleted) return
        Object.assign(this.state, state)
        this.base.state = this.state
        this.runFEMethod('onRefresh')
    }    
    newVDomApplied() {
        Object.assign(this.state,{...this.base.state}) // update state from BE
        this.runFEMethod('onRefresh')
    }
    destroyFE() {
        this._deleted = true
        this.runFEMethod('destroy')
        this.resolveDestroyed() // notifications to takeUntil(this.destroyed) observers
    }
}

// interactive handlers like onmousemove and onkeyXX are handled in the frontEnd with and not varsed to the backend headless widgets
function mountFrontEnd(elem, keepState) {
    new frontEndCmp(elem, keepState)
}

// subscribe for watchable change
ui.subscribeToRefChange(jb.mainWatchableHandler)

// subscribe for widget renderingUpdates
jb.callbag.subscribe(e=> {
    if (!e.widgetId && e.cmpId && typeof document != 'undefined') {
        const elem = document.querySelector(`[cmp-id="${e.cmpId}"]`)
        if (elem) {
            jb.ui.applyDeltaToDom(elem, e.delta)
            jb.ui.refreshFrontEnd(elem)
        }
    }
})(jb.ui.renderingUpdates)

jb.callbag.subscribe(e=> {
    const {widgetId,fromHeadless} = e
    if (widgetId && widgetId != 'undefined' && widgetId != '_' && !fromHeadless)
        jb.ui.widgetUserRequests.next({$:'destroy', ...e })
})(jb.ui.BECmpsDestroyNotification)

})()