
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Snippet } from '@/types/snippets';
import { ConfigurationPoint, ConfigurationPointInput } from '@/types/configuration';
import { useToast } from '@/components/ui/use-toast';

export function useAnalysisData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: snippets, isLoading: isLoadingSnippets } = useQuery({
    queryKey: ['snippets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('snippets')
        .select('*');

      if (error) {
        console.error('Snippets fetch error:', error);
        throw error;
      }
      return data as Snippet[];
    },
  });

  const { data: configPoints = [], isLoading: isLoadingConfig } = useQuery({
    queryKey: ['configuration_points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuration_points')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Config points fetch error:', error);
        throw error;
      }
      return data as ConfigurationPoint[];
    },
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
      queryClient.invalidateQueries({ queryKey: ['configuration_points'] });
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
      queryClient.invalidateQueries({ queryKey: ['configuration_points'] });
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
    snippets,
    configPoints,
    isLoading: isLoadingSnippets || isLoadingConfig,
    createConfigPoint,
    deleteConfigPoint,
  };
}
