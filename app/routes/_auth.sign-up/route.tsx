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
    }
    if (Object.keys(errors).length > 0) {
      return json({ errors });
    }
  };

  validateEmail(`${email}`);

  const getName = await Users.findOne({ username: username });

  if (getName) {
    errors = {
      errorStatus: "Duplicated username",
      email: email,
      username: username,
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
      username: username,
    };
  }
  if (Object.keys(errors).length > 0) {
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
    <form method="POST">
      <div>
        {data ? <h4>{data.errors.errorStatus}</h4> : null}
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
        <input type="password" name="password" />
      </div>
      <div>
        <label>email</label>
        <input type="text" defaultValue={data?.errors.email} name="email" />
      </div>
      <button type="submit">Sign Up</button>
    </form>
  );
}
