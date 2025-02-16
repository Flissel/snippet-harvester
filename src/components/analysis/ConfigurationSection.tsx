
import { Card } from '@/components/ui/card';
import { ConfigurationPointList } from './ConfigurationPointList';
import { ConfigurationPointForm } from './ConfigurationPointForm';
import { Snippet } from '@/types/snippets';
import { ConfigurationPoint, ConfigurationPointInput } from '@/types/configuration';
import { Button } from '@/components/ui/button';
import { Plus, Wand2 } from 'lucide-react';
import { SuggestionsList } from './SuggestionsList';
import { CodePreview } from './CodePreview';
import { useAnalysis } from './hooks/useAnalysis';

interface ConfigurationSectionProps {
  snippet: Snippet;
  configPoints: ConfigurationPoint[];
  selectedCode: { text: string; start: number; end: number; } | null;
  selectedConfig: any | null;
  onDelete: (id: string) => void;
  onSubmit: (data: ConfigurationPointInput) => void;
}

export function ConfigurationSection({
  snippet,
  configPoints,
  selectedCode,
  selectedConfig,
  onDelete,
  onSubmit,
}: ConfigurationSectionProps) {
  const {
    pendingReplacements,
    suggestions,
    isAnalyzing,
    handleAddLabel,
    handleAddSuggestion,
    handleRemoveSuggestion,
    handleSubmitAll,
    handleAnalyzeCode
  } = useAnalysis(snippet, onSubmit);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Configuration Points</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyzeCode}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Auto-detect'}
            </Button>
          </div>
          <ConfigurationPointList
            configPoints={configPoints}
            onDelete={onDelete}
          />
        </Card>

        <SuggestionsList
          suggestions={suggestions}
          onAdd={handleAddSuggestion}
          onRemove={handleRemoveSuggestion}
        />

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Add Labels</h2>
            {selectedCode && selectedConfig && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddLabel(selectedCode, selectedConfig)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Label
              </Button>
            )}
          </div>

          <ConfigurationPointForm
            snippet={snippet}
            onSubmit={onSubmit}
            selectedCode={selectedCode}
            initialValues={selectedConfig}
          />
        </Card>
      </div>

      <div>
        <CodePreview
          code={snippet.code_content}
          configPoints={configPoints}
          pendingReplacements={pendingReplacements}
          selectedCode={selectedCode}
          selectedConfig={selectedConfig}
          onSubmitAll={handleSubmitAll}
        />
      </div>
    </div>
  );
}
