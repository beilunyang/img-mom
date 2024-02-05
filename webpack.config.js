const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.ts'),
  target: 'webworker',
  output: {
    filename: 'worker.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  mode: 'production',
  resolve: {
    fallback: {
      fs: false,
    },
    extensions: ['.ts', '.js', '.json'],
  },
  plugins: [new NodePolyfillPlugin()],
  performance: {
    hints: false,
  },
};