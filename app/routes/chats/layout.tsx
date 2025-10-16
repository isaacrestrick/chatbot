import {
  Outlet,
  useRevalidator,
  useRouteLoaderData,
  useLoaderData,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import { ThreadListSidebar } from "~/components/assistant-ui/threadlist-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useParams } from "react-router";
import { useMemo, useState } from "react";
import { normalizeChatMessages } from "~/lib/normalize-chat-messages";
import type { UIMessage } from "ai";

export async function loader({ request }: LoaderFunctionArgs) {
  const { auth } = await import("../../lib/auth.server");
  const { db } = await import("../../lib/db.server");
  const { chat } = await import("../../lib/schemas/chat-schema.server");
  const { eq } = await import("drizzle-orm");

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw redirect("/login");
  }
  // Using drizzle to select chat_id and title from chats for the current user, reversed order
  let chats = await db
    .select({
      chatId: chat.chatId,
      title: chat.title,
    })
    .from(chat)
    .where(eq(chat.userId, session.user.id))
    .orderBy(chat.updatedAt); // sort by updatedAt ascending (default)
  chats = chats.reverse(); // reverse the array to get descending order
  return { chats };
}

export default function ChatLayout() {
  const { id } = useParams();
  const chatListsObj = useLoaderData();
  const chatContentObj = useRouteLoaderData("chat") as
    | { chatContent?: UIMessage[] }
    | undefined;
  const revalidator = useRevalidator();

  const [chats, setChats] = useState(chatListsObj.chats);

  const initialMessages = useMemo(() => {
    if (!chatContentObj?.chatContent) {
      return undefined;
    }
    // Messages loaded from Supabase are already in correct UIMessage format
    // Only normalize if they appear to be in a legacy format
    const messages = Array.isArray(chatContentObj.chatContent)
      ? chatContentObj.chatContent
      : normalizeChatMessages(chatContentObj.chatContent).messages;
    return messages.length > 0 ? messages : undefined;
  }, [chatContentObj]);

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: "/ai",
    });
  }, [id]);

  const chat = useChat({
    id,
    messages: initialMessages,
    transport,
  });

  const runtime = useAISDKRuntime(chat);

  return (
    <div>
      <nav>{/* shared navigation */}</nav>

      <AssistantRuntimeProvider runtime={runtime}>
        <SidebarProvider>
          <div className="flex h-dvh w-full">
            <ThreadListSidebar
              chats={chats}
              onChatsChange={setChats}
              revalidator={revalidator}
              isStreaming={chat.isLoading}
              onBeforeSwitch={() => {
                if (chat.isLoading) {
                  chat.stop();
                }
              }}
            />
            <SidebarInset>
              <SidebarTrigger className="absolute top-4 left-4 z-50" />
              <Outlet context={{ chats, setChats }} />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </AssistantRuntimeProvider>

      <footer>{/* shared footer */}</footer>
    </div>
  );
}
