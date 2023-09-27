import { commitSession, getSession } from "~/services/session.server";
import { userSignIn } from "../../services/users.server";
import { redirect, type ActionFunctionArgs } from "@remix-run/node";

export default function SignIn() {
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
      <button type="submit">Sign In</button>
    </form>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  console.log("user form data", { username, password });

  const user = await userSignIn(username, password);

  console.log("user logined", user);

  let session = await getSession(request.headers.get("cookie"));
  const returnTo = session.get("returnTo");

  session.set(session.id, user);
  session.unset("returnTo");

  let headers = new Headers({ "Set-Cookie": await commitSession(session) });

  return redirect(returnTo || "/", { headers });
}
