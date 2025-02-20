
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
        className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded-md cursor-pointer"
        style={{ paddingLeft }}
        onClick={() => onFileSelect(node)}
      >
        {getFileIcon(node.extension)}
        <span className="text-sm">{node.name}</span>
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
        className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded-md cursor-pointer group"
        style={{ paddingLeft }}
      >
        <div className="flex items-center gap-2" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-yellow-500" />
          ) : (
            <Folder className="h-4 w-4 text-yellow-500" />
          )}
          <span className="text-sm font-medium">{node.name || 'Root'}</span>
        </div>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
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
