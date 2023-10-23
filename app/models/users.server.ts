import { model, Schema } from "mongoose";

const UsersSchema = new Schema({
  username: { type: String, unique: true },
  auths: [
    {
      channel: { type: String, require: true },
      id: { type: String, require: true },
      secret: {
        bcrypt: { type: String },
        token: { type: String },
        expireAt: { type: String },
      },
    },
  ],
  emails: [
    {
      address: { type: String, unique: true },
      verified: { type: Boolean },
      token: { type: String },
      expireAt: { type: String },
    },
  ],
  phoneNumber: { type: String },
  address: { type: String },
  avatar: {
    firstName: { type: String },
    lastName: { type: String },
    imageUrl: { type: String },
    oldImageUrl: { type: String },
  },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

UsersSchema.index({ username: 1 }, { unique: true });
UsersSchema.index({ "emails.address": 1 }, { unique: true });
UsersSchema.index({ "auths.channel": 1, "auths.id": 1 }, { unique: true });

export const Users = model("Users", UsersSchema);
