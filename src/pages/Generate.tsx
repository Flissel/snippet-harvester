
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TreeItem } from './generate/components/TreeItem';
import { FileViewer } from './generate/components/FileViewer';
import { FileNode, DirectoryNode, RepositoryTree, isDirectoryNode } from './generate/types';

export default function Generate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedDirectory, setSelectedDirectory] = useState<DirectoryNode | null>(null);
  const [isCreatingSnippets, setIsCreatingSnippets] = useState(false);

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
    setSelectedDirectory(null);
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

  const handleDirectorySelect = (directory: DirectoryNode) => {
    setSelectedFile(null);
    setFileContent(null);
    setSelectedDirectory(directory);
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

  const handleCreateDirectorySnippets = async () => {
    if (!selectedDirectory || !user) return;

    const files = collectFilesFromDirectory(selectedDirectory);
    if (files.length === 0) {
      toast.error('No Python files found in this directory');
      return;
    }

    setIsCreatingSnippets(true);
    const createdSnippets: string[] = [];

    try {
      for (const file of files) {
        const response = await fetch(file.url);
        if (!response.ok) throw new Error(`Failed to fetch ${file.name}`);
        const content = await response.text();

        const { data, error } = await supabase
          .from('snippets')
          .insert({
            title: `${selectedDirectory.name}/${file.name}`,
            code_content: content,
            language: file.name.split('.').pop() || 'text',
            created_by: user.id,
            source_url: file.url,
            source_path: file.path
          })
          .select()
          .single();

        if (error) throw error;
        createdSnippets.push(data.id);
      }

      toast.success(`Created ${createdSnippets.length} snippets successfully`);
      if (createdSnippets.length > 0) {
        navigate(`/analyze/${createdSnippets[0]}`);
      }
    } catch (error: any) {
      toast.error('Failed to create snippets: ' + error.message);
    } finally {
      setIsCreatingSnippets(false);
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
                  onDirectorySelect={handleDirectorySelect}
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
          <FileViewer
            selectedFile={selectedFile}
            selectedDirectory={selectedDirectory}
            fileContent={fileContent}
            isCreatingSnippets={isCreatingSnippets}
            onCreateSnippet={handleCreateSnippet}
            onCreateDirectorySnippets={handleCreateDirectorySnippets}
          />
        </Card>
      </div>
    </div>
  );
}
