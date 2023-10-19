import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/services/session.server";
import { Posts } from "../../models/posts.server";
import { useLoaderData } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { reconnectServer } from "../../services/dbconnect.server";

//불러오기
export async function loader({ params, request }: LoaderFunctionArgs) {
  reconnectServer();
  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get("session.id");
  const userData = session.get("userdata");
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const pageSize = 5;
  //한 페이지에서 표시할 게시글

  try {
    const posts = await Posts.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    // 게시글 총 수 가져오기
    const totalPosts = await Posts.countDocuments();

    return json({ posts, totalPosts });
  } catch (error) {
    console.error(`Error occurred while fetching the posts: ${error.message}`);
    return json({ error: error.message }, { status: 500 });
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  reconnectServer();
  const postId = params.postId;

  const post = await Posts.findOne({ postId: postId });
  if (!post) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  return redirect(`/${postId}`);
}

export default function Post() {
  const data = useLoaderData<typeof loader>();
  const pageSize = 5;
  const totalPages = Math.ceil(data.totalPosts / pageSize);

  return (
    <div>
      <h1>전체 불러오기</h1>
      {data.posts.map((post) => (
        <Form key={post.postId} method="post" action={`/${post.postId}`}>
          <div>
            <button type="submit">
              <h2>Username: {post.username}</h2>
              <h2>First Name: {post.avatar.firstName}</h2>
              <h2>Last Name: {post.avatar.lastName}</h2>
              <p>Content: {post.content}</p>
            </button>
          </div>
        </Form>
      ))}
      <div>
        {Array.from({ length: totalPages }, (_, index) => (
          <a href={`?page=${index + 1}`} key={index}>
            {index + 1}
          </a>
        ))}
      </div>
    </div>
  );
}
