
import { FileViewer } from '@/pages/generate/components/FileViewer';
import { Snippet } from '@/types/snippets';

interface CodeEditorProps {
  snippet: Snippet;
  selectedCode: string | null;
  onCodeChange: (content: string) => void;
}

export function CodeEditor({ snippet, selectedCode, onCodeChange }: CodeEditorProps) {
  return (
    <div className="rounded-lg border">
      <FileViewer
        selectedFile={{
          type: 'file',
          name: snippet.title,
          path: snippet.title,
          url: '',
          extension: snippet.language || 'py',
        }}
        fileContent={selectedCode || snippet.code_content}
        selectedDirectory={null}
        isCreatingSnippets={false}
        onCreateSnippet={() => {}}
        onCreateDirectorySnippets={() => {}}
        onContentChange={onCodeChange}
      />
    </div>
  );
}
