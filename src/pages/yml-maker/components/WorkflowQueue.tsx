
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';

interface WorkflowQueueProps {
  items: Array<{
    title: string;
    description?: string;
    workflow_type: string;
  }>;
  onRemoveItem: (index: number) => void;
}

export function WorkflowQueue({ items, onRemoveItem }: WorkflowQueueProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Workflow Queue</h3>
        <Badge variant="outline">{items.length} items</Badge>
      </div>
      <ScrollArea className="h-[200px]">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 border-b">
            <div>
              <p className="font-medium">{item.title}</p>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveItem(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </ScrollArea>
    </Card>
  );
}
