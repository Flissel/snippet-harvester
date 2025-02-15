
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { predefinedConfigPoints } from './config-form/schema';

interface DraggableConfigPointsProps {
  onConfigPointSelected: (point: typeof predefinedConfigPoints[0]) => void;
}

export function DraggableConfigPoints({ onConfigPointSelected }: DraggableConfigPointsProps) {
  const handleClick = (point: typeof predefinedConfigPoints[0]) => {
    onConfigPointSelected(point);
  };

  return (
    <ScrollArea className="w-full mb-4">
      <div className="flex gap-2 p-2 min-w-max">
        {predefinedConfigPoints.map((point, index) => (
          <Card
            key={index}
            className="p-2 cursor-pointer bg-muted hover:bg-muted/80 transition-colors shrink-0 w-48"
            onClick={() => handleClick(point)}
          >
            <div className="text-sm font-medium">{point.label}</div>
            <div className="text-xs text-muted-foreground truncate">{point.template_placeholder}</div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
