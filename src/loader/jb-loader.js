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
      watchable: [
        'dist/jb-immutable.js', // the immutable-helper lib
        'src/ui/watchable/watchable-ref.js',
      ],
      'ui-common-css': [
        'css/font.css',
        'css/styles.css',
      ],
      'ui-common': [
        'src/misc/rx-comps.js',
        'dist/jb-immutable.js', // the immutable-helper lib
        'src/ui/watchable/watchable-ref.js',
        'src/ui/core/jb-react.js',
        'src/ui/core/vdom.js',
        'src/ui/core/ui-comp.js',
        'src/ui/core/ui-utils.js',
        'src/ui/core/ui-frontend.js',

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
        'hosts', 'probe', 'watch-ref-viewer', 'content-editable', 'position-thumbs', 'html-to-ctrl', 'patterns', 'pick-icon', 
        'inplace-edit', 'grid-editor', 'sizes-editor', 'refactor', 'vscode', 'pptr', 'chrome-debugger',

        'src/ui/notebook/notebook-common.js', 'notebook',
      ],
      $dependencies: {
        puppeteer: ['pretty-print','remote']
      }
})

Object.keys(jb_modules.$dependencies).forEach(m => jb_modules[m].dependencies = jb_modules.$dependencies[m])

var jbFrame = (typeof frame == 'object') ? frame : typeof self === 'object' ? self : typeof global === 'object' ? global : null;
if (typeof jb == 'undefined') jb = {}
if (typeof global != 'undefined') global.jb_modules = jb_modules;

function jb_dynamicLoad(modules, settings) {
  if (settings.loadFromDist)
      return modules.reduce((pr,lib) => pr.then(jbm=> {
        const dist = typeof jbModuleUrl != 'undefined' && (window.jbModuleUrl + '/dist') || '/dist' // for devtools
        return loadFile(`${dist}/${lib}-lib.js`).then(()=>{
          jbmFactory[lib](jbm)
          return jbm
        })
      }), Promise.resolve(settings))

  return calcDependencies(modules)
      .flatMap(m=>[m,...(jb_modules[`${m}-css`] ? [`${m}-css`]: [])])
      .flatMap(m=> (jb_modules[m] || []).map(file=>({m,file})) )
      .reduce((pr, {m,file})=> pr.then(() => {
        if (m == 'studio' && !file.match(/\//))
          file = 'projects/studio/studio-' + file + '.js';
        const url = (self.jbLoaderRelativePath ? '' : '/') + file;
        return loadFile(url)
      }), Promise.resolve())

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
      return unique(modules.flatMap(m=>[ ...(jb_modules[m] && jb_modules[m].dependencies || []), m]))
  }

  function loadFile(url) {
    const isWorker = typeof window == 'undefined', isJs = url.match(/\.js$|\.js\?/)
    const suffix = `?${settings.uri || settings.project}`
    if (self.jbBaseProjUrl && !url.match('//'))
      url = [self.jbBaseProjUrl.replace(/\/$/,''),url.replace(/^\//,'')].join('/')

    if (isWorker) {
      return Promise.resolve(isJs && importScripts(location.origin+url+suffix))
    } else {
      return new Promise(resolve => {
        const type = url.indexOf('.css') == -1 ? 'script' : 'link'
        var s = document.createElement(type)
        s.setAttribute(type == 'script' ? 'src' : 'href',`${url}${suffix}`)
        if (type == 'script') 
          s.setAttribute('charset','utf8') 
        else 
          s.setAttribute('rel','stylesheet')
        s.onload = s.onerror = resolve
        document.head.appendChild(s);
      })
    }
  }  
}

async function jb_loadProject(settings) {
  settings.baseUrl = settings.baseUrl || ''
  self.jbLoadingPhase = 'libs'
  const _jb = await jb_dynamicLoad(settings.libs.split(','),settings); // may load packaged libs from dist
  self.jbLoadingPhase = 'appFiles'
  await [...(settings.jsFiles || []), ...(settings.cssFiles || [])].reduce((pr,fn) => pr.then(() => {
      const path = pathOfProjectFile(fn,settings)
//      console.log('loading file',fn,path)
      return loadAppFile(path) 
    }), Promise.resolve())
  return self.jb || _jb

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
    else if (source == 'studio')
      return `/projects/${project}/${fn}`
    else
      return fn
  }
  
  async function loadAppFile(url) {
    const ret = await fetch(url)
    const code = await ret.text()
    const macros = jb.importAllMacros()
    eval([`(() => { ${macros} \n${code}})()`,`//# sourceURL=${url}?${settings.uri || settings.project}`].join('\n'))
    return
  }
}

async function jb_initWidget(settings,doNotLoadProject) { // export
  !doNotLoadProject && await jb_loadProject(settings || jbFrame.jbProjectSettings)
  if (!document.getElementById('main')) {
    const mainElem = document.createElement('div')
    mainElem.setAttribute('id','main')
    document.body.appendChild(mainElem)
  }
  const fixedProjName = (jbProjectSettings.project||'').replace(/[_-]([a-zA-Z])/g, (_, letter) => letter.toUpperCase())
  const initTheme = jbProjectSettings.theme || jb.path(jb.comps,'defaultTheme.impl')
  const entryProf = jbProjectSettings.entry ? (jbProjectSettings.entry.$ ? jbProjectSettings.entry : {$: jbProjectSettings.entry})
    : jb.path(jb.comps[`${fixedProjName}.main`],'impl')
  const el = document.getElementById('main')
  jb.log('jbLoader init widget',{entryProf,el,initTheme,fixedProjName})
  jb.uri = jb.uri || fixedProjName
  await (initTheme && jb.exec(initTheme))
  await (entryProf && jb.ui.renderWidget(entryProf, el))
  jb.initSpyByUrl && jb.initSpyByUrl()
  jb.widgetInitialized = true
}
 
function jbm_create(libs, settings) {  // export
  return jb_dynamicLoad(libs, settings) 
}

if (typeof module != 'undefined')
  module.exports = jb_modules