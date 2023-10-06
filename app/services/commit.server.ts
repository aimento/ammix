import { commitSession, getSession, destroySession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import { Users } from "../models/users.server";

export const sessionCommit = async (request, sessionId) => {
  const userInfo = await Users.findOne({ _id: sessionId });
  const { _id, username, avatar } = userInfo;
  let session = await getSession(request.headers.get("cookie"));

  session.unset(session.id);
  session.unset("userdata");
  session.set(session.id, _id);
  session.set("userdata", {
    userId: username,
    userName: avatar.name,
  });
  session.unset("returnTo")

  let headers = new Headers({ "Set-Cookie": await commitSession(session) });

  return headers;
};
