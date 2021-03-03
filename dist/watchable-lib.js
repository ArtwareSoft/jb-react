if (typeof jbmFactory == 'undefined') jbmFactory = {};
jbmFactory['watchable'] = function(jb) {
  jb.importAllMacros && eval(jb.importAllMacros());
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/ui/pack-immutable.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/immutability-helper/index.js":
/*!***************************************************!*\
  !*** ./node_modules/immutability-helper/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var invariant = __webpack_require__(/*! invariant */ \"./node_modules/invariant/browser.js\");\n\nvar hasOwnProperty = Object.prototype.hasOwnProperty;\nvar splice = Array.prototype.splice;\n\nvar toString = Object.prototype.toString\nvar type = function(obj) {\n  return toString.call(obj).slice(8, -1);\n}\n\nvar assign = Object.assign || /* istanbul ignore next */ function assign(target, source) {\n  getAllKeys(source).forEach(function(key) {\n    if (hasOwnProperty.call(source, key)) {\n      target[key] = source[key];\n    }\n  });\n  return target;\n};\n\nvar getAllKeys = typeof Object.getOwnPropertySymbols === 'function' ?\n  function(obj) { return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj)) } :\n  /* istanbul ignore next */ function(obj) { return Object.keys(obj) };\n\n/* istanbul ignore next */\nfunction copy(object) {\n  if (Array.isArray(object)) {\n    return assign(object.constructor(object.length), object)\n  } else if (type(object) === 'Map') {\n    return new Map(object)\n  } else if (type(object) === 'Set') {\n    return new Set(object)\n  } else if (object && typeof object === 'object') {\n    var prototype = Object.getPrototypeOf(object);\n    return assign(Object.create(prototype), object);\n  } else {\n    return object;\n  }\n}\n\nfunction newContext() {\n  var commands = assign({}, defaultCommands);\n  update.extend = function(directive, fn) {\n    commands[directive] = fn;\n  };\n  update.isEquals = function(a, b) { return a === b; };\n\n  return update;\n\n  function update(object, spec) {\n    if (typeof spec === 'function') {\n      spec = { $apply: spec };\n    }\n\n    if (!(Array.isArray(object) && Array.isArray(spec))) {\n      invariant(\n        !Array.isArray(spec),\n        'update(): You provided an invalid spec to update(). The spec may ' +\n        'not contain an array except as the value of $set, $push, $unshift, ' +\n        '$splice or any custom command allowing an array value.'\n      );\n    }\n\n    invariant(\n      typeof spec === 'object' && spec !== null,\n      'update(): You provided an invalid spec to update(). The spec and ' +\n      'every included key path must be plain objects containing one of the ' +\n      'following commands: %s.',\n      Object.keys(commands).join(', ')\n    );\n\n    var nextObject = object;\n    var index, key;\n    getAllKeys(spec).forEach(function(key) {\n      if (hasOwnProperty.call(commands, key)) {\n        var objectWasNextObject = object === nextObject;\n        nextObject = commands[key](spec[key], nextObject, spec, object);\n        if (objectWasNextObject && update.isEquals(nextObject, object)) {\n          nextObject = object;\n        }\n      } else {\n        var nextValueForKey =\n          type(object) === 'Map'\n            ? update(object.get(key), spec[key])\n            : update(object[key], spec[key]);\n        var nextObjectValue =\n          type(nextObject) === 'Map'\n              ? nextObject.get(key)\n              : nextObject[key];\n        if (!update.isEquals(nextValueForKey, nextObjectValue) || typeof nextValueForKey === 'undefined' && !hasOwnProperty.call(object, key)) {\n          if (nextObject === object) {\n            nextObject = copy(object);\n          }\n          if (type(nextObject) === 'Map') {\n            nextObject.set(key, nextValueForKey);\n          } else {\n            nextObject[key] = nextValueForKey;\n          }\n        }\n      }\n    })\n    return nextObject;\n  }\n\n}\n\nvar defaultCommands = {\n  $push: function(value, nextObject, spec) {\n    invariantPushAndUnshift(nextObject, spec, '$push');\n    return value.length ? nextObject.concat(value) : nextObject;\n  },\n  $unshift: function(value, nextObject, spec) {\n    invariantPushAndUnshift(nextObject, spec, '$unshift');\n    return value.length ? value.concat(nextObject) : nextObject;\n  },\n  $splice: function(value, nextObject, spec, originalObject) {\n    invariantSplices(nextObject, spec);\n    value.forEach(function(args) {\n      invariantSplice(args);\n      if (nextObject === originalObject && args.length) nextObject = copy(originalObject);\n      splice.apply(nextObject, args);\n    });\n    return nextObject;\n  },\n  $set: function(value, nextObject, spec) {\n    invariantSet(spec);\n    return value;\n  },\n  $toggle: function(targets, nextObject) {\n    invariantSpecArray(targets, '$toggle');\n    var nextObjectCopy = targets.length ? copy(nextObject) : nextObject;\n\n    targets.forEach(function(target) {\n      nextObjectCopy[target] = !nextObject[target];\n    });\n\n    return nextObjectCopy;\n  },\n  $unset: function(value, nextObject, spec, originalObject) {\n    invariantSpecArray(value, '$unset');\n    value.forEach(function(key) {\n      if (Object.hasOwnProperty.call(nextObject, key)) {\n        if (nextObject === originalObject) nextObject = copy(originalObject);\n        delete nextObject[key];\n      }\n    });\n    return nextObject;\n  },\n  $add: function(value, nextObject, spec, originalObject) {\n    invariantMapOrSet(nextObject, '$add');\n    invariantSpecArray(value, '$add');\n    if (type(nextObject) === 'Map') {\n      value.forEach(function(pair) {\n        var key = pair[0];\n        var value = pair[1];\n        if (nextObject === originalObject && nextObject.get(key) !== value) nextObject = copy(originalObject);\n        nextObject.set(key, value);\n      });\n    } else {\n      value.forEach(function(value) {\n        if (nextObject === originalObject && !nextObject.has(value)) nextObject = copy(originalObject);\n        nextObject.add(value);\n      });\n    }\n    return nextObject;\n  },\n  $remove: function(value, nextObject, spec, originalObject) {\n    invariantMapOrSet(nextObject, '$remove');\n    invariantSpecArray(value, '$remove');\n    value.forEach(function(key) {\n      if (nextObject === originalObject && nextObject.has(key)) nextObject = copy(originalObject);\n      nextObject.delete(key);\n    });\n    return nextObject;\n  },\n  $merge: function(value, nextObject, spec, originalObject) {\n    invariantMerge(nextObject, value);\n    getAllKeys(value).forEach(function(key) {\n      if (value[key] !== nextObject[key]) {\n        if (nextObject === originalObject) nextObject = copy(originalObject);\n        nextObject[key] = value[key];\n      }\n    });\n    return nextObject;\n  },\n  $apply: function(value, original) {\n    invariantApply(value);\n    return value(original);\n  }\n};\n\nvar contextForExport = newContext();\n\nmodule.exports = contextForExport;\nmodule.exports.default = contextForExport;\nmodule.exports.newContext = newContext;\n\n// invariants\n\nfunction invariantPushAndUnshift(value, spec, command) {\n  invariant(\n    Array.isArray(value),\n    'update(): expected target of %s to be an array; got %s.',\n    command,\n    value\n  );\n  invariantSpecArray(spec[command], command)\n}\n\nfunction invariantSpecArray(spec, command) {\n  invariant(\n    Array.isArray(spec),\n    'update(): expected spec of %s to be an array; got %s. ' +\n    'Did you forget to wrap your parameter in an array?',\n    command,\n    spec\n  );\n}\n\nfunction invariantSplices(value, spec) {\n  invariant(\n    Array.isArray(value),\n    'Expected $splice target to be an array; got %s',\n    value\n  );\n  invariantSplice(spec['$splice']);\n}\n\nfunction invariantSplice(value) {\n  invariant(\n    Array.isArray(value),\n    'update(): expected spec of $splice to be an array of arrays; got %s. ' +\n    'Did you forget to wrap your parameters in an array?',\n    value\n  );\n}\n\nfunction invariantApply(fn) {\n  invariant(\n    typeof fn === 'function',\n    'update(): expected spec of $apply to be a function; got %s.',\n    fn\n  );\n}\n\nfunction invariantSet(spec) {\n  invariant(\n    Object.keys(spec).length === 1,\n    'Cannot have more than one key in an object with $set'\n  );\n}\n\nfunction invariantMerge(target, specValue) {\n  invariant(\n    specValue && typeof specValue === 'object',\n    'update(): $merge expects a spec of type \\'object\\'; got %s',\n    specValue\n  );\n  invariant(\n    target && typeof target === 'object',\n    'update(): $merge expects a target of type \\'object\\'; got %s',\n    target\n  );\n}\n\nfunction invariantMapOrSet(target, command) {\n  var typeOfTarget = type(target);\n  invariant(\n    typeOfTarget === 'Map' || typeOfTarget === 'Set',\n    'update(): %s expects a target of type Set or Map; got %s',\n    command,\n    typeOfTarget\n  );\n}\n\n\n//# sourceURL=webpack:///./node_modules/immutability-helper/index.js?");

/***/ }),

/***/ "./node_modules/invariant/browser.js":
/*!*******************************************!*\
  !*** ./node_modules/invariant/browser.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/**\n * Copyright (c) 2013-present, Facebook, Inc.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\n\n\n/**\n * Use invariant() to assert state which your program assumes to be true.\n *\n * Provide sprintf-style format (only %s is supported) and arguments\n * to provide information about what broke and what you were\n * expecting.\n *\n * The invariant message will be stripped in production, but the invariant\n * will remain to ensure logic does not differ in production.\n */\n\nvar invariant = function(condition, format, a, b, c, d, e, f) {\n  if (true) {\n    if (format === undefined) {\n      throw new Error('invariant requires an error message argument');\n    }\n  }\n\n  if (!condition) {\n    var error;\n    if (format === undefined) {\n      error = new Error(\n        'Minified exception occurred; use the non-minified dev environment ' +\n        'for the full error message and additional helpful warnings.'\n      );\n    } else {\n      var args = [a, b, c, d, e, f];\n      var argIndex = 0;\n      error = new Error(\n        format.replace(/%s/g, function() { return args[argIndex++]; })\n      );\n      error.name = 'Invariant Violation';\n    }\n\n    error.framesToPop = 1; // we don't care about invariant's own frame\n    throw error;\n  }\n};\n\nmodule.exports = invariant;\n\n\n//# sourceURL=webpack:///./node_modules/invariant/browser.js?");

/***/ }),

/***/ "./src/ui/pack-immutable.js":
/*!**********************************!*\
  !*** ./src/ui/pack-immutable.js ***!
  \**********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var immutability_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! immutability-helper */ \"./node_modules/immutability-helper/index.js\");\n/* harmony import */ var immutability_helper__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(immutability_helper__WEBPACK_IMPORTED_MODULE_0__);\n\r\njb.immutableUpdate = immutability_helper__WEBPACK_IMPORTED_MODULE_0___default.a;\r\n\n\n//# sourceURL=webpack:///./src/ui/pack-immutable.js?");

/***/ })

/******/ });;

// const sampleRef = {
//     $jb_obj: {}, // real object (or parent) val - may exist only in older version of the resource. may contain $jb_id for tracking
//     $jb_childProp: 'title', // used for primitive props
// }

jb.initLibs('db', {
  isProxy: Symbol.for("isProxy"), originalVal: Symbol.for("originalVal"), targetVal: Symbol.for("targetVal"), jbId: Symbol("jbId"),

  WatchableValueByRef: class WatchableValueByRef {
    constructor(resources) {
      this.resources = resources
      this.objToPath = new Map()
      this.idCounter = 1
      this.opCounter = 1
      this.allowedTypes = [Object.getPrototypeOf({}),Object.getPrototypeOf([])]
      this.resourceChange = jb.callbag.subject()
      this.observables = []
      this.primitiveArraysDeltas = {}

      const resourcesObj = resources()
      resourcesObj[jb.db.jbId] = this.idCounter++
      this.objToPath.set(resourcesObj[jb.db.jbId],[])
      this.propagateResourceChangeToObservables()
    }
    doOp(ref,opOnRef,srcCtx) {
      try {
        const opVal = opOnRef.$merge || opOnRef.$push || opOnRef.$splice || opOnRef.$set
        if (!this.isRef(ref))
          ref = this.asRef(ref);

        const path = this.removeLinksFromPath(this.pathOfRef(ref)), op = {}, oldVal = this.valOfPath(path);
        if (!path || ref.$jb_val) return;
        if (opOnRef.$set !== undefined && opOnRef.$set === oldVal) return;
        if (opOnRef.$push) opOnRef.$push = jb.asArray(opOnRef.$push)
        this.addJbId(path) // hash ancestors with jbId because the objects will be re-generated by redux
        jb.path(op,path,opOnRef) // create op as nested object
        const insertedIndex = jb.path(opOnRef.$splice,[0,2]) && jb.path(opOnRef.$splice,[0,0]) || opOnRef.$push && opVal.length
        const insertedPath = insertedIndex != null && path.concat(insertedIndex)
        const opEvent = {op: opOnRef, path, insertedPath, ref, srcCtx, oldVal, opVal, timeStamp: new Date().getTime(), opCounter: this.opCounter++}
        this.resources(jb.immutableUpdate(this.resources(),op),opEvent)
        const newVal = (opVal != null && opVal[jb.db.isProxy]) ? opVal : this.valOfPath(path);
        if (opOnRef.$push) {
          opOnRef.$push.forEach((toAdd,i)=>
            this.addObjToMap(toAdd,[...path,oldVal.length+i]))
          newVal[jb.db.jbId] = oldVal[jb.db.jbId]
          //opEvent.path.push(oldVal.length)
          opEvent.ref = this.refOfPath(opEvent.path)
        } else if (opOnRef.$set === null && typeof oldVal === 'object') { // delete object should return the path that was deleted
          this.removeObjFromMap(oldVal)
          this.addObjToMap(newVal,path)
          opEvent.ref.$jb_path = () => path
        } else if (opOnRef.$splice) {
          opOnRef.$splice.forEach(ar=> {
            this.fixSplicedPaths(path,ar)
            oldVal.slice(ar[0],ar[0]+ar[1]).forEach(toRemove=>this.removeObjFromMap(toRemove))
            jb.asArray(ar[2]).forEach(toAdd=>this.addObjToMap(toAdd,path.concat(newVal.indexOf(toAdd))))
          })
        } else {
            this.removeObjFromMap(oldVal)
            this.addObjToMap(newVal,path)
        }
        if (opOnRef.$splice) {
          this.primitiveArraysDeltas[ref.$jb_obj[jb.db.jbId]] = this.primitiveArraysDeltas[ref.$jb_obj[jb.db.jbId]] || []
          this.primitiveArraysDeltas[ref.$jb_obj[jb.db.jbId]].push(opOnRef.$splice)
        }
        opEvent.newVal = newVal;
        jb.log('watchable notify doOp',{opEvent,ref,opOnRef,srcCtx})
        if (this.transactionEventsLog)
          this.transactionEventsLog.push(opEvent)
        else
          this.resourceChange.next(opEvent)
        return opEvent
      } catch(e) {
        jb.logException(e,'doOp',{srcCtx,ref,opOnRef,srcCtx})
      }
    }
    resourceReferred(resName) {
      const resource = this.resources()[resName]
      if (!this.objToPath.has(resource))
        this.addObjToMap(resource,[resName])
    }
    addJbId(path) {
      for(let i=0;i<path.length;i++) {
        const innerPath = path.slice(0,i+1)
        const val = this.valOfPath(innerPath,true)
        if (val && typeof val === 'object' && !val[jb.db.jbId]) {
            val[jb.db.jbId] = this.idCounter++
            this.addObjToMap(val,innerPath)
        }
      }
    }
    addObjToMap(top,path) {
      if (!top || top[jb.db.isProxy] || top[jb.db.passiveSym] || top.$jb_val || typeof top !== 'object' || this.allowedTypes.indexOf(Object.getPrototypeOf(top)) == -1) return
      if (top[jb.db.jbId]) {
          this.objToPath.set(top[jb.db.jbId],path)
          this.objToPath.delete(top)
      } else {
          this.objToPath.set(top,path)
      }
      Object.keys(top).filter(key=>typeof top[key] === 'object' && key.indexOf('$jb_') != 0)
          .forEach(key => this.addObjToMap(top[key],[...path,key]))
    }
    removeObjFromMap(top,isInner) {
      if (!top || typeof top !== 'object' || this.allowedTypes.indexOf(Object.getPrototypeOf(top)) == -1) return
      this.objToPath.delete(top)
      if (top[jb.db.jbId] && isInner)
          this.objToPath.delete(top[jb.db.jbId])
      Object.keys(top).filter(key=>typeof top[key] === 'object' && key.indexOf('$jb_') != 0).forEach(key => this.removeObjFromMap(top[key],true))
    }
    fixSplicedPaths(path,spliceOp) {
      const propDepth = path.length
      Array.from(this.objToPath.keys())
        .filter(k=>startsWithPath(this.objToPath.get(k)))
  //      .filter(k=>! spliceOp.reduce((res,ar) => res || jb.asArray(ar[2]).indexOf(k) != -1, false)) // do not touch the moved elem itslef
        .forEach(k=>{
          const newPath = this.objToPath.get(k)
          newPath[propDepth] = fixIndexProp(+newPath[propDepth])
          if (newPath[propDepth] >= 0)
            this.objToPath.set(k,newPath)
        })

      function startsWithPath(toCompare) {
        if (toCompare.length <= propDepth) return
        for(let i=0;i<propDepth;i++)
          if (toCompare[i] != path[i]) return
        return true
      }
      function fixIndexProp(oldIndex) {
        return oldIndex + (oldIndex < spliceOp[0] ? 0 : jb.asArray(spliceOp[2]).length - spliceOp[1])
        //return oldIndex + spliceOp.reduce((delta,ar) => delta + (oldIndex < ar[0]) ? 0 : jb.asArray(ar[2]).length - ar[1],0)
      }
    }
    pathOfRef(ref) {
      if (ref.$jb_path)
        return ref.$jb_path()
      const path = this.isRef(ref) && (this.objToPath.get(ref.$jb_obj) || this.objToPath.get(ref.$jb_obj[jb.db.jbId]))
      if (path && ref.$jb_childProp !== undefined) {
          this.refreshPrimitiveArrayRef(ref)
          return [...path, ref.$jb_childProp]
      }
      return path
    }
    urlOfRef(ref) {
      const path = this.pathOfRef(ref)
      this.addJbId(path)
      const byId = [ref.$jb_obj[jb.db.jbId],ref.$jb_childProp].filter(x=>x != null).map(x=>(''+x).replace(/~|;|,/g,'')).join('~')
      const byPath = path.map(x=>(''+x).replace(/~|;|,/g,'')).join('~')
      return `${this.resources.id}://${byId};${byPath}`
    }
    refOfUrl(url) {
      const path = url.split(';')[0].split('~')
      return { handler: this, $jb_obj: {[jb.db.jbId]: +path[0] }, ...path[1] ? {$jb_childProp: path[1]} : {} }
    }
    asRef(obj, silent) {
      if (this.isRef(obj))
        return obj
      if (!obj || typeof obj !== 'object') return obj;
      const actualObj = obj[jb.db.isProxy] ? obj[jb.db.targetVal] : obj
      const path = this.objToPath.get(actualObj) || this.objToPath.get(actualObj[jb.db.jbId])
      if (path)
          return { $jb_obj: this.valOfPath(path), handler: this, path: function() { return this.handler.pathOfRef(this)} }
      if (!silent)
        jb.logError('asRef can not make a watchable ref of obj',{obj})
      return null;
    }
    valOfPath(path) {
      return path.reduce((o,p)=>this.noProxy(o && o[p]),this.resources())
    }
    noProxy(val) {
      return (val && val[jb.db.isProxy] && val[jb.db.originalVal]) || val
    }
    hasLinksInPath(path) {
      let val = this.resources()
      for(let i=0;i<path.length;i++) {
        if (val && val[jb.db.isProxy])
          return true
        val = val && val[path[i]]
      }
    }
    removeLinksFromPath(path) {
      if (!Array.isArray(path)) return
      if (!this.hasLinksInPath(path))
        return path
      return path.reduce(({val,path} ,p) => {
        const proxy = (val && val[jb.db.isProxy])
        const inner =  proxy ? val[jb.db.originalVal] : val
        const newPath = proxy ? (this.objToPath.get(inner) || this.objToPath.get(inner[jb.db.jbId])) : path
        return { val: inner && inner[p], path: [newPath,p].join('~') }
      }, {val: this.resources(), path: ''}).path
    }
    refOfPath(path) {
      const val = this.valOfPath(path);
      if (!val || typeof val !== 'object' && path.length > 0) {
        const parent = this.asRef(this.valOfPath(path.slice(0,-1)), true);
        if (path.length == 1)
          return {$jb_obj: this.resources(), $jb_childProp: path[0], handler: this, $jb_path: () => path }
        return this.objectProperty(parent,path.slice(-1)[0])
      }
      return this.asRef(val)
    }
    asStr(ref) { // for logs
      return this.pathOfRef(ref).join('~')
    }
    isValid(ref) {
      return this.isRef(ref) && this.pathOfRef(ref)
    }
    val(ref) {
      if (ref == null) return ref;
      if (ref.$jb_val) return ref.$jb_val();

      if (!ref.$jb_obj) return ref;
      if (ref.handler != this) {
        if (typeof ref.handler.val != 'function') debugger
        return ref.handler.val(ref)
      }
      this.refreshPrimitiveArrayRef(ref)
      const path = this.pathOfRef(ref);
      if (!path) {
        debugger
        this.pathOfRef(ref)
      }
      return this.valOfPath(path)
    }
    watchable(val) {
      return this.resources() === val || typeof val != 'number' && (this.objToPath.get(val) || (val && this.objToPath.get(val[jb.db.jbId])))
    }
    isRef(ref) {
      return ref && ref.$jb_obj && this.watchable(ref.$jb_obj);
    }
    objectProperty(obj,prop,ctx) {
      if (!obj)
        return jb.logError('watchable objectProperty: null obj',{obj,prop,ctx})
      if (obj && obj[prop] && this.watchable(obj[prop]) && !obj[prop][jb.db.isProxy])
        return this.asRef(obj[prop])
      const ref = this.asRef(obj)
      if (ref && ref.$jb_obj) {
        const ret = {$jb_obj: ref.$jb_obj, $jb_childProp: prop, handler: this, path: function() { return this.handler.pathOfRef(this)}}
        if (this.isPrimitiveArray(ref.$jb_obj)) {
          ret.$jb_delta_version = (this.primitiveArraysDeltas[ref.$jb_obj[jb.db.jbId]] || []).length
          ret.$jb_childProp = +prop
        }
        return ret
      } else {
        return obj[prop]; // not reffable
      }
    }
    writeValue(ref,value,srcCtx) {
      if (!ref || !this.isRef(ref) || !this.pathOfRef(ref))
        return jb.logError('writeValue: err in ref', {srcCtx, ref, value})

      jb.log('watchable writeValue',{ref,value,ref,srcCtx})
      if (ref.$jb_val)
        return ref.$jb_val(value)
      if (this.val(ref) === value) return
      return this.doOp(ref,{$set: this.createSecondaryLink(value)},srcCtx)
    }
    createSecondaryLink(val) {
      if (val && typeof val === 'object' && !val[jb.db.isProxy]) {
        const ref = this.asRef(val,true);
        if (ref && ref.$jb_obj)
          return new Proxy(val, {
            get: (o,p) => (p === jb.db.targetVal) ? o : (p === jb.db.isProxy) ? true : (p === jb.db.originalVal ? val : (jb.val(this.asRef(val)))[p]),
            set: (o,p,v) => o[p] = v
          })
      }
      return val
    }
    splice(ref,args,srcCtx) {
      return this.doOp(ref,{$splice: args },srcCtx)
    }
    move(fromRef,toRef,srcCtx) {
      const fromPath = this.pathOfRef(fromRef), toPath = this.pathOfRef(toRef);
      const sameArray = fromPath.slice(0,-1).join('~') == toPath.slice(0,-1).join('~');
      const fromIndex = Number(fromPath.slice(-1));
      let toIndex = Number(toPath.slice(-1));
      const fromArray = this.refOfPath(fromPath.slice(0,-1)),toArray = this.refOfPath(toPath.slice(0,-1));
      if (isNaN(fromIndex) || isNaN(toIndex))
          return jb.logError('move: not array element',{srcCtx,fromRef,toRef})

      var valToMove = jb.val(fromRef);
      if (sameArray) {
          //if (fromIndex < toIndex) toIndex--; // the deletion changes the index
          const spliceParam = [[fromIndex,1],[toIndex,0,valToMove]]
          spliceParam.fromIndex = fromIndex
          spliceParam.toIndex = toIndex
          return this.doOp(fromArray,{$splice: spliceParam },srcCtx)
      }
      this.startTransaction()
      const spliceParam = [[fromIndex,1]]
      spliceParam.fromIndex = fromIndex
      spliceParam.toIndex = toIndex
      spliceParam.toArray = toArray
      this.doOp(fromArray,{$splice: spliceParam },srcCtx),
      this.doOp(toArray,{$splice: [[toIndex,0,valToMove]] },srcCtx),
      this.endTransaction()
    }
    isPrimitiveArray(arr) {
      return Array.isArray(arr) && arr.some(x=> x != null && typeof x != 'object')
    }
    refreshPrimitiveArrayRef(ref) {
      if (!this.isPrimitiveArray(ref.$jb_obj)) return
      const arrayId = ref.$jb_obj[jb.db.jbId]
      const deltas = this.primitiveArraysDeltas[arrayId] || []
      deltas.slice(ref.$jb_delta_version).forEach(group => {
          if (group.fromIndex != undefined && group.fromIndex === ref.$jb_childProp) { // move
            ref.$jb_childProp = group.toIndex
            if (group.toArray)
              ref.$jb_obj = group.toArray.$jb_obj
            return
          }
          group.forEach(([from,toDelete,toAdd]) => { // splice
            if (ref.$jb_childProp == -1) return
            if (ref.$jb_childProp >= from && ref.$jb_childProp < from+toDelete) {
              ref.$jb_childProp = -1
            } else if (ref.$jb_childProp >= from) {
              ref.$jb_childProp = ref.$jb_childProp - toDelete + (toAdd != null) ? 1 : 0
            }
          })
      })
      ref.$jb_delta_version = deltas.length
    }

    startTransaction() {
      this.transactionEventsLog = []
    }
    endTransaction(doNotNotify) {
      if (!doNotNotify)
        (this.transactionEventsLog || []).forEach(opEvent=>this.resourceChange.next(opEvent))
      delete this.transactionEventsLog
    }
    push(ref,value,srcCtx) {
      return this.doOp(ref,{$push: this.createSecondaryLink(value)},srcCtx)
    }
    merge(ref,value,srcCtx) {
      return this.doOp(ref,{$merge: this.createSecondaryLink(value)},srcCtx)
    }
    getOrCreateObservable({ref,srcCtx,includeChildren,cmp}) {
        const subject = jb.callbag.subject()
        const ctx = cmp && cmp.ctx || srcCtx || { path: ''}
        const key = this.pathOfRef(ref).join('~') + ' : ' + ctx.path
        //const recycleCounter = cmp && cmp.getAttribute && +(cmp.getAttribute('recycleCounter') || 0)
        const obs = { key, ref,srcCtx,includeChildren, cmp, subject, ctx }

        this.observables.push(obs)
        this.observables.sort((e1,e2) => jb.db.comparePaths(e1.ctx.path, e2.ctx.path))
        jb.log('register watchable observable',obs)
        return subject
    }
    frame() {
      return this.resources.frame || jb.frame
    }
    propagateResourceChangeToObservables() {
      jb.subscribe(this.resourceChange, e=>{
        const observablesToUpdate = this.observables.slice(0) // this.observables array may change in the notification process !!
        const changed_path = this.removeLinksFromPath(this.pathOfRef(e.ref))
        if (changed_path) observablesToUpdate.forEach(obs=> {
          if (jb.path(obs,'cmp._destroyed')) {
            if (this.observables.indexOf(obs) != -1) {
              obs.subject.complete()
              this.observables.splice(this.observables.indexOf(obs), 1);
              jb.log('watchable observable removed',{obs})
            }
          } else {
            this.notifyOneObserver(e,obs,changed_path)
          }
        })
      })
    }

    notifyOneObserver(e,obs,changed_path) {
        let obsPath = jb.db.refHandler(obs.ref).pathOfRef(obs.ref)
        obsPath = obsPath && this.removeLinksFromPath(obsPath)
        if (!obsPath)
          return jb.logError('watchable observable ref path is empty',{obs,e})
        const diff = jb.db.comparePaths(changed_path, obsPath)
        const isChildOfChange = diff == 1
        const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
        const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
        if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure) {
            jb.log('notify watchable observable',{srcCtx: e.srcCtx,obs,e})
            obs.subject.next(e)
        }
    }

    dispose() {
      this.resourceChange.complete()
    }
  },

  resourcesRef: val => typeof val == 'undefined' ? jb.db.resources : (jb.db.resources = val),
  comparePaths(path1,path2) { // 0- equals, -1,1 means contains -2,2 lexical
        path1 = path1 || ''
        path2 = path2 || ''
        let i=0;
        while(path1[i] === path2[i] && i < path1.length) i++;
        if (i == path1.length && i == path2.length) return 0;
        if (i == path1.length && i < path2.length) return -1;
        if (i == path2.length && i < path1.length) return 1;
        return path1[i] < path2[i] ? -2 : 2
  },
  isWatchable: ref => jb.db.refHandler(ref) instanceof jb.db.WatchableValueByRef || ref && ref.$jb_observable,
  refObservable(ref,{cmp,includeChildren,srcCtx} = {}) { // cmp._destroyed is checked before notification
      if (ref && ref.$jb_observable)
        return ref.$jb_observable(cmp)
      if (!jb.db.isWatchable(ref)) {
        jb.logError('ref is not watchable: ', {ref, cmp,srcCtx})
        return jb.callbag.fromIter([])
      }
      return jb.db.refHandler(ref).getOrCreateObservable({ref,cmp,includeChildren,srcCtx})
  },
  rebuildRefHandler() { // used to clean after tests
      jb.db.mainWatchableHandler && jb.db.mainWatchableHandler.dispose()
      jb.db.setMainWatchableHandler(new jb.db.WatchableValueByRef(jb.db.resourcesRef))
  },
  initializeModule() {
    jb.db.resourcesRef.id = 'resources'
    jb.db.setMainWatchableHandler(new jb.db.WatchableValueByRef(jb.db.resourcesRef))
  }
})

jb.component('runTransaction', {
  type: 'action',
  params: [
    {id: 'actions', type: 'action[]', ignore: true, composite: true, mandatory: true},
    {id: 'noNotifications', as: 'boolean', type: 'boolean'}
  ],
  impl: ctx => {
		const actions = jb.asArray(ctx.profile.actions || ctx.profile['$runActions'] || []).filter(x=>x);
		const innerPath =  (ctx.profile.actions && ctx.profile.actions.sugar) ? ''
			: (ctx.profile['$runActions'] ? '$runActions~' : 'items~');
    jb.db.mainWatchableHandler.startTransaction()
    return actions.reduce((def,action,index) =>
				def.then(_ => ctx.runInner(action, { as: 'single'}, innerPath + index )) ,Promise.resolve())
			.catch((e) => jb.logException(e,'runTransaction',{ctx}))
      .then(() => jb.db.mainWatchableHandler.endTransaction(ctx.params.noNotifications))
	}
})
;


};