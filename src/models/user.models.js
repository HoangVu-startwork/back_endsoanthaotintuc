const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userInfoSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
  },
  token: {
    type: String,
  }
}, {
  collection: "UserInfo",
});

const User = mongoose.model('UserInfo', userInfoSchema);

module.exports = User;
