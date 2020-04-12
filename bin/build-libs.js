const fs = require('fs');
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
const studioFiles = filesOfModules('common,ui-common,ui-tree,dragula,codemirror,pretty-print,history,animate,fuse,md-icons').filter(x=>!x.match(/.css$/))
    .concat(jb_modules.studio.map(file => file.match(/\//) ? file : 'projects/studio/studio-' + file + '.js'));
const studioCssFiles = ['/css/styles.css', '/projects/studio/css/studio.css']
  .concat(filesOfModules('ui-common-css,codemirror-css,material-css')).filter(x=>x.match(/.css$/));
const nodeFiles = filesOfModules('common,node,pretty-print,xml,jison,parsing').filter(x=>!x.match(/.css$/));
const coreFiles = jb_modules['core'];

concatFiles(filesOfModules('common'),'common.js')
concatFiles(filesOfModules('ui-common'),'ui-common.js')
concatFiles(filesOfModules('ui-common-css'),'ui-common.css')

concatFiles(filesOfModules('codemirror-js-files'),'codemirror.js')
concatFiles(filesOfModules('animate'),'animate.js')
removeExports('animate.js')
concatFiles(filesOfModules('d3'),'d3.js');
concatFiles(filesOfModules('cards'),'cards.js');
concatFiles(filesOfModules('cards-sample-data'),'cards-sample-data.js');

concatFiles(['node_modules/dragula/dist/dragula.js'],'dragula.js')
concatFiles(['node_modules/history/umd/history.js'],'history.js')

concatFiles(jbReactFiles,'jb-react-all.js');
concatFiles(nodeFiles,'jb4node.js');
concatFiles(coreFiles,'jbart-core.js');
concatFiles(jb_modules['pretty-print'],'pretty-print.js');
concatFiles(jb_modules['parsing'],'parsing.js');
concatFiles(jb_modules['xml'],'xml.js');
concatFiles(studioCssFiles,'../bin/studio/css/studio-all.css');

concatFiles(studioFiles,'../bin/studio/studio-all.js');
concatFiles(['/src/loader/jb-loader.js'],'jb-loader.js');
concatFiles(['/src/testing/testers.js'],'testers.js');

concatFiles(filesOfModules('codemirror-css'),'codemirror.css')
concatFiles(['node_modules/dragula/dist/dragula.css'],'dragula.css')

concatFiles(filesOfModules('md-icons'),'md-icons.js')
