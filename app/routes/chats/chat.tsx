import { Thread } from "~/components/assistant-ui/thread";

import { useParams, useLoaderData } from "react-router";

import type { Route } from "./+types/home";
import { redirect, type LoaderFunctionArgs } from "react-router";
import { normalizeChatMessages } from "~/lib/normalize-chat-messages";
import type { UIMessage } from "ai";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chat page" },
    { name: "description", content: "This is the chat page" },
  ];
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { auth } = await import("../../lib/auth.server");
  const { db } = await import("../../lib/db.server");
  const { supabase } = await import("../../lib/supabase-client.server");
  const { chat } = await import("../../lib/schemas/chat-schema.server");
  const { eq } = await import("drizzle-orm");

  const { id } = params;
  if (!id) {
    return null;
  }
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw redirect("/login");
  }
  console.log("user id", session.user.id);
  console.log("session validated. loader has chat id: ", id);
  const [chatRow] = await db
    .insert(chat)
    .values({
      chatId: id,
      userId: session.user.id,
      projectId: null,
      title: "Chat: " + id,
      messagesFilePath: id + ".json",
    })
    .onConflictDoNothing({
      target: chat.chatId,
    })
    .returning();

  let chatContent: UIMessage[] = [];

  if (!chatRow) {
    const { data, error: downloadError } = await supabase.storage
      .from("chats")
      .download(id + ".json");

    if (downloadError) {
      console.error("Error downloading chat file:", downloadError);
    } else if (data) {
      try {
        const parsed = JSON.parse(await data.text());
        // Messages loaded from Supabase should already be in valid UIMessage format
        // Only normalize if they're not a valid array (legacy format)
        const { messages, didNormalize } = normalizeChatMessages(parsed);
        chatContent = messages;

        if (didNormalize) {
          const { error: uploadError } = await supabase.storage
            .from("chats")
            .upload(id + ".json", JSON.stringify(messages), {
              contentType: "application/json",
              upsert: true,
            });
          if (uploadError) {
            console.error("Failed to write normalized chat history:", uploadError);
          }
        }
      } catch (e) {
        console.error("Error parsing chat file JSON:", e);
      }
    }
  } else {
    const emptyHistory: UIMessage[] = [];
    const { error } = await supabase.storage
      .from("chats")
      .upload(id + ".json", JSON.stringify(emptyHistory), {
        contentType: "application/json",
        upsert: true,
      });
    if (error) {
      console.error("Error creating chat file:", error);
    }
    chatContent = emptyHistory;
  }

  return { chatContent };
}

export function clientLoader({
  serverLoader,
}: {
  serverLoader: () => Promise<{ chatContent: UIMessage[] }>;
}) {
  return serverLoader();
}

clientLoader.hydrate = true;

export default function Chat() {
  return (
    <div className="h-full">
      <div className="h-full">
        <Thread />
      </div>
    </div>
  );
}
