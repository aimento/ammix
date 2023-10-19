import { json, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/services/session.server";
import { Posts } from "../../models/posts.server";
import { Form } from "@remix-run/react";
import { Users } from "~/models/users.server";
import { reconnectServer } from "../../services/dbconnect.server";

export async function action({ request }: ActionFunctionArgs) {
  reconnectServer();
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");

    if (!userId) {
      return json({ error: "User is not authenticated." }, { status: 401 });
    }

    const formData = await request.formData();
    const content = formData.get("content");

    if (!content || content.trim() === "") {
      return json({ error: "Content is required." }, { status: 400 });
    }

    const newPost = await Posts.create({
      userId,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newPost.save();

    return new Response(null, {
      headers: {
        Location: `/routes/${newPost._id}/route/tsx`,
      },
      status: 302,
    });
  } catch (error) {
    return json(
      { error: `An error occurred while creating the post: ${error.message}` },
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
    return redirect("/sign-in");
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

export default function New() {
  // const loaderData = useLoaderData<typeof loader>();
  // const actionData = useActionData<typeof action>();
  return (
    <div>
      <h1>new</h1>
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
