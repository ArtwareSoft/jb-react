(function(){
const ui = jb.ui;

function compareVdom(b,a) {
    if (a.tag && a.tag != b.tag) {
        return { $: 'replace', ...a }
    }
    const attributes = calcRemount(b.attributes||{}, jb.objectDiff(b.attributes || {},a.attributes || {}))
    const children = childDiff(b.children || [],a.children || [])
    return { ...(Object.keys(attributes).length ? {attributes} : {}),  ...(Object.keys(children).length ? {children} : {}) }

    function childDiff(b,a) {
        if (a.length == 1 && b.length == 1) 
            return compareVdom(b[0],a[0])
        jb.log('childDiff',[...arguments])
        const beforeWithIndex = b.map((e,i)=> ({i, ...e}))
        let remainingBefore = beforeWithIndex.slice(0)
        // locating before-objects in after-array. done in two stages. also calcualing the remaining before objects that were not found
        const afterToBeforeMap = a.map(toLocate => locateVdom(toLocate,remainingBefore))
        a.forEach((toLocate,i) => afterToBeforeMap[i] = afterToBeforeMap[i] || sameIndexSameTag(toLocate,i,remainingBefore))

        const reused = []
        const res = { 
            updates: beforeWithIndex.map((e,i)=> {
                const afterIndex = afterToBeforeMap.indexOf(e)
                if (afterIndex == -1)
                    return {$: 'delete', afterIndex }
                reused[afterIndex] = true
                return { afterIndex, ...compareVdom(e, a[afterIndex]), ...(e.$remount ? {remount: true}: {}) }
            }),
            toAppend: a.flatMap((e,i) => reused[i] ? [] : ({...e, afterIndex: i}))
        }
        jb.log('childDiffRes',[res,...arguments])
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
        attributes: jb.objFromEntries(Array.from(elem.attributes).map(e=>[e.id,e.value])),
        children: Array.from(elem.children).map(el= elemToVdom(el))
    }
}

function applyDeltaToDom(elem,delta) {
    jb.log('applyDelta',[...arguments])
    jb.entries(delta.attributes).forEach(e=> (e[1] != null) ? setAtt(elem,e[0],e[1]) : elem.removeAttribute(e[0]))
    const childElems = Array.from(elem.children)
    const sameOrder = delta.updates.reduce((acc,e,i) => acc && e.afterIndex ==i, true) && !delta.toAppend.length
        || !delta.updates.length && delta.toAppend.reduce((acc,e,i) => acc && e.afterIndex ==i, true)
    delta.children.updates.forEach(e=>{
        if (e.$delete) {
            unbound(childElems[i])
            elem.removeChild(childElems[i])
        } else {
            applyDeltaToDom(childElems[i],e)
            !sameOrder && (childElems[i].afterIndex = e.afterIndex)
        }
    })
    delta.children.toAppend.forEach(e=>{
        const newChild = elem.ownerDocument.createElement(e.tag)
        elem.appendChild(newChild)
        applyDeltaToDom(newChild,e)
        !sameOrder && (newChild.afterIndex = e.afterIndex)
    })
    if (!sameOrder) Array.from(elem.children)
            .sort((x,y) => Number(x.getAttribute('afterIndex')) - Number(y.getAttribute('afterIndex')))
            .forEach(el=> {
                elem.insertBefore(el, elem.children[Number(x.getAttribute('afterIndex'))])
                el.removeAttribute('afterIndex')
            })
}


function h(cmpOrTag,attributes,children) {
    if (cmpOrTag && cmpOrTag[ui.VNode]) return cmpOrTag // Vdom
    if (cmpOrTag && cmpOrTag.noNeedForCmpObject && cmpOrTag.noNeedForCmpObject())
        return cmpOrTag.renderVdom()
    // if (cmpOrTag && renderVdom())
    //     return cmpOrTag.renderVdom()
    if (Array.isArray(children) && children.length > 1)
        children = children.filter(x=>x).map(item=> typeof item == 'string' ? h('span',{},item) : item)
    if (children === "") children = null
    if (typeof children === 'string') children = [children]
    
    return {...{[typeof cmpOrTag === 'string' ? 'tag' : 'cmp'] : cmpOrTag} ,attributes,children,[ui.VNode]: true}
}

function applyVdomDiff(elem,vdomBefore,vdomAfter,cmp) {
    if (!elem && !vdomBefore && !vdomAfter) return
    if (elem.getAttribute && elem.getAttribute('cmpHash') &&
        elem.getAttribute('cmpHash') == (jb.path(vdomAfter,'attributes.cmpHash') || jb.path(vdomAfter,'cmp.cmpHash')))
            return
    jb.log('applyVdomDiff',[...arguments]);
    if (vdomBefore == null || elem == null) debugger
    if (typeof vdomAfter !== 'object') {
        if (vdomAfter === vdomBefore) return
        elem.nodeType == 3 ? elem.nodeValue = vdomAfter : elem.innerText = vdomAfter
        jb.log('htmlChange',['change text',elem,vdomBefore,vdomAfter,cmp]);
        elem.children && Array.from(elem.children).forEach(ch=>unmount(ch))
        return elem
    }
    if ((vdomBefore.tag || vdomBefore.cmp) != (vdomAfter.tag || vdomAfter.cmp)) {
        unmountNotification(elem)
        const replaceWith = render(vdomAfter,elem.parentElement,cmp)
        jb.log('htmlChange',['replaceChild',replaceWith,elem]);
        const res = elem.parentElement.replaceChild(replaceWith,elem)
        return res
    }
    if (vdomBefore.cmp) // same cmp
        return
    
    if (vdomBefore.attributes || vdomAfter.attributes)
        applyAttsDiff(elem, vdomBefore.attributes || {}, vdomAfter.attributes || {})
    if (vdomBefore.children || vdomAfter.children)
        applyChildrenDiff(elem, jb.asArray(vdomBefore.children), jb.asArray(vdomAfter.children),cmp)
    return elem
}

function applyAttsDiff(elem, vdomBefore, vdomAfter) {
    const keys = Object.keys(vdomBefore).filter(k=>k.indexOf('on') != 0)
    keys.forEach(key => isAttUndefined(key,vdomAfter) && elem.removeAttribute(key))
    keys.forEach(key => (vdomAfter[key] != vdomBefore[key]) && setAtt(elem,key,vdomAfter[key]))
}

function applyChildrenDiff(parentElem, vdomBefore, vdomAfter, cmp) {
    if (vdomBefore.length ==1 && vdomAfter.length == 1 && parentElem.childElementCount === 0 && parentElem.firstChild) 
        return applyVdomDiff(parentElem.firstChild, vdomBefore[0], vdomAfter[0], cmp)
    jb.log('applyChildrenDiff',[...arguments])
    if (vdomBefore.length != parentElem.childElementCount) {
        jb.log('applyChildrenDiff',['unexpected dom',...arguments])
        while(parentElem.firstChild) {
            unmount(parentElem.firstChild)
            parentElem.removeChild(parentElem.firstChild)
        }
    }
    let remainingBefore = vdomBefore.filter((e,i)=>parentElem.childNodes[i])
        .map((e,i)=> Object.assign({},e,{i, base: parentElem.childNodes[i]}))
    const unmountCandidates = remainingBefore.slice(0)
    const childrenMap = vdomAfter.map((toLocate,i)=> locateCurrentVdom1(toLocate,i,remainingBefore))
    vdomAfter.forEach((toLocate,i)=> childrenMap[i] = childrenMap[i] || locateCurrentVdom2(toLocate,i,remainingBefore))
    unmountCandidates.filter(toLocate => childrenMap.indexOf(toLocate) == -1 && toLocate.base).forEach(elem =>{
        unmountNotification(elem.base)
        parentElem.removeChild(elem.base)
        jb.log('htmlChange',['removeChild',elem.base]);
    })
    let lastElem = vdomAfter.reduce((prevElem,after,index) => {
        const current = childrenMap[index]
        const childElem = current ? applyVdomDiff(current.base,current,after,cmp) : render(after,parentElem,cmp)
        return putInPlace(childElem,prevElem)
    },null)
    lastElem = lastElem && lastElem.nextSibling
    while(lastElem) {
        parentElem.removeChild(lastElem)
        jb.log('htmlChange',['removeChild',lastElem]);
        lastElem = lastElem.nextSibling
    }

    function putInPlace(childElem,prevElem) {
        if (prevElem && prevElem.nextSibling != childElem) {
            parentElem.insertBefore(childElem, prevElem.nextSibling)
            jb.log('htmlChange',['insertBefore',childElem,prevElem && prevElem.nextSibling]);
        }
        return childElem
    }
    function locateCurrentVdom1(toLocate,index,remainingBefore) {
        const found = remainingBefore.findIndex(before=>sameSource(before,toLocate))
        if (found != -1)                
            return remainingBefore.splice(found,1)[0]
    }
    function locateCurrentVdom2(toLocate,index,remainingBefore) {
        const found = remainingBefore.findIndex(before=>before.tag && before.i == index && before.tag === toLocate.tag)
        if (found != -1)                
            return remainingBefore.splice(found,1)[0]
    }
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
    if (val == null) return
    if (att == 'style' && typeof val === 'object') {
        elem.setAttribute(att,jb.entries(val).map(e=>`${e[0]}:${e[1]}`).join(';'))
        jb.log('htmlChange',['setAtt',...arguments]);
    } else if (att == 'value' && elem.tagName.match(/input|textarea/i) ) {
        const active = document.activeElement === elem
        if (elem.value == val) return
        elem.value = val
        if (active)
            elem.focus()
        jb.log('htmlChange',['setAtt',...arguments]);
    }
    else {
        elem.setAttribute(att,val)
        jb.log('htmlChange',['setAtt',...arguments]);
    }
}
function isAttUndefined(key,vdom) {
    return !vdom.hasOwnProperty(key) || (key == 'checked' && vdom[key] === false)
}

function unmount(elem) {
    unmountNotification(elem)
}
function unmountNotification(elem) {
    jb.log('unmount',[...arguments]);
    if (!elem || !elem.setAttribute) return
    elem.setAttribute('recycleCounter',(+(elem.getAttribute('recycleCounter') || '0')) + 1)
    jb.ui.findIncludeSelf(elem,'[cmpId]').forEach(el=> el._component.destroy())
    ui.garbageCollectCtxDictionary()
}

function render(vdom,parentElem,cmp) {
    jb.log('render',[...arguments]);
    let elem = null
    if (typeof vdom !== 'object') {
        jb.log('htmlChange',['innerText',...arguments])
        parentElem.nodeType == 3 ? parentElem.nodeValue = vdom : parentElem.innerText = vdom
    } else if (vdom.tag) {
        jb.log('htmlChange',['createElement',...arguments])
        elem = parentElem.ownerDocument.createElement(vdom.tag == 'html' ? 'div' : vdom.tag)
        jb.entries(vdom.attributes).filter(e=>e[0].indexOf('on') != 0 && !isAttUndefined(e[0],vdom.attributes)).forEach(e=>setAtt(elem,e[0],e[1]))
        jb.entries(vdom.attributes).filter(e=>e[0].indexOf('on') == 0).forEach(
                e=>elem.setAttribute(e[0],`jb.ui.handleCmpEvent(${typeof e[1] == 'string' && e[1] ? "'" + e[1] + "'" : '' })`))
        if (vdom.tag == 'html')
            elem.innerHTML = vdom.children && vdom.children[0] || ''
        else 
            jb.asArray(vdom.children).map(child=> render(child,elem,cmp)).filter(x=>x)
                .forEach(chElem=>elem.appendChild(chElem))
        parentElem.appendChild(elem)
        jb.log('htmlChange',['appendChild',parentElem,elem])
    } else if (vdom.cmp) {
        elem = render(vdom.cmp.renderVdom(),parentElem, vdom.cmp)
        if (!elem) return // string
        parentElem.appendChild(elem)
        jb.log('htmlChange',['appendChild',parentElem,elem])
        vdom.cmp.componentDidMount(elem)
    } 
    return elem
}

Object.assign(jb.ui, {
    VNode: Symbol.for("VNode"),
    h, render, unmount, applyVdomDiff,
    handleCmpEvent(specificHandler) {
        const el = [event.currentTarget, ...jb.ui.parents(event.currentTarget)].find(el=> el.getAttribute && el.getAttribute('jb-ctx') != null)
        if (!el) return
        const cmp = el._component
        const action = specificHandler ? specificHandler : `on${event.type}Handler`
        if (cmp[action])
            cmp[action]()
        else
            ui.runActionOfElem(el,action)
    },
    runActionOfElem(elem,action) {
        (elem.getAttribute('handlers') || '').split(',').filter(x=>x.indexOf(action+'-') == 0)
            .forEach(str=> {
                const ctx = jb.ctxDictionary[str.split('-')[1]]
                ctx && ctx.setVar('cmp',elem._component).runInner(ctx.profile.action,'action','action')
            })
    },
    ctrl(context,options) {
        const $state = context.vars.__refreshElemCall ? context.vars.$state : {}
        const ctx = context.setVars({ $model: { ctx: context, ...context.params} , $state, __refreshElemCall : undefined });
        const styleOptions = defaultStyle(ctx) || {};
        if (styleOptions.jbExtend)  {// style by control
            return styleOptions.jbExtend(options).applyFeatures(ctx);
        }
        return new ui.JbComponent(ctx).jbExtend(options).jbExtend(styleOptions).applyFeatures(ctx);
    
        function defaultStyle(ctx) {
            const profile = context.profile;
            const defaultVar = '$theme.' + (profile.$ || '');
            if (!profile.style && context.vars[defaultVar])
                return ctx.run({$:context.vars[defaultVar]})
            return context.params.style ? context.params.style(ctx) : {};
        }
    },
    garbageCollectCtxDictionary(force) {
        const now = new Date().getTime();
        ui.ctxDictionaryLastCleanUp = ui.ctxDictionaryLastCleanUp || now;
        const timeSinceLastCleanUp = now - ui.ctxDictionaryLastCleanUp;
        if (!force && timeSinceLastCleanUp < 10000)
            return;
        ui.ctxDictionaryLastCleanUp = now;
        jb.resourcesToDelete = jb.resourcesToDelete || []
        jb.log('garbageCollect',jb.resourcesToDelete)
        jb.resourcesToDelete.forEach(id => delete jb.resources[id])
        jb.resourcesToDelete = []
    
        const used = Array.from(document.querySelectorAll('[jb-ctx]')).map(e=>Number(e.getAttribute('jb-ctx')))
            .concat(Array.from(document.querySelectorAll('[handlers]')).flatMap(e=>e.getAttribute('handlers').split(','))
            .map(x=>Number(x.split('-')[1]))).sort((x,y)=>x-y);

        const dict = Object.getOwnPropertyNames(jb.ctxDictionary).map(x=>Number(x)).sort((x,y)=>x-y);
        let lastUsedIndex = 0;
        for(let i=0;i<dict.length;i++) {
            while (used[lastUsedIndex] < dict[i])
                lastUsedIndex++;
            if (used[lastUsedIndex] != dict[i])
                delete jb.ctxDictionary[''+dict[i]];
        }
        const ctxToPath = ctx => jb.entries(ctx.vars).map(e=>e[1]).filter(v=>jb.isWatchable(v)).map(v => jb.asRef(v)).map(ref=>jb.refHandler(ref).pathOfRef(ref)).flat()
        const globalVarsUsed = jb.unique(used.map(x=>jb.ctxDictionary[''+x]).filter(x=>x).map(ctx=>ctxToPath(ctx)).flat())
        let iteratingOnVar = ''
        Object.keys(jb.resources).filter(id=>id.indexOf(':') != -1)
            .sort().reverse() // get the latest usages (largest ctxId) as first item in each group
            .forEach(id=>{
                if (iteratingOnVar != id.split(':')[0]) {
                    iteratingOnVar = id.split(':')[0]
                    return // do not delete the latest usage of a variable. It may not be bound yet
                }
                if (globalVarsUsed.indexOf(id) == -1)
                    jb.resourcesToDelete.push(id)
        })
    },

    refreshElem(elem, state, options) {
        if (jb.path(elem,'_component.status') != 'ready') 
            return jb.logError('circular refresh',[...arguments]);
        jb.log('refreshElem',[...arguments]);
        const _ctx = ui.ctxOfElem(elem)
        if (!_ctx) 
            return jb.logError('refreshElem - no ctx for elem',elem)
        let ctx = state ? _ctx.setVar('$state',state) : _ctx
        if (options && options.extendCtx)
            ctx = options.extendCtx(ctx)
        ctx = ctx.setVar('__refreshElemCall',true)
        const cmp = ctx.profile.$ == 'open-dialog' ? ctx.vars.$dialog.buildComp(ctx) : ctx.runItself()
        const hash = cmp.init()
        if (hash != null && hash == elem.getAttribute('cmpHash'))
            return jb.log('refreshElem',['stopped by hash', hash, ...arguments]);
        cmp && applyVdomDiff(elem, jb.path(elem,'_component.vdom') || h(''),h(cmp),cmp)
    },

    subscribeToRefChange: watchHandler => watchHandler.resourceChange.subscribe(e=> {
        const changed_path = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //toobserve="resources://2~name;person~name
        const parentNode = e.srcCtx && e.srcCtx.vars.elemToTest || document
        const elemsToCheck = Array.from(parentNode.querySelectorAll('[toobserve]'))
        const recycleCounters = elemsToCheck.map(el=>el.getAttribute('recycleCounter') || '0')
        jb.log('notifyObservableElems',['elemsToCheck',elemsToCheck,e])
        elemsToCheck.forEach((elem,i) => {
            const isOld = jb.path(elem,'_component._deleted') || (+elem.getAttribute('recycleCounter') > +recycleCounters[i]) 
            if (isOld) return // can not use filter as cmp may be destroyed during the process
            let refresh = false
            elem.getAttribute('toobserve').split(',').map(obsStr=>observerFromStr(obsStr,elem)).filter(x=>x).forEach(obs=>{
                //if (checkCircularity(obs)) return
                const obsPath = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(obs.ref))
                if (!obsPath)
                    return jb.logError('observer ref path is empty',obs,e)
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
            refresh && ui.refreshElem(elem,null,{srcCtx: e.srcCtx})
        })

        function observerFromStr(obsStr) {
            const parts = obsStr.split('://')
            const innerParts = parts[1].split(';')
            const includeChildren = (innerParts[2].match(/includeChildren=([a-z]+)/) || ['',''])[1]
            return parts[0] == watchHandler.resources.id && 
                { ref: watchHandler.refOfUrl(innerParts[0]), includeChildren }
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

})()