var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home', route: req.route.path });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register', route: req.route.path });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login', route: req.route.path });
});

router.get('/main', requiresLogin, function(req, res, next) {
  res.render('main', { title: 'Main', route: req.route.path });
});

router.get('/settings', requiresLogin, function(req, res, next) {
  res.render('settings', { title: 'Settings', route: req.route.path });
});

router.get('/create-league', requiresLogin, function(req, res, next) {
  res.render('create-league', { title: 'Create League', route: req.route.path });
});

router.get('/join-league', requiresLogin, function(req, res, next) {
  res.render('join-league', { title: 'Join League', route: req.route.path });
});

router.get('/rules', requiresLogin, function(req, res, next) {
  res.render('rules', { title: 'Rules', route: req.route.path });
});

router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// More post requests to add
// Create a new league object
// Add an existing user to an existing league
// Update settings for account

router.post('/login-user', function(req, res, next) {
  User.authenticate(req.body.email, req.body.password, function (error, user) {
    if (error || !user) {
      res.json(500, "Wrong email or password");
    } else {
      req.session.userId = user._id;
      res.json(200, {success: true});
    }
  });
});

router.post('/create-user', function(req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    res.json(500, 'Passwords do not match');
  }

  if (req.body.email &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password
    }

    User.create(userData, function (error, user) {
      if (error) {
        res.json(500, error);
      } else {
        req.session.userId = user._id;
        res.json(200, {success: true});
      }
    });
  } else {
    res.json(500, 'All fields required');
  }
});

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect('/');
  }
}

module.exports = router;
