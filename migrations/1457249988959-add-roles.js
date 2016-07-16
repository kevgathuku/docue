'use strict';

var env = process.env.NODE_ENV || 'development';

// load .env only in dev mode
if (env === 'development') {
  require('dotenv').load();
}

const Roles = require('../server/models/roles');
const titles = Object.keys(Roles.ACCESS_LEVEL);

exports.up = function(next) {

  let tasks = titles.map((title) => {
    let update = {
      title: title,
      accessLevel: Roles.ACCESS_LEVEL[title]
    };
    return Roles.findOneAndUpdate({title: title}, update, {upsert: true});
  });

  Promise.all(tasks)
      .then(()=> { next(); })
      .catch((error) => {
        console.error(error);
        next();
      });
};

exports.down = function(next) {

  Roles.remove({ title: { $in: titles}})
      .then(() => next())
      .catch((error) => {
        console.error(error);
        next();
      });
};
