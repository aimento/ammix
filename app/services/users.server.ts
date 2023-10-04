// import bcrypt, { hash } from "bcrypt";
import mongoose from "mongoose";
import { Users } from "../models/users.server";
import { validateEmail } from "../utils/validator";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

mongoose.connect("mongodb://localhost:27017/aimento");

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
