const fs = require('fs');
require('../src/loader/jb-loader.js');

const JBART_DIR = __dirname + '/../';

function concatFiles(files,target) {
  const fn = JBART_DIR + 'dist/' + target;
  try {
    fs.unlinkSync(fn);
  } catch (e) {}
  files.map(x=>JBART_DIR +x).forEach(f=>
    fs.appendFileSync(fn,fs.readFileSync(f) + ';\n\n'));
}

const filesOfModules = modules => modules.split(',').map(m=>jb_modules[m]).flat().filter(x=>typeof x == 'string')

const jbReactFiles = filesOfModules('common,ui-common,pretty-print,ui-tree').filter(x=>!x.match(/.css$/));
const studioFiles = filesOfModules('common,ui-common,ui-tree,dragula,codemirror,pretty-print,history').filter(x=>!x.match(/.css$/))
    .concat(jb_modules.studio.map(file => file.match(/\//) ? file : 'projects/studio/studio-' + file + '.js'));
const studioCssFiles = filesOfModules('common,ui-common,ui-tree,codemirror,material-css').concat(['/css/styles.css', '/projects/studio/css/studio.css']).filter(x=>x.match(/.css$/));
const nodeFiles = filesOfModules('common,node,pretty-print,xml,jison,parsing').filter(x=>!x.match(/.css$/));
const coreFiles = jb_modules['core'];

concatFiles(filesOfModules('codemirror-js-files'),'codemirror.js')
concatFiles(['node_modules/material-design-lite/material.js'],'material.js')
concatFiles(['node_modules/dragula/dist/dragula.js'],'dragula.js')
concatFiles(['node_modules/history/umd/history.js'],'history.js')

concatFiles(jbReactFiles,'jb-react-all.js');
concatFiles(nodeFiles,'jb4node.js');
concatFiles(coreFiles,'jbart-core.js');
concatFiles(filesOfModules('d3'),'jb-d3.js');
concatFiles(jb_modules['pretty-print'],'pretty-print.js');
concatFiles(studioCssFiles,'../bin/studio/css/studio-all.css');

concatFiles(studioFiles,'../bin/studio/studio-all.js');
concatFiles(['/src/loader/jb-loader.js'],'jb-loader.js');
concatFiles(['/src/testing/testers.js'],'testers.js');

concatFiles(filesOfModules('codemirror-css-files'),'codemirror.css')
concatFiles(['node_modules/material-design-lite/material.css'],'material.css')
concatFiles(['node_modules/material-design-lite/dist/material.indigo-pink.min.css'],'material.indigo-pink.min.css')
concatFiles(['node_modules/dragula/dist/dragula.css'],'dragula.css')
