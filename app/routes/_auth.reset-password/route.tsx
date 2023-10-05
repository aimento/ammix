import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Users } from "../../models/users.server";
import sendGrid from "@sendgrid/mail";
import mongoose from "mongoose";
import { Form, useActionData } from "@remix-run/react";

mongoose.connect("mongodb://localhost:27017/aimento");

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  let status = {};

  const email = formData.get("email");

  let userInfo = await Users.findOne({ "emails.address": email });

  if (!userInfo) {
    status = {
      statusCode: "This email is an unregistered member.",
      // email: email,
    };
    return json({ status });
  }

  console.log("usrinfo:", userInfo.auths[0].secret);

  await Users.updateOne(
    { "emails.address": email },
    {
      $set: {
        auths: {
          secret: {
            token: Math.random().toString(36).substring(2, 15),
            expireAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
          },
        },
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
    html: `<a href='http://localhost:4000/change-password?token=${token}'> Click here for change your password </a>`,
  };

  sendGrid
    .send(message)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error(error);
    });

  status = {
    statusCode: "Successfully send reset password link",
  };

  return json({ status });
}

export default function resetLink() {
  const data = useActionData<typeof action>();
  console.log(data);
  return (
    <form method="POST">
      <div>
        {data ? <em>{data.status.statusCode}</em> : null}
        <br></br>
        <label>email</label>
        <input type="text" name="email" />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
