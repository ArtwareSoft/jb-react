(function(){
jb.ui = jb.ui || {}
const ui = jb.ui
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,{ f, ctx: this && this.ctx }) }}

function h(cmpOrTag,attributes,children) {
    if (cmpOrTag instanceof ui.VNode) return cmpOrTag // Vdom
    if (cmpOrTag && cmpOrTag.renderVdom)
        return cmpOrTag.renderVdomAndFollowUp()
   
    return new jb.ui.VNode(cmpOrTag,attributes,children)
}

function compareVdom(b,after,ctx) {
    const a = after instanceof ui.VNode ? ui.stripVdom(after) : after
    jb.log('vdom diff compare',{before: b,after : a,ctx})
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
            return { 0: {...compareVdom(b[0],a[0],ctx),__afterIndex: 0}, length: 1 }
        jb.log('vdom child diff start',{before: b,after: a,ctx})
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
                const innerDiff = { __afterIndex, ...compareVdom(e, a[__afterIndex],ctx), ...(e.$remount ? {remount: true}: {}) }
                if (Object.keys(innerDiff).length > 1) {
                    res[i] = innerDiff
                    res.length = i+1
                }
            }
        })
        res.toAppend = a.flatMap((e,i) => reused[i] ? [] : [ Object.assign( e, {__afterIndex: i}) ])
        jb.log('vdom child diff result',{res,before: b,after: a,ctx})
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
    jb.log('applyNew vdom',{widgetId,elem,vdomAfter,strongRefresh, ctx})
    if (widgetId) {
        const cmpId = elem.getAttribute('cmp-id')
        const delta = compareVdom(elem,vdomAfter,ctx)
        const assumedVdom = JSON.parse(JSON.stringify(jb.ui.stripVdom(elem)))
        if (elem != vdomAfter) { // update the elem
            ;(elem.children ||[]).forEach(ch=>ch.parentNode = null)
            Object.keys(elem).filter(x=>x !='parentNode').forEach(k=>delete elem[k])
            Object.assign(elem,vdomAfter)
            ;(vdomAfter.children ||[]).forEach(ch=>ch.parentNode = elem)
        }
        jb.ui.renderingUpdates.next({assumedVdom, delta,cmpId,widgetId})
        return
    }
    const active = jb.ui.activeElement() === elem
    if (vdomAfter.tag != elem.tagName.toLowerCase() || strongRefresh) {
        unmount(elem)
        const newElem = render(vdomAfter,elem.parentElement)
        elem.parentElement.replaceChild(newElem,elem)
        jb.log('replaceTop vdom',{newElem,elem})
        elem = newElem
    } else {
        const vdomBefore = elem instanceof ui.VNode ? elem : elemToVdom(elem)
        const delta = compareVdom(vdomBefore,vdomAfter,ctx)
        jb.log('apply delta top dom',{vdomBefore,vdomAfter,active,elem,vdomAfter,strongRefresh, delta, ctx})
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
    if (elem instanceof jb.ui.VNode) return elem
    if (elem.getAttribute('jb_external')) return
    return {
        tag: elem.tagName.toLowerCase(),
        attributes: jb.objFromEntries([
            ...Array.from(elem.attributes).map(e=>[e.name,e.value]), 
            ...(jb.path(elem,'firstChild.nodeName') == '#text' ? [['$text',elem.firstChild.nodeValue]] : [])
        ]),
        ...( elem.childElementCount && { children: Array.from(elem.children).map(el=> elemToVdom(el)).filter(x=>x) })
    }
}

function applyDeltaToDom(elem,delta) {
    jb.log('applyDelta dom',{elem,delta})
    const children = delta.children
    if (children) {
        const childrenArr = children.length ? Array.from(Array(children.length).keys()).map(i=>children[i]) : []
        const childElems = Array.from(elem.children)
        const {toAppend,deleteCmp,sameOrder,resetAll} = children
        if (resetAll) 
            Array.from(elem.children).forEach(toDelete=>removeChild(toDelete))
        if (deleteCmp) 
            Array.from(elem.children)
                .filter(ch=>ch.getAttribute('cmp-id') == deleteCmp)
                .forEach(toDelete=>removeChild(toDelete))

        childrenArr.forEach((e,i) => {
            if (!e) {
                !sameOrder && (childElems[i].setAttribute('__afterIndex',''+i))
            } else if (e.$ == 'delete') {
                unmount(childElems[i])
                elem.removeChild(childElems[i])
                jb.log('removeChild dom',{childElem: childElems[i],e,elem,delta})
            } else {
                applyDeltaToDom(childElems[i],e)
                !sameOrder && (childElems[i].setAttribute('__afterIndex',e.__afterIndex))
            }
        })
        ;(toAppend||[]).forEach(e=>{
            const newElem = render(e,elem)
            jb.log('appendChild dom',{newElem,e,elem,delta})
            !sameOrder && (newElem.setAttribute('__afterIndex',e.__afterIndex))
        })
        if (sameOrder === false) {
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
                    jb.log('removeChild dom leftover',{ch,elem,delta})
                })
    }
    jb.entries(delta.attributes)
        .filter(e=> !(e[0] === '$text' && elem.firstElementChild) ) // elem with $text should not have children
        .forEach(e=> setAtt(elem,e[0],e[1]))
    
    function removeChild(toDelete) {
        unmount(toDelete)
        elem.removeChild(toDelete)
        jb.log('removeChild dom',{toDelete,elem,delta})
    }
}

function applyDeltaToVDom(elem,delta) {
    if (!elem) return
    jb.log('applyDelta vdom',{elem,delta})
    // supports only append/delete
    if (delta.children) {
        const toAppend = delta.children.toAppend || []
        const {resetAll, deleteCmp} = delta.children
        if (resetAll) {
            elem.children && elem.children.forEach(ch => ch.parentNode = null)
            elem.children = []
        }
        if (deleteCmp) {
            const index = elem.children.findIndex(ch=>ch.getAttribute('cmp-id') == deleteCmp)
            if (index != -1) {
                elem.children[index] && (elem.children[index].parentNode = null)
                elem.children.splice(index,1)
            }
        }
        toAppend.forEach(ch => { 
            elem.children = elem.children || []
            elem.children.push(jb.ui.unStripVdom(ch,elem))
        })
        Object.keys(delta.children).filter(x=>!isNaN(x)).forEach(index=>
                applyDeltaToVDom(elem.children[+index],delta.children[index]))
    }

    Object.assign(elem.attributes,delta.attributes)
}

function setAtt(elem,att,val) {
    if (val == '__undefined') val = null
    if (att[0] !== '$' && val == null) {
        elem.removeAttribute(att)
        jb.log('dom change remove',{elem,att,val})
    } else if (att.indexOf('on-') == 0 && val != null && !elem[`registeredTo-${att}`]) {
        elem.addEventListener(att.slice(3), ev => jb.ui.handleCmpEvent(ev,val))
        elem[`registeredTo-${att}`] = true
    } else if (att.indexOf('on-') == 0 && val == null) {
        elem.removeEventListener(att.slice(3), ev => jb.ui.handleCmpEvent(ev,val))
        elem[`registeredTo-${att}`] = false
    } else if (att === 'checked' && elem.tagName.toLowerCase() === 'input') {
        elem.setAttribute(att,val)
        jb.delay(1).then(()=> { // browser bug?
            elem.checked = true
            jb.log('dom set checked',{elem,att,val})
        })
    } else if (att.indexOf('$__input') === 0) {
        try {
            setInput(JSON.parse(val))
        } catch(e) {}
    } else if (att.indexOf('$__') === 0) {
        const id = att.slice(3)
        try {
            elem[id] = JSON.parse(val) || ''
        } catch (e) {}
        jb.log(`dom set data ${id}`,{elem,att,val})
    } else if (att === '$focus' && val) {
        elem.setAttribute('__focus',val)
        jb.ui.focus(elem,val)
    } else if (att === '$scrollDown' && val) {
        elem.__appScroll = true
        elem.scrollTop = elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1
    } else if (att === '$scrollDown' && val == null) {
        delete elem.__appScroll
    } else if (att === '$text') {
        elem.innerText = val || ''
        jb.log('dom set text',{elem,att,val})
    } else if (att === '$html') {
        elem.innerHTML = val || ''
        jb.log('dom set html',{elem,att,val})
    } else if (att === 'style' && typeof val === 'object') {
        elem.setAttribute(att,jb.entries(val).map(e=>`${e[0]}:${e[1]}`).join(';'))
        jb.log('dom set style',{elem,att,val})
    } else if (att == 'value' && elem.tagName.match(/select|input|textarea/i) ) {
        const active = document.activeElement === elem
        if (elem.value == val) return
        elem.value = val
        if (active && document.activeElement !== elem) { debugger; elem.focus() }
        jb.log('dom set elem value',{elem,att,val})
    } else {
        elem.setAttribute(att,val)
        //jb.log('dom set att',{elem,att,val}) to many calls
    }

    function setInput({assumedVal,newVal,selectionStart}) {
        const el = jb.ui.findIncludeSelf(elem,'input,textarea')[0]
        jb.log('dom set input check',{el, assumedVal,newVal,selectionStart})
        if (!el)
            return jb.logError('setInput: can not find input under elem',{elem})
        if (assumedVal != el.value) 
            return jb.logError('setInput: assumed val is not as expected',{ assumedVal, value: el.value, el })
        const active = document.activeElement === el
        jb.log('dom set input',{el, assumedVal,newVal,selectionStart})
        el.value = newVal
        if (typeof selectionStart == 'number') 
            el.selectionStart = selectionStart
        if (active && document.activeElement !== el) { debugger; el.focus() }
    }
}

function unmount(elem) {
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
    jb.log('unmount',{elem,groupByWidgets})
    jb.entries(groupByWidgets).forEach(([widgetId,val])=>
        jb.ui.BECmpsDestroyNotification.next({
            widgetId, cmps: val.cmps,
            destroyLocally: widgetId == '_local_',
            destroyWidget: jb.ui.findIncludeSelf(elem,`[widgetid="${widgetId}"]`).length,
    }))
}

function render(vdom,parentElem,prepend) {
    jb.log('render',{vdom,parentElem,prepend})
    function doRender(vdom,parentElem) {
        jb.log('dom createElement',{tag: vdom.tag, vdom,parentElem})
        const elem = createElement(parentElem.ownerDocument, vdom.tag)
        jb.entries(vdom.attributes).forEach(e=>setAtt(elem,e[0],e[1]))
        jb.asArray(vdom.children).map(child=> doRender(child,elem)).forEach(el=>elem.appendChild(el))
        prepend ? parentElem.prepend(elem) : parentElem.appendChild(elem)
        return elem
    }
    const res = doRender(vdom,parentElem)
    ui.findIncludeSelf(res,'[interactive]').forEach(el=> mountFrontEnd(el))
    // check
    const checkResultingVdom = elemToVdom(res)
    const diff = jb.ui.vdomDiff(checkResultingVdom,vdom)
    if (checkResultingVdom && Object.keys(diff).length)
        jb.logError('render diff',{diff,checkResultingVdom,vdom})

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
        jb.log('handle cmp event',{ev,specificMethod,userReq})
        if (!userReq) return
        if (userReq.widgetId)
            jb.ui.widgetUserRequests.next(userReq)
        else {
            const ctx = jb.ctxDictionary[userReq.ctxIdToRun]
            if (!ctx)
                jb.logError(`handleCmpEvent - no ctx in dictionary for id ${userReq.ctxIdToRun}`,{ev,specificMethod})
            ctx && jb.ui.runCtxAction(ctx,userReq.data,userReq.vars)
        }
    },
    rawEventToUserRequest(ev, specificMethod) {
        const elem = jb.ui.closestCmpElem(ev.currentTarget)
        //const elem = jb.ui.parents(ev.currentTarget,{includeSelf: true}).find(el=> el.getAttribute && el.getAttribute('jb-ctx') != null)
        if (!elem) 
            return jb.logError('rawEventToUserRequest can not find closest elem with jb-ctx',{ev})
        const method = specificMethod && typeof specificMethod == 'string' ? specificMethod : `on${ev.type}Handler`
        const ctxIdToRun = jb.ui.ctxIdOfMethod(elem,method)
        const widgetId = jb.ui.frontendWidgetId(elem) || ev.tstWidgetId
        return ctxIdToRun && {$:'runCtxAction', method, widgetId, ctxIdToRun, vars: {ev: jb.ui.buildUserEvent(ev, elem)} }
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
        const evProps = (elem.getAttribute('usereventprops') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] != 'elem')
        const elemProps = (elem.getAttribute('usereventprops') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] == 'elem').map(x=>x.split('.')[1])
        ;['type','keyCode','ctrlKey','altKey','clientX','clientY', ...evProps].forEach(prop=> ev[prop] != null && (userEvent.ev[prop] = ev[prop]))
        ;['id', 'class', ...elemProps].forEach(prop=>userEvent.elem[prop] = elem.getAttribute(prop))
        jb.path(elem,'_component.enrichUserEvent') && elem._component.enrichUserEvent(ev,userEvent)
        if (ev.fixedTarget) userEvent.elem = jb.ui.calcElemProps(ev.fixedTarget) // enrich UserEvent can 'fix' the target, e.g. picking the selected node in tree
        return userEvent
    },
    ctxIdOfMethod(elem,action) {
        if (action.match(/^[0-9]+$/)) return action
        return (elem.getAttribute('methods') || '').split(',').filter(x=>x.indexOf(action+'-') == 0)
            .map(str=>str.split('-')[1])
            .filter(x=>x)[0]
    },
    runCtxActionAndUdateCmpState(ctx,data,vars) {
        if (jb.path(vars,'$updateCmpState.cmpId') == jb.path(ctx.vars,'cmp.cmpId') && jb.path(vars,'$updateCmpState.state'))
            Object.assign(ctx.vars.cmp.state,vars.$updateCmpState.state)
        ctx.setData(data).setVars(vars).runInner(ctx.profile.action,'action','action')        
    },    
    runCtxAction(ctx,data,vars) {
        ctx.setData(data).setVars(vars).runInner(ctx.profile.action,'action','action')        
    },
    runBEMethodInAnyContext(ctx,method,data,vars) {
        const cmp = ctx.vars.cmp
        if (cmp instanceof jb.ui.JbComponent)
            cmp.runBEMethod(method,data,vars ? {...ctx.vars, ...vars} : ctx.vars)
        else
            jb.ui.runBEMethod(cmp.base,method,data,
                    {$updateCmpState: {state: cmp.state, cmpId: cmp.cmpId}, $state: cmp.state, ev: ctx.vars.ev, ...vars})
    },
    runBEMethod(elem,method,data,vars) {
        if (!elem)
            return jb.logError(`runBEMethod, no elem provided: ${method}`, {elem, data, vars})
        const widgetId = jb.ui.frontendWidgetId(elem)
        const ctxIdToRun = jb.ui.ctxIdOfMethod(elem,method)
        if (!ctxIdToRun)
            return jb.logError(`no method in cmp: ${method}`, {elem, data, vars})

        if (widgetId)
            jb.ui.widgetUserRequests.next({$:'runCtxAction', method, widgetId, ctxIdToRun, data, vars })
        else {
            const ctx = jb.ctxDictionary[ctxIdToRun]
            if (!ctx)
                return jb.logError(`no ctx found for method: ${method}`, {ctxIdToRun, elem, data, vars})
    
            jb.log(`backend method request: ${method}`,{cmp: ctx.vars.cmp, method,ctx,elem,data,vars})
            jb.ui.runCtxActionAndUdateCmpState(ctx,data,vars)
        }
    }
})

Object.assign(jb.ui, {
    h, render, unmount, applyNewVdom, applyDeltaToDom, applyDeltaToVDom, elemToVdom, mountFrontEnd, compareVdom, refreshFrontEnd,
    BECmpsDestroyNotification: jb.callbag.subject(),
    refreshNotification: jb.callbag.subject(),
    renderingUpdates: jb.callbag.subject(),
    followUps: {},
    ctrl(context,options) {
        const styleByControl = jb.path(context,'cmpCtx.profile.$') == 'styleByControl'
        const $state = (context.vars.$refreshElemCall || styleByControl) ? context.vars.$state : {}
        const cmpId = context.vars.$cmpId, cmpVer = context.vars.$cmpVer
        if (!context.vars.$serviceRegistry)
            jb.logError('no serviceRegistry',{ctx: context})
        const ctx = context.setVars({
            $model: { ctx: context, ...context.params},
            $state,
            $serviceRegistry: context.vars.$serviceRegistry,
            $refreshElemCall : undefined, $props : undefined, cmp: undefined, $cmpId: undefined, $cmpVer: undefined 
        })
        const styleOptions = runEffectiveStyle(ctx) || {}
        if (styleOptions instanceof ui.JbComponent)  {// style by control
            return styleOptions.orig(ctx).jbExtend(options,ctx).applyParamFeatures(ctx)
        }
        return new ui.JbComponent(ctx,cmpId,cmpVer).jbExtend(options,ctx).jbExtend(styleOptions,ctx).applyParamFeatures(ctx)
    
        function runEffectiveStyle(ctx) {
            const profile = context.profile
            const defaultVar = '$theme.' + (profile.$ || '')
            if (!profile.style && context.vars[defaultVar])
                return ctx.run({$:context.vars[defaultVar]})
            return context.params.style ? context.params.style(ctx) : {}
        }
    },
    garbageCollectCtxDictionary(forceNow,clearAll) {
        if (!forceNow)
            return jb.delay(1000).then(()=>ui.garbageCollectCtxDictionary(true))
   
        const used = 'jb-ctx,full-cmp-ctx,pick-ctx,props-ctx,methods,frontEnd,originators'.split(',')
            .flatMap(att=>querySelectAllWithWidgets(`[${att}]`)
                .flatMap(el => el.getAttribute(att).split(',').map(x=>Number(x.split('-').pop())).filter(x=>x)))
                    .sort((x,y)=>x-y)

        // remove unused ctx from dictionary
        const dict = Object.keys(jb.ctxDictionary).map(x=>Number(x)).sort((x,y)=>x-y)
        let lastUsedIndex = 0;
        const removedCtxs = [], removedResources = [], maxUsed = used.slice(-1)[0] || (clearAll ? Number.MAX_SAFE_INTEGER : 0)
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

        // remove front-end widgets
        const usedWidgets = jb.objFromEntries(
            Array.from(querySelectAllWithWidgets(`[widgetid]`)).filter(el => el.getAttribute('frontend')).map(el => [el.getAttribute('widgetid'),1]))
        const removeWidgets = Object.keys(jb.ui.frontendWidgets).filter(id=>!usedWidgets[id])

        removeWidgets.forEach(widgetId => {
            jb.ui.widgetUserRequests.next({$:'destroy', widgetId, destroyWidget: true, cmps: [] })
            delete jb.ui.frontendWidgets[widgetId]
        })
        
        // remove component follow ups
        const removeFollowUps = Object.keys(jb.ui.followUps).flatMap(cmpId=> {
            const curVer = Array.from(querySelectAllWithWidgets(`[cmp-id="${cmpId}"]`)).map(el=>+el.getAttribute('cmp-ver'))[0]
            return jb.ui.followUps[cmpId].flatMap(({cmp})=>cmp).filter(cmp => !curVer || cmp.ver > curVer)
        })
        if (removeFollowUps.length)
            jb.ui.BECmpsDestroyNotification.next({ cmps: removeFollowUps})

        jb.log('garbageCollect',{maxUsed,removedCtxs,removedResources,removeWidgets,removeFollowUps})

        function querySelectAllWithWidgets(query) {
            return jb.ui.headless ? [...Object.values(jb.ui.headless).flatMap(w=>w.body.querySelectorAll(query,{includeSelf:true})), ...Array.from(document.querySelectorAll(query))] : []
        }
    },
    applyDeltaToCmp({delta, ctx, cmpId, elem, assumedVdom}) {
        if (!delta) return
        elem = elem || jb.ui.elemOfCmp(ctx,cmpId)
        if (!elem || delta._$prevVersion && delta._$prevVersion != elem.getAttribute('cmp-ver')) {
            const reason = elem ? 'unexpected version' : 'elem not found'
            jb.logError(`applyDeltaToCmp: ${reason}`,{reason, delta, ctx, cmpId, elem})
            return // { recover: true, reason }
        }
        if (assumedVdom) {
            const actualVdom = elemToVdom(elem)
            const diff = jb.ui.vdomDiff(assumedVdom,actualVdom)
            if (Object.keys(diff).length) {
                jb.logError('wrong assumed vdom',{actualVdom, assumedVdom, diff, delta, ctx, cmpId, elem})
                return { recover: true, reason: { diff, description: 'wrong assumed vdom'} }
            }
        }
        const bySelector = delta._$bySelector && Object.keys(delta._$bySelector)[0]
        const actualElem = bySelector ? jb.ui.find(elem,bySelector)[0] : elem
        const actualdelta = bySelector ? delta._$bySelector[bySelector] : delta
        jb.log('applyDelta uiComp',{cmpId, delta, ctx, elem, bySelector, actualElem})
        if (actualElem instanceof jb.ui.VNode) {
            jb.ui.applyDeltaToVDom(actualElem, actualdelta)
            jb.ui.renderingUpdates.next({delta,cmpId,widgetId: ctx.vars.headlessWidgetId})
        } else if (actualElem) {
            jb.ui.applyDeltaToDom(actualElem, actualdelta)
            jb.ui.refreshFrontEnd(actualElem)
        }
    },
    refreshElem(elem, state, options) {
        if (jb.path(elem,'_component.state.frontEndStatus') == 'initializing' || jb.ui.findIncludeSelf(elem,'[__refreshing]')[0]) 
            return jb.logError('circular refresh',{elem, state, options})
        const cmpId = elem.getAttribute('cmp-id'), cmpVer = +elem.getAttribute('cmp-ver')
        const _ctx = ui.ctxOfElem(elem)
        if (!_ctx) 
            return jb.logError('refreshElem - no ctx for elem',{elem, cmpId, cmpVer})
        const strongRefresh = jb.path(options,'strongRefresh')
        let ctx = _ctx.setVar('$state', strongRefresh ? {refresh: true } : 
            {refresh: true, ...jb.path(elem._component,'state'), ...state}) // strongRefresh kills state

        if (options && options.extendCtx)
            ctx = options.extendCtx(ctx)
        ctx = ctx.setVar('$refreshElemCall',true).setVar('$cmpId', cmpId).setVar('$cmpVer', cmpVer+1) // special vars for refresh
        if (jb.ui.inStudio()) // updating to latest version of profile
            ctx.profile = jb.execInStudio({$: 'studio.val', path: ctx.path}) || ctx.profile
        elem.setAttribute('__refreshing','')
        const cmp = ctx.profile.$ == 'openDialog' ? ctx.run(dialog.buildComp()) : ctx.runItself()
        jb.log('refresh elem start',{cmp,ctx,elem, state, options})

        if (jb.path(options,'cssOnly')) {
            const existingClass = (elem.className.match(/(w|jb-)[0-9]?-[0-9]+/)||[''])[0]
            const cssStyleElem = Array.from(document.querySelectorAll('style')).map(el=>({el,txt: el.innerText})).filter(x=>x.txt.indexOf(existingClass + ' ') != -1)[0].el
            jb.log('refresh element css only',{cmp, lines: cmp.cssLines,ctx,elem, state, options})
            jb.ui.hashCss(cmp.calcCssLines(),cmp.ctx,{existingClass, cssStyleElem})
        } else {
            jb.log('do refresh element',{cmp,ctx,elem, state, options})
            cmp && applyNewVdom(elem, h(cmp), {strongRefresh, ctx})
        }
        elem.removeAttribute('__refreshing')
        jb.ui.refreshNotification.next({cmp,ctx,elem, state, options})
        //jb.execInStudio({ $: 'animate.refreshElem', elem: () => elem })
    },

    subscribeToRefChange: watchHandler => jb.subscribe(watchHandler.resourceChange, e=> {
        const changed_path = watchHandler.removeLinksFromPath(e.insertedPath || watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //observe="resources://2~name;person~name
        const body = jb.path(e,'srcCtx.vars.headlessWidgetId') || jb.path(e,'srcCtx.vars.testID') ? jb.ui.widgetBody(e.srcCtx) : jb.frame.document.body
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
            let refresh = false, strongRefresh = false, cssOnly = true
            elem.getAttribute('observe').split(',').map(obsStr=>observerFromStr(obsStr,elem)).filter(x=>x).forEach(obs=>{
                if (!obs.allowSelfRefresh && jb.ui.findIncludeSelf(elem,`[cmp-id="${originatingCmpId}"]`)[0]) 
                    return jb.log('blocking self refresh observableElems',{cmpId,originatingCmpId,elem, obs,e})
                const obsPath = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(obs.ref))
                if (!obsPath)
                    return jb.logError('observer ref path is empty',{originatingCmpId,cmpId,obs,e})
                strongRefresh = strongRefresh || obs.strongRefresh
                cssOnly = cssOnly && obs.cssOnly
                const diff = ui.comparePaths(changed_path, obsPath)
                const isChildOfChange = diff == 1
                const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
                const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
                if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure)
                    refresh = true
            })
            if (refresh) {
                jb.log('refresh from observable elements',{cmpId,originatingCmpId,elem,ctx: e.srcCtx,e})
                refresh && ui.refreshElem(elem,null,{srcCtx: e.srcCtx, strongRefresh, cssOnly})
            }
        })

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
        this.pt = elem.getAttribute('cmp-pt')
        this.destroyed = new Promise(resolve=>this.resolveDestroyed = resolve)
        this.flows= []
        elem._component = this
        this.runFEMethod('calcProps',null,null,true)
        this.runFEMethod('init',null,null,true)
        ;(elem.getAttribute('eventhandlers') || '').split(',').forEach(h=>{
            const [event,ctxId] = h.split('-')
            elem.addEventListener(event, ev => jb.ui.handleCmpEvent(ev,ctxId))
        })
        this.state.frontEndStatus = 'ready'
    }
    runFEMethod(method,data,_vars,silent) {
        if (this.state.frontEndStatus != 'ready' && ['init','calcProps'].indexOf(method) == -1)
            return jb.logError('frontEnd - running method before init', {cmp: {...this}, method,data,_vars})
        const toRun = (this.base.frontEndMethods || []).filter(x=>x.method == method)
        if (toRun.length == 0 && !silent)
            return jb.logError(`frontEnd - no method ${method}`,{cmp: {...this}})
        toRun.forEach(({path}) => tryWrapper(() => {
            const profile = path.split('~').reduce((o,p)=>o[p],jb.comps)
            const srcCtx = new jb.jbCtx(this.ctx, { profile, path, forcePath: path })
            const feMEthod = jb.run(srcCtx)
            const el = this.base
            const vars = {cmp: this, $state: this.state, el, ...this.base.vars, ..._vars }
            const ctxToUse = this.ctx.setData(data).setVars(vars)
            const {_prop, _flow } = feMEthod.frontEndMethod
            if (_prop)
                jb.log(`frontend uiComp calc prop ${_prop}`,{cmp: {...this}, srcCtx, ...feMEthod.frontEndMethod, el,ctxToUse})
            else if (_flow)
                jb.log(`frontend uiComp start flow ${jb.ui.rxPipeName(_flow)}`,{cmp: {...this}, srcCtx, ...feMEthod.frontEndMethod, el, ctxToUse})
            else 
                jb.log(`frontend uiComp run method ${method}`,{cmp: {...this}, srcCtx , ...feMEthod.frontEndMethod,el,ctxToUse})
            const res = ctxToUse.run(feMEthod.frontEndMethod.action)
            if (_flow) this.flows.push(res)
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
        jb.log('frontend uiComp refresh request',{cmp: {...this} , state, options})
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
        this.ver= this.base.getAttribute('cmp-ver')
        this.runFEMethod('onRefresh',null,null,true)
    }
    destroyFE() {
        this._deleted = true
        this.flows.forEach(flow=>flow.dispose())
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
    
    cmps.forEach(_cmp => {
        const fus = jb.ui.followUps[_cmp.cmpId]
        if (!fus) return
        const index = fus.findIndex(({cmp}) => _cmp.cmpId == cmp.cmpId && _cmp.ver == cmp.ver)
        if (index != -1) {
            fus[index].pipe.dispose()
            fus.splice(index,1)
        }
        if (!fus.length)
            delete jb.ui.followUps[_cmp.cmpId]
    })

    if (widgetId && !destroyLocally)
        jb.ui.widgetUserRequests.next({$:'destroy', ...e })
    else 
        cmps.forEach(cmp=> (cmp.destroyCtxs || []).forEach(ctxIdToRun => {
            jb.log('backend method destroy uiComp',{cmp, el: cmp.el})
            jb.ui.runCtxAction(jb.ctxDictionary[ctxIdToRun])
        } ))
})(jb.ui.BECmpsDestroyNotification)

})()