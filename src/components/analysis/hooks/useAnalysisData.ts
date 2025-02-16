
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Snippet } from '@/types/snippets';
import { ConfigurationPoint, ConfigurationPointInput } from '@/types/configuration';
import { useToast } from '@/components/ui/use-toast';

export function useAnalysisData(snippetId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: snippet, isLoading: isLoadingSnippet } = useQuery({
    queryKey: ['snippets', snippetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .eq('id', snippetId)
        .maybeSingle();

      if (error) {
        console.error('Snippet fetch error:', error);
        throw error;
      }
      return data as Snippet;
    },
  });

  const { data: configPoints = [], isLoading: isLoadingConfig } = useQuery({
    queryKey: ['configuration_points', snippetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuration_points')
        .select('*')
        .eq('snippet_id', snippetId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Config points fetch error:', error);
        throw error;
      }
      return data as ConfigurationPoint[];
    },
    enabled: !!snippet, // Only fetch config points if we have a snippet
  });

  const createConfigPoint = useMutation({
    mutationFn: async (newPoint: ConfigurationPointInput) => {
      const { data, error } = await supabase
        .from('configuration_points')
        .insert([newPoint])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuration_points', snippetId] });
      toast({
        title: 'Configuration point created',
        description: 'The configuration point has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create configuration point: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteConfigPoint = useMutation({
    mutationFn: async (pointId: string) => {
      const { error } = await supabase
        .from('configuration_points')
        .delete()
        .eq('id', pointId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuration_points', snippetId] });
      toast({
        title: 'Configuration point deleted',
        description: 'The configuration point has been removed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete configuration point: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    snippet,
    configPoints,
    isLoading: isLoadingSnippet || isLoadingConfig,
    createConfigPoint,
    deleteConfigPoint,
  };
}
