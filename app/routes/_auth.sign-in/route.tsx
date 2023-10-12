import { commitSession, getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Users } from "../../models/users.server";
import bcrypt from "bcryptjs";
<<<<<<< HEAD
import { validateUserName, validatePassword } from "../../utils/validator"
import { reconnectServer } from "../../services/dbconnect.server";

export async function action({ request }: ActionFunctionArgs) {
  reconnectServer();
  
=======
import AuthButton from "../components/_auth.button";
import React, { useState, useEffect } from "react";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
//잠시추가

export async function action({ request }: ActionFunctionArgs) {
  await sleep(5000);
>>>>>>> feature/tailwindcss
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  const userInfo = await Users.findOne({ username: username });
  let errors = {};

<<<<<<< HEAD
  const usernameValidate = validateUserName(username); // username 양식 검증

  if (usernameValidate !== true) {
    const { status } = usernameValidate
    errors = { status: status, username: username };
    return json({ errors })
=======
  if (!userInfo) {
    errors = {
      errorStatus: "Invalid User",
      message: "아이디가 잘못되었습니다.",
      username: username,
    };
    return json({ errors });
>>>>>>> feature/tailwindcss
  }

  const passwordValidate = validatePassword(password); // password 양식 검증

  if (passwordValidate !== true) {
    const { status } = passwordValidate
    errors = { status: status, username: username };
    return json({ errors })
  }

  if (!userInfo) {
    errors = { status: "Invalid User Data", username: username };
    return json({ errors });
  } // 유저 ID가 DB에 없을 경우

  const [auths] = userInfo?.auths;

  const result = {
    username: userInfo?.username,
    password: auths.secret.bcrypt,
  };

  if (!result.password) {
    errors = { status: "Invalid User Data", username: username };
    return json({ errors });
  } // DB의 유저 비밀번호에 문제가 생겼을 경우(서버 에러 캐치)

  const comparePassword = await bcrypt.compare(password, result.password);

  if (!comparePassword) {
<<<<<<< HEAD
    errors = { status: "Invalid User Data", username: username };
    return json({ errors });
  } // DB의 유저 비밀번호와 맞지 않을 경우

  const { _id, avatar } = userInfo
=======
    errors = {
      errorStatus: "Invalid User",
      message: "비밀번호가 잘못되었습니다.",
      username: username,
    };
    return json({ errors });
  }
  console.log("user logined", userInfo);
>>>>>>> feature/tailwindcss

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

export default function SignIn() {
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
        {data ? <em>{data.errors.status}</em> : null}
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
        <input
          type="password"
          name="password"
          minLength="5"
        />
      </div>
      <button type="submit">Sign In</button>
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
          {data ? <h4>Invalid User Data</h4> : null}
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
              data?.errors.message && data?.errors.message.includes("아이디")
                ? "border-red-500"
                : ""
            }`}
>>>>>>> feature/tailwindcss
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            defaultValue={data?.errors.password}
            name="password"
            minLength="5"
<<<<<<< HEAD
            className="h-12 mt-1 p-2 border rounded-md"
          />
        </div>
        <button
          type="submit"
          className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        >
          로그인
        </button>
      </form>
    </div>
>>>>>>> f8249aa (임시커밋)
=======
            className={`h-12 mt-1 p-2 border rounded-md ${
              data?.errors.message ? "border-red-500" : ""
            }`}
          />

          {data?.errors.message ? (
            <p className="text-red-500">{data.errors.message}</p>
          ) : null}
        </div>

        <AuthButton label="로그인" isSubmitting={isSubmitting} />

        <button>비밀번호 찾기</button>
      </Form>
    </div>
>>>>>>> feature/tailwindcss
  );
}
