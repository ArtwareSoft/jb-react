var webpack = require('webpack');
var path = require('path');

var JBART_DIR = 'c:\\jb-react\\';

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

var dataTests = {
  entry: JBART_DIR + 'projects/ui-tests/data-tests.js',
  output: { path: JBART_DIR + 'projects/ui-tests',  filename: 'data-tests-bnd.js'  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
  externals: { "./jb-core.js": "jb" },
  module : { loaders : [ { test : /\.jsx?/, loader : 'babel-loader' } ] }
};

var uiTests = {
  entry: JBART_DIR + 'projects/ui-tests/ui-tests.js',
  output: { path: JBART_DIR + 'projects/ui-tests',  filename: 'ui-tests-bnd.js'  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
  externals: { "./jb-core.js": "jb" },
  module : { loaders : [ { test : /\.jsx?/, loader : 'babel-loader' } ] }
};


module.exports = [jb,dataTests,dataTests];