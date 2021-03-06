var path = require('path');
var CompressionPlugin = require('compression-webpack-plugin');
var BrotliPlugin = require('brotli-webpack-plugin');
var SRC_DIR = path.join(__dirname, '/public/src');
var DIST_DIR = path.join(__dirname, '/public/dist');

module.exports = {
  entry: `${SRC_DIR}/index.jsx`,
  output: {
    filename: 'bundle.js',
    path: DIST_DIR
  },
  module : {
    rules: [
      {
        test: /\.jsx?/,
        include: SRC_DIR,
        exclude: /node_modules/,
        use: ['babel-loader'],
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js']
  },
  plugins: [new CompressionPlugin(), new BrotliPlugin()],
};