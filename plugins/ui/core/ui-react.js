extension('ui', 'react', {
    initExtension() {
        Object.assign(this,{
            BECmpsDestroyNotification: jb.callbag.subject(),
            refreshNotification: jb.callbag.subject(),
            renderingUpdates: jb.callbag.subject(),
            widgetUserRequests: jb.callbag.subject(),
            widgetEventCounter: {},
            followUps: {},
        })

        // subscribe for widget renderingUpdates
        jb.callbag.subscribe(e=> {
            if (!e.widgetId && e.cmpId && typeof document != 'undefined') {
                const elem = document.querySelector(`[cmp-id="${e.cmpId}"]`)
                if (elem) {
                    jb.ui.applyDeltaToDom(elem, e.delta, e.ctx)
                    jb.ui.refreshFrontEnd(elem, {content: e.delta})
                }
            }
        })(jb.ui.renderingUpdates)

        // subscribe for destroy notification
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

            // destroy BE
            if (widgetId && !destroyLocally)
                jb.ui.sendUserReq({$$:'destroy', ...e })
            else
                cmps.forEach(cmp=> jb.ui.cmps[cmp.cmpId] && jb.ui.cmps[cmp.cmpId].destroy())

        })(jb.ui.BECmpsDestroyNotification)

        jb.spy.registerEnrichers([
            r => jb.spy.findProp(r,'delta') && ({ props: {delta: jb.ui.beautifyDelta(jb.spy.findProp(r,'delta')) }})
        ])   
    },
    elemToVdom(elem) {
        if (elem instanceof jb.ui.VNode) return elem
        if (elem.getAttribute('jb_external')) return
        const textNode = Array.from(elem.children).filter(x=>x.tagName != 'BR').length == 0
        return {
            tag: elem.tagName.toLowerCase(),
            attributes: jb.objFromEntries([
                ...Array.from(elem.attributes).map(e=>[e.name,e.value]), 
                ...(textNode ? [['$text',elem.innerText]] : [])
                //...(jb.path(elem,'firstChild.nodeName') == '#text' ? [['$text',elem.firstChild.nodeValue]] : [])
            ]),
            ...( elem.childElementCount && !textNode && { children: Array.from(elem.children).map(el=> jb.ui.elemToVdom(el)).filter(x=>x) })
        }
    },
    applyNewVdom(elem,vdomAfter,{strongRefresh, ctx, delta, srcCtx} = {}) {
        const widgetId = jb.ui.headlessWidgetId(elem)
        const tagChange = vdomAfter && vdomAfter.tag != (elem.tagName || elem.tag).toLowerCase()
        jb.log('applyNew vdom',{widgetId,elem,vdomAfter,strongRefresh, ctx})
        if (delta) { // used only by $runFEMethod, no refreshing of frontEnd
            const cmpId = elem.getAttribute('cmp-id')
            jb.log('applyNew vdom runFEMethod',{elem,cmpId,delta, ctx})
            if (widgetId)
                jb.ui.sendRenderingUpdate(ctx,{delta,cmpId,widgetId})
            else
                jb.ui.applyDeltaToDom(elem,delta, ctx)
            return
        }
        if (widgetId) {
            const cmpId = elem.getAttribute('cmp-id')
            const vdomBefore = elem instanceof jb.ui.VNode ? elem : jb.ui.elemToVdom(elem)
            const delta = jb.ui.compareVdom(vdomBefore,vdomAfter,ctx)
            //const assumedVdom = JSON.parse(JSON.stringify(jb.ui.stripVdom(elem)))
            if (elem != vdomAfter) { // update the elem
                if (tagChange || strongRefresh)
                    jb.ui.unmount(elem)
        
                ;(elem.children ||[]).forEach(ch=>ch.parentNode = null)
                Object.keys(elem).filter(x=>x !='parentNode').forEach(k=>delete elem[k])
                Object.assign(elem,vdomAfter)
                ;(vdomAfter.children ||[]).forEach(ch=>ch.parentNode = elem)
            }
            const id = elem.getAttribute('id')
            jb.ui.sendRenderingUpdate(ctx,{id, delta,cmpId,widgetId, src_evCounter: jb.path(srcCtx,'vars.evCounter') })
            return
        }
        const active = jb.ui.activeElement() === elem
        if (tagChange || strongRefresh) {
            jb.ui.unmount(elem)
            const newElem = jb.ui.render(vdomAfter,elem.parentElement,{ctx})
            elem.parentElement.replaceChild(newElem,elem)
            jb.log('replaceTop vdom',{newElem,elem})
            elem = newElem
        } else {
            const vdomBefore = elem instanceof jb.ui.VNode ? elem : jb.ui.elemToVdom(elem)
            const delta = jb.ui.compareVdom(vdomBefore,vdomAfter,ctx)
            const cmpId = elem.getAttribute('cmp-id')
            jb.log('applyDeltaTop apply delta top dom',{cmpId, vdomBefore,vdomAfter,active,elem,vdomAfter,strongRefresh, delta, ctx})
            if (!(elem instanceof jb.ui.VNode) && elem.querySelectorAll)
                [...elem.querySelectorAll('[jb_external]')].forEach(el=>el.parentNode.removeChild(el))
            jb.ui.applyDeltaToDom(elem,delta,ctx)
        }
        if (!(elem instanceof jb.ui.VNode) || ctx.vars.emulateFrontEndInTest) {
            if (elem instanceof jb.ui.VNode)
                jb.ui.setAttToVdom(elem,ctx)
            jb.ui.refreshFrontEnd(elem, {content: vdomAfter})
        }
        if (active) jb.ui.focus(elem,'apply Vdom diff',ctx)
        jb.ui.garbageCollectUiComps({ctx})
    },

    applyDeltaToDom(elem,delta,ctx) {
        if (elem instanceof jb.ui.VNode)
            return jb.ui.applyDeltaToVDom(elem,delta,ctx)
        jb.log('applyDelta dom',{elem,delta,ctx})
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
                } else if (e.$$ == 'delete') {
                    jb.ui.unmount(childElems[i])
                    elem.removeChild(childElems[i])
                    jb.log('removeChild dom',{childElem: childElems[i],e,elem,delta,ctx})
                } else {
                    jb.ui.applyDeltaToDom(childElems[i],e,ctx)
                    !sameOrder && (childElems[i].setAttribute('__afterIndex',e.__afterIndex))
                }
            })
            ;(toAppend||[]).forEach(e=>{
                const newElem = jb.ui.render(e,elem,{ctx})
                jb.log('appendChild dom',{newElem,e,elem,delta,ctx})
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
                        jb.log('removeChild dom leftover',{ch,elem,delta,ctx})
                    })
        }
        jb.entries(delta.attributes)
            .filter(e=> !(e[0] === '$text' && elem.firstElementChild) ) // elem with $text should not have children
            .forEach(e=> jb.ui.setAtt(elem,e[0],e[1]),ctx)
        
        function removeChild(toDelete) {
            jb.ui.unmount(toDelete)
            elem.removeChild(toDelete)
            jb.log('removeChild dom',{toDelete,elem,delta,ctx})
        }
    },
    applyDeltaToVDom(elem,delta,ctx) {
        if (!elem) return
        jb.log('applyDelta vdom',{elem,delta,ctx})
        const children = delta.children
        if (children) {
            const childrenArr = children.length ? Array.from(Array(children.length).keys()).map(i=>children[i]) : []
            let childElems = elem.children || []
            const {toAppend,deleteCmp,sameOrder,resetAll} = children

            if (resetAll) {
                childElems.forEach(ch => {
                    jb.ui.unmount(ch)
                    ch.parentNode = null
                })
                childElems = []
            }
            if (deleteCmp) {
                while ((index = childElems.findIndex(ch=>ch.getAttribute('cmp-id') == deleteCmp)) != -1) {
                    childElems[index] && (childElems[index].parentNode = null)
                    jb.ui.unmount(childElems.splice(index,1)[0])
                }
            }
            childrenArr.forEach((e,i) => {
                if (!e) {
                    !sameOrder && (childElems[i].setAttribute('__afterIndex',''+i))
                } else if (e.$$ == 'delete') {
                    jb.ui.unmount(childElems.splice(i,1)[0])
                    jb.log('removeChild dom',{childElem: childElems[i],e,elem,delta,ctx})
                } else {
                    jb.ui.applyDeltaToVDom(childElems[i],e)
                    !sameOrder && (childElems[i].setAttribute('__afterIndex',e.__afterIndex))
                }
            })
            ;(toAppend||[]).forEach(e=>{
                const newElem = jb.ui.unStripVdom(e,elem)
                jb.log('appendChild dom',{newElem,e,elem,delta,ctx})
                !sameOrder && (newElem.setAttribute('__afterIndex',e.__afterIndex))
                childElems.push(newElem)
            })
            if (sameOrder === false) {
                childElems.sort((x,y) => Number(x.getAttribute('__afterIndex')) - Number(y.getAttribute('__afterIndex')))
                    .forEach(el=> {
                        const index = Number(el.getAttribute('__afterIndex'))
                        if (childElems[index] != el)
                            childElems.splice(index,0,el) //childElems.insertBefore(el, childElems[index])
                        el.removeAttribute('__afterIndex')
                    })
            }   
            // remove leftover text nodes in mixed
            elem.children = childElems.filter(ch=>ch.tag != '#text')
        }
        Object.assign(elem.attributes,delta.attributes)
    },
    setAtt(elem,att,val,ctx) {
        const activeElem = jb.path(jb.frame.document,'activeElement')
        if (val == '__undefined') val = null
        if (att[0] !== '$' && val == null) {
            elem.removeAttribute(att)
            jb.log('dom change remove',{elem,att,val,ctx})
        } else if (att.indexOf('on-') == 0 && val != null && !elem[`registeredTo-${att}`]) {
            elem.addEventListener(att.slice(3), ev => jb.ui.handleCmpEvent(ev,val,ctx))
            elem[`registeredTo-${att}`] = true
        } else if (att.indexOf('on-') == 0 && val == null) {
            elem.removeEventListener(att.slice(3), ev => jb.ui.handleCmpEvent(ev,val,ctx))
            elem[`registeredTo-${att}`] = false
        } else if (att === 'checked' && (elem.tagName || elem.tag).toLowerCase() === 'input') {
            elem.setAttribute(att,val)
            jb.delay(1).then(()=> { // browser bug?
                elem.checked = true
                jb.log('dom set checked',{elem,att,val,ctx})
            })
        // } else if (att.indexOf('$__input') === 0) {
        //     try {
        //         jb.ui.setInput(JSON.parse(val),ctx)
        //     } catch(e) {}
        } else if (att.indexOf('$__') === 0) {
            const id = att.slice(3)
            try {
                elem[id] = JSON.parse(val) || ''
            } catch (e) {}
            jb.log(`dom set data ${id}`,{elem,att,val,ctx})
        } else if (att === '$runFEMethod') {
            const {method, data, vars} = JSON.parse(val)
            elem._component && elem._component.runFEMethod(method,data,vars)
        } else if (att === '$focus') {
            elem.setAttribute('__focus',val || 'no source')
            jb.ui.focus(elem,val,ctx)
        } else if (att === '$scrollDown' && val) {
            elem.__appScroll = true
            elem.scrollTop = elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1
        } else if (att === '$scrollDown' && val == null) {
            delete elem.__appScroll
        } else if (att === '$text') {
            elem.innerText = val || ''
            jb.log('dom set text',{elem,att,val,ctx})
        } else if (att === '$html') {
            elem.innerHTML = val || ''
            jb.log('dom set html',{elem,att,val,ctx})
        } else if (att === 'style' && typeof val === 'object') {
            elem.setAttribute(att,jb.entries(val).map(e=>`${e[0]}:${e[1]}`).join(';'))
            jb.log('dom set style',{elem,att,val,ctx})
        } else if (att == 'value' && elem.tagName && elem.tagName.match(/select|input|textarea/i) ) {
            const active = activeElem === elem
            if (elem.value == val) return
            elem.value = val
            if (active && activeElem !== elem) { debugger; elem.focus() }
            jb.log('dom set elem value',{elem,att,val,ctx})
        } else {
            elem.setAttribute(att,val)
            //jb.log('dom set att',{elem,att,val,ctx}) too many calls
        }
    },
    setInput({assumedVal,newVal,selectionStart}, ctx) {
        const el = jb.ui.findIncludeSelf(ctx.vars.cmp.base ,'input,textarea')[0]
        jb.log('dom set input check',{el, assumedVal,newVal,selectionStart,ctx})
        if (!el)
            return jb.logError('setInput: can not find input under elem',{elem,ctx})
        //if (el.value == null) el.value = ''
        const curValue = (el instanceof jb.ui.VNode ? el.getAttribute('value') : el.value) || ''
        if (assumedVal != curValue) 
            return jb.logError('setInput: assumed val is not as expected',{ assumedVal, value: el.value, el,ctx })

        const activeElem = jb.path(jb.frame.document,'activeElement')        
        const active = activeElem === el
        jb.log('dom set input',{el, assumedVal,newVal,selectionStart,ctx})
        if (el instanceof jb.ui.VNode)
            el.setAttribute('value',newVal)
        else
            el.value = newVal
        if (typeof selectionStart == 'number') 
            el.selectionStart = selectionStart
        if (active && activeElem !== el) { debugger; el.focus() }
    },
    unmount(elem) { // todo - return promise
        if (!elem || !elem.setAttribute) return

        const groupByWidgets = {}
        jb.ui.findIncludeSelf(elem,'[cmp-id]').forEach(el => {
            el._component && el._component.destroyFE()
            el._component = null
            const FEWidgetId = jb.ui.frontendWidgetId(elem)
            if (FEWidgetId && FEWidgetId != 'client') return
            const widgetId = jb.ui.headlessWidgetId(el) || '_local_'
            groupByWidgets[widgetId] = groupByWidgets[widgetId] || { cmps: []}
            const cmpId = el.getAttribute('cmp-id'), ver = el.getAttribute('cmp-ver')
            groupByWidgets[widgetId].cmps.push({cmpId,ver,el})
        })
        jb.log('unmount',{elem,groupByWidgets})
        jb.entries(groupByWidgets).forEach(([widgetId,val])=>
            jb.ui.BECmpsDestroyNotification.next({
                widgetId, cmps: val.cmps,
                destroyLocally: widgetId == '_local_',
                destroyWidget: jb.ui.findIncludeSelf(elem,`[widgetid="${widgetId}"]`).length,
        }))
    },
    render(vdom,parentElem,{prepend,ctx,doNotRefreshFrontEnd} = {}) {
        jb.log('render',{vdom,parentElem,prepend})
        if (parentElem instanceof jb.ui.VNode) {
            parentElem.appendChild(vdom)
            if (ctx.vars.emulateFrontEndInTest) {
                jb.ui.setAttToVdom(vdom,ctx)
                jb.ui.refreshFrontEnd(vdom, {content: vdom})
            }
            return
        }

        const res = doRender(vdom,parentElem)
        vdomDiffCheckForDebug()
        !doNotRefreshFrontEnd && jb.ui.refreshFrontEnd(res, {content: vdom })
        return res

        function doRender(vdom,parentElem) {
            jb.log('dom createElement',{tag: vdom.tag, vdom,parentElem})
            const elem = createElement(parentElem.ownerDocument, vdom.tag)
            jb.entries(vdom.attributes).forEach(e=>jb.ui.setAtt(elem,e[0],e[1],ctx))
            jb.asArray(vdom.children).map(child=> doRender(child,elem)).forEach(el=>elem.appendChild(el))
            prepend ? parentElem.prepend(elem) : parentElem.appendChild(elem)
            return elem
        }
        function vdomDiffCheckForDebug() {
            const checkResultingVdom = jb.ui.elemToVdom(res)
            const diff = jb.ui.vdomDiff(checkResultingVdom,vdom)
            if (checkResultingVdom && Object.keys(diff).length)
                jb.logError('render diff',{diff,checkResultingVdom,vdom})
        }
        function createElement(doc,tag) {
            tag = tag || 'div'
            return (['svg','circle','ellipse','image','line','mesh','path','polygon','polyline','rect','text'].indexOf(tag) != -1) ?
                doc.createElementNS("http://www.w3.org/2000/svg", tag) : doc.createElement(tag)
        }
    },
    handleCmpEvent(ev, specificMethod,ctx) {
        specificMethod = specificMethod == 'true' ? `on${ev.type}Handler` : specificMethod
        const userReq = jb.ui.rawEventToUserRequest(ev,{specificMethod,ctx})
        jb.log('handle cmp event',{ev,specificMethod,userReq})
        if (!userReq) return true
        if (userReq.widgetId && userReq.widgetId != 'client')
            jb.ui.sendUserReq(userReq)
        else {
            const cmp = jb.ui.cmps[userReq.cmpId]
            if (!cmp)
                return jb.logError(`handleCmpEvent - no cmp in dictionary for id ${userReq.cmpId}`,{ev,specificMethod})
            if (userReq.method)
                cmp.runBEMethod(userReq.method,userReq.data,userReq.vars)
            else {
                return jb.logError(`handleCmpEvent - no method in request`,{ev,specificMethod})
            }
        }
    },
    sendUserReq(userReq) {
        jb.ui.widgetUserRequests.next(userReq)
    },
    rawEventToUserRequest(ev, {specificMethod, ctx} = {}) {
        const elem = jb.ui.closestCmpElem(ev.currentTarget)
        //const elem = jb.ui.parents(ev.currentTarget,{includeSelf: true}).find(el=> el.getAttribute && el.getAttribute('jb-ctx') != null)
        if (!elem) 
            return jb.logError('rawEventToUserRequest can not find closest elem with jb-ctx',{ctx, ev})
        const cmpId = elem.getAttribute('cmp-id')
        const method = specificMethod && typeof specificMethod == 'string' ? specificMethod : `on${ev.type}Handler`
        //const ctxIdToRun = jb.ui.ctxIdOfMethod(elem,method)
        const widgetId = jb.ui.frontendWidgetId(elem) || ev.widgetId
        jb.ui.widgetEventCounter[widgetId] = (jb.ui.widgetEventCounter[widgetId] || 0) + 1
        if (!cmpId)
            return jb.logError(`no cmpId in element`,{ctx, elem, method, widgetId })

        return {$:'userRequest', method, widgetId, cmpId, vars: 
            { evCounter: jb.ui.widgetEventCounter[widgetId], ev: jb.ui.buildUserEvent(ev, elem, ctx)} }
    },
    calcElemProps(elem) {
        return elem instanceof jb.ui.VNode ? {} : { 
            outerHeight: jb.ui.outerHeight(elem), outerWidth: jb.ui.outerWidth(elem), 
            clientRect: jb.ui.clientRect(elem) 
        }
    },
    buildUserEvent(ev, elem, ctx) {
        if (!ev) return null
        const userEvent = {
            value: ev.value || (ev.target || {}).value || jb.path(ev,'target.attributes.value'), 
            elem: jb.ui.calcElemProps(elem),
            ev: {},
        }
        const evProps = (elem.getAttribute('usereventprops') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] != 'elem')
        const elemProps = (elem.getAttribute('usereventprops') || '').split(',').filter(x=>x).filter(x=>x.split('.')[0] == 'elem').map(x=>x.split('.')[1])
        ;['type','keyCode','ctrlKey','altKey','clientX','clientY', ...evProps].forEach(prop=> ev[prop] != null && (userEvent.ev[prop] = ev[prop]))
        ;['id', 'class', ...elemProps].forEach(prop=>userEvent.elem[prop] = elem.getAttribute(prop))
        jb.path(elem,'_component.enrichUserEvent') && elem._component.enrichUserEvent(ev,{userEvent, ctx})
        if (ev.fixedTarget) userEvent.elem = jb.ui.calcElemProps(ev.fixedTarget) // enrich UserEvent can 'fix' the target, e.g. picking the selected node in tree
        return userEvent
    },
    ctxIdOfMethod(elem,action) {
        if (action.match(/^[0-9]+$/)) return action
        return (elem.getAttribute('methods') || '').split(',').filter(x=>x.indexOf(action+'-') == 0)
            .map(str=>str.split('-')[1])
            .filter(x=>x)[0]
    },
    runBEMethodByContext(ctx,method,data,vars) {
        const cmp = ctx.vars.cmp
        if (cmp.isBEComp)
            return cmp.runBEMethod(method,data,vars ? {...ctx.vars, ...vars} : ctx.vars)
        else
            return jb.ui.runBEMethodByElem(cmp.base,method,data,
                    {$updateCmpState: {state: cmp.state, cmpId: cmp.cmpId}, $state: cmp.state, ev: ctx.vars.ev, ...vars})
    },
    runBEMethodByElem(elem,method,data,vars) {
        if (!elem)
            return jb.logError(`runBEMethod, no elem provided: ${method}`, {elem, data, vars})
        const FEWidgetId = jb.ui.frontendWidgetId(elem)
        const cmpId = elem.getAttribute('cmp-id')

        if (FEWidgetId && FEWidgetId != 'client') {
            jb.log(`frontEnd method send request: ${method}`,{ elem, FEWidgetId, cmpId, data, vars})
            jb.ui.sendUserReq({$:'userRequest', method, widgetId: FEWidgetId, cmpId, data, vars })
        } else {
            return jb.ui.cmps[cmpId].runBEMethod(method,data,vars,{})
        }
    },
    applyDeltaToCmp({delta, ctx, cmpId, elem, assumedVdom}) {
        if (!delta) return
        elem = elem || jb.ui.elemOfCmp(ctx,cmpId)
        if (!elem || delta._$prevVersion && delta._$prevVersion != elem.getAttribute('cmp-ver')) {
            jb.ui.elemOfCmp(ctx,cmpId) // for debug
            const reason = elem ? 'unexpected version' : 'elem not found'
            jb.logError(`applyDeltaToCmp: ${reason}`,{reason, delta, ctx, cmpId, elem})
            return // { recover: true, reason }
        }
        if (assumedVdom) {
            const actualVdom = jb.ui.elemToVdom(elem)
            const diff = jb.ui.vdomDiff(assumedVdom,actualVdom)
            if (Object.keys(diff).length) {
                const actual = jb.ui.vdomToHtml(actualVdom),assumed = jb.ui.vdomToHtml(assumedVdom),dif = diff // jb.utils.prettyPrint(diff)
                jb.logError('wrong assumed vdom',{actual, assumed, dif, actualVdom, assumedVdom, diff, delta, ctx, cmpId, elem})
                return { recover: true, reason: { diff, description: 'wrong assumed vdom'} }
            }
        }
        const bySelector = delta._$bySelector && Object.keys(delta._$bySelector)[0]
        const actualElem = bySelector ? jb.ui.querySelectorAll(elem,bySelector)[0] : elem
        const actualdelta = bySelector ? delta._$bySelector[bySelector] : delta
        jb.log('applyDelta uiComp',{cmpId, delta, ctx, elem, bySelector, actualElem})
        if (actualElem instanceof jb.ui.VNode) {
            jb.ui.applyDeltaToVDom(actualElem, actualdelta,ctx)
            const { headlessWidgetId, headlessWidget, emulateFrontEndInTest, widgetId } = ctx.vars
            headlessWidget && jb.ui.sendRenderingUpdate(ctx,{delta,cmpId,widgetId: headlessWidgetId,ctx})
            if (emulateFrontEndInTest) {
                jb.ui.setAttToVdom(actualElem,ctx)
                jb.ui.refreshFrontEnd(actualElem, {content: delta, emulateFrontEndInTest: true, widgetId })
            }
            // if (uiTest && jb.path(jb,'parent.uri') == 'tests' && jb.path(jb,'parent.ui.renderingUpdates')) // used for distributedWidget tests
            //     jb.parent.ui.sendRenderingUpdate(ctx,{delta,ctx})
        } else if (actualElem) {
            jb.ui.applyDeltaToDom(actualElem, actualdelta, ctx)
            jb.ui.refreshFrontEnd(actualElem, {content: delta})
        }
    },
    setAttToVdom(elem,ctx) {
        jb.entries(elem.attributes).forEach(e=>jb.ui.setAtt(elem,e[0],e[1],ctx))
        ;(elem.children || []).forEach(el => jb.ui.setAttToVdom(el,ctx))
    },
    sendRenderingUpdate(ctx,renderingUpdate) {
        const tx = ctx.vars.userReqTx
        if (tx) tx.next(renderingUpdate)
        if (!tx) jb.ui.renderingUpdates.next(renderingUpdate)
        return renderingUpdate
    },
})
