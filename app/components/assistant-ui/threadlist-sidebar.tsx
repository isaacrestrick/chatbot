import * as React from "react";
import { MessagesSquare, FolderIcon } from "lucide-react";
import { Link } from "react-router";
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
import { ThreadList } from "~/components/assistant-ui/thread-list";
import BackButton from '../../ui_components/BackButton'
import { useLocation } from 'react-router';

import type { ThreadSummary } from "./thread-list";
import type { Dispatch, SetStateAction } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";

type ThreadListSidebarProps = React.ComponentProps<typeof Sidebar> & {
  chats: ThreadSummary[];
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  revalidator: { revalidate: () => void };
  chatHook: Pick<UseChatHelpers<any>, "stop" | "status">;
};

export function ThreadListSidebar({
  chats,
  updateChats,
  revalidator,
  chatHook,
  ...sidebarProps
}: ThreadListSidebarProps) {
  const location = useLocation()
  const isInChat = location.pathname.includes("chat")
  const goBackOrWelcome = () => 
    <div className="flex justify-center items-center">
      {isInChat ? <BackButton /> : <h1> Welcome! </h1>}
    </div>
    //console.log("down to thradlistsidebar", props.chats)

  return (
    <Sidebar {...sidebarProps}>
      <SidebarHeader className="aui-sidebar-header border-b px-3 py-3">
        <div className="flex gap-2">
          <Link to="/" className="flex-1">
            <button className="flex w-full items-center justify-center gap-1.5 rounded-md bg-sidebar-accent px-2 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent/90">
              <MessagesSquare className="size-4 shrink-0" />
              <span className="truncate">Chats</span>
            </button>
          </Link>
          <Link to="/memories" className="flex-1">
            <button className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium transition-all hover:bg-muted">
              <FolderIcon className="size-4 shrink-0" />
              <span className="truncate">Memories</span>
            </button>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="aui-sidebar-content px-2">
        <ThreadList
          chatHook={chatHook}
          chats={chats}
          updateChats={updateChats}
          revalidator={revalidator}
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
