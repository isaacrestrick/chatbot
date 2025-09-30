import BackButton from '../ui_components/BackButton'
import { Thread } from '~/components/assistant-ui/thread'
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import type { Route } from "./+types/home";
import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
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
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/ai'
    })
  });
  const runtime = useChatRuntime({
    transport: new DefaultChatTransport({
      api: '/ai'
    })
  });
  if (true) {
    return <div className="h-full">
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-full">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  </div>
  }
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
              case 'tool-weather':
                return (
                  <pre key={`${message.id}-${i}`}>
                    {JSON.stringify(part, null, 2)}
                  </pre>
                );
            }
          })}
        </div>
      ))}
      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
      >
      <div className="fixed">
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-50 max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={e => setInput(e.currentTarget.value)}
        />
        <BackButton />
      </div>
      </form>
    </div>
  );
}