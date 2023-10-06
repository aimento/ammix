import { commitSession, getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Users } from "../../models/users.server";
import bcrypt from "bcryptjs";
import { validateUserName, validatePassword } from "../../utils/validator"
import { reconnectServer } from "../../services/dbconnect.server";
import AuthButton from "../components/_auth.button";
import React, { useState, useEffect } from "react";
import { sessionCommit } from "~/services/commit.server";

export async function action({ request }: ActionFunctionArgs) {
  reconnectServer();

  const formData = await request.formData();

  if (formData.has("forgot-password")) {
    // 비밀번호 찾기 페이지로 리다이렉트
    return redirect("/forgot-password");
  }

  const username = formData.get("username");
  const password = formData.get("password");

  const userInfo = await Users.findOne({ username: username });
  let errors = {};

  const usernameValidate = validateUserName(username);

  if (usernameValidate !== true) {
    const { status } = usernameValidate;
    errors = { status: status, username: username, message: "test" };
    return json({ errors });
  }

  if (!userInfo) {
    errors = {
      status: 1,
      message: "아이디가 잘못되었습니다",
      username: username,
    };
    return json({ errors });
  }

  const passwordValidate = validatePassword(password);

  if (passwordValidate !== true) {
    const { status } = passwordValidate;
    errors = {
      status: status,
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
      status: 2,
      username: username,
      message: "비밀번호가 틀렸습니다.",
    };
    return json({ errors });
  } // DB의 유저 비밀번호와 맞지 않을 경우

  const sessionId = userInfo._id
  
  let session = await getSession(request.headers.get("cookie"));
  const returnTo = session.get("returnTo");
  const headers = await sessionCommit(request, sessionId);

  return redirect(returnTo || "/", { headers });
}

export default function SignIn() {
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === "submitting" || navigation.state === "loading";
  const data = useActionData<typeof action>();
  console.log(data);

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
              data?.errors.status === 2
                ? "border-red-500"
                : ""
            }`}
          />

          {data?.errors.message ? (
            <p className="text-red-500">{data.errors.message}</p>
          ) : null}
        </div>

        <AuthButton label="로그인" isSubmitting={isSubmitting} />

        <button type="submit" name="forgot-password" value="true">
          비밀번호 찾기
        </button>
      </Form>
    </div>
  );
}
