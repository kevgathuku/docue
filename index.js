(() => {
  'use strict';

  let express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    app = express();

  // Load the env variables
  require('dotenv').load();

  // Set JWT secret on the app object
  app.set('superSecret', process.env.SECRET);

  // use morgan to log requests to the console
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // configure app to use bodyParser()
  // this will let us get the data from a POST
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());

  let port = process.env.PORT || 3000; // set our port

  // default route
  app.get('/', (req, res) => {
    res.send('Welcome to Express!');
  });

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
  console.log('Magic happens on port ' + port);

  // Export the app object
  module.exports = app;
})();
