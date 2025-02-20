
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalysisResult {
  step_number: number;
  result_data: any;
}

interface AnalysisResultsProps {
  currentStep: number;
  results?: AnalysisResult[];
}

export function AnalysisResults({ currentStep, results }: AnalysisResultsProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Analysis Results</h3>
        <Badge variant="outline">Step {currentStep} of 4</Badge>
      </div>
      {results?.map((result, index) => (
        <div key={index} className="mb-4">
          <h4 className="font-medium mb-2">Step {result.step_number} Result</h4>
          <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(result.result_data, null, 2)}
          </pre>
        </div>
      ))}
    </Card>
  );
}
