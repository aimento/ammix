const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  auths: {
    channel: { type: String, require: true },
    id: { type: String, require: true, unique: true },
    secret: {
      bcrypt: { type: String },
      token: { type: String, unique: true },
      expireAt: { type: String, default: 120 },
    },
  },
  emails: [
    {
      address: { type: String, unique: true },
      verified: { type: Boolean },
      token: { type: String, unique: true },
      expireAt: { type: String, default: 1200 },
    },
  ],
  loginToken: { type: String, unique: true, expire: 120 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});
const User = mongoose.model("User", userSchema);

module.exports = { User };
