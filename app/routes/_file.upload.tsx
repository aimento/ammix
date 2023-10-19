import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  redirect,
  json,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import { Users } from "../models/users.server";
import { getSession } from "~/services/session.server";

export const action = async({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));

  const sessionId = session.get(session.id);

  const uploadHandler = composeUploadHandlers(
    createFileUploadHandler({
      directory: "public/uploads",
      // maxPartSize: 3000000,
    }),
    createMemoryUploadHandler()
  );
  const formData = await parseMultipartFormData(request, uploadHandler);
  const image = formData.get("img");

  if (!image || typeof image === "string") {
    return json({ error: "something wrong", imgSrc: null });
  }

  console.log(image.name);

  await Users.updateOne(
    { _id: sessionId },
    {
      $set: {
        "avatar.imageUrl": `/uploads/${image.name}`,
      },
    }
  );

  return redirect("/profile");
}
