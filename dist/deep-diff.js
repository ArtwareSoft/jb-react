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
/******/ 	return __webpack_require__(__webpack_require__.s = "./projects/studio/studio-deep-diff-ext.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/deep-diff/index.js":
/*!*****************************************!*\
  !*** ./node_modules/deep-diff/index.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var __WEBPACK_AMD_DEFINE_RESULT__;;(function(root, factory) { // eslint-disable-line no-extra-semi\n  var deepDiff = factory(root);\n  // eslint-disable-next-line no-undef\n  if (true) {\n      // AMD\n      !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() { // eslint-disable-line no-undef\n          return deepDiff;\n      }).call(exports, __webpack_require__, exports, module),\n\t\t\t\t__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n  } else { var _deepdiff; }\n}(this, function(root) {\n  var validKinds = ['N', 'E', 'A', 'D'];\n\n  // nodejs compatible on server side and in the browser.\n  function inherits(ctor, superCtor) {\n    ctor.super_ = superCtor;\n    ctor.prototype = Object.create(superCtor.prototype, {\n      constructor: {\n        value: ctor,\n        enumerable: false,\n        writable: true,\n        configurable: true\n      }\n    });\n  }\n\n  function Diff(kind, path) {\n    Object.defineProperty(this, 'kind', {\n      value: kind,\n      enumerable: true\n    });\n    if (path && path.length) {\n      Object.defineProperty(this, 'path', {\n        value: path,\n        enumerable: true\n      });\n    }\n  }\n\n  function DiffEdit(path, origin, value) {\n    DiffEdit.super_.call(this, 'E', path);\n    Object.defineProperty(this, 'lhs', {\n      value: origin,\n      enumerable: true\n    });\n    Object.defineProperty(this, 'rhs', {\n      value: value,\n      enumerable: true\n    });\n  }\n  inherits(DiffEdit, Diff);\n\n  function DiffNew(path, value) {\n    DiffNew.super_.call(this, 'N', path);\n    Object.defineProperty(this, 'rhs', {\n      value: value,\n      enumerable: true\n    });\n  }\n  inherits(DiffNew, Diff);\n\n  function DiffDeleted(path, value) {\n    DiffDeleted.super_.call(this, 'D', path);\n    Object.defineProperty(this, 'lhs', {\n      value: value,\n      enumerable: true\n    });\n  }\n  inherits(DiffDeleted, Diff);\n\n  function DiffArray(path, index, item) {\n    DiffArray.super_.call(this, 'A', path);\n    Object.defineProperty(this, 'index', {\n      value: index,\n      enumerable: true\n    });\n    Object.defineProperty(this, 'item', {\n      value: item,\n      enumerable: true\n    });\n  }\n  inherits(DiffArray, Diff);\n\n  function arrayRemove(arr, from, to) {\n    var rest = arr.slice((to || from) + 1 || arr.length);\n    arr.length = from < 0 ? arr.length + from : from;\n    arr.push.apply(arr, rest);\n    return arr;\n  }\n\n  function realTypeOf(subject) {\n    var type = typeof subject;\n    if (type !== 'object') {\n      return type;\n    }\n\n    if (subject === Math) {\n      return 'math';\n    } else if (subject === null) {\n      return 'null';\n    } else if (Array.isArray(subject)) {\n      return 'array';\n    } else if (Object.prototype.toString.call(subject) === '[object Date]') {\n      return 'date';\n    } else if (typeof subject.toString === 'function' && /^\\/.*\\//.test(subject.toString())) {\n      return 'regexp';\n    }\n    return 'object';\n  }\n\n  // http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/\n  function hashThisString(string) {\n    var hash = 0;\n    if (string.length === 0) { return hash; }\n    for (var i = 0; i < string.length; i++) {\n      var char = string.charCodeAt(i);\n      hash = ((hash << 5) - hash) + char;\n      hash = hash & hash; // Convert to 32bit integer\n    }\n    return hash;\n  }\n\n  // Gets a hash of the given object in an array order-independent fashion\n  // also object key order independent (easier since they can be alphabetized)\n  function getOrderIndependentHash(object) {\n    var accum = 0;\n    var type = realTypeOf(object);\n\n    if (type === 'array') {\n      object.forEach(function (item) {\n        // Addition is commutative so this is order indep\n        accum += getOrderIndependentHash(item);\n      });\n\n      var arrayString = '[type: array, hash: ' + accum + ']';\n      return accum + hashThisString(arrayString);\n    }\n\n    if (type === 'object') {\n      for (var key in object) {\n        if (object.hasOwnProperty(key)) {\n          var keyValueString = '[ type: object, key: ' + key + ', value hash: ' + getOrderIndependentHash(object[key]) + ']';\n          accum += hashThisString(keyValueString);\n        }\n      }\n\n      return accum;\n    }\n\n    // Non object, non array...should be good?\n    var stringToHash = '[ type: ' + type + ' ; value: ' + object + ']';\n    return accum + hashThisString(stringToHash);\n  }\n\n  function deepDiff(lhs, rhs, changes, prefilter, path, key, stack, orderIndependent) {\n    changes = changes || [];\n    path = path || [];\n    stack = stack || [];\n    var currentPath = path.slice(0);\n    if (typeof key !== 'undefined' && key !== null) {\n      if (prefilter) {\n        if (typeof (prefilter) === 'function' && prefilter(currentPath, key)) {\n          return;\n        } else if (typeof (prefilter) === 'object') {\n          if (prefilter.prefilter && prefilter.prefilter(currentPath, key)) {\n            return;\n          }\n          if (prefilter.normalize) {\n            var alt = prefilter.normalize(currentPath, key, lhs, rhs);\n            if (alt) {\n              lhs = alt[0];\n              rhs = alt[1];\n            }\n          }\n        }\n      }\n      currentPath.push(key);\n    }\n\n    // Use string comparison for regexes\n    if (realTypeOf(lhs) === 'regexp' && realTypeOf(rhs) === 'regexp') {\n      lhs = lhs.toString();\n      rhs = rhs.toString();\n    }\n\n    var ltype = typeof lhs;\n    var rtype = typeof rhs;\n    var i, j, k, other;\n\n    var ldefined = ltype !== 'undefined' ||\n      (stack && (stack.length > 0) && stack[stack.length - 1].lhs &&\n        Object.getOwnPropertyDescriptor(stack[stack.length - 1].lhs, key));\n    var rdefined = rtype !== 'undefined' ||\n      (stack && (stack.length > 0) && stack[stack.length - 1].rhs &&\n        Object.getOwnPropertyDescriptor(stack[stack.length - 1].rhs, key));\n\n    if (!ldefined && rdefined) {\n      changes.push(new DiffNew(currentPath, rhs));\n    } else if (!rdefined && ldefined) {\n      changes.push(new DiffDeleted(currentPath, lhs));\n    } else if (realTypeOf(lhs) !== realTypeOf(rhs)) {\n      changes.push(new DiffEdit(currentPath, lhs, rhs));\n    } else if (realTypeOf(lhs) === 'date' && (lhs - rhs) !== 0) {\n      changes.push(new DiffEdit(currentPath, lhs, rhs));\n    } else if (ltype === 'object' && lhs !== null && rhs !== null) {\n      for (i = stack.length - 1; i > -1; --i) {\n        if (stack[i].lhs === lhs) {\n          other = true;\n          break;\n        }\n      }\n      if (!other) {\n        stack.push({ lhs: lhs, rhs: rhs });\n        if (Array.isArray(lhs)) {\n          // If order doesn't matter, we need to sort our arrays\n          if (orderIndependent) {\n            lhs.sort(function (a, b) {\n              return getOrderIndependentHash(a) - getOrderIndependentHash(b);\n            });\n\n            rhs.sort(function (a, b) {\n              return getOrderIndependentHash(a) - getOrderIndependentHash(b);\n            });\n          }\n          i = rhs.length - 1;\n          j = lhs.length - 1;\n          while (i > j) {\n            changes.push(new DiffArray(currentPath, i, new DiffNew(undefined, rhs[i--])));\n          }\n          while (j > i) {\n            changes.push(new DiffArray(currentPath, j, new DiffDeleted(undefined, lhs[j--])));\n          }\n          for (; i >= 0; --i) {\n            deepDiff(lhs[i], rhs[i], changes, prefilter, currentPath, i, stack, orderIndependent);\n          }\n        } else {\n          var akeys = Object.keys(lhs);\n          var pkeys = Object.keys(rhs);\n          for (i = 0; i < akeys.length; ++i) {\n            k = akeys[i];\n            other = pkeys.indexOf(k);\n            if (other >= 0) {\n              deepDiff(lhs[k], rhs[k], changes, prefilter, currentPath, k, stack, orderIndependent);\n              pkeys[other] = null;\n            } else {\n              deepDiff(lhs[k], undefined, changes, prefilter, currentPath, k, stack, orderIndependent);\n            }\n          }\n          for (i = 0; i < pkeys.length; ++i) {\n            k = pkeys[i];\n            if (k) {\n              deepDiff(undefined, rhs[k], changes, prefilter, currentPath, k, stack, orderIndependent);\n            }\n          }\n        }\n        stack.length = stack.length - 1;\n      } else if (lhs !== rhs) {\n        // lhs is contains a cycle at this element and it differs from rhs\n        changes.push(new DiffEdit(currentPath, lhs, rhs));\n      }\n    } else if (lhs !== rhs) {\n      if (!(ltype === 'number' && isNaN(lhs) && isNaN(rhs))) {\n        changes.push(new DiffEdit(currentPath, lhs, rhs));\n      }\n    }\n  }\n\n  function observableDiff(lhs, rhs, observer, prefilter, orderIndependent) {\n    var changes = [];\n    deepDiff(lhs, rhs, changes, prefilter, null, null, null, orderIndependent);\n    if (observer) {\n      for (var i = 0; i < changes.length; ++i) {\n        observer(changes[i]);\n      }\n    }\n    return changes;\n  }\n\n  function orderIndependentDeepDiff(lhs, rhs, changes, prefilter, path, key, stack) {\n    return deepDiff(lhs, rhs, changes, prefilter, path, key, stack, true);\n  }\n\n  function accumulateDiff(lhs, rhs, prefilter, accum) {\n    var observer = (accum) ?\n      function (difference) {\n        if (difference) {\n          accum.push(difference);\n        }\n      } : undefined;\n    var changes = observableDiff(lhs, rhs, observer, prefilter);\n    return (accum) ? accum : (changes.length) ? changes : undefined;\n  }\n\n  function accumulateOrderIndependentDiff(lhs, rhs, prefilter, accum) {\n    var observer = (accum) ?\n      function (difference) {\n        if (difference) {\n          accum.push(difference);\n        }\n      } : undefined;\n    var changes = observableDiff(lhs, rhs, observer, prefilter, true);\n    return (accum) ? accum : (changes.length) ? changes : undefined;\n  }\n\n  function applyArrayChange(arr, index, change) {\n    if (change.path && change.path.length) {\n      var it = arr[index],\n        i, u = change.path.length - 1;\n      for (i = 0; i < u; i++) {\n        it = it[change.path[i]];\n      }\n      switch (change.kind) {\n        case 'A':\n          applyArrayChange(it[change.path[i]], change.index, change.item);\n          break;\n        case 'D':\n          delete it[change.path[i]];\n          break;\n        case 'E':\n        case 'N':\n          it[change.path[i]] = change.rhs;\n          break;\n      }\n    } else {\n      switch (change.kind) {\n        case 'A':\n          applyArrayChange(arr[index], change.index, change.item);\n          break;\n        case 'D':\n          arr = arrayRemove(arr, index);\n          break;\n        case 'E':\n        case 'N':\n          arr[index] = change.rhs;\n          break;\n      }\n    }\n    return arr;\n  }\n\n  function applyChange(target, source, change) {\n    if (typeof change === 'undefined' && source && ~validKinds.indexOf(source.kind)) {\n      change = source;\n    }\n    if (target && change && change.kind) {\n      var it = target,\n        i = -1,\n        last = change.path ? change.path.length - 1 : 0;\n      while (++i < last) {\n        if (typeof it[change.path[i]] === 'undefined') {\n          it[change.path[i]] = (typeof change.path[i + 1] !== 'undefined' && typeof change.path[i + 1] === 'number') ? [] : {};\n        }\n        it = it[change.path[i]];\n      }\n      switch (change.kind) {\n        case 'A':\n          if (change.path && typeof it[change.path[i]] === 'undefined') {\n            it[change.path[i]] = [];\n          }\n          applyArrayChange(change.path ? it[change.path[i]] : it, change.index, change.item);\n          break;\n        case 'D':\n          delete it[change.path[i]];\n          break;\n        case 'E':\n        case 'N':\n          it[change.path[i]] = change.rhs;\n          break;\n      }\n    }\n  }\n\n  function revertArrayChange(arr, index, change) {\n    if (change.path && change.path.length) {\n      // the structure of the object at the index has changed...\n      var it = arr[index],\n        i, u = change.path.length - 1;\n      for (i = 0; i < u; i++) {\n        it = it[change.path[i]];\n      }\n      switch (change.kind) {\n        case 'A':\n          revertArrayChange(it[change.path[i]], change.index, change.item);\n          break;\n        case 'D':\n          it[change.path[i]] = change.lhs;\n          break;\n        case 'E':\n          it[change.path[i]] = change.lhs;\n          break;\n        case 'N':\n          delete it[change.path[i]];\n          break;\n      }\n    } else {\n      // the array item is different...\n      switch (change.kind) {\n        case 'A':\n          revertArrayChange(arr[index], change.index, change.item);\n          break;\n        case 'D':\n          arr[index] = change.lhs;\n          break;\n        case 'E':\n          arr[index] = change.lhs;\n          break;\n        case 'N':\n          arr = arrayRemove(arr, index);\n          break;\n      }\n    }\n    return arr;\n  }\n\n  function revertChange(target, source, change) {\n    if (target && source && change && change.kind) {\n      var it = target,\n        i, u;\n      u = change.path.length - 1;\n      for (i = 0; i < u; i++) {\n        if (typeof it[change.path[i]] === 'undefined') {\n          it[change.path[i]] = {};\n        }\n        it = it[change.path[i]];\n      }\n      switch (change.kind) {\n        case 'A':\n          // Array was modified...\n          // it will be an array...\n          revertArrayChange(it[change.path[i]], change.index, change.item);\n          break;\n        case 'D':\n          // Item was deleted...\n          it[change.path[i]] = change.lhs;\n          break;\n        case 'E':\n          // Item was edited...\n          it[change.path[i]] = change.lhs;\n          break;\n        case 'N':\n          // Item is new...\n          delete it[change.path[i]];\n          break;\n      }\n    }\n  }\n\n  function applyDiff(target, source, filter) {\n    if (target && source) {\n      var onChange = function (change) {\n        if (!filter || filter(target, source, change)) {\n          applyChange(target, source, change);\n        }\n      };\n      observableDiff(target, source, onChange);\n    }\n  }\n\n  Object.defineProperties(accumulateDiff, {\n\n    diff: {\n      value: accumulateDiff,\n      enumerable: true\n    },\n    orderIndependentDiff: {\n      value: accumulateOrderIndependentDiff,\n      enumerable: true\n    },\n    observableDiff: {\n      value: observableDiff,\n      enumerable: true\n    },\n    orderIndependentObservableDiff: {\n      value: orderIndependentDeepDiff,\n      enumerable: true\n    },\n    orderIndepHash: {\n      value: getOrderIndependentHash,\n      enumerable: true\n    },\n    applyDiff: {\n      value: applyDiff,\n      enumerable: true\n    },\n    applyChange: {\n      value: applyChange,\n      enumerable: true\n    },\n    revertChange: {\n      value: revertChange,\n      enumerable: true\n    },\n    isConflict: {\n      value: function () {\n        return typeof $conflict !== 'undefined';\n      },\n      enumerable: true\n    }\n  });\n\n  // hackish...\n  accumulateDiff.DeepDiff = accumulateDiff;\n  // ...but works with:\n  // import DeepDiff from 'deep-diff'\n  // import { DeepDiff } from 'deep-diff'\n  // const DeepDiff = require('deep-diff');\n  // const { DeepDiff } = require('deep-diff');\n\n  if (root) {\n    root.DeepDiff = accumulateDiff;\n  }\n\n  return accumulateDiff;\n}));\n\n\n//# sourceURL=webpack:///./node_modules/deep-diff/index.js?");

/***/ }),

/***/ "./projects/studio/studio-deep-diff-ext.js":
/*!*************************************************!*\
  !*** ./projects/studio/studio-deep-diff-ext.js ***!
  \*************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var deep_diff__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! deep-diff */ \"./node_modules/deep-diff/index.js\");\n/* harmony import */ var deep_diff__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(deep_diff__WEBPACK_IMPORTED_MODULE_0__);\n\r\njb.studio.diff = deep_diff__WEBPACK_IMPORTED_MODULE_0___default.a;\r\n\n\n//# sourceURL=webpack:///./projects/studio/studio-deep-diff-ext.js?");

/***/ })

/******/ });