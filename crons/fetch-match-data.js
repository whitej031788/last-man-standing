const https = require('https');
const Match = require('../models/match');
const Config = require('../models/config');
const mongoose = require('mongoose');

//connect to MongoDB
mongoose.connect('mongodb://localhost/fantasy-football');
var db = mongoose.connection;

// 2021 is the Premier League ID
var leagueId = 2021;
var options = {
  host: 'api.football-data.org',
  port: 443,
  path: '/v2/competitions/' + leagueId,
  method: 'GET',
  headers: { 'X-Auth-Token': '577b53f4787448eab1c4ae3f48c2448c' }
};

options.path = '/v2/competitions/' + leagueId;

// First, get the current season and the current matchDay
var req = https.request(options, function(res) {
  let response = "";

  res.on('data', function(chunk) {
    response += chunk;
  });

  res.on('end', function(){
    let myEnd = JSON.parse(response);
    storeAppConfig(myEnd.currentSeason.currentMatchday);
    getAddMatches(myEnd.currentSeason.currentMatchday, leagueId, options);
    getAddMatches(myEnd.currentSeason.currentMatchday + 1, leagueId, options);
    getAddMatches(myEnd.currentSeason.currentMatchday + 2, leagueId, options);
    console.log('end received!')
  });

  res.on('close', function(){
    let myEnd = JSON.parse(response);
    storeAppConfig(myEnd.currentSeason.currentMatchday);
    getAddMatches(myEnd.currentSeason.currentMatchday, leagueId, options);
    getAddMatches(myEnd.currentSeason.currentMatchday + 1, leagueId, options);
    getAddMatches(myEnd.currentSeason.currentMatchday + 2, leagueId, options);
    console.log("Close received!");
  });
});

req.end();

function storeAppConfig(matchDay) {
  Config.findOneAndUpdate({ }, {match_day: matchDay}, {upsert:true}, function(err, doc) {
    if (err) console.log(err);
    console.log("Added config object: \n");
  });
}

function getAddMatches(matchDayId, leagueId, myOpts) {
  console.log('Now calling getMatches');
  myOpts.path = '/v2/competitions/' + leagueId + '/matches?matchday=' + matchDayId;
  // First, get the current season and the current matchDay
  var myReq = https.request(options, function(res) {
    let response = "";

    res.on('data', function(chunk) {
      response += chunk;
    });

    res.on('end', function(){
      let myEnd = JSON.parse(response);
      addMatchesToMongo(myEnd.matches);
    });

    res.on('close', function(){
      let myEnd = JSON.parse(response);
      addMatchesToMongo(myEnd.matches);
    });
  });

  myReq.end();
}

function addMatchesToMongo(matches) {
  var theWinner = "";
  for (let i = 0; i < matches.length; i++) {
    if (matches[i].status == "FINISHED") {
      if (matches[i].score.winner == "AWAY_TEAM") {
        theWinner = matches[i].awayTeam.name;
      } else if (matches[i].score.winner == "HOME_TEAM") {
        theWinner = matches[i].homeTeam.name;
      } else {
        theWinner = "DRAW";
      }
    } else {
      theWinner = "PENDING";
    }
    var matchData = {
      kickoff_time: matches[i].utcDate.trim(),
      home_team: matches[i].homeTeam.name.trim(),
      away_team: matches[i].awayTeam.name.trim(),
      winner: theWinner.trim(),
      status: matches[i].status.trim(),
      matchday: matches[i].matchday,
      last_updated: matches[i].lastUpdated.trim(),
      score: matches[i].score,
      apiId: matches[i].id
    }

    var query = {apiId:matches[i].id};
    Match.findOneAndUpdate(query, matchData, {upsert:true}, function(err, doc) {
      if (err) console.log(err);
      console.log("Added match object: \n");
    });
  }
}