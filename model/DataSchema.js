const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String
  },
  timestamp: {
    required: true,
    type: String,
    default: '17:30'
  },
  subscription: [
  //   {
  //     endpoint: String,
  //     expirationTime: String,
  //     keys:{
  //        p256dh: String,
  //        auth: String
  //     }
  //  }
  ]
});

module.exports = mongoose.model('dataSchema', DataSchema);