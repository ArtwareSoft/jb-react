const fs = require('fs');

var jb_modules = {
  'core': [
    'src/core/jb-core.js',
    'src/core/core-utils.js',
    'src/core/jb-expression.js',
    'src/core/db.js',
    'src/core/jb-macro.js',
    'src/misc/spy.js',
  ],
  'common': [
    'src/core/jb-core.js',
    'src/core/core-utils.js',
    'src/core/jb-expression.js',
    'src/core/db.js',
    'src/core/jb-macro.js',
    'src/loader/code-loader.js',
    'src/misc/spy.js',
    'src/core/jb-common.js',
    'src/misc/jb-callbag.js',
  ],
  'rx': [
    'src/misc/rx-comps.js',
  ],
  watchable: [
    'src/ui/watchable/watchable.js',
  ],
  'ui-common-css': [
    'css/font.css',
    'css/styles.css',
  ],
  'ui-common': [
    'src/misc/rx-comps.js',
    'src/ui/watchable/watchable.js',
    'src/ui/core/jb-react.js',
    'src/ui/core/vdom.js',
    'src/ui/core/ui-comp.js',
    'src/ui/core/ui-utils.js',
    'src/ui/core/ui-frontend.js',
    'src/ui/core/ui-watchref.js',

    'src/ui/common-features.js',
    'src/ui/front-end-features.js',
    'src/ui/css-features.js',

    'src/ui/text.js',
    'src/ui/group.js',
    'src/ui/html.js',
    'src/ui/image.js',
    'src/ui/icon.js',
    'src/ui/button.js',
    'src/ui/field.js',
    'src/ui/editable-text.js',
    'src/ui/editable-boolean.js',
    'src/ui/editable-number.js',
    'src/ui/dialog.js',
    'src/ui/itemlist/itemlist.js',
    'src/ui/itemlist/itemlist-selection.js',
    'src/ui/itemlist/itemlist-dd.js',
    'src/ui/itemlist/itemlist-scroll.js',
    'src/ui/itemlist/itemlist-container.js',
    'src/ui/itemlist/table.js',
    'src/ui/menu.js',
    'src/ui/picklist.js',
    'src/ui/multi-select.js',
    'src/ui/theme.js',
    'src/ui/slider.js',
    'src/ui/window.js',
    'src/ui/divider.js',
    'src/ui/editable-text-helper-popup.js',

    'src/ui/styles/mdc-styles.js',
    'src/ui/styles/text-styles.js',
    'src/ui/styles/button-styles.js',
    'src/ui/styles/editable-text-styles.js',
    'src/ui/styles/layout-styles.js',
    'src/ui/styles/group-styles.js',
    'src/ui/styles/itemlist-styles.js',
    'src/ui/styles/picklist-styles.js',
    'src/ui/styles/property-sheet-styles.js',
    'src/ui/styles/editable-boolean-styles.js',
  ],
  'ui-tree':[
    'src/ui/tree/tree.js',
    'src/ui/tree/table-tree.js',
    'src/ui/tree/json-tree-model.js',
  ],
  remote: [
    'src/misc/pretty-print.js',
    'src/misc/remote-context.js',
    'src/misc/jbm.js',
    'src/misc/remote.js',
  ],
  'testers': [
    'src/testing/testers.js',
    'src/testing/testers-ui.js',
    'src/testing/user-input.js',
  ],
  // 'codemirror': [
  //     'dist/codemirror.js',
  // ],
  'fuse': ['dist/fuse.js' ],
  'markdown-editor': [
    'node_modules/codemirror/mode/markdown/markdown.js',
    'node_modules/codemirror/addon/edit/continuelist.js',
    'node_modules/codemirror/addon/display/fullscreen.js',
    'node_modules/codemirror/addon/mode/overlay.js',
    'node_modules/codemirror/addon/display/placeholder.js',
    'node_modules/codemirror/addon/selection/mark-selection.js',
    'node_modules/codemirror/addon/formatting/formatting.js',
    'node_modules/codemirror/mode/gfm/gfm.js',
    'node_modules/codemirror/lib/util/formatting.js',
    'dist/mark.js',
    'dist/simplemde.js',
    'dist/css/simplemde.css',
    'src/ui/markdown-viewer.js',
    'src/ui/markdown-editor.js',
  ],
  markdown: [
    'dist/mark.js',
    'src/ui/markdown-viewer.js',
  ],
  'remote-widget': ['src/ui/remote-widget.js'],        
  'puppeteer': [
//        'src/misc/puppeteer/pptr-remote.js',
    'src/misc/puppeteer/pptr.js',
    'src/misc/puppeteer/crawler.js',
  ],            
  'codemirror': [
    'node_modules/codemirror/lib/codemirror.js',
    'node_modules/codemirror/mode/xml/xml.js',
    'node_modules/codemirror/mode/javascript/javascript.js',
    'node_modules/codemirror/mode/css/css.js',
    'node_modules/codemirror/mode/jsx/jsx.js',
    'node_modules/codemirror/mode/htmlmixed/htmlmixed.js',
    'node_modules/codemirror/addon/hint/show-hint.js',
    'node_modules/codemirror/addon/formatting/formatting.js',

    'node_modules/codemirror/addon/dialog/dialog.js',
    'node_modules/codemirror/addon/search/searchcursor.js',
    'node_modules/codemirror/addon/search/search.js',
    'node_modules/codemirror/addon/scroll/annotatescrollbar.js',
    'node_modules/codemirror/addon/search/matchesonscrollbar.js',

    'node_modules/codemirror/addon/fold/foldcode.js',
    'node_modules/codemirror/addon/fold/foldgutter.js',
    'node_modules/codemirror/addon/fold/brace-fold.js',
    'node_modules/codemirror/addon/fold/xml-fold.js',
    'node_modules/codemirror/addon/fold/indent-fold.js',

    'node_modules/codemirror/addon/selection/active-line.js',
//        'src/ui/watchable/text-editor.js',
    'src/ui/styles/codemirror-styles.js',
  ],
  'codemirror-backend': ['/src/ui/styles/codemirror-styles.js'],
  'codemirror-css': [
    'node_modules/codemirror/addon/dialog/dialog.css',
    'node_modules/codemirror/addon/fold/foldgutter.css',
    'node_modules/codemirror/addon/search/matchesonscrollbar.css',
    'node_modules/codemirror/lib/codemirror.css',
    'node_modules/codemirror/theme/solarized.css',
    'node_modules/codemirror/addon/hint/show-hint.css',
  ],
  animate: [
    'node_modules/animejs/lib/anime.js',
    'src/ui/animation/animation.js'
  ],
  cards: [
    'src/ui/cards/cards.js',
    'src/ui/cards/cards-styles.js',
    'src/ui/cards/cards-adapters.js',
  ],
  'cards-sample-data': [
    'src/ui/cards/sample-data/wix-blog.js',
    'src/ui/cards/sample-data/wordpress-angrybirds.js',
  ],
  'd3': [
    'node_modules/d3/dist/d3.js',
    'src/ui/d3-chart/d3-math.js',
    'src/ui/d3-chart/d3-chart.js',
    'src/ui/d3-chart/d3-histogram.js',
  ],
  'vega-lite': [
    'dist/vega-lite.js', 
    'src/ui/vega/jb-vega-lite.js'
  ],    
  'statistics': [
    'dist/jstat.js', 
    'src/misc/jb-stat.js'
  ],    
  'dragula': [
      'dist/dragula.js',
      'dist/css/dragula.css',
  ],
  'jb-d3': ['dist/jb-d3.js'],
  'css-files': [
    'dist/css/material.css',
    'css/font.css',
    'css/styles.css',
  ],
  'md-icons': [
    'dist/mdi-lib.js',
  ],
  babel: [
    'node_modules/babel-standalone/babel.js',
    'dist/babel-ext.js'
  ],
  'material': [
    'dist/material.js',
  ],
  'material-css': [
    'dist/css/material.css',
  ],
  'history': [ 'dist/history.js' ],
  'node-adapter': [ 'src/node-adapter/node-adapter.js' ],
  'pretty-print': [ 'src/misc/pretty-print.js' ],
  'object-encoder': [ 'src/misc/object-encoder.js' ],
  'xml': [ 'src/misc/xml.js' ],
  'jison': [ 'dist/jb-jison.js', 'src/misc/jison.js' ],
  'parsing': [ 'src/misc/parsing.js' ],
  'notebook-worker': [ 'projects/studio/studio-path.js','src/ui/notebook/notebook-common.js'],
  studio: [
    'dist/material.js', 'src/ui/watchable/text-editor.js',
    'src/misc/parsing.js',
    'styles', 'path','utils', 'preview','popups','url','model-components', 'completion', 'undo','tgp-model', 'new-profile',
    'suggestions', 'properties','jb-editor-styles','edit-source','jb-editor','pick','h-to-jsx','style-editor',
    'references','properties-menu','save','open-project','tree',
    'data-browse', 'new-project','event-tracker', 'comp-inspector','toolbar','search', 'main', 'component-header', 
    'hosts', 'probe', 'watch-ref-viewer', 'content-editable', 'position-thumbs', 'html-to-ctrl', 'pick-icon', 
    'inplace-edit', 'grid-editor', 'sizes-editor', 'refactor', 'vscode', 'pptr', 'chrome-debugger',

    'src/ui/notebook/notebook-common.js', 'notebook',
  ],
})

const JBART_DIR = __dirname + '/../';

function concatFiles(files,target,pre,post) {
  const fn = JBART_DIR + 'dist/' + target;
  const type = (target.match(/.css$/)) ? 'css' : 'js'
  try {
    fs.unlinkSync(fn);
  } catch (e) {}
  if (pre) fs.appendFileSync(fn,pre)
  files.map(x=>JBART_DIR +x).forEach(f=>
    fs.appendFileSync(fn,('' +fs.readFileSync(f)) + (type === 'css' ? '' : ';\n\n') ) );
  if (post) fs.appendFileSync(fn,post)
}
function packLibrary(moduleName, jbFiles) {
  const pre = `if (typeof jbmFactory == 'undefined') jbmFactory = {};
jbmFactory['${moduleName}'] = function(jb) {
  jb.importAllMacros && eval(jb.importAllMacros());
`
  const post = `
};`
  concatFiles(jbFiles,`${moduleName}-lib.js`,pre,post)
}

function removeExports(target) {
  const fn = JBART_DIR + 'dist/' + target;
  fs.writeFileSync(fn,('' +fs.readFileSync(fn)).replace(/module.exports = .*/,''))
}
function fixExports(target) {
  const fn = JBART_DIR + 'dist/' + target;
  fs.writeFileSync(fn,('' +fs.readFileSync(fn)).replace(/}\(this,/,'}(this || self,'))
}

const filesOfModules = modules => modules.split(',').map(m=>jb_modules[m]).flat().filter(x=>typeof x == 'string')

const studioFiles = filesOfModules('common,ui-common,ui-tree,dragula,codemirror,pretty-print,remote,history,animate,fuse,md-icons,remote-widget').filter(x=>!x.match(/.css$/))
    .concat(jb_modules.studio.map(file => file.match(/\//) ? file : 'projects/studio/studio-' + file + '.js'));
const studioCssFiles = ['/css/styles.css','css/font.css','/projects/studio/css/studio.css']
  .concat(filesOfModules('codemirror-css,material-css')).filter(x=>x.match(/.css$/));
const vDebuggerFiles = [...filesOfModules('common,ui-common,ui-tree,remote,remote-widget,codemirror-backend'), '/src/ui/tree/table-tree.js','src/ui/watchable/text-editor.js',
 ...['path','model-components','event-tracker','comp-inspector'].map(x=>`/projects/studio/studio-${x}.js`)]


'core,common,ui-common,watchable,animate,d3,cards,cards-sample-data,pretty-print,parsing,xml,puppeteer,rx,md-icons,remote,remote-widget,codemirror-backend,markdown,notebook-worker'
  .split(',').forEach(m=>packLibrary(m,jb_modules[m]))

concatFiles(filesOfModules('codemirror').filter(x=>x.match(/node_modules/)) ,'codemirror.js')
packLibrary('codemirror',filesOfModules('codemirror'))
fixExports('codemirror-lib.js')
removeExports('animate-lib.js')

concatFiles(['node_modules/dragula/dist/dragula.js'],'dragula.js')
concatFiles(['node_modules/history/umd/history.js'],'history.js')


packLibrary('studio-all',studioFiles);
packLibrary('vDebugger',vDebuggerFiles);
//fixExports('studio-all-lib.js')

concatFiles(['/src/loader/jb-loader.js'],'jb-loader.js');
concatFiles(['/src/testing/testers.js'],'testers.js');

concatFiles(filesOfModules('ui-common-css'),'css/ui-common.css')
concatFiles(filesOfModules('codemirror-css'),'css/codemirror.css')
concatFiles(studioCssFiles,'../bin/studio/css/studio-all.css');
concatFiles(['node_modules/dragula/dist/dragula.css'],'css/dragula.css')

