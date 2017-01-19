var path = require('path');
var mongoose = require('mongoose');
//
//var connection = mongoose.createConnection('mongodb://localhost/shortly');
var connection = mongoose.connect('mongodb://198.199.104.168:27017/shortly');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var crypto = require('crypto');

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
  baseUrl: { type: String }, // , required: true 
  code: { type: String },
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
  bcrypt.hash(this.password, null, null, (err, hash) => {
    if (err) {
      console.error(err);
    } else {
      this.password = hash;
    }
    next();
  });
});

urlSchema.pre('save', function(next) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  next();
});

module.exports.User = User;
module.exports.Link = Link;

