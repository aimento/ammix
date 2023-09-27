/**
 * Session 정보를 DB에서 관리한다.
 *
 */
import { createCookie, createCookieSessionStorage } from "@remix-run/node";

import { SESSION_DURATION } from "~/config/constants";

export let sessionCookie = createCookie("aimento_session", {
  sameSite: "lax", // this helps with CSRF
  path: "/", // remember to add this so the cookie will work in all routes
  httpOnly: true, // for security reasons, make this cookie http only
  maxAge: SESSION_DURATION, // cookie will expire after 15 minutes
  secrets: ["s3cr3t"], // replace this with an actual secret
  secure: process.env.NODE_ENV === "production", // enable this in prod only
});

/**
 * Cookie를 이용한 Session Storage를 생성한다.
 */
export const sessionStorage = createCookieSessionStorage({
  cookie: sessionCookie,
});

// you can also export the methods individually for your own usage
export let { getSession, commitSession, destroySession } = sessionStorage;
