import { redirect, json } from "@remix-run/node";
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { unstable_createFileUploadHandler } from "@remix-run/node";
import { Users } from "../../models/users.server";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/services/session.server";
import { validateValue } from "~/utils/validator";
import { sessionCommit } from "~/services/commit.server";
import React, { useState, useEffect } from "react";
import axios from "axios"

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const sessionId = session.get(session.id);
  const formData = await request.formData();

  if (formData.get("_action") === "nameEdit") {
    const changeFirstName = formData.get("changeFirstName");
    const changeFirstNameValidate = validateValue(changeFirstName, "change name");
    const changeLastName = formData.get("changeLastName");
    const changeLastNameValidate = validateValue(changeLastName, "change name");

    if (changeFirstNameValidate !== true) {
      const { status } = changeFirstNameValidate;
      const errors = { status: status, firstName: changeFirstName, lastName: changeLastName };
      return json({ errors });
    }

    if (changeLastNameValidate !== true) {
      const { status } = changeLastNameValidate;
      const errors = { status: status, firstName: changeFirstName, lastName: changeLastName };
      return json({ errors });
    }

    const now = new Date()

    await Users.updateOne(
      { _id: sessionId },
      {
        $set: {
          "avatar.firstName": changeFirstName,
          "avatar.lastName": changeLastName,
          "updatedAt": now
        },
      }
    );

    const headers = await sessionCommit(request, sessionId);

    return redirect("/profile", { headers });
  }

  if (formData.get("_action") === "imageEdit") {

    const changeImage = formData.get("changeImage");

    await Users.updateOne(
      { _id: sessionId },
      {
        $set: {
          "avatar.imageUrl": changeImage,
        },
      }
    );
  }

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const sessionId = session.get(session.id);
  const userData = session.get("userdata");
  if (!userData) {
    return redirect("/sign-in");
  }

  const userInfo = await Users.findOne({ _id: sessionId });

  if (!userInfo.avatar.imageUrl) {
    userData.imageUrl = "";
  } else {
    userData.imageUrl = userInfo.avatar.imageUrl;
  }
  const getUserInfo = {
    userId: userData.userId,
    userName: userData.userName,
    userImage: userData.imageUrl,
  };

  return json({ data: getUserInfo });
}

export default function testing() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div>
      <label>UserID</label>
      {data ? <h4>{data.data.userId}</h4> : null}
      <form method="POST">
        <div>
          <br></br>
          <label>Username</label>
          <br></br>
          <div>
            <input
            type="text"
            defaultValue={data?.data.userName.firstName}
            name="changeFirstName"/>
            <input
            type="text"
            defaultValue={data?.data.userName.lastName}
            name="changeLastName"/>
          </div>
          <button type="submit" name="_action" value="nameEdit">
            edit
          </button>
        </div>
      </form>
      <br></br>
      <form method="POST">
        <div>
          <br></br>
          <label>UserImage</label>
          <input
            type="file"
            name="changeImage"
            // onSubmit={onSubmit}
          />
          <br></br>
        </div>
        <button type="submit" name="_action" value="imageEdit">
          edit
        </button>
      </form>
    </div>
  );
}
