import mongoose from "mongoose";

export const connectServer = mongoose.connect(
  "mongodb://localhost:27017/aimento"
);
