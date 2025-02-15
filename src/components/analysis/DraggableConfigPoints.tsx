
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { predefinedConfigPoints } from './config-form/schema';

interface DraggableConfigPointsProps {
  onDrop: (point: typeof predefinedConfigPoints[0], start: number, end: number) => void;
}

export function DraggableConfigPoints({ onDrop }: DraggableConfigPointsProps) {
  const handleDragStart = (e: React.DragEvent, point: typeof predefinedConfigPoints[0]) => {
    e.dataTransfer.setData('application/json', JSON.stringify(point));
  };

  return (
    <ScrollArea className="w-full mb-4">
      <div className="flex gap-2 p-2 min-w-max">
        {predefinedConfigPoints.map((point, index) => (
          <Card
            key={index}
            className="p-2 cursor-move bg-muted hover:bg-muted/80 transition-colors shrink-0 w-48"
            draggable
            onDragStart={(e) => handleDragStart(e, point)}
          >
            <div className="text-sm font-medium">{point.label}</div>
            <div className="text-xs text-muted-foreground truncate">{point.template_placeholder}</div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
