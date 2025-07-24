const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  username: { type: String },             // optional for social logins
  email:    { type: String },             // optional for phone logins
  password: { type: String },             // optional for social/phone logins
  location: { type: String }
});

module.exports = mongoose.model('User', UserSchema);