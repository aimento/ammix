import { LoaderFunction, useLoaderData } from "@remix-run/react";
import { getSession } from "~/services/session.server";
import { json } from "@remix-run/node";
import { Users } from "~/models/users.server";

export let loader: LoaderFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("cookie"));
  let userId = session.get("userdata")?.userId;
  console.log("UserId from session: ", userId);
  console.log("Session data: ", session.get("userdata"));

  let user = null;

  if (userId) {
    user = await Users.findOne({ username: userId });
  }

  return json({ user });
};

export default function Home() {
  let data = useLoaderData();
  let user = data.user;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.username}</p>
        </div>
      ) : (
        <div>
          <a href="/sign-in">Sign In</a>
        </div>
      )}
    </div>
  );
}
