
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { ResponseSection } from '../hooks/useYMLMaker';

interface YMLPreviewProps {
  sections: ResponseSection[];
  resultData?: string;
}

export function YMLPreview({ sections, resultData }: YMLPreviewProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!sections || sections.length === 0) {
    if (resultData && resultData.trim()) {
      return (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Analysis Result</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(resultData)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap overflow-x-auto">
            {resultData}
          </pre>
        </Card>
      );
    }
    
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          Use the analyze code button or select code manually to generate configuration
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{section.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(section.content)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap overflow-x-auto">
            {section.content}
          </pre>
        </Card>
      ))}
    </div>
  );
}
