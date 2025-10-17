import { Outlet, useRevalidator, useRouteLoaderData, useLoaderData, type LoaderFunctionArgs, redirect } from "react-router";
import { ThreadListSidebar } from "~/components/assistant-ui/threadlist-sidebar";
import type { ThreadSummary } from "~/components/assistant-ui/thread-list";
import {
  SidebarProvider, 
  SidebarInset,
  SidebarTrigger 
} from "~/components/ui/sidebar";

import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { SafeChatTransport } from "~/lib/safe-chat-transport";
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useParams } from "react-router";
import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'

export type ChatLayoutContext = {
  chats: ThreadSummary[];
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  chatHook: UseChatHelpers<any>;
  revalidator: ReturnType<typeof useRevalidator>;
};

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("running the layout loader")
  const { auth } = await import("../../lib/auth.server");
    const { db } = await import("../../lib/db.server");
    //const { supabase } = await import("../../lib/supabase-client.server");
    const { chat } = await import("../../lib/schemas/chat-schema.server");
    const { eq } = await import("drizzle-orm");

    //console.log(id)
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      throw redirect("/login")
    }
    // Using drizzle to select chat_id and title from chats for the current user, reversed order
    let chats = await db
      .select({
        chatId: chat.chatId,
        title: chat.title
      })
      .from(chat)
      .where(eq(chat.userId, session.user.id))
      .orderBy(chat.updatedAt); // sort by updatedAt ascending (default)
    chats = chats.reverse(); // reverse the array to get descending order
    return { chats };
}

export default function ChatLayout() {
  const {id} = useParams()
  const chatListsObj = useLoaderData()
  const chatContentObj = useRouteLoaderData("chat")
  const revalidator = useRevalidator()
  
  const [chats, setChats] = useState(chatListsObj.chats)
  // useEffect(() => {
  //   if (id) {
  //     console.log("effect time")
  //     setChats( prev => [{title: "Chat: " + id, chatId: id}, ...prev])
  //   }
  // }, [])
  const chat = useChat({
    id: id,
    messages: chatContentObj?.chatContent?.length > 0 
    ? chatContentObj.chatContent.filter((msg: any) => msg.id && msg.id !== "")
    : undefined,
    transport: new SafeChatTransport({
        api: '/ai'
    })
  })
  const runtime = useAISDKRuntime(chat);

  const outletContext: ChatLayoutContext = {
    chats,
    updateChats: setChats,
    chatHook: chat,
    revalidator,
  };

  useEffect(() => {
    return () => {
      chat.stop();
    };
  }, [chat.id]);


  return (
    <div>
      <nav>{/* shared navigation */}</nav>

      <AssistantRuntimeProvider key={id ?? "__root"} runtime={runtime}>
      <SidebarProvider>
      <div className="flex h-dvh w-full">
        <ThreadListSidebar chatHook={chat} chats={chats} updateChats={setChats} revalidator={revalidator}/>
        <SidebarInset>
          {/* Add sidebar trigger, location can be customized */}
          {<SidebarTrigger className="absolute top-4 left-4 z-50" />}
          <Outlet context={outletContext}/>
        </SidebarInset>
      </div>
    </SidebarProvider>
    </AssistantRuntimeProvider>

      <footer>{/* shared footer */}</footer>
    </div>
  );
}
