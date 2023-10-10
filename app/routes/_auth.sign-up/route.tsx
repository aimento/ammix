import { commitSession, getSession } from "~/services/session.server";
import { userSignUp } from "../../services/users.server";
import { redirect, type ActionFunctionArgs } from "@remix-run/node";

export default function SignUp() {
  return (
    <div className="h-screen flex justify-center items-center">
      <form
        method="POST"
        className="w-full max-w-lg p-8 flex flex-col space-y-6"
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
            type="text"
            name="password"
            placeholder="비밀번호를 입력하세요"
            className="h-12 mt-1 p-2 border rounded-md"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="text"
            name="email"
            placeholder="이메일을 입력하세요"
            className="h-12 mt-1 p-2 border rounded-md"
          />
        </div>
        <button
          type="submit"
          className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        >
          회원가입
        </button>
      </form>
    </div>
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
