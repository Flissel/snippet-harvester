
import { FileCode2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileNode, DirectoryNode, collectFilesFromDirectory } from '../types';

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
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {selectedFile 
            ? `File: ${selectedFile.name}` 
            : selectedDirectory 
              ? `Directory: ${selectedDirectory.name}`
              : 'Select a file or directory'}
        </h2>
        {selectedFile && fileContent && (
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
            <h3 className="font-medium">Python Files in Directory:</h3>
            <div className="space-y-2">
              {collectFilesFromDirectory(selectedDirectory).map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 border rounded-md"
                >
                  <FileCode2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{file.path}</span>
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
