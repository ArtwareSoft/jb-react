var resources = {
      'common': [
        'dist/jb.js',
        'src/core/jb-common.js'
      ],
      'ui-common': [
        'dist/jb-rx.js',
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/material-design-lite/material.js',
        'node_modules/material-design-lite/material.min.css',
        'node_modules/material-design-lite/dist/material.indigo-pink.min.css',

        'css/font.css',
        'css/styles.css',

        'dist/ui-base-and-styles.js',
        'src/ui/group.js',
        'src/ui/label.js',
        'src/ui/button.js',
        'src/ui/field.js',
        'src/ui/editable-text.js',
        'src/ui/common-features.js',
        'src/ui/css-features.js',
        'src/ui/dialog.js',
        'src/ui/itemlist.js',
        'src/ui/itemlist-container.js',
        'src/ui/itemlist-with-groups.js',

        'src/ui/styles/layout-styles.js',
        'src/ui/styles/group-styles.js',
        'src/ui/styles/property-sheet-styles.js'
      ],
      'ui-tree':[
        'src/ui/tree/tree.js',
        'src/ui/tree/json-tree-model.js',
      ],
      'testers': [
        'src/testing/testers.js',
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
          'node_modules/dragula/dist/dragula.js',
          'node_modules/dragula/dist/dragula.css',
      ]
};

export function dynamicLoad(modules) {
  modules.split(',').forEach(m=>{
    (resources[m] || []).forEach(file=>{
      if (m == 'studio')
        file = 'projects/studio/' + file;

      var url = (window.jbLoaderRelativePath ? '' : '/') + file;
      if (file.match(/\.js$/))
        document.write('<script src="' + url + '"></script>')
      else
        document.write('<link rel="stylesheet" type="text/css" href="' + url + '" />');
    })
  })
}

if (document.currentScript && document.currentScript.getAttribute('modules'))
    dynamicLoad(document.currentScript.getAttribute('modules'));

var jb_studio_modules = ['tgp-model','model-components.js','path','utils','main.js','preview','menu.js','toolbar','tests','popups.js'
,'tree','properties.js','properties-menu.js','pick.js','save','probe','edit-source','new-control.js','testers'
,'undo','styles.js','style-editor.js','data-browse','open-project.js','jb-editor.js','jb-editor-styles.js','suggestions','context-viewer.js','search.js']
  .map(x=> x.match(/\.js$/) ? 'projects/studio/studio-' + x : 'studio/studio-' + x  )

