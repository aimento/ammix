import { model, Schema } from "mongoose";
// import { v4 as uuidv4 } from "uuid";

const PostsSchema = new Schema({
  // postId: {
  //   type: String,
  //   default: uuidv4,
  // },
  username: { type: String },
  content: { type: String },
  avatar: {
    firstName: { type: String },
    lastName: { type: String },
  },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

// PostsSchema.index({ username: 1 }, { unique: true });
// PostsSchema.index({ "emails.address": 1 }, { unique: true });

export const Posts = model("Posts", PostsSchema);
