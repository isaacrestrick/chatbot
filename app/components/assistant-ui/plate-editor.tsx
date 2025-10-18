import { useEffect, useState, useRef } from 'react';

interface PlateEditorProps {
  filePath: string | null;
  content: string;
  onSave: (content: string) => void;
}

export function PlateEditor({ filePath, content, onSave }: PlateEditorProps) {
  const [editorContent, setEditorContent] = useState(content);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update editor content when file changes
  useEffect(() => {
    setEditorContent(content);
  }, [filePath, content]);

  // Auto-save on changes (debounced)
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditorContent(newContent);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(() => {
      onSave(newContent);
    }, 1000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!filePath) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">No file selected</p>
          <p className="text-sm">Select a file from the sidebar to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b px-4 py-3 bg-muted/50">
        <h2 className="text-sm font-medium">{filePath}</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <textarea
          className="h-full w-full resize-none bg-background px-4 py-3 font-mono text-sm focus:outline-none"
          value={editorContent}
          onChange={handleChange}
          placeholder="Start typing..."
        />
      </div>
    </div>
  );
}
