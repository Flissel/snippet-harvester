
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ProcessedCodeProps {
  code: string | null;
}

export function ProcessedCode({ code }: ProcessedCodeProps) {
  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast.success('Copied to clipboard');
    }
  };

  if (!code) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Processed Code</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <pre className="bg-muted p-2 rounded-md overflow-auto">
        {code}
      </pre>
    </Card>
  );
}
