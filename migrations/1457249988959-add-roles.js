'use strict';

// load .env
require('dotenv').load();

const Roles = require('../server/models/roles');
const titles = Roles.schema.paths.title.enumValues;

exports.up = function(next) {

  let tasks = titles.map((title) => {
    let query = {title: title};
    let update = {
      title: title
      //accessLevel: 0 // FIXME: Is there a default accessLevel?
    };
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
