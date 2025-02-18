
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface YMLPreviewProps {
  ymlContent: string | null;
  imports: string[] | null;
}

export function YMLPreview({ ymlContent, imports }: YMLPreviewProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!ymlContent && !imports) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          Use the detect configurations button or select code manually to generate YML
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {imports && imports.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Imports</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(imports.join('\n'))}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <pre className="bg-muted p-2 rounded-md">
            {imports.join('\n')}
          </pre>
        </Card>
      )}

      {ymlContent && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">YML Configuration</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(ymlContent)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <pre className="bg-muted p-2 rounded-md">
            {ymlContent}
          </pre>
        </Card>
      )}
    </div>
  );
}
