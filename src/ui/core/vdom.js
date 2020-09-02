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
        if (typeof cmpOrTag === 'string' && cmpOrTag.indexOf('#') != -1) {
            this.addClass(cmpOrTag.split('#').pop().trim())
            cmpOrTag = cmpOrTag.split('#')[0]
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
    return { ...vdom, parentNode: null, children: vdom.children && vdom.children.map(x=>stripVdom(x)) }
}

function _unStripVdom(vdom,parent) {
    if (!vdom || typeof vdom.parentNode == 'undefined') return
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

Object.assign(jb.ui, {VNode, cloneVNode, toVdomOrStr, stripVdom, unStripVdom})

})()