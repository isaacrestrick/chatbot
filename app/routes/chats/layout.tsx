import { Outlet } from "react-router";
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


export default function ChatLayout() {
const chat = useChat({
    transport: new DefaultChatTransport({
        api: '/ai'
    })
    });
    const runtime = useAISDKRuntime(chat);
  return (
    <div>
      <nav>{/* shared navigation */}</nav>

      <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
      <div className="flex h-dvh w-full">
        <ThreadListSidebar />
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