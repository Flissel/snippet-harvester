
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DirectoryNode, RepositoryTree, isDirectoryNode } from '../types';

export function useRepositoryTree(userId: string | undefined) {
  return useQuery({
    queryKey: ['repository-trees', userId],
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
    enabled: !!userId
  });
}
