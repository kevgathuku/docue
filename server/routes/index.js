const express = require('express'),
  Promise = require('bluebird'),
  router = express.Router(),
  Documents = require('../models/documents'),
  Roles = require('../models/roles'),
  UsersController = require('../controllers/users'),
  Users = require('../models/users');

router.use('/api', require('./roles'));
router.use('/api', require('./users'));
router.use('/api', require('./documents'));

const stats = (req, res) => {
  // This action is available to admin roles only
  if (req.decoded.role.title !== 'admin') {
    res.status(403).json({
      error: 'Unauthorized Access'
    });
  } else {
    Promise.all([
      Documents.count().exec(),
      Users.count().exec(),
      Roles.count().exec()
    ])
      .then(function(counts) {
        const [docsCount, usersCount, rolesCount] = counts;
        res.json({
          documents: docsCount,
          roles: rolesCount,
          users: usersCount
        });
      })
      .catch(err => {
        res.next(err);
      });
  }
};

router.get('/api/stats', UsersController.authenticate, stats);

module.exports = router;
