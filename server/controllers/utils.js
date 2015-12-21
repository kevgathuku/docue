(() => {
  'use strict';

  let jwt = require('jsonwebtoken');

  // Takes a request object and returns the user info from the token
  module.exports = (req) => {
    let token = req.body.token || req.headers['x-access-token'];
    let decodedUser = jwt.decode(token, {
      complete: true
    });
    return decodedUser.payload;
  };

})();
