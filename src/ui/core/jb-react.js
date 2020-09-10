(function(){
const ui = jb.ui;
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,this && this.ctx) }}

function h(cmpOrTag,attributes,children) {
    if (cmpOrTag instanceof ui.VNode) return cmpOrTag // Vdom
    if (cmpOrTag && cmpOrTag.renderVdom)
        return cmpOrTag.renderVdomAndFollowUp()
   
    return new jb.ui.VNode(cmpOrTag,attributes,children)
}

function compareVdom(b,after) {
    const a = after instanceof ui.VNode ? ui.stripVdom(after) : after
    jb.log('vdom diff compare',[...arguments])
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
        jb.log('vdom child diff start',[...arguments])
        const beforeWithIndex = b.map((e,i)=> ({i, ...e}))
        let remainingBefore = beforeWithIndex.slice(0)
        // locating before-objects in after-array. done in two stages. also calcualing the remaining before objects that were not found
        const afterToBeforeMap = a.map(toLocate => locateVdom(toLocate,remainingBefore))
        a.forEach((toLocate,i) => afterToBeforeMap[i] = afterToBeforeMap[i] || sameIndexSameTag(toLocate,i,remainingBefore))

        const reused = []
        const res = { length: 0, sameOrder: true }
        beforeWithIndex.forEach( (e,i) => {
            const __afterIndex = afterToBeforeMap.indexOf(e)
            if (__afterIndex != i) res.sameOrder = false
            if (__afterIndex == -1) {
                res.length = i+1
                res[i] =  {$: 'delete' } //, __afterIndex: i }
            } else {
                reused[__afterIndex] = true
                const innerDiff = { __afterIndex, ...compareVdom(e, a[__afterIndex]), ...(e.$remount ? {remount: true}: {}) }
                if (Object.keys(innerDiff).length > 1) {
                    res[i] = innerDiff
                    res.length = i+1
                }
            }
        })
        res.toAppend = a.flatMap((e,i) => reused[i] ? [] : [ Object.assign( e, {__afterIndex: i}) ])
        jb.log('vdom child diff result',[res,...arguments])
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
            .filter(e=> ['jb-ctx','cmp-id','originators','__afterIndex','full-cmp-ctx','frontEnd'].indexOf(e[0]) == -1)),
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
    const widgetId = jb.ui.headlessWidgetId(elem)
    jb.log('applyNew vdom',[widgetId,...arguments])
    if (widgetId) {
        const cmpId = elem.getAttribute('cmp-id')
        const delta = compareVdom(elem,vdomAfter)
        if (elem != vdomAfter) { // update the elem
            Object.keys(elem).filter(x=>x !='parentNode').forEach(k=>delete elem[k])
            Object.assign(elem,vdomAfter)
            ;(vdomAfter.children ||[]).forEach(ch=>ch.parentNode = elem)
        }
        jb.ui.renderingUpdates.next({delta,cmpId,widgetId})
        return
    }
    const active = jb.ui.activeElement() === elem
    if (vdomAfter.tag != elem.tagName.toLowerCase() || strongRefresh) {
        unmount(elem)
        const newElem = render(vdomAfter,elem.parentElement)
        elem.parentElement.replaceChild(newElem,elem)
        jb.log('replaceTop vdom',[newElem,elem])
        elem = newElem
    } else {
        const vdomBefore = elem instanceof ui.VNode ? elem : elemToVdom(elem)
        const delta = compareVdom(vdomBefore,vdomAfter)
        jb.log('applyDeltaTop vdom',[vdomBefore,vdomAfter,active,...arguments], {modifier: record => record.push(filterDelta(delta)) })
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
    jb.log('applyDelta dom',[...arguments])
    const children = delta.children
    if (children) {
        const childrenArr = children.length ? Array.from(Array(children.length).keys()).map(i=>children[i]) : []
        const childElems = Array.from(elem.children)
        const {toAppend,deleteCmp,sameOrder} = children
        if (deleteCmp) {
            const toDelete = Array.from(elem.children).find(ch=>ch.getAttribute('cmp-id') == deleteCmp)
            if (toDelete) {
                unmount(toDelete)
                elem.removeChild(toDelete)
                jb.log('removeChild dom',[toDelete,elem,delta])
            }
        }
        childrenArr.forEach((e,i) => {
            if (!e) return
            if (e.$ == 'delete') {
                unmount(childElems[i])
                elem.removeChild(childElems[i])
                jb.log('removeChild dom',[childElems[i],e,elem,delta])
            } else {
                applyDeltaToDom(childElems[i],e)
                !sameOrder && (childElems[i].setAttribute('__afterIndex',e.__afterIndex))
            }
        })
        ;(toAppend||[]).forEach(e=>{
            const newElem = render(e,elem)
            jb.log('appendChild dom',[newElem,e,elem,delta])
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
                    jb.log('removeChild dom leftover',[ch,elem,delta])
                })
    }
    jb.entries(delta.attributes)
        .filter(e=> !(e[0] === '$text' && elem.firstElementChild) ) // elem with $text should not have children
        .forEach(e=> setAtt(elem,e[0],e[1]))
}

function applyDeltaToVDom(elem,delta) {
    jb.log('applyDelta vdom',[...arguments])
    // supports only append/delete
    if (delta.children) {
        const toAppend = delta.children.toAppend || []
        toAppend.forEach(ch => elem.children.push(jb.ui.unStripVdom(ch,elem)))
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
        jb.log('dom change remove',[...arguments])
    } else if (att.indexOf('on-') == 0 && val != null && !elem[`registeredTo-${att}`]) {
        elem.addEventListener(att.slice(3), ev => jb.ui.handleCmpEvent(ev,val))
        elem[`registeredTo-${att}`] = true
    } else if (att.indexOf('on-') == 0 && val == null) {
        elem.removeEventListener(att.slice(3), ev => jb.ui.handleCmpEvent(ev,val))
        elem[`registeredTo-${att}`] = false
    } else if (att === 'checked' && elem.tagName.toLowerCase() === 'input') {
        jb.delay(1).then(()=> elem.checked = !!val)
        jb.log('dom set checked',[...arguments])
    } else if (att.indexOf('$__input') === 0) {
        try {
            setInput(JSON.parse(val))
        } catch(e) {}
    } else if (att.indexOf('$__') === 0) {
        const id = att.slice(3)
        try {
            elem[id] = JSON.parse(val) || ''
        } catch (e) {}
        jb.log('dom set data',[`data ${id}`,...arguments])
    } else if (att === '$focus' && val) {
        elem.setAttribute('_focus',val)
        jb.ui.focus(elem,val)
    } else if (att === '$scrollDown' && val) {
        elem.__appScroll = true
        elem.scrollTop = elem.scrollHeight
    } else if (att === '$text') {
        elem.innerText = val || ''
        jb.log('dom set text',[...arguments])
    } else if (att === '$html') {
        elem.innerHTML = val || ''
        jb.log('dom set html',[...arguments])
    } else if (att === 'style' && typeof val === 'object') {
        elem.setAttribute(att,jb.entries(val).map(e=>`${e[0]}:${e[1]}`).join(';'))
        jb.log('dom set style',[...arguments])
    } else if (att == 'value' && elem.tagName.match(/select|input|textarea/i) ) {
        const active = document.activeElement === elem
        if (elem.value == val) return
        elem.value = val
        if (active && document.activeElement !== elem) { debugger; elem.focus() }
        jb.log('dom set elem value',[...arguments])
    } else {
        elem.setAttribute(att,val)
        jb.log('dom set att',[...arguments])
    }

    function setInput({assumedVal,newVal,selectionStart}) {
        const el = jb.ui.findIncludeSelf(elem,'input,textarea')[0]
        jb.log('dom set input check',[el, assumedVal,newVal,selectionStart])
        if (!el)
            return jb.logError('setInput: can not find input elem')
        if (assumedVal != el.value) 
            return jb.logError('setInput: assumed val is not as expected',assumedVal, el.value)
        const active = document.activeElement === el
        jb.log('dom set input',[el, assumedVal,newVal,selectionStart])
        el.value = newVal
        if (typeof selectionStart == 'number') 
            el.selectionStart = selectionStart
        if (active && document.activeElement !== el) { debugger; el.focus() }
    }
}

function unmount(elem) {
    jb.log('unmount',[...arguments]);
    if (!elem || !elem.setAttribute) return

    const groupByWidgets = {}
    jb.ui.findIncludeSelf(elem,'[cmp-id]').forEach(el => {
        el._component && el._component.destroyFE()
        if (jb.ui.frontendWidgetId(elem)) return
        const widgetId = jb.ui.headlessWidgetId(el) || '_local_'
        groupByWidgets[widgetId] = groupByWidgets[widgetId] || { cmps: []}
        const destroyCtxs = (el.getAttribute('methods')||'').split(',').filter(x=>x.indexOf('destroy-') == 0).map(x=>x.split('destroy-').pop())
        const cmpId = el.getAttribute('cmp-id'), ver = el.getAttribute('cmp-ver')
        groupByWidgets[widgetId].cmps.push({cmpId,ver,el,destroyCtxs})
    })
    jb.entries(groupByWidgets).forEach(([widgetId,val])=>
        jb.ui.BECmpsDestroyNotification.next({
            widgetId, cmps: val.cmps,
            destroyLocally: widgetId == '_local_',
            destroyWidget: jb.ui.findIncludeSelf(elem,`[widgetid="${widgetId}"]`).length,
    }))
}

function render(vdom,parentElem,prepend) {
    jb.log('render',[...arguments])
    function doRender(vdom,parentElem) {
        jb.log('dom createElement',[...arguments])
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
        const userReq = jb.ui.rawEventToUserRequest(ev,specificMethod)
        if (!userReq) return
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
        const widgetId = jb.ui.frontendWidgetId(elem) || ev.tstWidgetId
        return ctxIdToRun && {$:'runCtxAction', widgetId, ctxIdToRun, vars: {ev: jb.ui.buildUserEvent(ev, elem)} }
    },
    calcElemProps(elem) {
        return elem instanceof jb.ui.VNode ? {} : { 
            outerHeight: jb.ui.outerHeight(elem), outerWidth: jb.ui.outerWidth(elem), 
            clientRect: elem.getBoundingClientRect() 
        }
    },
    buildUserEvent(ev, elem) {
        if (!ev) return null
        const userEvent = {
            value: (ev.target || {}).value, 
            elem: jb.ui.calcElemProps(elem),
            ev: {},
        }
        const evProps = (elem.getAttribute('userEventProps') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] != 'elem')
        const elemProps = (elem.getAttribute('userEventProps') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] == 'elem').map(x=>x.split('.')[1])
        ;['type','keyCode','ctrlKey','alyKey','clientX','clientY', ...evProps].forEach(prop=> ev[prop] != null && (userEvent.ev[prop] = ev[prop]))
        ;['id', 'class', ...elemProps].forEach(prop=>userEvent.elem[prop] = elem.getAttribute(prop))
        elem._component && elem._component.enrichUserEvent(ev,userEvent)
        if (ev.fixedTarget) userEvent.elem = jb.ui.calcElemProps(ev.fixedTarget) // enrich UserEvent can 'fix' the target, e.g. picking the selected node in tree
        return userEvent
    },
    ctxIdOfMethod(elem,action) {
        if (action.match(/^[0-9]+$/)) return action
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
        const widgetId = jb.ui.frontendWidgetId(elem)
        const ctxIdToRun = jb.ui.ctxIdOfMethod(elem,method)
        if (!ctxIdToRun)
            return jb.logError(`no method in cmp: ${method}`, elem, data, vars)

        if (widgetId)
            jb.ui.widgetUserRequests.next({$:'runCtxAction', widgetId, ctxIdToRun, data, vars })
        else {
            if (!jb.ctxDictionary[ctxIdToRun])
                return jb.logError(`no ctx found for method: ${method} ${ctxIdToRun}`, elem, data, vars)
            jb.log('backend method',[method,elem,data,vars])
            jb.ui.runCtxAction(jb.ctxDictionary[ctxIdToRun],data,vars)
        }
    },
})

Object.assign(jb.ui, {
    h, render, unmount, applyNewVdom, applyDeltaToDom, applyDeltaToVDom, elemToVdom, mountFrontEnd, compareVdom, refreshFrontEnd,
    BECmpsDestroyNotification: jb.callbag.subject(),
    renderingUpdates: jb.callbag.subject(),
    takeUntilCmpDestroyed(cmp) {
        const {pipe,take,Do,filter,takeUntil} = jb.callbag
        return takeUntil(pipe(jb.ui.BECmpsDestroyNotification,
            filter(x=>x.cmps.find(_cmp => _cmp.cmpId == cmp.cmpId && _cmp.ver == cmp.ver)),
            Do(() => jb.log('uiComp backend takeUntilCmpDestroyed',[cmp.cmpId,cmp])),
            take(1),
        ))
    },
    ctrl(context,options) {
        const $state = context.vars.$refreshElemCall ? context.vars.$state : {}
        const cmpId = context.vars.$cmpId, cmpVer = context.vars.$cmpVer
        if (!context.vars.$serviceRegistry)
            jb.logError('no serviceRegistry',context)
        const ctx = context.setVars({
            $model: { ctx: context, ...context.params},
            $state,
            $serviceRegistry: context.vars.$serviceRegistry,
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
   
        const used = 'jb-ctx,full-cmp-ctx,pick-ctx,props-ctx,methods,frontEnd,originators'.split(',')
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
            return jb.ui.headless ? [...Object.values(jb.ui.headless).flatMap(w=>w.body.querySelectorAll(query,{includeSelf:true})), ...Array.from(document.querySelectorAll(query))] : []
        }
    },
    applyDeltaToCmp(delta, ctx, cmpId, elem) {
        if (!delta) return
        elem = elem || jb.ui.elemOfCmp(ctx,cmpId)
        if (delta.$prevVersion && delta.$prevVersion != elem.getAttribute('cmp-ver')) {
            jb.logError('trying to apply delta to unexpeced verson',[delta, ctx, cmpId, elem])
            return
        }
        jb.log('applyDelta uiComp',[delta, ctx, cmpId, elem])
        if (elem instanceof jb.ui.VNode) {
            jb.ui.applyDeltaToVDom(elem, delta)
            jb.ui.renderingUpdates.next({delta,cmpId,widgetId: ctx.vars.headlessWidgetId})
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
        jb.log('dom refresh check',[jb.ui.cmpV(cmp),ctx,cmp, ...arguments]);

        if (jb.path(options,'cssOnly')) {
            const existingClass = (elem.className.match(/(w|jb-)[0-9]+/)||[''])[0]
            const cssStyleElem = Array.from(document.querySelectorAll('style')).map(el=>({el,txt: el.innerText})).filter(x=>x.txt.indexOf(existingClass + ' ') != -1)[0].el
            jb.log('dom refresh css',[cmp.cssLines,ctx,cmp, ...arguments])
            return jb.ui.hashCss(cmp.calcCssLines(),cmp.ctx,{existingClass, cssStyleElem})
        }
        const hash = cmp.init()
        if (hash != null && hash == elem.getAttribute('cmpHash'))
            return jb.log('refresh dom stopped by hash',[hash, ...arguments])
        jb.log('dom refresh',[jb.ui.cmpV(cmp),ctx,cmp, ...arguments])
        cmp && applyNewVdom(elem, h(cmp), {strongRefresh, ctx})
        //jb.execInStudio({ $: 'animate.refreshElem', elem: () => elem })
    },

    subscribeToRefChange: watchHandler => jb.subscribe(watchHandler.resourceChange, e=> {
        const changed_path = watchHandler.removeLinksFromPath(e.insertedPath || watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //observe="resources://2~name;person~name
        const findIn = jb.path(e,'srcCtx.vars.headlessWidgetId') || jb.path(e,'srcCtx.vars.testID') ? e.srcCtx : jb.frame.document
        const elemsToCheck = jb.ui.find(findIn,'[observe]')
        const elemsToCheckCtxBefore = elemsToCheck.map(el=>el.getAttribute('jb-ctx'))
        jb.log('check observableElems',[elemsToCheck,e])
        elemsToCheck.forEach((elem,i) => {
            //.map((elem,i) => ({elem,i, phase: phaseOfElem(elem,i) })).sort((x1,x2)=>x1.phase-x2.phase).forEach(({elem,i}) => {
            if (elemsToCheckCtxBefore[i] != elem.getAttribute('jb-ctx')) return // the elem was already refreshed during this process, probably by its parent
            let refresh = false, strongRefresh = false, cssOnly = true
            elem.getAttribute('observe').split(',').map(obsStr=>observerFromStr(obsStr,elem)).filter(x=>x).forEach(obs=>{
                if (!obs.allowSelfRefresh && jb.ui.findIncludeSelf(elem,`[cmp-id="${jb.path(e.srcCtx, 'vars.cmp.cmpId')}"]`)[0]) 
                    return jb.log('blocking self refresh observableElems',[elem, obs,e])
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
                    jb.log('refresh observableElems',[elem,e.srcCtx,obs,e])
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
        this.state = { ...elem.state, ...(keepState && jb.path(elem._component,'state')), frontEndStatus: 'initializing' }
        this.base = elem
        this.cmpId = elem.getAttribute('cmp-id')
        this.ver= elem.getAttribute('cmp-ver')
        this.destroyed = new Promise(resolve=>this.resolveDestroyed = resolve)
        elem._component = this
        this.runFEMethod('calcProps',null,null,true)
        this.runFEMethod('init',null,null,true)
        ;(elem.getAttribute('eventHandlers') || '').split(',').forEach(h=>{
            const [event,ctxId] = h.split('-')
            elem.addEventListener(event, ev => jb.ui.handleCmpEvent(ev,ctxId))
        })
        this.state.frontEndStatus = 'ready'
    }
    runFEMethod(method,data,_vars,silent) {
        if (this.state.frontEndStatus != 'ready' && ['init','calcProps'].indexOf(method) == -1)
            return jb.logError('frontEnd - running method before init', [jb.ui.cmpV(this),this, ...arguments])
        const toRun = (this.base.frontEndMethods || []).filter(x=>x.method == method)
        if (toRun.length == 0 && !silent)
            return jb.logError(`frontEnd - no method ${method}`,this)
        toRun.forEach(({path}) => tryWrapper(() => {
            const profile = path.split('~').reduce((o,p)=>o[p],jb.comps)
            const feMEthod = jb.run( new jb.jbCtx(this.ctx, { profile, path }))
            const vars = {cmp: this, $state: this.state, el: this.base, ...this.base.vars, ..._vars }
            const ctxToUse = this.ctx.setData(data).setVars(vars)
            if (feMEthod.frontEndMethod._prop)
                jb.log('frontend uiComp prop',[jb.ui.cmpV(this),feMEthod.frontEndMethod._prop,this.base,feMEthod.frontEndMethod,ctxToUse])
            else if (feMEthod.frontEndMethod._flow)
                jb.log('frontend uiComp flow',[jb.ui.cmpV(this),this.base,...feMEthod.frontEndMethod._flow,feMEthod.frontEndMethod,ctxToUse])
            else 
                jb.log('frontend uiComp method',[jb.ui.cmpV(this),method,this.base,feMEthod.frontEndMethod,ctxToUse])
            ctxToUse.run(feMEthod.frontEndMethod.action)
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
        jb.log('frontend uiComp refresh request',[jb.ui.cmpV(this),...arguments])
        if (this._deleted) return
        Object.assign(this.state, state)
        this.base.state = this.state
        ui.refreshElem(this.base,this.state,options)
    }
    refreshFE(state) {
        if (this._deleted) return
        Object.assign(this.state, state)
        this.base.state = this.state
        this.runFEMethod('onRefresh',null,null,true)
    }    
    newVDomApplied() {
        Object.assign(this.state,{...this.base.state}) // update state from BE
        this.runFEMethod('onRefresh',null,null,true)
    }
    destroyFE() {
        this._deleted = true
        this.runFEMethod('destroy',null,null,true)
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
    const {widgetId,destroyLocally,cmps} = e
    if (widgetId && !destroyLocally)
        jb.ui.widgetUserRequests.next({$:'destroy', ...e })
    else 
        cmps.forEach(cmp=>cmp.destroyCtxs.forEach(ctxIdToRun => {
            jb.log('backend method destroy uiComp',[cmp.cmpId, cmp.el])
            jb.ui.runCtxAction(jb.ctxDictionary[ctxIdToRun])
        } ))
})(jb.ui.BECmpsDestroyNotification)

})()