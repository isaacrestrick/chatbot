import { useState, useEffect, useCallback } from 'react';
import { useLoaderData, useNavigation, useOutletContext } from 'react-router';
import type { LoaderFunctionArgs, Route } from 'react-router';
import { redirect } from 'react-router';
import { PlateEditor } from '~/components/assistant-ui/plate-editor';
import type { ChatLayoutContext } from "./layout";

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

export default function Memories() {
  const { userId } = useLoaderData<typeof loader>();
  const { tree, setTree, selectedFile } = useOutletContext<ChatLayoutContext>();
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load file tree
  useEffect(() => {
    async function loadTree() {
      try {
        const response = await fetch('/api/memories/tree');
        const data = await response.json();
        setTree?.(data.tree || []);
      } catch (error) {
        console.error('Error loading file tree:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTree();
  }, [setTree]);

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


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <PlateEditor filePath={selectedFile} content={fileContent} onSave={handleSave} />
    </div>
  );
}
