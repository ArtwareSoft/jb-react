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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var immutability_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! immutability-helper */ \"./node_modules/immutability-helper/index.js\");\n/* harmony import */ var immutability_helper__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(immutability_helper__WEBPACK_IMPORTED_MODULE_0__);\n\r\n\r\njb.ui.update = immutability_helper__WEBPACK_IMPORTED_MODULE_0___default.a;\r\n\n\n//# sourceURL=webpack:///./src/ui/pack-immutable.js?");

/***/ })

/******/ });;

(function() {
const is = (previous, current) => previous === current
const UNIQUE = {}
const kTrue = () => true
const identity = a => a

jb.callbag = {
    forEach: operation => source => {
        let talkback
        source(0, (t, d) => {
            if (t === 0) talkback = d
            if (t === 1) operation(d)
            if (t === 1 || t === 0) talkback(1)
        })
    },
    fromIter: iter => (start, sink) => {
        if (start !== 0) return
        const iterator =
            typeof Symbol !== 'undefined' && iter[Symbol.iterator]
            ? iter[Symbol.iterator]()
            : iter
        let inloop = false
        let got1 = false
        let res
        function loop() {
            inloop = true
            while (got1) {
                got1 = false
                res = iterator.next()
                if (res.done) sink(2)
                else sink(1, res.value)
            }
            inloop = false
        }
        sink(0, (t, d) => {
            if (t === 1) {
                got1 = true
                if (!inloop && !(res && res.done)) loop()
            }
        })
    },
    Do: f => source => (start, sink) => {
        if (start !== 0) return
        source(0, (t, d) => {
            if (t == 1) f(d)
            sink(t, d)
        })
    },
    filter: condition => source => (start, sink) => {
        if (start !== 0) return
        let talkback
        source(0, (t, d) => {
          if (t === 0) {
            talkback = d
            sink(t, d)
          } else if (t === 1) {
            if (condition(d)) sink(t, d)
            else talkback(1)
          }
          else sink(t, d)
        })
    },
    map: f => source => (start, sink) => {
        if (start !== 0) return
        source(0, (t, d) => {
            sink(t, t === 1 ? f(d) : d)
        })
    },
    pipe(..._cbs) {
        const cbs = _cbs.filter(x=>x)
        if (!cbs[0]) return
        let res = cbs[0]
        for (let i = 1, n = cbs.length; i < n; i++) res = cbs[i](res)
        return res
    },
    distinctUntilChanged(compare = is) {
        return source => (start, sink) => {
            if (start !== 0) return
            let inited = false
            let prev
            let talkback
            source(0, (type, data) => {
                if (type === 0) {
                    talkback = data
                }

                if (type !== 1) {
                    sink(type, data)
                    return
                }

                if (inited && compare(prev, data)) {
                    talkback(1)
                    return
                }

                inited = true
                prev = data
                sink(1, data)
            })
        }
    },
    takeUntil(notifier) {
        if (Object.prototype.toString.call(notifier) === "[object Promise]")
            notifier = jb.callbag.fromPromise(notifier)
        return source => (start, sink) => {
            if (start !== 0) return
            let sourceTalkback
            let notifierTalkback
            let inited = false
            let done = UNIQUE

            source(0, (t, d) => {
                if (t === 0) {
                    sourceTalkback = d

                    notifier(0, (t, d) => {
                        if (t === 0) {
                            notifierTalkback = d
                            notifierTalkback(1)
                            return
                        }
                        if (t === 1) {
                            done = void 0
                            notifierTalkback(2)
                            sourceTalkback(2)
                            if (inited) sink(2)
                            return
                        }
                        if (t === 2) {
                            notifierTalkback = null
                            done = d
                            if (d != null) {
                                sourceTalkback(2)
                                if (inited) sink(t, d)
                            }
                        }
                    })
                    inited = true

                    sink(0, (t, d) => {
                        if (done !== UNIQUE) return
                        if (t === 2 && notifierTalkback) notifierTalkback(2)
                        sourceTalkback(t, d)
                    })

                    if (done !== UNIQUE) sink(2, done)
                    return
                }
                if (t === 2) notifierTalkback(2)
                if (done === UNIQUE) sink(t, d)
            })
        }
    },
    flatMap: (_makeSource, combineResults) => inputSource => (start, sink) => {
        if (start !== 0) return
        const makeSource = (...args) => jb.callbag.fromAny(_makeSource(...args))


        if (!combineResults) combineResults = (x, y) => y

        let index = 0
        let talkbacks = {}
        let sourceEnded = false
        let inputSourceTalkback = null

        let pullHandle = (t, d) => {
            var currTalkback = Object.values(talkbacks).pop()
            if (t === 1) {
                if (currTalkback) currTalkback(1)
                else if (!sourceEnded) inputSourceTalkback(1)
                else sink(2)
            }
            if (t === 2) {
                if (currTalkback) currTalkback(2)
                inputSourceTalkback(2)
            }
        }

        let stopOrContinue = d => {
            if (sourceEnded && Object.keys(talkbacks).length === 0) sink(2, d)
            else inputSourceTalkback(1)
        }

        let makeSink = (i, d, talkbacks) =>
            (currT, currD) => {
                if (currT === 0) {talkbacks[i] = currD; talkbacks[i](1)}
                if (currT === 1) sink(1, combineResults(d, currD))
                if (currT === 2) {
                    delete talkbacks[i]
                    stopOrContinue(currD)
                }
            }

        inputSource(0, (t, d) => {
            if (t === 0) {
                inputSourceTalkback = d
                sink(0, pullHandle)
            }
            if (t === 1) {
                makeSource(d)(0, makeSink(index++, d, talkbacks))
            }
            if (t === 2) {
                sourceEnded = true
                stopOrContinue(d)
            }
    })
    },
    merge(..._sources) {
        const sources = _sources.filter(x=>x).filter(x=>jb.callbag.fromAny(x))
        return (start, sink) => {
          if (start !== 0) return
          const n = sources.length
          const sourceTalkbacks = new Array(n)
          let startCount = 0
          let endCount = 0
          let ended = false
          const talkback = (t, d) => {
            if (t === 2) ended = true
            for (let i = 0; i < n; i++) sourceTalkbacks[i] && sourceTalkbacks[i](t, d)
          }
          for (let i = 0; i < n; i++) {
            if (ended) return
            sources[i](0, (t, d) => {
              if (t === 0) {
                sourceTalkbacks[i] = d
                if (++startCount === 1) sink(0, talkback)
              } else if (t === 2 && d) {
                ended = true
                for (let j = 0; j < n; j++) {
                  if (j !== i) sourceTalkbacks[j] && sourceTalkbacks[j](2)
                }
                sink(2, d)
              } else if (t === 2) {
                sourceTalkbacks[i] = void 0
                if (++endCount === n) sink(2)
              } else sink(t, d)
            })
          }
        }
    },
    fromEvent: (node, name, options) => (start, sink) => {
        if (start !== 0) return
        let disposed = false
        const handler = ev => sink(1, ev)
      
        sink(0, (t, d) => {
          if (t !== 2) {
            return
          }
          disposed = true
          if (node.removeEventListener) node.removeEventListener(name, handler, options)
          else if (node.removeListener) node.removeListener(name, handler)
          else throw new Error('cannot remove listener from node. No method found.')
        })
      
        if (disposed) {
          return
        }
      
        if (node.addEventListener) node.addEventListener(name, handler, options)
        else if (node.addListener) node.addListener(name, handler)
        else throw new Error('cannot add listener to node. No method found.')
    },
    fromPromise: promise => (start, sink) => {
        if (start !== 0) return
        let ended = false
        const onfulfilled = val => {
          if (ended) return
          sink(1, val)
          if (ended) return
          sink(2)
        }
        const onrejected = (err = new Error()) => {
          if (ended) return
          sink(2, err)
        }
        promise.then(onfulfilled, onrejected)
        sink(0, (t, d) => {
          if (t === 2) ended = true
        })
    },
    subject() {
        let sinks = []
        const subj = (t, d) => {
            if (t === 0) {
                const sink = d
                sinks.push(sink)
                sink(0, t => {
                    if (t === 2) {
                        const i = sinks.indexOf(sink)
                        if (i > -1) sinks.splice(i, 1)
                    }
            })
            } else {
                    const zinkz = sinks.slice(0)
                    for (let i = 0, n = zinkz.length, sink; i < n; i++) {
                        sink = zinkz[i]
                        if (sinks.indexOf(sink) > -1) sink(t, d)
                }
            }
        }
        subj.next = data => subj(1,data)
        subj.complete = () => subj(2)
        subj.error = err => subj(2,err)
        return subj
    },
    catchError: fn => source => (start, sink) => {
        if (start !== 0) return
        source(0, (t, d) => t === 2 && typeof d !== 'undefined' ? fn(d) : sink(t, d))
    },
    concatMap(_project) {
        const project = (...args) => jb.callbag.fromAny(_project(...args))
        return source => (start, sink) => {
          if (start !== 0) return
          const queue = []
          let innerTalkback = null
          let sourceTalkback
      
          const innerSink = (t, d) => {
            if (t === 0) {
              innerTalkback = d
              innerTalkback(1)
            } else if (t === 1) {
              sink(1, d)
              innerTalkback(1)
            } else if (t === 2) {
              innerTalkback = null
              if (queue.length === 0) return
              project(queue.shift())(0, innerSink)
            }
          }
      
          const wrappedSink = (t, d) => {
            if (t === 2 && innerTalkback !== null) innerTalkback(2, d)
            sourceTalkback(t, d)
          }
      
          source(0, (t, d) => {
            if (t === 0) {
              sourceTalkback = d
              sink(0, wrappedSink)
              return
            } else if (t === 1) {
              if (innerTalkback !== null) 
                queue.push(d) 
              else 
                project(d)(0, innerSink)
            } else if (t === 2) {
              sink(2, d)
              if (innerTalkback !== null) innerTalkback(2, d)
            }
          })
        }
    },
    create: prod => (start, sink) => {
        if (start !== 0) return
        if (typeof prod !== 'function') {
          sink(0, () => {})
          sink(2)
          return
        }
        let end = false
        let clean
        sink(0, (t) => {
          if (!end) {
            end = t === 2
            if (end && typeof clean === 'function') clean()
          }
        })
        if (end) return
        clean = prod((v) => {
          if (!end) sink(1, v)
        }, (e) => {
          if (!end && e !== undefined) {
            end = true
            sink(2, e)
          }
        }, () => {
          if (!end) {
            end = true
            sink(2)
          }
        })
    },
    debounceTime: duration => source => (start, sink) => {
        if (start !== 0) return
        let timeout
        source(0, (t, d) => {
          // every event clears the existing timeout, if any
          if (timeout) clearTimeout(timeout)
          if (t === 1) timeout = setTimeout(() => sink(1, d), typeof duration == 'function' ? duration() : duration)
          else sink(t, d)
        })
    },
    take: max => source => (start, sink) => {
        if (start !== 0) return
        let taken = 0
        let sourceTalkback
        let end
        function talkback(t, d) {
          if (t === 2) {
            end = true
            sourceTalkback(t, d)
          } else if (taken < max) sourceTalkback(t, d)
        }
        source(0, (t, d) => {
          if (t === 0) {
            sourceTalkback = d
            sink(0, talkback)
          } else if (t === 1) {
            if (taken < max) {
              taken++
              sink(t, d)
              if (taken === max && !end) {
                end = true
                sourceTalkback(2)
                sink(2)
              }
            }
          } else {
            sink(t, d)
          }
        })
    },
    last: (predicate = kTrue, resultSelector = identity) => source => (start, sink) => {
        if (start !== 0) return
        let talkback
        let lastVal
        let matched = false
        source(0, (t, d) => {
          if (t === 0) {
            talkback = d
            sink(t, d)
          } else if (t === 1) {
            if (predicate(d)) {
              lastVal = d
              matched = true
            }
            talkback(1)
          } else if (t === 2) {
            if (matched) sink(1, resultSelector(lastVal))
            sink(2)
          } else {
            sink(t, d)
          }
        })
    },
    subscribe: (listener = {}) => source => {
        if (typeof listener === "function") listener = { next: listener }
        let { next, error, complete } = listener
        let talkback
        source(0, (t, d) => {
          if (t === 0) talkback = d
          if (t === 1 && next) next(d)
          if (t === 1 || t === 0) talkback(1)  // Pull
          if (t === 2 && !d && complete) complete()
          if (t === 2 && !!d && error) error( d )
          if (t === 2 && listener.finally) listener.finally( d )
        })
        return () => talkback && talkback(2) // dispose
    },
    toPromise(source) {
        return new Promise((resolve, reject) => {
          jb.callbag.subscribe({
            next: resolve,
            error: reject,
            complete: () => {
              const err = new Error('No elements in sequence.')
              err.code = 'NO_ELEMENTS'
              reject(err)
            },
          })(jb.callbag.last(source))
        })
    },
    toPromiseArray(source) {
        const res = []
        let talkback
        return new Promise((resolve, reject) => {
                source(0, (t, d) => {
                    if (t === 0) talkback = d
                    if (t === 1) res.push(d)
                    if (t === 1 || t === 0) talkback(1)  // Pull
                    if (t === 2 && !d) resolve(res)
                    if (t === 2 && !!d) reject( d )
            })
        })
    },
    startWith: (...xs) => inputSource => (start, sink) => {
        if (start !== 0) return
        let disposed = false
        let inputTalkback
        let trackPull = false
        let lastPull
      
        sink(0, (t, d) => {
          if (trackPull && t === 1) {
            lastPull = [1, d]
          }
      
          if (t === 2) {
            disposed = true
            xs.length = 0
          }
      
          if (!inputTalkback) return
          inputTalkback(t, d)
        })
      
        while (xs.length !== 0) {
          if (xs.length === 1) {
            trackPull = true
          }
          sink(1, xs.shift())
        }
      
        if (disposed) return
      
        inputSource(0, (t, d) => {
          if (t === 0) {
            inputTalkback = d
            trackPull = false
      
            if (lastPull) {
              inputTalkback(...lastPull)
              lastPull = null
            }
            return
          }
          sink(t, d)
        })
    },
    delay: duration => source => (start, sink) => {
        if (start !== 0) return
        source(0,(t,d)=>{
            if (t !== 1) return sink(t,d)
            let id = setTimeout(()=> {
                clearTimeout(id)
                sink(1,d)
            },duration)
        })
    },
    skip: max => source => (start, sink) => {
        if (start !== 0) return;
        let skipped = 0;
        let talkback;
        source(0, (t, d) => {
          if (t === 0) {
            talkback = d;
            sink(t, d);
          } else if (t === 1) {
            if (skipped < max) {
              skipped++;
              talkback(1);
            } else sink(t, d);
          } else {
            sink(t, d);
          }
        });
    },    
    fromCallBag: source => source,
    fromAny: (source, name, options) => {
        const f = source && 'from' + (Object.prototype.toString.call(source) === "[object Promise]" ? 'Promise'
            : source.addEventListener ? 'Event'
            : typeof source[Symbol.iterator] === 'function' ? 'Iter'
            : '')
        if (jb.callbag[f]) 
            return jb.callbag[f](source, name, options)
        else if (jb.callbag.isCallbag(source))
            return source
        else
            return jb.callbag.fromIter([source])
    },
    isCallbag: source => source.toString().split('=>')[0].replace(/\s/g,'').match(/start,sink|t,d/)
}


})();

(function() {

// const sampleRef = {
//     $jb_obj: {}, // real object (or parent) val - may exist only in older version of the resource. may contain $jb_id for tracking
//     $jb_childProp: 'title', // used for primitive props
// }

const isProxy = Symbol.for("isProxy")
const originalVal = Symbol.for("originalVal")
const targetVal = Symbol.for("targetVal")
const jbId = Symbol("jbId")

class WatchableValueByRef {
  constructor(resources) {
    this.resources = resources
    this.objToPath = new Map()
    this.idCounter = 1
    this.opCounter = 1
    this.allowedTypes = [Object.getPrototypeOf({}),Object.getPrototypeOf([])]
    this.resourceChange = jb.callbag.subject()
    this.observables = []
    this.primitiveArraysDeltas = {}

    jb.ui.originalResources = jb.resources
    const resourcesObj = resources()
    resourcesObj[jbId] = this.idCounter++
    this.objToPath.set(resourcesObj[jbId],[])
    this.propagateResourceChangeToObservables()
  }
  doOp(ref,opOnRef,srcCtx) {
    try {
      const opVal = opOnRef.$set || opOnRef.$merge || opOnRef.$push || opOnRef.$splice;
      if (!this.isRef(ref))
        ref = this.asRef(ref);

      const path = this.removeLinksFromPath(this.pathOfRef(ref)), op = {}, oldVal = this.valOfPath(path);
      if (!path || ref.$jb_val) return;
      if (opOnRef.$set !== undefined && opOnRef.$set === oldVal) return;
      if (opOnRef.$push) opOnRef.$push = jb.asArray(opOnRef.$push)
      this.addJbId(path) // hash ancestors with jbId because the objects will be re-generated by redux
      jb.path(op,path,opOnRef) // create op as nested object
      const insertedIndex = jb.path(opOnRef.$splice,[0,2]) && jb.path(opOnRef.$splice,[0,0])
      const insertedPath = insertedIndex != null && path.concat(insertedIndex)
      const opEvent = {op: opOnRef, path: [...path], insertedPath, ref, srcCtx, oldVal, opVal, timeStamp: new Date().getTime(), opCounter: this.opCounter++}
      this.resources(jb.ui.update(this.resources(),op),opEvent)
      const newVal = (opVal != null && opVal[isProxy]) ? opVal : this.valOfPath(path);
      if (opOnRef.$push) {
        opOnRef.$push.forEach((toAdd,i)=>
          this.addObjToMap(toAdd,[...path,oldVal.length+i]))
        newVal[jbId] = oldVal[jbId]
        opEvent.path.push(oldVal.length)
        opEvent.ref = this.refOfPath(opEvent.path)
      } else if (opOnRef.$set === null && typeof oldVal === 'object') { // delete object should return the path that was deleted
        this.removeObjFromMap(oldVal)
        this.addObjToMap(newVal,path)
        opEvent.ref.$jb_path = () => path
      } else if (opOnRef.$splice) {
        opOnRef.$splice.forEach(ar=> {
          oldVal.slice(ar[0],ar[0]+ar[1]).forEach(toRemove=>this.removeObjFromMap(toRemove));
          jb.asArray(ar[2]).forEach(toAdd=>this.addObjToMap(toAdd,path.concat(newVal.indexOf(toAdd))))
        })
        this.fixSplicedPaths(path,opOnRef.$splice)
      } else {
          // TODO: make is more effecient in case of $merge
          this.removeObjFromMap(oldVal)
          this.addObjToMap(newVal,path)
      }
      if (opOnRef.$splice) {
        this.primitiveArraysDeltas[ref.$jb_obj[jbId]] = this.primitiveArraysDeltas[ref.$jb_obj[jbId]] || []
        this.primitiveArraysDeltas[ref.$jb_obj[jbId]].push(opOnRef.$splice)
      }
      opEvent.newVal = newVal;
      jb.log('doOp',[opEvent,...arguments]);
      // TODO: split splice event to delete, push, and insert
      if (this.transactionEventsLog)
        this.transactionEventsLog.push(opEvent)
      else
        this.resourceChange.next(opEvent);
      return opEvent;
    } catch(e) {
      jb.logException(e,'doOp',srcCtx,...arguments)
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
      if (val && typeof val === 'object' && !val[jbId]) {
          val[jbId] = this.idCounter++
          this.addObjToMap(val,innerPath)
      }
    }
  }
  addObjToMap(top,path) {
    if (!top || top[isProxy] || top.$jb_val || typeof top !== 'object' || this.allowedTypes.indexOf(Object.getPrototypeOf(top)) == -1) return
    if (top[jbId]) {
        this.objToPath.set(top[jbId],path)
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
    if (top[jbId] && isInner)
        this.objToPath.delete(top[jbId])
    Object.keys(top).filter(key=>key=>typeof top[key] === 'object' && key.indexOf('$jb_') != 0).forEach(key => this.removeObjFromMap(top[key],true))
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
      return oldIndex + spliceOp.reduce((delta,ar) => (oldIndex < ar[0]) ? 0 : jb.asArray(ar[2]).length - ar[1],0)
    }
  }
  pathOfRef(ref) {
    if (ref.$jb_path)
      return ref.$jb_path()
    const path = this.isRef(ref) && (this.objToPath.get(ref.$jb_obj) || this.objToPath.get(ref.$jb_obj[jbId]))
    if (path && ref.$jb_childProp !== undefined) {
        this.refreshPrimitiveArrayRef(ref)
        return [...path, ref.$jb_childProp]
    }
    return path
  }
  urlOfRef(ref) {
    const path = this.pathOfRef(ref)
    this.addJbId(path)
    const byId = [ref.$jb_obj[jbId],ref.$jb_childProp].filter(x=>x != null).map(x=>(''+x).replace(/~|;|,/g,'')).join('~')
    const byPath = path.map(x=>(''+x).replace(/~|;|,/g,'')).join('~')
    return `${this.resources.id}://${byId};${byPath}`
  }
  refOfUrl(url) {
    const path = url.split(';')[0].split('~')
    return { handler: this, $jb_obj: {[jbId]: +path[0] }, ...path[1] ? {$jb_childProp: path[1]} : {} }
  }
  asRef(obj, silent) {
    if (this.isRef(obj))
      return obj
    if (!obj || typeof obj !== 'object') return obj;
    const actualObj = obj[isProxy] ? obj[targetVal] : obj
    const path = this.objToPath.get(actualObj) || this.objToPath.get(actualObj[jbId])
    if (path)
        return { $jb_obj: this.valOfPath(path), handler: this, path: function() { return this.handler.pathOfRef(this)} }
    if (!silent)
      jb.logError('asRef can not make a watchable ref of obj',obj)
    return null;
  }
  valOfPath(path) {
    return path.reduce((o,p)=>this.noProxy(o && o[p]),this.resources())
  }
  noProxy(val) {
    return (val && val[isProxy] && val[originalVal]) || val
  }
  hasLinksInPath(path) {
    let val = this.resources()
    for(let i=0;i<path.length;i++) {
      if (val && val[isProxy])
        return true
      val = val && val[path[i]]
    }
  }
  removeLinksFromPath(path) {
    if (!Array.isArray(path)) return
    if (!this.hasLinksInPath(path))
      return path
    return path.reduce(({val,path} ,p) => {
      const proxy = (val && val[isProxy])
      const inner =  proxy ? val[originalVal] : val
      const newPath = proxy ? (this.objToPath.get(inner) || this.objToPath.get(inner[jbId])) : path
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
    return this.resources() === val || this.objToPath.get(val) || (val && this.objToPath.get(val[jbId]))
  }
  isRef(ref) {
    return ref && ref.$jb_obj && this.watchable(ref.$jb_obj);
  }
  objectProperty(obj,prop,ctx) {
    jb.log('objectProperty',[...arguments]);
    if (!obj)
      return jb.logError('objectProperty: null obj',ctx);
    var ref = this.asRef(obj);
    if (ref && ref.$jb_obj) {
      const ret = {$jb_obj: ref.$jb_obj, $jb_childProp: prop, handler: this, path: function() { return this.handler.pathOfRef(this)}}
      if (this.isPrimitiveArray(ref.$jb_obj)) {
        ret.$jb_delta_version = (this.primitiveArraysDeltas[ref.$jb_obj[jbId]] || []).length
        ret.$jb_childProp = +prop
      }
      return ret
    } else {
      return obj[prop]; // not reffable
    }
  }
  writeValue(ref,value,srcCtx) {
    if (!ref || !this.isRef(ref) || !this.pathOfRef(ref))
      return jb.logError('writeValue: err in ref', srcCtx, ref, value);

    jb.log('writeValue',['watchable',this.asStr(ref),value,ref,srcCtx]);
    if (ref.$jb_val)
      return ref.$jb_val(value);
    if (this.val(ref) === value) return;
    return this.doOp(ref,{$set: this.createSecondaryLink(value)},srcCtx)
  }
  createSecondaryLink(val) {
    if (val && typeof val === 'object' && !val[isProxy]) {
      const ref = this.asRef(val,true);
      if (ref && ref.$jb_obj)
        return new Proxy(val, {
          get: (o,p) => (p === targetVal) ? o : (p === isProxy) ? true : (p === originalVal ? val : (jb.val(this.asRef(val)))[p]),
          set: (o,p,v) => o[p] = v
        })
    }
    return val;
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
        return jb.logError('move: not array element',srcCtx,fromRef,toRef);

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
    const arrayId = ref.$jb_obj[jbId]
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
  getOrCreateObservable(req) {
      const subject = jb.callbag.subject()
      req.srcCtx = req.srcCtx || { path: ''}
      const ctx = req.cmpOrElem.ctx || jb.ui.ctxOfElem(req.cmpOrElem)
      const key = this.pathOfRef(req.ref).join('~') + ' : ' + ctx.path
      const recycleCounter = req.cmpOrElem.getAttribute && +(req.cmpOrElem.getAttribute('recycleCounter') || 0)
      const obs = { ...req, subject, key, recycleCounter, ctx }

      this.observables.push(obs);
      this.observables.sort((e1,e2) => jb.ui.comparePaths(e1.ctx.path, e2.ctx.path))
      jb.log('registerCmpObservable',[obs])
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
        const isOld = obs.cmpOrElem.NodeType && (+obs.cmpOrElem.getAttribute('recycleCounter')) > obs.recycleCounter
        if (obs.cmpOrElem._destroyed || isOld) {
          if (this.observables.indexOf(obs) != -1) {
            jb.log('removeCmpObservable',[obs])
            this.observables.splice(this.observables.indexOf(obs), 1);
          }
        } else {
          this.notifyOneObserver(e,obs,changed_path)
        }
      })
    })
  }

  notifyOneObserver(e,obs,changed_path) {
      let obsPath = jb.refHandler(obs.ref).pathOfRef(obs.ref)
      obsPath = obsPath && this.removeLinksFromPath(obsPath)
      if (!obsPath)
        return jb.logError('observer ref path is empty',obs,e)
      const diff = jb.ui.comparePaths(changed_path, obsPath)
      const isChildOfChange = diff == 1
      const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
      const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
      if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure) {
          jb.log('notifyCmpObservable',['notify change',e.srcCtx,obs,e])
          obs.subject.next(e)
      }
  }

  dispose() {
    this.resourceChange.complete()
  }
}

// 0- equals, -1,1 means contains -2,2 lexical
jb.ui.comparePaths = function(path1,path2) {
    path1 = path1 || ''
    path2 = path2 || ''
    let i=0;
    while(path1[i] === path2[i] && i < path1.length) i++;
    if (i == path1.length && i == path2.length) return 0;
    if (i == path1.length && i < path2.length) return -1;
    if (i == path2.length && i < path1.length) return 1;
    return path1[i] < path2[i] ? -2 : 2
}

function resourcesRef(val) {
  if (typeof val == 'undefined')
    return jb.resources;
  else
    jb.resources = val;
}
resourcesRef.id = 'resources'

jb.setMainWatchableHandler(new WatchableValueByRef(resourcesRef));
jb.rebuildRefHandler = () => {
  jb.mainWatchableHandler && jb.mainWatchableHandler.dispose()
  jb.setMainWatchableHandler(new WatchableValueByRef(resourcesRef))
}
jb.isWatchable = ref => jb.refHandler(ref) instanceof WatchableValueByRef || ref && ref.$jb_observable

jb.ui.refObservable = (ref,cmpOrElem,settings={}) => {
  if (ref && ref.$jb_observable)
    return ref.$jb_observable(cmpOrElem);
  if (!jb.isWatchable(ref)) {
    jb.logError('ref is not watchable', ref)
    return jb.callbag.fromIter([])
  }
  return jb.refHandler(ref).getOrCreateObservable({ref,cmpOrElem,...settings})
  //jb.refHandler(ref).refObservable(ref,cmpOrElem,settings);
}

jb.ui.extraWatchableHandler = (resources,oldHandler) => {
  const res = jb.extraWatchableHandler(new WatchableValueByRef(resources),oldHandler)
  jb.ui.subscribeToRefChange(res)
  return res
}

jb.ui.resourceChange = () => jb.mainWatchableHandler.resourceChange;

jb.component('runTransaction', {
  type: 'action',
  params: [
    {id: 'actions', type: 'action[]', ignore: true, composite: true, mandatory: true},
    {id: 'disableNotifications', as: 'boolean', type: 'boolean'}
  ],
  impl: ctx => {
		const actions = jb.asArray(ctx.profile.actions || ctx.profile['$runActions'] || []).filter(x=>x);
		const innerPath =  (ctx.profile.actions && ctx.profile.actions.sugar) ? ''
			: (ctx.profile['$runActions'] ? '$runActions~' : 'items~');
    jb.mainWatchableHandler.startTransaction()
    return actions.reduce((def,action,index) =>
				def.then(_ => ctx.runInner(action, { as: 'single'}, innerPath + index )) ,Promise.resolve())
			.catch((e) => jb.logException(e,ctx))
      .then(() => jb.mainWatchableHandler.endTransaction(ctx.params.disableNotifications))

		// jb.mainWatchableHandler.startTransaction()
		// return ctx.profile.actions.reduce((def,action,index) =>
		// 		def.then(_ => ctx.runInner(action, { as: 'single'}, innerPath + index )) ,Promise.resolve())
		// 	.catch(e => jb.logException(e,ctx))
		// 	.then(() => jb.mainWatchableHandler.endTransaction(disableNotifications))
	}
})

})()
;

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

Object.assign(jb.ui, {VNode, cloneVNode, toVdomOrStr});

(function(){
const ui = jb.ui;
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,this.ctx) }}

function h(cmpOrTag,attributes,children) {
    if (cmpOrTag instanceof ui.VNode) return cmpOrTag // Vdom
    if (cmpOrTag && cmpOrTag.renderVdom)
        return cmpOrTag.renderVdom()
   
    return new jb.ui.VNode(cmpOrTag,attributes,children)
}

function compareVdom(b,a) {
    const attributes = jb.objectDiff(a.attributes || {}, b.attributes || {})
    if (attributes.style == undefined) delete attributes.style // do not delete style attributes defined by interactive
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
        jb.log('childDiff',[...arguments])
        const beforeWithIndex = b.map((e,i)=> ({i, ...e}))
        let remainingBefore = beforeWithIndex.slice(0)
        // locating before-objects in after-array. done in two stages. also calcualing the remaining before objects that were not found
        const afterToBeforeMap = a.map(toLocate => locateVdom(toLocate,remainingBefore))
        a.forEach((toLocate,i) => afterToBeforeMap[i] = afterToBeforeMap[i] || sameIndexSameTag(toLocate,i,remainingBefore))

        const reused = []
        const res = { length: beforeWithIndex.length }
        beforeWithIndex.forEach( (e,i) => {
            const __afterIndex = afterToBeforeMap.indexOf(e);
            if (__afterIndex == -1) {
                res [i] =  {$: 'delete', __afterIndex }
            } else {
                reused[__afterIndex] = true
                res [i] = { __afterIndex, ...compareVdom(e, a[__afterIndex]), ...(e.$remount ? {remount: true}: {}) }
            }
        })
        res.toAppend = a.flatMap((e,i) => reused[i] ? [] : [{...compareVdom({},e), __afterIndex: i}])
        jb.log('childDiffRes',[res,...arguments])
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

function filterDelta(delta) {
    const doFilter = dlt => ({
        attributes: jb.objFromEntries(jb.entries(dlt.attributes)
            .filter(e=> ['jb-ctx','cmp-id','originators','__afterIndex','mount-ctx','interactive'].indexOf(e[0]) == -1)),
        children: dlt.children
    })
    return doFilter(delta)
}

function sameSource(vdomBefore,vdomAfter) {
    if (vdomBefore.cmp && vdomBefore.cmp === vdomAfter.cmp) return true
    const atts1 = vdomBefore.attributes || {}, atts2 = vdomAfter.attributes || {}
    if (atts1.cmpId && atts1.cmpId === atts2.cmpId || atts1.ctxId && atts1.ctxId === atts2.ctxId) return true
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

// dom related functions

function applyVdomDiff(elem,vdomAfter,{strongRefresh, ctx} = {}) {
    jb.log('applyDeltaTop',['start',...arguments])
    const vdomBefore = elem instanceof ui.VNode ? elem : elemToVdom(elem)
    const delta = compareVdom(vdomBefore,vdomAfter)
    if (elem instanceof ui.VNode) { // runs on worker
        const cmpId = elem.getAttribute('cmp-id'), elemId = elem.getAttribute('id')
        if (elem != vdomAfter) { // update the elem
            Object.keys(elem).forEach(k=>delete elem[k])
            Object.assign(elem,vdomAfter)
        }
        return jb.ui.updateRenderer(delta,elemId,cmpId,ctx && ctx.vars.widgetId) // deligate to the main thread 
    }
    const active = jb.ui.activeElement() === elem
    jb.log('applyDeltaTop',['apply',vdomBefore,vdomAfter,delta,active,...arguments],
        {modifier: record => record.push(filterDelta(delta)) })
    if (delta.tag || strongRefresh) {
        unmount(elem)
        const newElem = render(vdomAfter,elem.parentElement)
        elem.parentElement.replaceChild(newElem,elem)
        jb.log('replaceTop',[newElem,elem,delta])
        elem = newElem
    } else {
        applyDeltaToDom(elem,delta)
    }
    ui.findIncludeSelf(elem,'[interactive]').forEach(el=> 
        el._component ? el._component.recalcPropsFromElem() : mountInteractive(el))
    if (active) jb.ui.focus(elem,'apply Vdom diff',ctx)
    ui.garbageCollectCtxDictionary(elem)
}

function elemToVdom(elem) {
    return {
        tag: elem.tagName.toLowerCase(),
        attributes: jb.objFromEntries([
            ...Array.from(elem.attributes).map(e=>[e.name,e.value]), 
            ...(jb.path(elem,'firstChild.nodeName') == '#text' ? [['$text',elem.firstChild.nodeValue]] : [])
        ]),
        ...( elem.childElementCount && !elem.getAttribute('jb_external') 
            ? { children: Array.from(elem.children).map(el=> elemToVdom(el)) } : {})
    }
}

function appendItems(elem, vdomToAppend,ctx) { // used in infinite scroll
    if (elem instanceof ui.VNode) { // runs on worker
        const cmpId = elem.getAttribute('cmp-id'), elemId = elem.getAttribute('id')
        // TODO: update the elem
        return jb.ui.updateRenderer(vdomToAppend,elemId,cmpId,ctx && ctx.vars.widgetId) // deligate to the main thread 
    }
    (vdomToAppend.children ||[]).forEach(vdom => render(vdom,elem))
}

function applyDeltaToDom(elem,delta) {
    jb.log('applyDelta',[...arguments])
    const children = delta.children
    if (delta.children) {
        const childrenArr = delta.children.length ? Array.from(Array(delta.children.length).keys()).map(i=>children[i]) : []
        const childElems = Array.from(elem.children), toAppend = delta.children.toAppend || []
        const sameOrder = childrenArr.reduce((acc,e,i) => acc && e.__afterIndex ==i, true) && !toAppend.length
            || !childrenArr.length && toAppend.reduce((acc,e,i) => acc && e.__afterIndex ==i, true)
        childrenArr.forEach((e,i) => {
            if (e.$ == 'delete') {
                unmount(childElems[i])
                elem.removeChild(childElems[i])
                jb.log('removeChild',[childElems[i],e,elem,delta])
            } else {
                applyDeltaToDom(childElems[i],e)
                !sameOrder && (childElems[i].setAttribute('__afterIndex',e.__afterIndex))
            }
        })
        toAppend.forEach(e=>{
            const newChild = createElement(elem.ownerDocument,e.tag)
            elem.appendChild(newChild)
            applyDeltaToDom(newChild,e)
            jb.log('appendChild',[newChild,e,elem,delta])
            !sameOrder && (newChild.setAttribute('__afterIndex',e.__afterIndex))
        })
        if (!sameOrder) {
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
                    jb.log('removeChild',['remove leftover',ch,elem,delta])
                })
    }
    jb.entries(delta.attributes)
        .filter(e=> !(e[0] === '$text' && elem.firstElementChild) ) // elem with $text should not have children
        .forEach(e=> setAtt(elem,e[0],e[1]))
}

function setAtt(elem,att,val) {
    if (att[0] !== '$' && val == null) {
        elem.removeAttribute(att)
        jb.log('htmlChange',['remove',...arguments])
    } else if (att === 'checked' && elem.tagName.toLowerCase() === 'input') {
        elem.checked = !!val
        jb.log('htmlChange',['checked',...arguments])
    } else if (att === '$text') {
        elem.innerText = val || ''
        jb.log('htmlChange',['text',...arguments])
    } else if (att === '$html') {
        elem.innerHTML = val || ''
        jb.log('htmlChange',['html',...arguments])
    } else if (att === 'style' && typeof val === 'object') {
        elem.setAttribute(att,jb.entries(val).map(e=>`${e[0]}:${e[1]}`).join(';'))
        jb.log('htmlChange',['setAtt',...arguments])
    } else if (att == 'value' && elem.tagName.match(/select|input|textarea/i) ) {
        const active = document.activeElement === elem
        if (elem.value == val) return
        elem.value = val
        if (active)
            elem.focus()
        jb.log('htmlChange',['setAtt',...arguments])
    } else {
        elem.setAttribute(att,val)
        jb.log('htmlChange',['setAtt',...arguments])
    }
}

function unmount(elem) {
    jb.log('unmount',[...arguments]);
    if (!elem || !elem.setAttribute) return
    jb.ui.findIncludeSelf(elem,'[interactive]').forEach(el=> el._component && el._component.destroy())
}

function render(vdom,parentElem) {
    jb.log('render',[...arguments])
    function doRender(vdom,parentElem) {
        jb.log('htmlChange',['createElement',...arguments])
        const elem = createElement(parentElem.ownerDocument, vdom.tag)
        jb.entries(vdom.attributes).forEach(e=>setAtt(elem,e[0],e[1])) // filter(e=>e[0].indexOf('on') != 0 && !isAttUndefined(e[0],vdom.attributes)).
        jb.asArray(vdom.children).map(child=> doRender(child,elem)).forEach(el=>elem.appendChild(el))
        parentElem.appendChild(elem)
        return elem
    }
    const res = doRender(vdom,parentElem)
    ui.findIncludeSelf(res,'[interactive]').forEach(el=> mountInteractive(el))
    ui.garbageCollectCtxDictionary(parentElem)
    return res
}

function createElement(parent,tag) {
    tag = tag || 'div'
    return (['svg','circle','ellipse','image','line','mesh','path','polygon','polyline','rect','text'].indexOf(tag) != -1) ?
        parent.createElementNS("http://www.w3.org/2000/svg", tag) : parent.createElement(tag)
}

Object.assign(jb.ui, {
    h, render, unmount, applyVdomDiff, applyDeltaToDom, elemToVdom, mountInteractive, compareVdom, appendItems,
    handleCmpEvent(specificHandler, ev) {
        ev = typeof event != 'undefined' ? event : ev
        const el = jb.ui.parents(ev.currentTarget,{includeSelf: true}).find(el=> el.getAttribute && el.getAttribute('jb-ctx') != null)
        if (!el) return
        if (ev.type == 'scroll') // needs to be here to support the worker scenario
            ev.scrollPercentFromTop = ev.scrollPercentFromTop || (el.scrollTop + jb.ui.offset(el).height)/ el.scrollHeight;

        if (el.getAttribute('worker')) { // forward the event to the worker
            return jb.ui.workers[el.getAttribute('worker')].handleBrowserEvent(el,ev,specificHandler)
        }
        const cmp = el._component
        const action = specificHandler ? specificHandler : `on${ev.type}Handler`
        return (cmp && cmp[action]) ? cmp[action](ev) : ui.runActionOfElem(el,action,ev)
    },
    runActionOfElem(elem,action,ev) {
        if (elem.getAttribute('contenteditable')) return
        ev = typeof event != 'undefined' ? event : ev
        const ctxToRun = (elem.getAttribute('handlers') || '').split(',').filter(x=>x.indexOf(action+'-') == 0)
            .map(str=>jb.ui.ctxDictOfElem(elem)[str.split('-')[1]])
            .filter(x=>x)
            .map(ctx=> ctx.setVar('cmp',elem._component).setVars({ev}))[0]

        return ctxToRun && ctxToRun.runInner(ctxToRun.profile.action,'action','action')
    },
    ctrl(context,options) {
        const $state = context.vars.$refreshElemCall ? context.vars.$state : {}
        const ctx = context.setVars({ $model: { ctx: context, ...context.params} , $state, $refreshElemCall : undefined })
        const styleOptions = defaultStyle(ctx) || {}
        if (styleOptions instanceof ui.JbComponent)  {// style by control
            return styleOptions.orig(ctx).jbExtend(options,ctx).applyParamFeatures(ctx)
        }
        return new ui.JbComponent(ctx).jbExtend(options,ctx).jbExtend(styleOptions,ctx).applyParamFeatures(ctx)
    
        function defaultStyle(ctx) {
            const profile = context.profile
            const defaultVar = '$theme.' + (profile.$ || '')
            if (!profile.style && context.vars[defaultVar])
                return ctx.run({$:context.vars[defaultVar]})
            return context.params.style ? context.params.style(ctx) : {}
        }
    },
    garbageCollectCtxDictionary(elem,force) {
        if (!elem.ownerDocument.contains(elem)) return // tests

        const now = new Date().getTime()
        ui.ctxDictionaryLastCleanUp = ui.ctxDictionaryLastCleanUp || now
        const timeSinceLastCleanUp = now - ui.ctxDictionaryLastCleanUp
        if (!force && timeSinceLastCleanUp < 10000) return
        ui.ctxDictionaryLastCleanUp = now
    
        const used = 'jb-ctx,mount-ctx,pick-ctx,props-ctx,handlers,interactive,originators'.split(',')
            .flatMap(att=>Array.from(document.querySelectorAll(`[${att}]`))
                .flatMap(el => el.getAttribute(att).split(',').map(x=>Number(x.split('-').pop()))))
                    .sort((x,y)=>x-y);

        // remove unused ctx from dictionary
        const dict = Object.keys(jb.ctxDictionary).map(x=>Number(x)).sort((x,y)=>x-y);
        let lastUsedIndex = 0;
        const removedCtxs = [], removedResources = []
        for(let i=0;i<dict.length;i++) {
            while (used[lastUsedIndex] < dict[i])
                lastUsedIndex++;
            if (used[lastUsedIndex] != dict[i]) {
                removedCtxs.push(i)
                delete jb.ctxDictionary[''+dict[i]]
            }
        }
        // remove unused vars from resources
        const ctxToPath = ctx => Object.values(ctx.vars).filter(v=>jb.isWatchable(v)).map(v => jb.asRef(v))
            .map(ref=>jb.refHandler(ref).pathOfRef(ref)).flat()
        const globalVarsUsed = jb.unique(used.map(x=>jb.ctxDictionary[''+x]).filter(x=>x).map(ctx=>ctxToPath(ctx)).flat())
        Object.keys(jb.resources).filter(id=>id.indexOf(':') != -1)
            .filter(id=>globalVarsUsed.indexOf(id) == -1)
            .forEach(id => { removedResources.push(id); delete jb.resources[id]})

        jb.log('garbageCollect',[removedCtxs,removedResources])
    },

    refreshElem(elem, state, options) {
        if (jb.path(elem,'_component.status') == 'initializing') 
            return jb.logError('circular refresh',[...arguments]);
        const _ctx = ui.ctxOfElem(elem)
        if (!_ctx) 
            return jb.logError('refreshElem - no ctx for elem',elem)
        const strongRefresh = jb.path(options,'strongRefresh')
        let ctx = _ctx.setVar('$state', strongRefresh ? {} : state || {}) // strongRefresh kills state
        if (options && options.extendCtx)
            ctx = options.extendCtx(ctx)
        ctx = ctx.setVar('$refreshElemCall',true)
        if (jb.ui.inStudio()) // updating to latest version of profile
            ctx.profile = jb.execInStudio({$: 'studio.val', path: ctx.path})
        const cmp = ctx.profile.$ == 'openDialog' ? jb.ui.dialogs.buildComp(ctx) : ctx.runItself()
        jb.log('refreshElem',[ctx,cmp, ...arguments]);

        if (jb.path(options,'cssOnly')) {
            const existingClass = (elem.className.match(/(w|jb-)[0-9]+/)||[''])[0]
            const cssStyleElem = Array.from(document.querySelectorAll('style')).map(el=>({el,txt: el.innerText})).filter(x=>x.txt.indexOf(existingClass + ' ') != -1)[0].el
            jb.log('refreshElem',['hashCss',cmp.cssLines,ctx,cmp, ...arguments]);
            return jb.ui.hashCss(cmp.cssLines,cmp.ctx,{existingClass, cssStyleElem})
        }
        const hash = cmp.init()
        if (hash != null && hash == elem.getAttribute('cmpHash'))
            return jb.log('refreshElem',['stopped by hash', hash, ...arguments]);
        cmp && applyVdomDiff(elem, h(cmp), {strongRefresh, ctx})
        //jb.execInStudio({ $: 'animate.refreshElem', elem: () => elem })
    },

    subscribeToRefChange: watchHandler => jb.subscribe(watchHandler.resourceChange, e=> {
        const changed_path = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(e.ref))
        if (!changed_path) debugger
        //observe="resources://2~name;person~name
        const findIn = jb.path(e,'srcCtx.vars.widgetId') || jb.path(e,'srcCtx.vars.elemToTest') ? e.srcCtx : jb.frame.document
        const elemsToCheck = jb.ui.find(findIn,'[observe]')
        const elemsToCheckCtxBefore = elemsToCheck.map(el=>el.getAttribute('jb-ctx'))
        jb.log('notifyObservableElems',['elemsToCheck',elemsToCheck,e])
        elemsToCheck.forEach((elem,i) => {
            //.map((elem,i) => ({elem,i, phase: phaseOfElem(elem,i) })).sort((x1,x2)=>x1.phase-x2.phase).forEach(({elem,i}) => {
            if (elemsToCheckCtxBefore[i] != elem.getAttribute('jb-ctx')) return // the elem was already refreshed during this process, probably by its parent
            let refresh = false, strongRefresh = false, cssOnly = true
            elem.getAttribute('observe').split(',').map(obsStr=>observerFromStr(obsStr,elem)).filter(x=>x).forEach(obs=>{
                if (!obs.allowSelfRefresh && elem == jb.path(e.srcCtx, 'vars.cmp.base')) 
                    return jb.log('notifyObservableElems',['blocking self refresh', elem, obs,e])
                const obsPath = watchHandler.removeLinksFromPath(watchHandler.pathOfRef(obs.ref))
                if (!obsPath)
                    return jb.logError('observer ref path is empty',obs,e)
                strongRefresh = strongRefresh || obs.strongRefresh
                cssOnly = cssOnly && obs.cssOnly
                const diff = ui.comparePaths(changed_path, obsPath)
                const isChildOfChange = diff == 1
                const includeChildrenYes = isChildOfChange && (obs.includeChildren === 'yes' || obs.includeChildren === true)
                const includeChildrenStructure = isChildOfChange && obs.includeChildren === 'structure' && (typeof e.oldVal == 'object' || typeof e.newVal == 'object')
                if (diff == -1 || diff == 0 || includeChildrenYes || includeChildrenStructure) {
                    jb.log('notifyObservableElem',['notify refresh',elem,e.srcCtx,obs,e])
                    refresh = true
                }
            })
            refresh && ui.refreshElem(elem,null,{srcCtx: e.srcCtx, strongRefresh, cssOnly})
        })

        function phaseOfElem(el,i) {
            return +((el.getAttribute('observe').match(/phase=([0-9]+)/) || ['',0])[1])*1000 + i
        }

        function observerFromStr(obsStr) {
            const parts = obsStr.split('://')
            const innerParts = parts[1].split(';')
            const includeChildren = ((innerParts[2] ||'').match(/includeChildren=([a-z]+)/) || ['',''])[1]
            const strongRefresh = innerParts.indexOf('strongRefresh') != -1
            const cssOnly = innerParts.indexOf('cssOnly') != -1
            const allowSelfRefresh = innerParts.indexOf('allowSelfRefresh') != -1
            
            return parts[0] == watchHandler.resources.id && 
                { ref: watchHandler.refOfUrl(innerParts[0]), includeChildren, strongRefresh, cssOnly, allowSelfRefresh }
        }
    }),
})

ui.subscribeToRefChange(jb.mainWatchableHandler)

function mountInteractive(elem, keepState) {
    const ctx = jb.ui.ctxOfElem(elem,'mount-ctx')
    if (!ctx)
        return jb.logError('no ctx for elem',[elem])
    const cmp = (ctx.profile.$ == 'openDialog') ? jb.ui.dialogs.buildComp(ctx) : ctx.runItself();
    const mountedCmp = {
        state: { ...(keepState && jb.path(elem._component,'state')) },
        base: elem,
        refresh(state, options) {
            jb.log('refreshReq',[...arguments])
            if (this._deleted) return
            Object.assign(this.state, state)
            ui.refreshElem(elem,{...this.state, ...state},options)
            ;(this.componentDidUpdateFuncs||[]).forEach(f=> tryWrapper(() => f(this), 'componentDidUpdate'))
        },
        destroy() {
            this._deleted = true
            this.resolveDestroyed() // notifications to takeUntil(this.destroyed) observers
            ;(cmp.destroyFuncs||[]).forEach(f=> tryWrapper(() => f(this), 'destroy'));
        },
        status: 'initializing',
        recalcPropsFromElem() {
            if (elem.getAttribute('worker')) return
            this.ctx = jb.ui.ctxOfElem(elem,'mount-ctx').setVar('cmp',this)
            this.cmpId = elem.getAttribute('cmp-id')
            ;(elem.getAttribute('interactive') || '').split(',').filter(x=>x).forEach(op => {
                [id, ctxId] = op.split('-')
                const ctx = jb.ui.ctxDictOfElem(elem)[ctxId]
                this[id] = jb.val(ctx.setVar('state',this.state).setVar('cmp',this).runInner(ctx.profile.value,'value','value'))
            })
            this.doRefresh && this.doRefresh()
        },
        componentDidUpdateFuncs: cmp.componentDidUpdateFuncs
    }
    mountedCmp.destroyed = new Promise(resolve=>mountedCmp.resolveDestroyed = resolve)
    elem._component = mountedCmp
    mountedCmp.recalcPropsFromElem()

    jb.unique(cmp.eventObservables||[])
        .forEach(op => mountedCmp[op] = jb.ui.fromEvent(mountedCmp,op.slice(2),elem))

    ;(cmp.componentDidMountFuncs||[]).forEach(f=> tryWrapper(() => f(mountedCmp), 'componentDidMount'))
    mountedCmp.status = 'ready'
}

})();

(function(){
const ui = jb.ui
let cmpId = 0;
ui.propCounter = 0
const tryWrapper = (f,msg) => { try { return f() } catch(e) { jb.logException(e,msg,this.ctx) }}
const lifeCycle = new Set('init,componentDidMount,componentWillUpdate,componentDidUpdate,destroy,extendCtx,templateModifier,extendItem'.split(','))
const arrayProps = new Set('enrichField,icon,watchAndCalcModelProp,cssLines,defHandler,interactiveProp,calcProp'.split(','))
const singular = new Set('template,calcRenderProps,toolbar,styleParams,calcHash,ctxForPick'.split(','))

Object.assign(jb.ui,{
    cssHashCounter: 0,
    cssHashMap: {},
    hashCss(_cssLines,ctx,{existingClass, cssStyleElem} = {}) {
        const cssLines = (_cssLines||[]).filter(x=>x)
        const cssKey = cssLines.join('\n')
        if (!cssKey) return ''

        const workerId = jb.frame.workerId && jb.frame.workerId(ctx)
        const classPrefix = workerId ? 'w'+ workerId : 'jb-'

        if (!this.cssHashMap[cssKey]) {
            if (existingClass) {
                const existingKey = Object.keys(this.cssHashMap).filter(k=>this.cssHashMap[k].classId == existingClass)[0]
                existingKey && delete this.cssHashMap[existingKey]
            } else {
                this.cssHashCounter++;
            }
            const classId = existingClass || `${classPrefix}${this.cssHashCounter}`
            this.cssHashMap[cssKey] = {classId, paths : {[ctx.path]: true}}
            const cssContent = linesToCssStyle(classId)
            if (cssStyleElem)
                cssStyleElem.innerText = cssContent
            else
                ui.addStyleElem(cssContent,workerId)
        }
        Object.assign(this.cssHashMap[cssKey].paths, {[ctx.path] : true})
        return this.cssHashMap[cssKey].classId

        function linesToCssStyle(classId) {
            const cssStyle = cssLines.map(selectorPlusExp=>{
                const selector = selectorPlusExp.split('{')[0];
                const fixed_selector = selector.split(',').map(x=>x.trim().replace('|>',' '))
                    .map(x=>x.indexOf('~') == -1 ? `.${classId}${x}` : x.replace('~',`.${classId}`));
                return fixed_selector + ' { ' + selectorPlusExp.split('{')[1];
            }).join('\n');
            const remark = `/*style: ${ctx.profile.style && ctx.profile.style.$}, path: ${ctx.path}*/\n`;
            return remark + cssStyle
        }
    },
})

class JbComponent {
    constructor(ctx) {
        this.ctx = ctx // used to calc features
        this.cmpId = cmpId++
        this.eventObservables = []
        this.cssLines = []
        this.contexts = []
        this.originators = [ctx]
    }
    init() {
        jb.log('initCmp',[this]);
        this.ctx = (this.extendCtxFuncs||[])
            .reduce((acc,extendCtx) => tryWrapper(() => extendCtx(acc,this),'extendCtx'), this.ctx.setVar('cmpId',this.cmpId))
        this.renderProps = {}
        this.state = this.ctx.vars.$state
        this.calcCtx = this.ctx.setVar('$props',this.renderProps).setVar('cmp',this)

        this.renderProps.cmpHash = this.calcHash && tryWrapper(() => this.calcHash(this.calcCtx))
        this.initialized = true
        return this.renderProps.cmpHash
    }
 
    calcRenderProps() {
        jb.log('renderVdom',[this]);
        if (!this.initialized)
            this.init();
        (this.initFuncs||[]).sort((p1,p2) => p1.phase - p2.phase)
            .forEach(f =>  tryWrapper(() => f.action(this.calcCtx), 'init'));
   
        this.toObserve = this.watchRef ? this.watchRef.map(obs=>({...obs,ref: obs.refF(this.ctx)})).filter(obs=>jb.isWatchable(obs.ref)) : []
        this.watchAndCalcModelProp && this.watchAndCalcModelProp.forEach(e=>{
            const modelProp = this.ctx.vars.$model[e.prop]
            if (!modelProp)
                return jb.logError('calcRenderProps',`missing model prop "${e.prop}"`,this.ctx.vars.$model,this.ctx)
            const ref = modelProp(this.ctx)
            if (jb.isWatchable(ref))
                this.toObserve.push({id: e.prop, cmp: this, ref,...e})
            const val = jb.val(ref)
            this.renderProps[e.prop] = e.transformValue(this.ctx.setData(val == null ? '' : val))
        })

        const filteredPropsByPriority = (this.calcProp || []).filter(toFilter=> 
                this.calcProp.filter(p=>p.id == toFilter.id && p.priority > toFilter.priority).length == 0)
        filteredPropsByPriority.sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            .forEach(prop=> { 
                const value = jb.val( tryWrapper(() => 
                    prop.value.profile === null ? this.calcCtx.vars.$model[prop.id] : prop.value(this.calcCtx),
                `renderProp:${prop.id}`))
                Object.assign(this.renderProps, { ...(prop.id == '$props' ? value : { [prop.id]: value })})
            })
        Object.assign(this.renderProps,this.styleParams, this.state);
        jb.log('renderProps',[this.renderProps, this])
        return this.renderProps
    }

    renderVdom() {
        this.calcRenderProps()
        if (this.ctx.probe && this.ctx.probe.outOfTime) return
        this.template = this.template || (() => '')
        const initialVdom = tryWrapper(() => this.template(this,this.renderProps,ui.h), 'template') || {}
        const vdom = (this.templateModifierFuncs||[]).reduce((vd,modifier) =>
                (vd && typeof vd === 'object') ? tryWrapper(() => modifier(vd,this,this.renderProps,ui.h) || vd, 'templateModifier') 
                    : vd ,initialVdom)

        const observe = this.toObserve.map(x=>[
            x.ref.handler.urlOfRef(x.ref),
            x.includeChildren && `includeChildren=${x.includeChildren}`,
            x.strongRefresh && `strongRefresh`,  x.cssOnly && `cssOnly`, x.allowSelfRefresh && `allowSelfRefresh`,  
            x.phase && `phase=${x.phase}`].filter(x=>x).join(';')).join(',')
        const handlers = (this.defHandler||[]).map(h=>`${h.id}-${ui.preserveCtx(h.ctx)}`).join(',')
        const interactive = (this.interactiveProp||[]).map(h=>`${h.id}-${ui.preserveCtx(h.ctx)}`).join(',')
        const originators = this.originators.map(ctx=>ui.preserveCtx(ctx)).join(',')

        const workerId = jb.frame.workerId && jb.frame.workerId(this.ctx)
        const atts =  workerId ? { worker: workerId, 'cmp-id': this.cmpId, ...(handlers && {handlers}) } : 
            Object.assign(vdom.attributes || {}, {
                'jb-ctx': ui.preserveCtx(this.originatingCtx()),
                'cmp-id': this.cmpId, 
                'mount-ctx': ui.preserveCtx(this.ctx),
                // 'props-ctx': ui.preserveCtx(this.calcCtx),
            },
            observe && {observe}, 
            handlers && {handlers}, 
            originators && {originators},
            this.ctxForPick && { 'pick-ctx': ui.preserveCtx(this.ctxForPick) },
            (this.componentDidMountFuncs || interactive) && {interactive}, 
            this.renderProps.cmpHash != null && {cmpHash: this.renderProps.cmpHash}
        )        
        if (vdom instanceof jb.ui.VNode) {
            vdom.addClass(this.jbCssClass())
            vdom.attributes = Object.assign(vdom.attributes || {}, {
                    'jb-ctx': ui.preserveCtx(this.originatingCtx()),
                    'cmp-id': this.cmpId, 
                    'mount-ctx': ui.preserveCtx(this.ctx),
                    // 'props-ctx': ui.preserveCtx(this.calcCtx),
                },
                observe && {observe}, 
                handlers && {handlers}, 
                originators && {originators},
                this.ctxForPick && { 'pick-ctx': ui.preserveCtx(this.ctxForPick) },
                workerId && { 'worker': workerId },
                (this.componentDidMountFuncs || interactive) && {interactive}, 
                this.renderProps.cmpHash != null && {cmpHash: this.renderProps.cmpHash}
            )
        }
        fixHandlers(vdom)
        jb.log('renRes',[this.ctx, vdom, this]);
        return vdom

        function fixHandlers(vdom) {
            jb.entries(vdom.attributes).forEach(([att,val]) => att.indexOf('on') == 0 && (''+val).indexOf('jb.ui') != 0 &&
                (vdom.attributes[att] = `jb.ui.handleCmpEvent(${typeof val == 'string' && val ? "'" + val + "'" : '' })`))
            ;(vdom.children || []).forEach(vd => fixHandlers(vd))
        }
    }

    jbCssClass() {
        return ui.hashCss(this.cssLines,this.ctx)
    }
    originatingCtx() {
        return this.originators[this.originators.length-1]
    }

    field() {
        if (this._field) return this._field
        const ctx = this.originatingCtx()
        this._field = {
            class: '',
            ctxId: ui.preserveCtx(ctx),
            control: (item,index,noCache) => this.getOrCreateItemField(item, () => ctx.setData(item).setVars({index: (index||0)+1}).runItself(),noCache),
        }
        this.enrichField && this.enrichField.forEach(enrichField=>enrichField(this._field))
        let title = jb.tosingle(jb.val(ctx.params.title)) || (() => '');
        if (this._field.title !== undefined)
            title = this._field.title
        // make it always a function 
        this._field.title = typeof title == 'function' ? title : () => ''+title;
        this.itemfieldCache = new Map()
        return this._field
    }
    getOrCreateItemField(item,factory,noCache) {
        if (noCache)
            return factory()
        if (!this.itemfieldCache.get(item))
            this.itemfieldCache.set(item,factory())
        return this.itemfieldCache.get(item)
    }
    orig(ctx) {
        if (jb.comps[ctx.profile && ctx.profile.$].type.split(/,|-/).indexOf('control') == -1)
            debugger
        this.originators.push(ctx)
        return this
    }
    applyParamFeatures(ctx) {
        (ctx.params.features && ctx.params.features(ctx) || []).forEach(f => this.jbExtend(f,ctx))
        return this;
    }

    jbExtend(_options,ctx) {
        if (!_options) return this;
        if (!ctx) debugger
        ctx = ctx || this.ctx;
        if (!ctx)
            console.log('no ctx provided for jbExtend');
        if (typeof _options != 'object')
            debugger;
        const options = _options.$ ? ctx.run(_options) : _options
        if (Array.isArray(options)) {
            options.forEach(o=>this.jbExtend(o,ctx))
            return this
        }

        if (options.afterViewInit) 
            options.componentDidMount = options.afterViewInit
        if (typeof options.class == 'string') 
            options.templateModifier = vdom => vdom.addClass(options.class)

        Object.keys(options).forEach(key=>{
            if (lifeCycle.has(key)) {
                this[key+'Funcs'] = this[key+'Funcs'] || []
                this[key+'Funcs'].push(options[key])
            }
            if (arrayProps.has(key)) {
                this[key] = this[key] || []
                this[key].push(options[key])
            }
            if (singular.has(key))
                this[key] = this[key] || options[key]
        })
        if (options.watchRef) {
            this.watchRef = this.watchRef || []
            this.watchRef.push(Object.assign({cmp: this},options.watchRef));
        }

        // eventObservables
        this.eventObservables = this.eventObservables.concat(Object.keys(options).filter(op=>op.indexOf('on') == 0))

        if (options.css)
            this.cssLines = (this.cssLines || []).concat(options.css.split(/}\s*/m)
                .map(x=>x.trim()).filter(x=>x)
                .map(x=>x+'}')
                .map(x=>x.replace(/^!/,' ')));

        jb.asArray(options.featuresOptions || []).filter(x=>x).forEach(f => this.jbExtend(f.$ ? ctx.run(f) : f , ctx))
        jb.asArray(ui.inStudio() && options.studioFeatures).filter(x=>x).forEach(f => this.jbExtend(ctx.run(f), ctx))
        return this;
    }
}

ui.JbComponent = JbComponent

jb.jstypes.renderable = value => {
    if (value == null) return '';
    if (value instanceof ui.VNode) return value;
    if (value instanceof JbComponent) return ui.h(value)
    if (Array.isArray(value))
        return ui.h('div',{},value.map(item=>jb.jstypes.renderable(item)));
    return '' + jb.val(value,true);
}

})();

(function(){
const ui = jb.ui;

// ****************** jbart ui utils ***************
Object.assign(jb.ui,{
    focus(elem,logTxt,srcCtx) {
        if (!elem) debugger;
        // block the preview from stealing the studio focus
        const now = new Date().getTime();
        const lastStudioActivity = jb.studio.lastStudioActivity || jb.path(jb,['studio','studioWindow','jb','studio','lastStudioActivity']);
        jb.log('focus',['request',srcCtx, logTxt, now - lastStudioActivity, elem,srcCtx]);
          if (jb.studio.previewjb == jb && lastStudioActivity && now - lastStudioActivity < 1000)
            return;
          jb.delay(1).then(_=> {
               jb.log('focus',['apply',srcCtx,logTxt,elem,srcCtx]);
            elem.focus()
          })
    },
    wrapWithLauchingElement: (f,ctx,elem,options={}) => ctx2 => {
        if (!elem) debugger;
        return f(ctx.extendVars(ctx2).setVars({ $launchingElement: { el : elem, ...options }}));
    },
    withUnits: v => (v === '' || v === undefined) ? '' : (''+v||'').match(/[^0-9]$/) ? v : `${v}px`,
    propWithUnits: (prop,v) => (v === '' || v === undefined) ? '' : `${prop}: ` + ((''+v||'').match(/[^0-9]$/) ? v : `${v}px`) + ';',
    fixCssLine: css => css.indexOf('\n') == -1 && ! css.match(/}\s*/) ? `{ ${css} }` : css,
    ctxDictOfElem: elem => {
      const runningWorkerId = jb.frame.workerId && jb.frame.workerId()
      const workerIdAtElem = elem.getAttribute('worker')
      const _jb = workerIdAtElem == 'preview' ? jb.studio.previewjb
        : !runningWorkerId && workerIdAtElem ? jb.ui.workers[elem.getAttribute('worker')]
        : jb
      return _jb.ctxDictionary
    },
    ctxOfElem: (elem,att) => elem && elem.getAttribute && jb.ui.ctxDictOfElem(elem)[elem.getAttribute(att || 'jb-ctx')],
    preserveCtx(ctx) {
        jb.ctxDictionary[ctx.id] = ctx
        return ctx.id
    },
    inStudio() { return jb.studio && jb.studio.studioWindow },
    inPreview() {
        try {
            return !ui.inStudio() && jb.frame.parent.jb.studio.initPreview
        } catch(e) {}
    },
    parentCmps(el) {
        if (!el) return []
        const parents = jb.ui.parents(el)
        const dialogElem = parents[parents.length-5]
        return (jb.ui.hasClass(dialogElem,'jb-dialog')
                ? parents.slice(0,-4).concat(jb.ui.ctxOfElem(dialogElem).exp('%$$launchingElement.el._component.base%') || [])
                : parents)
            .map(el=>el._component).filter(x=>x)
    },
    closestCmp(el) {
        return el._component || this.parentCmps(el)[0]
    },
    document(ctx) {
        if (jb.frame.workerId && jb.frame.workerId(ctx))
            return jb.ui.widgets[ctx.vars.widgetId].top
        return ctx.vars.elemToTest || ctx.frame().document
    },
    item(cmp,vdom,data) {
        cmp.extendItemFuncs && cmp.extendItemFuncs.forEach(f=>f(cmp,vdom,data));
        return vdom;
    },
    fromEvent: (cmp,event,elem) => jb.callbag.pipe(
          jb.callbag.fromEvent(elem || cmp.base, event),
          jb.callbag.takeUntil( jb.callbag.fromPromise(cmp.destroyed) )
    ),
    upDownEnterEscObs(cmp) { // and stop propagation !!!
      const {pipe, takeUntil,fromPromise,subject} = jb.callbag
      const keydown_src = subject();
      cmp.base.onkeydown = e => {
        if ([38,40,13,27].indexOf(e.keyCode) != -1) {
          keydown_src.next(e);
          return false;
        }
        return true;
      }
      return pipe(keydown_src, takeUntil(fromPromise(cmp.destroyed)))
    }
})

// ****************** html utils ***************
Object.assign(jb.ui, {
    outerWidth(el) {
        const style = getComputedStyle(el);
        return el.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
    },
    outerHeight(el) {
        const style = getComputedStyle(el);
        return el.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
    },
    offset(el) { return el.getBoundingClientRect() },
    parents(el,{includeSelf} = {}) {
        const res = []
        el = includeSelf ? el : el && el.parentNode;
        while(el) {
          res.push(el);
          el = el.parentNode;
        }
        return res
    },
    closest(el,query) {
        while(el) {
          if (ui.matches(el,query)) return el;
          el = el.parentNode;
        }
    },
    activeElement() { return document.activeElement },
    find(el,selector,options) {
      if (!el) return []
      if (jb.path(el,'constructor.name') == 'jbCtx')
          el = this.document(el) // el is ctx
      if (!el) return []
      return el instanceof jb.ui.VNode ? el.querySelectorAll(selector,options) :
          [... (options && options.includeSelf && ui.matches(el,selector) ? [el] : []),
            ...Array.from(el.querySelectorAll(selector))]
    },
    findIncludeSelf: (el,selector) => jb.ui.find(el,selector,{includeSelf: true}),
    addClass: (el,clz) => el && el.classList && el.classList.add(clz),
    removeClass: (el,clz) => el && el.classList && el.classList.remove(clz),
    hasClass: (el,clz) => el && el.classList && el.classList.contains(clz),
    matches: (el,query) => el && el.matches && el.matches(query),
    index: el => Array.from(el.parentNode.children).indexOf(el),
    limitStringLength(str,maxLength) {
        if (typeof str == 'string' && str.length > maxLength-3)
          return str.substring(0,maxLength) + '...';
        return str;
    },
    addHTML(el,html) {
        const elem = document.createElement('div');
        elem.innerHTML = html;
        el.appendChild(elem.firstChild)
    },
    addStyleElem(innerHtml,workerId) {
      if (workerId) {
        jb.ui.workerStyleElems = jb.ui.workerStyleElems || {}
        jb.ui.workerStyleElems[workerId] = jb.ui.workerStyleElems[workerId] || []
        jb.ui.workerStyleElems[workerId].push(innerHtml)
      } else {
        const style_elem = document.createElement('style');
        style_elem.innerHTML = innerHtml;
        document.head.appendChild(style_elem);
      }
    }
})

ui.renderWidget = function(profile,top) {
	let blockedParentWin = false // catch security execption from the browser if parent is not accessible
	try {
		const x = typeof window != 'undefined' && window.parent.jb
	} catch (e) {
		blockedParentWin = true
	}
	try {
		if (!blockedParentWin && typeof window != 'undefined' && window.parent != window && window.parent.jb)
			window.parent.jb.studio.initPreview(window,[Object.getPrototypeOf({}),Object.getPrototypeOf([])]);
	} catch(e) {
		return jb.logException(e)
    }

    let currentProfile = profile
    let lastRenderTime = 0, fixedDebounce = 500

    if (jb.studio.studioWindow) {
        const studioWin = jb.studio.studioWindow
        const st = studioWin.jb.studio;
        const project = studioWin.jb.resources.studio.project
        const page = studioWin.jb.resources.studio.page
        if (project && page)
            currentProfile = {$: `${jb.macroName(project)}.${page}`}

        const {pipe,debounceTime,filter,subscribe} = jb.callbag
        pipe(st.pageChange, filter(({page})=>page != currentProfile.$), subscribe(({page})=> doRender(page)))
        
        pipe(st.scriptChange, filter(e=>isCssChange(st,e.path)),
          subscribe(({path}) => {
            let featureIndex = path.lastIndexOf('features')
            if (featureIndex == -1) featureIndex = path.lastIndexOf('layout')
            const ctrlPath = path.slice(0,featureIndex).join('~')
            const elems = Array.from(document.querySelectorAll('[jb-ctx]'))
              .map(elem=>({elem, ctx: jb.ctxDictionary[elem.getAttribute('jb-ctx')] }))
              .filter(e => e.ctx && e.ctx.path == ctrlPath)
            elems.forEach(e=>jb.ui.refreshElem(e.elem,null,{cssOnly: true}))
        }))

        pipe(st.scriptChange, filter(e=>!isCssChange(st,e.path)),
            filter(e=>(jb.path(e,'path.0') || '').indexOf('dataResource.') != 0), // do not update on data change
            debounceTime(() => Math.min(2000,lastRenderTime*3 + fixedDebounce)),
            subscribe(() =>{
                doRender()
                jb.ui.dialogs.reRenderAll()
        }))
    }
    const elem = top.ownerDocument.createElement('div')
    top.appendChild(elem)

    doRender()

  function isCssChange(st,path) {
    const compPath = pathOfCssFeature(st,path)
    return compPath && (st.compNameOfPath(compPath) || '').match(/^(css|layout)/)
  }

  function pathOfCssFeature(st,path) {
    const featureIndex = path.lastIndexOf('features')
    if (featureIndex == -1) {
      const layoutIndex = path.lastIndexOf('layout')
      return layoutIndex != -1 && path.slice(0,layoutIndex+1).join('~')
    }
    const array = Array.isArray(st.valOfPath(path.slice(0,featureIndex+1).join('~')))
    return path.slice(0,featureIndex+(array?2:1)).join('~')
  }

	function doRender(page) {
        if (page) currentProfile = {$: page}
        const cmp = new jb.jbCtx().run(currentProfile)
        const start = new Date().getTime()
        jb.ui.unmount(top)
        top.innerHTML = ''
        jb.ui.render(ui.h(cmp),top)
        lastRenderTime = new Date().getTime() - start
  }
}

jb.objectDiff = function(newObj, orig) {
    if (orig === newObj) return {}
    if (!jb.isObject(orig) || !jb.isObject(newObj)) return newObj
    const deletedValues = Object.keys(orig).reduce((acc, key) =>
        newObj.hasOwnProperty(key) ? acc : { ...acc, [key]: jb.frame.workerId && jb.frame.workerId() ? '__undefined' : undefined}
    , {})

    return Object.keys(newObj).reduce((acc, key) => {
      if (!orig.hasOwnProperty(key)) return { ...acc, [key]: newObj[key] } // return added r key
      const difference = jb.objectDiff(newObj[key], orig[key])
      if (jb.isObject(difference) && jb.isEmpty(difference)) return acc // return no diff
      return { ...acc, [key]: difference } // return updated key
    }, deletedValues)
}

// ****************** components ****************

jb.component('customStyle', {
  typePattern: t => /\.style$/.test(t),
  category: 'advanced:10,all:10',
  params: [
    {id: 'template', as: 'single', mandatory: true, dynamic: true, ignore: true},
    {id: 'css', as: 'string'},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: (ctx,css,features) => ({
          template: ctx.profile.template,
          css: css,
          featuresOptions: features(),
          styleParams: ctx.componentContext.params
    })
})

jb.component('styleByControl', {
  typePattern: t => /\.style$/.test(t),
  category: 'advanced:10,all:20',
  params: [
    {id: 'control', type: 'control', mandatory: true, dynamic: true},
    {id: 'modelVar', as: 'string', mandatory: true}
  ],
  impl: (ctx,control,modelVar) => control(ctx.setVar(modelVar,ctx.vars.$model))
})

jb.component('styleWithFeatures', {
  typePattern: t => /\.style$/.test(t),
  description: 'customize, add more features to style',
  category: 'advanced:10,all:20',
  params: [
    {id: 'style', type: '$asParent', mandatory: true, composite: true},
    {id: 'features', type: 'feature[]', templateValue: [], dynamic: true, mandatory: true}
  ],
  impl: (ctx,style,features) => {
    if (style instanceof jb.ui.JbComponent)
      return style.jbExtend(features(),ctx)
    return style && {...style,featuresOptions: (style.featuresOptions || []).concat(features())}
  }
})

jb.component('controlWithFeatures', {
  type: 'control',
  description: 'customize, add more features to control',
  category: 'advanced:10,all:20',
  params: [
    {id: 'control', type: 'control', mandatory: true},
    {id: 'features', type: 'feature[]', templateValue: [], mandatory: true}
  ],
  impl: (ctx,control,features) => control.jbExtend(features,ctx).orig(ctx)
})

})()
;

jb.component('defHandler', {
  type: 'feature',
  description: 'define custom event handler',
  params: [
    {id: 'id', as: 'string', mandatory: true, description: 'to be used in html, e.g. onclick=\"clicked\" '},
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: (ctx,id) => ({defHandler: {id, ctx}})
})

jb.component('watchAndCalcModelProp', {
  type: 'feature',
  description: 'Use a model property in the rendering and watch its changes (refresh on change)',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'transformValue', dynamic: true, defaultValue: '%%'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children'},
  ],
  impl: ctx => ({watchAndCalcModelProp: ctx.params})
})

jb.component('calcProp', {
  type: 'feature',
  description: 'define a variable to be used in the rendering calculation process',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true, description: 'when empty value is taken from model'},
    {id: 'priority', as: 'number', defaultValue: 1, description: 'if same prop was defined elsewhere decides who will override. range 1-1000'},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'}
  ],
  impl: ctx => ({calcProp: {... ctx.params, index: jb.ui.propCounter++}})
})

jb.component('interactiveProp', {
  type: 'feature',
  description: 'define a variable for the interactive comp',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: (ctx,id) => ({interactiveProp: {id: id.replace(/-/g,'_'), ctx }})
})

jb.component('calcProps', {
  type: 'feature',
  description: 'define variables to be used in the rendering calculation process',
  params: [
    {id: 'props', as: 'object', mandatory: true, description: 'props as object', dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'}
  ],
  impl: (ctx,propsF,phase) => ({
      calcProp: {id: '$props', value: ctx => propsF(ctx), phase, index: jb.ui.propCounter++ }
    })
})

jb.component('feature.init', {
  type: 'feature',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'init funcs from different features can use each other, phase defines the calculation order'}
  ],
  impl: (ctx,action,phase) => ({ init: { action, phase }})
})

jb.component('feature.destroy', {
  type: 'feature',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true},
  ],
  impl: ctx => ({ destroy: cmp => ctx.params.action(cmp.ctx) })
})

jb.component('feature.beforeInit', {
  type: 'feature',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: feature.init('%$action%',5)
})

jb.component('feature.afterLoad', {
  type: 'feature',
  description: 'init, onload, defines the interactive part of the component',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ afterViewInit: cmp => ctx.params.action(cmp.ctx) })
})
jb.component('interactive', jb.comps['feature.afterLoad'])

jb.component('templateModifier', {
  type: 'feature',
  description: 'change the html template',
  params: [
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: (ctx,value) => ({ templateModifier: (vdom,cmp) => value(ctx.setVars({cmp,vdom, ...cmp.renderProps})) })
})

jb.component('features', {
  type: 'feature',
  description: 'list of features, auto flattens',
  params: [
    {id: 'features', type: 'feature[]', as: 'array', composite: true}
  ],
  impl: (ctx,features) => features.flatMap(x=> Array.isArray(x) ? x: [x])
})

jb.component('watchRef', {
  type: 'feature',
  category: 'watch:100',
  description: 'subscribes to data changes to refresh component',
  params: [
    {id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children'},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data'},
    {id: 'cssOnly', as: 'boolean', description: 'refresh only css features'},
    {id: 'phase', as: 'number', description: 'controls the order of updates on the same event. default is 0'}
  ],
  impl: ctx => ({ watchRef: {refF: ctx.params.ref, ...ctx.params}})
})

jb.component('watchObservable', {
  type: 'feature',
  category: 'watch',
  description: 'subscribes to a custom observable to refresh component',
  params: [
    {id: 'toWatch', mandatory: true},
    {id: 'debounceTime', as: 'number', description: 'in mSec'}
  ],
  impl: interactive(
    (ctx,{cmp},{toWatch, debounceTime}) => jb.callbag.pipe(toWatch,
      jb.callbag.takeUntil(cmp.destroyed),
      debounceTime && jb.callbag.debounceTime(debounceTime),
      jb.callbag.subscribe(()=>cmp.refresh(null, {srcCtx: ctx}))
    )
  )
})

jb.component('feature.onDataChange', {
  type: 'feature',
  category: 'watch',
  description: 'watch observable data reference, subscribe and run action',
  params: [
    {id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
    {id: 'action', type: 'action', dynamic: true, description: 'run on change'}
  ],
  impl: interactive((ctx,{cmp},{ref,includeChildren,action}) => 
      jb.subscribe(jb.ui.refObservable(ref(),cmp,{includeChildren, srcCtx: ctx}), () => action(ctx.setVar('cmp',cmp))))
})

jb.component('group.data', {
  type: 'feature',
  category: 'general:100,watch:80',
  params: [
    {id: 'data', mandatory: true, dynamic: true, as: 'ref'},
    {id: 'itemVariable', as: 'string', description: 'optional. define data as a local variable'},
    {id: 'watch', as: 'boolean', type: 'boolean'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'}
  ],
  impl: (ctx, refF, itemVariable,watch,includeChildren) => ({
      ...(watch ? {watchRef: { refF, includeChildren }} : {}),
      extendCtx: ctx => {
          const ref = refF()
          return ctx.setData(ref).setVar(itemVariable,ref)
      },
  })
})

jb.component('htmlAttribute', {
  type: 'feature',
  description: 'set attribute to html element and give it value',
  params: [
    {id: 'attribute', mandatory: true, as: 'string'},
    {id: 'value', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: (ctx,attribute,value) => ({
    templateModifier: (vdom,cmp) => {
        vdom.attributes = vdom.attributes || {};
        vdom.attributes[attribute] = value(cmp.ctx)
        return vdom;
      }
  })
})

jb.component('id', {
  type: 'feature',
  description: 'adds id to html element',
  params: [
    {id: 'id', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: htmlAttribute(
    'id',
    (ctx,{},{id}) => id(ctx)
  )
})

jb.component('feature.hoverTitle', {
  type: 'feature',
  description: 'set element title, usually shown by browser on hover',
  params: [
    {id: 'title', as: 'string', mandatory: true}
  ],
  impl: htmlAttribute(
    'title',
    '%$title%'
  )
})

jb.component('variable', {
  type: 'feature',
  category: 'general:90',
  description: 'define a variable. watchable or passive, local or global',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'watchable', as: 'boolean', type: 'boolean', description: 'E.g., selected item variable'}
  ],
  impl: ({}, name, value, watchable) => ({
    destroy: cmp => {
      if (!watchable) return
      const fullName = name + ':' + cmp.cmpId;
      cmp.ctx.run(writeValue(`%$${fullName}%`,null))
    },
    extendCtx: (ctx,cmp) => {
      if (!watchable)
        return ctx.setVar(name,jb.val(value(ctx)))

      const fullName = name + ':' + cmp.cmpId;
      if (fullName == 'items') debugger
      jb.log('var',['new-watchable',ctx,fullName])
      const refToResource = jb.mainWatchableHandler.refOfPath([fullName]);
      jb.writeValue(refToResource,value(ctx),ctx)
      return ctx.setVar(name, refToResource);
    }
  })
})

jb.component('calculatedVar', {
  type: 'feature',
  category: 'general:60',
  description: 'defines a local variable that watches other variables with auto recalc',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'watchRefs', as: 'array', dynamic: true, mandatory: true, defaultValue: [], description: 'variable to watch. needs to be in array'}
  ],
  impl: (ctx, name, value, watchRefs) => ({
      destroy: cmp => {
        const fullName = name + ':' + cmp.cmpId;
        cmp.ctx.run(writeValue(`%$${fullName}%`,null))
      },
      extendCtx: (_ctx,cmp) => {
        const fullName = name + ':' + cmp.cmpId;
        jb.log('calculated var',['new-resource',ctx,fullName])
        jb.resource(fullName, jb.val(value(_ctx)));
        const ref = _ctx.exp(`%$${fullName}%`,'ref')
        return _ctx.setVar(name, ref);
      },
      afterViewInit: cmp => {
        const fullName = name + ':' + cmp.cmpId;
        const refToResource = cmp.ctx.exp(`%$${fullName}%`,'ref');
        (watchRefs(cmp.ctx)||[]).map(x=>jb.asRef(x)).filter(x=>x).forEach(ref=>
          jb.subscribe(jb.ui.refObservable(ref,cmp,{srcCtx: ctx}),
            e=> jb.writeValue(refToResource,value(cmp.ctx),ctx))
        )
      }
  })
})

jb.component('feature.if', {
  type: 'feature',
  category: 'feature:85',
  description: 'adds/remove element to dom by condition. keywords: hidden/show',
  params: [
    {id: 'showCondition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'}
  ],
  impl: (ctx, condition) => ({
    templateModifier: (vdom,cmp) =>
      jb.toboolean(condition(cmp.ctx)) ? vdom : jb.ui.h('span',{style: {display: 'none'}})
  })
})

jb.component('hidden', {
  type: 'feature',
  category: 'feature:85',
  description: 'display:none on element. keywords: show',
  params: [
    {id: 'showCondition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: (ctx,showCondition) => ({
    templateModifier: (vdom,cmp) => {
      if (!jb.toboolean(showCondition(cmp.ctx)))
        jb.path(vdom,['attributes','style','display'],'none')
      return vdom
    }
  })
})

jb.component('conditionalClass', {
  type: 'feature',
  description: 'toggle class by condition',
  params: [
    {id: 'cssClass', as: 'string', mandatory: true, dynamic: true},
    {id: 'condition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: (ctx,cssClass,cond) => ({
    templateModifier: (vdom,cmp) => {
      if (jb.toboolean(cond(cmp.ctx)))
        vdom.addClass(cssClass())
      return vdom
    }
  })
})

jb.component('feature.keyboardShortcut', {
  type: 'feature',
  category: 'events',
  description: 'listen to events at the document level even when the component is not active',
  params: [
    {id: 'key', as: 'string', description: 'e.g. Alt+C'},
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: (ctx,key,action) => ({
      afterViewInit: cmp => {
        jb.subscribe(jb.ui.fromEvent(cmp,'keydown',cmp.base.ownerDocument), event=>{
              const keyStr = key.split('+').slice(1).join('+');
              const keyCode = keyStr.charCodeAt(0);
              if (key == 'Delete') keyCode = 46;

              const helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
              if (helper == 'Ctrl' && !event.ctrlKey) return
              if (helper == 'Alt' && !event.altKey) return
              if (event.keyCode == keyCode || (event.key && event.key == keyStr))
                action();
        })
    }})
})

jb.component('feature.onEvent', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true},
    {id: 'debounceTime', as: 'number', defaultValue: 0, description: 'used for mouse events such as mousemove'}
  ],
  impl: (ctx,event,action,debounceTime) => ({
      [`on${event}`]: true,
      afterViewInit: cmp => {
        if (event == 'load') {
          jb.delay(1).then(() => jb.ui.wrapWithLauchingElement(action, cmp.ctx, cmp.base)())
        } else {
          jb.subscribe(debounceTime ? cmp[`on${event}`].debounceTime(debounceTime) : cmp[`on${event}`],
            event=> jb.ui.wrapWithLauchingElement(action, cmp.ctx.setVars({event}), cmp.base)())
        }
      }
  })
})

jb.component('feature.onHover', {
  type: 'feature',
  description: 'on mouse enter',
  category: 'events',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true},
    {id: 'onLeave', type: 'action[]', mandatory: true, dynamic: true},
    {id: 'debounceTime', as: 'number', defaultValue: 0}
  ],
  impl: (ctx,action,onLeave,_debounceTime) => ({
      onmouseenter: true, onmouseleave: true,
      afterViewInit: cmp => {
        const {pipe,debounceTime,subscribe} = jb.callbag

        pipe(cmp.onmouseenter, debounceTime(_debounceTime), subscribe(()=>
              jb.ui.wrapWithLauchingElement(action, cmp.ctx, cmp.base)()))
        pipe(cmp.onmouseleave,debounceTime(_debounceTime),subscribe(()=>
              jb.ui.wrapWithLauchingElement(onLeave, cmp.ctx, cmp.base)()))
      }
  })
})

jb.component('feature.classOnHover', {
  type: 'feature',
  description: 'set css class on mouse enter',
  category: 'events',
  params: [
    {id: 'class', type: 'string', defaultValue: 'item-hover', description: 'css class to add/remove on hover'}
  ],
  impl: (ctx,clz) => ({
    onmouseenter: true, onmouseleave: true,
    afterViewInit: cmp => {
      jb.subscribe(cmp.onmouseenter, ()=> jb.ui.addClass(cmp.base,clz))
      jb.subscribe(cmp.onmouseleave, ()=> jb.ui.removeClass(cmp.base,clz))
    }
  })
})

jb.ui.checkKey = function(e, key) {
	if (!key) return;
  const dict = { tab: 9, delete: 46, tab: 9, esc: 27, enter: 13, right: 39, left: 37, up: 38, down: 40}

  key = key.replace(/-/,'+');
  const keyWithoutPrefix = key.split('+').pop()
  let keyCode = dict[keyWithoutPrefix.toLowerCase()]
  if (+keyWithoutPrefix)
    keyCode = +keyWithoutPrefix
  if (keyWithoutPrefix.length == 1)
    keyCode = keyWithoutPrefix.charCodeAt(0);

	if (key.match(/^[Cc]trl/) && !e.ctrlKey) return;
	if (key.match(/^[Aa]lt/) && !e.altKey) return;
	return e.keyCode == keyCode
}

jb.component('feature.onKey', {
  type: 'feature',
  category: 'events',
  macroByValue: true,
  params: [
    {id: 'key', as: 'string', description: 'E.g., a,27,Enter,Esc,Ctrl+C or Alt+V'},
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'doNotWrapWithLauchingElement', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,key,action) => ({
      onkeydown: true,
      afterViewInit: cmp => jb.subscribe(cmp.onkeydown, e=> {
          if (!jb.ui.checkKey(e,key)) return
          ctx.params.doNotWrapWithLauchingElement ? action(cmp.ctx) :
            jb.ui.wrapWithLauchingElement(action, cmp.ctx, cmp.base)()
      })
  })
})

jb.component('feature.onEnter', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: feature.onKey(
    'Enter',
    call('action')
  )
})

jb.component('feature.onEsc', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: feature.onKey(
    'Esc',
    call('action')
  )
})

jb.component('refreshControlById', {
  type: 'action',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data'},
    {id: 'cssOnly', as: 'boolean', description: 'refresh only css features'},
  ],
  impl: (ctx,id) => {
    const elem = jb.ui.document(ctx).querySelector('#'+id)
    if (!elem)
      return jb.logError('refreshControlById can not find elem for #'+id, ctx)
    return jb.ui.refreshElem(elem,null,{srcCtx: ctx, ...ctx.params})
  }
})

jb.component('group.autoFocusOnFirstInput', {
  type: 'feature',
  impl: ctx => ({
      afterViewInit: cmp => {
          const elem = Array.from(cmp.base.querySelectorAll('input,textarea,select'))
            .filter(e => e.getAttribute('type') != 'checkbox')[0];
          elem && jb.ui.focus(elem,'group.auto-focus-on-first-input',ctx);
        }
  })
})

jb.component('focusOnFirstElement', {
  type: 'action',
  params: [
    {id: 'selector', as: 'string', defaultValue: 'input'}
  ],
  impl: (ctx, selector) =>
      jb.delay(50).then(() => {
        const elem = document.querySelector(selector)
        elem && jb.ui.focus(elem,'focus-on-first-element',ctx)
    })
})

jb.component('feature.byCondition', {
  type: 'feature',
  description: 'conditional feature, define feature if then else condition',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', as: 'boolean', mandatory: true},
    {id: 'then', type: 'feature', mandatory: true, dynamic: true, composite: true},
    {id: 'else', type: 'feature', dynamic: true}
  ],
  impl: (ctx,cond,_then,_else) =>	cond ? _then() : _else()
})
;

(function() {
const withUnits = jb.ui.withUnits
const fixCssLine = jb.ui.fixCssLine

jb.component('css', {
  description: 'e.g. {color: red; width: 20px} or div>.myClas {color: red} ',
  type: 'feature,dialog-feature',
  params: [
    {id: 'css', mandatory: true, as: 'string'}
  ],
  impl: (ctx,css) => ({css: fixCssLine(css)})
})

jb.component('css.class', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'class', mandatory: true, as: 'string'}
  ],
  impl: (ctx,clz) => ({class: clz})
})

jb.component('css.width', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'width', mandatory: true, as: 'string', description: 'e.g. 200, 100%, calc(100% - 100px)'},
    {id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    {id: 'minMax', as: 'string', options: ',min,max'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,width,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}width: ${withUnits(width)} ${overflow ? '; overflow-x:' + overflow + ';' : ''} }`})
})

jb.component('css.height', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'height', mandatory: true, as: 'string', description: 'e.g. 200, 100%, calc(100% - 100px)'},
    {id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    {id: 'minMax', as: 'string', options: ',min,max'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,height,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}height: ${withUnits(height)} ${overflow ? '; overflow-y:' + overflow : ''} }`})
})

jb.component('css.opacity', {
  type: 'feature',
  params: [
    {id: 'opacity', mandatory: true, as: 'string', description: '0-1'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,opacity) =>
    ({css: `${ctx.params.selector} { opacity: ${opacity} }`})
})

jb.component('css.padding', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'top', as: 'string', description: 'e.g. 20, 20%, 0.4em'},
    {id: 'left', as: 'string'},
    {id: 'right', as: 'string'},
    {id: 'bottom', as: 'string'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
    const css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != '')
      .map(x=> `padding-${x}: ${withUnits(ctx.params[x])}`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

jb.component('css.margin', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'top', as: 'string', description: 'e.g. 20, 20%, 0.4em, -20'},
    {id: 'left', as: 'string'},
    {id: 'bottom', as: 'string'},
    {id: 'right', as: 'string'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => {
    const css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != null)
      .map(x=> `margin-${x}: ${withUnits(ctx.params[x])}`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

jb.component('css.marginAllSides', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'value', as: 'string', mandatory: true, description: 'e.g. 20, 20%, 0.4em'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,value,selector) => ({css: `${selector} margin: ${withUnits(value)}`})
})

jb.component('css.marginVerticalHorizontal', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'vertical', as: 'string', mandatory: true},
    {id: 'horizontal', as: 'string', mandatory: true},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,vertical,horizontal,selector) =>
    ({css: `${selector} margin: ${withUnits(vertical)+ ' ' +withUnits(horizontal)}`})
})

jb.component('css.transformRotate', {
  type: 'feature',
  params: [
    {id: 'angle', as: 'string', description: '0-360'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,angle,selector) => ({css: `${selector} {transform:rotate(${angle}deg)}`})
})

jb.component('css.color', {
  type: 'feature',
  params: [
    {id: 'color', as: 'string'},
    {id: 'background', as: 'string', editAs: 'color'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,color) => {
		const css = ['color','background']
      .filter(x=>ctx.params[x])
      .map(x=> `${x}: ${ctx.params[x]}`)
      .join('; ');
    return css && ({css: `${ctx.params.selector} {${css}}`});
  }
})

jb.component('css.transformScale', {
  type: 'feature',
  params: [
    {id: 'x', as: 'string', description: '0-1'},
    {id: 'y', as: 'string', description: '0-1'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => ({css: `${ctx.params.selector} {transform:scale(${ctx.params.x},${ctx.params.y})}`})
})

jb.component('css.transformTranslate', {
  type: 'feature',
  description: 'margin, move, shift, offset',
  params: [
    {id: 'x', as: 'string', description: '10px', defaultValue: '0'},
    {id: 'y', as: 'string', description: '20px', defaultValue: '0'},
    {id: 'selector', as: 'string'}
  ],
  impl: ctx => ({css: `${ctx.params.selector} {transform:translate(${withUnits(ctx.params.x)},${withUnits(ctx.params.y)})}`})
})

jb.component('css.bold', {
  type: 'feature',
  impl: ctx => ({css: `{font-weight: bold}`})
})

jb.component('css.underline', {
  type: 'feature',
  impl: ctx => ({css: `{text-decoration: underline}`})
})

jb.component('css.boxShadow', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'blurRadius', as: 'string', templateValue: '5'},
    {id: 'spreadRadius', as: 'string', templateValue: '0'},
    {id: 'shadowColor', as: 'string', templateValue: '#000000'},
    {id: 'opacity', as: 'string', templateValue: 0.5, description: '0-1'},
    {id: 'horizontal', as: 'string', templateValue: '10'},
    {id: 'vertical', as: 'string', templateValue: '10'},
    {id: 'selector', as: 'string'}
  ],
  impl: (context,blurRadius,spreadRadius,shadowColor,opacity,horizontal,vertical,selector) => {
    const color = [parseInt(shadowColor.slice(1,3),16) || 0, parseInt(shadowColor.slice(3,5),16) || 0, parseInt(shadowColor.slice(5,7),16) || 0]
      .join(',');
    return ({css: `${selector} { box-shadow: ${withUnits(horizontal)} ${withUnits(vertical)} ${withUnits(blurRadius)} ${withUnits(spreadRadius)} rgba(${color},${opacity}) }`})
  }
})

jb.component('css.border', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'width', as: 'string', defaultValue: '1'},
    {id: 'side', as: 'string', options: 'top,left,bottom,right'},
    {id: 'style', as: 'string', options: 'solid,dotted,dashed,double,groove,ridge,inset,outset', defaultValue: 'solid'},
    {id: 'color', as: 'string', defaultValue: 'black'},
    {id: 'selector', as: 'string'}
  ],
  impl: (context,width,side,style,color,selector) =>
    ({css: `${selector} { border${side?'-'+side:''}: ${withUnits(width)} ${style} ${color} }`})
})

jb.component('css.borderRadius', {
  type: 'feature,dialog-feature',
  params: [
    {id: 'radius', as: 'string', defaultValue: '5'},
    {id: 'selector', as: 'string'}
  ],
  impl: (ctx,radius,selector) => ({css: `${selector} { border-radius: ${withUnits(radius)}}`})
})

jb.component('css.lineClamp', {
  type: 'feature',
  description: 'ellipsis after X lines',
  params: [
    {id: 'lines', mandatory: true, as: 'string', templateValue: 3, description: 'no of lines to clump'},
    {id: 'selector', as: 'string'}
  ],
  impl: css(
    '%$selector% { overflow: hidden; text-overflow: ellipsis; -webkit-box-orient: vertical; display: -webkit-box; -webkit-line-clamp: %$lines% }'
  )
})

;['layout','typography','detailedBorder','detailedColor','gridArea'].forEach(f=>
jb.component(`css.${f}`, {
  type: 'feature:0',
  params: [
    {id: 'css', mandatory: true, as: 'string'}
  ],
  impl: (ctx,css) => ({css: fixCssLine(css)})
}))

})();

jb.ns('text')

jb.component('text', {
  type: 'control',
  category: 'control:100,common:100',
  params: [
    {id: 'text', as: 'ref', mandatory: true, templateValue: 'my text', dynamic: true},
    {id: 'title', as: 'ref', mandatory: true, templateValue: 'my title', dynamic: true},
    {id: 'style', type: 'text.style', defaultValue: text.span(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('label', {...jb.comps.text,type: 'depricated-control'} )

jb.component('text.bindText', {
  type: 'feature',
  category: 'text:0',
  impl: features(
    watchAndCalcModelProp({prop: 'text', transformValue: ({data}) => jb.ui.toVdomOrStr(data)}),
    () => ({studioFeatures :{$: 'feature.contentEditable', param: 'text' }})
  )
})

jb.component('text.allowAsynchValue', {
  type: 'feature',
  impl: features(
    calcProp({id: 'text', value: (ctx,{cmp}) => cmp.text || ctx.vars.$props.text}),
    interactive(
        (ctx,{cmp}) => {
      if (cmp.text) return
      const val = jb.ui.toVdomOrStr(ctx.vars.$model.text(cmp.ctx))
      if (val && typeof val.then == 'function')
        val.then(res=>cmp.refresh({text: jb.ui.toVdomOrStr(res)},{srcCtx: ctx.componentContext}))
    }
      )
  )
})

jb.component('text.highlight', {
  type: 'data',
  macroByValue: true,
  params: [
    {id: 'base', as: 'string', dynamic: true},
    {id: 'highlight', as: 'string', dynamic: true},
    {id: 'cssClass', as: 'string', defaultValue: 'mdl-color-text--deep-purple-A700'}
  ],
  impl: (ctx,base,highlightF,cssClass) => {
    const h = highlightF(), b = base();
    if (!h || !b) return b;
    const highlight = (b.match(new RegExp(h,'i'))||[])[0]; // case sensitive highlight
    if (!highlight) return b;
    return jb.ui.h('div',{},[  b.split(highlight)[0],
              jb.ui.h('span',{class: cssClass},highlight),
              b.split(highlight).slice(1).join(highlight)])
  }
})
;

jb.ns('group,layout,tabs')

jb.component('group', {
  type: 'control',
  category: 'group:100,common:90',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'layout', type: 'layout'},
    {id: 'style', type: 'group.style', defaultValue: group.div(), mandatory: true, dynamic: true},
    {id: 'controls', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true, composite: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, ctx.params.layout)
})

jb.component('group.initGroup', {
  type: 'feature',
  category: 'group:0',
  impl: calcProp({
    id: 'ctrls',
    value: '%$$model.controls%'
  })
})

jb.component('inlineControls', {
  type: 'control',
  description: 'controls without a wrapping group',
  params: [
    {id: 'controls', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true, composite: true}
  ],
  impl: ctx => ctx.params.controls().filter(x=>x)
})

jb.component('dynamicControls', {
  type: 'control',
  description: 'calculated controls by data items without a wrapping group',
  params: [
    {id: 'controlItems', type: 'data', as: 'array', mandatory: true, dynamic: true},
    {id: 'genericControl', type: 'control', mandatory: true, dynamic: true},
    {id: 'itemVariable', as: 'string', defaultValue: 'controlItem'},
    {id: 'indexVariable', as: 'string'}
  ],
  impl: (ctx,controlItems,genericControl,itemVariable,indexVariable) => (controlItems() || [])
      .map((controlItem,i) => jb.tosingle(genericControl(
        ctx.setVar(itemVariable,controlItem).setVar(indexVariable,i).setData(controlItem))))
})

jb.component('group.firstSucceeding', {
  type: 'feature',
  category: 'group:70',
  description: 'Used with controlWithCondition. Takes the fhe first succeeding control',
  impl: features(
    () => ({calcHash: ctx => jb.asArray(ctx.vars.$model.controls.profile).reduce((res,prof,i) => {
        if (res) return res
        const found = prof.condition == undefined || ctx.vars.$model.ctx.setVars(ctx.vars).runInner(prof.condition,{ as: 'boolean'},`controls.${i}.condition`)
        if (found)
          return i + 1 // avoid index 0
      }, null),
    }),
    calcProp({
        id: 'ctrls',
        value: ctx => {
      const index = ctx.vars.$props.cmpHash-1
      if (isNaN(index)) return []
      const prof = jb.asArray(ctx.vars.$model.controls.profile)[index]
      return [ctx.vars.$model.ctx.setVars(ctx.vars).runInner(prof,{type: 'control'},`controls.${index}`)]
     },
        priority: 5
      })
  )
})

jb.component('controlWithCondition', {
  type: 'control',
  description: 'Used with group.firstSucceeding',
  category: 'group:10',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', dynamic: true, mandatory: true, as: 'boolean'},
    {id: 'control', type: 'control', mandatory: true, dynamic: true},
    {id: 'title', as: 'string'}
  ],
  impl: (ctx,condition,ctrl) => condition(ctx) && ctrl(ctx)
})

jb.component('group.wait', {
  type: 'feature',
  category: 'group:70',
  description: 'wait for asynch data before showing the control',
  params: [
    {id: 'for', mandatory: true, dynamic: true},
    {id: 'loadingControl', type: 'control', defaultValue: text('loading ...'), dynamic: true},
    {id: 'error', type: 'control', defaultValue: text('error: %$error%'), dynamic: true},
    {id: 'varName', as: 'string'}
  ],
  impl: features(
    calcProp({
        id: 'ctrls',
        value: (ctx,{cmp},{loadingControl,error}) => {
        const ctrl = cmp.state.error ? error() : loadingControl(ctx)
        return cmp.ctx.profile.$ == 'itemlist' ? [[ctrl]] : [ctrl]
      },
        priority: ctx => jb.path(ctx.vars.$state,'dataArrived') ? 0: 10
      }),
    interactive(
        (ctx,{cmp},{varName}) => !cmp.state.dataArrived && !cmp.state.error &&
      Promise.resolve(ctx.componentContext.params.for()).then(data =>
          cmp.refresh({ dataArrived: true }, {
            srcCtx: ctx.componentContext,
            extendCtx: ctx => ctx.setVar(varName,data).setData(data)
          }))
          .catch(e=> cmp.refresh({error: JSON.stringify(e)}))
      )
  )
})
;

jb.ns('html')

jb.component('html', {
  type: 'control',
  description: 'rich text',
  category: 'control:100,common:80',
  params: [
    {id: 'title', as: 'string', mandatory: true, templateValue: 'html', dynamic: true},
    {id: 'html', as: 'ref', mandatory: true, templateValue: '<p>html here</p>', dynamic: true},
    {id: 'style', type: 'html.style', defaultValue: html.plain(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('html.plain', {
  type: 'html.style',
  impl: customStyle({
    template: (cmp,{html},h) => h('div',{$html: html, jb_external: true } ),
    features: [
      watchAndCalcModelProp('html'),
      () => ({ studioFeatures :{$: 'feature.contentEditable', param: 'html' } })
    ]
  })
})

jb.component('html.inIframe', {
  type: 'html.style',
  params: [
    {id: 'width', as: 'string', defaultValue: '100%'},
    {id: 'height', as: 'string', defaultValue: '100%'}
  ],
  impl: customStyle({
    template: (cmp,{width,height},h) => h('iframe', {
        sandbox: 'allow-same-origin allow-forms allow-scripts',
        frameborder: 0, width, height,
        src: 'javascript: document.write(parent.contentForIframe)'
    }),
    features: [
      interactiveProp('html', '%$$model/html%'),
      interactive(({},{cmp}) => window.contentForIframe = cmp.html)
    ]
  })
})
;

jb.ns('image,css')

jb.component('image', {
  type: 'control,image',
  category: 'control:50,common:70',
  params: [
    {id: 'url', as: 'string', mandatory: true, templateValue: 'https://freesvg.org/img/UN-CONSTRUCTION-2.png'},
    {id: 'width', as: 'string', mandatory: true, templateValue: '100', description: 'e.g: 100, 20%'},
    {id: 'height', as: 'string', mandatory: true, description: 'e.g: 100, 20%'},
    {id: 'resize', type: 'image.resize', description: 'background-size, resize the image', defaultValue: image.fullyVisible()},
    {id: 'position', type: 'image.position', description: 'move/shift image'},
    {id: 'style', type: 'image.style', dynamic: true, defaultValue: image.background()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, {
    studioFeatures :{$: 'feature.contentEditable' },
  })
})

jb.component('image.widthHeight', {
  type: 'image.resize',
  description: 'fixed size or precentage of the original',
  params: [
    {id: 'width', as: 'string', description: 'e.g: 100, 20%'},
    {id: 'height', as: 'string', description: 'e.g: 100, 20%'}
  ],
  impl: (ctx,width,height) => [ jb.ui.withUnits(width) ||'auto',jb.ui.withUnits(height)||'auto'].join(' ')
})

jb.component('image.cover', {
  description: 'auto resize or crop to cover all area',
  type: 'image.resize',
  impl: 'cover'
})

jb.component('image.fullyVisible', {
  description: 'contain, auto resize to ensure the image is fully visible',
  type: 'image.resize',
  impl: 'contain'
})

jb.component('image.position', {
  description: 'offset move shift original image',
  type: 'image.position',
  params: [
    {id: 'x', as: 'string', description: 'e.g. 7, 50%, right'},
    {id: 'y', as: 'string', description: 'e.g. 10, 50%, bottom'}
  ],
  impl: (ctx,x,y) => [x && `x: ${jb.ui.withUnits(x)}`,y && `y: ${jb.ui.withUnits(y)}`]
    .filter(x=>x).map(x=>`background-position-${x}`).join(';')
})

jb.component('image.background', {
  type: 'image.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div'),
    css: pipeline(
      Var(
          'url',
          (ctx,{$model}) => $model.url.replace(/__WIDTH__/,$model.width).replace(/__HEIGHT__/,$model.height)
        ),
      Var('width', (ctx,{$model}) => jb.ui.withUnits($model.width)),
      Var('height', (ctx,{$model}) => jb.ui.withUnits($model.height)),
      `
      {
          background-image: url('%$url%');
          {? background-size: %$$model/resize%; ?}
          {? %$$model/position%; ?}
          background-repeat: no-repeat;
          {?width: %$width%; ?}
          {?height: %$height%; ?}
      }`
    )
  })
})

jb.component('image.img', {
  type: 'image.style',
  impl: customStyle({
    template: ({},{url},h) => h('img', { src: url}),
    css: pipeline(
      Var('width', (ctx,{$model}) => jb.ui.withUnits($model.width)),
      Var('height', (ctx,{$model}) => jb.ui.withUnits($model.height)),
      `
      { 
          {?width: %$width%; ?}
          {?height: %$height%; ?}
      }`
    ),
    features: calcProp('url')
  })
});

jb.ns('icon,control')

jb.component('control.icon', {
  type: 'control',
  category: 'control:50',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc' },
    {id: 'size', as: 'number', defaultValue: 24 },
    {id: 'style', type: 'icon.style', dynamic: true, defaultValue: icon.material()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, features(
    calcProp('icon'), calcProp('type'), calcProp('title'), calcProp('size')
  ))
})

jb.component('icon', {
  type: 'icon',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc' },
    {id: 'style', type: 'icon.style', dynamic: true, defaultValue: icon.material()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ctx.params
})

jb.component('icon.material', {
  type: 'icon.style',
  impl: customStyle({
    template: (cmp,{icon,type,title,size},h) => type == 'mdc' ? h('i',
    { class: 'material-icons', title: title(), onclick: true, style: {'font-size': `${size}px`, width: `${size}px`, height: `${size}px` } }
      , icon) 
      : h('div',{title: title(), onclick: true,
        $html: `<svg width="24" height="24" transform="scale(${size/24})"><path d="${jb.path(jb.frame,['MDIcons',icon])}"/></svg>`}),
  })
})

jb.component('feature.icon', {
  type: 'feature',
  category: 'control:50',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'position', as: 'string', options: ',pre,post,raised', defaultValue: '' },
    {id: 'type', as: 'string', options: 'mdi,mdc', defaultValue: 'mdc' },
    {id: 'size', as: 'number', defaultValue: 24 },
    {id: 'style', type: 'icon.style', dynamic: true, defaultValue: icon.material()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => ({
    icon: jb.ui.ctrl(ctx, features(
      calcProp('icon'), calcProp('type'), calcProp('title'), calcProp('size'),
      calcProp('iconPosition','%$$model/position%')
    ))
  })
})

;

jb.ns('button')

jb.component('button', {
  type: 'control,clickable',
  category: 'control:100,common:100',
  params: [
    {id: 'title', as: 'ref', mandatory: true, templateValue: 'click me', dynamic: true},
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'style', type: 'button.style', defaultValue: button.mdc(), dynamic: true},
    {id: 'raised', as: 'boolean', dynamic: true },
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, ctx.run(features(
      watchAndCalcModelProp('title'),
      watchAndCalcModelProp('raised'),
      defHandler('onclickHandler', (ctx,{cmp, ev}) => {
        //const ev = event
        if (ev && ev.ctrlKey && cmp.ctrlAction)
          cmp.ctrlAction(cmp.ctx.setVar('event',ev))
        else if (ev && ev.altKey && cmp.altAction)
          cmp.altAction(cmp.ctx.setVar('event',ev))
        else
          cmp.action && cmp.action(cmp.ctx.setVar('event',ev))
      }),
      interactive( ({},{cmp}) => cmp.action = jb.ui.wrapWithLauchingElement(ctx.params.action, cmp.ctx, cmp.base)),
      ctx => ({studioFeatures :{$: 'feature.contentEditable', param: 'title' }}),
    )))
})

jb.component('ctrlAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on control+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: interactive(
    (ctx,{cmp},{action}) => cmp.ctrlAction = jb.ui.wrapWithLauchingElement(action, ctx, cmp.base)
  )
})

jb.component('altAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on alt+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: interactive(
    (ctx,{cmp},{action}) => cmp.altAction = jb.ui.wrapWithLauchingElement(action, ctx, cmp.base)
  )
})

jb.component('buttonDisabled', {
  type: 'feature',
  category: 'button:70',
  description: 'define condition when button is enabled',
  params: [
    {id: 'enabledCondition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: interactive(
    (ctx,{cmp},{enabledCondition}) => cmp.isEnabled = ctx2 => enabledCondition(ctx.extendVars(ctx2))
  )
})
;

(function() {
jb.ui.field_id_counter = jb.ui.field_id_counter || 0;

jb.component('field.databind', {
  type: 'feature',
  category: 'field:0',
  params: [
    {id: 'debounceTime', as: 'number', defaultValue: 0},
    {id: 'oneWay', as: 'boolean'}
  ],
  impl: features(
    If(
        '%$oneWay%',
        calcProp('databind','%$$model/databind%'),
        watchAndCalcModelProp({prop: 'databind', allowSelfRefresh: true})
      ),
    calcProp('title'),
    calcProp({id: 'fieldId', value: () => jb.ui.field_id_counter++}),
    defHandler(
        'onblurHandler',
        (ctx,{cmp, ev},{oneWay}) => writeFieldData(ctx,cmp,ev.target.value,oneWay)
      ),
    defHandler(
        'onchangeHandler',
        (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && writeFieldData(ctx,cmp,ev.target.value,oneWay)
      ),
    defHandler(
        'onkeyupHandler',
        (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && writeFieldData(ctx,cmp,ev.target.value,oneWay)
      ),
    defHandler(
        'onkeydownHandler',
        (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && writeFieldData(ctx,cmp,ev.target.value,oneWay)
      ),
    interactiveProp(
        'jbModel',
        (ctx,{cmp}) => value =>
          value == null ? ctx.exp('%$$model/databind%','number') : writeFieldData(ctx,cmp,value,true)
      ),
    interactive((ctx,{$dialog})=> $dialog && ($dialog.hasFields = true))
  )
})

function writeFieldData(ctx,cmp,value,oneWay) {
  if (jb.val(ctx.vars.$model.databind(cmp.ctx)) == value) return
  jb.writeValue(ctx.vars.$model.databind(cmp.ctx),value,ctx);
  jb.ui.checkValidationError(cmp,value,ctx);
  cmp.onValueChange && cmp.onValueChange(value)
  !oneWay && jb.ui.refreshElem(cmp.base,null,{srcCtx: ctx.componentContext});
}

jb.ui.checkValidationError = (cmp,val,ctx) => {
  const err = validationError();
  if (cmp.state.error != err) {
    jb.log('field',['setErrState',cmp,err])
    cmp.refresh({valid: !err, error:err}, {srcCtx: ctx.componentContext});
  }

  function validationError() {
    if (!cmp.validations) return;
    const ctx = cmp.ctx.setData(val);
    const err = (cmp.validations || [])
      .filter(validator=>!validator.validCondition(ctx))
      .map(validator=>validator.errorMessage(ctx))[0];
    if (ctx.exp('%$formContainer%'))
      ctx.run(writeValue('%$formContainer/err%',err));
    return err;
  }
}

jb.ui.checkFormValidation = function(elem) {
  jb.ui.find(elem,'[jb-ctx]').map(el=>el._component).filter(cmp => cmp && cmp.validations).forEach(cmp => 
    jb.ui.checkValidationError(cmp,jb.val(cmp.ctx.vars.$model.databind(cmp.ctx)), cmp.ctx))
}

jb.ui.fieldTitle = function(cmp,fieldOrCtrl,h) {
  let field = fieldOrCtrl.field && fieldOrCtrl.field() || fieldOrCtrl
  field = typeof field === 'function' ? field() : field
	if (field.titleCtrl) {
		const ctx = cmp.ctx.setData(field).setVars({input: cmp.ctx.data})
		const jbComp = field.titleCtrl(ctx);
		return jbComp && h(jbComp,{'jb-ctx': jb.ui.preserveCtx(ctx) })
	}
	return field.title(cmp.ctx)
}

jb.ui.preserveFieldCtxWithItem = (field,item) => {
	const ctx = jb.ctxDictionary[field.ctxId]
	return ctx && jb.ui.preserveCtx(ctx.setData(item))
}
jb.component('field.onChange', {
  category: 'field:100',
  description: 'on picklist selection, text or boolean value change',
  type: 'feature',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: feature.onDataChange({ref: '%$$model/databind%', action: call('action') })
})

jb.component('field.databindText', {
  type: 'feature',
  category: 'field:0',
  params: [
    {id: 'debounceTime', as: 'number', defaultValue: 0},
    {id: 'oneWay', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: field.databind(
    '%$debounceTime%',
    '%$oneWay%'
  )
})

jb.component('field.keyboardShortcut', {
  type: 'feature',
  category: 'events',
  description: 'listen to events at the document level even when the component is not active',
  params: [
    {id: 'key', as: 'string', description: 'e.g. Alt+C'},
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: interactive(
    (ctx,{cmp},{key,action}) => {
        const elem = cmp.base.querySelector('input') || cmp.base
        if (elem.tabIndex === undefined) elem.tabIndex = -1
        jb.subscribe(jb.ui.fromEvent(cmp,'keydown',elem),event=>{
              const keyStr = key.split('+').slice(1).join('+');
              const keyCode = keyStr.charCodeAt(0);
              if (key == 'Delete') keyCode = 46;

              const helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
              if (helper == 'Ctrl' && !event.ctrlKey) return
              if (helper == 'Alt' && !event.altKey) return
              if (event.keyCode == keyCode || (event.key && event.key == keyStr))
                action();
        })
    }
  )
})

jb.component('field.toolbar', {
  type: 'feature',
  params: [
    {id: 'toolbar', type: 'control', mandatory: true, dynamic: true}
  ],
  impl: (ctx,toolbar) => ({ toolbar: toolbar() })
})

// ***** validation

jb.component('validation', {
  type: 'feature',
  category: 'validation:100',
  params: [
    {id: 'validCondition', mandatory: true, as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'errorMessage', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: interactive(
    (ctx,{cmp},{validCondition,errorMessage}) => {
          cmp.validations = (cmp.validations || []).concat([{validCondition,errorMessage}]);
          if (jb.ui.inPreview()) {
            const _ctx = ctx.setData(cmp.state.model);
            validCondition(_ctx)
            errorMessage(_ctx)
          }
      }
  )
})

jb.component('field.title', {
  description: 'used to set table title in button and label',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true}
  ],
  impl: (ctx,title) => ({
      enrichField: field => field.title = ctx => title(ctx)
  })
})

jb.component('field.titleCtrl', {
  description: 'title as control, buttons are usefull',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'titleCtrl', type: 'control', mandatory: true, dynamic: true, templateValue: button({title: '%title%', style: button.href()})}
  ],
  impl: (ctx,titleCtrl) => ({
      enrichField: field => field.titleCtrl = ctx => titleCtrl(ctx)
  })
})

jb.component('field.columnWidth', {
  description: 'used in itemlist fields',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'width', as: 'number', mandatory: true}
  ],
  impl: (ctx,width) => ({
      enrichField: field => field.width = width
  })
})


})();

jb.ns('editableText')
jb.ns('dialog')

jb.component('editableText', {
  type: 'control',
  category: 'input:100,common:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'updateOnBlur', as: 'boolean', type: 'boolean'},
    {id: 'style', type: 'editable-text.style', defaultValue: editableText.mdcInput(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('editableText.xButton', {
  type: 'feature',
  impl: features(
    defHandler('cleanValue', writeValue('%$$model/databind%', '')),
    templateModifier(
        ({},{vdom,databind}) =>
      jb.ui.h('div', {},[vdom,
          ...(databind ? [jb.ui.h('button', { class: 'delete', onclick: 'cleanValue' } ,'×')]  : [])]
    )
      ),
    css(
        `>.delete {
          margin-left: -16px;
          float: right;
          cursor: pointer; font: 20px sans-serif;
          border: none; background: transparent; color: #000;
          text-shadow: 0 1px 0 #fff; opacity: .1;
      }
      { display : flex }
      >.delete:hover { opacity: .5 }`
      )
  )
})

jb.component('editableText.helperPopup', {
  type: 'feature',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'popupId', as: 'string', mandatory: true},
    {id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue: dialog.popup()},
    {id: 'showHelper', as: 'boolean', dynamic: true, defaultValue: notEmpty('%value%'), description: 'show/hide helper according to input content', type: 'boolean'},
    {id: 'autoOpen', as: 'boolean', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true},
    {id: 'onEsc', type: 'action', dynamic: true}
  ],
  impl: ctx =>({
    onkeyup: true,
    afterViewInit: cmp => {
      const input = jb.ui.findIncludeSelf(cmp.base,'input')[0];
      if (!input) return;
      const {pipe,filter,subscribe,delay} = jb.callbag

      cmp.openPopup = jb.ui.wrapWithLauchingElement( ctx2 =>
            ctx2.run( openDialog({
              id: ctx.params.popupId,
              style: _ctx => ctx.params.popupStyle(_ctx),
              content: _ctx => ctx.params.control(_ctx),
              features: [
                dialogFeature.maxZIndexOnClick(),
                dialogFeature.uniqueDialog(ctx.params.popupId),
              ]
            }))
          ,cmp.ctx, cmp.base);

      cmp.popup = _ => jb.ui.dialogs.dialogs.filter(d=>d.id == ctx.params.popupId)[0];
      cmp.closePopup = _ => cmp.popup() && cmp.popup().close();
      cmp.refreshSuggestionPopupOpenClose = _ => {
          const showHelper = ctx.params.showHelper(cmp.ctx.setData(input))
          jb.log('helper-popup', ['refreshSuggestionPopupOpenClose', showHelper,input.value,cmp.ctx,cmp,ctx] );
          if (!showHelper) {
            jb.log('helper-popup', ['close popup', showHelper,input.value,cmp.ctx,cmp,ctx])
            cmp.closePopup();
          } else if (!cmp.popup()) {
            jb.log('helper-popup', ['open popup', showHelper,input.value,cmp.ctx,cmp,ctx])
            cmp.openPopup(cmp.ctx)
          }
      }

      cmp.selectionKeySource = true
      cmp.input = input;
      const keyup = cmp.keyup = pipe(cmp.onkeyup,delay(1)) // delay to have input updated

      cmp.onkeydown = jb.ui.upDownEnterEscObs(cmp)
      pipe(cmp.onkeydown,filter(e=> e.keyCode == 13),subscribe(_=>{
        const showHelper = ctx.params.showHelper(cmp.ctx.setData(input))
        jb.log('helper-popup', ['onEnter', showHelper, input.value,cmp.ctx,cmp,ctx])
        if (!showHelper)
          ctx.params.onEnter(cmp.ctx)
      }))
      jb.subscribe(keyup,e=>e.keyCode == 27 && ctx.params.onEsc(cmp.ctx))
      jb.subscribe(keyup,e=> [13,27,37,38,40].indexOf(e.keyCode) == -1 && cmp.refreshSuggestionPopupOpenClose())
      jb.subscribe(keyup,e=>e.keyCode == 27 && cmp.closePopup())

      if (ctx.params.autoOpen)
        cmp.refreshSuggestionPopupOpenClose()
    },
    destroy: cmp => cmp.closePopup(),
  })
})
;

jb.ns('editableBoolean')

jb.component('editableBoolean', {
  type: 'control',
  category: 'input:20',
  params: [
    {id: 'databind', as: 'ref', type: 'boolean', mandaroy: true, dynamic: true, aa: 5},
    {id: 'style', type: 'editable-boolean.style', defaultValue: editableBoolean.checkbox(), dynamic: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'textForTrue', as: 'string', defaultValue: 'yes', dynamic: true},
    {id: 'textForFalse', as: 'string', defaultValue: 'no', dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, features(
    calcProp('text',data.if('%$$model/databind%','%$$model/textForTrue%','%$$model/textForFalse%' )),
    watchRef({ref: '%$$model/databind%', allowSelfRefresh: true}),
    defHandler('toggle', ctx => ctx.run(writeValue('%$$model/databind%',not('%$$model/databind%')))),
    defHandler('toggleByKey', (ctx,{ev}) => ev.keyCode != 27 && ctx.run(writeValue('%$$model/databind%',not('%$$model/databind%')))),
    defHandler('setChecked', writeValue('%$$model/databind%','true')),
		))
})
;

jb.ns('editableNumber')

jb.component('editableNumber', {
  type: 'control',
  category: 'input:30',
  params: [
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'style', type: 'editable-number.style', defaultValue: editableText.mdcInput(), dynamic: true},
    {id: 'symbol', as: 'string', description: 'leave empty to parse symbol from value'},
    {id: 'min', as: 'number', defaultValue: 0},
    {id: 'max', as: 'number', defaultValue: 10},
    {id: 'displayString', as: 'string', dynamic: true, defaultValue: '%$Value%%$Symbol%'},
    {id: 'dataString', as: 'string', dynamic: true, defaultValue: '%$Value%%$Symbol%'},
    {id: 'autoScale', as: 'boolean', defaultValue: true, description: 'adjust its scale if at edges', type: 'boolean'},
    {id: 'step', as: 'number', defaultValue: 1, description: 'used by slider'},
    {id: 'initialPixelsPerUnit', as: 'number', description: 'used by slider'},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => {
      class editableNumber {
        constructor(params) {
          Object.assign(this,params);
          if (this.min == null) this.min = NaN;
          if (this.max == null) this.max = NaN;
        }
        numericPart(dataString) {
          if (typeof dataString == 'number') return dataString
          if (dataString == '') return NaN;
          var parts = (''+dataString).match(/([^0-9\.\-]*)([0-9\.\-]+)([^0-9\.\-]*)/); // prefix-number-suffix
          if (parts)
            this.symbol = parts[1] || parts[3]
          return +(parts && parts[2])
        }

        calcDisplayString(number,ctx) {
          if (isNaN(number)) return this.placeholder || '';
          return this.displayString(ctx.setVars({ Value: ''+number, Symbol: this.symbol }));
        }

        calcDataString(number,ctx) {
          if (isNaN(number)) return '';
          return this.dataString(ctx.setVars({ Value: ''+number, Symbol: this.symbol }));
        }
      }
      return jb.ui.ctrl(ctx.setVars({ editableNumber: new editableNumber(ctx.params) }))
  }
})


;

jb.component('openDialog', {
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'style', type: 'dialog.style', dynamic: true, defaultValue: dialog.default()},
    {id: 'content', type: 'control', dynamic: true, templateValue: group({})},
    {id: 'menu', type: 'control', dynamic: true},
    {id: 'title', as: 'renderable', dynamic: true},
    {id: 'onOK', type: 'action', dynamic: true},
    {id: 'modal', type: 'boolean', as: 'boolean'},
    {id: 'features', type: 'dialog-feature[]', dynamic: true}
  ],
  impl: function(context,id) {
		const dialog = { id, modal: context.params.modal, em: jb.callbag.subject() }
		const ctx = context.setVars({
			$dialog: dialog,
			dialogData: {},
			formContainer: { err: ''}
		})
		dialog.content = () => jb.ui.dialogs.buildComp(ctx).renderVdom() // used by probe as breaking prop
		if (!context.probe)	jb.ui.dialogs.addDialog(dialog,ctx);
		return dialog
	}
})

jb.component('dialog.closeContainingPopup', {
  description: 'close parent dialog',
  type: 'action',
  params: [
    {id: 'OK', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: (context,OK) => context.vars.$dialog && context.vars.$dialog.close({OK:OK})
})

jb.component('dialogFeature.uniqueDialog', {
  description: 'automatic close dialogs of the same id',
  type: 'dialog-feature',
  params: [
    {id: 'id', as: 'string'},
    {id: 'remeberLastLocation', type: 'boolean', as: 'boolean'}
  ],
  impl: function(context,id,remeberLastLocation) {
		if (!id) return;
		const dialog = context.vars.$dialog;
		dialog.id = id;
		jb.subscribe(dialog.em, e =>
			e.type == 'new-dialog' && e.dialog != dialog && e.dialog.id == id && dialog.close())
	}
})

jb.component('dialogFeature.dragTitle', {
	type: 'dialog-feature',
	params: [
	  {id: 'id', as: 'string'},
	  {id: 'selector', as: 'string', defaultValue: '.dialog-title'},
	],
	impl: function(context, id,selector) {

		  const dialog = context.vars.$dialog;
		  const {pipe,fromEvent,takeUntil,merge,Do, map,flatMap,distinctUntilChanged,fromPromise, forEach} = jb.callbag
		  return {
				 css: `${selector} { cursor: pointer }`,
				 afterViewInit: function(cmp) {
					const titleElem = cmp.base.querySelector(selector);
					const destroyed = fromPromise(cmp.destroyed)
					cmp.mousedownEm = pipe(fromEvent(titleElem, 'mousedown'),takeUntil(destroyed));

					if (id && jb.sessionStorage(id)) {
						  const pos = JSON.parse(jb.sessionStorage(id));
						  dialog.el.style.top  = pos.top  + 'px';
						  dialog.el.style.left = pos.left + 'px';
					}

					let mouseUpEm = pipe(fromEvent(document, 'mouseup'), takeUntil(destroyed))
					let mouseMoveEm = pipe(fromEvent(document, 'mousemove'), takeUntil(destroyed))

					if (jb.studio.previewWindow) {
						mouseUpEm = merge(mouseUpEm, pipe(fromEvent(jb.studio.previewWindow.document, 'mouseup')), takeUntil(destroyed))
						mouseMoveEm = merge(mouseMoveEm, pipe(fromEvent(jb.studio.previewWindow.document, 'mousemove')), takeUntil(destroyed))
					}

					pipe(
							cmp.mousedownEm,
							Do(e => e.preventDefault()),
							map(e =>  ({
								left: e.clientX - dialog.el.getBoundingClientRect().left,
								top:  e.clientY - dialog.el.getBoundingClientRect().top
						  	})),
							flatMap(imageOffset =>
								 pipe(mouseMoveEm, takeUntil(mouseUpEm),
									map(pos => ({
									top:  Math.max(0,pos.clientY - imageOffset.top),
									left: Math.max(0,pos.clientX - imageOffset.left)
									}))
								 )
							),
							//distinctUntilChanged(),
							forEach(pos => {
								dialog.el.style.top  = pos.top  + 'px';
								dialog.el.style.left = pos.left + 'px';
								if (id) jb.sessionStorage(id, JSON.stringify(pos))
							})
					)
				}
			 }
	  }
})

jb.component('dialog.default', { /* dialog.default */
	type: 'dialog.style',
	impl: customStyle({
	  template: (cmp,{title,contentComp},h) => h('div#jb-dialog jb-default-dialog',{},[
			  h('div#dialog-title',{},title),
			  h('button#dialog-close', {onclick: 'dialogClose' },'×'),
			  h(contentComp),
		  ]),
	  features: dialogFeature.dragTitle()
	})
})

jb.component('dialogFeature.nearLauncherPosition', {
  type: 'dialog-feature',
  params: [
    {id: 'offsetLeft', as: 'number', dynamic: true, defaultValue: 0},
    {id: 'offsetTop', as: 'number', dynamic: true, defaultValue: 0},
    {id: 'rightSide', as: 'boolean', type: 'boolean'}
  ],
  impl: function(context,offsetLeftF,offsetTopF,rightSide) {
		return {
			afterViewInit: function(cmp) {
				let offsetLeft = offsetLeftF() || 0, offsetTop = offsetTopF() || 0;
				const jbDialog = jb.ui.findIncludeSelf(cmp.base,'.jb-dialog')[0];
				if (!context.vars.$launchingElement) {
					if (typeof event == 'undefined')
						return console.log('no launcher for dialog');
					jbDialog.style.left = offsetLeft + event.clientX + 'px'
					jbDialog.style.top = offsetTop + event.clientY + 'px'
					return
				}
				const control = context.vars.$launchingElement.el;
				const launcherHeightFix = context.vars.$launchingElement.launcherHeightFix || jb.ui.outerHeight(control)
				const pos = jb.ui.offset(control);
				offsetLeft += rightSide ? jb.ui.outerWidth(control) : 0;
				const fixedPosition = fixDialogOverflow(control,jbDialog,offsetLeft,offsetTop);
				jbDialog.style.display = 'block';
				jbDialog.style.left = (fixedPosition ? fixedPosition.left : pos.left + offsetLeft) + 'px';
				jbDialog.style.top = (fixedPosition ? fixedPosition.top : pos.top + launcherHeightFix + offsetTop) + 'px';
			}
		}

		function fixDialogOverflow(control,dialog,offsetLeft,offsetTop) {
			let top,left
			const padding = 2,control_offset = jb.ui.offset(control), dialog_height = jb.ui.outerHeight(dialog), dialog_width = jb.ui.outerWidth(dialog);
			if (control_offset.top > dialog_height && control_offset.top + dialog_height + padding + (offsetTop||0) > window.innerHeight + window.pageYOffset)
				top = control_offset.top - dialog_height;
			if (control_offset.left > dialog_width && control_offset.left + dialog_width + padding + (offsetLeft||0) > window.innerWidth + window.pageXOffset)
				left = control_offset.left - dialog_width;
			if (top || left)
				return { top: top || control_offset.top , left: left || control_offset.left}
		}
	}
})

jb.component('dialogFeature.onClose', {
  type: 'dialog-feature',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: interactive( (ctx,{$dialog},{action}) => {
		const {pipe,filter,subscribe,take} = jb.callbag
		pipe($dialog.em, filter(e => e.type == 'close'), take(1), subscribe(e=> action(ctx.setData(e.OK)))
	)})
})

jb.component('dialogFeature.closeWhenClickingOutside', {
  type: 'dialog-feature',
  params: [
    {id: 'delay', as: 'number', defaultValue: 100}
  ],
  impl: function(context,_delay) {
		const dialog = context.vars.$dialog;
		dialog.isPopup = true;
		jb.delay(10).then(() =>  { // delay - close older before
			const {pipe, fromEvent, takeUntil,subscribe, merge,filter,take,delay} = jb.callbag
			let clickoutEm = fromEvent(document, 'mousedown');
			if (jb.studio.previewWindow)
				clickoutEm = merge(clickoutEm, fromEvent((jb.studio.previewWindow || {}).document, 'mousedown'))

			pipe(clickoutEm,
				filter(e => jb.ui.closest(e.target,'.jb-dialog') == null),
   				takeUntil( pipe(dialog.em, filter(e => e.type == 'close'))),
				take(1),
				delay(_delay),
				subscribe(()=> dialog.close())
			)
  		})
	}
})

jb.component('dialog.closeDialog', {
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'delay', as: 'number', defaultValue: 200}
  ],
  impl: (ctx,id,delay) => jb.ui.dialogs.closeDialogs(jb.ui.dialogs.dialogs.filter(d=>d.id == id))
})

jb.component('dialog.closeAll', {
  type: 'action',
  impl: ctx => jb.ui.dialogs.closeAll()
})

jb.component('dialogFeature.autoFocusOnFirstInput', {
  type: 'dialog-feature',
  params: [
    {id: 'selectText', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,selectText) => ({
		afterViewInit: cmp => {
			jb.delay(1).then(_=> {
				const elem = ctx.vars.$dialog.el.querySelector('input,textarea,select');
				if (elem)
					jb.ui.focus(elem, 'dialog-feature.auto-focus-on-first-input',ctx);
				if (selectText)
					elem.select();
			})
		}
	})
})

jb.component('dialogFeature.cssClassOnLaunchingElement', {
  type: 'dialog-feature',
  impl: context => ({
		afterViewInit: cmp => {
			if (!context.vars.$launchingElement) return
			const {pipe,filter,subscribe,take} = jb.callbag
			const dialog = context.vars.$dialog;
			const control = context.vars.$launchingElement.el;
			jb.ui.addClass(control,'dialog-open');
			pipe(dialog.em, filter(e=> e.type == 'close'), take(1), subscribe(()=> jb.ui.removeClass(control,'dialog-open')))
		}
	})
})

jb.component('dialogFeature.maxZIndexOnClick', {
  type: 'dialog-feature',
  params: [
    {id: 'minZIndex', as: 'number'}
  ],
  impl: function(context,minZIndex) {
		const dialog = context.vars.$dialog;

		return ({
			afterViewInit: cmp => {
				setAsMaxZIndex();
				dialog.el.onmousedown = setAsMaxZIndex;
			}
		})

		function setAsMaxZIndex() {
			const maxIndex = jb.ui.dialogs.dialogs.reduce((max,d) =>
				Math.max(max,(d.el && parseInt(d.el.style.zIndex || 100)+1) || 100)
			, minZIndex || 100)
			dialog.el.style.zIndex = maxIndex;
		}
	}
})

jb.component('dialog.dialogOkCancel', {
  type: 'dialog.style',
  params: [
    {id: 'okLabel', as: 'string', defaultValue: 'OK'},
    {id: 'cancelLabel', as: 'string', defaultValue: 'Cancel'}
  ],
  impl: customStyle({
    template: (cmp,{title,contentComp,cancelLabel,okLabel},h) => h('div',{ class: 'jb-dialog jb-default-dialog'},[
			h('div',{class: 'dialog-title'},title),
			h('button',{class: 'dialog-close', onclick: 'dialogClose' },'×'),
			h(contentComp),
			h('div',{class: 'dialog-buttons'},[
				h('button',{class: 'mdc-button', onclick: 'dialogClose' },cancelLabel),
				h('button',{class: 'mdc-button', onclick: 'dialogCloseOK' },okLabel),
			]),
		]),
    css: '>.dialog-buttons { display: flex; justify-content: flex-end; margin: 5px }'
  })
})

jb.component('dialogFeature.resizer', {
  type: 'dialog-feature',
  params: [
    {id: 'resizeInnerCodemirror', as: 'boolean', description: 'effective only for dialog with a single codemirror element', type: 'boolean'}
  ],
  impl: (ctx,codeMirror) => ({
	templateModifier: (vdom,cmp,state) => {
            if (vdom && vdom.tag != 'div') return vdom;
				vdom.children.push(jb.ui.h('img', {class: 'jb-resizer'}));
			return vdom;
	},
	css: '>.jb-resizer { cursor: pointer; position: absolute; right: 1px; bottom: 1px }',

	afterViewInit: function(cmp) {
		const resizerElem = cmp.base.querySelector('.jb-resizer');
		const {pipe, map, flatMap,takeUntil, merge,subscribe,Do} = jb.callbag

		cmp.mousedownEm = jb.ui.fromEvent(cmp,'mousedown',resizerElem)
		let mouseUpEm = jb.ui.fromEvent(cmp,'mouseup',document)
		let mouseMoveEm = jb.ui.fromEvent(cmp,'mousemove',document)

		if (jb.studio.previewWindow) {
			mouseUpEm = merge(mouseUpEm,jb.ui.fromEvent(cmp,'mouseup',jb.studio.previewWindow.document))
			mouseMoveEm = merge(mouseMoveEm,jb.ui.fromEvent(cmp,'mousemove',jb.studio.previewWindow.document))
		}

		let codeMirrorElem,codeMirrorSizeDiff;
		pipe(cmp.mousedownEm,
			Do(e=>{
				if (codeMirror) {
					codeMirrorElem = cmp.base.querySelector('.CodeMirror,.jb-textarea-alternative-for-codemirror');
					if (codeMirrorElem)
					codeMirrorSizeDiff = codeMirrorElem.getBoundingClientRect().top - cmp.base.getBoundingClientRect().top
						+ (cmp.base.getBoundingClientRect().bottom - codeMirrorElem.getBoundingClientRect().bottom);
				}
			}),
			map(e =>  ({
				left: cmp.base.getBoundingClientRect().left,
				top:  cmp.base.getBoundingClientRect().top
			})),
			flatMap(imageOffset =>
				pipe(mouseMoveEm,
					takeUntil(mouseUpEm),
					map(pos => ({ top:  pos.clientY - imageOffset.top, left: pos.clientX - imageOffset.left }))
				)
			),
			subscribe(pos => {
				cmp.base.style.height  = pos.top  + 'px';
				cmp.base.style.width = pos.left + 'px';
				if (codeMirrorElem)
					codeMirrorElem.style.height  = (pos.top - codeMirrorSizeDiff) + 'px';
			})
		  )
	}})
})

jb.component('dialog.popup', {
  type: 'dialog.style',
  impl: customStyle({
	template: (cmp,state,h) => h('div#jb-dialog jb-popup',{},h(state.contentComp)),
    css: '{ position: absolute; background: white; box-shadow: 2px 2px 3px #d5d5d5; padding: 3px 0; border: 1px solid rgb(213, 213, 213) }',
    features: [
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.nearLauncherPosition({})
    ]
  })
})

jb.component('dialog.transparent-popup', {
	type: 'dialog.style',
	impl: customStyle({
	  template: (cmp,state,h) => h('div#jb-dialog jb-popup',{},h(state.contentComp)),
	  css: '{ position: absolute; padding: 3px 0; }',
	  features: [
		dialogFeature.maxZIndexOnClick(),
		dialogFeature.closeWhenClickingOutside(),
		dialogFeature.cssClassOnLaunchingElement(),
		dialogFeature.nearLauncherPosition({})
	  ]
	})
  })
  
jb.component('dialog.div', {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup'},h(state.contentComp)),
    css: '{ position: absolute }'
  })
})

jb.ui.dialogs = {
	dialogs: [],
	buildComp(ctx) { // used with addDialog profile
		const dialog = ctx.vars.$dialog
		return jb.ui.ctrl(ctx, features(
			calcProp('title', _ctx=> _ctx.vars.$model.title(_ctx)),
			calcProp('contentComp', '%$$model.content%'),
			calcProp('hasMenu', '%$$model/menu/profile%'),
			calcProp('menuComp', '%$$model/menu%'),
			feature.init( ({},{cmp}) => cmp.dialog = dialog),
			interactive( ({},{cmp}) => {
				dialog.cmp = cmp
				cmp.dialog = dialog
				dialog.onOK = ctx2 => ctx.params.onOK(cmp.ctx.extendVars(ctx2));
				cmp.dialogCloseOK = () => dialog.close({OK: true});
				cmp.dialogClose = args => dialog.close(args);
				dialog.el = cmp.base;
				if (!cmp.base.style.zIndex) cmp.base.style.zIndex = 100;
		})))
	},

	addDialog(dialog,ctx) {
		const self = this;
		jb.log('addDialog',[dialog])
		this.dialogs.push(dialog);
		if (dialog.modal && !document.querySelector('.modal-overlay'))
			jb.ui.addHTML(document.body,'<div class="modal-overlay"></div>');
		jb.ui.render(jb.ui.h(this.buildComp(ctx)), this.dialogsTopElem(ctx))
		this.dialogs.forEach(d=> d.em.next({ type: 'new-dialog', dialog }));

		dialog.close = function(args) {
			jb.log('closeDialog',[dialog])
			if (this.hasFields && jb.ui.checkFormValidation) {
				jb.ui.checkFormValidation(dialog.el)
				if (ctx.vars.formContainer.err && args && args.OK) // not closing dialog with errors
					return;
			}
			return Promise.resolve().then(_=>{
				if (dialog.closing) return;
				dialog.closing = true;
				if (dialog.onOK && args && args.OK)
					return dialog.onOK(ctx)
			}).then( _ => {
				dialog.em.next({type: 'close', OK: args && args.OK})
				dialog.em.complete();

				const index = self.dialogs.indexOf(dialog);
				if (index != -1)
					self.dialogs.splice(index, 1);
				if (dialog.modal && document.querySelector('.modal-overlay'))
					document.body.removeChild(document.querySelector('.modal-overlay'));
				jb.ui.unmount(dialog.el)
				if (dialog.el.parentElement === self.dialogsTopElem(ctx))
					self.dialogsTopElem(ctx).removeChild(dialog.el)
			})
		},
		dialog.closed = () => self.dialogs.indexOf(dialog) == -1;
	},
	closeDialogs(dialogs) {
		return dialogs.slice(0).reduce((pr,dialog) => pr.then(()=>dialog.close()), Promise.resolve())
	},
	closeAll() {
		return this.closeDialogs(this.dialogs)
	},
	closePopups() {
		return jb.ui.dialogs.closeDialogs(jb.ui.dialogs.dialogs.filter(d=>d.isPopup))
	},
	dialogsTopElem(ctx) {
		if (!this._dialogsTopElem) {
			this._dialogsTopElem = (ctx.vars.elemToTest || document.body).ownerDocument.createElement('div')
			this._dialogsTopElem.className = 'jb-dialogs'
			;(ctx.vars.elemToTest || document.body).appendChild(this._dialogsTopElem)
		}
		return this._dialogsTopElem
	},
	reRenderAll(ctx) {
		this._dialogsTopElem && Array.from(this._dialogsTopElem.children).filter(x=>x).forEach(el=> jb.ui.refreshElem(el,null,{srcCtx: ctx}))
	}
}
;

jb.ns('itemlist,itemlistContainer')

jb.component('itemlist', {
  description: 'list, dynamic group, collection, repeat',
  type: 'control',
  category: 'group:80,common:80',
  params: [
    {id: 'title', as: 'string'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'controls', type: 'control[]', mandatory: true, dynamic: true},
    {id: 'style', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.ulLi()},
    {id: 'layout', type: 'layout'},
    {id: 'itemVariable', as: 'string', defaultValue: 'item'},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default itemlist is limmited to 100 shown items'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, ctx.params.layout)
})

jb.component('itemlist.noContainer', {
  type: 'feature',
  category: 'group:20',
  impl: ctx => ({ extendCtx: (ctx,cmp) => ctx.setVars({itemlistCntr: null}) })
})

jb.component('itemlist.initContainerWithItems', {
  type: 'feature',
  category: 'itemlist:20',
  impl: calcProp({
    id: 'updateItemlistCntr',
    value: action.if('%$itemlistCntr%',writeValue('%$itemlistCntr.items%', '%$$props.items%')),
    phase: 100
  })
})

jb.component('itemlist.init', {
  type: 'feature',
  impl: features(
    calcProp('items', (ctx,{cmp}) => jb.ui.itemlistCalcItems(ctx,cmp)),
    calcProp({
        id: 'ctrls',
        value: ctx => {
          const controlsOfItem = item =>
            ctx.vars.$model.controls(ctx.setVar(ctx.vars.$model.itemVariable,item).setData(item)).filter(x=>x)
          return ctx.vars.$props.items.map(item=> Object.assign(controlsOfItem(item),{item})).filter(x=>x.length > 0)
        }
      }),
    itemlist.initContainerWithItems()
  )
})

jb.component('itemlist.initTable', {
  type: 'feature',
  impl: features(
    calcProp('items', (ctx,{cmp}) => jb.ui.itemlistCalcItems(ctx,cmp)),
    calcProp({id: 'fields', value: '%$$model/controls/field%'}),
    itemlist.initContainerWithItems()
  )
})

jb.component('itemlist.infiniteScroll', {
  type: 'feature',
  params: [
    {id: 'pageSize', as: 'number', defaultValue: 2}
  ],
  impl: features(
    defHandler('onscrollHandler', (ctx,{ev, $state},{pageSize}) => {
      const elem = ev.target
      if (!$state.visualLimit || !ev.scrollPercentFromTop || ev.scrollPercentFromTop < 0.9) return
      const allItems = ctx.vars.$model.items()
      const needsToLoadMoreItems = $state.visualLimit.shownItems && $state.visualLimit.shownItems < allItems.length
      if (!needsToLoadMoreItems) return
      const cmpCtx = jb.ui.ctxOfElem(elem)
      if (!cmpCtx) return
      const itemsToAppend = allItems.slice($state.visualLimit.shownItems, $state.visualLimit.shownItems + pageSize)
      const ctxToRun = cmpCtx.ctx({profile: Object.assign({},cmpCtx.profile,{ items: () => itemsToAppend}), path: ''}) // change the profile to return itemsToAppend
      const vdom = ctxToRun.runItself().renderVdom()
      const itemlistVdom = jb.ui.findIncludeSelf(vdom,'tbody')[0] || jb.ui.findIncludeSelf(vdom,'.jb-itemlist')[0]
      const elemToExpand = jb.ui.findIncludeSelf(elem,'tbody')[0] || jb.ui.findIncludeSelf(elem,'.jb-itemlist')[0]
      if (itemlistVdom) {
        console.log(itemsToAppend,ev)
        jb.ui.appendItems(elemToExpand,itemlistVdom,ctx)
        $state.visualLimit.shownItems += itemsToAppend.length
      }
    }
      ),
    templateModifier(({},{vdom}) => vdom.setAttribute('onscroll',true))
  )
})

jb.component('itemlist.fastFilter', {
  type: 'feature',
  description: 'use display:hide to filter itemlist elements',
  params: [
    {id: 'showCondition', mandatory: true, dynamic: true, defaultValue: itemlistContainer.conditionFilter()},
    {id: 'filtersRef', mandatory: true, as: 'ref', dynamic: true, defaultValue: '%$itemlistCntrData/search_pattern%'}
  ],
  impl: interactive(
    (ctx,{cmp},{showCondition,filtersRef}) =>
      jb.subscribe(jb.ui.refObservable(filtersRef(cmp.ctx),cmp,{srcCtx: ctx}),
          () => Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item')).forEach(elem=>
                elem.style.display = showCondition(jb.ctxDictionary[elem.getAttribute('jb-ctx')]) ? 'block' : 'none'))
  )
})

jb.component('itemlist.ulLi', {
  type: 'itemlist.style',
  impl: customStyle({
    template: (cmp,{ctrls},h) => h('ul#jb-itemlist',{},
        ctrls.map(ctrl=> h('li#jb-item', {'jb-ctx': jb.ui.preserveCtx(ctrl[0] && ctrl[0].ctx)} ,
          ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features: itemlist.init()
  })
})

jb.component('itemlist.div', {
  type: 'itemlist.style',
  params: [
    {id: 'spacing', as: 'number', defaultValue: 0}
  ],
  impl: customStyle({
    template: (cmp,{ctrls},h) => h('div#jb-itemlist jb-drag-parent',{},
        ctrls.map(ctrl=> h('div#jb-item', {'jb-ctx': jb.ui.preserveCtx(ctrl[0] && ctrl[0].ctx)} ,
          ctrl.map(singleCtrl=>h(singleCtrl))))),
    features: itemlist.init()
  })
})

jb.component('itemlist.horizontal', {
  type: 'itemlist.style',
  params: [
    {id: 'spacing', as: 'number', defaultValue: 0}
  ],
  impl: customStyle({
    template: (cmp,{ctrls},h) => h('div#jb-itemlist jb-drag-parent',{},
        ctrls.map(ctrl=> h('div#jb-item', {'jb-ctx': jb.ui.preserveCtx(ctrl[0] && ctrl[0].ctx)} ,
          ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features: itemlist.init()
  })
})

jb.ui.itemlistInitCalcItems = cmp => cmp.calcItems = cmp.calcItems || (() => Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item'))
    .map(el=>(jb.ctxDictionary[el.getAttribute('jb-ctx')] || {}).data).filter(x=>x).map(x=>jb.val(x)))

jb.ui.itemlistCalcItems = function(ctx,cmp) {
  const slicedItems = addSlicedState(cmp, ctx.vars.$model.items(), ctx.vars.$model.visualSizeLimit)
  const itemsRefs = jb.isRef(jb.asRef(slicedItems)) ? 
      Object.keys(slicedItems).map(i=>jb.objectProperty(slicedItems,i)) : slicedItems
  return itemsRefs

  function addSlicedState(cmp,items,visualLimit) {
    if (items.length > visualLimit)
      cmp.state.visualLimit = { totalItems: items.length, shownItems: visualLimit }
      return visualLimit < items.length ? items.slice(0,visualLimit) : items
  }
}

// ****************** Selection ******************

jb.component('itemlist.selection', {
  type: 'feature',
  params: [
    {id: 'databind', as: 'ref', defaultValue: '%$itemlistCntrData/selected%', dynamic: true},
    {id: 'selectedToDatabind', dynamic: true, defaultValue: '%%'},
    {id: 'databindToSelected', dynamic: true, defaultValue: '%%'},
    {id: 'onSelection', type: 'action', dynamic: true},
    {id: 'onDoubleClick', type: 'action', dynamic: true},
    {id: 'autoSelectFirst', type: 'boolean'},
    {id: 'cssForSelected', as: 'string', description: 'e.g. background: #bbb', defaultValue: 'background: #bbb !important; color: #fff !important'}
  ],
  impl: (ctx,databind) => ({
    onclick: true,
    ondblclick: true,
    afterViewInit: cmp => {
        const {pipe,map,filter,subscribe,merge,subject,distinctUntilChanged,catchError} = jb.callbag
        cmp.selectionEmitter = subject();
        cmp.clickEmitter = pipe(
          merge(cmp.onclick,cmp.ondblclick),
          map(e=>dataOfElem(e.target)),
          filter(x=>x)
        )
        pipe(cmp.ondblclick,
          map(e=> dataOfElem(e.target)),
          filter(x=>x),
          subscribe(data => ctx.params.onDoubleClick(cmp.ctx.setData(data)))
        )

        jb.ui.itemlistInitCalcItems(cmp)
        cmp.items = cmp.calcItems()

        cmp.setSelected = selected => {
          cmp.state.selected = selected
          if (!cmp.base) return
          Array.from(cmp.base.querySelectorAll('.jb-item.selected,*>.jb-item.selected,*>*>.jb-item.selected'))
            .forEach(elem=>elem.classList.remove('selected'))
          Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item'))
            .filter(elem=> jb.val((jb.ctxDictionary[elem.getAttribute('jb-ctx')] || {}).data) === jb.val(selected))
            .forEach(elem=> {elem.classList.add('selected'); elem.scrollIntoViewIfNeeded()})
        }
        cmp.doRefresh = () => cmp.setSelected(cmp.state.selected)

        pipe(merge(cmp.selectionEmitter,cmp.clickEmitter),
          distinctUntilChanged(),
          filter(x=>x),
          subscribe( selected => {
              writeSelectedToDatabind(selected);
              cmp.setSelected(selected)
              ctx.params.onSelection(cmp.ctx.setData(selected));
        }))

        const selectedRef = databind()

        jb.isWatchable(selectedRef) && pipe(
          jb.ui.refObservable(selectedRef,cmp,{throw: true, srcCtx: ctx}),
          catchError(() => cmp.setSelected(null) || []),
          subscribe(() => cmp.setSelected(selectedOfDatabind()))
        )

        if (cmp.state.selected && cmp.items.indexOf(cmp.state.selected) == -1) // clean irrelevant selection
          cmp.state.selected = null;
        if (selectedOfDatabind()) //selectedRef && jb.val(selectedRef))
          cmp.setSelected(selectedOfDatabind())
        if (!cmp.state.selected)
          autoSelectFirstWhenEnabled()

        function autoSelectFirstWhenEnabled() {
          if (ctx.params.autoSelectFirst && cmp.items[0] && !jb.val(selectedRef))
              jb.delay(1).then(()=> cmp.selectionEmitter.next(cmp.items[0]))
        }
        function writeSelectedToDatabind(selected) {
          return selectedRef && jb.writeValue(selectedRef,ctx.params.selectedToDatabind(ctx.setData(selected)), ctx)
        }
        function selectedOfDatabind() {
          return selectedRef && jb.val(ctx.params.databindToSelected(ctx.setVars({items: cmp.calcItems()}).setData(jb.val(selectedRef))))
        }
        function dataOfElem(el) {
          const itemElem = jb.ui.closest(el,'.jb-item')
          const ctxId = itemElem && itemElem.getAttribute('jb-ctx')
          return jb.val(((ctxId && jb.ctxDictionary[ctxId]) || {}).data)
        }
    },
    css: ['>.selected','>*>.selected','>*>*>.selected'].map(sel=>sel+ ' ' + jb.ui.fixCssLine(ctx.params.cssForSelected)).join('\n')
  })
})

jb.component('itemlist.keyboardSelection', {
  type: 'feature',
  macroByValue: false,
  params: [
    {id: 'autoFocus', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true}
  ],
  impl: ctx => ({
    templateModifier: vdom => {
      vdom.attributes = vdom.attributes || {};
      vdom.attributes.tabIndex = 0
    },
    afterViewInit: cmp => {
        const {pipe,map,filter,subscribe,merge} = jb.callbag
        const selectionKeySourceCmp = jb.ui.parentCmps(cmp.base).find(_cmp=>_cmp.selectionKeySource)
        let onkeydown = jb.path(cmp.ctx.vars,'itemlistCntr.keydown') || jb.path(selectionKeySourceCmp,'onkeydown');
        if (!onkeydown) {
          onkeydown = jb.ui.fromEvent(cmp, 'keydown')
          if (ctx.params.autoFocus)
            jb.ui.focus(cmp.base,'itemlist.keyboard-selection init autoFocus',ctx)
        } else {
          onkeydown = merge(onkeydown,jb.ui.fromEvent(cmp, 'keydown'))
        }
        cmp.onkeydown = onkeydown
        jb.ui.itemlistInitCalcItems(cmp)

        pipe(cmp.onkeydown,
          filter(e=> e.keyCode == 13 && cmp.state.selected),
          subscribe(() => ctx.params.onEnter(cmp.ctx.setData(cmp.state.selected))))

        pipe(cmp.onkeydown,
          filter(ev => !ev.ctrlKey && (ev.keyCode == 38 || ev.keyCode == 40)),
          map(ev => {
              ev.stopPropagation();
              const diff = ev.keyCode == 40 ? 1 : -1;
              cmp.items = cmp.calcItems()
              const selectedIndex = cmp.items.indexOf(cmp.state.selected) + diff
              return cmp.items[Math.min(cmp.items.length-1,Math.max(0,selectedIndex))];
          }),
          subscribe(selected => cmp.selectionEmitter && cmp.selectionEmitter.next(selected) ))
      },
    })
})

jb.component('itemlist.dragAndDrop', {
  type: 'feature',
  impl: ctx => ({
      afterViewInit: function(cmp) {
        if (!jb.frame.dragula)
          return jb.logError('itemlist.dragAndDrop - the dragula lib is not loaded')
        jb.ui.itemlistInitCalcItems(cmp)

        cmp.itemsAsRef = () => jb.asRef(jb.path(jb.ctxDictionary,`${cmp.base.getAttribute('jb-ctx')}.params.items`)())

        const drake = dragula([cmp.base.querySelector('.jb-drag-parent') || cmp.base] , {
          moves: (el,source,handle) => jb.ui.parents(handle,{includeSelf: true}).some(x=>jb.ui.hasClass(x,'drag-handle'))
        })

        drake.on('drag', function(el, source) {
          cmp.items = cmp.calcItems()
          let item = jb.val(el.getAttribute('jb-ctx') && jb.ctxDictionary[el.getAttribute('jb-ctx')].data);
          if (!item) {
            const item_comp = el._component || (el.firstElementChild && el.firstElementChild._component);
            item = item_comp && item_comp.ctx.data;
          }
          el.dragged = {
            item,
            remove: item => cmp.items.splice(cmp.items.indexOf(item), 1)
          }
          cmp.selectionEmitter && cmp.selectionEmitter.next(el.dragged.item);
        });
        drake.on('drop', (dropElm, target, source,sibling) => {
            const draggedIndex = cmp.items.indexOf(dropElm.dragged.item)
            const targetIndex = sibling ? jb.ui.index(sibling) : cmp.items.length
            jb.move(jb.asRef(cmp.items[draggedIndex]),jb.asRef(cmp.items[targetIndex-1]),ctx)
            dropElm.dragged = null;
            cmp.doRefresh && cmp.doRefresh()
        })
        cmp.dragAndDropActive = true

        // ctrl + Up/Down
        jb.delay(1).then(_=>{ // wait for the keyboard selection to register keydown
        if (!cmp.onkeydown) return;
        jb.subscribe(cmp.onkeydown, e => {
            if (e.ctrlKey && (e.keyCode == 38 || e.keyCode == 40)) {
              cmp.items = cmp.calcItems()
              const diff = e.keyCode == 40 ? 1 : -1;
              const selectedIndex = cmp.items.indexOf(jb.val(cmp.state.selected))
              if (selectedIndex == -1) return;
              const targetIndex = (selectedIndex + diff+ cmp.items.length) % cmp.items.length;
              jb.move(jb.asRef(cmp.state.selected),jb.asRef(cmp.items[targetIndex]),ctx)
              cmp.items = cmp.calcItems()
              cmp.selectionEmitter && cmp.selectionEmitter.next(cmp.items[targetIndex])
        }})
        })
      }
    })
})

jb.component('itemlist.dragHandle', {
  description: 'put on the control inside the item which is used to drag the whole line',
  type: 'feature',
  impl: list(
    css.class('drag-handle'),
    css('{cursor: pointer}')
  )
})

jb.component('itemlist.shownOnlyOnItemHover', {
  type: 'feature',
  category: 'itemlist:75',
  description: 'put on the control inside the item which is shown when the mouse enters the line',
  impl: (ctx,cssClass,cond) => ({
    class: 'jb-shown-on-item-hover',
  })
})

jb.component('itemlist.divider', {
  type: 'feature',
  params: [
    {id: 'space', as: 'number', defaultValue: 5}
  ],
  impl: (ctx,space) =>
    ({css: `>.jb-item:not(:first-of-type) { border-top: 1px solid rgba(0,0,0,0.12); padding-top: ${space}px }`})
})
;

(function() {
jb.ns('search')

const createItemlistCntr = (ctx,params) => ({
	id: params.id,
	defaultItem: params.defaultItem,
	filter_data: {},
	filters: [],
	selectedRef: ctx.exp('%$itemlistCntrData/selected%','ref'),
	selected: function(selected) {
		if (!jb.isValid(this.selectedRef)) return;
		return (typeof selected != 'undefined') ?
			jb.writeValue(this.selectedRef,selected,ctx) : jb.val(this.selectedRef)
	},
	reSelectAfterFilter: function(filteredItems) {
		if (filteredItems.indexOf(this.selected()) == -1)
			this.selected(filteredItems[0])
	},
	changeSelectionBeforeDelete: function() {
		if (this.items && this.selected) {
			const curIndex = this.items.indexOf(this.selected);
			if (curIndex == -1)
				this.selected = null;
			else if (curIndex == 0 && this.items.length > 0)
				this.selected = this.items[1];
			else if (this.items.length > 0)
				this.selected = this.items[curIndex -1];
			else
				this.selected = null;
		}
	}
})

jb.component('group.itemlistContainer', {
  description: 'itemlist writable container to support addition, deletion and selection',
  type: 'feature',
  category: 'itemlist:80,group:70',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'defaultItem', as: 'single'},
    {id: 'initialSelection', as: 'single'}
  ],
  impl: features(
    variable({
        name: 'itemlistCntrData',
        value: {'$': 'object', search_pattern: '', selected: '%$initialSelection%'},
        watchable: true
      }),
    variable({
        name: 'itemlistCntr',
        value: ctx => createItemlistCntr(ctx,ctx.componentContext.params)
      })
  )
})

jb.component('itemlistContainer.filter', {
  type: 'aggregator',
  category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    {id: 'updateCounters', as: 'boolean'},
  ],
  impl: (ctx,updateCounters) => {
			if (!ctx.vars.itemlistCntr) return;
			const res = ctx.vars.itemlistCntr.filters.reduce((items,filter) => filter(items), ctx.data || []);
			if (ctx.vars.itemlistCntrData.countAfterFilter != res.length)
				jb.delay(1).then(_=>ctx.vars.itemlistCntr.reSelectAfterFilter(res));
			if (updateCounters) { // use merge
					jb.delay(1).then(_=>{
					jb.writeValue(ctx.exp('%$itemlistCntrData/countBeforeFilter%','ref'),(ctx.data || []).length, ctx);
					jb.writeValue(ctx.exp('%$itemlistCntrData/countBeforeMaxFilter%','ref'),resBeforeMaxFilter.length, ctx);
					jb.writeValue(ctx.exp('%$itemlistCntrData/countAfterFilter%','ref'),res.length, ctx);
			}) } else {
				ctx.vars.itemlistCntrData.countAfterFilter = res.length
			}
			return res;
	}
})

jb.component('itemlistContainer.conditionFilter', {
  type: 'boolean',
  category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  impl: ctx => ctx.vars.itemlistCntr &&
		ctx.vars.itemlistCntr.filters.reduce((res,filter) => res && filter([ctx.data]).length, true)
})

jb.component('itemlistContainer.search', {
  type: 'control',
  category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    {id: 'title', as: 'string', dynamic: true, defaultValue: 'Search'},
    {id: 'searchIn', type: 'search-in', dynamic: true, defaultValue: search.searchInAllProperties()},
    {id: 'databind', as: 'ref', dynamic: true, defaultValue: '%$itemlistCntrData/search_pattern%'},
    {id: 'style', type: 'editable-text.style', defaultValue: editableText.mdcSearch(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: (ctx,title,searchIn,databind) =>
		jb.ui.ctrl(ctx,{
			afterViewInit: cmp => {
				if (!ctx.vars.itemlistCntr) return;
				ctx.vars.itemlistCntr.filters.push( items => {
					const toSearch = jb.val(databind()) || '';
					if (jb.frame.Fuse && jb.path(searchIn,'profile.$') == 'search.fuse')
						return toSearch ? new jb.frame.Fuse(items, searchIn()).search(toSearch).map(x=>x.item) : items
					if (typeof searchIn.profile == 'function') // improved performance
						return items.filter(item=>toSearch == '' || searchIn.profile(item).toLowerCase().indexOf(toSearch.toLowerCase()) != -1)

					return items.filter(item=>toSearch == '' || searchIn(ctx.setData(item)).toLowerCase().indexOf(toSearch.toLowerCase()) != -1)
				});
				ctx.vars.itemlistCntr.keydown = jb.ui.upDownEnterEscObs(cmp)
			}
		})
})

jb.component('itemlistContainer.moreItemsButton', {
  type: 'control',
  category: 'itemlist-filter:100',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    {id: 'title', as: 'string', dynamic: true, defaultValue: 'show %$delta% more ... (%$itemlistCntrData/countAfterFilter%/%$itemlistCntrData/countBeforeMaxFilter%)'},
    {id: 'delta', as: 'number', defaultValue: 200},
    {id: 'style', type: 'button.style', defaultValue: button.href(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: controlWithFeatures(
    ctx=>jb.ui.ctrl(ctx),
    [
      watchRef('%$itemlistCntrData/maxItems%'),
      defHandler(
        'onclickHandler',
        writeValue(
          '%$itemlistCntrData/maxItems%',
          (ctx,{itemlistCntrData},{delta}) => delta + itemlistCntrData.maxItems
        )
      ),
      calcProp({
        id: 'title',
        value: (ctx,{},{title,delta}) => title(ctx.setVar('delta',delta))
      }),
      ctx => ({
		templateModifier: (vdom,cmp,state) => { // hide the button when not needed
			if (cmp.ctx.exp('%$itemlistCntrData/countBeforeMaxFilter%','number') == cmp.ctx.exp('%$itemlistCntrData/countAfterFilter%','number'))
				return '';
			return vdom;
		}
	  })
    ]
  )
})

jb.ui.extractPropFromExpression = exp => { // performance for simple cases such as %prop1%
	if (exp.match(/^%.*%$/) && !exp.match(/[./[]/))
		return exp.match(/^%(.*)%$/)[1]
}

// match fields in pattern itemlistCntrData/FLDNAME_filter to data
jb.component('itemlistContainer.filterField', {
  type: 'feature',
  category: 'itemlist:80',
  requires: ctx => ctx.vars.itemlistCntr,
  params: [
    {id: 'fieldData', dynamic: true, mandatory: true},
    {id: 'filterType', type: 'filter-type'}
  ],
  impl: (ctx,fieldData,filterType) => ({
			afterViewInit: cmp => {
				const propToFilter = jb.ui.extractPropFromExpression(ctx.params.fieldData.profile);
				if (propToFilter)
					cmp.itemToFilterData = item => item[propToFilter];
				else
					cmp.itemToFilterData = item => fieldData(ctx.setData(item));

				ctx.vars.itemlistCntr && ctx.vars.itemlistCntr.filters.push(items=>{
						const filterValue = jb.val(ctx.vars.$model.databind());
						if (!filterValue) return items;
						const res = items.filter(item=>filterType.filter(filterValue,cmp.itemToFilterData(item)) );
						if (filterType.sort && (!cmp.state.sortOptions || cmp.state.sortOptions.length == 0) )
							filterType.sort(res,cmp.itemToFilterData,filterValue);
						return res;
				})
		}
	})
})

jb.component('filterType.text', {
  type: 'filter-type',
  params: [
    {id: 'ignoreCase', as: 'boolean', defaultValue: true, type: 'boolean'}
  ],
  impl: (ctx,ignoreCase) => ignoreCase ? ({
		filter: (filter,data) => (data||'').toLowerCase().indexOf((filter||'').toLowerCase()) != -1,
		sort: (items,itemToData,filter) =>  {
			const asWord = new RegExp('\\b' + filter + '\\b','i');
			const score = txt => (asWord.test(txt) ? 5 : 0) + (txt.toLowerCase().indexOf(filter.toLowerCase()) == 0 ? 3 : 0); // higher score for wholeWord or beginsWith
			items.sort((item1,item2)=> score(itemToData(item1) || '') - score(itemToData(item2) || ''))
		}
	}) : ({
		filter: (filter,data) => (data||'').indexOf(filter||'') != -1,
		sort: (items,itemToData,filter) =>  {
			const asWord = new RegExp('\\b' + filter + '\\b');
			const score = txt => (asWord.test(txt) ? 5 : 0) + (txt.indexOf(filter) == 0 ? 3 : 0);
			items.sort((item1,item2)=> score(itemToData(item1) || '') - score(itemToData(item2) || ''))
		}
	})
})

jb.component('filterType.exactMatch', {
  type: 'filter-type',
  impl: ctx => ({
		filter: (filter,data) =>  {
			const _filter = (filter||'').trim(), _data = (data||'').trim();
			return _data.indexOf(_filter) == 0 && _data.length == _filter.length;
		}
	})
})

jb.component('filterType.numeric', {
  type: 'filter-type',
  impl: ctx => ({
		filter: (filter,data) => Number(data) >= Number(filter),
		sort: (items,itemToData) => items.sort((item1,item2)=> Number(itemToData(item1)) - Number(itemToData(item2)))
	})
})

jb.component('search.searchInAllProperties', {
  type: 'search-in',
  impl: ctx => {
		if (typeof ctx.data == 'string') return ctx.data;
		if (typeof ctx.data != 'object') return '';
		return jb.entries(ctx.data).map(e=>e[1]).filter(v=>typeof v == 'string').join('#');
	}
})

jb.component('search.fuse', {
	type: 'search-in',
	description: 'fuse.js search https://fusejs.io/api/options.html#basic-options',
	params: [
		{ id: 'keys', as: 'array', defaultValue: list('id','name'), description: 'List of keys that will be searched. This supports nested paths, weighted search, searching in arrays of strings and objects' },
		{ id: 'findAllMatches', as: 'boolean', defaultValue: false, description: 'When true, the matching function will continue to the end of a search pattern even if a perfect match has already been located in the string' },
		{ id: 'isCaseSensitive', as: 'boolean', defaultValue: false },
		{ id: 'minMatchCharLength', as: 'number', defaultValue: 1, description: 'Only the matches whose length exceeds this value will be returned. (For instance, if you want to ignore single character matches in the result, set it to 2)' },
		{ id: 'shouldSort', as: 'boolean', defaultValue: true, description: 'Whether to sort the result list, by score' },
		{ id: 'location', as: 'number', defaultValue: 0, description: 'Determines approximately where in the text is the pattern expected to be found' },
		{ id: 'threshold', as: 'number', defaultValue: 0.6, description: 'At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match (of both letters and location), a threshold of 1.0 would match anything' },
		{ id: 'distance', as: 'number', defaultValue: 100, description: 'Determines how close the match must be to the fuzzy location (specified by location). An exact letter match which is distance characters away from the fuzzy location would score as a complete mismatch' },
//		{ id: 'includeScore', as: 'boolean', defaultValue: false },
//		{ id: 'includeMatches', as: 'boolean', defaultValue: false },
	],
	impl: ctx => ({ fuseOptions: true, ...ctx.params})
})
  

})()
;

jb.ns('menuStyle,menuSeparator,mdc,icon')

jb.component('menu.menu', {
  type: 'menu.option',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true},
    {id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, mandatory: true, defaultValue: []},
    {id: 'icon', type: 'icon' },
    {id: 'optionsFilter', type: 'data', dynamic: true, defaultValue: '%%'}
  ],
  impl: ctx => ({
		options: ctx2 => ctx.params.optionsFilter(ctx.setData(ctx.params.options(ctx2))),
    title: ctx.params.title(),
    icon: ctx.params.icon,
		applyShortcut: function(e) {
			return this.options().reduce((res,o)=> res || (o.applyShortcut && o.applyShortcut(e)),false)
		},
		ctx
	})
})

jb.component('menu.optionsGroup', {
  type: 'menu.option',
  params: [
    {id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, mandatory: true}
  ],
  impl: (ctx,options) => options()
})

jb.component('menu.dynamicOptions', {
  type: 'menu.option',
  params: [
    {id: 'items', type: 'data', as: 'array', mandatory: true, dynamic: true},
    {id: 'genericOption', type: 'menu.option', mandatory: true, dynamic: true}
  ],
  impl: (ctx,items,generic) => items().map(item => generic(ctx.setData(item)))
})

jb.component('menu.endWithSeparator', {
  type: 'menu.option',
  params: [
    {id: 'options', type: 'menu.option[]', dynamic: true, flattenArray: true, mandatory: true},
    {id: 'separator', type: 'menu.option', as: 'array', defaultValue: menu.separator()},
    {id: 'title', as: 'string'}
  ],
  impl: (ctx) => {
		const options = ctx.params.options();
		if (options.length > 0)
			return options.concat(ctx.params.separator)
		return []
	}
})


jb.component('menu.separator', {
  type: 'menu.option',
  impl: ctx => ({ separator: true })
})

jb.component('menu.action', {
  type: 'menu.option',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true},
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'icon', type: 'icon' },
    {id: 'shortcut', as: 'string'},
    {id: 'showCondition', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: ctx => ctx.params.showCondition && ({
			leaf : ctx.params,
			action: _ => ctx.params.action(ctx.setVars({topMenu:null})), // clean topMenu from context after the action
			title: ctx.params.title(ctx),
			applyShortcut: e=> {
				if (jb.ui.checkKey(e,ctx.params.shortcut)) {
					e.stopPropagation();
					ctx.params.action();
					return true;
				}
			},
			ctx
		})
})

// ********* actions / controls ************

jb.component('menu.control', {
  type: 'control,clickable,menu',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'style', type: 'menu.style', defaultValue: menuStyle.contextMenu(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => {
		const menuModel = ctx.params.menu() || { options: [], ctx, title: ''};
    return jb.ui.ctrl(ctx.setVars({	topMenu: ctx.vars.topMenu || { popups: []},	menuModel	}), features(
      () => ({ctxForPick: menuModel.ctx }),
      calcProp('title','%$menuModel.title%'),
    ))
	}
})

jb.component('menu.openContextMenu', {
  type: 'action',
  params: [
    {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
    {id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue: dialog.contextMenuPopup()},
    {id: 'menuStyle', type: 'menu.style', dynamic: true, defaultValue: menuStyle.contextMenu()},
    {id: 'features', type: 'dialog-feature[]', dynamic: true},
    {id: 'id', as: 'string' } 
  ],
  impl: openDialog({
    id: '%$id%',
    style: call('popupStyle'),
    content: menu.control({menu: call('menu'), style: call('menuStyle')}),
    features: call('features')
  })
})

// ********* styles ************

jb.component('menuStyle.pulldown', {
  type: 'menu.style',
  params: [
    {id: 'innerMenuStyle', type: 'menu.style', dynamic: true, defaultValue: menuStyle.popupAsOption()},
    {id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: menuStyle.optionLine()},
    {id: 'layout', type: 'group.style', dynamic: true, defaultValue: itemlist.horizontal()}
  ],
  impl: styleByControl(
    Var('optionsParentId', ctx => ctx.id),
    Var('innerMenuStyle', ctx => ctx.componentContext.params.innerMenuStyle),
    Var('leafOptionStyle', ctx => ctx.componentContext.params.leafOptionStyle),
    itemlist({
      vars: [
        Var('optionsParentId', ctx => ctx.id),
        Var('innerMenuStyle', ctx => ctx.componentContext.params.innerMenuStyle),
        Var('leafOptionStyle', ctx => ctx.componentContext.params.leafOptionStyle)
      ],
      items: ctx => ctx.vars.menuModel.options && ctx.vars.menuModel.options().filter(x=>x) || [],
      controls: menu.control({menu: '%$item%', style: menuStyle.popupThumb()}),
      style: call('layout'),
      features: menu.selection()
    })
  )
})

jb.component('menuStyle.contextMenu', {
  type: 'menu.style',
  params: [
    {id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: menuStyle.optionLine()}
  ],
  impl: styleByControl(
    Var('optionsParentId', ctx => ctx.id),
    Var('leafOptionStyle', ctx => ctx.componentContext.params.leafOptionStyle),
    itemlist({
      vars: [
        Var('optionsParentId', ctx => ctx.id),
        Var('leafOptionStyle', ctx => ctx.componentContext.params.leafOptionStyle)
      ],
      items: ctx => ctx.vars.menuModel.options && ctx.vars.menuModel.options().filter(x=>x) || [],
      controls: menu.control({menu: '%$item%', style: menuStyle.applyMultiLevel({})}),
      features: menu.selection(true)
    })
  )
})

jb.component('menu.initPopupMenu', {
  type: 'feature',
  params: [
    {id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue: dialog.contextMenuPopup()}
  ],
  impl: features(
    () => ({destroy: cmp => cmp.closePopup()}),
    calcProp({id: 'title', value: '%$menuModel.title%'}),
    interactive(
        (ctx,{cmp}) => {
				cmp.mouseEnter = _ => {
					if (jb.ui.find(ctx,'.context-menu-popup')[0]) // first open with click...
  					cmp.openPopup()
				};
				cmp.openPopup = jb.ui.wrapWithLauchingElement( ctx2 => {
					cmp.ctx.vars.topMenu.popups.push(ctx.vars.menuModel);
					ctx2.run( menu.openContextMenu({
							popupStyle: _ctx => ctx.componentContext.params.popupStyle(_ctx),
							menu: _ctx =>	_ctx.vars.innerMenu ? ctx.vars.innerMenu.menu() : ctx.vars.$model.menu()
						}))
					}, cmp.ctx, cmp.base );

				cmp.closePopup = () => jb.ui.dialogs.closeDialogs(jb.ui.dialogs.dialogs
              .filter(d=>d.id == ctx.vars.optionsParentId))
              .then(()=> cmp.ctx.vars.topMenu.popups.pop()),

				jb.delay(1).then(_=>{ // wait for topMenu keydown initalization
					if (ctx.vars.topMenu && ctx.vars.topMenu.keydown) {
            const {pipe, takeUntil } = jb.callbag
						const keydown = pipe(ctx.vars.topMenu.keydown, takeUntil( cmp.destroyed ))

					  jb.subscribe(keydown, e=> e.keyCode == 39 && // right arrow
						  ctx.vars.topMenu.selected == ctx.vars.menuModel && cmp.openPopup && cmp.openPopup())
            jb.subscribe(keydown, e=> { // left arrow
              if (e.keyCode == 37 && cmp.ctx.vars.topMenu.popups.slice(-1)[0] == ctx.vars.menuModel) {
                ctx.vars.topMenu.selected = ctx.vars.menuModel;
                cmp.closePopup();
              }
          })
				}
			})
		})
  )
})

jb.component('menu.initMenuOption', {
  type: 'feature',
  impl: features(
    calcProp({id: 'title', value: '%$menuModel.leaf.title%'}),
    calcProp({id: 'icon', value: '%$menuModel.leaf.icon%'}),
    calcProp({id: 'shortcut', value: '%$menuModel.leaf.shortcut%'}),
    interactive(
        (ctx,{cmp}) => {
          const {pipe,filter,subscribe,takeUntil} = jb.callbag

          cmp.action = jb.ui.wrapWithLauchingElement( () =>
                jb.ui.dialogs.closePopups().then(() =>	ctx.vars.menuModel.action())
              , ctx, cmp.base);

          jb.delay(1).then(_=>{ // wait for topMenu keydown initalization
          if (ctx.vars.topMenu && ctx.vars.topMenu.keydown) {
            pipe(ctx.vars.topMenu.keydown,
              takeUntil( cmp.destroyed ),
              filter(e=>e.keyCode == 13 && ctx.vars.topMenu.selected == ctx.vars.menuModel), // Enter
              subscribe(_=> cmp.action()))
          }
			})
	}
      )
  )
})

jb.component('menuStyle.applyMultiLevel', {
  type: 'menu.style',
  params: [
    {id: 'menuStyle', type: 'menu.style', dynamic: true, defaultValue: menuStyle.popupAsOption()},
    {id: 'leafStyle', type: 'menu.style', dynamic: true, defaultValue: menuStyle.optionLine()},
    {id: 'separatorStyle', type: 'menu.style', dynamic: true, defaultValue: menuSeparator.line()}
  ],
  impl: ctx => {
			if (ctx.vars.menuModel.leaf)
				return ctx.vars.leafOptionStyle ? ctx.vars.leafOptionStyle(ctx) : ctx.params.leafStyle();
			else if (ctx.vars.menuModel.separator)
				return ctx.params.separatorStyle()
			else if (ctx.vars.innerMenuStyle)
				return ctx.vars.innerMenuStyle(ctx)
			else
				return ctx.params.menuStyle();
		}
})

// jb.component('menu.apply-context-menu-shortcuts', {
//   type: 'feature',
//   impl: ctx => ({
//   	 onkeydown: true,
//      afterViewInit: cmp => {
//         cmp.base.setAttribute('tabIndex','0');
//         if (!ctx.vars.topMenu.keydown) {
//   	        ctx.vars.topMenu.keydown = cmp.onkeydown;
//             jb.ui.focus(cmp.base,'menu.keyboard init autoFocus',ctx);
//       	};
//         const keydown = ctx.vars.topMenu.keydown.takeUntil( cmp.destroyed );
//         keydown.subscribe(e=>cmp.ctx.vars.topMenu.applyShortcut(e))
//       }
//     })
// })

jb.component('menu.selection', {
  type: 'feature',
  params: [
    {id: 'autoSelectFirst', type: 'boolean'}
  ],
  impl: ctx => ({
    onkeydown: true,
    onmousemove: true,
		templateModifier: vdom => {
				vdom.attributes = vdom.attributes || {};
				vdom.attributes.tabIndex = 0
    },
		afterViewInit: cmp => {
				// putting the emitter at the top-menu only and listen at all sub menus
				if (!ctx.vars.topMenu.keydown) {
					ctx.vars.topMenu.keydown = cmp.onkeydown;
						jb.ui.focus(cmp.base,'menu.keyboard init autoFocus',ctx);
			  }
      cmp.items = Array.from(cmp.base.querySelectorAll('.jb-item,*>.jb-item,*>*>.jb-item'))
        .map(el=>(jb.ctxDictionary[el.getAttribute('jb-ctx')] || {}).data)

      const {pipe,map,filter,subscribe,takeUntil} = jb.callbag

			const keydown = pipe(ctx.vars.topMenu.keydown, takeUntil( cmp.destroyed ))
      pipe(cmp.onmousemove, map(e=> dataOfElems(e.target.ownerDocument.elementsFromPoint(e.pageX, e.pageY))),
        filter(data => data && data != ctx.vars.topMenu.selected),
        subscribe(data => cmp.select(data)))
			pipe(keydown, filter(e=> e.keyCode == 38 || e.keyCode == 40 ),
					map(event => {
						event.stopPropagation();
						const diff = event.keyCode == 40 ? 1 : -1;
						const items = cmp.items.filter(item=>!item.separator);
						const selectedIndex = ctx.vars.topMenu.selected.separator ? 0 : items.indexOf(ctx.vars.topMenu.selected);
						if (selectedIndex != -1)
							return items[(selectedIndex + diff + items.length) % items.length];
				}), filter(x=>x), subscribe(data => cmp.select(data)))

			pipe(keydown,filter(e=>e.keyCode == 27), // close all popups
					subscribe(_=> jb.ui.dialogs.closePopups().then(()=> {
              cmp.ctx.vars.topMenu.popups = [];
              cmp.ctx.run({$:'tree.regain-focus'}) // very ugly
      })))

      cmp.select = selected => {
				ctx.vars.topMenu.selected = selected
        if (!cmp.base) return
        Array.from(cmp.base.querySelectorAll('.jb-item.selected, *>.jb-item.selected'))
          .forEach(elem=>elem.classList.remove('selected'))
        Array.from(cmp.base.querySelectorAll('.jb-item, *>.jb-item'))
          .filter(elem=> (jb.ctxDictionary[elem.getAttribute('jb-ctx')] || {}).data === selected)
          .forEach(elem=> elem.classList.add('selected'))
      }
			cmp.state.selected = ctx.vars.topMenu.selected;
			if (ctx.params.autoSelectFirst && cmp.items[0])
            cmp.select(cmp.items[0])

      function dataOfElems(elems) {
        const itemElem = elems.find(el=>el.classList && el.classList.contains('jb-item'))
        const ctxId = itemElem && itemElem.getAttribute('jb-ctx')
        return ((ctxId && jb.ctxDictionary[ctxId]) || {}).data
      }
		},
		css: '>.selected { background: #bbb !important; color: #fff !important }',
		})
})

jb.component('menuStyle.optionLine', {
  type: 'menu-option.style',
  impl: customStyle({
    template: (cmp,{icon,title,shortcut},h) => h('div#line noselect', { onmousedown: 'action' },[
        h(cmp.ctx.run({$: 'control.icon', ...icon, size: 20})),
				h('span#title',{},title),
				h('span#shortcut',{},shortcut),
        h('div#mdc-line-ripple'),
		]),
    css: `{ display: flex; cursor: pointer; font: 13px Arial; height: 24px}
				.selected { background: #d8d8d8 }
				>i { padding: 3px 8px 0 3px }
				>span { padding-top: 3px }
				>.title { display: block; text-align: left; white-space: nowrap; }
				>.shortcut { margin-left: auto; text-align: right; padding-right: 15px }`,
    features: [menu.initMenuOption(), mdc.rippleEffect()]
  })
})

jb.component('menuStyle.popupAsOption', {
  type: 'menu.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div#line noselect', { onmousedown: 'action' },[
				h('span#title',{},state.title),
				h('i#material-icons', { onmouseenter: 'openPopup' },'play_arrow'),
		]),
    css: `{ display: flex; cursor: pointer; font: 13px Arial; height: 24px}
				>i { width: 100%; text-align: right; font-size:16px; padding-right: 3px; padding-top: 3px; }
						>.title { display: block; text-align: left; padding-top: 3px; padding-left: 32px; white-space: nowrap; }
			`,
    features: menu.initPopupMenu(dialog.contextMenuPopup(-24, true))
  })
})

jb.component('menuStyle.popupThumb', {
  type: 'menu.style',
  description: 'used for pulldown',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{
				class: 'pulldown-top-menu-item',
				onmouseenter: 'mouseEnter',
				onclick: 'openPopup'
		},state.title),
    features: [menu.initPopupMenu(), mdc.rippleEffect()]
  })
})

jb.component('dialog.contextMenuPopup', {
  type: 'dialog.style',
  params: [
    {id: 'offsetTop', as: 'number'},
    {id: 'rightSide', as: 'boolean', type: 'boolean'},
    {id: 'toolbar', as: 'boolean', type: 'boolean'},
  ],
  impl: customStyle({
    template: (cmp,{contentComp,toolbar},h) => h('div#jb-dialog jb-popup context-menu-popup', 
      { class: toolbar ? 'toolbar-popup' : 'pulldown-mainmenu-popup'}, h(contentComp)),
    features: [
      dialogFeature.uniqueDialog('%$optionsParentId%', false),
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.nearLauncherPosition({
        offsetTop: '%$offsetTop%',
        rightSide: '%$rightSide%'
      })
    ]
  })
})

jb.component('menuSeparator.line', {
  type: 'menu-separator.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div'),
    css: '{ margin: 6px 0; border-bottom: 1px solid #EBEBEB;}'
  })
})

/***** icon menus */

jb.component('menuStyle.toolbar', {
  type: 'menu.style',
  params: [
    {id: 'leafOptionStyle', type: 'menu-option.style', dynamic: true, defaultValue: menuStyle.icon()},
    {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.horizontal(5)},
  ],
  impl: styleByControl(
    Var('optionsParentId', ctx => ctx.id),
    Var('leafOptionStyle', ctx => ctx.componentContext.params.leafOptionStyle),
    itemlist({
      vars: [
        Var('optionsParentId', ctx => ctx.id),
        Var('leafOptionStyle', ctx => ctx.componentContext.params.leafOptionStyle)
      ],
      style: call('itemlistStyle'),
      items: ctx => ctx.vars.menuModel.options && ctx.vars.menuModel.options().filter(x=>x) || [],
      controls: menu.control({menu: '%$item%', style: menuStyle.applyMultiLevel({
        menuStyle: menuStyle.iconMenu(), leafStyle: menuStyle.icon()
      })}),
    })
  )
})

jb.component('menuStyle.icon', {
  type: 'menu-option.style',
  params: [
    {id: 'buttonSize', as: 'number', defaultValue: 20 },
  ],
  impl: styleWithFeatures(
      button.mdcIcon('%$menuModel/leaf/icon%','%$buttonSize%'),
      [
        htmlAttribute('onclick',true),
        defHandler('onclickHandler', ctx => ctx.vars.menuModel.action())
      ]
  )
})

jb.component('menuStyle.iconMenu', {
  type: 'menu.style',
  impl: styleByControl(
      button({
        title: '%title%',
        action: (ctx,{cmp}) => cmp.openPopup(),
        style: button.mdcIcon(
          icon({
            icon: '%icon/icon%',
            type: '%icon/type%',
            features: css('transform: translate(7px,0px) !important')
          }), 16),
        features: [feature.icon({
          icon: 'more_vert',
          type: 'mdc',
          features: css('transform: translate(-3px,0px) !important')
        }),
          menu.initPopupMenu(dialog.contextMenuPopup({toolbar: true, rightSide: true}))
        ]
      }),
    'innerMenu'),
})
;

jb.ns('picklist')

jb.component('picklist', {
  type: 'control',
  description: 'select, choose, pick, choice',
  category: 'input:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true, templateValue: picklist.optionsByComma()},
    {id: 'promote', type: 'picklist.promote', dynamic: true},
    {id: 'style', type: 'picklist.style', defaultValue: picklist.native(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('picklist.init', {
  type: 'feature',
  impl: features(
    calcProp('options', '%$$model/options%'),
    calcProp('hasEmptyOption', (ctx,{$props}) => $props.options.filter(x=>!x.text)[0]),
  )
})

jb.component('picklist.initGroups', {
  type: 'feature',
  impl: calcProp({id: 'groups', phase: 20, value: (ctx,{$model, $props}) => {
    const options = $props.options;
    const groupsHash = {};
    const promotedGroups = ($model.promote() || {}).groups || [];
    const groups = [];
    options.filter(x=>x.text).forEach(o=>{
      const groupId = groupOfOpt(o);
      const group = groupsHash[groupId] || { options: [], text: groupId};
      if (!groupsHash[groupId]) {
        groups.push(group);
        groupsHash[groupId] = group;
      }
      group.options.push({text: (o.text||'').split('.').pop(), code: o.code });
    })
    groups.sort((p1,p2)=>promotedGroups.indexOf(p2.text) - promotedGroups.indexOf(p1.text));
    return groups

    function groupOfOpt(opt) {
      if (!opt.group && opt.text.indexOf('.') == -1)
        return '---';
      return opt.group || opt.text.split('.').shift();
    }
  }}),
})

jb.component('picklist.dynamicOptions', {
  type: 'feature',
  params: [
    {id: 'recalcEm', as: 'single'}
  ],
  impl: interactive(
    (ctx,{cmp},{recalcEm}) => {
      const {pipe,takeUntil,subscribe} = jb.callbag
      recalcEm && pipe(recalcEm, takeUntil( cmp.destroyed ), subscribe(() => cmp.refresh(null,{srcCtx: ctx.componentContext})))
    }
  )
})

jb.component('picklist.onChange', {
  category: 'picklist:100',
  description: 'on picklist selection',
  type: 'feature',
  description: 'action on picklist selection',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: interactive(
    (ctx,{cmp},{action}) => cmp.onValueChange = (data => action(ctx.setData(data)))
  )
})

// ********* options

jb.component('picklist.optionsByComma', {
  type: 'picklist.options',
  params: [
    {id: 'options', as: 'string', mandatory: true},
    {id: 'allowEmptyValue', type: 'boolean'}
  ],
  impl: (ctx,options,allowEmptyValue) => {
    const emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat((options||'').split(',').map(code=> ({ code: code, text: code })));
  }
})

jb.component('picklist.options', {
  type: 'picklist.options',
  params: [
    {id: 'options', type: 'data', as: 'array', dynamic: true, mandatory: true},
    {id: 'code', as: 'string', dynamic: true, defaultValue: '%%' },
    {id: 'text', as: 'string', dynamic: true, defaultValue: '%%'},
    {id: 'icon', type: 'icon', dynamic: true },
    {id: 'allowEmptyValue', type: 'boolean'}
  ],
  impl: (ctx,options,code,text,icon,allowEmptyValue) => {
    const emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat(options().map(option => ({ code: code(ctx.setData(option)), text: text(ctx.setData(option)), icon: icon(ctx.setData(option)) })));
  }
})

jb.component('picklist.sortedOptions', {
  type: 'picklist.options',
  params: [
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true, composite: true},
    {id: 'marks', as: 'array', description: 'e.g input:80,group:90. 0 mark means hidden. no mark means 50'}
  ],
  impl: (ctx,optionsFunc,marks) => {
    let options = optionsFunc() || [];
    marks.forEach(mark=> {
        const option = options.filter(opt=>opt.code == mark.code)[0];
        if (option)
          option.mark = Number(mark.mark || 50);
    });
    options = options.filter(op=>op.mark != 0);
    options.sort((o1,o2)=>(o2.mark || 50) - (o1.mark || 50));
    return options;
  }
})

jb.component('picklist.promote', {
  type: 'picklist.promote',
  params: [
    {id: 'groups', as: 'array'},
    {id: 'options', as: 'array'}
  ],
  impl: ctx => ctx.params
})
;

jb.ns('multiSelect')

jb.component('multiSelect', {
    type: 'control',
    description: 'select list of options, check multiple',
    category: 'input:80',
    params: [
      {id: 'title', as: 'string', dynamic: true},
      {id: 'databind', as: 'ref', mandaroy: true, dynamic: true },
      {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true },
      {id: 'promote', type: 'picklist.promote', dynamic: true},
      {id: 'style', type: 'multiSelect.style', defaultValue: picklist.native(), dynamic: true},
      {id: 'features', type: 'feature[]', dynamic: true}
    ],
    impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('multiSelect.modelAsBooleanRef',{
    params: [
        {id: 'multiSelectModel'},
        {id: 'code'},
    ],
    impl: (ctx,multiSelectModel,code) => {
        const ref = multiSelectModel.databind()
        return { $jb_val: val => val === undefined ? has() : val === true ? add() : remove() }

        function has() { return jb.val(ref).indexOf(code) != -1 }
        function add() { if (!has(code)) jb.push(ref, code,ctx) }
        function remove() { 
            const index = jb.val(ref).indexOf(code)
            index != -1 && jb.splice(ref,[[index,1]],ctx)
        }
    }
})

jb.component('multiSelect.choiceList', {
    type: 'multiSelect.style',
    params: [
      {id: 'choiceStyle', type: 'editable-boolean.style', dynamic: true, defaultValue: editableBoolean.checkboxWithTitle()},
      {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.ulLi()},
    ],
    impl: styleByControl(
      itemlist({
        items: '%$multiSelectModel/options%',
        controls: editableBoolean({
            textForTrue: '%text%',
            textForFalse: '%text%',
            databind: multiSelect.modelAsBooleanRef('%$multiSelectModel%','%code%'),
            style: call('choiceStyle')
        }),
        style: call('itemlistStyle'),
        features: watchRef({ref: '%$multiSelectModel/databind%', includeChildren: 'yes'})
      }),
      'multiSelectModel'
    )
})

jb.component('multiSelect.chips', {
    type: 'multiSelect.style',
    params: [
      {id: 'chipStyle', type: 'text.style', dynamic: true, defaultValue: text.chip()},
      {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.horizontal()},
    ],
    type: 'multiSelect.style',
    impl: styleByControl(group({
        layout: layout.horizontal(),
        controls: [
            itemlist({
                items: '%$multiSelectModel/databind%',
                style: call('itemlistStyle'),
                controls: group({
                    layout: layout.flex({wrap: 'wrap', spacing: '4'}),
                    controls: [
                        text({
                            text: '%% ', 
                            style: call('chipStyle'),
                            features: itemlist.dragHandle()
                        }),
                        button({
                            title: 'delete',
                            style: button.x(),
                            action: removeFromArray('%$multiSelectModel/databind%','%%'),
                            features: [
                                css('color: black; z-index: 1000;margin-left: -25px'),
                                itemlist.shownOnlyOnItemHover()
                            ]
                        })
                ]}),
                features: itemlist.dragAndDrop()
            }),
            picklist({
                options: pipeline('%$multiSelectModel/options%',filter(not(inGroup('%$multiSelectModel/databind%','%code%')))),
                features: [
                    picklist.onChange(addToArray('%$multiSelectModel/databind%','%%')),
                    picklist.plusIcon(),
                ]
            }),
        ],
        features: watchRef({
            ref: '%$multiSelectModel/databind%', includeChildren: 'yes', allowSelfRefresh: true, strongRefresh: false
        })
    }), 'multiSelectModel')
})
;

jb.type('theme');

jb.component('group.theme', {
  type: 'feature',
  params: [
    {id: 'theme', type: 'theme'}
  ],
  impl: (context,theme) => ({
    extendCtx: (ctx,cmp) => ctx.setVars(theme)
  })
})

jb.component('theme.materialDesign', {
  type: 'theme',
  impl: () => ({
  	'$theme.editable-text': 'editable-text.mdc-input'
  })
})
;

jb.ns('slider,mdcStyle')

jb.component('editableNumber.sliderNoText', {
  type: 'editable-number.style',
  impl: features(
    ctx => ({
      template: (cmp,{min,max,step,databind},h) => h('input',{ type: 'range',
        min, max, step, value: cmp.ctx.vars.editableNumber.numericPart(databind), mouseup: 'onblurHandler', tabindex: -1})
    }),
    field.databind(),
    slider.checkAutoScale(),
    slider.initJbModelWithUnits(),
    slider.init(),
  )
})

jb.component('editableNumber.slider', {
  type: 'editable-number.style',
  impl: styleByControl(
    group({
      title: '%$editableNumberModel/title%',
      controls: group({
        layout: layout.horizontal(20),
        controls: [
          editableText({
            databind: '%$editableNumberModel/databind%',
            style: editableText.input(),
            features: [
              slider.handleArrowKeys(),
              css(
                'width: 30px; padding-left: 3px; border: 0; border-bottom: 1px solid black;'
              ),
              css.class('text-input')
            ]
          }),
          editableNumber({
            databind: '%$editableNumberModel/databind%',
            style: editableNumber.sliderNoText(),
            max: '%$editableNumberModel/max%',
            min: '%$editableNumberModel/min%',
            step: '%$editableNumberModel/step%',            
            features: [css.width(80), css.class('slider-input')]
          })
        ],
        features: [
          variable({name: 'sliderCtx', value: {'$': 'object'}}),
          watchRef('%$editableNumberModel/databind%')
        ]
      })
    }),
    'editableNumberModel'
  )
})

jb.component('editableNumber.mdcSlider', {
  type: 'editable-number.style',
  impl: styleByControl(
    group({
      title: '%$editableNumberModel/title%',
      controls: group({
        layout: layout.horizontal(20),
        controls: [
          editableText({
            databind: '%$editableNumberModel/databind%',
            style: editableText.input(),
            features: [
              slider.handleArrowKeys(),
              css(
                'width: 40px; height: 20px; padding-top: 14px; padding-left: 3px; border: 0; border-bottom: 1px solid black; background: transparent;'
              ),
              css.class('text-input')
            ]
          }),
          editableNumber({
            databind: '%$editableNumberModel/databind%',
            max: '%$editableNumberModel/max%',
            min: '%$editableNumberModel/min%',
            step: '%$editableNumberModel/step%',
            style: editableNumber.mdcSliderNoText({}),
          })
        ],
        features: [
          variable({name: 'sliderCtx', value: {'$': 'object'}}),
          watchRef('%$editableNumberModel/databind%')
        ]
      })
    }),
    'editableNumberModel'
  )
})

jb.component('editableNumber.mdcSliderNoText', {
  type: 'editable-number.style',
  params: [
    { id: 'thumbSize', as: 'number', defaultValue: 21 },
    { id: 'cx', as: 'number', defaultValue: 10.5 },
    { id: 'cy', as: 'number', defaultValue: 10.5 },
    { id: 'r', as: 'number', defaultValue: 7.875 },
  ],
  impl: customStyle({
    template: (cmp,{title,min,max,step,databind,thumbSize,cx,cy,r},h) =>
      h('div#mdc-slider mdc-slider--discrete',{tabIndex: -1, role: 'slider', max, step,
        'aria-valuemin': min, 'aria-valuemax': max, 'aria-valuenow': cmp.ctx.vars.editableNumber.numericPart(databind), 'aria-label': title()}, [
        h('div#mdc-slider__track-container',{}, h('div#mdc-slider__track')),
        h('div#mdc-slider__thumb-container',{},[
          h('div#mdc-slider__pin',{},h('span#mdc-slider__pin-value-marker')),
          h('svg#mdc-slider__thumb',{ width: thumbSize, height: thumbSize}, h('circle',{cx,cy,r})),
          h('div#mdc-slider__focus-ring')
        ])
      ]),
    features: [
      field.databind(),
      slider.initJbModelWithUnits(),
      //slider.init(),
      slider.checkAutoScale(),
      interactiveProp('rebuild mdc on external refresh',(ctx,{cmp}) => {
        cmp.mdcSlider && cmp.mdcSlider.destroy()
        cmp.mdcSlider = new jb.ui.material.MDCSlider(cmp.base)
        //cmp.mdcSlider.listen('MDCSlider:input', ({detail}) =>  !cmp.checkAutoScale(detail.value) && cmp.jbModelWithUnits(detail.value))
        cmp.mdcSlider.listen('MDCSlider:change', () =>
          !cmp.checkAutoScale(cmp.mdcSlider.value) && cmp.jbModelWithUnits(cmp.mdcSlider.value))
      }),
      feature.destroy((ctx,{cmp}) => cmp.mdcSlider && cmp.mdcSlider.destroy()),
    ]
  })
})

jb.component('slider.initJbModelWithUnits', {
  type: 'feature',
  impl: interactive((ctx,{cmp}) => {
        cmp.jbModelWithUnits = val => {
          const numericVal = ctx.vars.editableNumber.numericPart(jb.val(cmp.jbModel()))
          if (val === undefined)
            return numericVal
          else
            cmp.jbModel(ctx.vars.editableNumber.calcDataString(+val,ctx))
        }
  })
})

jb.component('slider.init', {
  type: 'feature',
  impl: ctx => ({
      onkeydown: true,
      onmouseup: true,
      onmousedown: true,
      onmousemove: true,
      afterViewInit: cmp => {
        const step = (+cmp.base.step) || 1
        cmp.handleArrowKey = e => {
            const val = jb.tonumber(cmp.jbModelWithUnits())
            if (val == null) return
            if (e.keyCode == 46) // delete
              jb.writeValue(ctx.vars.$model.databind(),null, ctx);
            if ([37,39].indexOf(e.keyCode) != -1) {
              var inc = e.shiftKey ? step*9 : step;
              if (val !=null && e.keyCode == 39)
                cmp.jbModelWithUnits(Math.min(+cmp.base.max,val+inc));
              if (val !=null && e.keyCode == 37)
                cmp.jbModelWithUnits(Math.max(+cmp.base.min,val-inc));
              cmp.checkAutoScale(cmp.base.value)
            }
        }

        const {pipe,subscribe,flatMap,takeUntil} = jb.callbag
        pipe(cmp.onkeydown,subscribe(e=> cmp.handleArrowKey(e)))

        // drag
        pipe(cmp.onmousedown,
          flatMap(e=> pipe(cmp.onmousemove, takeUntil(cmp.onmouseup))),
          subscribe(e=> !cmp.checkAutoScale(cmp.base.value) && cmp.jbModelWithUnits(cmp.base.value)
          ))

        if (ctx.vars.sliderCtx) // supporting left/right arrow keys in the text field as well
          ctx.vars.sliderCtx.handleArrowKey = e => cmp.handleArrowKey(e);
      }
    })
})

jb.component('slider.checkAutoScale', {
  type: 'feature',
  impl: features(
    calcProp('min'),
    calcProp('step'),      
    calcProp({
        id: 'max',
        value: ctx => {
          const val = ctx.vars.editableNumber.numericPart(jb.val(ctx.vars.$model.databind()))
          if (val > +ctx.vars.$model.max && ctx.vars.$model.autoScale)
            return val + 100
          return +ctx.vars.$model.max
    }}),
    interactive((ctx,{cmp}) => {
      cmp.checkAutoScale = val => {
        if (!ctx.vars.$model.autoScale) return
        const max = +(cmp.base.max || cmp.base.getAttribute('max'))
        const step = +(cmp.base.step || cmp.base.getAttribute('step'))
        if (val == max) { // scale up
          cmp.jbModelWithUnits((+val) + step)
          cmp.refresh(null, {strongRefresh: true},{srcCtx: ctx.componentContext})
          return true
        }
        if (max > ctx.vars.$model.max && val < ctx.vars.$model.max) { // scale down
          cmp.jbModelWithUnits(+val)
          cmp.refresh(null, {strongRefresh: true},{srcCtx: ctx.componentContext})
          return true
        }
      }
    }))
})

jb.component('slider.handleArrowKeys', {
  type: 'feature',
  impl: features(
    htmlAttribute('onkeydown', true),
    defHandler(
        'onkeydownHandler',
        (ctx,{ev}) =>
        ctx.vars.sliderCtx && sliderCtx.handleArrowKey(ev)
      )
  )
})


;

jb.ns('table')

jb.component('table', {
  type: 'control,table',
  category: 'group:80,common:70',
  params: [
    {id: 'title', as: 'string'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'fields', type: 'table-field[]', mandatory: true, dynamic: true},
    {id: 'style', type: 'table.style', dynamic: true, defaultValue: table.plain()},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default table is limmited to 100 shown items'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('field', {
  type: 'table-field',
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'data', as: 'string', mandatory: true, dynamic: true},
    {id: 'hoverTitle', as: 'string', dynamic: true},
    {id: 'width', as: 'number'},
    {id: 'numeric', as: 'boolean', type: 'boolean'},
    {id: 'extendItems', as: 'boolean', type: 'boolean', description: 'extend the items with the calculated field using the title as field name'},
    {id: 'class', as: 'string'}
  ],
  impl: (ctx,title,data,hoverTitle,width,numeric,extendItems,_class) => ({
    title: () => title,
    fieldData: row => extendItems ? row[title] : data(ctx.setData(row)),
    calcFieldData: row => data(ctx.setData(row)),
    hoverTitle: hoverTitle.profile ? (row => hoverTitle(ctx.setData(row))) : null,
    class: _class,
    width: width,
    numeric: numeric,
    extendItems: extendItems,
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

jb.component('field.index', {
  type: 'table-field',
  params: [
    {id: 'title', as: 'string', defaultValue: 'index'},
    {id: 'width', as: 'number', defaultValue: 10},
    {id: 'class', as: 'string'}
  ],
  impl: (ctx,title) => ({
    title: () => title,
    fieldData: (row,index) => index,
    class: _class,
    width: width,
    numeric: true,
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

jb.component('field.control', {
  type: 'table-field',
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'control', type: 'control', dynamic: true, mandatory: true, defaultValue: text('')},
    {id: 'width', as: 'number'},
    {id: 'dataForSort', dynamic: true},
    {id: 'numeric', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,title,control,width,dataForSort,numeric) => ({
    title: () => title,
    control: row => control(ctx.setData(row)),
    width: width,
    fieldData: row => dataForSort(ctx.setData(row)),
    numeric: numeric,
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

// todo - move to styles

jb.component('button.tableCellHref', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,state,h) => h('a',{href: 'javascript:;', onclick: true}, state.title),
    css: '{color: grey}'
  })
})

jb.component('table.initTableOrItemlist', {
  type: 'feature',
  impl: ctx => ctx.run(ctx.vars.$model.fields ? table.init() : itemlist.initTable())
})

jb.component('table.init', {
  type: 'feature',
  category: 'table:10',
  impl: features(
    calcProp({id: 'fields', value: '%$$model.fields%'}),
    calcProp('items', (ctx,{cmp}) => jb.ui.itemlistCalcItems(ctx,cmp)),
    itemlist.initContainerWithItems()
  )
})

jb.component('table.initSort', {
  type: 'feature',
  impl: ctx => ({
      afterViewInit: cmp => {
        cmp.toggleSort = ev => {
          const field = cmp.renderProps.fields[ev.currentTarget.getAttribute('fieldIndex')]
          const sortOptions = cmp.renderProps.sortOptions || [];
          var option = sortOptions.filter(o=>o.field == field)[0];
          if (!option)
            sortOptions = [{field: field,dir: 'none'}].concat(sortOptions).slice(0,2);
          option = sortOptions.filter(o=>o.field == field)[0];

          var directions = ['none','asc','des'];
          option.dir = directions[(directions.indexOf(option.dir)+1)%directions.length];
          if (option.dir == 'none')
            sortOptions.splice(sortOptions.indexOf(option),1);
          cmp.refresh({sortOptions: sortOptions},{srcCtx: ctx});
        }
        cmp.sortItems = () => {
          if (!cmp.items || !cmp.renderProps.sortOptions || cmp.renderProps.sortOptions.length == 0) return;
          cmp.items.forEach((item,index)=>cmp.renderProps.sortOptions.forEach(o=> 
              item['$jb_$sort_'+o.field.title] = o.field.fieldData(item,index)));
          var major = cmp.renderProps.sortOptions[0], minor = cmp.renderProps.sortOptions[1];
          if (!minor)
            cmp.items.sort(sortFunc(major))
          else {
            var compareMajor = sortFunc(major), compareMinor = sortFunc(minor);
            var majorProp = '$jb_$sort_'+ major.field.title;
            cmp.items.sort((x,y)=> x[majorProp] == y[majorProp] ? compareMinor(x,y) : compareMajor(x,y) );
          }

          function sortFunc(option) {
            var prop = '$jb_$sort_'+ option.field.title;
            if (option.field.numeric)
              var SortFunc = (x,y) => x[prop] - y[prop]
            else
              var SortFunc = (x,y) => 
                x[prop] == y[prop] ? 0 : (x[prop] < y[prop] ? -1 : 1);
            if (option.dir == 'asc') 
              return SortFunc;
            return (x,y) => SortFunc(y,x);
          }

        }
      }
  })
})
;

jb.component('gotoUrl', {
  type: 'action',
  description: 'navigate/open a new web page, change href location',
  params: [
    {id: 'url', as: 'string', mandatory: true},
    {id: 'target', type: 'enum', values: ['new tab', 'self'], defaultValue: 'new tab', as: 'string'}
  ],
  impl: (ctx,url,target) => {
		var _target = (target == 'new tab') ? '_blank' : '_self';
		if (!ctx.probe)
			window.open(url,_target);
	}
})

;

jb.ns('mdc,mdc-style')

jb.component('mdcStyle.initDynamic', {
  type: 'feature',
  params: [
    {id: 'query', as: 'string'}
  ],
  impl: ctx => ({
    afterViewInit: cmp => {
      if (!jb.ui.material) return jb.logError('please load mdc library')
      cmp.mdc_comps = cmp.mdc_comps || []
      const txtElm = jb.ui.findIncludeSelf(cmp.base,'.mdc-text-field')[0]
      if (txtElm) {
        cmp.mdc_comps.push(new jb.ui.material.MDCTextField(txtElm))
        cmp.onValueChange = value => (cmp.mdc_comps||[]).forEach(x=> x.label_ && x.label_.float(!!value))
      } else if (cmp.base.classList.contains('mdc-button') || cmp.base.classList.contains('mdc-fab'))
        cmp.mdc_comps.push(new jb.ui.material.MDCRipple(cmp.base))
      else if (cmp.base.classList.contains('mdc-switch'))
        cmp.mdc_comps.push(new jb.ui.material.MDCSwitch(cmp.base))
      else if (cmp.base.classList.contains('mdc-chip-set'))
        cmp.mdc_comps.push(new jb.ui.material.MDCChipSet(cmp.base))
      else if (cmp.base.classList.contains('mdc-tab-bar'))
        cmp.mdc_comps.push(new jb.ui.material.MDCTabBar(cmp.base))
      else if (cmp.base.classList.contains('mdc-slider'))
        cmp.mdc_comps.push(new jb.ui.material.MDCSlider(cmp.base))
      else if (cmp.base.classList.contains('mdc-select'))
        cmp.mdc_comps.push(new jb.ui.material.MDCSelect(cmp.base))
    },
    destroy: cmp => (cmp.mdc_comps || []).forEach(mdc_cmp=>mdc_cmp.destroy())
  })
})

jb.component('mdc.rippleEffect', {
  type: 'feature',
  description: 'add ripple effect',
  impl: ctx => ({
      templateModifier: vdom => {
        'mdc-ripple-surface mdc-ripple-radius-bounded mdc-states mdc-states-base-color(red)'.split(' ')
          .forEach(cl=>vdom.addClass(cl))
        return vdom;
      }
   })
})

jb.component('label.mdcRippleEffect', {
  type: 'text.style',
  impl: customStyle({
    template: (cmp,state,h) => h('button',{class: 'mdc-button'},[
      h('div',{class:'mdc-button__ripple'}),
      h('span',{class:'mdc-button__label'},state.text),
    ]),
    css: '>span { text-transform: none; }',
    features: [text.bindText(), mdcStyle.initDynamic()]
  })
})



;

jb.component('text.htmlTag', {
    type: 'text.style',
    params: [
      {id: 'htmlTag', as: 'string', defaultValue: 'p', options: 'span,p,h1,h2,h3,h4,h5,div,li,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label'},
      {id: 'cssClass', as: 'string'}
    ],
    impl: customStyle({
      template: (cmp,{text,htmlTag,cssClass},h) => h(`${htmlTag}#${cssClass}`,{},text),
      features: text.bindText()
    })
})
  
jb.component('text.noWrappingTag', {
    type: 'text.style',
    category: 'text:0',
    impl: customStyle({
      template: (cmp,{text},h) => text,
      features: text.bindText()
    })
})
  
jb.component('text.span', {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h('span',{},text),
      features: text.bindText()
    })
})
  
jb.component('text.chip', {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h('div#jb-chip',{},h('span',{},text)),
      features: text.bindText()
    })
})
  
;[1,2,3,4,5,6].map(level=>jb.component(`header.h${level}`, {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h(`h${level}`,{},text),
      features: text.bindText()
    })
}))
  
  
;[1,2,3,4,5,6].map(level=>jb.component(`header.mdcHeadline${level}`, {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h('h2',{class: `mdc-typography mdc-typography--headline${level}`},text),
      features: text.bindText()
    })
}))
  
;[1,2].map(level=>jb.component(`header.mdcSubtitle${level}`, {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h('h2',{class: `mdc-typography mdc-typography--subtitle${level}`},text),
      features: text.bindText()
    })
}))

jb.component('header.mdcHeaderWithIcon', {
    type: 'text.style',
    params: [
      {id: 'level', options: '1,2,3,4,5,6', as: 'string', defaultValue: '1'}
    ],
    impl: customStyle({
      template: (cmp,{text,level},h) =>
          h(`h${level}`,{ class: 'mdc-tab__content'}, [
            ...jb.ui.chooseIconWithRaised(cmp.icon).map(h),
            h('span',{ class: 'mdc-tab__text-label'},text),
            ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-tab__icon'))
          ]),
      css: '{justify-content: initial}',
      features: text.bindText()
    })
})
  
  ;[1,2].map(level=>jb.component(`text.mdcBody${level}`, {
    type: 'text.style',
    impl: customStyle({
      template: (cmp,{text},h) => h('h2',{class: `mdc-typography mdc-typography--body${level}`},text),
      features: text.bindText()
    })
}))
  ;

jb.ui.chooseIconWithRaised = (icons,raised) => {
  if (!icons) return []
  const raisedIcon = icons.filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'raised')[0]
  const otherIcons = (raisedIcon && icons.filter(cmp=>cmp && cmp.ctx.vars.$model.position != 'raised') || icons)
    .filter(cmp=>cmp && cmp.ctx.vars.$model.position != 'post')
  if (raised) 
    return raisedIcon ? [raisedIcon] : otherIcons
  return otherIcons
}

jb.component('button.href', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('a',{class: raised ? 'raised' : '', href: 'javascript:;', onclick: true }, title),
    css: '{color: grey} .raised { font-weight: bold }'
  })
})

jb.component('button.x', {
  type: 'button.style',
  params: [
    {id: 'size', as: 'number', defaultValue: '21'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('button',{title: state.title, onclick: true },'×'),
    css: `{
            padding: 0;
            cursor: pointer;
            font: %$size%px sans-serif;
            border: none;
            background: transparent;
            color: rgba(0,0,0,0.2);
            text-shadow: 0 1px 0 #fff;
            font-weight: 700;
        }
        :hover { color: rgba(0,0,0,0.5) }`
  })
})

jb.component('button.native', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('button',{class: raised ? 'raised' : '', title, onclick: true },title),
    css: '.raised {font-weight: bold}'
  })
})

jb.component('button.mdc', {
  type: 'button.style',
  params: [
    {id: 'noRipple', as: 'boolean'},
    {id: 'noTitle', as: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{title,raised,noRipple,noTitle},h) => h('button',{
      class: ['mdc-button',raised && 'raised mdc-button--raised'].filter(x=>x).join(' '), onclick: true},[
      ...[!noRipple && h('div',{class:'mdc-button__ripple'})],
      ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-button__icon')),
      ...[!noTitle && h('span',{class:'mdc-button__label'},title)],
      ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-button__icon')),
    ]),
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.mdcChipAction', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
    h('div#mdc-chip-set mdc-chip-set--filter', {onclick: true},
      h('div#mdc-chip',{ class: [raised && 'mdc-chip--selected raised'].filter(x=>x).join(' ') }, [
        h('div#mdc-chip__ripple'),
        ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-chip__icon mdc-chip__icon--leading')),
        h('span',{ role: 'gridcell'}, h('span', {role: 'button', tabindex: -1, class: 'mdc-chip__text'}, title )),
        ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-chip__icon mdc-chip__icon--trailing')),
    ])),
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.plainIcon', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => 
      jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=> vdom.setAttribute('title',vdom.getAttribute('title') || title))[0]
  })
})

jb.component('button.mdcIcon', {
  type: 'button.style,icon.style',
  params: [
    {id: 'icon', type: 'icon' },
    {id: 'buttonSize', as: 'number', defaultValue: 40, description: 'button size is larger than the icon size, usually at the rate of 40/24' },
  ],
  impl: styleWithFeatures(button.mdcFloatingAction({withTitle: false, buttonSize: '%$buttonSize%'}), features(
      ((ctx,{},{icon}) => icon && ctx.run({$: 'feature.icon', ...icon, title: '%$model.title%', 
        size: ({},{},{buttonSize}) => buttonSize * 24/40 })),
      css('background-color: grey'),
    ))
})

jb.component('button.mdcFloatingAction', {
  type: 'button.style,icon.style',
  description: 'fab icon',
  params: [
    {id: 'buttonSize', as: 'number', defaultValue: 60, description: 'mini is 40'},
    {id: 'withTitle', as: 'boolean'}
  ],
  impl: customStyle({
    template: (cmp,{title,withTitle,raised},h) =>
      h('button',{ class: ['mdc-fab',raised && 'raised mdc-icon-button--on'].filter(x=>x).join(' ') ,
          title, tabIndex: -1, onclick:  true}, [
            h('div',{ class: 'mdc-fab__ripple'}),
            ...jb.ui.chooseIconWithRaised(cmp.icon,raised).filter(x=>x).map(h).map(vdom=>
                vdom.addClass('mdc-fab__icon').setAttribute('title',vdom.getAttribute('title') || title)),
            ...[withTitle && h('span',{ class: 'mdc-fab__label'},title)].filter(x=>x)
      ]),
    css: '{width: %$buttonSize%px; height: %$buttonSize%px;}',  
    features: mdcStyle.initDynamic(),
  })
})

jb.component('button.mdcTab', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title,raised},h) =>
      h('button',{ class: ['mdc-tab', raised && 'mdc-tab--active'].filter(x=>x).join(' '),tabIndex: -1, role: 'tab', onclick:  true}, [
        h('span#mdc-tab__content',{}, [
          ...jb.ui.chooseIconWithRaised(cmp.icon,raised).map(h).map(vdom=>vdom.addClass('mdc-tab__icon')),
          h('span#mdc-tab__text-label',{},title),
          ...(cmp.icon||[]).filter(cmp=>cmp && cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-tab__icon'))
        ]),
        h('span',{ class: ['mdc-tab-indicator', raised && 'mdc-tab-indicator--active'].filter(x=>x).join(' ') }, h('span',{ class: 'mdc-tab-indicator__content mdc-tab-indicator__content--underline'})),
        h('span#mdc-tab__ripple'),
      ]),
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.mdcHeader', {
  type: 'button.style',
  params: [
    {id: 'stretch', as: 'boolean'},
  ],
  impl: styleWithFeatures(button.mdcTab(), css(pipeline(
    Var('contentWidth',If('%$stretch%', 'width: 100%;','')),
    `
    {width: 100%; border-bottom: 1px solid black; margin-bottom: 7px; padding: 0}
    ~ .mdc-tab__content { %$contentWidth% display: flex; align-content: space-between;}
    ~ .mdc-tab__text-label { width: 100% }
  `)))
})


;

jb.ns('mdc,mdc-style')

jb.component('editableText.input', {
  type: 'editable-text.style',
  impl: customStyle({
    template: (cmp,{databind},h) => h('input', {value: databind, onchange: true, onkeyup: true, onblur: true }),
    features: field.databindText()
  })
})

jb.component('editableText.textarea', {
  type: 'editable-text.style',
  params: [
    {id: 'rows', as: 'number', defaultValue: 4},
    {id: 'cols', as: 'number', defaultValue: 120},
    {id: 'oneWay', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: customStyle({
    template: (cmp,{databind,rows,cols},h) => h('textarea', {
        rows: rows, cols: cols, value: databind, onchange: true, onkeyup: true, onblur: true  }),
    features: field.databindText(0, '%$oneWay%')
  })
})

jb.component('editableText.mdcInput', {
  type: 'editable-text.style,editable-number.style',
  params: [
    {id: 'width', as: 'number'},
    {id: 'noLabel', as: 'boolean'},
    {id: 'noRipple', as: 'boolean'},
  ],
  impl: customStyle({
    template: (cmp,{databind,fieldId,title,noLabel,noRipple,error},h) => h('div',{}, [
      h('div#mdc-text-field',{class: [ 
          (cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'pre')[0] && 'mdc-text-field--with-leading-icon',
          (cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'post')[0] && 'mdc-text-field--with-trailing-icon'
        ].filter(x=>x).join(' ') },[
          ...(cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'pre').map(h).map(vdom=>vdom.addClass('mdc-text-field__icon mdc-text-field__icon--leading')),
          h('input#mdc-text-field__input', { type: 'text', id: 'input_' + fieldId,
              value: databind, onchange: true, onkeyup: true, onblur: true,
          }),
          ...(cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'post').map(h).map(vdom=>vdom.addClass('mdc-text-field__icon mdc-text-field__icon--trailing')),
          ...[!noLabel && h('label#mdc-floating-label', { class: databind ? 'mdc-floating-label--float-above' : '', for: 'input_' + fieldId},title() )].filter(x=>x),
          ...[!noRipple && h('div#mdc-line-ripple')].filter(x=>x)
        ]),
        h('div#mdc-text-field-helper-line', {}, error || '')
      ]),
    css: `~ .mdc-text-field-helper-line { color: red }`,
    features: [
      field.databindText(), 
      mdcStyle.initDynamic(),
      css( ({},{},{width}) => `>.mdc-text-field { ${jb.ui.propWithUnits('width', width)} }`),
    ]
  })
})

jb.component('editableText.mdcNoLabel', {
  type: 'editable-text.style',
  params: [
    {id: 'width', as: 'number'}
  ],
  impl: editableText.mdcInput({width:'%$width%', noLabel: true})
})

jb.component('editableText.mdcSearch', {
  params: [
    {id: 'width', as: 'number'}
  ],
  description: 'debounced and one way binding',
  type: 'editable-text.style',
  impl: styleWithFeatures(editableText.mdcInput({width:'%$width%', noLabel: true}), feature.icon({icon: 'search', position: 'post'}))
})

;

jb.component('layout.vertical', {
  type: 'layout,feature',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: css(
    ({},{},{spacing}) =>  `{display: flex; flex-direction: column}
          >* { ${jb.ui.propWithUnits('margin-bottom',spacing)} }
          >*:last-child { margin-bottom:0 }`
  )
})

jb.component('layout.horizontal', {
  type: 'layout,feature',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: css(({},{},{spacing}) =>  `{display: flex}
        >* { ${jb.ui.propWithUnits('margin-right', spacing)} }
        >*:last-child { margin-right:0 }`
  )
})

jb.component('layout.horizontalFixedSplit', {
  type: 'layout,feature',
  params: [
    {id: 'leftWidth', as: 'string', defaultValue: '200px', mandatory: true},
    {id: 'rightWidth', as: 'string', defaultValue: '100%', mandatory: true},
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: ctx => ({
    css: `{display: flex}
        >*:first-child { ${jb.ui.propWithUnits('margin-right',ctx.params.spacing)}
        ${jb.ui.propWithUnits('width',ctx.params.leftWidth)} }
        >*:last-child { margin-right:0; ${jb.ui.propWithUnits('width',ctx.params.rightWidth)} }`,
  })
})

jb.component('layout.horizontalWrapped', {
  type: 'layout,feature',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: ctx => ({
    css: `{display: flex}
        >* {${jb.ui.propWithUnits('margin-right',ctx.params.spacing)} }
        >*:last-child { margin-right:0 }`,
  })
})

jb.component('layout.flex', {
  type: 'layout,feature',
  params: [
    {id: 'direction', as: 'string', options: ',row,row-reverse,column,column-reverse'},
    {id: 'justifyContent', as: 'string', options: ',flex-start,flex-end,center,space-between,space-around'},
    {id: 'alignItems', as: 'string', options: ',normal,stretch,center,start,end,flex-start,flex-end,baseline,first baseline,last baseline,safe center,unsafe center'},
    {id: 'wrap', as: 'string', options: ',wrap,wrap-reverse,nowrap'},
    {id: 'spacing', as: 'string'}
  ],
  impl: ctx => ({
    css: ctx.setVars({spacingWithUnits: jb.ui.withUnits(ctx.params.spacing), ...ctx.params}).exp(
      `{ display: flex; {?align-items:%$alignItems%;?} {?justify-content:%$justifyContent%;?} {?flex-direction:%$direction%;?} {?flex-wrap:%$wrap%;?} }
      {?>* { margin-right: %$spacingWithUnits% }?}
    ${ctx.params.spacing ? '>*:last-child { margin-right:0 }' : ''}`),
  })
})

jb.component('layout.grid', {
  type: 'layout,feature',
  params: [
    {id: 'columnSizes', as: 'array', templateValue: list('auto', 'auto'), description: 'grid-template-columns, list of lengths'},
    {id: 'rowSizes', as: 'array', description: 'grid-template-rows, list of lengths'},
    {id: 'columnGap', as: 'string', description: 'grid-column-gap'},
    {id: 'rowGap', as: 'string', description: 'grid-row-gap'}
  ],
  impl: ctx => ({
    css: ctx.setVars({...ctx.params,
          colSizes: ctx.params.columnSizes.map(x=>jb.ui.withUnits(x)).join(' ') , rowSizes: ctx.params.rowSizes.map(x=>jb.ui.withUnits(x)).join(' ')
         }).exp(`{ display: grid; {?grid-template-columns:%$colSizes%;?} {?grid-template-rows:%$rowSizes%;?}
            {?grid-column-gap:%$columnGap%;?} {?grid-row-gap:%$rowGap%;?} }`)
  })
})

jb.component('flexItem.grow', {
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'factor', as: 'string', defaultValue: '1'}
  ],
  impl: {
    '$': 'feature.css',
    '$byValue': ['flex-grow: %$factor%']
  }
})

jb.component('flexItem.basis', {
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'factor', as: 'string', defaultValue: '1'}
  ],
  impl: {
    '$': 'feature.css',
    '$byValue': ['flex-basis: %$factor%']
  }
})

jb.component('flexItem.alignSelf', {
  type: 'feature',
  category: 'flex-item',
  params: [
    {id: 'align', as: 'string', options: 'auto,flex-start,flex-end,center,baseline,stretch', defaultValue: 'auto'}
  ],
  impl: {
    '$': 'feature.css',
    '$byValue': ['align-self: %$align%']
  }
})

;

jb.ns('css')

jb.component('group.htmlTag', {
  type: 'group.style',
  params: [
    {id: 'htmlTag', as: 'string', defaultValue: 'section', options: 'div,ul,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label,form'},
    {id: 'groupClass', as: 'string'},
    {id: 'itemClass', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,{htmlTag,groupClass,itemClass,ctrls},h) => h(htmlTag,{ class: groupClass },
        ctrls.map(ctrl=> h(ctrl,{class: itemClass}))),
    features: group.initGroup()
  })
})

jb.component('group.div', {
  type: 'group.style',
  impl: group.htmlTag('div')
})

jb.component('group.section', {
  type: 'group.style',
  impl: group.htmlTag('section')
})

jb.component('group.ulLi', {
  type: 'group.style',
  impl: customStyle({
    template: (cmp,{ctrls},h) => h('ul#jb-itemlist',{},
        ctrls.map(ctrl=> h('li', {class: 'jb-item'} ,h(ctrl)))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features: group.initGroup()
  })
})

jb.component('group.card', {
  type: 'feature',
  category: 'card:100',
  params: [
    {id: 'padding', as: 'string', defaultValue: 10},
    {id: 'width', as: 'string', defaultValue: 320},
    {id: 'outlined', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    css.class(
        ({},{},{outlined}) => ['mdc-card', ...(outlined ? ['mdc-card--outlined']: [])].join(' ')
      ),
    css(
        ({},{},{padding,width}) => [jb.ui.propWithUnits('padding',padding), jb.ui.propWithUnits('width',width)].filter(x=>x).join(';')
      )
  )
})

jb.component('group.chipSet', {
  type: 'feature',
  category: 'chip:100',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: features(
    css.class('mdc-chip-set'),
    mdcStyle.initDynamic()
  )
})

jb.component('group.tabs', {
  type: 'group.style',
  params: [
    {id: 'tabStyle', type: 'button.style', dynamic: true, defaultValue: button.mdcTab()},
    {id: 'barStyle', type: 'group.style', dynamic: true, defaultValue: group.mdcTabBar()},
    {id: 'innerGroupStyle', type: 'group.style', dynamic: true, defaultValue: group.div()},
  ],
  impl: styleByControl(
    group({
      controls: [
        group({
          style: call('barStyle'),
          controls: dynamicControls({
            controlItems: '%$tabsModel/controls%',
            genericControl: button({
              title: '%$tab/field/title%',
              action: writeValue('%$selectedTab%', '%$tabIndex%'),
              style: call('tabStyle'),
              raised: '%$tabIndex% == %$selectedTab%',
              // watchRef breaks mdcTabBar animation
              features: [
                ctx => ctx.componentContext.params.barStyle.profile.$ !== 'group.mdcTabBar' && watchRef('%$selectedTab%'),
                ctx => ctx.run(features((ctx.vars.tab.icon || []).map(cmp=>cmp.ctx.profile).filter(x=>x)))
              ]
            }),
            itemVariable: 'tab',
            indexVariable: 'tabIndex'
          })
        }),
        group({
          style: call('innerGroupStyle'),
          controls: '%$tabsModel/controls[{%$selectedTab%}]%',
          features: watchRef('%$selectedTab%')
        })
      ],
      features: variable({name: 'selectedTab', value: 0, watchable: true}),
    }),
    'tabsModel'
  )
})

jb.component('group.mdcTabBar', {
  type: 'group.style',
  impl: customStyle({
    template: (cmp,{ctrls},h) => 
      h('div',{class: 'mdc-tab-bar', role: 'tablist'},
        h('div',{class: 'mdc-tab-scroller'},
          h('div',{class: 'mdc-tab-scroller__scroll-area mdc-tab-scroller__scroll-area--scroll'},
            h('div',{class: 'mdc-tab-scroller__scroll-content'}, ctrls.map(ctrl=>h(ctrl)))))),
    features: [group.initGroup(), mdcStyle.initDynamic()]
  })
})

jb.component('group.accordion', {
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'button.style', dynamic: true, defaultValue: button.mdcHeader(true)},
    {id: 'sectionStyle', type: 'group.style', dynamic: true, defaultValue: group.section()},
    {id: 'innerGroupStyle', type: 'group.style', dynamic: true, defaultValue: group.div()}
  ],
  impl: styleByControl(
    group({
      controls: dynamicControls({
        controlItems: '%$sectionsModel/controls%',
        genericControl: group({
          style: call('sectionStyle'),
          controls: [
            button({
              title: '%$section/field/title%',
              action: writeValue('%$selectedTab%', '%$sectionIndex%'),
              style: call('titleStyle'),
              raised: '%$sectionIndex% == %$selectedTab%',
              features: [
                css.width('%$width%'),
                css('{justify-content: left}'),
                watchRef('%$selectedTab%'),
                ctx => ctx.run(features((ctx.vars.section.icon || []).map(cmp=>cmp.ctx.profile).filter(x=>x)))
              ]
            }),
            group({
              style: call('innerGroupStyle'),
              controls: '%$sectionsModel/controls[{%$sectionIndex%}]%',
              features: [feature.if('%$sectionIndex% == %$selectedTab%'), watchRef('%$selectedTab%')]
            })
          ]
        }),
        itemVariable: 'section',
        indexVariable: 'sectionIndex'
      }),
      features: variable({name: 'selectedTab', value: 0, watchable: true})
    }),
    'sectionsModel'
  )
})

jb.component('group.sections', {
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'text.style', dynamic: true, defaultValue: header.mdcHeaderWithIcon()},
    {id: 'sectionStyle', type: 'group.style', dynamic: true, defaultValue: group.div()},
    {id: 'innerGroupStyle', type: 'group.style', dynamic: true, defaultValue: group.div()}
  ],
  impl: styleByControl(
    group({
      controls: dynamicControls({
        controlItems: '%$sectionsModel/controls%',
        genericControl: group({
          style: call('sectionStyle'),
          controls: [
            text({text: '%$section/field/title%', 
              style: call('titleStyle'),
              features: ctx => ctx.run(features((ctx.vars.section.icon || []).map(cmp=>cmp.ctx.profile).filter(x=>x)))
            }),
            group({style: call('innerGroupStyle'), controls: '%$section%'})
          ]
        }),
        itemVariable: 'section'
      })
    }),
    'sectionsModel'
  )
})
;

jb.ns('mdc.style')
jb.component('table.plain', {
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'}
  ],
  type: 'table.style,itemlist.style',
  impl: customStyle({
    template: (cmp,{items,fields,hideHeaders},h) => h('div#jb-itemlist',{},h('table',{},[
        ...(hideHeaders ? [] : [h('thead',{},h('tr',{},
          fields.map(f=>h('th',{'jb-ctx': f.ctxId, style: { width: f.width ? f.width + 'px' : ''} }, jb.ui.fieldTitle(cmp,f,h))) ))]),
        h('tbody#jb-drag-parent',{},
            items.map((item,index)=> jb.ui.item(cmp,h('tr#jb-item',{ 'jb-ctx': jb.ui.preserveCtx(cmp.ctx.setData(item))},
              fields.map(f=>
                h('td', jb.filterEmpty({ 'jb-ctx': jb.ui.preserveFieldCtxWithItem(f,item), class: f.class, title: f.hoverTitle &&  f.hoverTitle(item) }),
                  f.control ? h(f.control(item,index),{index, row: item}) : f.fieldData(item,index)))) ,item))
        ),
        items.length == 0 ? 'no items' : ''
        ])),
    css: `>table{border-spacing: 0; text-align: left; width: 100%}
    >table>tbody>tr>td { padding-right: 5px }
    `,
    features: table.initTableOrItemlist()
  })
})

jb.component('table.mdc', {
  type: 'table.style,itemlist.style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'},
    {id: 'classForTable', as: 'string', defaultValue: 'mdc-data-table__table mdc-data-table--selectable'}
  ],
  impl: customStyle({
    template: (cmp,{items,fields,classForTable,classForTd,sortOptions,hideHeaders},h) => 
      h('div#jb-itemlist mdc-data-table',{}, h('table',{ class: classForTable },[
      ...(hideHeaders ? [] : [h('thead',{},h('tr#mdc-data-table__header-row',{},
        fields.map((f,i) =>h('th#mdc-data-table__header-cell',{
          'jb-ctx': f.ctxId, 
          class: [ 
              (sortOptions && sortOptions.filter(o=>o.field == f)[0] || {}).dir == 'asc' ? 'mdc-data-table__header--sorted-ascending': '',
              (sortOptions && sortOptions.filter(o=>o.field == f)[0] || {}).dir == 'des' ? 'mdc-data-table__header--sorted-descending': '',
            ].filter(x=>x).join(' '), 
          style: { width: f.width ? f.width + 'px' : ''},
          onclick: 'toggleSort',
          fieldIndex: i
          }
          ,jb.ui.fieldTitle(cmp,f,h))) ))]),
        h('tbody#jb-drag-parent mdc-data-table__content',{},
            items.map((item,index)=> jb.ui.item(cmp,h('tr',{ class: 'jb-item mdc-data-table__row', 'jb-ctx': jb.ui.preserveCtx(cmp.ctx.setData(item))},fields.map(f=>
              h('td', jb.filterEmpty({ 
                'jb-ctx': jb.ui.preserveFieldCtxWithItem(f,item), 
                class: (f.class + ' ' + classForTd + ' mdc-data-table__cell').trim(), 
                title: f.hoverTitle &&  f.hoverTitle(item) 
              }) , f.control ? h(f.control(item,index)) : f.fieldData(item,index))))
              ,item))
        ),
        items.length == 0 ? 'no items' : ''
        ])),
    css: `{width: 100%} 
    ~ .mdc-data-table__header-cell {font-weight: 700}`,
    features: [table.initTableOrItemlist(), table.initSort(), mdcStyle.initDynamic()]
  })
})
;

jb.component('picklist.native', {
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,state,h) => h('select', { value: state.databind, onchange: true },
          state.options.map(option=>h('option',{value: option.code},option.text))
        ),
    css: `
{ display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857; color: #555555; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; }
:focus { border-color: #66afe9; outline: 0; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }
::-webkit-input-placeholder { color: #999; }`,
    features: [field.databind(), picklist.init()]
  })
})

jb.component('picklist.plusIcon', {
  type: 'feature',
  categories: 'feature:0,picklist:50',
  impl: features(
    css('-webkit-appearance: none; appearance: none; width: 6px; height: 23px; background-repeat: no-repeat; background-position-y: -1px;'),
    css(`background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M17,13 H13 V17 H11 V13 H7 V11 H11 V7 H13 V11 H17 V13 Z'/></svg>");`),
  )
})

jb.component('picklist.radio', {
  type: 'picklist.style',
  params: [
    {id: 'radioCss', as: 'string', defaultValue: '', description: 'e.g. display: none'},
    {id: 'text', defaultValue: '%text%', dynamic: true}
  ],
  impl: customStyle({
    template: (cmp,{databind, options, fieldId, text},h) => h('div', {},
          options.flatMap((option,i)=> [h('input', {
              type: 'radio', name: fieldId, id: i, checked: databind === option.code, value: option.code, onchange: true
            }), h('label',{for: i}, text(cmp.ctx.setData(option))) ] )),
    css: '>input { %$radioCss% }',
    features: [field.databind(), picklist.init()]
  })
})

jb.component('picklist.radioVertical', {
  type: 'picklist.style',
  impl: styleWithFeatures(
    picklist.radio(),
    layout.grid({columnSizes: list('30px', 'auto')})
  )
})

jb.component('picklist.mdcSelect', {
  type: 'picklist.style',
  params: [
    {id: 'width', as: 'number', defaultValue: 300},
    {id: 'noLabel', as: 'boolean'},
    {id: 'noRipple', as: 'boolean'},
  ],
  impl: customStyle({
    template: (cmp,{databind,options,title,noLabel,noRipple,hasEmptyOption},h) => h('div#mdc-select',{}, [
      h('div#mdc-select__anchor',{onclick: true},[
          ...(cmp.icon||[]).filter(_cmp=>_cmp && _cmp.ctx.vars.$model.position == 'pre').map(h).map(vdom=>vdom.addClass('mdc-text-field__icon mdc-text-field__icon--leading')),
          h('i#mdc-select__dropdown-icon', {}),
          h('div#mdc-select__selected-text',{'aria-required': !hasEmptyOption},databind),
          ...[!noLabel && h('label#mdc-floating-label',{ class: databind ? 'mdc-floating-label--float-above' : ''},title() )].filter(x=>x),
          ...[!noRipple && h('div#mdc-line-ripple')].filter(x=>x)
      ]),
      h('div#mdc-select__menu mdc-menu mdc-menu-surface demo-width-class',{},[
        h('ul#mdc-list',{},options.map(option=>h('li#mdc-list-item',{'data-value': option.code, 
          class: option.code == databind ? 'mdc-list-item--selected': ''}, 
          h('span#mdc-list-item__text', {}, option.text))))
      ])
    ]),
    features: [
      field.databind(), 
      picklist.init(), 
      mdcStyle.initDynamic(),
      css( ({},{},{width}) => `>* { ${jb.ui.propWithUnits('width', width)} }`),
      interactive((ctx,{cmp}) =>
          cmp.mdc_comps.forEach(mdcCmp => mdcCmp.listen('MDCSelect:change', () => cmp.jbModel(mdcCmp.value)))
      ),
    ]
  })
})

jb.component('picklist.nativeMdLookOpen', {
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{}, [
        h('input', { type: 'text', value: state.databind, list: 'list_' + cmp.ctx.id, onchange: true }),
        h('datalist', {id: 'list_' + cmp.ctx.id}, state.options.map(option=>h('option',{},option.text)))
    ]),
    css: `>input {  appearance: none; -webkit-appearance: none; font-family: inherit;
  background-color: transparent;
  padding: 6px 0;
  font-size: 14px;
  width: 100%;
  color: rgba(0,0,0, 0.82);
  border: none;
  border-bottom: 1px solid rgba(0,0,0, 0.12); }

  {
    font-family: 'Roboto','Helvetica','Arial',sans-serif;
    position: relative;
  }
  >input:focus { border-color: #3F51B5; border-width: 2px}

  :after { position: absolute;
        top: 0.75em;
        right: 0.5em;
        /* Styling the down arrow */
        width: 0;
        height: 0;
        padding: 0;
        content: '';
        border-left: .25em solid transparent;
        border-right: .25em solid transparent;
        border-top: .375em solid rgba(0,0,0, 0.12);
        pointer-events: none; }`,
    features: [field.databind(), picklist.init()]
  })
})

jb.component('picklist.nativeMdLook', {
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{},h('select',
      { value: state.databind, onchange: true },
          state.options.map(option=>h('option',{value: option.code},option.text)))),
    css: `>select {  appearance: none; -webkit-appearance: none; font-family: inherit;
  background-color: transparent;
  padding: 6px 0;
  font-size: 14px;
  width: 100%;
  color: rgba(0,0,0, 0.82);
  border: none;
  border-bottom: 1px solid rgba(0,0,0, 0.12); }

  {
    font-family: 'Roboto','Helvetica','Arial',sans-serif;
    position: relative;
  }
  >select:focus { border-color: #3F51B5; border-width: 2px}

  :after { position: absolute;
        top: 0.75em;
        right: 0.5em;
        /* Styling the down arrow */
        width: 0;
        height: 0;
        padding: 0;
        content: '';
        border-left: .25em solid transparent;
        border-right: .25em solid transparent;
        border-top: .375em solid rgba(0,0,0, 0.12);
        pointer-events: none; }`,
    features: [field.databind(), picklist.init()]
  })
})

jb.component('picklist.labelList', {
  type: 'picklist.style',
  params: [
    {id: 'labelStyle', type: 'text.style', dynamic: true, defaultValue: text.span()},
    {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.ulLi()},
    {id: 'cssForSelected', as: 'string', description: 'e.g. background: red OR >a { color: red }', defaultValue: 'background: #bbb; color: #fff'}
  ],
  impl: styleByControl(
    itemlist({
      items: '%$picklistModel/options%',
      controls: text({text: '%text%', style: call('labelStyle')}),
      style: call('itemlistStyle'),
      features: itemlist.selection({
        databind: '%$picklistModel/databind%',
        selectedToDatabind: '%code%',
        databindToSelected: ctx => ctx.vars.items.filter(o=>o.code == ctx.data)[0],
        cssForSelected: '%$cssForSelected%'
      })
    }),
    'picklistModel'
  )
})

jb.component('picklist.buttonList', {
  type: 'picklist.style',
  params: [
    {id: 'buttonStyle', type: 'button.style', dynamic: true, defaultValue: button.mdc()},
    {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.horizontal()},
    {id: 'cssForSelected', as: 'string', description: 'e.g. background: red;color: blue;font-weight: bold;', defaultValue: 'background: #bbb; color: #fff'}
  ],
  impl: styleByControl(
    itemlist({
      items: '%$picklistModel/options%',
      controls: button({title: '%text%', style: call('buttonStyle')}),
      style: call('itemlistStyle'),
      features: itemlist.selection({
        databind: '%$picklistModel/databind%',
        selectedToDatabind: '%code%',
        databindToSelected: ctx => ctx.vars.items.filter(o=>o.code == ctx.data)[0],
        cssForSelected: '%$cssForSelected%'
      })
    }),
    'picklistModel'
  )
})

jb.component('picklist.hyperlinks', {
  type: 'picklist.style',
  impl: picklist.buttonList({
    buttonStyle: button.href(),
    itemlistStyle: itemlist.horizontal('10'),
    cssForSelected: '>a { color: red }'
  })
})

jb.component('picklist.groups', {
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,{databind,hasEmptyOption,groups},h) => h('select', { value: databind, onchange: true },
          (hasEmptyOption ? [h('option',{value:''},'')] : []).concat(
            groups.map(group=>h('optgroup',{label: group.text},
              group.options.map(option=>h('option',{value: option.code},option.text))
              ))
      )),
    css: `
 { display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857; color: #555555; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; }
select:focus { border-color: #66afe9; outline: 0; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }
select::-webkit-input-placeholder { color: #999; }`,
    features: [field.databind(), picklist.init(),  picklist.initGroups()]
  })
})

;

jb.component('propertySheet.titlesLeft', {
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'text.style', defaultValue: styleWithFeatures(text.span(), css.bold()), dynamic: true},
    {id: 'titleText', defaultValue: '%%:', dynamic: true},
    {id: 'spacing', as: 'string', description: 'grid-column-gap', defaultValue: '10px'}
  ],
  impl: customStyle({
    template: (cmp,{ctrls,titleStyle,titleText},h) => h('div',{}, ctrls.flatMap(ctrl=>[
        h(cmp.ctx.run(text({text: ctx => titleText(ctx.setData(ctrl.field().title())), style: ctx => titleStyle(ctx)}))),
        h(ctrl)
      ])
    ),
    css: '{ display: grid; grid-template-columns: auto auto; grid-column-gap:%$spacing%}',
    features: group.initGroup()
  })
})

jb.component('propertySheet.titlesAbove', {
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'text.style', defaultValue: styleWithFeatures(text.span(), css.bold()), dynamic: true},
    {id: 'titleText', defaultValue: '%%', dynamic: true},
    {id: 'spacing', as: 'string', description: 'grid-column-gap', defaultValue: '10px'}
  ],
  impl: customStyle({
    template: (cmp,{ctrls,titleStyle,titleText},h) => h('div',{ style: {'grid-template-columns': ctrls.map(()=>'auto').join(' ')}}, [
        ...ctrls.map(ctrl=>
          h(cmp.ctx.run(text({
            text: ctx => titleText(ctx.setData(ctrl.field().title())), 
            style: ctx => titleStyle(ctx)})))), 
        ...ctrls.map(ctrl=>h(ctrl))
      ]
    ),
    css: '{ display: grid; grid-column-gap:%$spacing% }',
    features: group.initGroup()
  })
})
;

jb.component('editableBoolean.checkbox', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('input', { type: 'checkbox', checked: state.databind, onchange: 'toggle', onkeyup: 'toggleByKey'  }),
    features: field.databind()
  })
})

jb.component('editableBoolean.checkboxWithTitle', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,{text,databind},h) => h('div',{}, [h('input', { type: 'checkbox',
        checked: databind, onchange: 'toggle', onkeyup: 'toggleByKey'  }), text]),
    features: field.databind()
  })
})

jb.component('editableBoolean.checkboxWithLabel', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,{text,databind,fieldId},h) => h('div',{},[
        h('input', { type: 'checkbox', id: "switch_"+fieldId,
          checked: databind,
          onchange: 'toggle',
          onkeyup: 'toggleByKey'  },),
        h('label',{for: "switch_"+fieldId },text)
    ]),
    features: field.databind()
  })
})

jb.component('editableBoolean.expandCollapse', {
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,{databind},h) => h('i',{class:'material-icons noselect', onclick: 'toggle' },
      databind ? 'keyboard_arrow_down' : 'keyboard_arrow_right'),
    css: '{ font-size:16px; cursor: pointer; }',
    features: field.databind()
  })
})

jb.component('editableBoolean.mdcXV', {
  type: 'editable-boolean.style',
  description: 'two icons',
  params: [
    {id: 'yesIcon', as: 'string', mandatory: true, defaultValue: 'check'},
    {id: 'noIcon', as: 'string', mandatory: true, defaultValue: 'close'}
  ],
  impl: customStyle({
    template: (cmp,{title,databind,yesIcon,noIcon},h) => h('button',{
          class: ['mdc-icon-button material-icons',databind && 'raised mdc-icon-button--on'].filter(x=>x).join(' '),
          title, tabIndex: -1, onclick: 'toggle', onkeyup: 'toggleByKey'},[
            h('i',{class:'material-icons mdc-icon-button__icon mdc-icon-button__icon--on'}, yesIcon),
            h('i',{class:'material-icons mdc-icon-button__icon '}, noIcon),
        ]),
    css: '{ border-radius: 2px; padding: 0; width: 24px; height: 24px;}',
    features: [field.databind(), mdcStyle.initDynamic()]
  })
})

jb.component('editableBoolean.buttonXV', {
  type: 'editable-boolean.style',
  description: 'two icons',
  params: [
    {id: 'yesIcon', type: 'icon', mandatory: true, defaultValue: icon('check')},
    {id: 'noIcon', type: 'icon', mandatory: true, defaultValue: icon('close') },
    {id: 'buttonStyle', type: 'button.style', mandatory: true, defaultValue: button.mdcFloatingAction() }
  ],
  impl: styleWithFeatures(call('buttonStyle'), features(
      htmlAttribute('onclick','toggle'),
      ctx => ctx.run({...ctx.componentContext.params[jb.toboolean(ctx.vars.$model.databind()) ? 'yesIcon' : 'noIcon' ], 
        title: ctx.exp('%$$model/title%'), $: 'feature.icon'}),
    ))
})

jb.component('editableBoolean.iconWithSlash', {
  type: 'editable-boolean.style',
  params: [
    {id: 'buttonSize', as: 'number', defaultValue: 40, description: 'button size is larger than the icon size, usually at the rate of 40/24' },
  ],
  impl: styleWithFeatures(button.mdcIcon({buttonSize: '%$buttonSize%'}), features(
      htmlAttribute('onclick','toggle'),
      htmlAttribute('title','%$$model/title%'),
      css(If('%$$model/databind%','',`background-repeat: no-repeat; background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='%$buttonSize%' viewBox='0 0 %$buttonSize% %$buttonSize%' width='%$buttonSize%' xmlns='http://www.w3.org/2000/svg'><line x1='0' y1='0' x2='%$buttonSize%' y2='%$buttonSize%' style='stroke:white;stroke-width:2' /></svg>")`))
    ))
})


jb.component('editableBoolean.mdcSlideToggle', {
  type: 'editable-boolean.style',
  params: [
    {id: 'width', as: 'string', defaultValue: 80}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{class: 'mdc-switch'},[
      h('div',{class: 'mdc-switch__track'}),
      h('div',{class: 'mdc-switch__thumb-underlay'},[
        h('div',{class: 'mdc-switch__thumb'},
          h('input', { type: 'checkbox', role: 'switch', class: 'mdc-switch__native-control', id: 'switch_' + state.fieldId,
            checked: state.databind, onchange: 'toggle', onkeyup: 'toggleByKey' })),
      ]),
      h('label',{for: 'switch_' + state.fieldId},state.text)
    ]),
    css: ctx => jb.ui.propWithUnits('width',ctx.params.width),
    features: [field.databind(), mdcStyle.initDynamic()]
  })
})


;

