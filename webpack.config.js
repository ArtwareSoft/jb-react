var webpack = require('webpack');
var path = require('path');

var JBART_DIR = 'c:\\jb-react\\';
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var jb = {
  entry: JBART_DIR + 'src/core/jb-core.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb.js',
    library: 'jb',
    libraryTarget: 'var'
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
};

var jbLoader = {
  entry: JBART_DIR + 'src/loader/jb-loader.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-loader.js',
    library: 'jbLoader',
    libraryTarget: 'var'
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
};

var dataTests = {
  entry: JBART_DIR + 'projects/ui-tests/data-tests.js',
  output: { path: JBART_DIR + 'projects/ui-tests',  filename: 'data-tests-bnd.js'  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
  externals: { "./jb-core.js": "jb" },
  module : { loaders : [ { test : /\.jsx?/, loader : 'babel-loader' } ] }
};

var uiBase = {
  entry: [JBART_DIR + 'src/ui/react-ctrl.js', JBART_DIR + 'src/ui/styles/basic-styles.jsx', JBART_DIR + 'src/ui/styles/common-mdl-styles.jsx'],
  output: {
    path: JBART_DIR + 'dist',
    filename: 'ui-base-and-styles.js',
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
  externals: { "./jb-core.js": "jb" },
  module : { loaders : [ { test : /\.jsx$/, loader : 'babel-loader' } ] },
};

var jbRx = {
  entry: JBART_DIR + 'src/ui/jb-rx.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-rx.js',
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
//  plugins: [ new UglifyJSPlugin() ],
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

module.exports = [jb,jbLoader,uiBase,jbRx];