var path = require('path');
// var knex = require('knex')({
//   client: 'sqlite3',
//   connection: {
//     filename: path.join(__dirname, '../db/shortly.sqlite')
//   },
//   useNullAsDefault: true
// });
// var db = require('bookshelf')(knex);

var mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://localhost/db_name');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


// Initialize auto-increment package
autoIncrement.initialize(connection);

var userSchema = new Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  'createdAt': Date,
  'updatedAt': Date
});

var urlSchema = new Schema({
  url: { type: String, required: true },
  baseUrl: { type: String, required: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  visits: Number,
  createdAt: Date,
});

userSchema.plugin(autoIncrement.plugin, 'User');
urlSchema.plugin(autoIncrement.plugin, 'Link');

userSchema.methods.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};


var User = mongoose.model('User', userSchema);
var Link = mongoose.model('Link', urlSchema);

// on every save, add the date
userSchema.pre('save', function(next) {
  var currentDate = new Date();
  this.updatedAt = currentDate;
  if (!this.createdAt) {
    this.createdAt = currentDate;
  }

  bcrypt.hash(this.password, null, null, function(err, hash) {
    if (err) {
      console.error(err);
    } else {
      this.password = hash;
    }
  }).bind(this);

  next();
});

// urlSchema.pre('save', function(next) {
//   // THIS IS WHERE WE CRYPTO THE CODE
//   next();
// });

module.exports.User = User;
module.exports.Link = Link;

