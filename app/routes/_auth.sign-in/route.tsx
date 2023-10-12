import { commitSession, getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Users } from "../../models/users.server";
import bcrypt from "bcryptjs";
import AuthButton from "../components/_auth.button";
import React, { useState, useEffect } from "react";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
//잠시추가

export async function action({ request }: ActionFunctionArgs) {
  await sleep(5000);
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  console.log("user form data", { username, password });

  const userInfo = await Users.findOne({ username: username });
  let errors = {};

  if (!userInfo) {
    errors = {
      errorStatus: "Invalid User",
      message: "아이디가 잘못되었습니다.",
      username: username,
    };
    return json({ errors });
  }

  const [auths] = userInfo?.auths;

  const result = {
    username: userInfo?.username,
    password: auths.secret.bcrypt,
  };

  const comparePassword = await bcrypt.compare(password, result.password);

  if (!comparePassword) {
    errors = {
      errorStatus: "Invalid User",
      message: "비밀번호가 잘못되었습니다.",
      username: username,
    };
    return json({ errors });
  }
  console.log("user logined", userInfo);

  let session = await getSession(request.headers.get("cookie"));
  const returnTo = session.get("returnTo");

  session.set(session.id, userInfo);
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
    <div className="h-screen flex justify-center items-center">
      <Form
        onSubmit={(e) => {
          console.log("Form submitted");
        }}
        method="POST"
        className="w-full max-w-lg p-8 flex flex-col space-y-6"
      >
        <div className="flex flex-col space-y-2">
          <br></br>
          <label className="block text-sm font-medium text-gray-700">
            아이디
          </label>
          <input
            type="text"
            defaultValue={data?.errors.username}
            name="username"
            className={`h-12 mt-1 p-2 border rounded-md ${
              data?.errors.message && data?.errors.message.includes("아이디")
                ? "border-red-500"
                : ""
            }`}
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
  );
}
