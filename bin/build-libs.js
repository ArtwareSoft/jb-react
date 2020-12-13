const fs = require('fs');
const copyFiles = require('copyfiles');

require('../src/loader/jb-loader.js');

const JBART_DIR = __dirname + '/../';

function concatFiles(files,target) {
  const fn = JBART_DIR + 'dist/' + target;
  const type = (target.match(/.css$/)) ? 'css' : 'js'
  try {
    fs.unlinkSync(fn);
  } catch (e) {}
  files.map(x=>JBART_DIR +x).forEach(f=>
    fs.appendFileSync(fn,('' +fs.readFileSync(f)) + (type === 'css' ? '' : ';\n\n') ) );
}
function removeExports(target) {
  const fn = JBART_DIR + 'dist/' + target;
  fs.writeFileSync(fn,('' +fs.readFileSync(fn)).replace(/module.exports = .*/,''))
}

const filesOfModules = modules => modules.split(',').map(m=>jb_modules[m]).flat().filter(x=>typeof x == 'string')

const jbReactFiles = filesOfModules('common,ui-common,pretty-print,ui-tree,remote').filter(x=>!x.match(/.css$/));
const studioFiles = filesOfModules('common,ui-common,ui-tree,dragula,codemirror,pretty-print,remote,history,animate,fuse,md-icons,two-tier-widget').filter(x=>!x.match(/.css$/))
    .concat(jb_modules.studio.map(file => file.match(/\//) ? file : 'projects/studio/studio-' + file + '.js'));
const studioCssFiles = ['/css/styles.css','css/font.css','/projects/studio/css/studio.css']
  .concat(filesOfModules('codemirror-css,material-css')).filter(x=>x.match(/.css$/));
const nodeFiles = filesOfModules('common,node,pretty-print,xml,jison,parsing').filter(x=>!x.match(/.css$/));

'core,common,ui-common,animate,d3,cards,cards-sample-data,pretty-print,parsing,xml,puppeteer,rx,md-icons,remote,two-tier-widget'
  .split(',').forEach(m=>concatFiles(jb_modules[m],`${m}.js`))

concatFiles(filesOfModules('ui-common-css'),'css/ui-common.css')
concatFiles(filesOfModules('codemirror-js-files'),'codemirror.js')
removeExports('animate.js')

concatFiles(['node_modules/dragula/dist/dragula.js'],'dragula.js')
concatFiles(['node_modules/history/umd/history.js'],'history.js')

concatFiles(jbReactFiles,'jb-react-all.js');
concatFiles(nodeFiles,'jb4node.js');
concatFiles(studioCssFiles,'../bin/studio/css/studio-all.css');

concatFiles(studioFiles,'../bin/studio/studio-all.js');
concatFiles(studioFiles.filter(x=>!x.match(/codemirror|history/)),'../bin/studio/studio-observable.js');
concatFiles(['/src/loader/jb-loader.js'],'jb-loader.js');
concatFiles(['/src/testing/testers.js'],'testers.js');
concatFiles(filesOfModules('codemirror-css'),'css/codemirror.css')
concatFiles(['node_modules/dragula/dist/dragula.css'],'css/dragula.css')
