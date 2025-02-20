
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TreeItem } from './TreeItem';
import { FileTypeFilter } from './FileTypeFilter';
import { DirectoryNode, FileNode, RepositoryTree } from '../types';

interface RepositoryBrowserProps {
  treeData: RepositoryTree | null;
  isLoading: boolean;
  selectedFileTypes: string[];
  filteredTreeStructure: DirectoryNode | null;
  onFileSelect: (file: FileNode) => void;
  onDirectorySelect: (directory: DirectoryNode) => void;
  onFileTypeChange: (value: string) => void;
}

export function RepositoryBrowser({
  treeData,
  isLoading,
  selectedFileTypes,
  filteredTreeStructure,
  onFileSelect,
  onDirectorySelect,
  onFileTypeChange
}: RepositoryBrowserProps) {
  // Find the root directory that matches the subdirectory path
  const findSubdirectoryContent = (node: DirectoryNode): DirectoryNode | null => {
    if (node.children.length === 0) return null;
    
    // If the root node only has one directory and no files, traverse into it
    if (node.children.length === 1 && node.children[0].type === 'directory') {
      return findSubdirectoryContent(node.children[0] as DirectoryNode);
    }
    
    return node;
  };

  const subdirectoryContent = filteredTreeStructure 
    ? findSubdirectoryContent(filteredTreeStructure)
    : null;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Repository Files</h2>
        {treeData?.available_file_types && treeData.available_file_types.length > 0 && (
          <FileTypeFilter
            availableTypes={treeData.available_file_types}
            selectedTypes={selectedFileTypes}
            onTypeChange={onFileTypeChange}
          />
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : subdirectoryContent ? (
        <ScrollArea className="flex-1 border rounded-md p-4">
          <TreeItem 
            node={subdirectoryContent} 
            level={0} 
            onFileSelect={onFileSelect}
            onDirectorySelect={onDirectorySelect}
          />
        </ScrollArea>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          No repository scanned yet. Enter a GitHub URL above to start.
        </p>
      )}
    </div>
  );
}
