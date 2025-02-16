
import { Card } from '@/components/ui/card';
import { ConfigurationPointList } from './ConfigurationPointList';
import { ConfigurationPointForm } from './ConfigurationPointForm';
import { Snippet } from '@/types/snippets';
import { ConfigurationPoint, ConfigurationPointInput } from '@/types/configuration';

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
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Selected Code</h3>
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
            <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              Select code in the editor above to create a configuration point
            </div>
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
  );
}
