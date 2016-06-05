/**
* eslint no-console: 0
* @flow
*/
(() => {
  'use strict';

  let express = require('express'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    favicon = require('serve-favicon'),
    httpProxy = require('http-proxy'),
    morgan = require('morgan'),
    path = require('path'),
    app = express(),
    publicPath = path.resolve(__dirname, 'public'),
    proxy = httpProxy.createProxyServer(),
    isProduction = process.env.NODE_ENV === 'production';

  // Load the env variables only in DEV mode
  if (!isProduction) {
    require('dotenv').load();
  }

  // Set JWT secret on the app object
  app.set('superSecret', process.env.SECRET);

  // use morgan to log requests to the console
  if (!isProduction) {
    app.use(morgan('dev'));
  }

  // compress all requests
  app.use(compression());

  app.use(favicon(path.join(__dirname, 'app', 'images', 'favicon.png')));

  // configure app to use bodyParser()
  // this will let us get the data from a POST
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());

  // We point to our static assets
  app.use(express.static(publicPath));

  // We only want to run the workflow when not in production
  if (!isProduction) {
    // We require the bundler inside the if block because
    // it is only needed in a development environment
    let bundle = require('./bundle.js');
    bundle();

    // Any requests to localhost:3000/build is proxied
    // to webpack-dev-server
    app.all('/build/*', (req, res) => {
      proxy.web(req, res, {
        target: 'http://localhost:8080/'
      });
    });
  }

  // It is important to catch any errors from the proxy or the
  // server will crash. An example of this is connecting to the
  // server when webpack is bundling
  proxy.on('error', () => {
    console.log('Could not connect to proxy, please try again...');
  });

  let port = process.env.PORT || 3000; // set our port

  app.use(require('./server/routes'));

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({
      error: err.message
    });
  });

  // catch 404 errors
  app.use((req, res) => {
    let err = new Error('Not Found');
    res.status(404).json({
      error: err.message
    });
  });

  // START THE SERVER
  app.listen(port);
  console.log('Listening on port', port);

  // Export the app object
  module.exports = app;
})();
