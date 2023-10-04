import { commitSession, getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { Users } from "../../models/users.server";
import bcrypt from "bcryptjs";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  console.log("user form data", { username, password });

  const userInfo = await Users.findOne({ username: username });
  let errors = {};

  if (!userInfo) {
    errors = { errorStatus: "Invalid User", username: username };
  }
  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  const [auths] = userInfo?.auths;

  const result = {
    username: userInfo?.username,
    password: auths.secret.bcrypt,
  };

  const comparePassword = await bcrypt.compare(password, result.password);

  if (!comparePassword) {
    errors = { errorStatus: "Invalid User", username: username };
  }
  if (Object.keys(errors).length > 0) {
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
  const data = useActionData<typeof action>();
  return (
    <form method="POST">
      <div>
        {data ? <h4>Invalid User Data</h4> : null}
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
          defaultValue={data?.errors.password}
          name="password"
          minLength="5"
        />
      </div>
      <button type="submit">Sign In</button>
    </form>
  );
}
