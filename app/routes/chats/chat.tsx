import { Thread } from '~/components/assistant-ui/thread'

import { useState } from 'react';
import type { Route } from "./+types/home";
import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'


export function meta({}: Route.MetaArgs) {
    return [
      { title: "Chat page" },
      { name: "description", content: "This is the chat page" },
    ];
  }
  
  export async function loader({ request }: LoaderFunctionArgs) {
    const { auth } = await import("../../lib/auth.server");
    const session = await auth.api.getSession({ headers: request.headers })
    if (session?.user) {
      return { user: session.user }
    } else {
      throw redirect("/login")
    }
  }
  
  export async function action({ request }: ActionFunctionArgs) {
    const { auth } = await import("../../lib/auth.server");
    const session = await auth.api.getSession({ headers: request.headers })
    if (session?.user) {
      return auth.handler(request)
    } else {
      throw redirect("/login")
    }
  }

export default function Chat() {

  if (true) {
    return <div className="h-full">
      <div className="h-full">
        <Thread />
      </div>
  </div>
  }
}