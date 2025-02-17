
import { useState } from 'react';
import { FileCode2, ChevronRight, ChevronDown, Folder, FolderOpen, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileNode, DirectoryNode, TreeNode } from '../types';
import { Badge } from '@/components/ui/badge';

interface TreeItemProps {
  node: TreeNode;
  level: number;
  onFileSelect: (file: FileNode) => void;
  onDirectorySelect: (directory: DirectoryNode) => void;
}

export function TreeItem({ node, level, onFileSelect, onDirectorySelect }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const paddingLeft = `${level * 1.5}rem`;

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

  if (node.type === 'file') {
    return (
      <div
        className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded-md cursor-pointer"
        style={{ paddingLeft }}
        onClick={() => onFileSelect(node)}
      >
        {getFileIcon(node.fileType)}
        <span className="text-sm">{node.name}</span>
        {getFileTypeBadge(node.fileType)}
      </div>
    );
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
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDirectorySelect(node);
          }}
        >
          Create Snippets
        </Button>
      </div>
      {isExpanded && node.type === 'directory' && node.children && (
        <div>
          {node.children.map((child, index) => (
            <TreeItem 
              key={`${child.name}-${index}`} 
              node={child} 
              level={level + 1} 
              onFileSelect={onFileSelect}
              onDirectorySelect={onDirectorySelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
