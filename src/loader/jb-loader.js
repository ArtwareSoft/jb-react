var jb_modules = Object.assign((typeof jb_modules != 'undefined' ? jb_modules : {}), {
      'core': [
        'src/core/jb-core.js',
        'src/core/core-utils.js',
        'src/core/jb-expression.js',
        'src/core/value-by-ref.js',
        'src/core/jb-macro.js',
        'src/misc/spy.js',
      ],
      'common': [
        'src/core/jb-core.js',
        'src/core/core-utils.js',
        'src/core/jb-expression.js',
        'src/core/value-by-ref.js',
        'src/core/jb-macro.js',
        'src/misc/spy.js',
        'src/core/jb-common.js',
        'src/misc/jb-callbag.js',
      ],
      'rx': [
        'src/misc/rx-comps.js',
      ],
      'ui-common-css': [
        'css/font.css',
        'css/styles.css',
      ],
      'ui-common': [
        'src/misc/rx-comps.js',
        'dist/jb-immutable.js', // the immutable-helper lib

        'src/ui/watchable/watchable-ref.js',
        'src/ui/core/vdom.js',
        'src/ui/core/jb-react.js',
        'src/ui/core/ui-comp.js',
        'src/ui/core/ui-utils.js',

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
        'src/ui/itemlist.js',
        'src/ui/itemlist-scroll.js',
        'src/ui/itemlist-container.js',
        'src/ui/menu.js',
        'src/ui/picklist.js',
        'src/ui/multi-select.js',
        'src/ui/theme.js',
        'src/ui/slider.js',
//        'src/ui/table.js',
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
        'src/misc/remote-context.js',
        'src/misc/remote-callbag.js',
      ],
      // 'inner-html': [ // unsafe
      //   'src/ui/inner-html.js',
      // ],
      'testers': [
        'src/testing/testers.js',
        'src/testing/testers-ui.js',
        'src/testing/user-input.js',
      ],
      'codemirror': [
          'dist/codemirror.js',
      ],
      'fuse': [
        'dist/fuse.js',
      ],
      'two-tier-widget': ['src/ui/two-tier-widget.js'],        
      'puppeteer': [
//        'src/misc/puppeteer/pptr-remote.js',
        'src/misc/puppeteer/pptr.js',
        'src/misc/puppeteer/crawler.js',
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
      'codemirror-css': [
        'node_modules/codemirror/addon/dialog/dialog.css',
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
      studio: [
        'dist/material.js', 'src/ui/watchable/text-editor.js',
        'src/misc/parsing.js', 'src/ui/styles/codemirror-styles.js',
        'styles', 'path','utils', 'preview','popups','url','model-components', 'completion', 'undo','tgp-model', 'new-profile',
        'suggestions', 'properties','jb-editor-styles','edit-source','jb-editor','pick','h-to-jsx','style-editor',
        'references','properties-menu','save','open-project','tree',
        'data-browse', 'new-project','event-tracker', 'comp-inspector','toolbar','search', 'main', 'component-header', 
        'hosts', 'probe', 'watch-ref-viewer', 'content-editable', 'position-thumbs', 'html-to-ctrl', 'patterns', 'pick-icon', 
        'inplace-edit', 'grid-editor', 'sizes-editor', 'refactor', 'vscode', 'pptr', 'chrome-debugger'
      ],
      'studio-tests': [
        'projects/studio/studio-testers.js',
        'probe','model','tree','suggestion','patterns','inplace-edit'
      ],
      $dependencies: {
        puppeteer: ['pretty-print','remote']
      }
})

Object.keys(jb_modules.$dependencies).forEach(m => jb_modules[m].dependencies = jb_modules.$dependencies[m])

function jb_dynamicLoad(modules,prefix,suffix) {
  modules = modules || '';
  const isDist = typeof window != 'undefined' && document.currentScript.getAttribute('src').indexOf('/dist/') != -1
  if (isDist) {
    const scriptSrc = document.currentScript.getAttribute('src')
    const base = window.jbModuleUrl && (window.jbModuleUrl + '/dist') || scriptSrc.slice(0,scriptSrc.lastIndexOf('/'))
    calcDependencies(modules).flatMap(m=>[m+'.js', `css/${m}.css`])
      .forEach(m=>loadFile([base,m].join('/')))
  } else {
    calcDependencies(modules).flatMap(m=>[m,...(jb_modules[`${m}-css`] ? [`${m}-css`]: [])]).forEach(m=>{
      (jb_modules[m] || []).forEach(file=>{
        if (m == 'studio' && !file.match(/\//))
          file = 'projects/studio/studio-' + file + '.js';
        if (m == 'studio-tests' && !file.match(/\//))
          file = 'projects/studio-helper/studio-' + file + '-tests.js';

        if (prefix) { // avoid multiple source files with the same name in the debugger
          const file_path = file.split('/');
          file_path.push(prefix+file_path.pop());
          file = file_path.join('/');
        }
        if (suffix) file += suffix

        const url = (window.jbLoaderRelativePath ? '' : '/') + file;
        loadFile(url)
      })
    })
  }
  function unique(ar) {
    const keys = {}, res = [];
    ar.forEach(e=>{
      if (!keys[e]) {
        keys[e] = true;
        res.push(e)
      }
    })
    return res;
  }
  function calcDependencies(modules) {
      return unique(modules.split(',').flatMap(m=>[ ...(jb_modules[m] && jb_modules[m].dependencies || []), m]))
  }
}

if (typeof window != 'undefined')
  if (document.currentScript && document.currentScript.getAttribute('modules'))
    jb_dynamicLoad(document.currentScript.getAttribute('modules'),document.currentScript.getAttribute('prefix'),document.currentScript.getAttribute('suffix'));

if (typeof global != 'undefined') global.jb_modules = jb_modules;

loadProject()

function loadProject() {
  if (typeof jbProjectSettings == 'undefined') return
  jbProjectSettings.baseUrl = jbProjectSettings.baseUrl || ''

  jb_dynamicLoad(jbProjectSettings.libs); // may load packaged libs from dist

  [...(jbProjectSettings.jsFiles || []), ...(jbProjectSettings.cssFiles || [])]
    .forEach(fn=> loadFile(pathOfProjectFile(fn,jbProjectSettings)) )
}

function jb_initWidget() {
  if (!document.getElementById('main')) {
    const mainElem = document.createElement('div')
    mainElem.setAttribute('id','main')
    document.body.appendChild(mainElem)
  }
  const fixedProjName = (jbProjectSettings.project||'').replace(/[_-]([a-zA-Z])/g, (_, letter) => letter.toUpperCase())
  const initTheme = jbProjectSettings.theme || jb.path(jb.comps,'defaultTheme.impl')
  const entryProf = jbProjectSettings.entry ? (jbProjectSettings.entry.$ ? jbProjectSettings.entry : {$: jbProjectSettings.entry})
    : jb.path(jb.comps[`${fixedProjName}.main`],'impl')
  const el = document.getElementById('main');
  (async () => {
    await initTheme && jb.exec(initTheme)
    await entryProf && jb.ui.renderWidget(entryProf, el)
  })()
}

function pathOfProjectFile(fn,{project,baseUrl,source} = {}) {
  const isVscode = (source||'').indexOf('vscode') == 0
  if (isVscode && fn[0] == '/')
    return fn  
  else if (source == 'vscodeUserHost')
    return `${baseUrl}/${project}/${fn}`
  else if (source == 'vscodeDevHost')
    return `/projects/${project}/${fn}`
  else if (!isVscode && baseUrl.indexOf('//') != -1)
    return baseUrl + fn  
  else if (baseUrl)
    return baseUrl == './' ? fn : `/${project}/${fn}`
  else if (fn[0] == '/')
    return fn
  else if (source == 'studio')
    return `/projects/${project}/${fn}`
 }
 
 function loadFile(url) {
  if (window.jbBaseProjUrl && !url.match('//'))
    url = [window.jbBaseProjUrl.replace(/\/$/,''),url.replace(/^\//,'')].join('/')
  if (url.match(/\.js$|\.js\?/))
     document.write(`<script src="${url}" charset="UTF-8"></script>`)
   else
     document.write(`<link rel="stylesheet" type="text/css" href="${url}" />`);
 }
 
 if (typeof module != 'undefined')
  module.exports = jb_modules