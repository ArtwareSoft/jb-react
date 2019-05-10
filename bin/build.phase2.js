var path = require('path');
var fs = require('fs');
require('../src/loader/jb-loader.js');

var JBART_DIR = __dirname + '/../';

function concatFiles(files,target) {
  const fn = JBART_DIR + 'dist/' + target;
  try {
    fs.unlinkSync(fn);
  } catch (e) {}
  files.map(x=>JBART_DIR +x).forEach(f=>
    fs.appendFileSync(fn,fs.readFileSync(f) + ';\n\n'));
}

function filesOfModules(modules) {
    return modules.split(',').map(m=>resources[m]).flat()
}

var jbReactFiles = filesOfModules('common','ui-common','ui-tree').filter(x=>!x.match(/.css$/));
var studioFiles = filesOfModules('common,ui-common,ui-tree,dragula,codemirror,pretty-print,history,deep-diff').filter(x=>!x.match(/.css$/))
    .concat(resources.studio.map(x=>'projects/studio/studio-' + x + '.js'));
var studioCssFiles = filesOfModules('common,ui-common,ui-tree,codemirror').filter(x=>x.match(/.css$/));
var nodeFiles = filesOfModules('common,node,pretty-print,xml,jison,parsing').filter(x=>!x.match(/.css$/));
var coreFiles = resources['core'];

concatFiles(jbReactFiles,'jb-react-all.js');
concatFiles(nodeFiles,'jb4node.js');
concatFiles(coreFiles,'jbart-core.js');
concatFiles(resources['pretty-print'],'pretty-print.js');
concatFiles(studioCssFiles,'../bin/studio/studio-all.css');
concatFiles(studioFiles,'../bin/studio/studio-all.js');
