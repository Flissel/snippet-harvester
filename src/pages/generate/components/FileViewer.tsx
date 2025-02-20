
import { FileCode2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileNode, DirectoryNode, collectFilesFromDirectory } from '../types';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { JupyterViewer } from './JupyterViewer';

interface FileViewerProps {
  selectedFile: FileNode | null;
  selectedDirectory: DirectoryNode | null;
  fileContent: string | null;
  isCreatingSnippets: boolean;
  onCreateSnippet: () => void;
  onCreateDirectorySnippets: () => void;
  onContentChange?: (content: string) => void;
}

export function FileViewer({
  selectedFile,
  selectedDirectory,
  fileContent,
  isCreatingSnippets,
  onCreateSnippet,
  onCreateDirectorySnippets,
  onContentChange,
}: FileViewerProps) {
  const getFileIcon = (extension?: string) => {
    return <FileCode2 className="h-4 w-4 text-blue-500" />;
  };

  const getFileTypeBadge = (extension?: string) => {
    if (!extension) return null;
    
    return (
      <Badge className="ml-2 bg-blue-500">.{extension}</Badge>
    );
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onContentChange) {
      onContentChange(e.target.value);
    }
  };

  const renderFileContent = () => {
    if (!fileContent) return null;

    if (selectedFile?.extension === 'ipynb') {
      return <JupyterViewer content={fileContent} />;
    }

    return (
      <Textarea
        value={fileContent}
        onChange={handleContentChange}
        className="font-mono text-sm w-full min-h-screen resize-none border-0 focus-visible:ring-0"
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          {selectedFile ? (
            <>
              <span className="flex items-center">
                {getFileIcon(selectedFile.extension)}
                <span className="ml-2">File: {selectedFile.name}</span>
                {getFileTypeBadge(selectedFile.extension)}
              </span>
            </>
          ) : selectedDirectory ? (
            <>Directory: {selectedDirectory.name}</>
          ) : (
            'Select a file or directory'
          )}
        </h2>
        <div className="flex gap-2">
          {selectedFile && fileContent && (
            <Button 
              onClick={onCreateSnippet}
              disabled={isCreatingSnippets}
            >
              {isCreatingSnippets ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Snippet...
                </>
              ) : (
                'Create Snippet'
              )}
            </Button>
          )}
          {selectedDirectory && (
            <Button 
              onClick={onCreateDirectorySnippets}
              disabled={isCreatingSnippets}
            >
              {isCreatingSnippets ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Snippets...
                </>
              ) : (
                'Create Directory Snippets'
              )}
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 border rounded-md overflow-hidden">
        {fileContent ? (
          <div className="h-full">
            {renderFileContent()}
          </div>
        ) : selectedDirectory ? (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <h3 className="font-medium">Files in Directory:</h3>
              <div className="space-y-2">
                {collectFilesFromDirectory(selectedDirectory, []).map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    {getFileIcon(file.extension)}
                    <span className="text-sm">{file.path}</span>
                    {getFileTypeBadge(file.extension)}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground p-4">
            Select a file or directory to view
          </div>
        )}
      </div>
    </div>
  );
}
