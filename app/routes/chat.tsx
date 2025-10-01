import BackButton from '../ui_components/BackButton'
import { Thread } from '~/components/assistant-ui/thread'
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import type { Route } from "./+types/home";
import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";


export function meta({}: Route.MetaArgs) {
    return [
      { title: "Chat page" },
      { name: "description", content: "This is the chat page" },
    ];
  }
  
  export async function loader({ request }: LoaderFunctionArgs) {
    const { auth } = await import("../lib/auth.server");
    const session = await auth.api.getSession({ headers: request.headers })
    if (session?.user) {
      return { user: session.user }
    } else {
      throw redirect("/signin")
    }
  }
  
  export async function action({ request }: ActionFunctionArgs) {
    const { auth } = await import("../lib/auth.server");
    const session = await auth.api.getSession({ headers: request.headers })
    if (session?.user) {
      return auth.handler(request)
    } else {
      throw redirect("/signin")
    }
  }

export default function Chat() {
  const [input, setInput] = useState('');
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: '/ai'
    })
  });
  const runtime = useAISDKRuntime(chat);
  if (true) {
    return <div className="h-full">
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-full">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  </div>
  }
}