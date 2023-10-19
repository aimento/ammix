import { json, LoaderFunction } from "@remix-run/node";
import { Posts } from "../../models/posts.server";
//상세보기
export let loader: LoaderFunction = async ({ params }) => {
  const post = await Posts.findById(params.postId);
  return json(post);
};

//삭제
export let action: LoaderFunction = async ({ request, params }) => {
  await Posts.findByIdAndDelete(params.postId);
  return json({}, { status: 204 });
};

export default function PostId() {
  return (
    <div>
      <h1>postid</h1>
    </div>
  );
}
