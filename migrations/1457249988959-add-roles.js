'use strict';

// load .env
require('dotenv').load();
require('../server/config/db');

const Roles = require('../server/models/roles');
const titles = Roles.schema.paths.title.enumValues;

exports.up = function(next) {

  let tasks = titles.map((title) => {
    let query = {title: title};
    let update = query;
    switch (title) {
      case 'viewer':
        update['accessLevel'] = 0;
        break;
      case 'staff':
      update['accessLevel'] = 1;
        break;
      case 'admin':
      update['accessLevel'] = 2;
        break;
      default:
    }
    return Roles.findOneAndUpdate(query, update, {upsert: true});
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
