import { useState } from 'react';
import { useParams, useNavigate, Params } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ConfigurationPointForm } from '@/components/analysis/ConfigurationPointForm';
import { CodeViewer } from '@/components/analysis/CodeViewer';
import { ConfigurationPointList } from '@/components/analysis/ConfigurationPointList';
import { Snippet } from '@/types/snippets';
import { ConfigurationPoint, ConfigurationPointInput } from '@/types/configuration';

type AnalysisParams = {
  snippetId: string;
} & Params;

export function Analysis() {
  const params = useParams() as AnalysisParams;
  const snippetId = params.snippetId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCode, setSelectedCode] = useState<{
    start: number;
    end: number;
    text: string;
  } | null>(null);

  console.log('Current snippetId:', snippetId); // Debug log

  const { data: snippet, isLoading: isLoadingSnippet } = useQuery({
    queryKey: ['snippets', snippetId],
    queryFn: async () => {
      if (!snippetId) throw new Error('Snippet ID is required');
      
      console.log('Fetching snippet with ID:', snippetId); // Debug log
      
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .eq('id', snippetId)
        .maybeSingle();

      if (error) {
        console.error('Snippet fetch error:', error); // Debug log
        throw error;
      }
      if (!data) throw new Error('Snippet not found');
      return data as Snippet;
    },
    enabled: Boolean(snippetId),
  });

  const { data: configPoints = [], isLoading: isLoadingConfig } = useQuery({
    queryKey: ['configuration_points', snippetId],
    queryFn: async () => {
      if (!snippetId) throw new Error('Snippet ID is required');
      
      console.log('Fetching config points for snippet:', snippetId); // Debug log
      
      const { data, error } = await supabase
        .from('configuration_points')
        .select('*')
        .eq('snippet_id', snippetId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Config points fetch error:', error); // Debug log
        throw error;
      }
      return data as ConfigurationPoint[];
    },
    enabled: Boolean(snippetId),
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
      setSelectedCode(null);
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

  const handleCodeSelection = (start: number, end: number, text: string) => {
    setSelectedCode({ start, end, text });
  };

  if (!snippetId) {
    toast({
      title: "Error",
      description: "No snippet ID provided",
      variant: "destructive",
    });
    navigate('/snippets');
    return null;
  }

  if (isLoadingSnippet || isLoadingConfig) {
    return <div>Loading...</div>;
  }

  if (!snippet) {
    return <div>Snippet not found</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analyze Snippet: {snippet.title}</h1>
        <Button variant="outline" onClick={() => navigate('/snippets')}>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4">
          <CodeViewer
            code={snippet.code_content}
            language={snippet.language || 'text'}
            configPoints={configPoints}
            onSelectionChange={handleCodeSelection}
          />
        </Card>

        <div className="space-y-6">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Configuration Points</h2>
            <ConfigurationPointList
              configPoints={configPoints}
              onDelete={(id) => deleteConfigPoint.mutate(id)}
            />
          </Card>

          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Add Configuration Point</h2>
            {selectedCode && (
              <div className="mb-4 p-2 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Selected text:</p>
                <p className="font-mono text-sm">{selectedCode.text}</p>
              </div>
            )}
            <ConfigurationPointForm
              snippet={snippet}
              onSubmit={(data) => createConfigPoint.mutate(data)}
              selectedCode={selectedCode}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
