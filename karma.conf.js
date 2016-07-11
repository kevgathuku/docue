(() => {
  'use strict';

  var path = require('path');

  module.exports = function(config) {

    config.set({

      browsers: ['PhantomJS'],

      singleRun: true,

      frameworks: ['mocha'],

      files: [
        'tests.webpack.js'
      ],

      preprocessors: {
        'tests.webpack.js': ['webpack', 'sourcemap']
      },

      reporters: ['mocha', 'coverage'],

      webpack: {
        devtool: 'inline-source-map',
        module: {
          noParse: [
              /node_modules\/sinon/
          ],
          loaders: [{
              test: /\.jsx?$/, // A regexp to test the require path. works for js or jsx
              loader: 'babel', // The module to load. "babel" is short for "babel-loader"
              exclude: /node_modules/,
              query: {
                presets: ['react', 'es2015', 'stage-0']
              }
            }, {
              test: /\.json$/,
              loader: 'json'
            }, {
              test: /\.css$/,
              exclude: /node_modules/,
              loaders: ['style-loader', 'css-loader']
            }, {
              test: /\.(png|jpg|jpeg)$/,
              exclude: /node_modules/,
              loader: 'url-loader?limit=8192' // limit of 8kb
            },
            {
              test: /\.jsx?$/,
              include: path.resolve('app'),
              exclude: /__tests__/,
              loader: 'isparta'
            }
          ]
        },
        resolve: {
          alias: {
            sinon: 'sinon/pkg/sinon.js'
          },
          root: __dirname,
          extensions: ['', '.js', '.jsx', '.json']
        },
        externals: {
          'react/addons': true,
          'cheerio': 'window',
          'react/lib/ExecutionEnvironment': true,
          'react/lib/ReactContext': true
        }
      },

      webpackServer: {
        noInfo: true
      },

      coverageReporter: {
        dir: 'coverage',
        reporters: [
          { type: 'html', subdir: 'html' },
          { type: 'lcovonly', subdir: 'lcov' }
        ]
      }

    });
  };
})();
