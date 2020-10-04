(function () {

class VNode {
    constructor(cmpOrTag, _attributes, _children) {
        const attributes = jb.objFromEntries(jb.entries(_attributes).map(e=>[e[0].toLowerCase(),e[1]])
            .map(([id,val])=>[id.match(/^on[^-]/) ? `${id.slice(0,2)}-${id.slice(2)}` : id,val]))
        let children = (_children === '') ? null : _children
        if (['string','boolean','number'].indexOf(typeof children) !== -1) {
            attributes.$text = ''+children
            children = null
        }
        if (children && typeof children.then == 'function') {
            attributes.$text = '...'
            children = null
        }
        if (children != null && !Array.isArray(children)) children = [children]
        if (children != null)
            children = children.filter(x=>x).map(item=> typeof item == 'string' ? jb.ui.h('span',{$text: item}) : item)
        
        this.attributes = attributes
        if (typeof cmpOrTag === 'string' && cmpOrTag.indexOf('#') != -1)
            debugger
        if (typeof cmpOrTag === 'string' && cmpOrTag.indexOf('.') != -1) {
            this.addClass(cmpOrTag.split('.').pop().trim())
            cmpOrTag = cmpOrTag.split('.')[0]
        }
        if (children != null)
            children.forEach(ch=>ch.parentNode = this)
        Object.assign(this,{...{[typeof cmpOrTag === 'string' ? 'tag' : 'cmp'] : cmpOrTag} ,children})
    }
    getAttribute(att) {
        const res = (this.attributes || {})[att]
        return res == null ? res : (''+res)
    }
    setAttribute(att,val) {
        this.attributes = this.attributes || {}
        this.attributes[att.toLowerCase()] = ''+val
        return this
    }
    addClass(clz) {
        if (clz.indexOf(' ') != -1) {
            clz.split(' ').filter(x=>x).forEach(cl=>this.addClass(cl))
            return this
        }
        this.attributes = this.attributes || {};
        if (this.attributes.class === undefined) this.attributes.class = ''
        if (clz && this.attributes.class.split(' ').indexOf(clz) == -1) {
            this.attributes.class = [this.attributes.class,clz].filter(x=>x).join(' ');
        }
        return this;
    }
    hasClass(clz) {
        return (jb.path(this,'attributes.class') || '').split(' ').indexOf(clz) != -1
    }
    querySelector(...args) {
        return this.querySelectorAll(...args)[0]
    }
    querySelectorAll(selector,{includeSelf}={}) {
        let maxDepth = 50
        if (selector.match(/^:scope>/)) {
            maxDepth = 1
            selector = selector.slice(7)
        }
        if (selector == '' || selector == ':scope') return [this]
        if (selector.indexOf(',') != -1)
            return selector.split(',').map(x=>x.trim()).reduce((res,sel) => [...res, ...this.querySelectorAll(sel,{includeSelf})], [])
        const hasAtt = selector.match(/^\[([a-zA-Z0-9_$\-]+)\]$/)
        const attEquals = selector.match(/^\[([a-zA-Z0-9_$\-]+)="([a-zA-Z0-9_\-]+)"\]$/)
        const hasClass = selector.match(/^\.([a-zA-Z0-9_$\-]+)$/)
        const hasTag = selector.match(/^[a-zA-Z0-9_\-]+$/)
        const idEquals = selector.match(/^#([a-zA-Z0-9_$\-]+)$/)
        const selectorMatcher = hasAtt ? el => el.attributes && el.attributes[hasAtt[1]]
            : hasClass ? el => el.hasClass(hasClass[1])
            : hasTag ? el => el.tag === hasTag[0]
            : attEquals ? el => el.attributes && el.attributes[attEquals[1]] == attEquals[2]
            : idEquals ? el => el.attributes && el.attributes.id == idEquals[1]
            : null

        return selectorMatcher && doFind(this,selectorMatcher,!includeSelf,0)

        function doFind(vdom,selectorMatcher,excludeSelf,depth) {
            return depth >= maxDepth ? [] : [ ...(!excludeSelf && selectorMatcher(vdom) ? [vdom] : []), 
                ...(vdom.children||[]).flatMap(ch=> doFind(ch,selectorMatcher,false,depth+1))
            ]
        }
    }
}

function toVdomOrStr(val) {
    if (jb.isDelayed(val))
        return jb.toSynchArray(val).then(v => jb.ui.toVdomOrStr(v[0]))

    const res1 = Array.isArray(val) ? val.map(v=>jb.val(v)): val
    let res = jb.val((Array.isArray(res1) && res1.length == 1) ? res1[0] : res1)
    if (res && res instanceof VNode || Array.isArray(res)) return res
    if (typeof res === 'boolean' || typeof res === 'object')
        res = '' + res
    else if (typeof res === 'string')
        res = res.slice(0,1000)
    return res
}

function stripVdom(vdom) {
    if (jb.path(vdom,'constructor.name') != 'VNode') {
        jb.logError('stripVdom - not vnode', {vdom})
        return jb.ui.h('span')
    }
    return { ...vdom, parentNode: null, children: vdom.children && vdom.children.map(x=>stripVdom(x)) }
}

function _unStripVdom(vdom,parent) {
    if (!vdom) return // || typeof vdom.parentNode == 'undefined') return
    vdom.parentNode = parent
    Object.setPrototypeOf(vdom, VNode.prototype);
    ;(vdom.children || []).forEach(ch=>_unStripVdom(ch,vdom))
    return vdom
}

function unStripVdom(vdom,parent) {
    return _unStripVdom(JSON.parse(JSON.stringify(vdom)),parent)
}

function cloneVNode(vdom) {
    return unStripVdom(JSON.parse(JSON.stringify(stripVdom(vdom))))
}


function h(cmpOrTag,attributes,children) {
    if (cmpOrTag instanceof ui.VNode) return cmpOrTag // Vdom
    if (cmpOrTag && cmpOrTag.renderVdom)
        return cmpOrTag.renderVdomAndFollowUp()
   
    return new jb.ui.VNode(cmpOrTag,attributes,children)
}

function compareVdom(b,after) {
    const a = after instanceof ui.VNode ? ui.stripVdom(after) : after
    jb.log('vdom diff compare',{before: b,after : a})
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
        jb.log('vdom child diff start',{before: b,after: a})
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
        jb.log('vdom child diff result',{res,before: b,after: a})
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

Object.assign(jb.ui, {VNode, cloneVNode, toVdomOrStr, stripVdom, unStripVdom })

})()