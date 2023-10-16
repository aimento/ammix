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
    const changeName = formData.get("changeName");
    const changeNameValidate = validateValue(changeName, "change name");

    if (changeNameValidate !== true) {
      const { status } = changeNameValidate;
      const errors = { status: status, changeName: changeName };
      return json({ errors });
    }

    const now = new Date()

    await Users.updateOne(
      { _id: sessionId },
      {
        $set: {
          "avatar.name": changeName,
          "updatedAt": now
        },
      }
    );

    const headers = await sessionCommit(request, sessionId);

    return redirect("/profile", { headers });
  }

  if (formData.get("_action") === "imageEdit") {

    const changeImage = formData.get("changeImage");
    console.log(typeof changeImage);

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
  
  // const [content, setContent] = useState("");
  
  // const [uploadedImg, setUploadedImg] = useState({
  //   fileName: "",
  //   fillPath: ""
  // });

  // const onChange = e => {
  //   setContent(e.target.files[0]);
  // };

  // const onSubmit = e => {
  //   e.preventDefault();
  //   const formData = new FormData();
  //   formData.append("img", content); 
  //   axios
  //     .post("/upload", formData)
  //     .then(res => {
  //       const { fileName } = res.data;
  //       console.log(fileName);
  //       setUploadedImg({ fileName, filePath: `${process.env.BASE_URL}/img/${fileName}` });
  //       alert("The file is successfully uploaded");
  //     })
  //     .catch(err => {
  //       console.error(err);
  //     });
  // };

  return (
    <div>
      <label>UserID</label>
      {data ? <h4>{data.data.userId}</h4> : null}
      <form method="POST">
        <div>
          <br></br>
          <label>Username</label>
          <input
            type="text"
            defaultValue={data?.data.userName}
            name="changeName"
          />
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
