import { commitSession, getSession } from "~/services/session.server";
import { userSignUp } from "../../services/users.server";
import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

export default function SignUp() {
  return (
    <form method="POST">
      <div>
        <label>username</label>
        <input type="text" name="username" />
      </div>
      <div>
        <label>password</label>
        <input type="text" name="password" />
      </div>
      <div>
        <label>email</label>
        <input type="text" name="email" />
      </div>
      <button type="submit">Sign Up</button>
    </form>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const email = formData.get("email");
  const password = formData.get("password");
  const username = formData.get("username");

  console.log("user form data", { email, password, username });

  const user = await userSignUp(email, password, username);

  console.log("user created", user);

  let session = await getSession(request.headers.get("cookie"));
  const returnTo = session.get("returnTo");

  session.set(session.id, user);
  session.unset("returnTo");

  let headers = new Headers({ "Set-Cookie": await commitSession(session) });

  return redirect(returnTo || "/", { headers });
}

export function ErrorBoundary() {
  const error = useRouteError();
  return redirect("/sign-up");
}
