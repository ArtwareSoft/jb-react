class VNode {
    constructor(cmpOrTag, _attributes, _children) {
        const attributes = jb.objFromEntries(jb.entries(_attributes).map(e=>[e[0].toLowerCase(),e[1]]))
        let children = (_children === '') ? null : _children
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
            children = children.filter(x=>x).map(item=> typeof item == 'string' ? jb.ui.h('span',{$text: item}) : item)
        
        this.attributes = attributes
        if (typeof cmpOrTag === 'string' && cmpOrTag.indexOf('#') != -1) {
            this.addClass(cmpOrTag.split('#').pop().trim())
            cmpOrTag = cmpOrTag.split('#')[0]
        }
        Object.assign(this,{...{[typeof cmpOrTag === 'string' ? 'tag' : 'cmp'] : cmpOrTag} ,children})
    }
    getAttribute(att) {
        return (this.attributes || {})[att]
    }
    setAttribute(att,val) {
        this.attributes = this.attributes || {}
        this.attributes[att] = val
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
    querySelectorAll(selector,{includeSelf}={}) {
        const hasAtt = selector.match(/^\[([a-zA-Z0-9_\-]+)\]$/)
        const attEquals = selector.match(/^\[([a-zA-Z0-9_\-]+)="([a-zA-Z0-9_\-]+)"\]$/)
        const hasClass = selector.match(/^\.([a-zA-Z0-9_\-]+)$/)
        const hasTag = selector.match(/^[a-zA-Z0-9_\-]+$/)
        const selectorMatcher = hasAtt ? el => el.attributes && el.attributes[hasAtt[1]]
            : hasClass ? el => el.hasClass(hasClass[1])
            : hasTag ? el => el.tag === hasTag[0]
            : attEquals ? el => el.attributes && el.attributes[attEquals[1]] == attEquals[2]
            : null

        return selectorMatcher && doFind(this,selectorMatcher,!includeSelf)

        function doFind(vdom,selectorMatcher,excludeSelf) {
            return [ ...(!excludeSelf && selectorMatcher(vdom) ? [vdom] : []), 
                ...(vdom.children||[]).flatMap(ch=> doFind(ch,selectorMatcher))
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

function cloneVNode(vdom) {
    return setClass(JSON.parse(JSON.stringify(vdom)))
    function setClass(vdomObj) {
        Object.setPrototypeOf(vdomObj, VNode.prototype);
        (vdomObj.children || []).forEach(ch=>setClass(ch))
        return vdomObj
    }
}

Object.assign(jb.ui, {VNode, cloneVNode, toVdomOrStr})