var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
require('./src/loader/jb-loader.js');

var JBART_DIR = 'c:\\jb-react\\';
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


function concatFiles(files,target) {
  fs.unlink(JBART_DIR +target);
  files.map(x=>JBART_DIR +x).forEach(f=>
    fs.appendFile(JBART_DIR +target,fs.readFileSync(f) + ';\n\n'));
}

var studioFiles = [].concat.apply([],[resources['common'],resources['ui-common'],resources['ui-tree']]).filter(x=>!x.match(/.css$/))
    .concat(resources.studio.map(x=>'projects/studio/studio-' + x + '.js'));

concatFiles(studioFiles,'dist/studio-all.js');

var jbRx = {
  entry: JBART_DIR + 'src/ui/jb-rx.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-rx.js',
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
};

var jbPreact = {
  entry: JBART_DIR + 'src/ui/jb-preact.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-preact.js',
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
};

var jbImmutable = {
  entry: JBART_DIR + 'src/ui/jb-immutable.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-immutable.js',
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
};

var babel_ext = {
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
  entry: JBART_DIR + 'src/ui/jb-rx.js',
//  entry: JBART_DIR + 'projects/ui-tests/common-styles.jsx',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-rx.min.js',
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
  plugins: [ new UglifyJSPlugin() ],
};

module.exports = [jbPreact,jbImmutable,jbRx,babel_ext];
