import { getSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData,useNavigation } from "@remix-run/react";
import { Users } from "../../models/users.server";
import { Posts } from "../../models/posts.server"
import { validateValue } from "../../utils/validator";
import { reconnectServer } from "../../services/dbconnect.server";
import React, { useState, useEffect } from "react";

export async function action({ request }: ActionFunctionArgs) {
    reconnectServer();

    const session = await getSession(request.headers.get("Cookie"));
    const sessionId = session.get(session.id);
    const userData = session.get("userdata");
    const now = new Date;

    const formData = await request.formData();
    const content = formData.get("content");

    if(!content) {
        return json({error: "글을 적어주세요!"})
    }

    if(content?.length > 200) {
        return json({error: "200자 이상 적을 수 없습니다!"})
    }

    await Posts.create({
    username: userData.userId,
    content: content,
    avatar: 
    {
      firstName: userData.userName.firstName,
      lastName: userData.userName.lastName,
    },
    createdAt: now,
    })
    
    return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
    reconnectServer();

    const session = await getSession(request.headers.get("Cookie"));
    const sessionId = session.get(session.id);
    const userData = session.get("userdata");

    if(!userData) {
        return redirect("/sign-in")
    }

    const userInfo = await Users.findOne({_id: sessionId});
    
    const user = {
        userId: userData.userId,
        firstName: userData.userName.firstName,
        lastName: userData.userName.lastName,
        userImage: userInfo?.avatar?.imageUrl 
    }

    return json({user});
}

export default function createPost() {
    const loaderData = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    console.log(actionData);
    
    return (
        <div>
            {loaderData ? (
            <h4 className="text-lg font-medium">{loaderData.user.userId}</h4>
            ) : null}
            
            {loaderData ? (
            <h4 className="text-lg font-medium">{loaderData.user.firstName}</h4>
            ) : null}

            {loaderData ? (
            <h4 className="text-lg font-medium">{loaderData.user.lastName}</h4>
            ) : null}

            {actionData ? (
            <h4 className="text-lg font-medium">{actionData.error}</h4>
            ) : null}
            <form method="POST">
                <input type="text" name="content"/>

                <button type="submit">Submit</button>

            </form>
        </div>
    );
}
