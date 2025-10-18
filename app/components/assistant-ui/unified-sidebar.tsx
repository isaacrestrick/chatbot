import * as React from "react";
import { useState, useEffect } from "react";
import { MessagesSquare, FolderIcon, PlusIcon, ChevronRightIcon, FileIcon } from "lucide-react";
import { Link, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { ThreadList } from "~/components/assistant-ui/thread-list";
import BackButton from '../../ui_components/BackButton'

import type { ThreadSummary } from "./thread-list";
import type { Dispatch, SetStateAction } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

type UnifiedSidebarProps = React.ComponentProps<typeof Sidebar> & {
  chats: ThreadSummary[];
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  revalidator: { revalidate: () => void };
  chatHook: Pick<UseChatHelpers<any>, "stop" | "status">;
  // Memory-specific props
  tree?: FileNode[];
  selectedFile?: string | null;
  onFileSelect?: (path: string) => void;
  onCreateFile?: () => void;
};

function FileTreeNode({ node, onFileSelect, selectedFile }: {
  node: FileNode;
  onFileSelect?: (path: string) => void;
  selectedFile?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === 'folder') {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="w-full">
              <ChevronRightIcon
                className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}
              />
              <FolderIcon />
              <span>{node.name}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          {node.children && node.children.length > 0 && (
            <CollapsibleContent>
              <SidebarMenuSub>
                {node.children.map((child) => (
                  <SidebarMenuSubItem key={child.path}>
                    <FileTreeNode
                      node={child}
                      onFileSelect={onFileSelect}
                      selectedFile={selectedFile}
                    />
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          )}
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => onFileSelect?.(node.path)}
        isActive={selectedFile === node.path}
        className="w-full"
      >
        <FileIcon className="h-4 w-4" />
        <span>{node.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function UnifiedSidebar({
  chats,
  updateChats,
  revalidator,
  chatHook,
  tree,
  selectedFile,
  onFileSelect,
  onCreateFile,
  ...sidebarProps
}: UnifiedSidebarProps) {
  const location = useLocation()
  const isInChat = location.pathname.includes("chat")
  const isMemoriesView = location.pathname === '/memories'

  const goBackOrWelcome = () =>
    <div className="flex justify-center items-center">
      {isInChat ? <BackButton /> : <h1> Welcome! </h1>}
    </div>

  return (
    <Sidebar {...sidebarProps}>
      <SidebarHeader className="aui-sidebar-header border-b px-3 py-3">
        <div className="flex gap-2">
          <Link to="/" className="flex-1">
            <button className={`flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium transition-all ${!isMemoriesView ? 'bg-sidebar-accent hover:bg-sidebar-accent/90' : 'hover:bg-muted'}`}>
              <MessagesSquare className="size-4 shrink-0" />
              <span className="truncate">Chats</span>
            </button>
          </Link>
          <Link to="/memories" className="flex-1">
            <button className={`flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium transition-all ${isMemoriesView ? 'bg-sidebar-accent hover:bg-sidebar-accent/90' : 'hover:bg-muted'}`}>
              <FolderIcon className="size-4 shrink-0" />
              <span className="truncate">Memories</span>
            </button>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="aui-sidebar-content px-2">
        <div className={`transition-opacity duration-150 ${isMemoriesView ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}>
          {isMemoriesView && (
            <div className="flex flex-col items-stretch gap-1.5">
              <Button
                className="flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start hover:bg-muted data-active:bg-muted"
                variant="ghost"
                onClick={onCreateFile}
              >
                <PlusIcon />
                New File
              </Button>

              {tree && tree.length === 0 ? (
                <div className="text-sidebar-foreground/50 px-2 py-4 text-sm">
                  No files yet. Create one to get started.
                </div>
              ) : (
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {tree?.map((node) => (
                        <FileTreeNode
                          key={node.path}
                          node={node}
                          onFileSelect={onFileSelect}
                          selectedFile={selectedFile}
                        />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </div>
          )}
        </div>

        <div className={`transition-opacity duration-150 ${!isMemoriesView ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}>
          {!isMemoriesView && (
            <ThreadList
              chatHook={chatHook}
              chats={chats}
              updateChats={updateChats}
              revalidator={revalidator}
            />
          )}
        </div>
      </SidebarContent>

      <SidebarRail />

      {!isMemoriesView && (
        <SidebarFooter className="aui-sidebar-footer border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                {goBackOrWelcome()}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
