import { Thread } from '~/components/assistant-ui/thread'

import { useParams, useSubmit, useLoaderData, useOutletContext } from 'react-router';

import type { Route } from "./+types/home";
import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import type { ChatLayoutContext } from "./layout";
import { useEffect, useRef } from 'react';


export function meta({}: Route.MetaArgs) {
    return [
      { title: "Researcher" },
      { name: "description", content: "AI Research Chat" },
    ];
  }
  
  export async function loader({ request, params }: LoaderFunctionArgs) {
    const { auth } = await import("../../lib/auth.server");
    const { db } = await import("../../lib/db.server");
    const { supabase } = await import("../../lib/supabase-client.server");
    const { chat } = await import("../../lib/schemas/chat-schema.server");
    const { eq } = await import("drizzle-orm");

    const {id} = params
    if (!id) {
      return null
    }
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      throw redirect("/login")
    }
    console.log("user id", session.user.id)
    console.log("session validated. loader has chat id: ", id)
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
    
    let chatContent = null;
    
    // it is already there
    if (!chatRow) {
      const { data, error: downloadError } = await supabase.storage
      .from("chats")
      .download(id + ".json");
  
      if (downloadError) {
        console.error("Error downloading chat file:", downloadError);
        chatContent = {};
      } else if (data) {
        const text = await data.text();
        try {
          chatContent = JSON.parse(text);
        } catch (e) {
          console.error("Error parsing chat file JSON:", e);
          chatContent = {};
        }
      }
  
    } else {
      const { error } = await supabase.storage
        .from("chats")
        .upload(id + ".json", JSON.stringify({}), {
          contentType: "application/json",
          upsert: true
      });
      chatContent = {};

    }


  // Optionally, return the chat content for use in the component
  return { chatContent };
  }
  
  export async function action({ request }: ActionFunctionArgs) {
    const { auth } = await import("../../lib/auth.server");
    console.log("chat action has the id")
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      throw redirect("/login")
    }
  }

  export function clientLoader({ serverLoader }: any) {
    return serverLoader()
  }
  
  
  clientLoader.hydrate = true
  

export default function Chat() {
  const { id } = useParams();
  const submit = useSubmit();
  const { chatContent } = useLoaderData()
  const { chatHook } = useOutletContext<ChatLayoutContext>();

  const runtime = useAISDKRuntime(chatHook);

  // Cleanup only when component unmounts (switching away from this chat)
  useEffect(() => {
    return () => {
      // Component is unmounting - stop any active streams
      if (chatHook?.stop) {
        chatHook.stop();
      }

      if (import.meta.env.DEV) {
        console.log('Chat component unmounting, cleaning up:', id);
      }
    };
  }, []); // Empty deps - only run on mount/unmount

  return (
    <AssistantRuntimeProvider key={id ?? "__root"} runtime={runtime}>
      <div className="h-full">
        <div className="h-full">
          <Thread />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}

