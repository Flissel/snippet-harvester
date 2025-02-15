
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAnalysisData } from '@/components/analysis/hooks/useAnalysisData';
import { AnalysisCodeSection } from '@/components/analysis/AnalysisCodeSection';
import { ConfigurationSection } from '@/components/analysis/ConfigurationSection';
import { ConfigurationPointInput } from '@/types/configuration';

export function Analysis() {
  const { snippets, configPoints, isLoading, createConfigPoint, deleteConfigPoint } = useAnalysisData();
  const [selectedCode, setSelectedCode] = useState<{
    text: string;
    start: number;
    end: number;
  } | null>(null);

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
    if (!snippet) return;
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
    setSelectedCode(null);
  };

  if (isLoading) {
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
          onDelete={(id) => deleteConfigPoint.mutate(id)}
          onSubmit={(data) => createConfigPoint.mutate(data)}
        />
      </div>
    </div>
  );
}

export default Analysis;
