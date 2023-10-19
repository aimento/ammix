import { getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Users } from "../../models/users.server";
import { Posts } from "../../models/posts.server";
import { validateValue } from "../../utils/validator";
import { reconnectServer } from "../../services/dbconnect.server";
import React, { useState, useEffect } from "react";

export async function action({ request }: ActionFunctionArgs) {
  reconnectServer();

  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get(session.id);
  const userData = session.get("userdata");
  const now = new Date();

  const formData = await request.formData();
  const content = formData.get("content");

  if (!content) {
    return json({ error: "글을 적어주세요!" });
  }

  if (content?.length > 200) {
    return json({ error: "200자 이상 적을 수 없습니다!" });
  }

  await Posts.create({
    username: userData.userId,
    content: content,
    avatar: {
      firstName: userData.userName.firstName,
      lastName: userData.userName.lastName,
    },
    createdAt: now,
  });

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  reconnectServer();

  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get(session.id);
  const userData = session.get("userdata");

  if (!userData) {
    return redirect("/sign-in");
  }

  const userInfo = await Users.findOne({ _id: sessionId });

  const user = {
    userId: userData.userId,
    firstName: userData.userName.firstName,
    lastName: userData.userName.lastName,
    userImage: userInfo?.avatar?.imageUrl,
  };

  return json({ user });
}

export default function createPost() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  console.log(actionData);

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="text-center mb-4">
        {loaderData && (
          <>
            <h4 className="text-2xl font-semibold text-black mb-2">
              {loaderData.user.userId}
            </h4>
            <h4 className="text-xl font-medium text-gray-700">
              {loaderData.user.firstName} {loaderData.user.lastName}
            </h4>
          </>
        )}
      </div>

      {actionData?.error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      <form method="POST" className="space-y-4">
        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-600"
          >
            Content
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows="6"
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          작성하기
        </button>
      </form>
    </div>
  );
}
