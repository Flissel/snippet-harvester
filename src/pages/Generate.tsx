
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FileViewer } from './generate/components/FileViewer';
import { RepositoryForm } from './generate/components/RepositoryForm';
import { RepositoryBrowser } from './generate/components/RepositoryBrowser';
import { 
  FileNode, 
  DirectoryNode, 
  RepositoryTree, 
  isDirectoryNode, 
  filterTreeByExtensions,
  findSubdirectoryInTree,
  collectFilesFromDirectory
} from './generate/types';

export default function Generate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedDirectory, setSelectedDirectory] = useState<DirectoryNode | null>(null);
  const [isCreatingSnippets, setIsCreatingSnippets] = useState(false);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);

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
          language: selectedFile.extension || 'text',
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

    const files = collectFilesFromDirectory(selectedDirectory, ['py']);
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
            language: file.extension || 'text',
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

  // Extract subdirectory from URL
  const getSubdirectoryFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/');
      const treeIndex = parts.indexOf('tree');
      if (treeIndex !== -1 && parts.length > treeIndex + 2) {
        return parts.slice(treeIndex + 2).join('/');
      }
      return '';
    } catch {
      return '';
    }
  };

  const subdirectory = getSubdirectoryFromUrl(repositoryUrl);
  const subdirectoryTree = treeData?.tree_structure && subdirectory
    ? findSubdirectoryInTree(treeData.tree_structure, subdirectory)
    : treeData?.tree_structure;

  const filteredTreeStructure = subdirectoryTree && selectedFileTypes.length > 0
    ? filterTreeByExtensions(subdirectoryTree, selectedFileTypes)
    : subdirectoryTree;

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-6rem)]">
      <h1 className="text-2xl font-bold mb-6">Generate from GitHub</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100%-4rem)]">
        <Card className="p-6 flex flex-col">
          <RepositoryForm
            repositoryUrl={repositoryUrl}
            isLoading={isLoading}
            onUrlChange={setRepositoryUrl}
            onSubmit={handleSubmit}
          />
          <RepositoryBrowser
            treeData={treeData}
            isLoading={isTreeLoading}
            selectedFileTypes={selectedFileTypes}
            filteredTreeStructure={filteredTreeStructure}
            onFileSelect={handleFileSelect}
            onDirectorySelect={handleDirectorySelect}
            onFileTypeChange={(value) => setSelectedFileTypes(value === "all" ? [] : value.split(','))}
          />
        </Card>

        <Card className="p-6 flex flex-col">
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
