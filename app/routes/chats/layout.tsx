import { Outlet, useRouteLoaderData, useLoaderData, type LoaderFunctionArgs, redirect } from "react-router";
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
    // turn this into drizzle:
    // select chat_id, title from chats
    // Using drizzle to select chat_id and title from chats for the current user
    const chats = await db
      .select({
        chatId: chat.chatId,
        title: chat.title
      })
      .from(chat)
      .where(eq(chat.userId, session.user.id));
    //console.log(chats)
    return { chats };
}

export default function ChatLayout() {
  const {id} = useParams()
  const chatListsObj = useLoaderData()
  const chatContentObj = id ? useRouteLoaderData("chat") : null

  console.log("obj: ", chatContentObj)
  const chat = useChat({
    id: id,
    messages: chatContentObj?.chatContent?.length > 0 
    ? chatContentObj.chatContent.filter((msg: any) => msg.id && msg.id !== "")
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
        <ThreadListSidebar chats={chatListsObj.chats}/>
        <SidebarInset>
          {/* Add sidebar trigger, location can be customized */}
          {<SidebarTrigger className="absolute top-4 left-4 z-50" />}
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
    </AssistantRuntimeProvider>

      <footer>{/* shared footer */}</footer>
    </div>
  );
}