import { Outlet, useRevalidator, useRouteLoaderData, useLoaderData, type LoaderFunctionArgs, redirect } from "react-router";
import { ThreadListSidebar } from "~/components/assistant-ui/threadlist-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger
} from "~/components/ui/sidebar";

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useParams } from "react-router";
import { useState, useEffect } from 'react'

export async function loader({ request }: LoaderFunctionArgs) {
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

  const chat = useChat({
    id: id,
    initialMessages: chatContentObj?.chatContent?.length > 0
    ? chatContentObj.chatContent.filter((msg: { id?: string }) => msg.id && msg.id !== "")
    : undefined,
    transport: new DefaultChatTransport({
        api: '/ai'
    })
  })

  const runtime = useAISDKRuntime(chat);


  return (
    <div>
      <nav>{/* shared navigation */}</nav>

      <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
      <div className="flex h-dvh w-full">
        <ThreadListSidebar chats={chats} onChatsChange={setChats} revalidator={revalidator}/>
        <SidebarInset>
          {/* Add sidebar trigger, location can be customized */}
          {<SidebarTrigger className="absolute top-4 left-4 z-50" />}
          <Outlet context={ {chats, setChats} }/>
        </SidebarInset>
      </div>
    </SidebarProvider>
    </AssistantRuntimeProvider>

      <footer>{/* shared footer */}</footer>
    </div>
  );
}