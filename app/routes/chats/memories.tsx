import { useState, useEffect, useCallback } from 'react';
import { useLoaderData, useNavigation } from 'react-router';
import type { LoaderFunctionArgs, Route } from 'react-router';
import { redirect } from 'react-router';
import { SidebarProvider } from '~/components/ui/sidebar';
import { FileTreeSidebar } from '~/components/assistant-ui/file-tree-sidebar';
import { PlateEditor } from '~/components/assistant-ui/plate-editor';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Researcher" },
    { name: "description", content: "AI Memory Management" },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { auth } = await import("../../lib/auth.server");

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw redirect("/login");
  }

  return { userId: session.user.id };
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export default function Memories() {
  const { userId } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load file tree
  useEffect(() => {
    async function loadTree() {
      try {
        const response = await fetch('/api/memories/tree');
        const data = await response.json();
        setTree(data.tree || []);
      } catch (error) {
        console.error('Error loading file tree:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTree();
  }, []);

  // Load file content when file is selected
  useEffect(() => {
    if (!selectedFile) {
      setFileContent('');
      return;
    }

    async function loadFile() {
      try {
        const response = await fetch(`/api/memories/file?path=${encodeURIComponent(selectedFile)}`);
        const data = await response.json();
        setFileContent(data.content || '');
      } catch (error) {
        console.error('Error loading file:', error);
        setFileContent('');
      }
    }
    loadFile();
  }, [selectedFile]);

  // Save file content
  const handleSave = useCallback(
    async (content: string) => {
      if (!selectedFile) return;

      try {
        await fetch('/api/memories/file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: selectedFile, content }),
        });
      } catch (error) {
        console.error('Error saving file:', error);
      }
    },
    [selectedFile]
  );

  // Create new file
  const handleCreateFile = useCallback(async () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    try {
      await fetch('/api/memories/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: fileName, content: '' }),
      });

      // Reload tree
      const response = await fetch('/api/memories/tree');
      const data = await response.json();
      setTree(data.tree || []);
      setSelectedFile(fileName);
    } catch (error) {
      console.error('Error creating file:', error);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <FileTreeSidebar
          tree={tree}
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
          onCreateFile={handleCreateFile}
        />
        <main className={`flex-1 transition-opacity duration-200 ${navigation.state === "loading" ? 'opacity-0' : 'opacity-100'}`}>
          <PlateEditor filePath={selectedFile} content={fileContent} onSave={handleSave} />
        </main>
      </div>
    </SidebarProvider>
  );
}
