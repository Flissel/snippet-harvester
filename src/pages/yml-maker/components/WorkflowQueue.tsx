
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Play } from 'lucide-react';
import { SelectedWorkflowItem } from '@/types/workflow';

interface WorkflowQueueProps {
  items: SelectedWorkflowItem[];
  onRemoveItem: (index: number) => void;
  onTestItem?: (item: SelectedWorkflowItem) => Promise<void>;
}

export function WorkflowQueue({ items, onRemoveItem, onTestItem }: WorkflowQueueProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Workflow Queue</h3>
        <Badge variant="outline">{items.length} items</Badge>
      </div>
      <ScrollArea className="h-[200px]">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 border-b">
            <div className="flex-grow">
              <p className="font-medium">{item.title}</p>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onTestItem && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTestItem(item)}
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
    </Card>
  );
}
