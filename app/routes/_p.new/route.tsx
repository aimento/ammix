import {
  redirect,
  json,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { getSession } from "~/services/session.server";
import { Posts } from "../../models/posts.server";
import { Form } from "@remix-run/react";
import { Users } from "~/models/users.server";
import { reconnectServer } from "../../services/dbconnect.server";
import { v4 as uuidv4 } from "uuid";

export async function action({ request }: ActionFunctionArgs) {
  reconnectServer();

  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get("session.id");
  const userData = session.get("userdata");
  const now = new Date();

  const formData = await request.formData();
  const content = formData.get("content");

  if (!content || content.trim() === "") {
    return json({ error: "Content is required." }, { status: 400 });
  }

  try {
    const newPost = await Posts.create({
      postId: uuidv4(),
      username: userData.userId,
      content: content.trim(),
      avatar: {
        firstName: userData.userName.firstName,
        lastName: userData.userName.lastName,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newPost.save();

    console.log("New Post ID: ", newPost.postId);

    return redirect(`/${newPost.postId}`);
  } catch (error) {
    return json(
      { error: `An error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  reconnectServer();

  const session = await getSession(request.headers.get("Cookie"));
  const sessionId = session.get(session.id);
  const userData = session.get("userdata");

  if (!userData) {
    return { redirect: "/sign-in" };
  }

  const userInfo = await Users.findOne({ _id: sessionId });

  const user = {
    userId: userData.userId,
    firstName: userData.userName.firstName,
    lastName: userData.userName.lastName,
    userImage: userInfo?.avatar?.imageUrl,
  };

  return json({ user });
}

export default function NewPostPage() {
  return (
    <div>
      <h1>Create a new post</h1>
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
