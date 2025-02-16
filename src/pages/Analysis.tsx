
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAnalysisData } from '@/components/analysis/hooks/useAnalysisData';
import { AnalysisCodeSection } from '@/components/analysis/AnalysisCodeSection';
import { ConfigurationSection } from '@/components/analysis/ConfigurationSection';
import { ConfigurationPointInput } from '@/types/configuration';
import { DraggableConfigPoints } from '@/components/analysis/DraggableConfigPoints';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Plus } from 'lucide-react';

export function Analysis() {
  const navigate = useNavigate();
  const params = useParams<{ snippetId: string }>();
  const snippetId = params.snippetId;
  
  // Early return if no snippetId is provided
  if (!snippetId) {
    // Use useEffect to handle navigation to avoid React state updates during render
    useEffect(() => {
      navigate('/snippets');
    }, [navigate]);
    return null;
  }

  // Only initialize the hook if we have a snippetId
  const { snippet, configPoints, isLoading, createConfigPoint, deleteConfigPoint } = useAnalysisData(snippetId);
  const [selectedCode, setSelectedCode] = useState<{
    text: string;
    start: number;
    end: number;
  } | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [customConfigPoints, setCustomConfigPoints] = useState<any[]>([]);

  useEffect(() => {
    // Test the edge function
    const testFunction = async () => {
      const { data, error } = await supabase.functions.invoke('test-function');
      console.log('Edge function response:', data);
      if (error) {
        console.error('Edge function error:', error);
        toast.error('Edge function test failed');
      } else {
        toast.success('Edge function is working!');
      }
    };
    
    testFunction();
  }, []);

  const handleCodeSelection = (text: string) => {
    if (!snippet) return;
    const startIndex = text ? snippet.code_content.indexOf(text) : 0;
    setSelectedCode({
      text,
      start: startIndex,
      end: startIndex + text.length
    });
  };

  const handleConfigPointDrop = (_config: any, start: number, end: number) => {
    if (!snippet || !selectedConfig) return;
    
    const configPoint: ConfigurationPointInput = {
      snippet_id: snippet.id,
      label: selectedConfig.label,
      config_type: selectedConfig.config_type,
      default_value: snippet.code_content.substring(start, end),
      description: selectedConfig.description || '',
      template_placeholder: selectedConfig.template_placeholder || `{${selectedConfig.label}}`,
      is_required: true,
      start_position: start,
      end_position: end,
    };

    createConfigPoint.mutate(configPoint);
    
    // Add to custom config points if it's a new one
    if (!customConfigPoints.some(p => p.label === selectedConfig.label)) {
      setCustomConfigPoints(prev => [...prev, selectedConfig]);
    }
    
    setSelectedCode(null);
  };

  const handleConfigPointSelect = (config: any) => {
    setSelectedConfig(config);
  };

  const handleConfigSubmit = (data: ConfigurationPointInput) => {
    createConfigPoint.mutate(data);
    // Add to custom config points
    const newConfigPoint = {
      label: data.label,
      config_type: data.config_type,
      description: data.description,
      template_placeholder: data.template_placeholder,
    };
    setCustomConfigPoints(prev => [...prev, newConfigPoint]);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!snippet) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Snippet Not Found</h1>
        <p className="text-muted-foreground mb-4">The requested snippet could not be found.</p>
        <Button variant="default" asChild>
          <Link to="/snippets">
            Back to Snippets
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analyze Snippet: {snippet.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button variant="default" asChild>
            <Link to={`/analyze/${snippetId}/prompts`}>
              <Plus className="mr-2 h-4 w-4" />
              Manage Prompts
            </Link>
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">Configuration Points</h2>
        <DraggableConfigPoints 
          onConfigPointSelected={handleConfigPointSelect}
          customConfigPoints={customConfigPoints}
        />
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <AnalysisCodeSection
          snippet={snippet}
          configPoints={configPoints}
          onConfigPointCreate={handleConfigPointDrop}
          onCodeSelection={handleCodeSelection}
        />
        
        <ConfigurationSection
          snippet={snippet}
          configPoints={configPoints}
          selectedCode={selectedCode}
          selectedConfig={selectedConfig}
          onDelete={(id) => deleteConfigPoint.mutate(id)}
          onSubmit={handleConfigSubmit}
        />
      </div>
    </div>
  );
}

export default Analysis;
