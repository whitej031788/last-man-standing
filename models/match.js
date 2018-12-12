var mongoose = require('mongoose');

var MatchSchema = new mongoose.Schema({
  kickoff_time: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  home_team: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  away_team: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  winner: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  status:  {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  matchday:  {
    type: Number,
    unique: false,
    required: true,
    trim: true
  },
  last_updated: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  score: {
    type: Object,
    unique: false,
    required: true,
    trim: true      
  },
  apiId:  {
    type: Number,
    unique: true,
    required: true,
    trim: true
  }
});

var Match = mongoose.model('Match', MatchSchema);
module.exports = Match;