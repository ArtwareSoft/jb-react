(function(){
const ui = jb.ui;
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,this.ctx) }}

function h(cmpOrTag,attributes,children) {
    if (cmpOrTag instanceof ui.VNode) return cmpOrTag // Vdom
    if (cmpOrTag && cmpOrTag.renderVdom)
        return cmpOrTag.renderVdom()
   
    return new jb.ui.VNode(cmpOrTag,attributes,children)
}

function compareVdom(b,a) {
    const attributes = jb.objectDiff(a.attributes || {}, b.attributes || {})
    if (attributes.style == undefined) delete attributes.style // do not delete style attributes defined by interactive
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
        res.toAppend = a.flatMap((e,i) => reused[i] ? [] : [{...compareVdom({},e), __afterIndex: i}])
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

function filterDelta(delta) {
    const doFilter = dlt => ({
        attributes: jb.objFromEntries(jb.entries(dlt.attributes)
            .filter(e=> ['jb-ctx','cmp-id','originators','__afterIndex','mount-ctx','interactive'].indexOf(e[0]) == -1)),
        children: dlt.children
    })
    return doFilter(delta)
}

function sameSource(vdomBefore,vdomAfter) {
    if (vdomBefore.cmp && vdomBefore.cmp === vdomAfter.cmp) return true
    const atts1 = vdomBefore.attributes || {}, atts2 = vdomAfter.attributes || {}
    if (atts1.cmpId && atts1.cmpId === atts2.cmpId || atts1.ctxId && atts1.ctxId === atts2.ctxId) return true
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

function applyVdomDiff(elem,vdomAfter,{strongRefresh, ctx} = {}) {
    jb.log('applyDeltaTop',['start',...arguments])
    const vdomBefore = elem instanceof ui.VNode ? elem : elemToVdom(elem)
    const delta = compareVdom(vdomBefore,vdomAfter)
    if (elem instanceof ui.VNode) { // runs on worker
        const cmpId = elem.getAttribute('cmp-id'), elemId = elem.getAttribute('id')
        if (elem != vdomAfter) { // update the elem
            Object.keys(elem).forEach(k=>delete elem[k])
            Object.assign(elem,vdomAfter)
        }
        return jb.ui.updateRenderer(delta,elemId,cmpId,ctx && ctx.vars.widgetId) // deligate to the main thread 
    }
    const active = jb.ui.activeElement() === elem
    jb.log('applyDeltaTop',['apply',vdomBefore,vdomAfter,delta,active,...arguments],
        {modifier: record => record.push(filterDelta(delta)) })
    if (delta.tag || strongRefresh) {
        unmount(elem)
        const newElem = render(vdomAfter,elem.parentElement)
        elem.parentElement.replaceChild(newElem,elem)
        jb.log('replaceTop',[newElem,elem,delta])
        elem = newElem
    } else {
        applyDeltaToDom(elem,delta)
    }
    ui.findIncludeSelf(elem,'[interactive]').forEach(el=> 
        el._component ? el._component.recalcPropsFromElem() : mountInteractive(el))
    if (active) jb.ui.focus(elem,'apply Vdom diff',ctx)
    ui.garbageCollectCtxDictionary(elem)
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

function appendItems(elem, vdomToAppend,ctx) { // used in infinite scroll
    if (elem instanceof ui.VNode) { // runs on worker
        const cmpId = elem.getAttribute('cmp-id'), elemId = elem.getAttribute('id')
        // TODO: update the elem
        return jb.ui.updateRenderer(vdomToAppend,elemId,cmpId,ctx && ctx.vars.widgetId) // deligate to the main thread 
    }
    (vdomToAppend.children ||[]).forEach(vdom => render(vdom,elem))
}

function applyDeltaToDom(elem,delta) {
    jb.log('applyDelta',[...arguments])
    const children = delta.children
    if (delta.children) {
        const childrenArr = delta.children.length ? Array.from(Array(delta.children.length).keys()).map(i=>children[i]) : []
        const childElems = Array.from(elem.children), toAppend = delta.children.toAppend || []
        const sameOrder = childrenArr.reduce((acc,e,i) => acc && e.__afterIndex ==i, true) && !toAppend.length
            || !childrenArr.length && toAppend.reduce((acc,e,i) => acc && e.__afterIndex ==i, true)
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
            const newChild = createElement(elem.ownerDocument,e.tag)
            elem.appendChild(newChild)
            applyDeltaToDom(newChild,e)
            jb.log('appendChild',[newChild,e,elem,delta])
            !sameOrder && (newChild.setAttribute('__afterIndex',e.__afterIndex))
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

function setAtt(elem,att,val) {
    if (att[0] !== '$' && val == null) {
        elem.removeAttribute(att)
        jb.log('htmlChange',['remove',...arguments])
    } else if (att === 'checked' && elem.tagName.toLowerCase() === 'input') {
        elem.checked = !!val
        jb.log('htmlChange',['checked',...arguments])
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
}

function unmount(elem) {
    jb.log('unmount',[...arguments]);
    if (!elem || !elem.setAttribute) return
    jb.ui.findIncludeSelf(elem,'[interactive]').forEach(el=> el._component && el._component.destroy())
}

function render(vdom,parentElem) {
    jb.log('render',[...arguments])
    function doRender(vdom,parentElem) {
        jb.log('htmlChange',['createElement',...arguments])
        const elem = createElement(parentElem.ownerDocument, vdom.tag)
        jb.entries(vdom.attributes).forEach(e=>setAtt(elem,e[0],e[1])) // filter(e=>e[0].indexOf('on') != 0 && !isAttUndefined(e[0],vdom.attributes)).
        jb.asArray(vdom.children).map(child=> doRender(child,elem)).forEach(el=>elem.appendChild(el))
        parentElem.appendChild(elem)
        return elem
    }
    const res = doRender(vdom,parentElem)
    ui.findIncludeSelf(res,'[interactive]').forEach(el=> mountInteractive(el))
    ui.garbageCollectCtxDictionary(parentElem)
    return res
}

function createElement(parent,tag) {
    tag = tag || 'div'
    return (['svg','circle','ellipse','image','line','mesh','path','polygon','polyline','rect','text'].indexOf(tag) != -1) ?
        parent.createElementNS("http://www.w3.org/2000/svg", tag) : parent.createElement(tag)
}

Object.assign(jb.ui, {
    h, render, unmount, applyVdomDiff, applyDeltaToDom, elemToVdom, mountInteractive, compareVdom, appendItems,
    handleCmpEvent(specificHandler, ev) {
        ev = typeof event != 'undefined' ? event : ev
        const el = jb.ui.parents(ev.currentTarget,{includeSelf: true}).find(el=> el.getAttribute && el.getAttribute('jb-ctx') != null)
        if (!el) return
        if (ev.type == 'scroll') // needs to be here to support the worker scenario
            ev.scrollPercentFromTop = ev.scrollPercentFromTop || (el.scrollTop + jb.ui.offset(el).height)/ el.scrollHeight;

        if (el.getAttribute('worker')) { // forward the event to the worker
            return jb.ui.workers[el.getAttribute('worker')].handleBrowserEvent(el,ev,specificHandler)
        }
        const cmp = el._component
        const action = specificHandler ? specificHandler : `on${ev.type}Handler`
        return (cmp && cmp[action]) ? cmp[action](ev) : ui.runActionOfElem(el,action,ev)
    },
    runActionOfElem(elem,action,ev) {
        if (elem.getAttribute('contenteditable')) return
        ev = typeof event != 'undefined' ? event : ev
        const ctxToRun = (elem.getAttribute('handlers') || '').split(',').filter(x=>x.indexOf(action+'-') == 0)
            .map(str=>jb.ui.ctxDictOfElem(elem)[str.split('-')[1]])
            .filter(x=>x)
            .map(ctx=> ctx.setVar('cmp',elem._component).setVars({ev}))[0]

        return ctxToRun && ctxToRun.runInner(ctxToRun.profile.action,'action','action')
    },
    ctrl(context,options) {
        const $state = context.vars.$refreshElemCall ? context.vars.$state : {}
        const ctx = context.setVars({ $model: { ctx: context, ...context.params} , $state, $refreshElemCall : undefined })
        const styleOptions = defaultStyle(ctx) || {}
        if (styleOptions instanceof ui.JbComponent)  {// style by control
            return styleOptions.orig(ctx).jbExtend(options,ctx).applyParamFeatures(ctx)
        }
        return new ui.JbComponent(ctx).jbExtend(options,ctx).jbExtend(styleOptions,ctx).applyParamFeatures(ctx)
    
        function defaultStyle(ctx) {
            const profile = context.profile
            const defaultVar = '$theme.' + (profile.$ || '')
            if (!profile.style && context.vars[defaultVar])
                return ctx.run({$:context.vars[defaultVar]})
            return context.params.style ? context.params.style(ctx) : {}
        }
    },
    garbageCollectCtxDictionary(elem,force) {
        if (!elem.ownerDocument.contains(elem)) return // tests

        const now = new Date().getTime()
        ui.ctxDictionaryLastCleanUp = ui.ctxDictionaryLastCleanUp || now
        const timeSinceLastCleanUp = now - ui.ctxDictionaryLastCleanUp
        if (!force && timeSinceLastCleanUp < 10000) return
        ui.ctxDictionaryLastCleanUp = now
    
        const used = 'jb-ctx,mount-ctx,pick-ctx,props-ctx,handlers,interactive,originators'.split(',')
            .flatMap(att=>Array.from(document.querySelectorAll(`[${att}]`))
                .flatMap(el => el.getAttribute(att).split(',').map(x=>Number(x.split('-').pop()))))
                    .sort((x,y)=>x-y);

        // remove unused ctx from dictionary
        const dict = Object.keys(jb.ctxDictionary).map(x=>Number(x)).sort((x,y)=>x-y);
        let lastUsedIndex = 0;
        const removedCtxs = [], removedResources = []
        for(let i=0;i<dict.length;i++) {
            while (used[lastUsedIndex] < dict[i])
                lastUsedIndex++;
            if (used[lastUsedIndex] != dict[i]) {
                removedCtxs.push(i)
                delete jb.ctxDictionary[''+dict[i]]
            }
        }
        // remove unused vars from resources
        const ctxToPath = ctx => Object.values(ctx.vars).filter(v=>jb.isWatchable(v)).map(v => jb.asRef(v))
            .map(ref=>jb.refHandler(ref).pathOfRef(ref)).flat()
        const globalVarsUsed = jb.unique(used.map(x=>jb.ctxDictionary[''+x]).filter(x=>x).map(ctx=>ctxToPath(ctx)).flat())
        Object.keys(jb.resources).filter(id=>id.indexOf(':') != -1)
            .filter(id=>globalVarsUsed.indexOf(id) == -1)
            .forEach(id => { removedResources.push(id); delete jb.resources[id]})

        jb.log('garbageCollect',[removedCtxs,removedResources])
    },

    refreshElem(elem, state, options) {
        if (jb.path(elem,'_component.status') == 'initializing') 
            return jb.logError('circular refresh',[...arguments]);
        const _ctx = ui.ctxOfElem(elem)
        if (!_ctx) 
            return jb.logError('refreshElem - no ctx for elem',elem)
        const strongRefresh = jb.path(options,'strongRefresh')
        let ctx = _ctx.setVar('$state', strongRefresh ? {} : state || {}) // strongRefresh kills state
        if (options && options.extendCtx)
            ctx = options.extendCtx(ctx)
        ctx = ctx.setVar('$refreshElemCall',true)
        if (jb.ui.inStudio()) // updating to latest version of profile
            ctx.profile = jb.execInStudio({$: 'studio.val', path: ctx.path})
        const cmp = ctx.profile.$ == 'openDialog' ? jb.ui.dialogs.buildComp(ctx) : ctx.runItself()
        jb.log('refreshElem',[ctx,cmp, ...arguments]);

        if (jb.path(options,'cssOnly')) {
            const existingClass = (elem.className.match(/(w|jb-)[0-9]+/)||[''])[0]
            const cssStyleElem = Array.from(document.querySelectorAll('style')).map(el=>({el,txt: el.innerText})).filter(x=>x.txt.indexOf(existingClass + ' ') != -1)[0].el
            jb.log('refreshElem',['hashCss',cmp.cssLines,ctx,cmp, ...arguments]);
            return jb.ui.hashCss(cmp.cssLines,cmp.ctx,{existingClass, cssStyleElem})
        }
        const hash = cmp.init()
        if (hash != null && hash == elem.getAttribute('cmpHash'))
            return jb.log('refreshElem',['stopped by hash', hash, ...arguments]);
        cmp && applyVdomDiff(elem, h(cmp), {strongRefresh, ctx})
        //jb.execInStudio({ $: 'animate.refreshElem', elem: () => elem })
    },

    subscribeToRefChange: watchHandler => jb.subscribe(watchHandler.resourceChange, e=> {
        const changed_path = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //observe="resources://2~name;person~name
        const findIn = jb.path(e,'srcCtx.vars.widgetId') || jb.path(e,'srcCtx.vars.elemToTest') ? e.srcCtx : jb.frame.document
        const elemsToCheck = jb.ui.find(findIn,'[observe]')
        const elemsToCheckCtxBefore = elemsToCheck.map(el=>el.getAttribute('jb-ctx'))
        jb.log('notifyObservableElems',['elemsToCheck',elemsToCheck,e])
        elemsToCheck.forEach((elem,i) => {
            //.map((elem,i) => ({elem,i, phase: phaseOfElem(elem,i) })).sort((x1,x2)=>x1.phase-x2.phase).forEach(({elem,i}) => {
            if (elemsToCheckCtxBefore[i] != elem.getAttribute('jb-ctx')) return // the elem was already refreshed during this process, probably by its parent
            let refresh = false, strongRefresh = false, cssOnly = true
            elem.getAttribute('observe').split(',').map(obsStr=>observerFromStr(obsStr,elem)).filter(x=>x).forEach(obs=>{
                if (!obs.allowSelfRefresh && elem == jb.path(e.srcCtx, 'vars.cmp.base')) 
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
    }),
})

ui.subscribeToRefChange(jb.mainWatchableHandler)

function mountInteractive(elem, keepState) {
    const ctx = jb.ui.ctxOfElem(elem,'mount-ctx')
    if (!ctx)
        return jb.logError('no ctx for elem',[elem])
    const cmp = (ctx.profile.$ == 'openDialog') ? jb.ui.dialogs.buildComp(ctx) : ctx.runItself();
    const mountedCmp = {
        state: { ...(keepState && jb.path(elem._component,'state')) },
        base: elem,
        refresh(state, options) {
            jb.log('refreshReq',[...arguments])
            if (this._deleted) return
            Object.assign(this.state, state)
            ui.refreshElem(elem,{...this.state, ...state},options)
            ;(this.componentDidUpdateFuncs||[]).forEach(f=> tryWrapper(() => f(this), 'componentDidUpdate'))
        },
        destroy() {
            this._deleted = true
            this.resolveDestroyed() // notifications to takeUntil(this.destroyed) observers
            ;(cmp.destroyFuncs||[]).forEach(f=> tryWrapper(() => f(this), 'destroy'));
        },
        status: 'initializing',
        recalcPropsFromElem() {
            if (elem.getAttribute('worker')) return
            this.ctx = jb.ui.ctxOfElem(elem,'mount-ctx').setVar('cmp',this)
            this.cmpId = elem.getAttribute('cmp-id')
            ;(elem.getAttribute('interactive') || '').split(',').filter(x=>x).forEach(op => {
                [id, ctxId] = op.split('-')
                const ctx = jb.ui.ctxDictOfElem(elem)[ctxId]
                this[id] = jb.val(ctx.setVar('state',this.state).setVar('cmp',this).runInner(ctx.profile.value,'value','value'))
            })
            this.doRefresh && this.doRefresh()
        },
        componentDidUpdateFuncs: cmp.componentDidUpdateFuncs
    }
    mountedCmp.destroyed = new Promise(resolve=>mountedCmp.resolveDestroyed = resolve)
    elem._component = mountedCmp
    mountedCmp.recalcPropsFromElem()

    jb.unique(cmp.eventObservables||[])
        .forEach(op => mountedCmp[op] = jb.ui.fromEvent(mountedCmp,op.slice(2),elem))

    ;(cmp.componentDidMountFuncs||[]).forEach(f=> tryWrapper(() => f(mountedCmp), 'componentDidMount'))
    mountedCmp.status = 'ready'
}

})()