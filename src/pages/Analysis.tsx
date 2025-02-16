
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAnalysisData } from '@/components/analysis/hooks/useAnalysisData';
import { AnalysisCodeSection } from '@/components/analysis/AnalysisCodeSection';
import { ConfigurationSection } from '@/components/analysis/ConfigurationSection';
import { ConfigurationPointInput } from '@/types/configuration';
import { DraggableConfigPoints } from '@/components/analysis/DraggableConfigPoints';
import { Card } from '@/components/ui/card';

export function Analysis() {
  const { snippetId } = useParams();
  const { snippets, configPoints, isLoading, createConfigPoint, deleteConfigPoint } = useAnalysisData();
  const [selectedCode, setSelectedCode] = useState<{
    text: string;
    start: number;
    end: number;
  } | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [customConfigPoints, setCustomConfigPoints] = useState<any[]>([]);

  const handleCodeSelection = (text: string) => {
    if (!snippet) return;
    const startIndex = text ? snippet.code_content.indexOf(text) : 0;
    setSelectedCode({
      text,
      start: startIndex,
      end: startIndex + text.length
    });
  };

  const handleConfigPointDrop = (config: any, start: number, end: number) => {
    if (!snippet || !selectedConfig) return;
    const configPoint: ConfigurationPointInput = {
      snippet_id: snippet.id,
      label: selectedConfig.label,
      config_type: selectedConfig.config_type,
      default_value: snippet.code_content.substring(start, end),
      description: selectedConfig.description,
      template_placeholder: selectedConfig.template_placeholder,
      is_required: true,
      start_position: start,
      end_position: end,
    };
    createConfigPoint.mutate(configPoint);
    setSelectedCode(null);

    // Add to custom config points if it's a new one
    if (!customConfigPoints.some(p => p.label === selectedConfig.label)) {
      setCustomConfigPoints(prev => [...prev, selectedConfig]);
    }
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

  if (!snippets || snippets.length === 0) {
    return <div>No snippets found</div>;
  }

  const snippet = snippets.find(s => s.id === snippetId) || snippets[0];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analyze Snippet: {snippet.title}</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
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
