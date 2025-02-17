import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileCode2, ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface FileNode {
  name: string;
  type: 'file';
  path: string;
  sha: string;
  url: string;
}

interface DirectoryNode {
  name: string;
  type: 'directory';
  children: (DirectoryNode | FileNode)[];
}

type TreeNode = FileNode | DirectoryNode;

interface RepositoryTree {
  id: string;
  repository_url: string;
  tree_structure: DirectoryNode;
  created_at: string;
  updated_at: string;
  created_by: string;
}

function isFileNode(node: any): node is FileNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    node.type === 'file' &&
    typeof node.name === 'string' &&
    typeof node.path === 'string' &&
    typeof node.sha === 'string' &&
    typeof node.url === 'string'
  );
}

function isDirectoryNode(node: any): node is DirectoryNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    node.type === 'directory' &&
    typeof node.name === 'string' &&
    Array.isArray(node.children)
  );
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  onFileSelect: (file: FileNode) => void;
}

const TreeItem = ({ node, level, onFileSelect }: TreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const paddingLeft = `${level * 1.5}rem`;

  if (node.type === 'file') {
    return (
      <div
        className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded-md cursor-pointer"
        style={{ paddingLeft }}
        onClick={() => onFileSelect(node)}
      >
        <FileCode2 className="h-4 w-4 text-blue-500" />
        <span className="text-sm">{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded-md cursor-pointer"
        style={{ paddingLeft }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
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
      {isExpanded && node.type === 'directory' && node.children && (
        <div>
          {node.children.map((child, index) => (
            <TreeItem 
              key={`${child.name}-${index}`} 
              node={child} 
              level={level + 1} 
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Generate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repositoryUrl) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-repository', {
        body: { repository_url: repositoryUrl }
      });

      if (error) throw error;
      toast.success('Repository scanned successfully');
    } catch (error: any) {
      toast.error('Failed to scan repository: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: FileNode) => {
    setSelectedFile(file);
    try {
      const response = await fetch(file.url);
      if (!response.ok) throw new Error('Failed to fetch file content');
      const content = await response.text();
      setFileContent(content);
    } catch (error) {
      toast.error('Failed to load file content');
      setFileContent(null);
    }
  };

  const handleCreateSnippet = async () => {
    if (!fileContent || !selectedFile || !user) return;

    try {
      const { data, error } = await supabase
        .from('snippets')
        .insert({
          title: selectedFile.name,
          code_content: fileContent,
          language: selectedFile.name.split('.').pop() || 'text',
          created_by: user.id,
          source_url: selectedFile.url,
          source_path: selectedFile.path
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Snippet created successfully');
      navigate(`/analyze/${data.id}`);
    } catch (error: any) {
      toast.error('Failed to create snippet: ' + error.message);
    }
  };

  const { data: treeData, isLoading: isTreeLoading } = useQuery({
    queryKey: ['repository-trees', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('repository_trees')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data && typeof data.tree_structure === 'object' && data.tree_structure !== null) {
        const treeStructure = data.tree_structure as unknown;
        
        if (isDirectoryNode(treeStructure)) {
          return {
            ...data,
            tree_structure: treeStructure
          } as RepositoryTree;
        }
      }
      return null;
    },
    enabled: !!user
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Generate from GitHub</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter GitHub repository URL"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Scan Repository
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Python Files</h2>
            {isTreeLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : treeData && treeData.tree_structure ? (
              <ScrollArea className="h-[400px] border rounded-md p-4">
                <TreeItem 
                  node={treeData.tree_structure} 
                  level={0} 
                  onFileSelect={handleFileSelect}
                />
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No repository scanned yet. Enter a GitHub URL above to start.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {selectedFile ? `File: ${selectedFile.name}` : 'Select a file to view'}
            </h2>
            {selectedFile && fileContent && (
              <Button onClick={handleCreateSnippet}>
                Create Snippet
              </Button>
            )}
          </div>
          <ScrollArea className="h-[500px] border rounded-md">
            {fileContent ? (
              <pre className="p-4 font-mono text-sm whitespace-pre-wrap">{fileContent}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {selectedFile ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  'No file selected'
                )}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
