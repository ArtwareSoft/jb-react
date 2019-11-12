var jb_modules = Object.assign((typeof jb_modules != 'undefined' ? jb_modules : {}), {
      'core': [
        'src/core/jb-core.js',
        'src/misc/wSpy.js'
      ],
      'common': [
        'src/core/jb-core.js',
        'src/core/jb-common.js',
        'src/misc/wSpy.js',
      ],
      'material-css': [
        'dist/material.css',
        'dist/material.indigo-pink.min.css',
      ],
      'ui-common': [
        'css/font.css',
        'css/styles.css',

        'dist/preact.dev.js',
        'dist/jb-immutable.js', // the immutable-helper lib
        'dist/jb-rx.js',

        'src/ui/react-ctrl.js',
        'src/ui/watchable/watchable-ref.js',

        'src/ui/group.js',
        'src/ui/label.js',
        'src/ui/html.js',
        'src/ui/image.js',
        'src/ui/button.js',
        'src/ui/field.js',
        'src/ui/editable-text.js',
        'src/ui/editable-boolean.js',
        'src/ui/editable-number.js',
        'src/ui/common-features.js',
        'src/ui/css-features.js',
        'src/ui/dialog.js',
        'src/ui/itemlist.js',
        'src/ui/itemlist-container.js',
        'src/ui/menu.js',
        'src/ui/picklist.js',
        'src/ui/theme.js',
        'src/ui/icon.js',
        'src/ui/slider.js',
        'src/ui/table.js',
        'src/ui/tabs.js',
        'src/ui/window.js',

        'src/ui/styles/mdl-styles.js',
        'src/ui/styles/button-styles.js',
        'src/ui/styles/editable-text-styles.js',
        'src/ui/styles/layout-styles.js',
        'src/ui/styles/group-styles.js',
        'src/ui/styles/table-styles.js',
        'src/ui/styles/picklist-styles.js',
        'src/ui/styles/property-sheet-styles.js',
        'src/ui/styles/editable-boolean-styles.js',
				'src/ui/styles/card-styles.js',
      ],
      'ui-tree':[
        'src/ui/tree/tree.js',
        'src/ui/tree/table-tree.js',
        'src/ui/tree/json-tree-model.js',
      ],
      'inner-html': [ // unsafe
        'src/ui/inner-html.js',
      ],
      'testers': [
        'src/testing/testers.js',
      ],
      'codemirror': [
          'dist/codemirror.js',
          'dist/codemirror.css',
      ],
      'codemirror-js-files': [
        'node_modules/codemirror/lib/codemirror.js',
        'node_modules/codemirror/mode/xml/xml.js',
        'node_modules/codemirror/mode/javascript/javascript.js',
        'node_modules/codemirror/mode/css/css.js',
        'node_modules/codemirror/mode/jsx/jsx.js',
        'node_modules/codemirror/mode/htmlmixed/htmlmixed.js',
        'node_modules/codemirror/addon/hint/show-hint.js',

        'node_modules/codemirror/addon/dialog/dialog.js',
        'node_modules/codemirror/addon/search/searchcursor.js',
        'node_modules/codemirror/addon/search/search.js',
        'node_modules/codemirror/addon/scroll/annotatescrollbar.js',
        'node_modules/codemirror/addon/search/matchesonscrollbar.js',

        'node_modules/codemirror/addon/fold/foldgutter.js',
        'node_modules/codemirror/addon/selection/active-line.js',
      ],
      'codemirror-css-files': [
        'node_modules/codemirror/addon/dialog/dialog.css',
        'node_modules/codemirror/addon/search/matchesonscrollbar.css',
        'node_modules/codemirror/lib/codemirror.css',
        'node_modules/codemirror/theme/solarized.css',
        'node_modules/codemirror/addon/hint/show-hint.css',
      ],
      'd3': [
        'node_modules/d3/dist/d3.js',
        'src/ui/d3-chart/d3-math.js',
        'src/ui/d3-chart/d3-chart.js',
        'src/ui/d3-chart/d3-histogram.js',
      ],
      'history': [
        'dist/history.js',
//        'src/ui/url.js'
      ],
      'dragula': [
          'dist/dragula.js',
          'dist/dragula.css',
      ],
      'jb-d3': ['dist/jb-d3.js'],
      studio: [
        'dist/material.js','src/loader/jb-loader.js', 'src/ui/watchable/text-editor.js',
        'src/misc/parsing.js', 'src/ui/styles/codemirror-styles.js',
        'styles', 'path','utils', 'preview','popups','url','model-components', 'completion', 'undo','tgp-model', 'new-profile',
        'suggestions', 'properties','jb-editor-styles','edit-source','jb-editor','pick','h-to-jsx','style-editor',
        'references','properties-menu','save','open-project','tree',
        'data-browse', 'new-project','event-tracker', 'toolbar','search', 'main', 'component-header', 'hosts', 'probe'
      ],
      'studio-tests': [
        'projects/studio/studio-testers.js',
        'probe','model','tree','suggestion'
      ],
      'css-files': [
        'dist/material.min.css',
        'dist/material.indigo-pink.min.css',

        'css/font.css',
        'css/styles.css',
      ],
      babel: [
        'node_modules/babel-standalone/babel.js',
        'dist/babel-ext.js'
      ],
      'material': [
        'dist/material.js',
        'dist/material.css',
        'dist/material.indigo-pink.min.css',
      ],
      'node-adapter': [ 'src/node-adapter/node-adapter.js' ],
      'pretty-print': [ 'src/misc/pretty-print.js' ],
      'object-encoder': [ 'src/misc/object-encoder.js' ],
      'xml': [ 'src/misc/xml.js' ],
      'jison': [ 'dist/jb-jison.js', 'src/misc/jison.js' ],
      'parsing': [ 'src/misc/parsing.js' ],
      'spy': [ 'src/misc/spy.js' ],
      'dynamic-studio': [ 'src/misc/dynamic-studio.js' ],
})

function jb_dynamicLoad(modules,prefix) {
  prefix = prefix || '';
  modules.split(',').forEach(m=>{
    (jb_modules[m] || []).forEach(file=>{
      if (m == 'studio' && !file.match(/\//))
        file = 'projects/studio/studio-' + file + '.js';
      if (m == 'studio-tests' && !file.match(/\//))
        file = 'projects/studio-helper/studio-' + file + '-tests.js';
      // if (m=='node_modules/jquery/dist/jquery.min.js' && electron)
      //   return document.write('<script src="../node_modules/jquery/dist/jquery.min.js" onload="global.$ = window.$ = window.jQuery = module.exports;"></script>');

      if (prefix) { // avoid muliple source files with the same name in the debugger
        const file_path = file.split('/');
        file_path.push(prefix+file_path.pop());
        file = file_path.join('/');
      }
      // if (win.electron)
      //   return win.loadURL(`file://${win.jbartBase}/../${file}`)

      const url = (window.jbLoaderRelativePath ? '' : '/') + file;
      if (file.match(/\.js$/))
        document.write('<script src="' + url + '" charset="UTF-8"></script>')
      else
        document.write('<link rel="stylesheet" type="text/css" href="' + url + '" />');
    })
  })
}

if (typeof window != 'undefined')
  if (document.currentScript && document.currentScript.getAttribute('modules'))
    jb_dynamicLoad(document.currentScript.getAttribute('modules'),document.currentScript.getAttribute('prefix'));

if (typeof global != 'undefined')
 global.jb_modules = jb_modules;
;

