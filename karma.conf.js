(() => {
  'use strict';

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

      reporters: ['dots'],

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
                presets: ['es2015', 'react', 'stage-0']
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
          'jsdom': 'window',
          'cheerio': 'window',
          'react/lib/ExecutionEnvironment': true,
          'react/lib/ReactContext': true
        }
      },

      webpackServer: {
        noInfo: true
      }

    });
  };
})();
