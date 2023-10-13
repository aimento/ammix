import { redirect, json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Users } from "../../models/users.server";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { validatePassword } from "../../utils/validator";
import { reconnectServer } from "../../services/dbconnect.server";

export async function action({ request }: ActionFunctionArgs) {
  reconnectServer();

  const formData = await request.formData();
  const url = new URL(request.url);
  const query = url.searchParams.get("token");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  const userInfo = await Users.findOne({ "auths.secret.token": query });

  const now = new Date().getTime();
  const tokenExpire = new Date(userInfo.auths[0].secret.expireAt).getTime();

  if (tokenExpire < now) {
    throw new Error("This link was expired. Please try again.");
  } // 토큰의 유효기간이 만료되었을 경우

  let errors = {};

  const passwordValidate = validatePassword(password); // password 양식 검증

  if (passwordValidate !== true) {
    const { status } = passwordValidate;
    errors = { status: status };
    return json({ errors });
  }

  if (password !== confirmPassword) {
    errors = { status: "password dosen't match" };
    return json({ errors });
  } // 비밀번호와 확인비밀번호가 다를 경우

  const hashedPassword = await bcrypt.hash(password, 10);

  await Users.updateOne(
    { "auths.secret.token": query },
    {
      $unset: {
        "auths.0.secret.token": 1,
        "auths.0.secret.expireAt": 1,
      },
      $set: {
        "auths.0.secret.bcrypt": hashedPassword,
      },
    }
  );

  return redirect("/sign-in");
}

export async function loader({ request }: LoaderFunctionArgs) {
  //query params로 토큰값을 받아 토큰 검증하는 단계
  const url = new URL(request.url);
  const query = url.searchParams.get("token");

  const now = new Date().getTime();

  const userInfo = await Users.findOne({ "auths.secret.token": query });

  if (!userInfo) {
    throw new Error("Invalid Link");
  } // 토큰 값이 옳지 않을 경우

  const tokenExpire = new Date(userInfo.auths[0].secret.expireAt).getTime();

  if (tokenExpire < now) {
    throw new Error("This link was expired. Please try again.");
  } // 토큰 유효기간이 지날 경우

  return true;
}

export default function ResetPassword() {
  const data = useActionData<typeof action>();
  return (
    <form method="POST">
      <div>
        <h3>This link is expired after 2hours.</h3>
        <br></br>
        <label>password</label>
        <input type="password" name="password" minLength="5" />
        <br></br>
        <label>confirm password</label>
        <input type="password" name="confirmPassword" minLength="5" />
        <br></br>
        {data ? <em>{data.errors.status}</em> : null}
        <br></br>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div>
      <h1>Sorry. It doesn't working :(</h1>
      <p>{error.message}</p>
    </div>
  );
}
