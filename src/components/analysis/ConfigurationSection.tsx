
import { Card } from '@/components/ui/card';
import { ConfigurationPointList } from './ConfigurationPointList';
import { ConfigurationPointForm } from './ConfigurationPointForm';
import { Snippet } from '@/types/snippets';
import { ConfigurationPoint, ConfigurationPointInput } from '@/types/configuration';

interface ConfigurationSectionProps {
  snippet: Snippet;
  configPoints: ConfigurationPoint[];
  selectedCode: { text: string; start: number; end: number; } | null;
  onDelete: (id: string) => void;
  onSubmit: (data: ConfigurationPointInput) => void;
}

export function ConfigurationSection({
  snippet,
  configPoints,
  selectedCode,
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
        {selectedCode && (
          <div className="mb-4 p-2 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Selected text:</p>
            <p className="font-mono text-sm">{selectedCode.text}</p>
          </div>
        )}
        <ConfigurationPointForm
          snippet={snippet}
          onSubmit={onSubmit}
          selectedCode={selectedCode}
        />
      </Card>
    </div>
  );
}
