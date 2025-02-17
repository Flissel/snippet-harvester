
import { Prompt } from '@/types/prompts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';

interface ConfigurationCardProps {
  config: Prompt;
  onEdit: (config: Prompt) => void;
  onDelete: (config: Prompt) => void;
  onSelect: (config: Prompt) => void;
  onClose: () => void;
}

export function ConfigurationCard({
  config,
  onEdit,
  onDelete,
  onSelect,
  onClose,
}: ConfigurationCardProps) {
  return (
    <Card key={config.id} className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-semibold">{config.name}</h3>
          {config.description && (
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Created {formatDistanceToNow(new Date(config.created_at))} ago
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onEdit(config);
              onClose();
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(config)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button 
            variant="secondary"
            onClick={() => {
              onSelect(config);
              onClose();
            }}
          >
            Load
          </Button>
        </div>
      </div>
    </Card>
  );
}
