import { commitSession, getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { Users } from "../../models/users.server";
import bcrypt from "bcryptjs";
import { validateUserName, validatePassword } from "../../utils/validator"
import { reconnectServer } from "../../services/dbconnect.server";

export async function action({ request }: ActionFunctionArgs) {
  reconnectServer();
  
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  const userInfo = await Users.findOne({ username: username });
  let errors = {};

  const usernameValidate = validateUserName(username); // username 양식 검증

  if (usernameValidate !== true) {
    const { status } = usernameValidate
    errors = { status: status, username: username };
    return json({ errors })
  }

  const passwordValidate = validatePassword(password); // password 양식 검증

  if (passwordValidate !== true) {
    const { status } = passwordValidate
    errors = { status: status, username: username };
    return json({ errors })
  }

  if (!userInfo) {
    errors = { status: "Invalid User Data", username: username };
    return json({ errors });
  } // 유저 ID가 DB에 없을 경우

  const [auths] = userInfo?.auths;

  const result = {
    username: userInfo?.username,
    password: auths.secret.bcrypt,
  };

  if (!result.password) {
    errors = { status: "Invalid User Data", username: username };
    return json({ errors });
  } // DB의 유저 비밀번호에 문제가 생겼을 경우(서버 에러 캐치)

  const comparePassword = await bcrypt.compare(password, result.password);

  if (!comparePassword) {
    errors = { status: "Invalid User Data", username: username };
    return json({ errors });
  } // DB의 유저 비밀번호와 맞지 않을 경우

  const { _id, avatar } = userInfo

  let session = await getSession(request.headers.get("cookie"));

  const returnTo = session.get("returnTo");

  session.set(session.id, _id);
  session.set("userdata", {
    userId: username, 
    userName: avatar.name, 
  });
  session.unset("returnTo");

  let headers = new Headers({ "Set-Cookie": await commitSession(session) });

  return redirect(returnTo || "/", { headers });
}

export default function SignIn() {
  const data = useActionData<typeof action>();
  return (
    <form method="POST">
      <div>
        {data ? <em>{data.errors.status}</em> : null}
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
          name="password"
          minLength="5"
        />
      </div>
      <button type="submit">Sign In</button>
    </form>
  );
}
