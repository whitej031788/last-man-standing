var mongoose = require('mongoose');

var LeagueSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  maxPlayers: {
    type: Number,
    unique: false,
    required: true,
    trim: true
  },
  joinFee: {
    type: Number,
    unique: false,
    required: true,
    trim: true
  },
  isPublic: {
    type: Boolean,
    unique: false,
    required: true,
    trim: true
  },
  leagueName: {
    type: String,
    required: true,
    trim: true,
    unique: false
  },
  players: {
    type: Array,
    required: true,
    trim: false,
    unique: false
  },
  leagueAdmin: {
    type: String,
    required: true,
    trim: false,
    unique: false
  },
  joinCode: {
    type: String,
    required: false,
    trim: false,
    unique: false
  }
});

//Load up league
LeagueSchema.statics.getLeagueById = function (id, callback) {
  League.findOne({ _id: id })
    .exec(function (err, league) {
      if (err) {
        return callback(err)
      } else if (!league) {
        var err = new Error('League not found');
        err.status = 401;
        return callback(err);
      } else {
        console.log(league);
        return callback(null, league);
      }
    });  
}

var League = mongoose.model('League', LeagueSchema);
module.exports = League;