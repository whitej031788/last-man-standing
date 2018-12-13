var express = require('express');
var router = express.Router();
var User = require('../models/user');
var League = require('../models/league');
var stripe = require("stripe")("sk_test_wWPYueXqxHLRnOxiA37wtRXE");

router.post('/stripePayment', requiresLogin, (req, res, next) => {
  const token = req.body.stripeToken; // Using Express
  let myGuid = guid();

  stripe.charges.create({
    amount: req.body.amount * 100,
    currency: "gbp",
    source: token, // obtained with Stripe.js
    description: "Last Man Standing"
  }, {
    idempotency_key: myGuid
  }, function(err, charge) {
    if (err) {
      res.json(500, "Stripe error");
    } else {
      if (charge.status == 'succeeded') {
        res.json(200, {success: true});
      } else {
        res.json(500, "Stripe error");
      }
    }
    console.log(charge);
    console.log(err);
  });
})

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

router.get('/league/:leagueId', requiresLogin, function(req, res, next) {
  League.getLeagueById(req.params.leagueId, function (error, league) {
    if (error || !league) {
      var err = new Error('League not found');
      err.status = 404;
      next(err);
    } else {
      let isInLeague = (league.players.indexOf(req.session.userId) !== -1);
      
      res.render('league', { title: 'League', route: '/league', league: league, isValid: isInLeague, userEmail: req.session.email });
    }
  });
});

router.get('/settings', requiresLogin, function(req, res, next) {
  res.render('settings', { title: 'Settings', route: req.route.path });
});

router.get('/create-league', requiresLogin, function(req, res, next) {
  console.log(req.session.email);
  res.render('create-league', { title: 'Create League', route: req.route.path, userEmail: req.session.email });
});

router.get('/join-league', requiresLogin, function(req, res, next) {
  res.render('join-league', { title: 'Join League', route: req.route.path, userEmail: req.session.email });
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
      req.session.email = user.email;
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
        req.session.email = user.email;
        req.session.userId = user._id;
        res.json(200, {success: true});
      }
    });
  } else {
    res.json(500, 'All fields required');
  }
});

router.post('/create-league', function(req, res, next) {

  if (req.body.name &&
    req.body.maxPlayers &&
    req.body.joinFee &&
    req.body.league) {

    var leagueData = {
      name: req.body.name,
      maxPlayers: req.body.maxPlayers,
      joinFee: req.body.joinFee,
      isPublic: req.body.isPublic,
      leagueName: req.body.league,
      players: [req.session.userId],
      leagueAdmin: req.session.userId
    }

    if (!req.body.isPublic) {
      leagueData.joinCode = guid();
    }

    League.create(leagueData, function (error, league) {
      if (error) {
        res.json(500, error);
      } else {
        res.json(200, {success: true, league_id: league._id, joinCode: league.joinCode});
      }
    });
  } else {
    res.json(500, 'All fields required');
  }
});

router.post('/join-league', function(req, res, next) {
  if (!req.body.leagueId) {
    res.json(500, "We did not get a league ID");
  } else {
    League.getLeagueById(req.body.leagueId, function (error, league) {
      if (error || !league) {
        res.json(500, "League not found");
      } else {
        let isInLeague = (league.players.indexOf(req.session.userId) !== -1);
        if (isInLeague) {
          res.json(500, "You are already in the league!");
        } else if (!league.isPublic && (league.joinCode != req.body.joinCode)) {
            res.json(500, "The league code is not correct");
        } else {
          league.players.push(req.session.userId);
          console.log(league);
          league.save();
          res.json(200, {success: true});
        }
      }
    });
  }
});

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect('/');
  }
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

module.exports = router;
