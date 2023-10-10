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
    <div className="h-screen flex justify-center items-center">
      <form
        method="POST"
        className="w-full max-w-lg p-8 flex flex-col space-y-6"
      >
        <div className="flex flex-col space-y-2">
          {data ? <h4>Invalid User Data</h4> : null}
          <br></br>
          <label className="block text-sm font-medium text-gray-700">
            아이디
          </label>
          <input
            type="text"
            defaultValue={data?.errors.username}
            name="username"
            className="h-12 mt-1 p-2 border rounded-md"
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
  );
}
