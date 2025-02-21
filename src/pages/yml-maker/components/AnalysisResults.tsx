
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Separator } from '@/components/ui/separator';

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

const cleanYamlContent = (content: string): string => {
  if (!content) return '';
  return content
    .replace(/```yaml\n/g, '')
    .replace(/```\n?/g, '')
    .trim();
};

const renderResultContent = (result: AnalysisResult) => {
  const raw_response = result.result_data;
  
  // If no result data, return empty array
  if (!raw_response) return [];

  // If raw_response is a string, split by sections
  if (typeof raw_response === 'string') {
    const sections = raw_response.split('---').map(section => section.trim());
    return sections.map(section => {
      if (section.startsWith('Required Imports:')) {
        return {
          title: 'Required Imports',
          content: section.replace('Required Imports:', '').trim(),
          language: 'python'
        };
      } else if (section.includes('YML Configuration:')) {
        return {
          title: 'YML Configuration',
          content: cleanYamlContent(section.replace('YML Configuration:', '')),
          language: 'yaml'
        };
      } else if (section.includes('Processed Code:')) {
        return {
          title: 'Processed Code',
          content: section.replace('Processed Code:', '').trim(),
          language: 'python'
        };
      }
      return {
        title: 'Analysis',
        content: section,
        language: 'text'
      };
    }).filter(section => section.content.length > 0);
  }

  // If result_data is an object, display as JSON
  return [{
    title: 'Raw Response',
    content: JSON.stringify(raw_response, null, 2),
    language: 'json'
  }];
};

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
              
              <CardContent className="p-0 mt-4 space-y-4">
                {renderResultContent(result).map((section, sIdx) => (
                  <div key={sIdx} className="space-y-2">
                    <h5 className="font-medium text-sm text-muted-foreground">
                      {section.title}
                    </h5>
                    <div className="rounded-md overflow-hidden">
                      <SyntaxHighlighter
                        language={section.language}
                        style={docco}
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          backgroundColor: 'hsl(var(--muted))',
                        }}
                      >
                        {section.content}
                      </SyntaxHighlighter>
                    </div>
                    {sIdx < renderResultContent(result).length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

