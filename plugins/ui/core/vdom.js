extension('ui','vdom', {
    VNode: class VNode {
        constructor(cmpOrTag, _attributes, _children) {
            const attributes = jb.objFromEntries(jb.entries(_attributes).map(e=>[e[0].toLowerCase(),e[1]])
                .map(([id,val])=>[id.match(/^on[^-]/) ? `${id.slice(0,2)}-${id.slice(2)}` : id, typeof val == 'object' ? val : ''+val]))
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
            if (children && children.length == 0) children = null
            if (!Array.isArray(children || []))
                jb.logError('vdom - children must be array',{cmpOrTag, _attributes, _children})
            
            this.attributes = attributes
                
            if (typeof cmpOrTag == 'string' && cmpOrTag.indexOf('.') != -1) {
                this.addClass(cmpOrTag.split('.').pop().trim())
                cmpOrTag = cmpOrTag.split('.')[0]
            }
            if (typeof cmpOrTag == 'string' && cmpOrTag.indexOf('#') != -1)
                debugger
            if (typeof cmpOrTag != 'string' && !jb.path(cmpOrTag,'$'))
                debugger

            if (children != null)
                children.forEach(ch=>ch.parentNode = this)
            Object.assign(this,{...{[typeof cmpOrTag === 'string' ? 'tag' : 'cmp'] : cmpOrTag} ,...(children && {children}) })
        }
        getAttribute(att) {
            const res = (this.attributes || {})[att.toLowerCase()]
            return res == null ? res : (''+res)
        }
        setAttribute(att,val) {
            if (val == null) return
            this.attributes = this.attributes || {}
            this.attributes[att.toLowerCase()] = ''+val
            return this
        }
        removeAttribute(att) {
            this.attributes && delete this.attributes[att.toLowerCase()]
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
        appendChild(vdom) {
            this.children.push(vdom)
            return this
        }
        querySelector(...args) {
            return this.querySelectorAll(...args)[0]
        }
        querySelectorAll(selector,{includeSelf}={}) {
            let maxDepth = 50
            if (!selector) debugger
            if (selector.match(/^:scope>/)) 
                return this.children.filter(el=>el.querySelector(selector.slice(7),{includeSelf: true}))
            if (selector == '' || selector == ':scope') return [this]
            if (selector.indexOf(',') != -1)
                return selector.split(',').map(x=>x.trim()).reduce((res,sel) => [...res, ...this.querySelectorAll(sel,{includeSelf})], [])
            const hasAtt = selector.match(/^\[([a-zA-Z0-9_$\-]+)\]$/)
            const attEquals = selector.match(/^\[([a-zA-Z0-9_$\-]+)="([a-zA-Z0-9_\-→•]+)"\]$/)
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
        outerHTML() { // for tests
            return `<${this.tag} ${jb.entries(this.attributes).map(([att,val]) => att+'="'+val+'"').join(' ')}>
    ${(this.children || []).map(x=>x.outerHTML()).join('\n')}
</${this.tag}>`
        }
    },
    toVdomOrStr(val) {
        if (jb.utils.isDelayed(val))
            return jb.utils.toSynchArray(val).then(v => jb.ui.toVdomOrStr(v[0]))

        const res1 = Array.isArray(val) ? val.map(v=>jb.val(v)): val
        let res = jb.val((Array.isArray(res1) && res1.length == 1) ? res1[0] : res1)
        if (res && res instanceof jb.ui.VNode || Array.isArray(res)) return res
        if (typeof res === 'boolean' || typeof res === 'object')
            res = '' + res
        else if (typeof res === 'string')
            res = res.slice(0,1000)
        return res
    },
    stripVdom(vdom) {
        if (jb.path(vdom,'constructor.name') != 'VNode') {
            jb.logError('stripVdom - not vnode', {vdom})
            return jb.ui.h('span')
        }
        return { 
            ...(vdom.attributes && {attributes: vdom.attributes}), 
            ...(vdom.children && vdom.children.length && {children: vdom.children.map(x=>jb.ui.stripVdom(x))}),
            tag: vdom.tag
        }
    },
    unStripVdom(vdom,parent) {
        return _unStripVdom(JSON.parse(JSON.stringify(vdom)),parent)

        function _unStripVdom(vdom,parent) {
            if (!vdom) return // || typeof vdom.parentNode == 'undefined') return
            vdom.parentNode = parent
            Object.setPrototypeOf(vdom, jb.ui.VNode.prototype);
            ;(vdom.children || []).forEach(ch=>_unStripVdom(ch,vdom))
            return vdom
        }
    },
    vdomToHtml(vdom) {
        let childs = (vdom.children || [])
        if (!Array.isArray(childs))
            childs = childs.length ? Array.from(Array(childs.length).keys()).map(i=>childs[i]) : []
        const childern = childs.map(x=>jb.ui.vdomToHtml(x)).join('')
        return `<${vdom.tag} ${jb.entries(vdom.attributes).map(([k,v]) => k+'="' +v + '"').join(' ')} ${childern?'':'/'}>
            ${childern ? childern + '</' + vdom.tag +'>' :''}`
    },
    cloneVNode(vdom) {
        return jb.ui.unStripVdom(JSON.parse(JSON.stringify(jb.ui.stripVdom(vdom))))
    },
    vdomDiff(newObj,orig) {
        const ignoreRegExp = /\$|checked|style|value|parentNode|frontend|__|widget|on-|remoteuri|width|height|top|left|aria-|tabindex|colocation/
        const ignoreValue = /__undefined/
        const ignoreClasses = /selected|mdc-[a-z\-0-9]+/
        return doDiff(newObj,orig)
        function doDiff(newObj,orig,attName) {
            if (Array.isArray(orig) && orig.length == 0) orig = null
            if (Array.isArray(newObj) && newObj.length == 0) newObj = null
            if (orig === newObj) return {}
    //        if (jb.path(newObj,'attributes.jb_external') || jb.path(orig,'attributes.jb_external')) return {}
            if (typeof orig == 'string' && ignoreValue.test(orig) || typeof newObj == 'string' && ignoreValue.test(newObj)) return {}
            if (attName == 'class' && 
                (typeof orig == 'string' && ignoreClasses.test(orig) || typeof newObj == 'string' && ignoreClasses.test(newObj))) return {}
            if (!jb.utils.isObject(orig) || !jb.utils.isObject(newObj)) return newObj
            const deletedValues = Object.keys(orig)
                .filter(k=>!ignoreRegExp.test(k))
                .filter(k=> !(typeof orig[k] == 'string' && ignoreValue.test(orig[k])))
                .filter(k => !(Array.isArray(orig[k]) && orig[k].length == 0))
    //            .filter(k => !(typeof orig[k] == 'object' && jb.path(orig[k],'attributes.jb_external')))
                .reduce((acc, key) => newObj.hasOwnProperty(key) ? acc : { ...acc, [key]: '__undefined'}, {})

            return Object.keys(newObj)
                .filter(k=>!ignoreRegExp.test(k))
                .filter(k=> !(typeof newObj[k] == 'string' && ignoreValue.test(newObj[k])))
                .filter(k => !(Array.isArray(newObj[k]) && newObj[k].length == 0))
    //            .filter(k => !(typeof newObj[k] == 'object' && jb.path(newObj[k],'attributes.jb_external')))
                .reduce((acc, key) => {
                    if (!orig.hasOwnProperty(key)) return { ...acc, [key]: newObj[key] } // return added r key
                    const difference = doDiff(newObj[key], orig[key],key)
                    if (jb.utils.isObject(difference) && jb.utils.isEmpty(difference)) return acc // return no diff
                    return { ...acc, [key]: difference } // return updated key
            }, deletedValues)    
        }
    }
})