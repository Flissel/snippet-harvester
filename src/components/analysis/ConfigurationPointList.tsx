
import { ConfigurationPoint } from '@/types/configuration';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';

interface ConfigurationPointListProps {
  configPoints: ConfigurationPoint[];
  onDelete: (id: string) => void;
}

export function ConfigurationPointList({
  configPoints,
  onDelete,
}: ConfigurationPointListProps) {
  if (configPoints.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No configuration points added yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {configPoints.map((point) => (
          <div
            key={point.id}
            className="flex items-start justify-between p-3 border rounded-lg"
          >
            <div className="space-y-1">
              <div className="font-medium">{point.label}</div>
              <div className="text-sm text-muted-foreground">
                Type: {point.config_type}
              </div>
              {point.description && (
                <div className="text-sm text-muted-foreground">
                  {point.description}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(point.id)}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
