import { getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData,useNavigation } from "@remix-run/react";
import { Users } from "../../models/users.server";
import { Posts } from "../../models/posts.server"
import { validateValue } from "../../utils/validator";
import { reconnectServer } from "../../services/dbconnect.server";
import React, { useState, useEffect } from "react";

export async function action() {};

export async function loader() {};

export default function getPostList() {};