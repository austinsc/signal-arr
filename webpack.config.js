/*global:__dirname*/
var path = require('path');
module.exports = {
  resolve: {
    root: path.join(__dirname, 'src'),
    extensions: ['', '.js', '.jsx', '.less'],
    alias: {
      img: 'img',
      lib: 'lib',
      less: 'less',
      bower: path.join(__dirname, './bower_components'),
      ducks: 'js/ducks',
      pages: 'js/pages',
      charts: 'js/charts',
      stores: 'js/stores',
      components: 'js/components',
      decorators: 'js/decorators'
    }
  },
  resolveLoaders: {
    modulesDirectories: ['node_modules']
  },
  module: {
    noParse: ['jquery', 'lodash', 'moment'],
    loaders: [{
      test: /\.jsx$/i,
      loader: 'babel?optional=runtime&stage=0',
      exclude: [/node_modules/, /bower_components/]
    }, {
      test: /\.js$/i,
      loader: 'babel?optional=runtime&stage=0',
      exclude: [/node_modules/, /bower_components/]
    }, /*{
     test: /\.test\.js/i,
     loader: 'mocha!babel?optional=runtime&stage=0'
     }, */{
      test: /\.json$/i,
      loader: 'json'
    }, {
      test: /\.less$/i,
      loader: 'style/useable!css!autoprefixer?browsers=last 4 version!less'
    }, {
      test: /\.html$/i,
      loader: 'text'
    }, {
      test: /\.jpe?g$|\.gif$|\.png$/,
      loader: 'file?name=[name].[hash:6].[ext]'
    }, {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url?name=[name].[hash:6].[ext]&limit=10000&minetype=application/font-woff'
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file?name=[name].[hash:6].[ext]'
    }]
  },
  devtool: 'source-map',
  profile: true,
  node: {
    console: true
  },
  entry: {
    index: 'index.js',
    test: 'mocha!' + path.join(__dirname, 'test', 'index.js')
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js',
    sourceMapFilename: '[file].map',
    chunkFilename: '[name].[id].js'
  }
};



