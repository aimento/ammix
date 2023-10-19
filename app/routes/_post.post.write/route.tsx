import { getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Users } from "../../models/users.server";
import { Posts } from "../../models/posts.server"
import { validateValue } from "../../utils/validator";
import { reconnectServer } from "../../services/dbconnect.server";
import React, { useState, useEffect } from "react";

export async function action({ request }: ActionFunctionArgs) {}

export async function loader({ request }: LoaderFunctionArgs) {
    reconnectServer();

    const session = await getSession(request.headers.get("Cookie"));
    const sessionId = session.get(session.id);
    const userData = session.get("userdata");

    if(!userData) {
        return redirect("/sign-in")
    }

    const userInfo = await Users.findOne({_id: sessionId});
    
    const { firstName, lastName } = userData;
    const userImage = userInfo?.avatar?.imageUrl;
    

    return "테스트입니다."
    


}
