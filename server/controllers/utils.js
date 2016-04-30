/* @flow */
'use strict';

let jwt = require('jsonwebtoken');

class ExtendedError extends Error {
  message: string;
  status: number;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.stack = (new Error()).stack;
    this.name = this.constructor.name;
  }
}

// Takes a JWT token object and extracts the user info from the token
module.exports = {
  extractUserFromToken: (token: string): Object => {
    let decodedUser = jwt.decode(token, {
      complete: true
    });
    // Returns the user object stored in the token
    return decodedUser.payload;
  },
  Error: ExtendedError
};
