import { redirect, json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Users } from "../../models/users.server";
import mongoose from "mongoose";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

mongoose.connect("mongodb://localhost:27017/aimento");

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const url = new URL(request.url);
  const query = url.searchParams.get("token");
  let errors = {};

  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  console.log(password, confirmPassword);

  if (!password) {
    errors = { errorStatus: "password is empty" };
    console.log(errors);
    return json({ errors });
  }

  if (password !== confirmPassword) {
    errors = { errorStatus: "password dosen't match" };
    console.log(errors);
    return json({ errors });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Users.updateOne(
    { "auths.secret.token": query },
    {
      $set: {
        auths: {
          secret: {
            bcrypt: hashedPassword,
            token: "",
            expireAt: "",
          },
        },
      },
    }
  );

  return redirect("/sign-in");
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("token");

  const now = new Date().getTime();

  console.log(now);

  const userInfo = await Users.findOne({ "auths.secret.token": query });

  if (!userInfo) {
    throw new Error("Invalid Token");
  }
  const tokenExpire = new Date(userInfo.auths[0].secret.expireAt).getTime();
  console.log(now - tokenExpire);

  if (tokenExpire < now) {
    throw new Error("This link was expired. Please try again.");
  }

  return null;
}

export default function resetPassword() {
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
        {data ? <em>{data.errors.errorStatus}</em> : null}
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
