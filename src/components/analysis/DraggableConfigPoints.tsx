
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { predefinedConfigPoints } from './config-form/schema';

// Color mapping for different config types
const getConfigTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'string': 'bg-blue-100 text-blue-700 border-blue-200',
    'number': 'bg-green-100 text-green-700 border-green-200',
    'boolean': 'bg-purple-100 text-purple-700 border-purple-200',
    'array': 'bg-orange-100 text-orange-700 border-orange-200',
    'object': 'bg-red-100 text-red-700 border-red-200'
  };
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
};

interface ConfigPoint {
  label: string;
  config_type: string;
  description?: string;
  template_placeholder?: string;
}

interface DraggableConfigPointsProps {
  onConfigPointSelected: (point: ConfigPoint) => void;
  customConfigPoints?: ConfigPoint[];
}

export function DraggableConfigPoints({ 
  onConfigPointSelected,
  customConfigPoints = []
}: DraggableConfigPointsProps) {
  const allConfigPoints = [...predefinedConfigPoints, ...customConfigPoints];

  return (
    <ScrollArea className="w-full mb-4">
      <div className="flex gap-1.5 p-2 min-w-max">
      </div>
    </ScrollArea>
  );
}
