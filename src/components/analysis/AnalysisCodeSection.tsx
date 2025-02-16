
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CodeViewer } from './CodeViewer';
import { Snippet } from '@/types/snippets';
import { ConfigurationPoint } from '@/types/configuration';
import { predefinedConfigPoints } from './config-form/schema';

interface AnalysisCodeSectionProps {
  snippet: Snippet;
  configPoints: ConfigurationPoint[];
  onConfigPointCreate: (config: any, start: number, end: number) => void;
  onCodeSelection: (text: string) => void;
}

export function AnalysisCodeSection({
  snippet,
  configPoints,
  onConfigPointCreate,
  onCodeSelection,
}: AnalysisCodeSectionProps) {
  return (
    <Card className="p-4">
      <CodeViewer
        code={snippet.code_content}
        language={snippet.language || 'python'}
        configPoints={configPoints}
        onSelectionChange={onCodeSelection}
        onConfigPointDrop={onConfigPointCreate}
      />
    </Card>
  );
}
