var jbLoader =
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["dynamicLoad"] = dynamicLoad;
var resources = {
      'common': [
        'src/core/jb-common.js'
      ],
      'ui-common': [
        'dist/ui-base-and-styles.js',
        'src/ui/ui-common.js',
        'src/ui/common-features.js',
      ],
      'testers': [
        'src/testing/testers.js',
      ],
      'jquery': [
        'bower_components/jquery/dist/jquery.js'
      ],
      'material-design-lite': [
        'node_modules/material-design-lite/material.js',

        'node_modules/material-design-lite/material.min.css',
        'node_modules/material-design-lite/dist/material.indigo-pink.min.css',
      ],
      'codemirror': [
        'bower_components/codemirror/lib/codemirror.js',
        'bower_components/codemirror/mode/xml/xml.js',
        'bower_components/codemirror/mode/javascript/javascript.js',
        'bower_components/codemirror/mode/css/css.js',
        'bower_components/codemirror/mode/htmlmixed/htmlmixed.js',
        'bower_components/codemirror/addon/hint/show-hint.js',
        'bower_components/codemirror/addon/hint/javascript-hint.js',
        'bower_components/codemirror/addon/hint/xml-hint.js',
        'bower_components/codemirror/addon/hint/html-hint.js',
        'bower_components/codemirror/addon/fold/foldgutter.js',
        'bower_components/codemirror/addon/selection/active-line.js',

        'bower_components/codemirror/lib/codemirror.css',
        'bower_components/codemirror/theme/solarized.css'
      ],
      'history': [
        'node_modules/history/umd/history.js',
      ],
      'dragula': [
          'bower_components/dragula.js/dist/dragula.js',
          'bower_components/dragula.js/dist/dragula.css',
      ]
};

function dynamicLoad(modules) {
  modules.split(',').forEach(m=>{
    (resources[m] || []).forEach(file=>{
      if (m == 'studio')
        file = 'projects/studio/' + file;

      var url = (window.jbLoaderRelativePath ? '' : '/') + file;
      if (file.match(/\.js$/))
        document.write('<script src="' + url + '"></script>')
      else
        document.write('<link rel="stylesheet" type="text/css" href="' + url + + '" />');
    })
  })
}

if (document.currentScript && document.currentScript.getAttribute('modules'))
    dynamicLoad(document.currentScript.getAttribute('modules'));

var jb_studio_modules = ['tgp-model','model-components.js','path','utils','main.js','preview','menu.js','toolbar','tests','popups.js'
,'tree','properties.js','properties-menu.js','pick.js','save','probe','edit-source','new-control.js','testers'
,'undo','styles.js','style-editor.js','data-browse','open-project.js','jb-editor.js','jb-editor-styles.js','suggestions','context-viewer.js','search.js']
  .map(x=> x.match(/\.js$/) ? 'projects/studio/studio-' + x : 'studio/studio-' + x  )



/***/ })
/******/ ]);