
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileViewer } from './generate/components/FileViewer';
import { RepositoryForm } from './generate/components/RepositoryForm';
import { RepositoryBrowser } from './generate/components/RepositoryBrowser';
import { FileNode, DirectoryNode } from './generate/types';
import { filterTreeByExtensions, findSubdirectoryInTree } from './generate/types';
import { useRepositoryTree } from './generate/hooks/useRepositoryTree';
import { useSnippetCreation } from './generate/hooks/useSnippetCreation';
import { getSubdirectoryFromUrl } from './generate/utils/urlUtils';

export default function Generate() {
  const { user } = useAuth();
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedDirectory, setSelectedDirectory] = useState<DirectoryNode | null>(null);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [currentRoot, setCurrentRoot] = useState<DirectoryNode | null>(null);

  const { data: treeData, isLoading: isTreeLoading } = useRepositoryTree(user?.id);
  const { isCreatingSnippets, createSingleSnippet, createDirectorySnippets } = useSnippetCreation(user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repositoryUrl) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('github-repository', {
        body: { repository_url: repositoryUrl }
      });

      if (error) throw error;
      toast.success('Repository scanned successfully');
      setCurrentRoot(null);
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

  const handleSetRoot = (directory: DirectoryNode) => {
    setCurrentRoot(directory);
    toast.success(`Set "${directory.name}" as root directory`);
  };

  const handleCreateSnippet = async () => {
    if (!fileContent || !selectedFile) return;
    await createSingleSnippet(selectedFile, fileContent);
  };

  const handleCreateDirectorySnippets = async () => {
    if (!selectedDirectory) return;
    await createDirectorySnippets(selectedDirectory);
  };

  const subdirectory = getSubdirectoryFromUrl(repositoryUrl);
  const subdirectoryTree = treeData?.tree_structure && subdirectory
    ? findSubdirectoryInTree(treeData.tree_structure, subdirectory)
    : treeData?.tree_structure;

  const effectiveRoot = currentRoot || (subdirectoryTree && selectedFileTypes.length > 0
    ? filterTreeByExtensions(subdirectoryTree, selectedFileTypes)
    : subdirectoryTree);

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
            filteredTreeStructure={effectiveRoot}
            onFileSelect={handleFileSelect}
            onDirectorySelect={handleDirectorySelect}
            onFileTypeChange={(value) => setSelectedFileTypes(value === "all" ? [] : value.split(','))}
            onSetRoot={handleSetRoot}
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
