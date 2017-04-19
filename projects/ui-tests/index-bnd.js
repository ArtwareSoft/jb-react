/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

!function () {
    'use strict';

    function VNode() {}
    function h(nodeName, attributes) {
        var lastSimple,
            child,
            simple,
            i,
            children = EMPTY_CHILDREN;
        for (i = arguments.length; i-- > 2;) stack.push(arguments[i]);
        if (attributes && null != attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) && void 0 !== child.pop) for (i = child.length; i--;) stack.push(child[i]);else {
            if (child === !0 || child === !1) child = null;
            if (simple = 'function' != typeof nodeName) if (null == child) child = '';else if ('number' == typeof child) child = String(child);else if ('string' != typeof child) simple = !1;
            if (simple && lastSimple) children[children.length - 1] += child;else if (children === EMPTY_CHILDREN) children = [child];else children.push(child);
            lastSimple = simple;
        }
        var p = new VNode();
        p.nodeName = nodeName;
        p.children = children;
        p.attributes = null == attributes ? void 0 : attributes;
        p.key = null == attributes ? void 0 : attributes.key;
        if (void 0 !== options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        for (var i in props) obj[i] = props[i];
        return obj;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function enqueueRender(component) {
        if (!component.__d && (component.__d = !0) && 1 == items.push(component)) (options.debounceRendering || setTimeout)(rerender);
    }
    function rerender() {
        var p,
            list = items;
        items = [];
        while (p = list.pop()) if (p.__d) renderComponent(p);
    }
    function isSameNodeType(node, vnode, hydrating) {
        if ('string' == typeof vnode || 'number' == typeof vnode) return void 0 !== node.splitText;
        if ('string' == typeof vnode.nodeName) return !node._componentConstructor && isNamedNode(node, vnode.nodeName);else return hydrating || node._componentConstructor === vnode.nodeName;
    }
    function isNamedNode(node, nodeName) {
        return node.__n === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }
    function getNodeProps(vnode) {
        var props = extend({}, vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (void 0 !== defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function createNode(nodeName, isSvg) {
        var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
        node.__n = nodeName;
        return node;
    }
    function removeNode(node) {
        if (node.parentNode) node.parentNode.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('key' === name) ;else if ('ref' === name) {
            if (old) old(null);
            if (value) value(node);
        } else if ('class' === name && !isSvg) node.className = value || '';else if ('style' === name) {
            if (!value || 'string' == typeof value || 'string' == typeof old) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if ('string' != typeof old) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && IS_NON_DIMENSIONAL.test(i) === !1 ? value[i] + 'px' : value[i];
            }
        } else if ('dangerouslySetInnerHTML' === name) {
            if (value) node.innerHTML = value.__html || '';
        } else if ('o' == name[0] && 'n' == name[1]) {
            var useCapture = name !== (name = name.replace(/Capture$/, ''));
            name = name.toLowerCase().substring(2);
            if (value) {
                if (!old) node.addEventListener(name, eventProxy, useCapture);
            } else node.removeEventListener(name, eventProxy, useCapture);
            (node.__l || (node.__l = {}))[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            setProperty(node, name, null == value ? '' : value);
            if (null == value || value === !1) node.removeAttribute(name);
        } else {
            var ns = isSvg && name !== (name = name.replace(/^xlink\:?/, ''));
            if (null == value || value === !1) {
                if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);
            } else if ('function' != typeof value) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);
        }
    }
    function setProperty(node, name, value) {
        try {
            node[name] = value;
        } catch (e) {}
    }
    function eventProxy(e) {
        return this.__l[e.type](options.event && options.event(e) || e);
    }
    function flushMounts() {
        var c;
        while (c = mounts.pop()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = null != parent && void 0 !== parent.ownerSVGElement;
            hydrating = null != dom && !('__preactattr_' in dom);
        }
        var ret = idiff(dom, vnode, context, mountAll, componentRoot);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (! --diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll, componentRoot) {
        var out = dom,
            prevSvgMode = isSvgMode;
        if (null == vnode) vnode = '';
        if ('string' == typeof vnode) {
            if (dom && void 0 !== dom.splitText && dom.parentNode && (!dom._component || componentRoot)) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                out = document.createTextNode(vnode);
                if (dom) {
                    if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                    recollectNodeTree(dom, !0);
                }
            }
            out.__preactattr_ = !0;
            return out;
        }
        if ('function' == typeof vnode.nodeName) return buildComponentFromVNode(dom, vnode, context, mountAll);
        isSvgMode = 'svg' === vnode.nodeName ? !0 : 'foreignObject' === vnode.nodeName ? !1 : isSvgMode;
        if (!dom || !isNamedNode(dom, String(vnode.nodeName))) {
            out = createNode(String(vnode.nodeName), isSvgMode);
            if (dom) {
                while (dom.firstChild) out.appendChild(dom.firstChild);
                if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                recollectNodeTree(dom, !0);
            }
        }
        var fc = out.firstChild,
            props = out.__preactattr_ || (out.__preactattr_ = {}),
            vchildren = vnode.children;
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && null != fc && void 0 !== fc.splitText && null == fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || null != fc) innerDiffNode(out, vchildren, context, mountAll, hydrating || null != props.dangerouslySetInnerHTML);
        diffAttributes(out, vnode.attributes, props);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
        var j,
            c,
            vchild,
            child,
            originalChildren = dom.childNodes,
            children = [],
            keyed = {},
            keyedLen = 0,
            min = 0,
            len = originalChildren.length,
            childrenLen = 0,
            vlen = vchildren ? vchildren.length : 0;
        if (0 !== len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i],
                props = _child.__preactattr_,
                key = vlen && props ? _child._component ? _child._component.__k : props.key : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (props || (void 0 !== _child.splitText ? isHydrating ? _child.nodeValue.trim() : !0 : isHydrating)) children[childrenLen++] = _child;
        }
        if (0 !== vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && void 0 !== keyed[key]) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (!child && min < childrenLen) for (j = min; j < childrenLen; j++) if (void 0 !== children[j] && isSameNodeType(c = children[j], vchild, isHydrating)) {
                child = c;
                children[j] = void 0;
                if (j === childrenLen - 1) childrenLen--;
                if (j === min) min++;
                break;
            }
            child = idiff(child, vchild, context, mountAll);
            if (child && child !== dom) if (i >= len) dom.appendChild(child);else if (child !== originalChildren[i]) if (child === originalChildren[i + 1]) removeNode(originalChildren[i]);else dom.insertBefore(child, originalChildren[i] || null);
        }
        if (keyedLen) for (var i in keyed) if (void 0 !== keyed[i]) recollectNodeTree(keyed[i], !1);
        while (min <= childrenLen) if (void 0 !== (child = children[childrenLen--])) recollectNodeTree(child, !1);
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component);else {
            if (null != node.__preactattr_ && node.__preactattr_.ref) node.__preactattr_.ref(null);
            if (unmountOnly === !1 || null == node.__preactattr_) removeNode(node);
            removeChildren(node);
        }
    }
    function removeChildren(node) {
        node = node.lastChild;
        while (node) {
            var next = node.previousSibling;
            recollectNodeTree(node, !0);
            node = next;
        }
    }
    function diffAttributes(dom, attrs, old) {
        var name;
        for (name in old) if ((!attrs || null == attrs[name]) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
        for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    }
    function collectComponent(component) {
        var name = component.constructor.name;
        (components[name] || (components[name] = [])).push(component);
    }
    function createComponent(Ctor, props, context) {
        var inst,
            list = components[Ctor.name];
        if (Ctor.prototype && Ctor.prototype.render) {
            inst = new Ctor(props, context);
            Component.call(inst, props, context);
        } else {
            inst = new Component(props, context);
            inst.constructor = Ctor;
            inst.render = doRender;
        }
        if (list) for (var i = list.length; i--;) if (list[i].constructor === Ctor) {
            inst.__b = list[i].__b;
            list.splice(i, 1);
            break;
        }
        return inst;
    }
    function doRender(props, state, context) {
        return this.constructor(props, context);
    }
    function setComponentProps(component, props, opts, context, mountAll) {
        if (!component.__x) {
            component.__x = !0;
            if (component.__r = props.ref) delete props.ref;
            if (component.__k = props.key) delete props.key;
            if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (context && context !== component.context) {
                if (!component.__c) component.__c = component.context;
                component.context = context;
            }
            if (!component.__p) component.__p = component.props;
            component.props = props;
            component.__x = !1;
            if (0 !== opts) if (1 === opts || options.syncComponentUpdates !== !1 || !component.base) renderComponent(component, 1, mountAll);else enqueueRender(component);
            if (component.__r) component.__r(component);
        }
    }
    function renderComponent(component, opts, mountAll, isChild) {
        if (!component.__x) {
            var rendered,
                inst,
                cbase,
                props = component.props,
                state = component.state,
                context = component.context,
                previousProps = component.__p || props,
                previousState = component.__s || state,
                previousContext = component.__c || context,
                isUpdate = component.base,
                nextBase = component.__b,
                initialBase = isUpdate || nextBase,
                initialChildComponent = component._component,
                skip = !1;
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== opts && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === !1) skip = !0;else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.__p = component.__s = component.__c = component.__b = null;
            component.__d = !1;
            if (!skip) {
                rendered = component.render(props, state, context);
                if (component.getChildContext) context = extend(extend({}, context), component.getChildContext());
                var toUnmount,
                    base,
                    childComponent = rendered && rendered.nodeName;
                if ('function' == typeof childComponent) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === childComponent && childProps.key == inst.__k) setComponentProps(inst, childProps, 1, context, !1);else {
                        toUnmount = inst;
                        component._component = inst = createComponent(childComponent, childProps, context);
                        inst.__b = inst.__b || nextBase;
                        inst.__u = component;
                        setComponentProps(inst, childProps, 0, context, !1);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === opts) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase, !1);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component,
                        t = component;
                    while (t = t.__u) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.unshift(component);else if (!skip) {
                flushMounts();
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, previousContext);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            if (null != component.__h) while (component.__h.length) component.__h.pop().call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component,
            originalComponent = c,
            oldDom = dom,
            isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
            isOwner = isDirectOwner,
            props = getNodeProps(vnode);
        while (c && !isOwner && (c = c.__u)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (originalComponent && !isDirectOwner) {
                unmountComponent(originalComponent);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context);
            if (dom && !c.__b) {
                c.__b = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom, !1);
            }
        }
        return dom;
    }
    function unmountComponent(component) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component.__x = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner);else if (base) {
            if (base.__preactattr_ && base.__preactattr_.ref) base.__preactattr_.ref(null);
            component.__b = base;
            removeNode(base);
            collectComponent(component);
            removeChildren(base);
        }
        if (component.__r) component.__r(null);
    }
    function Component(props, context) {
        this.__d = !0;
        this.context = context;
        this.props = props;
        this.state = this.state || {};
    }
    function render(vnode, parent, merge) {
        return diff(merge, vnode, {}, !1, parent, !1);
    }
    var options = {};
    var stack = [];
    var EMPTY_CHILDREN = [];
    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var items = [];
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var components = {};
    extend(Component.prototype, {
        setState: function (state, callback) {
            var s = this.state;
            if (!this.__s) this.__s = extend({}, s);
            extend(s, 'function' == typeof state ? state(s, this.props) : state);
            if (callback) (this.__h = this.__h || []).push(callback);
            enqueueRender(this);
        },
        forceUpdate: function (callback) {
            if (callback) (this.__h = this.__h || []).push(callback);
            renderComponent(this, 2);
        },
        render: function () {}
    });
    var preact = {
        h: h,
        createElement: h,
        cloneElement: cloneElement,
        Component: Component,
        render: render,
        rerender: rerender,
        options: options
    };
    if (true) module.exports = preact;else self.preact = preact;
}();
//# sourceMappingURL=preact.js.map

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_preact__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_preact___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_preact__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_jb_core_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ui_jb_react_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ui_jb_react_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_ui_jb_react_js__);




var jb = { ctrl: __WEBPACK_IMPORTED_MODULE_2_ui_jb_react_js__["ctrl"], component: __WEBPACK_IMPORTED_MODULE_1_core_jb_core_js__["a" /* component */] };

/** @jsx h */

jb.component('group', {
  type: 'control', category: 'group:100,common:90',
  params: [{ id: 'title', as: 'string', dynamic: true }, { id: 'style', type: 'group.style', defaultValue: { $: 'group.section' }, essential: true, dynamic: true }, { id: 'controls', type: 'control[]', essential: true, flattenArray: true, dynamic: true, composite: true }, { id: 'features', type: 'feature[]', dynamic: true }],
  impl: ctx => jb.ctrl(ctx, {
    beforeInit: cmp => cmp.state.ctrls = ctx.params.controls()
  })
});

jb.component('group.section', {
  type: 'group.style',
  impl: { $: 'custom-style',
    template: (props, state) => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__["h"])(
      'section',
      { 'class': 'jb-group' },
      state.ctrls.map(ctrl => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__["h"])(ctrl))
    )
  }
});

jb.component('label', {
  type: 'control', category: 'control:100,common:80',
  params: [{ id: 'title', as: 'string', essential: true, defaultValue: 'my label', dynamic: true }, { id: 'style', type: 'label.style', defaultValue: { $: 'label.span' }, dynamic: true }, { id: 'features', type: 'feature[]', dynamic: true }],
  impl: ctx => jb.ctrl(ctx.setVars({ title: ctx.params.title() }))
});

jb.component('label.bind-title', {
  type: 'feature',
  impl: ctx => ({
    init: cmp => cmp.setState({ title: ctx.vars.$model.title(cmp.ctx) }),
    doCheck: cmp => cmp.setState({ title: ctx.vars.$model.title(cmp.ctx) })
  })
});

jb.component('label.span', {
  type: 'label.style',
  impl: { $: 'custom-style',
    template: (props, state) => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__["h"])(
      'span',
      null,
      state.title
    ),
    features: { $: 'label.bind-title' }
  }
});

var label = new __WEBPACK_IMPORTED_MODULE_1_core_jb_core_js__["b" /* jbCtx */]().run({ $: 'label', title: 'hello world' });
var group = new __WEBPACK_IMPORTED_MODULE_1_core_jb_core_js__["b" /* jbCtx */]().run({ $: 'group',
  controls: [{ $: 'label', title: '1' }, { $: 'label', title: '2' }, { $: 'group',
    controls: [{ $: 'label', title: '3.1' }, { $: 'label', title: '3.2' }] }] });

__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__["render"])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_preact__["h"])(group), document.getElementById('test'));

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export jb_run */
/* unused harmony export expression */
/* unused harmony export bool_expression */
/* unused harmony export tojstype */
/* unused harmony export tostring */
/* unused harmony export toarray */
/* unused harmony export toboolean */
/* unused harmony export tosingle */
/* unused harmony export tonumber */
/* unused harmony export profileType */
/* unused harmony export compName */
/* unused harmony export compDef */
/* harmony export (immutable) */ __webpack_exports__["a"] = component;
/* unused harmony export typeDef */
/* unused harmony export functionDef */
/* unused harmony export resourceDef */
/* unused harmony export jbart */
/* unused harmony export logError */
/* unused harmony export logPerformance */
/* unused harmony export logException */
/* unused harmony export extend */
/* unused harmony export path */
/* unused harmony export ownPropertyNames */
/* unused harmony export obj */
/* unused harmony export compareArrays */
/* unused harmony export range */
/* unused harmony export entries */
/* unused harmony export flattenArray */
/* unused harmony export synchArray */
/* unused harmony export isProfOfType */
/* unused harmony export unique */
/* unused harmony export equals */
/* unused harmony export writeValue */
/* unused harmony export isRef */
/* unused harmony export objectProperty */
/* unused harmony export val */
/* unused harmony export delay */
function jb_run(context, parentParam, settings) {
  try {
    var profile = context.profile;
    if (context.probe && (!settings || !settings.noprobe)) {
      if (context.probe.pathToTrace.indexOf(context.path) == 0) return context.probe.record(context, parentParam);
    }
    if (profile === null) return tojstype(profile, parentParam && parentParam.as, context);
    if (profile.$debugger == 0) debugger;
    if (profile.$asIs) return profile.$asIs;
    if (parentParam && (parentParam.type || '').indexOf('[]') > -1 && !parentParam.as) // fix to array value. e.g. single feature not in array
      parentParam.as = 'array';

    if (typeof profile === 'object' && Object.getOwnPropertyNames(profile).length == 0) return;
    var run = prepare(context, parentParam);
    var jstype = parentParam && parentParam.as;
    context.parentParam = parentParam;
    switch (run.type) {
      case 'booleanExp':
        return bool_expression(profile, context);
      case 'expression':
        return tojstype(expression(profile, context, parentParam), jstype, context);
      case 'asIs':
        return profile;
      case 'object':
        return entriesToObject(entries(profile).map(e => [e[0], context.runInner(e[1], null, e[0])]));
      case 'function':
        return tojstype(profile(context), jstype, context);
      case 'null':
        return tojstype(null, jstype, context);
      case 'ignore':
        return context.data;
      case 'list':
        {
          return profile.map((inner, i) => context.runInner(inner, null, i));
        };
      case 'runActions':
        return jbart.comps.runActions.impl(new jbCtx(context, { profile: { actions: profile }, path: '' }));
      case 'if':
        {
          var cond = jb_run(run.ifContext, run.IfParentParam);
          if (cond && cond.then) return cond.then(res => res ? jb_run(run.thenContext, run.thenParentParam) : jb_run(run.elseContext, run.elseParentParam));
          return cond ? jb_run(run.thenContext, run.thenParentParam) : jb_run(run.elseContext, run.elseParentParam);
        }
      case 'profile':
        for (var varname in profile.$vars || {}) run.ctx.vars[varname] = run.ctx.runInner(profile.$vars[varname], null, '$vars~' + varname);
        run.preparedParams.forEach(paramObj => {
          switch (paramObj.type) {
            case 'function':
              run.ctx.params[paramObj.name] = paramObj.func;break;
            case 'array':
              run.ctx.params[paramObj.name] = paramObj.array.map((prof, i) => run.ctx.runInner(prof, paramObj.param, paramObj.name + '~' + i));break; // maybe we should [].concat and handle nulls
            default:
              run.ctx.params[paramObj.name] = jb_run(paramObj.context, paramObj.param);
          }
        });
        var out;
        if (run.impl) {
          var args = prepareGCArgs(run.ctx, run.preparedParams);
          if (profile.$debugger) debugger;
          if (!args.then) out = run.impl.apply(null, args);else return args.then(args => tojstype(run.impl.apply(null, args), jstype, context));
        } else {
          run.ctx.callerPath = context.path;
          out = jb_run(new jbCtx(run.ctx, { componentContext: run.ctx }), parentParam);
        }

        if (profile.$log) console.log(context.run(profile.$log));

        if (profile.$trace) console.log('trace: ' + context.path, compName(profile), context, out, run);

        return tojstype(out, jstype, context);
    }
  } catch (e) {
    if (context.vars.$throw) throw e;
    logException(e, 'exception while running run');
  }

  function prepareGCArgs(ctx, preparedParams) {
    var delayed = preparedParams.filter(param => {
      var v = ctx.params[param.name] || {};
      return (v.then || v.subscribe) && param.param.as != 'observable';
    });
    if (delayed.length == 0 || typeof Observable == 'undefined') return [ctx].concat(preparedParams.map(param => ctx.params[param.name]));

    return Observable.from(preparedParams).concatMap(param => ctx.params[param.name]).toArray().map(x => [ctx].concat(x)).toPromise();
  }
}

function compParams(comp) {
  if (!comp || !comp.params) return [];
  return Array.isArray(comp.params) ? comp.params : entries(comp.params).map(x => extend(x[1], obj('id', x[0])));
}

function prepareParams(comp, profile, ctx) {
  return compParams(comp).filter(comp => !comp.ignore).map((param, index) => {
    var p = param.id;
    var val = profile[p],
        path = p;
    if (!val && index == 0 && sugarProp(profile)) {
      path = sugarProp(profile)[0];
      val = sugarProp(profile)[1];
    }
    var valOrDefault = typeof val != "undefined" ? val : typeof param.defaultValue != 'undefined' ? param.defaultValue : null;
    var valOrDefaultArray = valOrDefault ? valOrDefault : []; // can remain single, if null treated as empty array
    var arrayParam = param.type && param.type.indexOf('[]') > -1 && Array.isArray(valOrDefaultArray);

    if (param.dynamic) {
      if (arrayParam) var func = (ctx2, data2) => flattenArray(valOrDefaultArray.map((prof, i) => ctx.extendVars(ctx2, data2).runInner(prof, param, path + '~' + i)));else var func = (ctx2, data2) => valOrDefault != null ? ctx.extendVars(ctx2, data2).runInner(valOrDefault, param, path) : valOrDefault;

      Object.defineProperty(func, "name", { value: p }); // for debug
      func.profile = typeof val != "undefined" ? val : typeof param.defaultValue != 'undefined' ? param.defaultValue : null;
      func.srcPath = ctx.path;
      return { name: p, type: 'function', func: func };
    }

    if (arrayParam) // array of profiles
      return { name: p, type: 'array', array: valOrDefaultArray, param: {} };else return { name: p, type: 'run', context: new jbCtx(ctx, { profile: valOrDefault, path: p }), param: param };
  });
}

function prepare(context, parentParam) {
  var profile = context.profile;
  var profile_jstype = typeof profile;
  var parentParam_type = parentParam && parentParam.type;
  var jstype = parentParam && parentParam.as;
  var isArray = Array.isArray(profile);

  if (profile_jstype === 'string' && parentParam_type === 'boolean') return { type: 'booleanExp' };
  if (profile_jstype === 'boolean' || profile_jstype === 'number' || parentParam_type == 'asIs') return { type: 'asIs' }; // native primitives
  if (profile_jstype === 'object' && jstype === 'object') return { type: 'object' };
  if (profile_jstype === 'string') return { type: 'expression' };
  if (profile_jstype === 'function') return { type: 'function' };
  if (profile_jstype === 'object' && !isArray && entries(profile).filter(p => p[0].indexOf('$') == 0).length == 0) return { type: 'asIs' };
  if (profile_jstype === 'object' && profile instanceof RegExp) return { type: 'asIs' };
  if (profile == null) return { type: 'asIs' };

  if (isArray) {
    if (!profile.length) return { type: 'null' };
    if (!parentParam || !parentParam.type || parentParam.type === 'data') //  as default for array
      return { type: 'list' };
    if (parentParam_type === 'action' || parentParam_type === 'action[]' && profile.isArray) {
      profile.sugar = true;
      return { type: 'runActions' };
    }
  } else if (profile.$if) return {
    type: 'if',
    ifContext: new jbCtx(context, { profile: profile.$if, path: '$if' }),
    IfParentParam: { type: 'boolean', as: 'boolean' },
    thenContext: new jbCtx(context, { profile: profile.then || 0, path: '~then' }),
    thenParentParam: { type: parentParam_type, as: jstype },
    elseContext: new jbCtx(context, { profile: profile['else'] || 0, path: '~else' }),
    elseParentParam: { type: parentParam_type, as: jstype }
  };
  var comp_name = compName(profile);
  if (!comp_name) return { type: 'ignore' };
  var comp = jbart.comps[comp_name];
  if (!comp && comp_name) {
    logError('component ' + comp_name + ' is not defined');return { type: 'null' };
  }
  if (!comp.impl) {
    logError('component ' + comp_name + ' has no implementation');return { type: 'null' };
  }

  var ctx = new jbCtx(context, {});
  ctx.parentParam = parentParam;
  ctx.params = {}; // TODO: try to delete this line
  var preparedParams = prepareParams(comp, profile, ctx);
  if (typeof comp.impl === 'function') {
    Object.defineProperty(comp.impl, "name", { value: comp_name }); // comp_name.replace(/[^a-zA-Z0-9]/g,'_')
    return { type: 'profile', impl: comp.impl, ctx: ctx, preparedParams: preparedParams };
  } else return { type: 'profile', ctx: new jbCtx(ctx, { profile: comp.impl, comp: comp_name, path: '' }), preparedParams: preparedParams };
}

function resolveFinishedPromise(val) {
  if (!val) return val;
  if (val.$jb_parent) val.$jb_parent = resolveFinishedPromise(val.$jb_parent);
  if (val && typeof val == 'object' && val._state == 1) // finished promise
    return val._result;
  return val;
}

function calcVar(context, varname) {
  var res;
  if (context.componentContext && typeof context.componentContext.params[varname] != 'undefined') res = context.componentContext.params[varname];else if (context.vars[varname] != null) res = context.vars[varname];else if (context.vars.scope && context.vars.scope[varname] != null) res = context.vars.scope[varname];else if (context.resources && context.resources[varname] != null) res = context.resources[varname];
  return resolveFinishedPromise(res);
}

function expression(expression, context, parentParam) {
  var jstype = parentParam && parentParam.as;
  expression = '' + expression;
  if (jstype == 'boolean') return bool_expression(expression, context);
  if (expression.indexOf('$debugger:') == 0) {
    debugger;
    expression = expression.split('$debugger:')[1];
  }
  if (expression.indexOf('$log:') == 0) {
    var out = expression(expression.split('$log:')[1], context, parentParam);
    jbart.comps.log.impl(context, out);
    return out;
  }
  if (expression.indexOf('%') == -1 && expression.indexOf('{') == -1) return expression;
  // if (context && !context.ngMode)
  //   expression = expression.replace(/{{/g,'{%').replace(/}}/g,'%}')
  if (expression == '{%%}' || expression == '%%') return expPart('', context, jstype);

  if (expression.lastIndexOf('{%') == 0 && expression.indexOf('%}') == expression.length - 2) // just one expression filling all string
    return expPart(expression.substring(2, expression.length - 2), context, jstype);

  expression = expression.replace(/{%(.*?)%}/g, function (match, contents) {
    return tostring(expPart(contents, context, 'string'));
  });
  expression = expression.replace(/{\?(.*?)\?}/g, function (match, contents) {
    return tostring(conditionalExp(contents));
  });
  if (expression.match(/^%[^%;{}\s><"']*%$/)) // must be after the {% replacer
    return expPart(expression.substring(1, expression.length - 1), context, jstype);

  expression = expression.replace(/%([^%;{}\s><"']*)%/g, function (match, contents) {
    return tostring(expPart(contents, context, 'string'));
  });

  function conditionalExp(expression) {
    // check variable value - if not empty return all expression, otherwise empty
    var match = expression.match(/%([^%;{}\s><"']*)%/);
    if (match && tostring(expPart(match[1], context, 'string'))) return expression(expression, context, { as: 'string' });else return '';
  }

  function expPart(expressionPart, context, jstype) {
    return resolveFinishedPromise(evalExpressionPart(expressionPart, context, jstype));
  }

  return expression;
}

function evalExpressionPart(expressionPart, context, jstype) {
  if (!jbart.jstypes) initJstypes();

  // example: {{$person.name}}.     
  if (expressionPart == ".") expressionPart = "";

  // empty primitive expression
  if (!expressionPart && (jstype == 'string' || jstype == 'boolean' || jstype == 'number')) return jbart.jstypes[jstype](context.data);

  if (expressionPart.indexOf('=') == 0) {
    // function
    var parsed = expressionPart.match(/=([a-zA-Z]*)\(?([^)]*)\)?/);
    var funcName = parsed && parsed[1];
    if (funcName && jbart.functions[funcName]) return tojstype(jbart.functions[funcName](context, parsed[2]), jstype, context);
  }

  var parts = expressionPart.split(/[.\/]/);
  var item = context.data;

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i],
        index,
        match;
    if ((match = part.match(/(.*)\[([0-9]+)\]/)) != null) {
      // x[y]
      part = match[1];
      index = Number(match[2]);
    }
    if (part == '') ;else if (part == '$parent' && item.$jb_parent && i > 0) item = item.$jb_parent;else if (part.charAt(0) == '$' && i == 0 && part.length > 1) item = calcVar(context, part.substr(1));else if (Array.isArray(item)) item = map(item, function (inner) {
      return typeof inner === "object" ? objectProperty(inner, part, jstype, i == parts.length - 1) : inner;
    });else if (typeof item === 'object' && typeof item[part] === 'function' && item[part].profile) item = item[part](context);else if (typeof item === 'object') item = item && objectProperty(item, part, jstype, i == parts.length - 1);else if (index && Array.isArray(item)) item = item[index];else item = null; // no match
    if (!item) return item; // 0 should return 0
  }
  return item;
}

function bool_expression(expression, context) {
  if (expression.indexOf('$debugger:') == 0) {
    debugger;
    expression = expression.split('$debugger:')[1];
  }
  if (expression.indexOf('$log:') == 0) {
    var calculated = expression(expression.split('$log:')[1], context, { as: 'string' });
    var result = bool_expression(expression.split('$log:')[1], context);
    jbart.comps.log.impl(context, calculated + ':' + result);
    return result;
  }
  if (expression.indexOf('!') == 0) return !bool_expression(expression.substring(1), context);
  var parts = expression.match(/(.+)(==|!=|<|>|>=|<=|\^=|\$=)(.+)/);
  if (!parts) {
    var asString = expression(expression, context, { as: 'string' });
    return !!asString && asString != 'false';
  }
  if (parts.length != 4) return logError('invalid boolean expression: ' + expression);
  var op = parts[2].trim();

  if (op == '==' || op == '!=' || op == '$=' || op == '^=') {
    var p1 = tostring(expression(trim(parts[1]), context, { as: 'string' }));
    var p2 = tostring(expression(trim(parts[3]), context, { as: 'string' }));
    // var p1 = expression(trim(parts[1]), context, {as: 'string'});
    // var p2 = expression(trim(parts[3]), context, {as: 'string'});
    p2 = (p2.match(/^["'](.*)["']/) || [, p2])[1]; // remove quotes
    if (op == '==') return p1 == p2;
    if (op == '!=') return p1 != p2;
    if (op == '^=') return p1.lastIndexOf(p2, 0) == 0; // more effecient
    if (op == '$=') return p1.indexOf(p2, p1.length - p2.length) !== -1;
  }

  var p1 = tojstype(expression(parts[1].trim(), context), { as: 'number' });
  var p2 = tojstype(expression(parts[3].trim(), context), { as: 'number' });

  if (op == '>') return p1 > p2;
  if (op == '<') return p1 < p2;
  if (op == '>=') return p1 >= p2;
  if (op == '<=') return p1 <= p2;

  function trim(str) {
    // trims also " and '
    return str.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }
}

function tojstype(value, jstype, context) {
  if (!jstype) return value;
  if (!jbart.jstypes) initJstypes();
  if (typeof jbart.jstypes[jstype] != 'function') debugger;
  return jbart.jstypes[jstype](value, context);
}

function tostring(value) {
  return tojstype(value, 'string');
}
function toarray(value) {
  return tojstype(value, 'array');
}
function toboolean(value) {
  return tojstype(value, 'boolean');
}
function tosingle(value) {
  return tojstype(value, 'single');
}
function tonumber(value) {
  return tojstype(value, 'number');
}

function initJstypes() {
  jbart.jstypes = {
    'asIs': x => x,
    'object': x => x,
    'string': function (value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null) return '';
      value = val(value, true);
      if (typeof value == 'undefined') return '';
      return '' + value;
    },
    'number': function (value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null || value == undefined) return null; // 0 is not null
      value = val(value);
      var num = Number(value, true);
      return isNaN(num) ? null : num;
    },
    'array': function (value) {
      if (typeof value == 'function' && value.profile) value = value();
      if (Array.isArray(value)) return value;
      if (value == null) return [];
      return [value];
    },
    'boolean': function (value) {
      if (Array.isArray(value)) value = value[0];
      return val(value, true) ? true : false;
    },
    'single': function (value) {
      if (Array.isArray(value)) return value[0];
      if (!value) return value;
      value = val(value, true);
      return value;
    },
    'ref': function (value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null) return value;
      if (value && (value.$jb_parent || value.$jb_val)) return value;
      return { $jb_val: () => value };
    }
  };
}

function profileType(profile) {
  if (!profile) return '';
  if (typeof profile == 'string') return 'data';
  var comp_name = compName(profile);
  return jbart.comps[comp_name] && jbart.comps[comp_name].type || '';
}

function sugarProp(profile) {
  return entries(profile).filter(p => p[0].indexOf('$') == 0 && p[0].length > 1).filter(p => ['$vars', '$debugger', '$log'].indexOf(p[0]) == -1)[0];
}

function compName(profile) {
  if (!profile) return;
  if (profile.$) return profile.$;
  var f = sugarProp(profile);
  return f && f[0].slice(1);
}

// give a name to the impl function. Used for tgp debugging
function assignNameToFunc(name, fn) {
  Object.defineProperty(fn, "name", { value: name });
  return fn;
}

function compDef(compName, component) {
  jbart.comps[compName] = component;
  if (jbart.currentFileName) path(jbart, ['studio', 'componentFiles', compName], jbart.currentFileName);
  return function (options) {
    if (typeof options == 'string') {
      var out = {};
      out['$' + compName] = options;
      return out;
    } else if (typeof options == 'object') {
      options.$ = compName;
      return options;
    } else return { $: compName };
  };
}

function component(compName, component) {
  compDef(compName, component);
}

function typeDef(typeName, typeObj) {
  path(jbart, ['types', typeName], typeObj || {});
}

function functionDef(funcName, func) {
  path(jbart, ['functions', funcName], func);
}

function resourceDef(widgetName, name, resource) {
  path(jbart_widgets, [widgetName, 'resources', name], resource);

  if (jbart.currentFileName) path(jbart, ['studio', 'componentFiles', widgetName + '-' + name], jbart.currentFileName);
}

var jbart = { ctxCounter: 0, ctxDictionary: {}, comps: {}, resources: {}, tests: {}, styles: {} };
if (typeof window != 'undefined') window.jbart = jbart; // for the studio and debug

class jbCtx {
  constructor(context, ctx2) {
    this.id = jbart.ctxCounter++;
    this._parent = context;
    if (typeof context == 'undefined') {
      this.vars = {};
      this.params = {};
      this.resources = {};
    } else {
      if (ctx2.profile && ctx2.path == null) {
        debugger;
        ctx2.path = '?';
      }
      this.profile = typeof ctx2.profile != 'undefined' ? ctx2.profile : context.profile;

      this.path = (context.path || '') + (ctx2.path ? '~' + ctx2.path : '');
      if (ctx2.comp) this.path = ctx2.comp;
      this.data = typeof ctx2.data != 'undefined' ? ctx2.data : context.data; // allow setting of data:null
      this.vars = ctx2.vars ? extend({}, context.vars, ctx2.vars) : context.vars;
      this.params = ctx2.params || context.params;
      this.resources = context.resources;
      this.componentContext = typeof ctx2.componentContext != 'undefined' ? ctx2.componentContext : context.componentContext;
      this.probe = context.probe;
    }
  }
  run(profile, parentParam) {
    return jb_run(new jbCtx(this, { profile: profile, comp: profile.$, path: '' }), parentParam);
  }
  exp(expression, jstype) {
    return expression(expression, this, { as: jstype });
  }
  setVars(vars) {
    return new jbCtx(this, { vars: vars });
  }
  setData(data) {
    return new jbCtx(this, { data: data });
  }
  runInner(profile, parentParam, path) {
    return jb_run(new jbCtx(this, { profile: profile, path: path }), parentParam);
  }
  bool(profile) {
    return this.run(profile, { as: 'boolean' });
  }
  // keeps the context vm and not the caller vm - needed in studio probe
  ctx(ctx2) {
    return new jbCtx(this, ctx2);
  }
  win() {
    // used for multi windows apps. e.g., studio
    return window;
  }
  extendVars(ctx2, data2) {
    if (ctx2 == null && data2 == null) return this;
    return new jbCtx(this, { vars: ctx2 ? ctx2.vars : null, data: data2 == null ? ctx2.data : data2 });
  }
  runItself(parentParam, settings) {
    return jb_run(this, parentParam, settings);
  }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = jbCtx;


// export function ctx(context,ctx2) {
//   return new jbCtx(context,ctx2);
// }

function logError(errorStr, errorObj, ctx) {
  jbart.logs = jbart.logs || {};
  jbart.logs.error = jbart.logs.error || [];
  jbart.logs.error.push(errorStr);
  console.error(errorStr, errorObj, ctx);
}

function logPerformance(type, text) {
  var types = ['focus', 'apply', 'check', 'suggestions'];
  if (type != 'focus') return; // filter. TBD take from somewhere else
  console.log(type, text == null ? '' : text);
}

function logException(e, errorStr) {
  logError('exception: ' + errorStr + "\n" + (e.stack || ''));
}

// functions
function extend(obj, obj1, obj2, obj3) {
  if (!obj) return;
  Object.getOwnPropertyNames(obj1 || {}).forEach(function (p) {
    obj[p] = obj1[p];
  });
  Object.getOwnPropertyNames(obj2 || {}).forEach(function (p) {
    obj[p] = obj2[p];
  });
  Object.getOwnPropertyNames(obj3 || {}).forEach(function (p) {
    obj[p] = obj3[p];
  });

  return obj;
}

// force path - create objects in the path if not exist
function path(object, path, value) {
  var cur = object;

  if (typeof value == 'undefined') {
    // get
    for (var i = 0; i < path.length; i++) {
      cur = cur[path[i]];
      if (cur == null || typeof cur == 'undefined') return null;
    }
    return cur;
  } else {
    // set
    for (var i = 0; i < path.length; i++) if (i == path.length - 1) cur[path[i]] = value;else cur = cur[path[i]] = cur[path[i]] || {};
    return value;
  }
}

// Object.getOwnPropertyNames does not keep the order !!!
function ownPropertyNames(obj) {
  var res = [];
  for (var i in obj || {}) if (obj.hasOwnProperty(i)) res.push(i);
  return res;
}

function obj(k, v, base) {
  var ret = base || {};
  ret[k] = v;
  return ret;
}

function compareArrays(arr1, arr2) {
  if (arr1 == arr2) return true;
  if (!Array.isArray(arr1) && !Array.isArray(arr2)) return arr1 == arr2;
  if (!arr1 || !arr2 || arr1.length != arr2.length) return false;
  for (var i = 0; i < arr1.length; i++) {
    var key1 = (arr1[i] || {}).key,
        key2 = (arr2[i] || {}).key;
    if (key1 && key2 && key1 == key2 && arr1[i].val == arr2[i].val) continue;
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

function range(start, count) {
  return Array.apply(0, Array(count)).map((element, index) => index + start);
}

function entries(obj) {
  if (!obj || typeof obj != 'object') return [];
  var ret = [];
  for (var i in obj) // do not change. tend to keep definition order !!!!
  if (obj.hasOwnProperty(i)) ret.push([i, obj[i]]);
  return ret;
}

function flattenArray(items) {
  var out = [];
  items.filter(i => i).forEach(function (item) {
    if (Array.isArray(item)) out = out.concat(item);else out.push(item);
  });
  return out;
}

function synchArray(ar) {
  var isSynch = ar.filter(v => v && (typeof v.then == 'function' || typeof v.subscribe == 'function')).length == 0;
  if (isSynch) return ar;

  var _ar = ar.filter(x => x).map(v => typeof v.then == 'function' || typeof v.subscribe == 'function' ? v : [v]);

  return Observable.from(_ar).concatMap(x => x).flatMap(v => Array.isArray(v) ? v : [v]).toArray().toPromise();
}

function isProfOfType(prof, type) {
  var types = ((jbart.comps[compName(prof)] || {}).type || '').split('[]')[0].split(',');
  return types.indexOf(type) != -1;
}

// usage: .filter( unique(x=>x.id) )
// simple case: [1,2,3,3].filter((x,index,self)=>self.indexOf(x) === index)
// n**2 cost !!!! use only for small arrays
function unique(mapFunc) {
  function onlyUnique(value, index, self) {
    return self.map(mapFunc).indexOf(mapFunc(value)) === index;
  }
  return onlyUnique;
}

function equals(x, y) {
  return x == y || val(x) == val(y);
}

function writeValue(to, val) {
  if (!to) return;
  if (to.$jb_val) return to.$jb_val(val(val));
  if (to.$jb_parent) to.$jb_parent[to.$jb_property] = val(val);
}

function isRef(value) {
  return value && (value.$jb_parent || value.$jb_val);
}

function objectProperty(_object, property, jstype, lastInExpression) {
  var object = val(_object);
  if (!object) return null;
  if (typeof object[property] == 'undefined') object[property] = lastInExpression ? null : {};
  if (lastInExpression) {
    if (jstype == 'string' || jstype == 'boolean' || jstype == 'number') return jbart.jstypes[jstype](object[property]); // no need for valueByRef
    if (jstype == 'ref') {
      if (isRef(object[property])) return object[property];else return { $jb_parent: object, $jb_property: property };
    }
  }
  return object[property];
}

function val(val) {
  if (val == null) return val;
  if (val.$jb_val) return val.$jb_val();
  // if (applyFunction && typeof val == 'function' && val.profile)
  //   return val();
  return val.$jb_parent ? val.$jb_parent[val.$jb_property] : val;
}

function delay(mSec) {
  return new Promise(r => {
    setTimeout(r, mSec);
  });
}

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__) {

"use strict";
throw new Error("Module build failed: Error: ENOENT: no such file or directory, open 'c:\\jb-react\\src\\ui\\jb-react.js'\n    at Error (native)");

/***/ })
/******/ ]);