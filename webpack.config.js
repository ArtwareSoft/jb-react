const webpack = require('webpack');
const path = require('path');

const JBART_DIR = __dirname + '/';
//const UglifyJSPlugin = new webpack.optimize.UglifyJsPlugin() //require('uglifyjs-webpack-plugin');

const jbImmutable = {
  mode: 'development',
  entry: JBART_DIR + 'src/ui/pack-immutable.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-immutable.js',
  },
  resolve: { modules: [ 'node_modules' ] },
};

const material = {
  mode: 'development',
  entry: JBART_DIR + 'src/ui/pack-material.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'material.js',
  },
  resolve: { modules: [ 'node_modules' ] },
};

const babel_ext = {
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

const jbJison = {
  mode: 'development',
  entry: JBART_DIR + 'src/misc/pack-jison.js',
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

const jbReactAllMin = {
  mode: 'production',
  optimization: {
    minimize: true,
  },
  entry: JBART_DIR + 'dist/jb-react-all.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-react-all-min.js',
  },
}

module.exports = [jbImmutable,material,jbReactAllMin];
