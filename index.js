(() => {
  'use strict';

  let express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

  // Load the env variables
  require('dotenv').load();

  // configure app to use bodyParser()
  // this will let us get the data from a POST
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());

  var port = process.env.PORT || 3000; // set our port

  // default route
  app.get('/', function(req, res) {
    res.send('Welcome to Express!');
  });

  app.use(require('./server/routes'));

  // START THE SERVER
  app.listen(port);
  console.log('Magic happens on port ' + port);

  // Export the app object
  exports.app = app;
})();
