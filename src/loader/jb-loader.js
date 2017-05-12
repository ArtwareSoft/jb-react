var resources = {
      'common': [
        'src/core/jb-core.js',
        'src/core/jb-common.js',
      ],
      'ui-common': [
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/material-design-lite/material.min.js',
        'node_modules/material-design-lite/material.min.css',
        'node_modules/material-design-lite/dist/material.indigo-pink.min.css',

        'css/font.css',
        'css/styles.css',

        'dist/jb-preact.js',
        'dist/jb-immutable.js', // the immutable-helper lib
        'dist/jb-rx.js',

        'src/ui/react-ctrl.js',
        'src/ui/immutable.js',

        'src/ui/group.js',
        'src/ui/label.js',
        'src/ui/image.js',
        'src/ui/button.js',
        'src/ui/field.js',
        'src/ui/editable-text.js',
        'src/ui/editable-boolean.js',
        'src/ui/editable-number.js',
        'src/ui/common-features.js',
        'src/ui/css-features.js',
        'src/ui/dialog.js',
        'src/ui/menu.js',
        'src/ui/itemlist.js',
        'src/ui/itemlist-container.js',
        'src/ui/itemlist-with-groups.js',
        'src/ui/picklist.js',
        'src/ui/theme.js',
        'src/ui/icon.js',
        'src/ui/window.js',

        'src/ui/styles/mdl-styles.js',
        'src/ui/styles/button-styles.js',
        'src/ui/styles/editable-text-styles.js',
        'src/ui/styles/layout-styles.js',
        'src/ui/styles/group-styles.js',
        'src/ui/styles/picklist-styles.js',
        'src/ui/styles/property-sheet-styles.js',
        'src/ui/styles/editable-boolean-styles.js',
      ],
      'ui-tree':[
        'src/ui/tree/tree.js',
        'src/ui/tree/json-tree-model.js',
      ],
      'testers': [
        'src/testing/testers.js',
      ],
      'codemirror': [
        'src/ui/styles/codemirror-styles.js',
        'node_modules/codemirror/lib/codemirror.js',
        'node_modules/codemirror/mode/xml/xml.js',
        'node_modules/codemirror/mode/javascript/javascript.js',
        'node_modules/codemirror/mode/css/css.js',
        'node_modules/codemirror/mode/htmlmixed/htmlmixed.js',
        'node_modules/codemirror/addon/hint/show-hint.js',
        'node_modules/codemirror/addon/hint/javascript-hint.js',
        'node_modules/codemirror/addon/hint/xml-hint.js',
        'node_modules/codemirror/addon/hint/html-hint.js',
        'node_modules/codemirror/addon/fold/foldgutter.js',
        'node_modules/codemirror/addon/selection/active-line.js',

        'node_modules/codemirror/lib/codemirror.css',
        'node_modules/codemirror/theme/solarized.css'
      ],
      'history': [
        'node_modules/history/umd/history.js',
        'src/ui/url.js'
      ],
      'dragula': [
          'node_modules/dragula/dist/dragula.js',
          'node_modules/dragula/dist/dragula.css',
      ],
      studio: [
        'utils','path','main', 'pretty-print', 
        'toolbar','styles', 'search', 'new-control', 'data-browse', 'preview', 'tgp-model', 'model-components',
        'tree','popups','properties','pick','properties-menu','save','open-project', //'new-control',
        'suggestions','undo','edit-source','jb-editor','jb-editor-styles','probe','testers'
      ],
      'studio-tests': [
        'path','model','tree','suggestion'
      ],
      'css-files': [
        'node_modules/material-design-lite/material.min.css',
        'node_modules/material-design-lite/dist/material.indigo-pink.min.css',

        'css/font.css',
        'css/styles.css',
      ]
};

function jb_dynamicLoad(modules,prefix) {
  prefix = prefix || '';
  modules.split(',').forEach(m=>{
    (resources[m] || []).forEach(file=>{
      if (m == 'studio')
        file = 'projects/studio/studio-' + file + '.js';
      if (m == 'studio-tests')
        file = 'projects/studio-helper/studio-' + file + '-tests.js';

      if (prefix) { // avoid muliple source files with the same name in the debugger
        var file_path = file.split('/');
        file_path.push(prefix+file_path.pop());
        file = file_path.join('/');
      }

      var url = (window.jbLoaderRelativePath ? '' : '/') + file;
      if (file.match(/\.js$/))
        document.write('<script src="' + url + '"></script>')
      else
        document.write('<link rel="stylesheet" type="text/css" href="' + url + '" />');
    })
  })
}

if (typeof window != 'undefined')
  if (document.currentScript && document.currentScript.getAttribute('modules'))
    jb_dynamicLoad(document.currentScript.getAttribute('modules'),document.currentScript.getAttribute('prefix'));

if (typeof global != 'undefined')
 global.resources = resources;
