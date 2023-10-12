import { commitSession, getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Users } from "../../models/users.server";
import bcrypt from "bcryptjs";
<<<<<<< HEAD
import { Form, useActionData } from "@remix-run/react";
import { validateEmail, validateUserName, validatePassword } from "../../utils/validator"
import { reconnectServer } from "../../services/dbconnect.server";
=======
import { Form, useActionData, useNavigation } from "@remix-run/react";
import AuthButton from "../components/_auth.button";
import React, { useState, useEffect } from "react";

mongoose.connect("mongodb://localhost:27017/aimento");
>>>>>>> feature/tailwindcss

export async function action({ request }: ActionFunctionArgs) {
  reconnectServer();

  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const username = formData.get("username");

  let errors = {};
  const emailValidate = validateEmail(email); // 이메일 양식 검증

  if (emailValidate !== true) {
    const { status } = emailValidate;
    errors = { status: status, email: email, username: username};
    return json({ errors })
  }

  const usernameValidate = validateUserName(username); // username 양식 검증

  if (usernameValidate !== true) {
    const { status } = usernameValidate;
    errors = { status: status, email: email, username: username };
    return json({ errors })
  }

  const passwordValidate = validatePassword(password); // password 양식 검증

  if (passwordValidate !== true) {
    const { status } = passwordValidate;
    errors = { status: status, email: email, username: username };
    return json({ errors })
  }
  
  const getName = await Users.findOne({ username: username });

  if (getName) {
    errors = {
<<<<<<< HEAD
      status: "Duplicated username",
      email: email,
=======
      errorStatus: "중복된 아이디입니다.",
      // email: email,
>>>>>>> feature/tailwindcss
      username: username,
      message: "중복된 아이디입니다.",
    };

    return json({ errors });
  } // 유저ID가 같은 것이 있을 경우

  const getEmail = await Users.findOne({ "emails.address": email });

  if (getEmail) {
    errors = {
      status: "Duplicated email",
      email: email,
      // username: username,
      message: "중복된 이메일입니다.",
    };
    return json({ errors });
  } // 유저이메일이 같은 것이 있을 경우

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
        },
      },
    ],
    emails: [
      {
        address: `${email}`,
        verified: false,
      },
    ],
    avatar: 
    {
      name: "User_" + Math.random().toString(36).substring(2, 11),
      imageUrl: ""
    },
    createdAt: now,
    updatedAt: now,
  }); // 유저 생성

  const userInfo = await Users.findOne({ "emails.address": email });

  const { _id, avatar } = userInfo;

  let session = await getSession(request.headers.get("cookie"));
  const returnTo = session.get("returnTo");

  session.set(session.id, _id);
  session.set("userdata", {
    userId: username, 
    userName: avatar.name, 
  });
  session.unset("returnTo");

  let headers = new Headers({ "Set-Cookie": await commitSession(session) });

  return redirect(returnTo || "/", { headers });
}

export default function SignUp() {
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === "submitting" || navigation.state === "loading";

  console.log("Navigation State:", navigation.state);

  const data = useActionData<typeof action>();

  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <form method="POST">
      <div>
        {data ? <h4>{data.errors.status}</h4> : null}
        <br></br>
        <label>username</label>
        <input
          type="text"
          defaultValue={data?.errors.username}
          name="username"
        />
      </div>
      <div>
        <label>password</label>
        <input type="password" minLength="5" name="password" />
      </div>
      <div>
        <label>email</label>
        <input type="text" defaultValue={data?.errors.email} name="email" />
      </div>
      <button type="submit">Sign Up</button>
    </form>
=======
    <div className="h-screen flex justify-center items-center">
      <form
=======
    <div className="h-screen flex justify-center items-center">
      <Form
        onSubmit={(e) => {
          console.log("Form submitted");
        }}
>>>>>>> feature/tailwindcss
        method="POST"
        className="w-full max-w-lg p-8 flex flex-col space-y-6"
      >
        <div className="flex flex-col space-y-2">
<<<<<<< HEAD
          {data ? <h4>{data.errors.errorStatus}</h4> : null}
=======
>>>>>>> feature/tailwindcss
          <br></br>
          <label className="block text-sm font-medium text-gray-700">
            아이디
          </label>
          <input
            type="text"
            defaultValue={data?.errors.username}
            name="username"
<<<<<<< HEAD
            className="h-12 mt-1 p-2 border rounded-md"
=======
            className={`h-12 mt-1 p-2 border rounded-md ${
              data?.errors.username ? "border-red-500" : ""
            } ${data?.errors.email ? "" : "border-gray-300"}`}
>>>>>>> feature/tailwindcss
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
<<<<<<< HEAD
            className="h-12 mt-1 p-2 border rounded-md"
          />
        </div>
        <button
          type="submit"
          className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        >
          회원가입
        </button>
      </form>
    </div>
>>>>>>> f8249aa (임시커밋)
=======
            className={`h-12 mt-1 p-2 border rounded-md ${
              data?.errors.email ? "border-red-500" : ""
            } ${data?.errors.username ? "" : "border-gray-300"}`}
          />
          {data?.errors.message ? (
            <p className="text-red-500">{data.errors.message}</p>
          ) : null}
        </div>

        <AuthButton label="회원가입" isSubmitting={isSubmitting} />
      </Form>
    </div>
>>>>>>> feature/tailwindcss
  );
}
