
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResultCard } from './ResultCard';
import type { AnalysisResultsProps } from './types';

export function AnalysisResults({ currentStep, results, isSingleExecution }: AnalysisResultsProps) {
  if (!results?.length) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Analysis Results</h3>
          <Badge variant="outline">
            {isSingleExecution ? 'Single Test' : `Step ${currentStep} of ${results.length}`}
          </Badge>
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          {results.map((result, index) => (
            <ResultCard key={index} result={result} />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
