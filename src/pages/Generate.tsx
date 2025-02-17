
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileCode2, FolderIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface TreeNode {
  path: string;
  type: 'tree' | 'blob';
  sha: string;
  url: string;
}

export default function Generate() {
  const { user } = useAuth();
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (error) {
      toast.error('Failed to scan repository: ' + error.message);
    } finally {
      setIsLoading(false);
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
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Generate from GitHub</h1>
      
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
          ) : treeData ? (
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <div className="space-y-2">
                {treeData.tree_structure.map((node: TreeNode) => (
                  <div
                    key={node.sha}
                    className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded-md cursor-pointer"
                  >
                    <FileCode2 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{node.path}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No repository scanned yet. Enter a GitHub URL above to start.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
