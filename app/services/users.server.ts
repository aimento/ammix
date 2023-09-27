import bcrypt, { hash } from "bcrypt";
import mongoose from "mongoose";
import { Users } from "../models/users.server";
import { validateEmail } from "../utils/validator";

mongoose.connect("mongodb://localhost:27017/aimento");
export let loader: any = async () => {
  return await Users.find({});
};

export const userSignUp = async (email: any, password: any, username: any) => {
  validateEmail(email);

  const user = await Users.findOne({ "emails.address": email });
  if (user) {
    throw new Error("error_email_already_exists");
  }

  const now = new Date();
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await Users.create({
    username: `${username}`,
    auths: [
      {
        channel: "EMAIL",
        id: `${email}`,
        secret: {
          bcrypt: `${hashedPassword}`,
          token: Math.random().toString(36).substring(2, 15),
          expireAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
        },
      },
    ],
    emails: [
      {
        address: `${email}`,
        verified: false,
        token: Math.random().toString(36).substring(2, 15),
        expireAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      },
    ],
    createdAt: now,
    updatedAt: now,
  });

  return newUser;
};

export const userSignIn = async (username: any, password: any) => {
  const userInfo = await Users.findOne({ username: username });
  const [auths] = userInfo?.auths;

  const result = {
    username: userInfo?.username,
    password: auths.secret.bcrypt,
  };
  if (!result.username) {
    throw new Error("Invalid User");
  }

  const comparePassword = await bcrypt.compare(password, result.password);

  console.log(comparePassword);

  if (!comparePassword) {
    throw new Error("Invalid Password");
  }

  const signUser = await Users.findOne({ username: username });

  return signUser;
};
