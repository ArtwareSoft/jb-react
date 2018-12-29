var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
require('./src/loader/jb-loader.js');

var JBART_DIR = __dirname + '/';
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


function concatFiles(files,target) {
  try {
  fs.unlinkSync(JBART_DIR +target);
  } catch (e) {}
  files.map(x=>JBART_DIR +x).forEach(f=>
    fs.appendFileSync(JBART_DIR +target,fs.readFileSync(f) + ';\n\n'));
}

var jbReactFiles = [].concat.apply([],[resources['common'],resources['ui-common'],resources['ui-tree'],resources['codemirror']]).filter(x=>!x.match(/.css$/));
var studioFiles = [].concat.apply([],[resources['common'],resources['ui-common'],resources['ui-tree'],resources['codemirror']]).filter(x=>!x.match(/.css$/))
    .concat(resources.studio.map(x=>'projects/studio/studio-' + x + '.js'));
var nodeFiles = [].concat.apply([],[resources['common'],resources['node'],resources['pretty-print'],resources['xml'],resources['jison'],resources['parsing']]).filter(x=>!x.match(/.css$/));


console.log(jbReactFiles);

concatFiles(studioFiles,'dist/studio-all.js');
concatFiles(jbReactFiles,'dist/jb-react-all.js');
concatFiles(nodeFiles,'dist/jb4node.js');

var jbRx = {
  mode: 'development',
  entry: JBART_DIR + 'src/ui/jb-rx.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-rx.js',
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
};

var jbPreact = {
  mode: 'development',
  entry: JBART_DIR + 'src/ui/jb-preact.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-preact.js',
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
};

var jbImmutable = {
  mode: 'development',
  entry: JBART_DIR + 'src/ui/jb-immutable.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-immutable.js',
  },
  resolve: { modules: [ 'node_modules' ] },
//  resolve1: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
};

var babel_ext = {
  mode: 'development',
  entry: JBART_DIR + 'projects/studio/studio-babel-ext.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'babel-ext.js',
  },
  node: {
    fs: 'empty',
    child_process: 'empty',
  },
  resolve: { modules: [ 'node_modules' ] },
};

var jbRxMin = {
  mode: 'development',
  entry: JBART_DIR + 'src/ui/jb-rx.js',
//  entry: JBART_DIR + 'projects/ui-tests/common-styles.jsx',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-rx.min.js',
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
  plugins: [ new UglifyJSPlugin() ],
};

var jbJison = {
  mode: 'development',
  entry: JBART_DIR + 'src/misc/jb-jison.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-jison.js',
  },
  node: {
    fs: 'empty',
    child_process: 'empty',
  },
  resolve: { modules: [ 'node_modules'] },
};

module.exports = [jbPreact,jbImmutable,jbRx,babel_ext,jbJison];
