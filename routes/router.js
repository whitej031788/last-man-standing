var express = require('express');
var router = express.Router();
var User = require('../models/user');
var League = require('../models/league');
var Match = require('../models/match');
var Config = require('../models/config');
var Pick = require('../models/pick');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home', route: req.route.path });
});

router.get('/register', function(req, res, next) {
  if (!req.session.userId) {
    res.render('register', { title: 'Register', route: req.route.path });
  } else {
    res.redirect('/main');
  }
});

router.get('/login', function(req, res, next) {
  if (!req.session.userId) {
    res.render('login', { title: 'Login', route: req.route.path });
  } else {
    res.redirect('/main');
  }
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
      res.render('league', { title: 'League', route: '/league', league: league, isValid: isInLeague });
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
  // problem - here we need to go through the leagues and see if the person has joined it if not. If not, show that league.
  League.find(function (err, leagues) {
    let finalLagues = [];
    for (let i = 0; i < leagues.length; i++) {
      console.log('Players:', leagues[i].players);
      if (leagues[i].players.indexOf(req.session.userId) === -1) {
        finalLagues.push(leagues[i]);
      }
    }
    res.render('join-league', { title: 'Join League', route: req.route.path, leagues: finalLagues, userEmail: req.session.email });
  })
});

router.get('/your-leagues', requiresLogin, function(req, res, next) {
  League.find({ }, function (err, leagues) {
    let finalLagues = [];
    // problem - need to loop over
    for (let i = 0; i < leagues.length; i++) {
      if (leagues[i].players.indexOf(req.session.userId) !== -1) {
        finalLagues.push(leagues[i]);
      }
    }
    res.render('your-leagues', { title: 'Your Leagues', route: req.route.path, leagues: finalLagues, userEmail: req.session.email });
  })
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
  console.log()
  User.authenticate(req.body.email, req.body.password, function (error, user) {
    if (error || !user) {
      res.json(500, "Wrong email or password");
    } else {
      req.session.userId = user._id;
      req.session.username = user.name;
      req.session.email = user.email;
      req.session.userInfo = user;
      res.json(200, {success: true});
    }
  });
});

router.post('/get-matches-by-week', requiresLogin, function(req, res, next) {
  Match.find({ matchday: req.body.week }, function (err, matches) {
    if (err || !matches) {
      res.json(500, "Wrong match request");
    } else {
      res.json(200, {success: true, matches: matches});
    }
  });
});

router.post('/create-user', function(req, res, next) {
  console.log('Post to create user');
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
      password: req.body.password,
      league: []
    }

    User.create(userData, function (error, user) {
      if (error) {
        res.json(500, error);
        console.log('User create error:', error);
      } else {
        req.session.email = user.email;
        req.session.userId = user._id;
        req.session.username = user.name;
        req.session.league = user.league;
        req.session.userInfo = user;
        console.log('Create user:', user.name);
        res.json(200, {success: true});
      }
    });
  } else {
    res.json(500, 'All fields required');
  }
});

router.post('/create-league', requiresLogin, function(req, res, next) {

  if (req.body.name &&
    req.body.maxPlayers &&
    req.body.league) {

    var leagueData = {
      name: req.body.name,
      maxPlayers: req.body.maxPlayers,
      isPublic: req.body.isPublic,
      leagueName: req.body.league,
      players: req.session.userInfo,
      leagueAdmin: req.session.userId
    }

    if (!req.body.isPublic) {
      leagueData.joinCode = guid();
    }

    League.create(leagueData, function (error, league) {
      if (error) {
        res.status(500).json(error);
      } else {
        res.json(200, {success: true, league_id: league._id, joinCode: league.joinCode});
      }
    });
  } else {
    res.json(500, 'All fields required');
  }
});

router.post('/make-pick', requiresLogin, function(req, res, next) {

  if (req.body.team &&
    req.body.matchDay &&
    req.body.leagueId) {

    var pickData = {
      team: req.body.team,
      match_day: req.body.matchDay,
      userId: req.session.userId,
      leagueId: req.body.leagueId
    }

    Pick.create(pickData, function (error, pick) {
      if (error) {
        res.json(500, error);
      } else {
        res.json(200, {success: true});
      }
    });
  } else {
    res.json(500, 'All fields required');
  }
});

router.post('/join-league', requiresLogin, function(req, res, next) {
  console.log('user info:', req.session.userInfo);
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
        } else {
          league.players.push(req.session.userInfo);
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
