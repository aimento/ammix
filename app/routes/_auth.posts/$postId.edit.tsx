import { json, LoaderFunction } from "remix";
import { Posts } from "../../models/posts.server";
//수정
export let action: LoaderFunction = async ({ request, params }) => {
  const formData = new URLSearchParams(await request.text());
  const updatedPost = await Posts.findByIdAndUpdate(
    params.postId,
    { content: formData.get("content") },
    { new: true }
  );

  return json(updatedPost);
};

export default function PostAdd() {
  return (
    <div>
      <h1>여기는</h1>
    </div>
  );
}
