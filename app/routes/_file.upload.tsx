import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import { Users } from "../models/users.server";
import { getSession } from "~/services/session.server";
import { unlink } from "node:fs/promises";

export async function action({ request }: ActionFunctionArgs) {
  const now = new Date();

  const session = await getSession(request.headers.get("Cookie"));

  const sessionId = session.get(session.id);

  const userInfo = await Users.findOne({ _id: sessionId });

  const oldUserImageUrl = userInfo?.avatar?.imageUrl;

  // 스토리지 파일 전송을 위한 준비
  const uploadHandler = await composeUploadHandlers(
    createFileUploadHandler({
      directory: "public/uploads",
      // maxPartSize: 3000000,
    }),
    createMemoryUploadHandler()
  );

  // 로컬 스토리지에 파일 전송
  const formData = await parseMultipartFormData(request, uploadHandler);
  const imageData: any = formData.get("img");

  if (imageData?.size === 0 || typeof imageData === "string") {
    return redirect("/profile");
  }

  const imageUrl = imageData?.name;

  // 이미지 경로 저장
  await Users.updateOne(
    { _id: sessionId },
    {
      $set: {
        "avatar.imageUrl": `/uploads/${imageUrl}`,
        "avatar.oldImageUrl": `${oldUserImageUrl}`,
      },
    }
  );

  await deleteImage(sessionId, imageUrl, oldUserImageUrl);

  return redirect("/profile");
}

// 기존 이미지 삭제 및 에러캐치
async function deleteImage(
  sessionId: any,
  imageUrl: any,
  oldUserImageUrl: any
) {
  try {
    const now = new Date();

    if (oldUserImageUrl === process.env.DEFAULT_IMAGE) {
      await Users.updateOne(
        { _id: sessionId },
        {
          $set: {
            updatedAt: now,
          },
          $unset: {
            "avatar.oldImageUrl": 1,
          },
        }
      );
    } else {
      await Users.updateOne(
        { _id: sessionId },
        {
          $set: {
            updatedAt: now,
          },
        }
      );
      await unlink("public" + oldUserImageUrl);
    }
  } catch {
    await unlink("public" + imageUrl);

    await Users.updateOne(
      { _id: sessionId },
      {
        $set: {
          "avatar.imageUrl": `${oldUserImageUrl}`,
        },
        $unset: {
          "avatar.oldImageUrl": `${oldUserImageUrl}`,
        },
      }
    );
  }
}
