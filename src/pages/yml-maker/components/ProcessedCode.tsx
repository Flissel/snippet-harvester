
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

interface ProcessedCodeProps {
  code: string | null;
}

interface CodeSections {
  mainCode: string;
  exampleUsage: string;
}

const splitCodeSections = (code: string): CodeSections => {
  const sections = code.split(/# Example Usage|# Examples?/i);
  
  return {
    mainCode: sections[0].trim(),
    exampleUsage: sections.length > 1 ? sections[1].trim() : ''
  };
};

export function ProcessedCode({ code }: ProcessedCodeProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!code) {
    return null;
  }

  const { mainCode, exampleUsage } = splitCodeSections(code);

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Main Implementation</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(mainCode)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <pre className="bg-muted p-2 rounded-md overflow-auto">
          {mainCode}
        </pre>
      </div>

      {exampleUsage && (
        <>
          <Separator className="my-4" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Example Usage</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(exampleUsage)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <pre className="bg-muted p-2 rounded-md overflow-auto">
              {exampleUsage}
            </pre>
          </div>
        </>
      )}

      <div className="flex justify-end mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(code)}
        >
          Copy All Code
          <Copy className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
