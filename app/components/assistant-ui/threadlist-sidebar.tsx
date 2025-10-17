import * as React from "react";
import { MessagesSquare } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar";
import { ThreadList, type ThreadSummary } from "~/components/assistant-ui/thread-list";
import BackButton from "../../ui_components/BackButton";
import { useLocation } from "react-router";
import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import { useAssistantApi } from "@assistant-ui/react";
import { useLatestRef } from "~/hooks/use-latest-ref";
import { stopActiveStream } from "~/lib/chat-stream-control";

type ThreadListSidebarProps = React.ComponentProps<typeof Sidebar> & {
  chatHook: Pick<UseChatHelpers<any>, "stop" | "status">;
  chats: ThreadSummary[];
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  revalidator: { revalidate: () => void };
  cancelStream?: () => void | Promise<void>;
};



export function ThreadListSidebar({
  chatHook,
  chats,
  updateChats,
  revalidator,
  cancelStream,
  ...props
}: ThreadListSidebarProps) {
  const location = useLocation()
  const isInChat = location.pathname.includes("chat")
  const assistantApi = useAssistantApi();
  const statusRef = useLatestRef(chatHook.status);
  const getStatus = useCallback(() => statusRef.current, [statusRef]);
  const stopCurrentStream = useCallback(() => stopActiveStream({
    stop: chatHook.stop,
    assistantApi,
    getStatus,
    cancelTransport: cancelStream,
  }), [chatHook.stop, assistantApi, getStatus, cancelStream]);
  const goBackOrWelcome = () =>
    <div className="flex justify-center items-center">
      {isInChat ? <BackButton beforeNavigate={stopCurrentStream} /> : <h1> Welcome! </h1>}
    </div>
    //console.log("down to thradlistsidebar", props.chats)

  return (
    <Sidebar {...props}>
      <SidebarHeader className="aui-sidebar-header mb-2 border-b">
        <div className="aui-sidebar-header-content flex items-center justify-between">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div>
                  <div className="aui-sidebar-header-icon-wrapper flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <MessagesSquare className="aui-sidebar-header-icon size-4" />
                  </div>
                  <div className="aui-sidebar-header-heading mr-6 flex flex-col gap-0.5 leading-none">
                    <span className="aui-sidebar-header-title font-semibold">
                      Researcher
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarHeader>
      <SidebarContent className="aui-sidebar-content px-2">
        <ThreadList
          chatHook={chatHook}
          chats={chats}
          updateChats={updateChats}
          revalidator={revalidator}
          assistantApi={assistantApi}
          cancelStream={cancelStream}
          getStatus={getStatus}
        />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter className="aui-sidebar-footer border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              {goBackOrWelcome()}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
