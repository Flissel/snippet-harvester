
import { FileCode2, Loader2, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileNode, DirectoryNode, collectFilesFromDirectory } from '../types';
import { Badge } from '@/components/ui/badge';

interface FileViewerProps {
  selectedFile: FileNode | null;
  selectedDirectory: DirectoryNode | null;
  fileContent: string | null;
  isCreatingSnippets: boolean;
  onCreateSnippet: () => void;
  onCreateDirectorySnippets: () => void;
}

export function FileViewer({
  selectedFile,
  selectedDirectory,
  fileContent,
  isCreatingSnippets,
  onCreateSnippet,
  onCreateDirectorySnippets,
}: FileViewerProps) {
  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'yaml':
      case 'toml':
      case 'requirements':
      case 'setup':
        return <FileJson className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileCode2 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getFileTypeBadge = (fileType?: string) => {
    if (!fileType) return null;
    
    const colors: Record<string, string> = {
      python: 'bg-blue-500',
      yaml: 'bg-yellow-500',
      toml: 'bg-green-500',
      requirements: 'bg-purple-500',
      setup: 'bg-pink-500'
    };

    return (
      <Badge className={`ml-2 ${colors[fileType] || 'bg-gray-500'}`}>
        {fileType}
      </Badge>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          {selectedFile ? (
            <>
              <span className="flex items-center">
                {getFileIcon(selectedFile.fileType)}
                <span className="ml-2">File: {selectedFile.name}</span>
                {getFileTypeBadge(selectedFile.fileType)}
              </span>
            </>
          ) : selectedDirectory ? (
            <>Directory: {selectedDirectory.name}</>
          ) : (
            'Select a file or directory'
          )}
        </h2>
        {selectedFile?.fileType === 'python' && fileContent && (
          <Button onClick={onCreateSnippet}>
            Create Snippet
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
      <ScrollArea className="h-[500px] border rounded-md">
        {fileContent ? (
          <pre className="p-4 font-mono text-sm whitespace-pre-wrap">{fileContent}</pre>
        ) : selectedDirectory ? (
          <div className="p-4 space-y-4">
            <h3 className="font-medium">Files in Directory:</h3>
            <div className="space-y-2">
              {collectFilesFromDirectory(selectedDirectory).map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 border rounded-md"
                >
                  {getFileIcon(file.fileType)}
                  <span className="text-sm">{file.path}</span>
                  {getFileTypeBadge(file.fileType)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a file or directory to view
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
