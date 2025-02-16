
import { Card } from '@/components/ui/card';
import { ConfigurationPointList } from './ConfigurationPointList';
import { ConfigurationPointForm } from './ConfigurationPointForm';
import { Snippet } from '@/types/snippets';
import { ConfigurationPoint, ConfigurationPointInput } from '@/types/configuration';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import { useState } from 'react';

interface ConfigurationSectionProps {
  snippet: Snippet;
  configPoints: ConfigurationPoint[];
  selectedCode: { text: string; start: number; end: number; } | null;
  selectedConfig: any | null;
  onDelete: (id: string) => void;
  onSubmit: (data: ConfigurationPointInput) => void;
}

interface PendingReplacement {
  start: number;
  end: number;
  text: string;
  config: any;
}

export function ConfigurationSection({
  snippet,
  configPoints,
  selectedCode,
  selectedConfig,
  onDelete,
  onSubmit,
}: ConfigurationSectionProps) {
  const [pendingReplacements, setPendingReplacements] = useState<PendingReplacement[]>([]);

  const handleAddLabel = () => {
    if (!selectedCode || !selectedConfig) return;
    
    setPendingReplacements(prev => [...prev, {
      start: selectedCode.start,
      end: selectedCode.end,
      text: selectedCode.text,
      config: selectedConfig
    }]);
  };

  const handleSubmitAll = () => {
    pendingReplacements.forEach(replacement => {
      const configPoint: ConfigurationPointInput = {
        snippet_id: snippet.id,
        label: replacement.config.label,
        config_type: replacement.config.config_type,
        default_value: replacement.text,
        description: replacement.config.description || '',
        template_placeholder: replacement.config.template_placeholder || `{${replacement.config.label}}`,
        is_required: true,
        start_position: replacement.start,
        end_position: replacement.end,
      };
      onSubmit(configPoint);
    });
    setPendingReplacements([]);
  };

  const renderCodeWithReplacements = () => {
    if (pendingReplacements.length === 0 && selectedCode && selectedConfig) {
      // Show preview of current selection
      let result = snippet.code_content;
      const placeholder = selectedConfig.template_placeholder || `{${selectedConfig.label}}`;
      result = result.slice(0, selectedCode.start) + placeholder + result.slice(selectedCode.end);
      return result;
    }

    // Show all pending replacements
    let result = snippet.code_content;
    let positions: { pos: number; isStart: boolean; placeholder: string }[] = [];

    // Collect all positions
    pendingReplacements.forEach(replacement => {
      const placeholder = replacement.config.template_placeholder || `{${replacement.config.label}}`;
      positions.push({ pos: replacement.start, isStart: true, placeholder });
      positions.push({ pos: replacement.end, isStart: false, placeholder: '' });
    });

    // Sort positions from last to first to avoid position shifts
    positions.sort((a, b) => b.pos - a.pos);

    // Apply replacements
    positions.forEach(({ pos, isStart, placeholder }) => {
      if (isStart) {
        result = result.slice(0, pos) + placeholder + result.slice(pos);
      } else {
        result = result.slice(0, pos) + result.slice(pos);
      }
    });

    return result;
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Configuration Points</h2>
          <ConfigurationPointList
            configPoints={configPoints}
            onDelete={onDelete}
          />
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Add Labels</h2>
            {selectedCode && selectedConfig && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddLabel}
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
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Preview</h2>
            {pendingReplacements.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmitAll}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Submit All ({pendingReplacements.length})
              </Button>
            )}
          </div>
          <pre className="p-3 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap">
            {renderCodeWithReplacements()}
          </pre>
        </Card>
      </div>
    </div>
  );
}
