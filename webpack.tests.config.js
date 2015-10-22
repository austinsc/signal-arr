module.exports = {
  entry: 'mocha!./test/index.js',
  output: {
    filename: 'test.build.js',
    path: 'test/',
    publicPath: 'http://localhost:1988/test'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel?stage=0',
      exclude: [/node_modules/]
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  devServer: {
    host: 'localhost',
    port: 1988
  },
  devtool: 'source-map'
};