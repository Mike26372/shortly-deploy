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
      return err;
    } else {
      console.log('LINKS FETCHED');
      console.log(links);
      res.status(200).send(links);
    }
  });
  // Links.reset().fetch().then(function(links) {
  //   res.status(200).send(links.models);
  // });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  db.Link.findOne({url: uri}, function(err, link) {
    if (err) {
      return err;
    }

    if (link) {
      res.status(200).end();
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          return res.sendStatus(404);
        }
        var newLink = db.Link({url: uri, title: title, baseUrl: req.headers.origin});
        newLink.save(function(err) {
          if (err) {
            throw err;
          }
          console.log('Link added: ' + newLink);
        });
      });      
    }

  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.findOne({'username': username}, function(err, user ) {
    if (err) {
      return err;
    }
    if (!user) {
      res.redirect('/login');
    } else {
      user.comparePassword(password, function(isMatch) {
        if (isMatch) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
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
      return err;
    }
    if (!user) {
      var newUser = db.User({
        username: username,
        password: password
      });

      newUser.save(function(err) {
        if (err) {
          throw err;
        }
        console.log('User created: ' + newUser);
      });
    }
    console.log('User already exists');

  });
 
};

exports.navToLink = function(req, res) {
  return;
  // COMPLETE LATER
  
  // db.Link({code: req.params[0]})
  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
};