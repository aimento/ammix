import { redirect, json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { Users } from "../../models/users.server";
import { Form, useLoaderData } from "@remix-run/react";
import { getSession } from "~/services/session.server";
import { validateValue } from "~/utils/validator";
import { sessionCommit } from "~/services/commit.server";

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
  const createdAt = userInfo.createdAt;
  const updatedAt = userInfo.updatedAt;

  if (!userInfo.avatar.imageUrl) {
    userData.imageUrl = "";
  } else {
    userData.imageUrl = userInfo.avatar.imageUrl;
  }
  const getUserInfo = {
    userId: userData.userId,
    userName: userData.userName,
    userImage: userData.imageUrl,
    createdAt: createdAt,
    updatedAt: updatedAt,
  };

  return json({ data: getUserInfo });
}

export default function testing() {
  const data = useLoaderData<typeof loader>();

  console.log(data.data.userImage);

  return (
    <div>
      <label>UserID</label>
      {data ? <h4>{data.data.userId}</h4> : null}
      <form method="POST">
        <div>
          <div>
            <label>이름 :</label>
            <input
              type="text"
              defaultValue={data?.data.userName.lastName}
              name="changeLastName"
            />
            <label>성 :</label>
            <input
              type="text"
              defaultValue={data?.data.userName.firstName}
              name="changeFirstName"
            />
          </div>
          <input type="hidden" name="_action" value="nameEdit" />
          <button type="submit">이름 수정하기</button>
        </div>
      </form>
      <div>
        <label>생성날짜:</label>{" "}
        {data ? (
          <h4>{new Date(data.data.createdAt).toLocaleString()}</h4>
        ) : null}
        <label>수정날짜:</label>{" "}
        {data ? (
          <h4>{new Date(data.data.updatedAt).toLocaleString()}</h4>
        ) : null}
      </div>

      <br></br>
      <Form method="POST" encType="multipart/form-data" action="/upload">
        <div>
          <br></br>
          <label>UserImage</label>
          <input type="file" name="img" />
          <br></br>
        </div>
        <button type="submit" name="_action" value="imageEdit">
          edit
        </button>
      </Form>
      {data?.data.userImage ? (
        <div>
          <h2>uploaded image</h2>
          <img alt="uploaded" src={data.data.userImage} />
        </div>
      ) : null}
    </div>
  );
}

