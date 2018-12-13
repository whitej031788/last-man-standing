var mongoose = require('mongoose');

var ConfigSchema = new mongoose.Schema({
  match_day: {
    type: Number,
    unique: false,
    required: true,
    trim: true
  }
});

var Config = mongoose.model('Config', ConfigSchema);
module.exports = Config;