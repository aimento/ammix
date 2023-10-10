import { commitSession, getSession } from "~/services/session.server";
import { userSignIn } from "../../services/users.server";
import { redirect, type ActionFunctionArgs } from "@remix-run/node";

export default function SignIn() {
  return (
    <div className="h-screen flex justify-center items-center">
      <form
        method="POST"
        className="w-full max-w-md p-8 flex flex-col space-y-6"
      >
        <div className="flex flex-col space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            아이디
          </label>
          <input
            type="text"
            name="username"
            placeholder="아이디를 입력하세요"
            className="h-12 mt-1 p-2 border rounded-md"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            name="password"
            placeholder="비밀번호를 입력하세요"
            className="h-12 mt-1 p-2 border rounded-md"
          />
        </div>
        <button
          type="submit"
          className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        >
          로그인
        </button>
        <button className="text-gray-700">비밀번호 찾기</button>
      </form>
    </div>
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
