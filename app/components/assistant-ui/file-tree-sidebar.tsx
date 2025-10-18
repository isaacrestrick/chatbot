import { useState } from 'react';
import { Link } from 'react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from '~/components/ui/sidebar';
import { Button } from '~/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import { ChevronRightIcon, FileIcon, FolderIcon, PlusIcon, MessagesSquare } from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileTreeSidebarProps {
  tree: FileNode[];
  selectedFile?: string | null;
  onFileSelect: (path: string) => void;
  onCreateFile: () => void;
}

function FileTreeNode({ node, onFileSelect, selectedFile }: {
  node: FileNode;
  onFileSelect: (path: string) => void;
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
        onClick={() => onFileSelect(node.path)}
        isActive={selectedFile === node.path}
        className="w-full"
      >
        <FileIcon className="h-4 w-4" />
        <span>{node.name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function FileTreeSidebar({
  tree,
  selectedFile,
  onFileSelect,
  onCreateFile,
}: FileTreeSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="aui-sidebar-header border-b px-3 py-3">
        <div className="flex gap-2">
          <Link to="/" className="flex-1">
            <button className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium transition-all hover:bg-muted">
              <MessagesSquare className="size-4 shrink-0" />
              <span className="truncate">Chats</span>
            </button>
          </Link>
          <Link to="/memories" className="flex-1">
            <button className="flex w-full items-center justify-center gap-1.5 rounded-md bg-sidebar-accent px-2 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent/90">
              <FolderIcon className="size-4 shrink-0" />
              <span className="truncate">Memories</span>
            </button>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="aui-sidebar-content px-2">
        <div className="flex flex-col items-stretch gap-1.5">
          <Button
            className="flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start hover:bg-muted data-active:bg-muted"
            variant="ghost"
            onClick={onCreateFile}
          >
            <PlusIcon />
            New File
          </Button>

          {tree.length === 0 ? (
            <div className="text-sidebar-foreground/50 px-2 py-4 text-sm">
              No files yet. Create one to get started.
            </div>
          ) : (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tree.map((node) => (
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
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
