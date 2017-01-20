var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
// var User = require('../app/models/user');
// var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  db.Link.find({}, function(err, links) {
    if (err) {
      console.error(err);
      res.status(404).end();
    } else {
      res.status(200).send(links);
    }
  });

};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    res.sendStatus(404);
  }

  db.Link.findOne({url: uri}, function(err, link) {
    if (err) {
      console.error(err);
      res.status(404).end();
    }

    if (link) {
      res.status(200).json(link);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          res.status(404).end();
        }
        var newLink = new db.Link({url: uri, title: title, baseUrl: req.headers.origin, visits: 0});
        newLink.save(function(err) {
          if (err) {
            console.log(err);
            res.status(404).end();
          }
          res.status(200).json(newLink);
          console.log('Link added');
        });
      });      
    }

  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.findOne({'username': username}, function(err, user) {
    if (err) {
      console.error(err);
      res.status(404).end();
    }
    if (!user) {
      res.status(302).redirect('/login');
    } else {
      user.comparePassword(password, function(isMatch) {
        if (isMatch) {
          util.createSession(req, res, user);
        } else {
          res.status(302).redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.findOne({'username': username}, function(err, user) {
    if (err) {
      // console.error(err);
      res.status(404).end();
    }
    if (!user) {
      var newUser = new db.User({
        username: username,
        password: password
      });

      newUser.save(function(err) {
        if (err) {
          // console.error(err);
          res.status(404).end();
        }
        console.log('User created');
        res.status(302).redirect('/');
      });
    }
    console.log('User already exists');

  });
 
};

exports.navToLink = function(req, res) {
  db.Link.findOne({code: req.params[0]}).then(function(link) {
    if (!link) {
      res.status(302).redirect('/');
    } else {
      link.visits++;
      res.status(302).redirect(link.url);
    }
  }).catch(function(err) {
    console.error(err);
    res.status(404).end();
  });

};