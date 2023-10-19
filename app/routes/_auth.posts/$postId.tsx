import { json, LoaderFunction } from "remix";
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

export default function PostAdd() {
  return (
    <div>
      <h1>어디임</h1>
    </div>
  );
}
