var path = require('path');
var fs = require('fs');
require('../src/loader/jb-loader.js');

var JBART_DIR = __dirname + '/../';

function concatFiles(files,target) {
  try {
  fs.unlinkSync(JBART_DIR +target);
  } catch (e) {}
  files.map(x=>JBART_DIR +x).forEach(f=>
    fs.appendFileSync(JBART_DIR +target,fs.readFileSync(f) + ';\n\n'));
}

var jbReactFiles = [].concat.apply([],[resources['common'],resources['ui-common'],resources['ui-tree']]).filter(x=>!x.match(/.css$/));
var studioFiles = [].concat.apply([],[resources['common'],resources['ui-common'],resources['ui-tree'],resources['codemirror']]).filter(x=>!x.match(/.css$/))
    .concat(resources.studio.map(x=>'projects/studio/studio-' + x + '.js'));
var nodeFiles = [].concat.apply([],[resources['common'],resources['node'],resources['pretty-print'],resources['xml'],resources['jison'],resources['parsing']]).filter(x=>!x.match(/.css$/));
var coreFiles = resources['core'];

concatFiles(studioFiles,'dist/studio-all.js');
concatFiles(jbReactFiles,'dist/jb-react-all.js');
concatFiles(nodeFiles,'dist/jb4node.js');
concatFiles(coreFiles,'dist/jbart-core.js');
