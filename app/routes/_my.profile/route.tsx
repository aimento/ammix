import { redirect, json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import { Users } from "../../models/users.server";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/services/session.server";
import { validateValue } from "~/utils/validator";
import { sessionCommit } from "~/services/commit.server";
import React, { useState, useEffect } from "react";
import axios from "axios";

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const sessionId = session.get(session.id);
  let formData = await request.formData();

  if (formData.get("_action") === "nameEdit") {
    const changeFirstName = formData.get("changeFirstName");
    const changeFirstNameValidate = validateValue(
      changeFirstName,
      "change name"
    );
    const changeLastName = formData.get("changeLastName");
    const changeLastNameValidate = validateValue(changeLastName, "change name");

    if (changeFirstNameValidate !== true) {
      const { status } = changeFirstNameValidate;
      const errors = {
        status: status,
        firstName: changeFirstName,
        lastName: changeLastName,
      };
      return json({ errors });
    }

    if (changeLastNameValidate !== true) {
      const { status } = changeLastNameValidate;
      const errors = {
        status: status,
        firstName: changeFirstName,
        lastName: changeLastName,
      };
      return json({ errors });
    }

    const now = new Date();

    await Users.updateOne(
      { _id: sessionId },
      {
        $set: {
          "avatar.firstName": changeFirstName,
          "avatar.lastName": changeLastName,
          updatedAt: now,
        },
      }
    );

    const headers = await sessionCommit(request, sessionId);

    return redirect("/profile", { headers });
  }

    // const uploadHandler = composeUploadHandlers(
    //   createFileUploadHandler({
    //     directory: "./Desktop/public/uploads",
    //     // maxPartSize: 30000,
    //   }),
    //   createMemoryUploadHandler()
    // );
    // const imageForm = await parseMultipartFormData(request, uploadHandler);
    // const image = imageForm.get("img");
    // if (!image || typeof image === "string") {
    //   return json({ error: "something wrong", imgSrc: null });
    // }

    // return json({ error: null, imgSrc: image.name });

    // const changeImage = formData.get("changeImage");

    //   await Users.updateOne(
    //     { _id: sessionId },
    //     {
    //       $set: {
    //         "avatar.imageUrl": changeImage,
    //       },
    //     }
    //   );

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

  console.log(data.data.userImage);

  function onChange(f: any) {
    let file = f.files;

    if (!/\.(png|jpeg)$/i.test(file[0].name)) {
      alert("업로드할 수 없는 파일입니다.\n\n현재 파일 : " + file[0].name);
      file[0].name = ""; // 해당 태그의 파일이름값을 비워준다.
    } else return;
  }

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
              name="changeFirstName"
            />
            <input
              type="text"
              defaultValue={data?.data.userName.lastName}
              name="changeLastName"
            />
          </div>
          <button type="submit" name="_action" value="nameEdit">
            edit
          </button>
        </div>
      </form>
      <br></br>
      <Form method="POST" encType="multipart/form-data" action="/upload">
        <div>
          <br></br>
          <label>UserImage</label>
          <input
            type="file"
            name="img"
            // onChange={onChange(this)}
          />
          <br></br>
        </div>
        <button type="submit" name="_action" value="imageEdit">
          edit
        </button>
      </Form>
      {data?.data.userImage? (
        <div>
          <h2>uploaded image</h2>
          <img alt="uploaded" src={data.data.userImage} />
        </div>
      ) : null}
    </div>
  );
}
