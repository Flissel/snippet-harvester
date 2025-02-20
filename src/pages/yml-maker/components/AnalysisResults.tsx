
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface AnalysisResult {
  step_number: number;
  result_data: any;
  created_at?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  title?: string;
}

interface AnalysisResultsProps {
  currentStep: number;
  results?: AnalysisResult[];
  isSingleExecution?: boolean;
}

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

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={index} className="p-4 border-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">
                    {result.title || `Step ${result.step_number} Result`}
                  </h4>
                  {result.status && (
                    <Badge variant={
                      result.status === 'completed' ? 'default' :
                      result.status === 'failed' ? 'destructive' :
                      result.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {result.status}
                    </Badge>
                  )}
                </div>
                {result.created_at && (
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              <CardContent className="p-0 mt-2">
                <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap overflow-x-auto text-sm">
                  {JSON.stringify(result.result_data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
