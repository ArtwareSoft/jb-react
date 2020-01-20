(function(){
const ui = jb.ui;
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,this.ctx) }}

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
            return [{...compareVdom(b[0],a[0]),__afterIndex: 0}]
        jb.log('childDiff',[...arguments])
        const beforeWithIndex = b.map((e,i)=> ({i, ...e}))
        let remainingBefore = beforeWithIndex.slice(0)
        // locating before-objects in after-array. done in two stages. also calcualing the remaining before objects that were not found
        const afterToBeforeMap = a.map(toLocate => locateVdom(toLocate,remainingBefore))
        a.forEach((toLocate,i) => afterToBeforeMap[i] = afterToBeforeMap[i] || sameIndexSameTag(toLocate,i,remainingBefore))

        const reused = []
        const res = beforeWithIndex.map((e,i)=> {
            const __afterIndex = afterToBeforeMap.indexOf(e)
            if (__afterIndex == -1)
                return {$: 'delete', __afterIndex }
            reused[__afterIndex] = true
            return { __afterIndex, ...compareVdom(e, a[__afterIndex]), ...(e.$remount ? {remount: true}: {}) }
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

function printDelta(delta) {
    const filterDelta = dlt => ({
        attributes: jb.objFromEntries(jb.entries(dlt.attributes)
            .filter(e=> ['jb-ctx','cmp-id','originators','__afterIndex','mount-ctx','interactive'].indexOf(e[0]) == -1)),
        children: (dlt.children || []).map(c=>filterDelta(c)).filter(x=>(x.children ||[]).length || x.attributes)
    })
    return filterDelta(delta)
}

function applyVdomDiff(elem,vdomAfter,strongRefresh) {
    jb.log('applyDeltaTop',['start',...arguments])
    const vdomBefore = elemToVdom(elem)
    const delta = compareVdom(vdomBefore,vdomAfter)
    const active = document.activeElement === elem
    jb.log('applyDeltaTop',['apply',vdomBefore,vdomAfter,delta,active,...arguments],{modifier: record => record.push(printDelta(delta)) })
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
    if (active) elem.focus()
    ui.garbageCollectCtxDictionary(elem)
}

function applyDeltaToDom(elem,delta) {
    jb.log('applyDelta',[...arguments])
    if (delta.children) {
        const childElems = Array.from(elem.children), updates = delta.children, toAppend = delta.children.toAppend || []
        const sameOrder = updates.reduce((acc,e,i) => acc && e.__afterIndex ==i, true) && !toAppend.length
            || !updates.length && toAppend.reduce((acc,e,i) => acc && e.__afterIndex ==i, true)
        updates.forEach((e,i)=>{
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
            const newChild = elem.ownerDocument.createElement(e.tag)
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
    jb.entries(delta.attributes).forEach(e=> setAtt(elem,e[0],e[1]))
}

function h(cmpOrTag,attributes,children) {
    if (cmpOrTag && cmpOrTag[ui.VNode]) return cmpOrTag // Vdom
    if (cmpOrTag && cmpOrTag.renderVdom)
        return cmpOrTag.renderVdom()
    attributes = jb.objFromEntries(jb.entries(attributes).map(e=>[e[0].toLowerCase(),e[1]]))
    if (children === '') children = null
    if (['string','boolean','number'].indexOf(typeof children) !== -1) {
        attributes.$text = children
        children = null
    }
    if (children && typeof children.then == 'function') {
        attributes.$text = '...'
        children = null
    }
    if (children != null && !Array.isArray(children)) children = [children]
    if (children != null)
        children = children.filter(x=>x).map(item=> typeof item == 'string' ? h('span',{$text: item}) : item)
    
    return {...{[typeof cmpOrTag === 'string' ? 'tag' : 'cmp'] : cmpOrTag} ,attributes,children,[ui.VNode]: true}
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

function setAtt(elem,att,val) {
    if (val == null) {
        elem.removeAttribute(att)
        jb.log('htmlChange',['remove',...arguments])
    } else if (att === 'checked' && elem.tagName.toLowerCase() === 'input') {
        if (val === true)
            elem.checked = true
        jb.log('htmlChange',['checked',...arguments]);
    } else if (att === '$text') {
        elem.innerText = val
        jb.log('htmlChange',['text',...arguments]);
    } else if (att === '$html') {
        elem.innerHTML = val
        jb.log('htmlChange',['html',...arguments]);
    } else if (att === 'style' && typeof val === 'object') {
        elem.setAttribute(att,jb.entries(val).map(e=>`${e[0]}:${e[1]}`).join(';'))
        jb.log('htmlChange',['setAtt',...arguments]);
    } else if (att == 'value' && elem.tagName.match(/select|input|textarea/i) ) {
        const active = document.activeElement === elem
        if (elem.value == val) return
        elem.value = val
        if (active)
            elem.focus()
        jb.log('htmlChange',['setAtt',...arguments]);
    } else {
        elem.setAttribute(att,val)
        jb.log('htmlChange',['setAtt',...arguments]);
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
        const elem = parentElem.ownerDocument.createElement(vdom.tag)
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

Object.assign(jb.ui, {
    VNode: Symbol.for("VNode"),
    h, render, unmount, applyVdomDiff, elemToVdom, printDelta,
    handleCmpEvent(specificHandler) {
        const el = [event.currentTarget, ...jb.ui.parents(event.currentTarget)].find(el=> el.getAttribute && el.getAttribute('jb-ctx') != null)
        if (!el) return
        const cmp = el._component
        const action = specificHandler ? specificHandler : `on${event.type}Handler`
        return (cmp && cmp[action]) ? cmp[action](event) : ui.runActionOfElem(el,action)
    },
    runActionOfElem(elem,action) {
        (elem.getAttribute('handlers') || '').split(',').filter(x=>x.indexOf(action+'-') == 0)
            .forEach(str=> {
                const ctx = jb.ctxDictionary[str.split('-')[1]]
                ctx && ctx.setVar('cmp',elem._component).runInner(ctx.profile.action,'action','action')
            })
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
        jb.log('garbageCollect',jb.resourcesToDelete)
    
        const used = 'jb-ctx,mount-ctx,pick-ctx,handlers,interactive,originators'.split(',')
            .flatMap(att=>Array.from(document.querySelectorAll(`[${att}]`))
                .flatMap(el => el.getAttribute(att).split(',').map(x=>Number(x.split('-').pop()))))
                    .sort((x,y)=>x-y);

        // remove unused ctx from dictionary
        const dict = Object.keys(jb.ctxDictionary).map(x=>Number(x)).sort((x,y)=>x-y);
        let lastUsedIndex = 0;
        for(let i=0;i<dict.length;i++) {
            while (used[lastUsedIndex] < dict[i])
                lastUsedIndex++;
            if (used[lastUsedIndex] != dict[i])
                delete jb.ctxDictionary[''+dict[i]];
        }
        // remove unused vars from resources
        const ctxToPath = ctx => Object.values(ctx.vars).filter(v=>jb.isWatchable(v)).map(v => jb.asRef(v))
            .map(ref=>jb.refHandler(ref).pathOfRef(ref)).flat()
        const globalVarsUsed = jb.unique(used.map(x=>jb.ctxDictionary[''+x]).filter(x=>x).map(ctx=>ctxToPath(ctx)).flat())
        Object.keys(jb.resources).filter(id=>id.indexOf(':') != -1)
            .filter(id=>globalVarsUsed.indexOf(id) == -1)
            .forEach(id => delete jb.resources[id])
    },

    refreshElem(elem, state, options) {
        if (jb.path(elem,'_component.status') == 'initializing') 
            return jb.logError('circular refresh',[...arguments]);
        jb.log('refreshElem',[...arguments]);
        const _ctx = ui.ctxOfElem(elem)
        if (!_ctx) 
            return jb.logError('refreshElem - no ctx for elem',elem)
        let ctx = state ? _ctx.setVar('$state',state) : _ctx
        if (options && options.extendCtx)
            ctx = options.extendCtx(ctx)
        ctx = ctx.setVar('$refreshElemCall',true)
        const cmp = ctx.profile.$ == 'open-dialog' ? jb.ui.dialogs.buildComp(ctx) : ctx.runItself()
        const hash = cmp.init()
        if (hash != null && hash == elem.getAttribute('cmpHash'))
            return jb.log('refreshElem',['stopped by hash', hash, ...arguments]);
        cmp && applyVdomDiff(elem, h(cmp), jb.path(options,'strongRefresh'))
    },

    subscribeToRefChange: watchHandler => watchHandler.resourceChange.subscribe(e=> {
        const changed_path = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //observe="resources://2~name;person~name
        const parentNode = e.srcCtx && e.srcCtx.vars.elemToTest || document
        const elemsToCheck = Array.from(parentNode.querySelectorAll('[observe]'))
        const elemsToCheckCtx = elemsToCheck.map(el=>el.getAttribute('jb-ctx'))
        jb.log('notifyObservableElems',['elemsToCheck',elemsToCheck,e])
        elemsToCheck.forEach((elem,i) => {
            if (elemsToCheckCtx[i] != elem.getAttribute('jb-ctx')) return // the elem was changed by it parent 
            let refresh = false, strongRefresh = false
            elem.getAttribute('observe').split(',').map(obsStr=>observerFromStr(obsStr,elem)).filter(x=>x).forEach(obs=>{
                //if (checkCircularity(obs)) return
                const obsPath = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(obs.ref))
                if (!obsPath)
                    return jb.logError('observer ref path is empty',obs,e)
                strongRefresh = strongRefresh || obs.strongRefresh
                const diff = ui.comparePaths(changed_path, obsPath)
                const isChildOfChange = diff == 1
                const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
                const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
                if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure) {
                    jb.log('notifyObservableElem',['notify refresh',elem,e.srcCtx,obs,e])
                    //if (!checkCircularity({srcCtx: e.srcCtx, callerPath: elem._component.ctx.componentContext.callerPath, ...obs}))
                    refresh = true
                }
            })
            refresh && ui.refreshElem(elem,null,{srcCtx: e.srcCtx, strongRefresh})
        })

        function observerFromStr(obsStr) {
            const parts = obsStr.split('://')
            const innerParts = parts[1].split(';')
            const includeChildren = (innerParts[2].match(/includeChildren=([a-z]+)/) || ['',''])[1]
            const strongRefresh = innerParts[3] === 'strongRefresh'
            return parts[0] == watchHandler.resources.id && 
                { ref: watchHandler.refOfUrl(innerParts[0]), includeChildren, strongRefresh }
        }
    }),
    databindObservable(cmp,settings) {
	    return cmp.databindRefChanged.merge(jb.rx.Observable.of(cmp.state.databindRef)).flatMap(ref =>
			(!cmp.watchRefOn && jb.isWatchable(ref) && ui.refObservable(ref,cmp,settings)
                .map(e=>Object.assign({ref},e)) ) || [])
    },
})

ui.subscribeToRefChange(jb.mainWatchableHandler)

function checkCircularity(obs) {
    let ctxStack=[]; for(let innerCtx=obs.srcCtx; innerCtx; innerCtx = innerCtx.componentContext) ctxStack = ctxStack.concat(innerCtx)
    const callerPaths = ctxStack.filter(x=>x).map(ctx=>ctx.callerPath).filter(x=>x)
        .filter(x=>x.indexOf('jb-editor') == -1)
        .filter(x=>!x.match(/^studio-helper/))
    const callerPathsUniqe = jb.unique(callerPaths)
    if (callerPathsUniqe.length !== callerPaths.length) {
        jb.logError('circular watchRef',callerPaths)
        return true
    }

    if (!obs.allowSelfRefresh && obs.srcCtx) {
        const callerPathsToCompare = callerPaths.map(x=> x.replace(/~features~?[0-9]*$/,'').replace(/~style$/,''))
        const ctxStylePath = obs.callerPath.replace(/~features~?[0-9]*$/,'')
        return callerPathsToCompare.reduce((res,path) => res || path.indexOf(ctxStylePath) == 0, false)
    }
}

function mountInteractive(elem, keepState) {
    const ctx = jb.ctxDictionary[elem.getAttribute('mount-ctx')]
    const cmp = (ctx.profile.$ == 'open-dialog') ? jb.ui.dialogs.buildComp(ctx) : ctx.runItself();
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
            this.ctx = jb.ctxDictionary[elem.getAttribute('mount-ctx')].setVar('cmp',this)
            this.cmpId = elem.getAttribute('cmp-id')
            ;(elem.getAttribute('interactive') || '').split(',').filter(x=>x).forEach(op => {
                [id, ctxId] = op.split('-')
                const ctx = jb.ctxDictionary[ctxId]
                this[id] = jb.val(ctx.setVar('state',this.state).runInner(ctx.profile.value,'value','value'))
            })
            this.doRefresh && this.doRefresh()
        },
        componentDidUpdateFuncs: cmp.componentDidUpdateFuncs
    }
    mountedCmp.destroyed = new Promise(resolve=>mountedCmp.resolveDestroyed = resolve)
    elem._component = mountedCmp
    mountedCmp.recalcPropsFromElem()

    jb.unique(cmp.eventObservables)
        .forEach(op => mountedCmp[op] = jb.rx.Observable.fromEvent(elem, op.slice(2)).takeUntil( mountedCmp.destroyed ))

    ;(cmp.componentDidMountFuncs||[]).forEach(f=> tryWrapper(() => f(mountedCmp), 'componentDidMount'))
    mountedCmp.status = 'ready'
}

})()