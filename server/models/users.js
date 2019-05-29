const mongoose = require('../config/db');
const bcrypt = require('bcrypt-nodejs');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  name: {
    first: {
      type: String,
      required: true,
      trim: true
    },
    last: {
      type: String,
      required: true,
      trim: true
    }
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  loggedIn: {
    type: Boolean,
    default: false
  }
});

UserSchema.pre('save', function(next) {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    next();
  }

  // Hash the user's password
  bcrypt.hash(user.password, null, null, function(err, hash) {
    if (err) {
      return next(err);
    } else {
      // Replace the cleartext password with the hashed one
      user.password = hash;
      next();
    }
  });
});

// Check if entered password is the same as the stored password
// Returns true if the passwords match, false otherwise
UserSchema.methods.comparePassword = function(password) {
  const user = this;
  return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);
