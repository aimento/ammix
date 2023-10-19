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

export async function action() {}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get(session.id);
  const userData = session.get("userdata");

  const list = await Posts.find();

  return json({ list });
}

export default function getPostList() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      {data && data.list ? (
        data.list.map((item, index) => (
          <div key={index}>
            <h4 className="text-lg font-medium">ID: {item.username}</h4>
            <h4 className="text-lg font-medium">성: {item.avatar.firstName}</h4>
            <h4 className="text-lg font-medium">이름: {item.avatar.lastName}</h4>
            <h4 className="text-lg font-medium">내용: {item.content}</h4>
          </div>
        ))
      ) : null}
    </div>
  );
}
