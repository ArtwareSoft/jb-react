(function(){
const ui = jb.ui;

function h(cmpOrTag,attributes,children) {
    if (cmpOrTag && cmpOrTag[ui.VNode]) return cmpOrTag // Vdom
    if (cmpOrTag && cmpOrTag.noNeedForCmpObject && cmpOrTag.noNeedForCmpObject())
        return cmpOrTag.renderVdom()
    if (Array.isArray(children) && children.length > 1)
        children = children.filter(x=>x).map(item=> typeof item == 'string' ? h('span',{},item) : item)
    if (children === "") children = null
    if (typeof children === 'string') children = [children]
    
    return {...{[typeof cmpOrTag === 'string' ? 'tag' : 'cmp'] : cmpOrTag} ,attributes,children,[ui.VNode]: true}
}

function applyVdomDiff(elem,vdomBefore,vdomAfter,cmp) {
    if (!elem && !vdomBefore && !vdomAfter) return
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
        unbindCmps(elem)
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
        unbindCmps(elem.base)
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
    unbindCmps(elem)
}
function unmountNotification(elem) {
    jb.log('unmount',[...arguments]);
    if (!elem) return
    elem.setAttribute && elem.setAttribute('recycleCounter',(+(elem.getAttribute('recycleCounter') || '0')) + 1)
    elem.querySelectorAll && [elem, ...Array.from(elem.querySelectorAll('[cmpId]'))]
        .forEach(el=> {
            [el._component, ...(el._extraCmps || [])].filter(x=>x).map(cmp=> cmp.componentWillUnmount())
        })
    ui.garbageCollectCtxDictionary()
}
function unbindCmps(elem) {
    elem && elem.querySelectorAll && [elem, ...Array.from(elem.querySelectorAll('[cmpId]'))]
        .forEach(el=> el._extraCmps = el._component = null)
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
        vdom.cmp.base = elem
        if (elem._component) {
            elem._extraCmps = elem._extraCmps || []
            elem._extraCmps.push(vdom.cmp)
        } else {
            elem._component = vdom.cmp
        }
        parentElem.appendChild(elem)
        jb.log('htmlChange',['appendChild',parentElem,elem])
        vdom.cmp.componentDidMount()
    } 
    return elem
}

Object.assign(jb.ui, {
    VNode: Symbol.for("VNode"),
    StrongRefresh: Symbol.for("StrongRefresh"),
    RecalcVars: Symbol.for("RecalcVars"),
    h, render, unmount, applyVdomDiff,
    handleCmpEvent(specificHandler) {
        const el = [event.currentTarget, ...jb.ui.parents(event.currentTarget)].find(el=> el.getAttribute && el.getAttribute('cmpId') != null)
        //const el = document.querySelector(`[cmpId="${cmpId}"]`)
        if (!el) return
        const methodPath = specificHandler ? specificHandler : `on${event.type}Handler`
        const path = ['_component',...methodPath.split('.')]
        const handler = jb.path(el,path)
        const obj = jb.path(el,path.slice(0,-1))
        return handler && handler.call(obj,event,event.type)
    },
    ctrl(context,options) {
        const ctx = context.setVars({ $model: context.params });
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
    
        const used = Array.from(document.querySelectorAll('[jb-ctx]')).map(e=>Number(e.getAttribute('jb-ctx'))).sort((x,y)=>x-y);
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
    stateChangeEm: new jb.rx.Subject(),
    setState(cmp,state,opEvent,watchedAt) {
        jb.log('setState',[...arguments]);
        if ((state === false || state == null) && cmp.refresh) {
            cmp.refresh();
        } else {
            cmp.setState(state || cmp.calcState && cmp.calcState(cmp) || {});
        }
        ui.stateChangeEm.next({cmp,opEvent,watchedAt});
    },
    refreshElem(elem,{strongRefresh,recalcVars},sourceCtx) {
        if (strongRefresh || !elem._component) 
            return doStrongRefresh(elem)
        const cmp = elem._component
        cmp && ui.setState(cmp,recalcVars && {[ui.RecalcVars]: true}, null,sourceCtx)
    
        function doStrongRefresh() {
            const originatingCtx = ui.ctxOfElem(elem)
            const newCmp = originatingCtx && originatingCtx.runItself()
            newCmp && applyVdomDiff(elem, h(''),h(newCmp),newCmp)
        }
    },
    refreshComp(ctx,el) {
        const nextElem = el.nextElementSibling;
        const newElem = ui.render(ui.h(ctx.runItself().reactComp()),el.parentElement,el);
        if (nextElem)
            newElem.parentElement.insertBefore(newElem,nextElem);
    },
    subscribeToRefChange: watchHandler => watchHandler.resourceChange.subscribe(e=> {
        const changed_path = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        const observablesCmps = Array.from((e.srcCtx && e.srcCtx.vars.elemToTest || document).querySelectorAll('[cmpId]')).map(el=>el._component)
            .filter(cmp=>cmp && cmp.toObserve.length)
    
        observablesCmps.forEach(cmp => {
            if (cmp._destroyed) return // can not use filter as cmp may be destroyed during the process
            const newState = {}
            let refresh = false
            cmp.toObserve.forEach(obs=>{
                if (checkCircularity(obs)) return
                let obsPath = jb.refHandler(obs.ref).pathOfRef(obs.ref)
                obsPath = obsPath && watchHandler.removeLinksFromPath(obsPath)
                if (!obsPath)
                return jb.logError('observer ref path is empty',obs,e)
                const diff = ui.comparePaths(changed_path, obsPath)
                const isChildOfChange = diff == 1
                const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
                const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
                if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure) {
                    jb.log('notifyCmpObservable',['notify change',e.srcCtx,obs,e])
                    refresh = true
                    Object.assign(newState, obs.strongRefresh && {[ui.StrongRefresh]: true}, obs.recalcVars && {[ui.RecalcVars]: true})
                }
            })
            if (refresh)
                ui.setState(cmp,Object.getOwnPropertySymbols(newState).length ? newState : null,e,e.srcCtx)
        })
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
        const ctxStylePath = obs.srcCtx.path.replace(/~features~?[0-9]*$/,'')
        for(let i=0;i<callerPathsToCompare.length;i++)
            if (callerPathsToCompare[i].indexOf(ctxStylePath) == 0) // ignore - generated from a watchRef feature in the call stack
                return true
    }
}

})()