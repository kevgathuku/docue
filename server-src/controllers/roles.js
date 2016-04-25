(() => {
  'use strict';

  let Role = require('../models/roles');

  module.exports = {
    create: (req, res, next): void => {
      let validRoles = Role.schema.paths.title.enumValues;
      if (!req.body.title) {
        res.status(400).json({
          error: 'The role title is required'
        });
      } else if (validRoles.indexOf(req.body.title) === -1) {
        // Handle an invalid role title
        res.status(400).json({
          error: req.body.title +
            ' is not a valid role title'
        });
      }

      let newRole = {
        title: req.body.title,
        accessLevel: null
      };
      // Assign the access levels
      switch (newRole.title) {
        case 'viewer':
          newRole.accessLevel = 0;
          break;
        case 'staff':
          newRole.accessLevel = 1;
          break;
          case 'admin':
            newRole.accessLevel = 2;
            break;
        default:

      }
      // Find if the role exists
      Role.findOne({
        title: req.body.title
      }, (err, role) => {
        if (role) {
          let err = new Error(
            'Role already exists'
          );
          err.status = 400;
          next(err);
        } else {
          // If the role does not exist, create it
          Role.create(newRole, (error, newRole) => {
            if (!error) {
              res.status(201).json(newRole);
            }
          });
        }
      });
    },

    all: (req, res): void => {
      Role.find((err, roles) => {
        res.json(roles);
      });
    }

  };
})();
