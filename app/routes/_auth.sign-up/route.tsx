import { commitSession, getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Users } from "../../models/users.server";
import bcrypt from "bcryptjs";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import {
  validateEmail,
  validateUserName,
  validatePassword,
} from "../../utils/validator";
import { reconnectServer } from "../../services/dbconnect.server";
import AuthButton from "../components/_auth.button";
import { sessionCommit } from "../../services/commit.server";
import React, { useState, useEffect } from "react";

export async function action({ request }: ActionFunctionArgs) {
  reconnectServer();

  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const username = formData.get("username");
  const phoneNumber = formData.get("phoneNumber"); // 핸드폰 번호 추가
  const address = formData.get("address"); // 주소 추가

  let errors = {};
  const emailValidate = validateEmail(email); // 이메일 양식 검증

  if (emailValidate !== true) {
    const { status } = emailValidate;
    errors = { status: status, email: email, username: username };
    return json({ errors });
  }

  const usernameValidate = validateUserName(username); // username 양식 검증

  if (usernameValidate !== true) {
    const { status } = usernameValidate;
    errors = { status: status, email: email, username: username };
    return json({ errors });
  }

  const passwordValidate = validatePassword(password); // password 양식 검증

  if (passwordValidate !== true) {
    const { status } = passwordValidate;
    errors = { status: status, email: email, username: username };
    return json({ errors });
  }

  const getName = await Users.findOne({ username: username });

  if (getName) {
    errors = {
      status: "Duplicated username",
      email: email,
      errorStatus: "중복된 아이디입니다.",
      // email: email,
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
    phoneNumber: `${phoneNumber}`, // 핸드폰 번호 저장
    address: `${address}`,
    emails: [
      {
        address: `${email}`,
        verified: false,
      },
    ],
    avatar: {
      firstName: "User_",
      lastName: Math.random().toString(36).substring(2, 11),
      imageUrl: `${process.env.DEFAULT_IMAGE}`,
    },
    createdAt: now,
    updatedAt: now,
  }); // 유저 생성

  const userInfo = await Users.findOne({ "emails.address": email });
  const sessionId = userInfo?._id;

  let session = await getSession(request.headers.get("cookie"));
  const returnTo = session.get("returnTo");
  const headers = await sessionCommit(request, sessionId);

  return redirect(returnTo || "/home", { headers });
}

export default function SignUp() {
  const navigation = useNavigate();
  const isSubmitting =
    navigation.state === "submitting" || navigation.state === "loading";

  console.log("Navigation State:", navigation.state);

  const data = useActionData<typeof action>();
  const [step, setStep] = useState(1); // 현재 단계 상태

  const nextStep = () => {
    setStep(step + 1);
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <Form
        onSubmit={(e) => {
          e.preventDefault(); // 기본 제출 동작을 막습니다.

          if (step === 3) {
            // 회원가입 단계에서 제출될 때만 액션 실행
            // 다른 단계에서는 다음 단계로 이동
            navigation("/home"); // 이 부분을 수정하여 원하는 경로로 리다이렉트
          } else {
            nextStep(); // 다음 단계로 이동
          }
        }}
        method="POST"
        className="w-full max-w-lg p-8 flex flex-col space-y-6"
      >
        {step === 1 && (
          <div className="flex flex-col space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              약관 동의
            </label>
            {/* 약관 동의에 관련된 폼 필드 및 로직 추가 */}
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="flex flex-col space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                핸드폰 번호
              </label>
              <input
                type="text"
                name="phoneNumber"
                className="h-12 mt-1 p-2 border rounded-md"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                주소
              </label>
              <input
                type="text"
                name="address"
                className="h-12 mt-1 p-2 border rounded-md"
              />
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="flex flex-col space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                아이디
              </label>
              <input
                type="text"
                defaultValue={data?.errors.username}
                name="username"
                className={`h-12 mt-1 p-2 border rounded-md ${
                  data?.errors.username ? "border-red-500" : "border-gray-300"
                }`}
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
                className={`h-12 mt-1 p-2 border rounded-md ${
                  data?.errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {data?.errors.message ? (
                <p className="text-red-500">{data.errors.message}</p>
              ) : null}
            </div>
            {/* 다른 회원가입 관련 폼 필드 및 로직 추가 */}
          </div>
        )}
        <div>
          {step < 3 ? (
            <button type="submit">다음</button>
          ) : (
            <AuthButton label="회원가입" isSubmitting={isSubmitting} />
          )}
        </div>
      </Form>
    </div>
  );
}
