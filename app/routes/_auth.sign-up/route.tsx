import { commitSession, getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Users } from "../../models/users.server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Form, useActionData } from "@remix-run/react";

mongoose.connect("mongodb://localhost:27017/aimento");

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const email = formData.get("email");
  const password = formData.get("password");
  const username = formData.get("username");

  let errors = {};

  console.log("user form data", { email, password, username });
  const validateEmail = (value) => {
    const validator = new RegExp(
      /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/
    );

    if (!validator.test(value)) {
      errors = {
        errorStatus: "Please check email",
        email: email,
        username: username,
      };

      return json({ errors });
    }
  };

  validateEmail(`${email}`);

  const getName = await Users.findOne({ username: username });

  if (getName) {
    errors = {
      errorStatus: "중복된 아이디입니다.",
      // email: email,
      username: username,
      message: "중복된 아이디입니다.",
    };
  }

  if (Object.keys(errors).length > 0) {
    console.log(errors);
    return json({ errors });
  }

  const getEmail = await Users.findOne({ "emails.address": email });

  if (getEmail) {
    errors = {
      errorStatus: "Duplicated email",
      email: email,
      // username: username,
      message: "중복된 이메일입니다.",
    };
    return json({ errors });
  }

  const now = new Date();
  const hashedPassword = await bcrypt.hash(password, 10);

  await Users.create({
    username: `${username}`,
    auths: [
      {
        channel: "EMAIL",
        id: `${email}`,
        secret: {
          bcrypt: `${hashedPassword}`,
          token: "",
          expireAt: "",
        },
      },
    ],
    emails: [
      {
        address: `${email}`,
        verified: false,
        token: "",
        expireAt: "",
      },
    ],
    createdAt: now,
    updatedAt: now,
  });

  const user = await Users.findOne({ "emails.address": email });

  console.log("user created", user);

  let session = await getSession(request.headers.get("cookie"));
  const returnTo = session.get("returnTo");

  session.set(session.id, user);
  session.unset("returnTo");

  let headers = new Headers({ "Set-Cookie": await commitSession(session) });

  return redirect(returnTo || "/", { headers });
}

export default function SignUp() {
  const data = useActionData<typeof action>();
  return (
    <div className="h-screen flex justify-center items-center">
      <form
        method="POST"
        className="w-full max-w-lg p-8 flex flex-col space-y-6"
      >
        <div className="flex flex-col space-y-2">
          {/* {data ? <h4>{data.errors.message}</h4> : null} */}
          <br></br>
          <label className="block text-sm font-medium text-gray-700">
            아이디
          </label>
          <input
            type="text"
            defaultValue={data?.errors.username}
            name="username"
            // className={`h-12 mt-1 p-2 border rounded-md ${
            //   data?.errors.username ? "border-red-500" : ""
            // }`}
            className={`h-12 mt-1 p-2 border rounded-md ${
              data?.errors.username ? "border-red-500" : ""
            } ${data?.errors.email ? "" : "border-gray-300"}`}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            minLength="5"
            name="password"
            className="h-12 mt-1 p-2 border rounded-md"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="text"
            defaultValue={data?.errors.email}
            name="email"
            // className={`h-12 mt-1 p-2 border rounded-md ${
            //   data?.errors.email ? "border-red-500" : ""
            // }`}
            className={`h-12 mt-1 p-2 border rounded-md ${
              data?.errors.email ? "border-red-500" : ""
            } ${data?.errors.username ? "" : "border-gray-300"}`}
          />
          {data?.errors.message ? (
            <p className="text-red-500">{data.errors.message}</p>
          ) : null}
        </div>
        <button
          type="submit"
          className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        >
          회원가입
        </button>
      </form>
    </div>
  );
}
