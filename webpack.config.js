const webpack = require('webpack');
const path = require('path');

const JBART_DIR = __dirname + '/';
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const jbRx = {
  mode: 'development',
  entry: JBART_DIR + 'src/ui/jb-rx.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-rx.js',
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
};

const jbPreact = {
  mode: 'development',
  entry: JBART_DIR + 'src/ui/jb-preact.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-preact.js',
  },
  resolve: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
};

const jbImmutable = {
  mode: 'development',
  entry: JBART_DIR + 'src/ui/jb-immutable.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'jb-immutable.js',
  },
  resolve: { modules: [ 'node_modules' ] },
//  resolve1: { modules: [path.resolve(JBART_DIR, "src"), path.resolve(JBART_DIR, "node_modules")] },
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

const deepDiff = {
  mode: 'development',
  entry: JBART_DIR + 'projects/studio/studio-deep-diff-ext.js',
  output: {
    path: JBART_DIR + 'dist',
    filename: 'deep-diff.js',
  },
  resolve: { modules: [ 'node_modules' ] },
};

const jbRxMin = {
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

const jbJison = {
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

module.exports = [jbPreact,jbImmutable,jbRx,babel_ext,jbJison,deepDiff];
