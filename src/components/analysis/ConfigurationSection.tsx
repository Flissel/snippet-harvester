
import { Card } from '@/components/ui/card';
import { ConfigurationPointList } from './ConfigurationPointList';
import { ConfigurationPointForm } from './ConfigurationPointForm';
import { Snippet } from '@/types/snippets';
import { ConfigurationPoint, ConfigurationPointInput } from '@/types/configuration';
import { Button } from '@/components/ui/button';
import { Code, Plus, Check, X } from 'lucide-react';
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
  id: string;
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
      id: crypto.randomUUID(),
      start: selectedCode.start,
      end: selectedCode.end,
      text: selectedCode.text,
      config: selectedConfig
    }]);
  };

  const handleRemoveLabel = (id: string) => {
    setPendingReplacements(prev => prev.filter(r => r.id !== id));
  };

  const handleSubmitAll = () => {
    pendingReplacements.forEach(replacement => {
      const placeholder = replacement.config.template_placeholder || `${replacement.config.label}: YAML_VALUE`;
      const configPoint: ConfigurationPointInput = {
        snippet_id: snippet.id,
        label: replacement.config.label,
        config_type: replacement.config.config_type,
        default_value: replacement.text,
        description: replacement.config.description || '',
        template_placeholder: placeholder,
        start_position: replacement.start,
        end_position: replacement.end,
      };
      onSubmit(configPoint);
    });
    setPendingReplacements([]);
  };

  const renderCodeWithReplacements = () => {
    let result = snippet.code_content;
    let positions: { pos: number; isStart: boolean; replacement: PendingReplacement }[] = [];

    // Collect all positions
    pendingReplacements.forEach(replacement => {
      positions.push({ pos: replacement.start, isStart: true, replacement });
      positions.push({ pos: replacement.end, isStart: false, replacement });
    });

    // Sort positions from last to first to avoid position shifts
    positions.sort((a, b) => b.pos - a.pos);

    // Apply replacements
    positions.forEach(({ pos, isStart, replacement }) => {
      if (isStart) {
        const placeholder = replacement.config.template_placeholder || `${replacement.config.label}: YAML_VALUE`;
        const label = replacement.config.label;
        result = result.slice(0, pos) + 
          `<div class="inline-block group relative">
            <mark class="bg-success/20 dark:bg-success/40 px-1">
              ${placeholder}
              <button 
                class="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-destructive-foreground"
                onclick="event.preventDefault(); window.handleRemoveLabel('${replacement.id}');"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </mark>
            <span class="absolute -top-5 left-0 text-xs text-muted-foreground bg-background px-1 rounded border">
              ${label}
            </span>
          </div>` + 
          result.slice(pos);
      } else {
        result = result.slice(0, pos) + result.slice(pos);
      }
    });

    // Add script for handling remove button clicks
    result += `
      <script>
        window.handleRemoveLabel = (id) => {
          const event = new CustomEvent('removeLabel', { detail: { id } });
          document.dispatchEvent(event);
        }
      </script>
    `;

    return result;
  };

  // Add event listener for remove button clicks
  useState(() => {
    const handleRemoveLabelEvent = (event: CustomEvent<{ id: string }>) => {
      handleRemoveLabel(event.detail.id);
    };

    document.addEventListener('removeLabel', handleRemoveLabelEvent as EventListener);
    return () => {
      document.removeEventListener('removeLabel', handleRemoveLabelEvent as EventListener);
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Configuration Points</h2>
        <ConfigurationPointList
          configPoints={configPoints}
          onDelete={onDelete}
        />
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Add Configuration Points</h2>
        <div className="space-y-4">
          {selectedCode && selectedConfig && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Add Labels</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddLabel}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Label
                  </Button>
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
              </div>
              <pre 
                className="p-3 bg-muted rounded-lg font-mono text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: renderCodeWithReplacements() 
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-6">
          <ConfigurationPointForm
            snippet={snippet}
            onSubmit={onSubmit}
            selectedCode={selectedCode}
            initialValues={selectedConfig}
          />
        </div>
      </Card>
    </div>
  );
}
