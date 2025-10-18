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
} from '~/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import { ChevronRightIcon, FileIcon, FolderIcon, PlusIcon, MessageSquareIcon } from 'lucide-react';

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
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-2 py-3">
          <h2 className="text-lg font-semibold">Memories</h2>
          <div className="flex gap-1">
            <Link to="/">
              <SidebarMenuButton size="sm" tooltip="Back to Chats">
                <MessageSquareIcon className="h-4 w-4" />
              </SidebarMenuButton>
            </Link>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Files</span>
            <button
              onClick={onCreateFile}
              className="hover:bg-sidebar-accent rounded p-1"
              title="New File"
            >
              <PlusIcon className="h-3 w-3" />
            </button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tree.length === 0 ? (
                <div className="text-sidebar-foreground/50 px-2 py-4 text-sm">
                  No files yet. Create one to get started.
                </div>
              ) : (
                tree.map((node) => (
                  <FileTreeNode
                    key={node.path}
                    node={node}
                    onFileSelect={onFileSelect}
                    selectedFile={selectedFile}
                  />
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
