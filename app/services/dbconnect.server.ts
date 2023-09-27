import mongoose from "mongoose";
import { Users } from "../models/users.server";

mongoose.connect("mongodb://localhost:27017/aimento");
export let loader: any = async () => {
  return await Users.find({});
};
