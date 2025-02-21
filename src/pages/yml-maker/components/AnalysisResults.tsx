
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

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

const extractCodeBlock = (content: string, language: string): string => {
  const codeBlockRegex = new RegExp(`\`\`\`${language}[\\s\\S]*?([\\s\\S]*?)\`\`\``, 'g');
  const matches = content.match(codeBlockRegex);
  
  if (matches && matches.length > 0) {
    return matches[0]
      .replace(`\`\`\`${language}`, '')
      .replace(/```/g, '')
      .trim();
  }
  return content.trim();
};

const cleanContent = (section: string): string => {
  return section
    .replace(/^.*?:/, '')
    .trim();
};

const renderResultContent = (result: AnalysisResult) => {
  const raw_response = result.result_data;
  
  if (!raw_response) return [];

  if (typeof raw_response === 'string') {
    // Split by actual newline character followed by three dashes
    const sections = raw_response.split('\n---\n').map(section => section.trim());
    
    return sections.map(section => {
      if (section.includes('Required Imports:')) {
        const content = cleanContent(section);
        return {
          title: 'Required Imports',
          content: extractCodeBlock(content, 'python'),
          language: 'python'
        };
      } 
      else if (section.includes('YML Configuration:')) {
        const content = cleanContent(section);
        return {
          title: 'YML Configuration',
          content: extractCodeBlock(content, 'yaml'),
          language: 'yaml'
        };
      }
      else if (section.includes('Processed Code:')) {
        const content = cleanContent(section);
        return {
          title: 'Processed Code',
          content: extractCodeBlock(content, 'python'),
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

  return [{
    title: 'Raw Response',
    content: JSON.stringify(raw_response, null, 2),
    language: 'json'
  }];
};

export function AnalysisResults({ currentStep, results, isSingleExecution }: AnalysisResultsProps) {
  if (!results?.length) return null;

  const handleCopyRaw = (data: any) => {
    if (typeof data === 'string') {
      navigator.clipboard.writeText(data);
      toast.success("Raw response copied to clipboard");
    } else {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success("Raw response copied to clipboard");
    }
  };

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
                {/* Raw Response Section */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm text-muted-foreground">Raw Response</h5>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8"
                      onClick={() => handleCopyRaw(result.result_data)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Raw
                    </Button>
                  </div>
                  <div className="rounded-md overflow-hidden">
                    <SyntaxHighlighter
                      language="text"
                      style={docco}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        backgroundColor: 'hsl(var(--muted))',
                      }}
                    >
                      {typeof result.result_data === 'string' 
                        ? result.result_data 
                        : JSON.stringify(result.result_data, null, 2)
                      }
                    </SyntaxHighlighter>
                  </div>
                </div>

                <Separator />

                {/* Parsed Sections */}
                <div className="space-y-4 mt-6">
                  <h5 className="font-medium text-sm text-muted-foreground">Parsed Sections</h5>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
