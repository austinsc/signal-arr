/*global:require,module*/
module.exports = function(grunt) {
  var _ = require('lodash');
  var webpack = require('webpack');
  var wp = require('./webpack.config.js');
  require('time-grunt')(grunt);
  require('./tasks/webpack')(grunt);
  //require('./tasks/signalr-proxy')(grunt);
  require('./tasks/webpack-dev-server')(grunt);
  require('jit-grunt')(grunt, {eslint: 'gruntify-eslint'});


  // Build the grunt config
  grunt.config.init({
    // Run ESLint on the project
    'eslint': {
      src: ['src/**/*.js', 'test/**/*.js']
    },

    // Clean client side assets
    'clean': {
      all: ['lib/*']
    },

    // local documentation server task
    'connect': {
      server: {
        options: {
          hostname: 'localhost',
          port: 1991,
          base: 'docs',
          open: true,
          keepalive: true
        }
      }
    },

    // Backend iisexpress server
    'iisexpress': {
      server: {
        options: {
          port: 1992,
          killOn: 'kill'
        }
      }
    },

    // webpack build to disk tasks
    'webpack': {
      test: require('./webpack.tests.config'),
      build: _.merge({}, wp, {
        plugins: [
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              warnings: false
            }
          })
        ]
      }),
      watch: _.merge({}, wp, {watch: true, keepalive: true})
    },

    // local webpack frontend server
    'webpack-dev-server': {
      options: {
        hot: true,
        port: 1990,
        keepAlive: true,
        inline: true,
        publicPath: 'http://localhost:1990/en/',
        proxy: {
          '*': process.env.BACKEND_SERVER_URL || 'http://localhost:1992'
        },
        //websocket: {
        //  url: 'ws' + (process.env.BACKEND_SERVER_URL || 'http://localhost:1992').substr(4),
        //  path: '/signalr'
        //},
        historyApiFallback: true
      }
    },

    //'signalr-proxy': {
    //  redux: {
    //    assembly: path.join(__dirname, 'bin', ''),
    //    typeName: '',
    //    methodName: 'GenerateProxyAsync',
    //    serviceUrl: '/signalr',
    //    outFile: path.join(__dirname, 'lib/SignalR.js')
    //  }
    //},

    // Environment settings
    'env': {
      production: {
        NODE_ENV: 'production',
        BABEL_ENV: 'production'
      },
      development: {
        NODE_ENV: 'development',
        BABEL_ENV: 'development'
      }
    }
  });
  grunt.registerTask('killer', function() {
    grunt.event.emit('kill');
  });
  grunt.registerTask('ui', ['env:development', 'webpack-dev-server:en']);
  grunt.registerTask('dev', ['env:development', 'iisexpress:server', 'ui', 'killer']);
  grunt.registerTask('docs', ['connect']);
  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('clean', ['clean:all']);
  grunt.registerTask('build', ['env:production', 'webpack:all']);
};
