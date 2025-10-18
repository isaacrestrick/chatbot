import { Outlet, useRevalidator, useRouteLoaderData, useLoaderData, useNavigation, useLocation, type LoaderFunctionArgs, redirect } from "react-router";
import { UnifiedSidebar } from "~/components/assistant-ui/unified-sidebar";
import { SidebarProvider } from "~/components/ui/sidebar";

import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useParams } from "react-router";
import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react'

import type { ThreadSummary } from "~/components/assistant-ui/thread-list";

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export type ChatLayoutContext = {
  chats: ThreadSummary[];
  updateChats: Dispatch<SetStateAction<ThreadSummary[]>>;
  chatHook: UseChatHelpers<any>;
  revalidator: ReturnType<typeof useRevalidator>;
  // Memory-specific context
  tree?: FileNode[];
  setTree?: Dispatch<SetStateAction<FileNode[]>>;
  selectedFile?: string | null;
  setSelectedFile?: Dispatch<SetStateAction<string | null>>;
};

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("running the layout loader")
  const { auth } = await import("../../lib/auth.server");
    const { db } = await import("../../lib/db.server");
    //const { supabase } = await import("../../lib/supabase-client.server");
    const { chat } = await import("../../lib/schemas/chat-schema.server");
    const { eq } = await import("drizzle-orm");

    //console.log(id)
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      throw redirect("/login")
    }
    // Using drizzle to select chat_id and title from chats for the current user, reversed order
    let chats = await db
      .select({
        chatId: chat.chatId,
        title: chat.title
      })
      .from(chat)
      .where(eq(chat.userId, session.user.id))
      .orderBy(chat.updatedAt); // sort by updatedAt ascending (default)
    chats = chats.reverse(); // reverse the array to get descending order
    return { chats };
}

export default function ChatLayout() {
  const {id} = useParams()
  const location = useLocation()
  const chatListsObj = useLoaderData()
  const chatContentObj = useRouteLoaderData("chat")
  const revalidator = useRevalidator()
  const navigation = useNavigation()

  const [chats, setChats] = useState(chatListsObj.chats)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Memory state
  const [tree, setTree] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  const isMemoriesView = location.pathname === '/memories'

  // Track last chat ID in localStorage
  useEffect(() => {
    if (id) {
      localStorage.setItem('lastChatId', id);
    }
  }, [id]);

  const lastChatId = typeof window !== 'undefined' ? localStorage.getItem('lastChatId') : null;

  const chat = useChat({
    id: id,
    messages: chatContentObj?.chatContent?.length > 0
    ? chatContentObj.chatContent.filter((msg: any) => msg.id && msg.id !== "")
    : undefined,
    transport: new DefaultChatTransport({
        api: '/ai'
    })
  })

  const chatRef = useRef(chat);
  chatRef.current = chat;

  const prevIdRef = useRef(id);

  // Trigger fade-in on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup and transition when switching chats
  useEffect(() => {
    const prevId = prevIdRef.current;

    if (prevId && prevId !== id) {
      // Starting transition
      setIsTransitioning(true);

      if (import.meta.env.DEV) {
        console.log('Starting transition from', prevId, 'to', id);
      }

      // Stop the previous chat
      if (chatRef.current?.stop) {
        chatRef.current.stop();
      }

      // Wait a moment for cleanup to complete
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        if (import.meta.env.DEV) {
          console.log('Transition complete, ready for new chat:', id);
        }
      }, 100);

      prevIdRef.current = id;

      return () => clearTimeout(timer);
    } else {
      prevIdRef.current = id;
    }
  }, [id]);

  // File handlers
  const handleFileSelect = (path: string) => {
    setSelectedFile(path);
  };

  const handleCreateFile = () => {
    setNewFileName('');
    setShowNewFileDialog(true);
  };

  const confirmCreateFile = async () => {
    if (!newFileName.trim()) return;

    try {
      await fetch('/api/memories/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newFileName, content: '' }),
      });

      // Reload tree
      const response = await fetch('/api/memories/tree');
      const data = await response.json();
      setTree(data.tree || []);
      setSelectedFile(newFileName);
    } catch (error) {
      console.error('Error creating file:', error);
    } finally {
      setShowNewFileDialog(false);
      setNewFileName('');
    }
  };

  const handleDeleteFile = (path: string) => {
    setFileToDelete(path);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      await fetch('/api/memories/file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: fileToDelete }),
      });

      // Reload tree
      const response = await fetch('/api/memories/tree');
      const data = await response.json();
      setTree(data.tree || []);

      // Clear selected file if it was deleted
      if (selectedFile === fileToDelete) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setFileToDelete(null);
    }
  };

  const outletContext: ChatLayoutContext = {
    chats,
    updateChats: setChats,
    chatHook: chat,
    revalidator,
    tree,
    setTree,
    selectedFile,
    setSelectedFile,
  };


  return (
    <div>
      <nav>{/* shared navigation */}</nav>

      <SidebarProvider>
        <div className="flex h-dvh w-full">
          <UnifiedSidebar
            chatHook={chat}
            chats={chats}
            updateChats={setChats}
            revalidator={revalidator}
            tree={tree}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            fileToDelete={fileToDelete}
            onCancelDelete={() => setFileToDelete(null)}
            onConfirmDelete={confirmDeleteFile}
            showNewFileDialog={showNewFileDialog}
            newFileName={newFileName}
            onNewFileNameChange={setNewFileName}
            onCancelNewFile={() => setShowNewFileDialog(false)}
            onConfirmNewFile={confirmCreateFile}
            lastChatId={lastChatId}
          />

          {/* Add sidebar trigger, location can be customized */}

          <div className={`flex-1 transition-opacity duration-200 ${mounted && navigation.state !== "loading" ? 'opacity-100' : 'opacity-0'}`}>
            {isTransitioning ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-muted-foreground">Switching chats...</div>
              </div>
            ) : (
              <Outlet context={outletContext}/>
            )}
          </div>

        </div>
      </SidebarProvider>

      <footer>{/* shared footer */}</footer>
    </div>
  );
}
