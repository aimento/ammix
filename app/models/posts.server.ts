import { model, Schema } from "mongoose";

const PostsSchema = new Schema({
  username: { type: String, unique: true },
  content: { type: String},
  avatar: 
  {
    firstName: { type: String },
    lastName: { type: String },
    imageUrl: { type: String },
  },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

// UsersSchema.index({ username: 1 }, { unique: true });
// UsersSchema.index({ "emails.address": 1 }, { unique: true });
// UsersSchema.index({ "auths.channel": 1, "auths.id": 1 }, { unique: true });

export const Posts = model("Posts", PostsSchema);
