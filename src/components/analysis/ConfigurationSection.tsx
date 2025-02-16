
import { Card } from '@/components/ui/card';
import { ConfigurationPointList } from './ConfigurationPointList';
import { ConfigurationPointForm } from './ConfigurationPointForm';
import { Snippet } from '@/types/snippets';
import { ConfigurationPoint, ConfigurationPointInput } from '@/types/configuration';
import { Button } from '@/components/ui/button';
import { Code } from 'lucide-react';

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
  const handleInsertLabel = () => {
    if (!selectedCode || !selectedConfig) return;
    
    const placeholder = selectedConfig.template_placeholder || `${selectedConfig.label}: YAML_VALUE`;
    const configPoint: ConfigurationPointInput = {
      snippet_id: snippet.id,
      label: selectedConfig.label,
      config_type: selectedConfig.config_type,
      default_value: selectedCode.text,
      description: selectedConfig.description || '',
      template_placeholder: placeholder,
      start_position: selectedCode.start,
      end_position: selectedCode.end,
    };
    onSubmit(configPoint);
  };

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
        <h2 className="text-xl font-semibold mb-4">Add Configuration Point</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Selected Code</h3>
              {selectedCode && selectedConfig && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInsertLabel}
                  className="flex items-center gap-2"
                >
                  <Code className="w-4 h-4" />
                  Cut & Replace
                </Button>
              )}
            </div>
            {selectedCode ? (
              <div className="relative">
                <pre className="p-3 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                  {snippet.code_content.substring(0, selectedCode.start)}
                  <mark className="bg-primary/20 px-1">
                    {selectedCode.text}
                  </mark>
                  {snippet.code_content.substring(selectedCode.end)}
                </pre>
                <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                  Position: {selectedCode.start}-{selectedCode.end}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-6 bg-muted rounded-lg text-sm text-muted-foreground">
                Highlight code in the editor to create a configuration point
              </div>
            )}
          </div>

          {selectedCode && selectedConfig && (
            <div>
              <h3 className="text-sm font-medium mb-2">Will Be Replaced With</h3>
              <pre className="p-3 bg-muted rounded-lg font-mono text-sm">
                {snippet.code_content.substring(0, selectedCode.start)}
                <mark className="bg-success/20 dark:bg-success/40 px-1">
                  {selectedConfig.template_placeholder || `${selectedConfig.label}: YAML_VALUE`}
                </mark>
                {snippet.code_content.substring(selectedCode.end)}
              </pre>
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
