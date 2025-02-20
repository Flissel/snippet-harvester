import { ChevronRight } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TreeItem } from './TreeItem';
import { FileTypeFilter } from './FileTypeFilter';
import { DirectoryNode, FileNode, RepositoryTree } from '../types';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

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
  const [currentRoot, setCurrentRoot] = useState<DirectoryNode | null>(filteredTreeStructure);
  const [pathHistory, setPathHistory] = useState<DirectoryNode[]>([]);

  useEffect(() => {
    setCurrentRoot(filteredTreeStructure);
    setPathHistory(filteredTreeStructure ? [filteredTreeStructure] : []);
  }, [filteredTreeStructure]);

  const handleSetRoot = (directory: DirectoryNode) => {
    setCurrentRoot(directory);
    setPathHistory(prev => [...prev, directory]);
  };

  const handleNavigateBack = (index: number) => {
    const newHistory = pathHistory.slice(0, index + 1);
    setPathHistory(newHistory);
    setCurrentRoot(newHistory[newHistory.length - 1]);
  };

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

      {pathHistory.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto py-2">
          {pathHistory.map((dir, index) => (
            <div key={dir.path} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                onClick={() => handleNavigateBack(index)}
              >
                {dir.name || 'Root'}
              </Button>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : currentRoot ? (
        <ScrollArea className="flex-1 border rounded-md p-4">
          <TreeItem 
            node={currentRoot} 
            level={0} 
            onFileSelect={onFileSelect}
            onDirectorySelect={onDirectorySelect}
            onSetRoot={handleSetRoot}
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
