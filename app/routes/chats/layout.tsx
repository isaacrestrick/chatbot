import { Outlet, useRevalidator, useRouteLoaderData, useLoaderData, type LoaderFunctionArgs, redirect } from "react-router";
import { ThreadListSidebar } from "~/components/assistant-ui/threadlist-sidebar";
import { SidebarProvider } from "~/components/ui/sidebar";

import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useParams } from "react-router";
import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react'

import type { ThreadSummary } from "~/components/assistant-ui/thread-list";

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
  const [isTransitioning, setIsTransitioning] = useState(false)

  const chat = useChat({
    id: id,
    messages: chatContentObj?.chatContent?.length > 0
    ? chatContentObj.chatContent.filter((msg: any) => msg.id && msg.id !== "")
    : undefined,
    transport: new DefaultChatTransport({
        api: '/ai'
    })
  })

  const chatRef = useRef(chat);
  chatRef.current = chat;

  const prevIdRef = useRef(id);

  // Cleanup and transition when switching chats
  useEffect(() => {
    const prevId = prevIdRef.current;

    if (prevId && prevId !== id) {
      // Starting transition
      setIsTransitioning(true);

      if (import.meta.env.DEV) {
        console.log('Starting transition from', prevId, 'to', id);
      }

      // Stop the previous chat
      if (chatRef.current?.stop) {
        chatRef.current.stop();
      }

      // Wait a moment for cleanup to complete
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        if (import.meta.env.DEV) {
          console.log('Transition complete, ready for new chat:', id);
        }
      }, 100);

      prevIdRef.current = id;

      return () => clearTimeout(timer);
    } else {
      prevIdRef.current = id;
    }
  }, [id]);

  const outletContext: ChatLayoutContext = {
    chats,
    updateChats: setChats,
    chatHook: chat,
    revalidator,
  };


  return (
    <div>
      <nav>{/* shared navigation */}</nav>

      <SidebarProvider>
        <div className="flex h-dvh w-full">
          <ThreadListSidebar
            chatHook={chat}
            chats={chats}
            updateChats={setChats}
            revalidator={revalidator}
          />

          {/* Add sidebar trigger, location can be customized */}

          <div className="flex-1">
            {isTransitioning ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-muted-foreground">Switching chats...</div>
              </div>
            ) : (
              <Outlet context={outletContext}/>
            )}
          </div>

        </div>
      </SidebarProvider>

      <footer>{/* shared footer */}</footer>
    </div>
  );
}
