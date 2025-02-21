
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { CodeSection } from './CodeSection';
import { renderResultContent } from './utils';
import type { AnalysisResult } from './types';

interface ResultCardProps {
  result: AnalysisResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const handleCopyRaw = (data: any) => {
    if (typeof data === 'string') {
      navigator.clipboard.writeText(data);
      toast.success("Raw response copied to clipboard");
    } else {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success("Raw response copied to clipboard");
    }
  };

  const sections = renderResultContent(result.result_data);

  return (
    <Card className="p-4 border-2">
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
          {sections.map((section, index) => (
            <CodeSection 
              key={index} 
              section={section} 
              isLast={index === sections.length - 1} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
