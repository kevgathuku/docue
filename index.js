/**
* eslint no-console: 0
*/

'use strict';

let express = require('express'),
  compression = require('compression'),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  app = express(),
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

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

// Enable CORS
app.use(
  cors({
    allowedHeaders: [
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, x-access-token'
    ]
  })
);

let port = process.env.PORT || 8000; // set our port

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
