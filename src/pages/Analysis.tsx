import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { DraggableConfigPoints } from '@/components/analysis/DraggableConfigPoints';

export function Analysis() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCode, setSelectedCode] = useState<{
    text: string;
    start: number;
    end: number;
  } | null>(null);

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

  const handleCodeSelection = (text: string) => {
    const startIndex = text ? snippet.code_content.indexOf(text) : 0;
    setSelectedCode({
      text,
      start: startIndex,
      end: startIndex + text.length
    });
  };

  const handleConfigPointDrop = (config: any, start: number, end: number) => {
    const configPoint: ConfigurationPointInput = {
      snippet_id: snippet.id,
      label: config.label,
      config_type: config.config_type,
      default_value: snippet.code_content.substring(start, end),
      description: config.description,
      template_placeholder: config.template_placeholder,
      is_required: true,
      start_position: start,
      end_position: end,
    };
    createConfigPoint.mutate(configPoint);
  };

  if (isLoadingSnippets || isLoadingConfig) {
    return <div>Loading...</div>;
  }

  if (!snippets || snippets.length === 0) {
    return <div>No snippets found</div>;
  }

  // Use the first snippet for demonstration
  const snippet = snippets[0];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analyze Snippet: {snippet.title}</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4">
          <DraggableConfigPoints onDrop={(point, start, end) => handleConfigPointDrop(point, start, end)} />
          <CodeViewer
            code={snippet.code_content}
            language={snippet.language || 'python'}
            configPoints={configPoints}
            onSelectionChange={handleCodeSelection}
            onConfigPointDrop={handleConfigPointDrop}
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
