import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Users } from "../../models/users.server";
import { validateEmail } from "~/utils/validator";
import sendGrid from "@sendgrid/mail";
import { Form, useActionData } from "@remix-run/react";
import { reconnectServer } from "../../services/dbconnect.server";

export async function action({ request }: ActionFunctionArgs) {
  reconnectServer();

  const formData = await request.formData();

  const email = formData.get("email");

  const emailValidate = await validateEmail(email); // 이메일 양식 검증

  let status = {};

  if (emailValidate !== true) {
    status = emailValidate;
    return json({ status });
  }

  let userInfo = await Users.findOne({ "emails.address": email }); // 이메일로 사용자 검색

  if (!userInfo) {
    status = {
      status: "This email is an unregistered member.",
    };
    return json({ status });
  }

  await Users.updateOne(
    { "emails.address": email },
    {
      $set: {
        "auths.0.secret.token": Math.random().toString(36).substring(2, 15),
        "auths.0.secret.expireAt": new Date(
          new Date().getTime() + 2 * 60 * 60 * 1000
        ),
      },
    }
  );

  userInfo = await Users.findOne({ "emails.address": email });
  const token = userInfo.auths[0].secret.token;

  sendGrid.setApiKey(process.env.SEND_GRID);

  const message = {
    to: email,
    from: process.env.EMAIL,
    subject: "AIMento - Recovery Password Link",
    text: "Click here for change your password.",
    html: `<a href='http://localhost:${process.env.PORT}/reset-password?token=${token}'> Click here for change your password </a>`,
  };

  sendGrid
    .send(message)
    .then(() => {
      console.log("Mail transfer is complete");
    })
    .catch((error) => {
      console.error(error);
    }); // reset-password 링크를 메일로 전송

  status = {
    status: "Successfully send reset password link",
  };

  return json({ status });
}

export default function ForgotPassword() {
  const data = useActionData<typeof action>();
  return (
    //     <div className="h-screen flex justify-center items-center">
    //        <form method="POST"  className="w-full max-w-lg p-8 bg-white shadow-md rounded-md">

    //       <div>
    //         {data ? <em>{data.status.status}</em> : null}
    //         <br></br>
    //         <label>email</label>
    //         <input type="text" name="email" />
    //       </div>
    //       <button type="submit">Submit</button>
    //     </form>
    //     </div>

    //   );
    // }
    <div className="h-screen flex justify-center items-center">
      <Form method="POST" className="w-full max-w-lg p-8 bg-white rounded-md">
        <div className="flex flex-col space-y-5">
          <h1 className="text-xl font-medium text-center text-gray-700">
            비밀번호 찾기
          </h1>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              name="email"
              className="p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <button
            type="submit"
            className="w-full p-2 text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
          >
            비밀번호 링크 보내기
          </button>

          {data?.status && (
            <div className="text-center text-red-500">
              <em>{data.status.status}</em>
            </div>
          )}
        </div>
      </Form>
    </div>
  );
}
