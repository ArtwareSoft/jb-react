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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/ui/jb-immutable.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/immutability-helper/index.js":
/*!***************************************************!*\
  !*** ./node_modules/immutability-helper/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar invariant = __webpack_require__(/*! invariant */ \"./node_modules/invariant/browser.js\");\nvar hasOwnProperty = Object.prototype.hasOwnProperty;\nvar splice = Array.prototype.splice;\nvar toString = Object.prototype.toString;\nfunction type(obj) {\n    return toString.call(obj).slice(8, -1);\n}\nvar assign = Object.assign || /* istanbul ignore next */ (function (target, source) {\n    getAllKeys(source).forEach(function (key) {\n        if (hasOwnProperty.call(source, key)) {\n            target[key] = source[key];\n        }\n    });\n    return target;\n});\nvar getAllKeys = typeof Object.getOwnPropertySymbols === 'function'\n    ? function (obj) { return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj)); }\n    /* istanbul ignore next */\n    : function (obj) { return Object.keys(obj); };\nfunction copy(object) {\n    return Array.isArray(object)\n        ? assign(object.constructor(object.length), object)\n        : (type(object) === 'Map')\n            ? new Map(object)\n            : (type(object) === 'Set')\n                ? new Set(object)\n                : (object && typeof object === 'object')\n                    ? assign(Object.create(Object.getPrototypeOf(object)), object)\n                    /* istanbul ignore next */\n                    : object;\n}\nvar Context = /** @class */ (function () {\n    function Context() {\n        this.commands = assign({}, defaultCommands);\n        this.update = this.update.bind(this);\n        // Deprecated: update.extend, update.isEquals and update.newContext\n        this.update.extend = this.extend = this.extend.bind(this);\n        this.update.isEquals = function (x, y) { return x === y; };\n        this.update.newContext = function () { return new Context().update; };\n    }\n    Object.defineProperty(Context.prototype, \"isEquals\", {\n        get: function () {\n            return this.update.isEquals;\n        },\n        set: function (value) {\n            this.update.isEquals = value;\n        },\n        enumerable: true,\n        configurable: true\n    });\n    Context.prototype.extend = function (directive, fn) {\n        this.commands[directive] = fn;\n    };\n    Context.prototype.update = function (object, $spec) {\n        var _this = this;\n        var spec = (typeof $spec === 'function') ? { $apply: $spec } : $spec;\n        if (!(Array.isArray(object) && Array.isArray(spec))) {\n            invariant(!Array.isArray(spec), 'update(): You provided an invalid spec to update(). The spec may ' +\n                'not contain an array except as the value of $set, $push, $unshift, ' +\n                '$splice or any custom command allowing an array value.');\n        }\n        invariant(typeof spec === 'object' && spec !== null, 'update(): You provided an invalid spec to update(). The spec and ' +\n            'every included key path must be plain objects containing one of the ' +\n            'following commands: %s.', Object.keys(this.commands).join(', '));\n        var nextObject = object;\n        getAllKeys(spec).forEach(function (key) {\n            if (hasOwnProperty.call(_this.commands, key)) {\n                var objectWasNextObject = object === nextObject;\n                nextObject = _this.commands[key](spec[key], nextObject, spec, object);\n                if (objectWasNextObject && _this.isEquals(nextObject, object)) {\n                    nextObject = object;\n                }\n            }\n            else {\n                var nextValueForKey = type(object) === 'Map'\n                    ? _this.update(object.get(key), spec[key])\n                    : _this.update(object[key], spec[key]);\n                var nextObjectValue = type(nextObject) === 'Map'\n                    ? nextObject.get(key)\n                    : nextObject[key];\n                if (!_this.isEquals(nextValueForKey, nextObjectValue)\n                    || typeof nextValueForKey === 'undefined'\n                        && !hasOwnProperty.call(object, key)) {\n                    if (nextObject === object) {\n                        nextObject = copy(object);\n                    }\n                    if (type(nextObject) === 'Map') {\n                        nextObject.set(key, nextValueForKey);\n                    }\n                    else {\n                        nextObject[key] = nextValueForKey;\n                    }\n                }\n            }\n        });\n        return nextObject;\n    };\n    return Context;\n}());\nexports.Context = Context;\nvar defaultCommands = {\n    $push: function (value, nextObject, spec) {\n        invariantPushAndUnshift(nextObject, spec, '$push');\n        return value.length ? nextObject.concat(value) : nextObject;\n    },\n    $unshift: function (value, nextObject, spec) {\n        invariantPushAndUnshift(nextObject, spec, '$unshift');\n        return value.length ? value.concat(nextObject) : nextObject;\n    },\n    $splice: function (value, nextObject, spec, originalObject) {\n        invariantSplices(nextObject, spec);\n        value.forEach(function (args) {\n            invariantSplice(args);\n            if (nextObject === originalObject && args.length) {\n                nextObject = copy(originalObject);\n            }\n            splice.apply(nextObject, args);\n        });\n        return nextObject;\n    },\n    $set: function (value, _nextObject, spec) {\n        invariantSet(spec);\n        return value;\n    },\n    $toggle: function (targets, nextObject) {\n        invariantSpecArray(targets, '$toggle');\n        var nextObjectCopy = targets.length ? copy(nextObject) : nextObject;\n        targets.forEach(function (target) {\n            nextObjectCopy[target] = !nextObject[target];\n        });\n        return nextObjectCopy;\n    },\n    $unset: function (value, nextObject, _spec, originalObject) {\n        invariantSpecArray(value, '$unset');\n        value.forEach(function (key) {\n            if (Object.hasOwnProperty.call(nextObject, key)) {\n                if (nextObject === originalObject) {\n                    nextObject = copy(originalObject);\n                }\n                delete nextObject[key];\n            }\n        });\n        return nextObject;\n    },\n    $add: function (values, nextObject, _spec, originalObject) {\n        invariantMapOrSet(nextObject, '$add');\n        invariantSpecArray(values, '$add');\n        if (type(nextObject) === 'Map') {\n            values.forEach(function (_a) {\n                var key = _a[0], value = _a[1];\n                if (nextObject === originalObject && nextObject.get(key) !== value) {\n                    nextObject = copy(originalObject);\n                }\n                nextObject.set(key, value);\n            });\n        }\n        else {\n            values.forEach(function (value) {\n                if (nextObject === originalObject && !nextObject.has(value)) {\n                    nextObject = copy(originalObject);\n                }\n                nextObject.add(value);\n            });\n        }\n        return nextObject;\n    },\n    $remove: function (value, nextObject, _spec, originalObject) {\n        invariantMapOrSet(nextObject, '$remove');\n        invariantSpecArray(value, '$remove');\n        value.forEach(function (key) {\n            if (nextObject === originalObject && nextObject.has(key)) {\n                nextObject = copy(originalObject);\n            }\n            nextObject.delete(key);\n        });\n        return nextObject;\n    },\n    $merge: function (value, nextObject, _spec, originalObject) {\n        invariantMerge(nextObject, value);\n        getAllKeys(value).forEach(function (key) {\n            if (value[key] !== nextObject[key]) {\n                if (nextObject === originalObject) {\n                    nextObject = copy(originalObject);\n                }\n                nextObject[key] = value[key];\n            }\n        });\n        return nextObject;\n    },\n    $apply: function (value, original) {\n        invariantApply(value);\n        return value(original);\n    },\n};\nvar defaultContext = new Context();\nexports.isEquals = defaultContext.update.isEquals;\nexports.extend = defaultContext.extend;\nexports.default = defaultContext.update;\n// @ts-ignore\nexports.default.default = module.exports = assign(exports.default, exports);\n// invariants\nfunction invariantPushAndUnshift(value, spec, command) {\n    invariant(Array.isArray(value), 'update(): expected target of %s to be an array; got %s.', command, value);\n    invariantSpecArray(spec[command], command);\n}\nfunction invariantSpecArray(spec, command) {\n    invariant(Array.isArray(spec), 'update(): expected spec of %s to be an array; got %s. ' +\n        'Did you forget to wrap your parameter in an array?', command, spec);\n}\nfunction invariantSplices(value, spec) {\n    invariant(Array.isArray(value), 'Expected $splice target to be an array; got %s', value);\n    invariantSplice(spec.$splice);\n}\nfunction invariantSplice(value) {\n    invariant(Array.isArray(value), 'update(): expected spec of $splice to be an array of arrays; got %s. ' +\n        'Did you forget to wrap your parameters in an array?', value);\n}\nfunction invariantApply(fn) {\n    invariant(typeof fn === 'function', 'update(): expected spec of $apply to be a function; got %s.', fn);\n}\nfunction invariantSet(spec) {\n    invariant(Object.keys(spec).length === 1, 'Cannot have more than one key in an object with $set');\n}\nfunction invariantMerge(target, specValue) {\n    invariant(specValue && typeof specValue === 'object', 'update(): $merge expects a spec of type \\'object\\'; got %s', specValue);\n    invariant(target && typeof target === 'object', 'update(): $merge expects a target of type \\'object\\'; got %s', target);\n}\nfunction invariantMapOrSet(target, command) {\n    var typeOfTarget = type(target);\n    invariant(typeOfTarget === 'Map' || typeOfTarget === 'Set', 'update(): %s expects a target of type Set or Map; got %s', command, typeOfTarget);\n}\n\n\n//# sourceURL=webpack:///./node_modules/immutability-helper/index.js?");

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

/***/ "./src/ui/jb-immutable.js":
/*!********************************!*\
  !*** ./src/ui/jb-immutable.js ***!
  \********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var immutability_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! immutability-helper */ \"./node_modules/immutability-helper/index.js\");\n/* harmony import */ var immutability_helper__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(immutability_helper__WEBPACK_IMPORTED_MODULE_0__);\n\r\n\r\njb.ui.update = immutability_helper__WEBPACK_IMPORTED_MODULE_0___default.a;\r\n\n\n//# sourceURL=webpack:///./src/ui/jb-immutable.js?");

/***/ })

/******/ });