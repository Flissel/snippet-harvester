
import { useState } from 'react';
import { FileCode2, ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileNode, DirectoryNode } from '../types';
import { Badge } from '@/components/ui/badge';

interface TreeItemProps {
  node: FileNode | DirectoryNode;
  level: number;
  onFileSelect: (file: FileNode) => void;
  onDirectorySelect: (directory: DirectoryNode) => void;
  onSetRoot: (directory: DirectoryNode) => void;
}

export function TreeItem({ node, level, onFileSelect, onDirectorySelect, onSetRoot }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const paddingLeft = `${level * 1.5}rem`;

  const getFileIcon = (extension?: string) => {
    return <FileCode2 className="h-4 w-4 text-blue-500" />;
  };

  const getFileTypeBadge = (extension?: string) => {
    if (!extension) return null;
    
    return (
      <Badge className="ml-2 bg-blue-500">
        .{extension}
      </Badge>
    );
  };

  if (node.type === 'file') {
    return (
      <div
        className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded-md cursor-pointer relative pr-32"
        style={{ paddingLeft }}
        onClick={() => onFileSelect(node)}
      >
        {getFileIcon(node.extension)}
        <span className="text-sm truncate">{node.name}</span>
        {getFileTypeBadge(node.extension)}
      </div>
    );
  }

  if (!node.children || node.children.length === 0) {
    return null;
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded-md cursor-pointer group relative pr-32"
        style={{ paddingLeft }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-yellow-500 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-yellow-500 shrink-0" />
          )}
          <span className="text-sm font-medium truncate">{node.name || 'Root'}</span>
        </div>
        <div className="absolute right-2 flex gap-2 bg-background/95 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSetRoot(node);
            }}
          >
            Set as Root
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDirectorySelect(node);
            }}
          >
            Create Snippets
          </Button>
        </div>
      </div>
      {isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <TreeItem 
              key={`${child.name}-${index}`} 
              node={child} 
              level={level + 1} 
              onFileSelect={onFileSelect}
              onDirectorySelect={onDirectorySelect}
              onSetRoot={onSetRoot}
            />
          ))}
        </div>
      )}
    </div>
  );
}
