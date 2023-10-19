import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Posts } from "../../models/posts.server";
import { getSession } from "~/services/session.server";
import { useLoaderData } from "@remix-run/react";
import { reconnectServer } from "../../services/dbconnect.server";
//수정
export async function action({ request, params }): ActionFunctionArgs {
  reconnectServer();

  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get("session.id");

  const post = await Posts.findById(params.postId);

  if (String(post.userId) !== sessionId) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = new URLSearchParams(await request.text());
  const updatedPost = await Posts.findByIdAndUpdate(
    params.postId,
    { content: formData.get("content") },
    { new: true }
  );

  return json(updatedPost);
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  reconnectServer();

  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get("session.id");

  const post = await Posts.findById(params.postId);

  if (!post) {
    return json({ error: "Post not found" }, { status: 404 });
  }

  // 게시글이 로그인한 사용자에게 속하는지 확인
  if (String(post.userId) !== sessionId) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  return json(post);
}

export default function Edit() {
  const data = useLoaderData();

  return (
    <div>
      <h1>게시물 수정</h1>
      <Form method="post">
        <div>
          <label htmlFor="content">내용:</label>
          <textarea
            id="content"
            name="content"
            defaultValue={data.content}
            required
          ></textarea>
        </div>
        <button type="submit">게시물 업데이트</button>
      </Form>
    </div>
  );
}
