
import { useRef, useState } from 'react';
import { ConfigurationPoint } from '@/types/configuration';
import { predefinedConfigPoints } from './config-form/schema';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language: string;
  configPoints: ConfigurationPoint[];
  onSelectionChange?: (selectedText: string) => void;
  onConfigPointDrop?: (config: any, start: number, end: number) => void;
}

export function CodeViewer({ 
  code, 
  language, 
  configPoints,
  onSelectionChange,
  onConfigPointDrop 
}: CodeViewerProps) {
  const codeRef = useRef<HTMLDivElement>(null);
  const [activeConfig, setActiveConfig] = useState<typeof predefinedConfigPoints[0] | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ text: string; start: number; end: number } | null>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setSelectedRange(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();
    
    if (text) {
      const preElement = codeRef.current?.querySelector('pre');
      if (!preElement) return;

      const fullText = preElement.textContent || '';
      const startIndex = fullText.indexOf(text);
      
      if (startIndex !== -1) {
        setSelectedRange({ 
          text,
          start: startIndex, 
          end: startIndex + text.length 
        });
        
        onSelectionChange?.(text);
      }
    }
  };

  const handleAddLabel = () => {
    if (!selectedRange) return;
    
    // Call onConfigPointDrop with the selection range
    if (onConfigPointDrop) {
      onConfigPointDrop(null, selectedRange.start, selectedRange.end);
    }
    
    setSelectedRange(null);
  };

  return (
    <div>
      {activeConfig && (
        <div className="mb-4 p-3 bg-primary/10 rounded-md">
          <p className="text-sm">
            Select the code to replace with <span className="font-medium">{activeConfig.label}</span>
          </p>
        </div>
      )}
      {selectedRange && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Selected code: <span className="font-mono bg-muted-foreground/10 px-2 py-1 rounded">{selectedRange.text}</span>
            </p>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleAddLabel}
            >
              <Plus className="w-4 h-4" />
              Add Label
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Position: {selectedRange.start} to {selectedRange.end}
          </p>
        </div>
      )}
      <div 
        ref={codeRef} 
        className="relative group"
        onMouseUp={handleMouseUp}
      >
        <pre className="p-4 overflow-auto font-mono text-sm whitespace-pre-wrap">
          {code}
        </pre>
        {configPoints.map((point, index) => {
          if (!point.default_value) return null;
          
          const startPosition = point.start_position || code.indexOf(point.default_value);
          if (startPosition === -1) return null;

          const lines = code.substring(0, startPosition).split('\n');
          const lineNumber = lines.length - 1;
          const lineHeight = 24; // Approximate line height in pixels

          return (
            <div
              key={point.id}
              className="absolute bg-primary/20 pointer-events-none group"
              style={{
                top: `${lineNumber * lineHeight}px`,
                left: '0',
                width: '100%',
                height: `${lineHeight}px`
              }}
            >
              <div className="absolute hidden group-hover:block bg-popover text-popover-foreground p-2 rounded shadow-lg -top-8 left-0 z-50">
                <div className="font-medium">{point.label}{point.is_required ? ' (Required)' : ''}</div>
                <div className="text-xs mt-1 font-mono">Original: {point.default_value}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
