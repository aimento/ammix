import { json, redirect } from "@remix-run/node";
import {
  LoaderFunction,
  useLoaderData,
  ActionFunction,
} from "@remix-run/react";
import { getSession, commitSession } from "~/services/session.server";
import { Users } from "~/models/users.server";

//세션에서 쿠키의 유저정보 찾기
export let loader: LoaderFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("cookie"));
  let userId = session.get("userdata")?.userId;
  console.log(session);

  let user = null;
  if (userId) {
    user = await Users.findOne({ username: userId });
  }

  return json({ user });
};

//로그아웃하기
export let action: ActionFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("cookie"));
  session.unset("userdata");
  let headers = new Headers({
    "Set-Cookie": await commitSession(session),
  });

  return redirect("/", { headers });
};

export default function Home() {
  let data = useLoaderData();
  let user = data.user;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome☺️, {user.username}</p>
          <form method="post" action="">
            <button type="submit">로그아웃</button>
          </form>
        </div>
      ) : (
        <div>
          <a href="/sign-in">로그인화면으로 가기!</a>
        </div>
      )}
    </div>
  );
}
