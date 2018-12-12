var mongoose = require('mongoose');

var PickSchema = new mongoose.Schema({
  match_day: {
    type: Number,
    unique: false,
    required: true,
    trim: true
  },
  team: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    unique: false,
    required: true,
    trim: true
  }
});

var Pick = mongoose.model('Pick', PickSchema);
module.exports = Pick;