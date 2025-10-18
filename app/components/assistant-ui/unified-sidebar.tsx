import * as React from "react";
import { useState, useEffect } from "react";
import { MessagesSquare, FolderIcon, PlusIcon, ChevronRightIcon, FileIcon, Trash2 } from "lucide-react";
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
import { TooltipIconButton } from "~/components/assistant-ui/tooltip-icon-button";
import { ThreadList } from "~/components/assistant-ui/thread-list";
import BackButton from '../../ui_components/BackButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

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
  onDeleteFile?: (path: string) => void;
  fileToDelete?: string | null;
  onCancelDelete?: () => void;
  onConfirmDelete?: () => void;
};

function FileTreeNode({ node, onFileSelect, selectedFile, onDeleteFile }: {
  node: FileNode;
  onFileSelect?: (path: string) => void;
  selectedFile?: string | null;
  onDeleteFile?: (path: string) => void;
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
                      onDeleteFile={onDeleteFile}
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
      <div className="flex items-center gap-2 w-full">
        <SidebarMenuButton
          onClick={() => onFileSelect?.(node.path)}
          isActive={selectedFile === node.path}
          className="flex-1"
        >
          <FileIcon className="h-4 w-4" />
          <span>{node.name}</span>
        </SidebarMenuButton>
        <TooltipIconButton
          className="size-4 p-0 text-foreground hover:text-destructive"
          variant="ghost"
          tooltip="Delete file"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteFile?.(node.path);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </TooltipIconButton>
      </div>
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
  onDeleteFile,
  fileToDelete,
  onCancelDelete,
  onConfirmDelete,
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
    <>
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
                          onDeleteFile={onDeleteFile}
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

    <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && onCancelDelete?.()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete File</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{fileToDelete}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancelDelete}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
