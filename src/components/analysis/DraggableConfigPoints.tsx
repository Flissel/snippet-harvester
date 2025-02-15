
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { predefinedConfigPoints } from './config-form/schema';

interface DraggableConfigPointsProps {
  onDrop: (point: typeof predefinedConfigPoints[0], start: number, end: number) => void;
}

export function DraggableConfigPoints({ onDrop }: DraggableConfigPointsProps) {
  const handleDragStart = (e: React.DragEvent, point: typeof predefinedConfigPoints[0]) => {
    e.dataTransfer.setData('application/json', JSON.stringify(point));
  };

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {predefinedConfigPoints.map((point, index) => (
        <Card
          key={index}
          className="p-2 cursor-move bg-muted hover:bg-muted/80 transition-colors"
          draggable
          onDragStart={(e) => handleDragStart(e, point)}
        >
          <div className="text-sm font-medium">{point.label}</div>
          <div className="text-xs text-muted-foreground">{point.template_placeholder}</div>
        </Card>
      ))}
    </div>
  );
}
