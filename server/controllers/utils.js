(() => {
  'use strict';

  let jwt = require('jsonwebtoken');

  // Takes a JWT token object and extracts the user info from the token
  module.exports = (token) => {
    let decodedUser = jwt.decode(token, {
      complete: true
    });
    // Returns the user object stored in the token
    return decodedUser.payload;
  };

})();
