import { json, LoaderFunction } from "@remix-run/node";

import { Posts } from "../../models/posts.server";
//불러오기
export let loader: LoaderFunction = async () => {
  const posts = await Posts.find();
  return json(posts);
};

export default function PostAdd() {
  return (
    <div>
      <h1>하</h1>
    </div>
  );
}
