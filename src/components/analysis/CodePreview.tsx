
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { ConfigurationPoint } from '@/types/configuration';
import { PendingReplacement } from './hooks/useAnalysis';

interface CodePreviewProps {
  code: string;
  configPoints: ConfigurationPoint[];
  pendingReplacements: PendingReplacement[];
  selectedCode: { text: string; start: number; end: number; } | null;
  selectedConfig: any | null;
  onSubmitAll: () => void;
}

export function CodePreview({
  code,
  configPoints,
  pendingReplacements,
  selectedCode,
  selectedConfig,
  onSubmitAll,
}: CodePreviewProps) {
  const renderCodeWithReplacements = () => {
    let result = code;
    const allReplacements: PendingReplacement[] = [];

    configPoints.forEach(point => {
      allReplacements.push({
        start: point.start_position,
        end: point.end_position,
        text: point.default_value || '',
        config: {
          label: point.label,
          template_placeholder: point.template_placeholder,
        }
      });
    });

    allReplacements.push(...pendingReplacements);

    if (selectedCode && selectedConfig && pendingReplacements.length === 0) {
      allReplacements.push({
        start: selectedCode.start,
        end: selectedCode.end,
        text: selectedCode.text,
        config: selectedConfig
      });
    }

    allReplacements.sort((a, b) => b.start - a.start);

    allReplacements.forEach(replacement => {
      const placeholder = replacement.config.template_placeholder || `{${replacement.config.label}}`;
      result = result.slice(0, replacement.start) + placeholder + result.slice(replacement.end);
    });

    return result;
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Preview</h2>
        {pendingReplacements.length > 0 && (
          <Button
            variant="default"
            size="sm"
            onClick={onSubmitAll}
            className="flex items-center gap-2"
          >
            <Check className="w-4 w-4" />
            Submit All ({pendingReplacements.length})
          </Button>
        )}
      </div>
      <pre className="p-3 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap">
        {renderCodeWithReplacements()}
      </pre>
    </Card>
  );
}
