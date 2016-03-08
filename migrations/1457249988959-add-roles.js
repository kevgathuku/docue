'use strict';

// load .env
require('dotenv').load();
require('../server/config/db');

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
