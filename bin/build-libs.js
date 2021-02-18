const fs = require('fs');

require('../src/loader/jb-loader.js');

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

