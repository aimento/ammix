import { commitSession, getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Users } from "../../models/users.server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Form, useActionData } from "@remix-run/react";

export async function action(){};