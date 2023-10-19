import fs from "fs";
import { Users } from "~/models/users.server";

// 경로에 avatar 이미지가 있는 지에 대한 검증
export const findImageFile = async (sessionId: any, userImage: any) => {
  try {
    await fs.statSync("./public" + userImage);
  } catch {
    await Users.updateOne(
      { _id: sessionId },
      {
        $set: {
          "avatar.imageUrl": `${process.env.DEFAULT_IMAGE}`,
        },
      }
    );
  }
};
