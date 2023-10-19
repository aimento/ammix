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
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = data?.list.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil((data?.list.length || 0) / postsPerPage);

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      {currentPosts
        ? currentPosts.map((item, index) => (
            <div key={index} className="w-96">
              <div className="bg-white rounded-xl overflow-hidden">
                <div className="p-6">
                  <h4 className="text-2xl font-semibold mb-3 text-gray-800">
                    ID: {item.username}
                  </h4>
                  <p className="text-gray-600 mb-3">
                    성: {item.avatar.firstName}
                  </p>
                  <p className="text-gray-600 mb-3">
                    이름: {item.avatar.lastName}
                  </p>
                  <p className="text-gray-600">내용: {item.content}</p>
                </div>
              </div>
            </div>
          ))
        : null}

      <div className="mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="text-sm px-3 py-2 border rounded-full mx-1 text-gray-500"
        >
          {"<"}
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`text-sm px-3 py-2 mx-1 ${
              currentPage === i + 1
                ? "text-blue-500 font-bold"
                : "text-gray-500"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className="text-sm px-3 py-2 border rounded-full mx-1 text-gray-500"
        >
          {">"}
        </button>
      </div>
    </div>
  );
}
