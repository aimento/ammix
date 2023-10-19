import { json, LoaderFunction } from "remix";
import { getSession } from "~/services/session.server";
import { Posts } from "../../models/posts.server";
import { Form } from "@remix-run/react";

export let action: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");

    if (!userId) {
      return json({ error: "User is not authenticated." }, { status: 401 });
    }

    const formData = new URLSearchParams(await request.text());
    const content = formData.get("content");

    if (!content || content.trim() === "") {
      return json({ error: "Content is required." }, { status: 400 });
    }

    // 새 게시글 생성 및 저장
    const newPost = new Posts({
      userId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newPost.save();

    return json(newPost, { status: 201 });
  } catch (error) {
    return json(
      { error: `An error occurred while creating the post: ${error.message}` },
      { status: 500 }
    );
  }
};

export default function PostAdd() {
  return (
    <div>
      <h1>Create a New Post</h1>
      <Form method="post">
        <div>
          <label htmlFor="content">Content:</label>
          <textarea id="content" name="content" required></textarea>
        </div>
        <button type="submit">Create Post</button>
      </Form>
    </div>
  );
}
