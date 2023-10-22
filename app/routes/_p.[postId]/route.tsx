import {
  json,
  redirect,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { Posts } from "../../models/posts.server";
import { getSession } from "~/services/session.server";
import { useLoaderData } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { reconnectServer } from "../../services/dbconnect.server";
//상세보기
export async function loader({ params, request }: LoaderFunctionArgs) {
  reconnectServer();
  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get("session.id");
  const userData = session.get("userdata");

  const postId = params.postId;

  try {
    const post = await Posts.findOne({ postId: postId });

    if (!post) {
      console.error(`No post found with postId: ${postId}`);
      return json({ error: "Post not found" }, { status: 404 });
    }

    return json({
      postId: post.postId,
      content: post.content,
      username: post.username,
      firstName: post.avatar.firstName,
      lastName: post.avatar.lastName,
    });
  } catch (error) {
    console.error(`Error occurred while fetching the post: ${error.message}`);
    return json({ error: error.message }, { status: 500 });
  }
}
export async function action({ request, params }: ActionFunctionArgs) {
  reconnectServer();
  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get("session.id");

  const postId = params.postId;

  const post = await Posts.findOne({ postId: postId });
  if (!post) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = new URLSearchParams(await request.text());
  const actionType = formData.get("actionType");

  if (actionType === "delete") {
    await Posts.deleteOne({ postId: postId });
    return redirect("/posts");
  } else if (actionType === "update") {
    const updatedContent = formData.get("content");
    post.content = updatedContent;
    await post.save();
    return redirect("/posts");
  }

  return json({ error: "Invalid action" }, { status: 400 });
}

export default function PostId() {
  const data = useLoaderData();

  return (
    <div>
      <h2>Username: {data.username}</h2>
      <h2>First Name: {data.firstName}</h2>
      <h2>Last Name: {data.lastName}</h2>

      {data.error ? (
        <p>{data.error}</p>
      ) : (
        <Form method="post">
          <div>
            <h2>Content:</h2>
            <textarea name="content" defaultValue={data.content}></textarea>
          </div>

          <button name="actionType" value="update">
            수정
          </button>
          <button name="actionType" value="delete">
            삭제
          </button>
        </Form>
      )}
    </div>
  );
}
