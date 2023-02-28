jb.extension('ui', 'react', {
    initExtension() {
        Object.assign(this,{
            BECmpsDestroyNotification: jb.callbag.subject(),
            refreshNotification: jb.callbag.subject(),
            renderingUpdates: jb.callbag.subject(),
            widgetUserRequests: jb.callbag.subject(),
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

            if (widgetId && !destroyLocally)
                jb.ui.widgetUserRequests.next({$$:'destroy', ...e })
            else 
                cmps.forEach(cmp=> (cmp.destroyCtxs || []).forEach(ctxIdToRun => {
                    jb.log('backend method destroy uiComp',{cmp, el: cmp.el})
                    jb.ui.runCtxAction(jb.ctxDictionary[ctxIdToRun])
                } ))
        })(jb.ui.BECmpsDestroyNotification)

        jb.spy.registerEnrichers([
            r => jb.spy.findProp(r,'delta') && ({ props: {delta: jb.ui.beautifyDelta(jb.spy.findProp(r,'delta')) }})
        ])   
    },
    h(cmpOrTag,attributes,children) {
        if (cmpOrTag instanceof jb.ui.VNode) return cmpOrTag // Vdom
        if (cmpOrTag && cmpOrTag.renderVdom)
            return cmpOrTag.renderVdomAndFollowUp()
    
        return new jb.ui.VNode(cmpOrTag,attributes,children)
    },
    compareVdom(b,after,ctx) {
        const a = after instanceof jb.ui.VNode ? jb.ui.stripVdom(after) : after
        jb.log('vdom diff compare',{before: b,after : a,ctx})
        const attributes = jb.utils.objectDiff(a.attributes || {}, b.attributes || {})
        const children = childDiff(b.children || [],a.children || [])
        return { 
            ...(Object.keys(attributes).length ? {attributes} : {}), 
            ...(children ? {children} : {}),
            ...(a.tag != b.tag ? { tag: a.tag} : {})
        }

        function childDiff(b,a) {
            if (b.length == 0 && a.length ==0) return
            if (a.length == 1 && b.length == 1 && a[0].tag == b[0].tag)
                return { 0: {...jb.ui.compareVdom(b[0],a[0],ctx),__afterIndex: 0}, length: 1 }
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
                    res[i] =  {$$: 'delete' } //, __afterIndex: i }
                } else {
                    reused[__afterIndex] = true
                    const innerDiff = { __afterIndex, ...jb.ui.compareVdom(e, a[__afterIndex],ctx), ...(e.$remount ? {remount: true}: {}) }
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
                const val1 = atts1.ctxId && jb.path(jb.ctxDictionary[atts1.ctxId],att)
                const val2 = atts2.ctxId && jb.path(jb.ctxDictionary[atts2.ctxId],att)
                return val1 && val2 && val1 == val2
            }            
        }
    },

    applyNewVdom(elem,vdomAfter,{strongRefresh, ctx, delta} = {}) {
        const widgetId = jb.ui.headlessWidgetId(elem)
        jb.log('applyNew vdom',{widgetId,elem,vdomAfter,strongRefresh, ctx})
        if (delta) { // used only by $runFEMethod
            const cmpId = elem.getAttribute('cmp-id')
            jb.log('applyNew vdom runFEMethod',{elem,cmpId,delta, ctx})
            if (widgetId)
                jb.ui.renderingUpdates.next({delta,cmpId,widgetId})
            else
                jb.ui.applyDeltaToDom(elem,delta, ctx)
            return
        }
        if (widgetId) {
            const cmpId = elem.getAttribute('cmp-id')
            const delta = jb.ui.compareVdom(elem,vdomAfter,ctx)
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
            jb.ui.unmount(elem)
            const newElem = jb.ui.render(vdomAfter,elem.parentElement,{ctx})
            elem.parentElement.replaceChild(newElem,elem)
            jb.log('replaceTop vdom',{newElem,elem})
            elem = newElem
        } else {
            const vdomBefore = elem instanceof jb.ui.VNode ? elem : jb.ui.elemToVdom(elem)
            const delta = jb.ui.compareVdom(vdomBefore,vdomAfter,ctx)
            jb.log('apply delta top dom',{vdomBefore,vdomAfter,active,elem,vdomAfter,strongRefresh, delta, ctx})
            jb.ui.applyDeltaToDom(elem,delta,ctx)
        }
        jb.ui.refreshFrontEnd(elem, {content: vdomAfter})
        if (active) jb.ui.focus(elem,'apply Vdom diff',ctx)
        jb.ui.garbageCollectCtxDictionary()
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

    applyDeltaToDom(elem,delta,ctx) {
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
	beautifyXml(xml) {
		return xml.trim().split(/>\s*</).reduce( (acc, node) => {
			const pad = Math.max(0,acc[1] + (node.match( /^\w[^>]*[^\/]/ ) ? 1 :node.match( /^\/\w/ ) ? -1 : 0))
			return [acc[0] + new Array(pad).join('  ') + '<' + node + '>\n', pad]
		}, ['',0])[0].slice(1,-2)
	},    
    beautifyDelta(delta) {
        const childs = delta.children
        const childrenAtts = childs && ['sameOrder','resetAll','deleteCmp'].filter(p=>childs[p]).map(p=>p+'="' + childs[p] +'"').join(' ')
        const childrenArr = childs.length ? Array.from(Array(childs.length).keys()).map(i=>childs[i]) : []
        const children = (childrenAtts || childrenArr.length) && `<children ${childrenAtts||''}>${childrenArr.map(ch=>jb.ui.vdomToHtml(ch)).join('')}</children>`
        const toAppend = childs && childs.toAppend && `<toAppend>${childs.toAppend.map(ch=>jb.ui.vdomToHtml(ch)).join('')}</toAppend>`
        return jb.ui.beautifyXml(`<delta ${jb.entries(delta.attributes).map(([k,v]) => k+'="' +v + '"').join(' ')}>
            ${[children,toAppend].filter(x=>x).join('')}</delta>`)
    },
    setAtt(elem,att,val,ctx) {
        if (val == '__undefined') val = null
        if (att[0] !== '$' && val == null) {
            elem.removeAttribute(att)
            jb.log('dom change remove',{elem,att,val,ctx})
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
                jb.log('dom set checked',{elem,att,val,ctx})
            })
        } else if (att.indexOf('$__input') === 0) {
            try {
                setInput(JSON.parse(val),ctx)
            } catch(e) {}
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
        } else if (att == 'value' && elem.tagName.match(/select|input|textarea/i) ) {
            const active = document.activeElement === elem
            if (elem.value == val) return
            elem.value = val
            if (active && document.activeElement !== elem) { debugger; elem.focus() }
            jb.log('dom set elem value',{elem,att,val,ctx})
        } else {
            elem.setAttribute(att,val)
            //jb.log('dom set att',{elem,att,val,ctx}) too many calls
        }

        function setInput({assumedVal,newVal,selectionStart},ctx) {
            const el = jb.ui.findIncludeSelf(elem,'input,textarea')[0]
            jb.log('dom set input check',{el, assumedVal,newVal,selectionStart,ctx})
            if (!el)
                return jb.logError('setInput: can not find input under elem',{elem,ctx})
            if (assumedVal != el.value) 
                return jb.logError('setInput: assumed val is not as expected',{ assumedVal, value: el.value, el,ctx })
            const active = document.activeElement === el
            jb.log('dom set input',{el, assumedVal,newVal,selectionStart,ctx})
            el.value = newVal
            if (typeof selectionStart == 'number') 
                el.selectionStart = selectionStart
            if (active && document.activeElement !== el) { debugger; el.focus() }
        }
    },

    unmount(elem) {
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
    },
    render(vdom,parentElem,{prepend,ctx} = {}) {
        jb.log('render',{vdom,parentElem,prepend})
        if (jb.path(parentElem,'constructor.name') == 'VNode')
            return parentElem.appendChild(vdom)

        const res = doRender(vdom,parentElem)
        vdomDiffCheckForDebug()
        jb.ui.refreshFrontEnd(res, {content: vdom })
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
    },
    ctrl(origCtx,options) {
        const styleByControl = jb.path(origCtx,'cmpCtx.profile.$') == 'styleByControl'
        const $state = (origCtx.vars.$refreshElemCall || styleByControl) ? origCtx.vars.$state : {}
        const cmpId = origCtx.vars.$cmpId, cmpVer = origCtx.vars.$cmpVer
        if (!origCtx.vars.$serviceRegistry)
            jb.logError('no serviceRegistry',{ctx: origCtx})
        const ctx = origCtx.setVars({
            $model: { ctx: origCtx, ...origCtx.params},
            $state,
            $serviceRegistry: origCtx.vars.$serviceRegistry,
            $refreshElemCall : undefined, $props : undefined, cmp: undefined, $cmpId: undefined, $cmpVer: undefined 
        })
        const styleOptions = runEffectiveStyle(ctx) || {}
        if (styleOptions instanceof jb.ui.JbComponent)  {// style by control
            return styleOptions.orig(ctx).jbExtend(options,ctx).applyParamFeatures(ctx)
        }
        return new jb.ui.JbComponent(ctx,cmpId,cmpVer).jbExtend(options,ctx).jbExtend(styleOptions,ctx).applyParamFeatures(ctx)
    
        function runEffectiveStyle(ctx) {
            const profile = origCtx.profile
            const defaultVar = '$theme.' + (profile.$ || '')
            if (!profile.style && origCtx.vars[defaultVar])
                return ctx.run({$:origCtx.vars[defaultVar]})
            return origCtx.params.style ? origCtx.params.style(ctx) : {}
        }
    },
    garbageCollectCtxDictionary(forceNow,clearAll) {
        if (!forceNow)
            return jb.delay(1000).then(()=>jb.ui.garbageCollectCtxDictionary(true))
   
        const used = 'jb-ctx,full-cmp-ctx,pick-ctx,props-ctx,methods,frontEnd,originators,eventhandlers'.split(',')
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
                if (dict[i] == 850) debugger
                delete jb.ctxDictionary[''+dict[i]]
            }
        }
        // remove unused vars from resources
        const ctxToPath = ctx => Object.values(ctx.vars).filter(v=>jb.db.isWatchable(v)).map(v => jb.db.asRef(v))
            .map(ref=>jb.db.refHandler(ref).pathOfRef(ref)).flat()
        const globalVarsUsed = jb.utils.unique(used.map(x=>jb.ctxDictionary[''+x]).filter(x=>x).map(ctx=>ctxToPath(ctx)).flat())
        Object.keys(jb.db.resources).filter(id=>id.indexOf(':') != -1)
            .filter(id=>globalVarsUsed.indexOf(id) == -1)
            .filter(id=>+id.split(':').pop < maxUsed)
            .forEach(id => { removedResources.push(id); delete jb.db.resources[id]})

        // remove front-end widgets
        const usedWidgets = jb.objFromEntries(
            Array.from(querySelectAllWithWidgets(`[widgetid]`)).filter(el => el.getAttribute('frontend')).map(el => [el.getAttribute('widgetid'),1]))
        const removeWidgets = Object.keys(jb.ui.frontendWidgets||{}).filter(id=>!usedWidgets[id])

        removeWidgets.forEach(widgetId => {
            jb.ui.widgetUserRequests.next({$$:'destroy', widgetId, destroyWidget: true, cmps: [] })
            if (jb.ui.frontendWidgets) delete jb.ui.frontendWidgets[widgetId]
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
            return jb.ui.headless ? [...Object.values(jb.ui.headless).filter(x=>x.body).flatMap(w=>w.body.querySelectorAll(query,{includeSelf:true})), 
                ...Array.from(jb.frame.document && document.querySelectorAll(query) || [])].filter(x=>x) : []
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
            const actualVdom = jb.ui.elemToVdom(elem)
            const diff = jb.ui.vdomDiff(assumedVdom,actualVdom)
            if (Object.keys(diff).length) {
                const actual = jb.ui.vdomToHtml(actualVdom),assumed = jb.ui.vdomToHtml(assumedVdom),dif = diff // jb.utils.prettyPrint(diff)
                jb.logError('wrong assumed vdom',{actual, assumed, dif, actualVdom, assumedVdom, diff, delta, ctx, cmpId, elem})
                return { recover: true, reason: { diff, description: 'wrong assumed vdom'} }
            }
        }
        const bySelector = delta._$bySelector && Object.keys(delta._$bySelector)[0]
        const actualElem = bySelector ? jb.ui.find(elem,bySelector)[0] : elem
        const actualdelta = bySelector ? delta._$bySelector[bySelector] : delta
        jb.log('applyDelta uiComp',{cmpId, delta, ctx, elem, bySelector, actualElem})
        if (actualElem instanceof jb.ui.VNode) {
            jb.ui.applyDeltaToVDom(actualElem, actualdelta,ctx)
            jb.ui.renderingUpdates.next({delta,cmpId,widgetId: ctx.vars.headlessWidgetId,ctx})
            if (ctx.vars.uiTest && jb.path(jb,'parent.uri') == 'tests' && jb.path(jb,'parent.ui.renderingUpdates')) // used for distributedWidget tests
                jb.parent.ui.renderingUpdates.next({delta,ctx})
        } else if (actualElem) {
            jb.ui.applyDeltaToDom(actualElem, actualdelta, ctx)
            jb.ui.refreshFrontEnd(actualElem, {content: delta})
        }
    },
    refreshElem(elem, state, options) {
        if (jb.path(elem,'_component.state.frontEndStatus') == 'initializing' || jb.ui.findIncludeSelf(elem,'[__refreshing]')[0]) 
            return jb.logError('circular refresh',{elem, state, options})
        const cmpId = elem.getAttribute('cmp-id'), cmpVer = +elem.getAttribute('cmp-ver')
        const _ctx = jb.ui.ctxOfElem(elem)
        if (!_ctx) 
            return jb.logError('refreshElem - no ctx for elem',{elem, cmpId, cmpVer})
        const strongRefresh = jb.path(options,'strongRefresh')
        const newState = strongRefresh ? {refresh: true } 
            : { ...jb.path(elem._component,'state'), refreshSource: jb.path(options,'refreshSource'), refresh: true, ...state} // strongRefresh kills state
        let ctx = _ctx.setVars({$model: null, $state: newState, $refreshElemCall: true, $cmpId: cmpId, $cmpVer: cmpVer+1})
        ctx._parent = null
        if (options && options.extendCtx)
            ctx = options.extendCtx(ctx)
//        ctx = ctx.setVar('$refreshElemCall',true).setVar('$cmpId', cmpId).setVar('$cmpVer', cmpVer+1) // special vars for refresh
        if (ctx.vars.$previewMode && jb.watchableComps.handler) // updating to latest version of profile - todo: moveto studio
            ctx.profile = jb.watchableComps.handler.valOfPath(ctx.path.split('~')) || ctx.profile
        elem.setAttribute('__refreshing','')
        const cmp = ctx.profile.$ == 'openDialog' ? ctx.run(dialog.buildComp()) : ctx.runItself()
        jb.log('refresh elem start',{cmp,ctx,newState ,elem, state, options})

        const className = elem.className != null ? elem.className : jb.path(elem.attributes.class) || ''
        const existingClass = (className.match(/[•a-zA-Z0-9_-]+⦾[0-9]*/)||[''])[0]
        if (jb.path(options,'cssOnly') && existingClass) {
            const { headlessWidget, headlessWidgetId } = ctx.vars
            if (headlessWidget) {
                const existingElemId = jb.entries(jb.ui.headless[headlessWidgetId].styles||{}).find(([id,text])=>text.indexOf(existingClass) != -1)[0]
                jb.log('css only refresh headelss element',{existingElemId, cmp, lines: cmp.cssLines,ctx,elem, state, options})
                jb.ui.hashCss(cmp.calcCssLines(),cmp.ctx,{existingClass, existingElemId})
            } else {
                const existingElem = Array.from(document.querySelectorAll('style')).find(el=>el.innerText.indexOf(existingClass) != -1)
                const existingElemId = existingElem.getAttribute('elemId')
                jb.log('css only refresh element',{existingElemId, existingElem, cmp, lines: cmp.cssLines,ctx,elem, state, options})
                jb.ui.hashCss(cmp.calcCssLines(),cmp.ctx,{existingClass, existingElemId})
            }
        } else {
            jb.log('do refresh element',{cmp,ctx,elem, state, options})
            cmp && jb.ui.applyNewVdom(elem, jb.ui.h(cmp), {strongRefresh, ctx})
        }
        elem.removeAttribute('__refreshing')
        jb.ui.refreshNotification.next({cmp,ctx,elem, state, options})
        //jb.studio.execInStudio({ $: 'animate.refreshElem', elem: () => elem })
    }
})
