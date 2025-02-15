
import { useRef } from 'react';
import { ConfigurationPoint } from '@/types/configuration';

interface CodeViewerProps {
  code: string;
  language: string;
  configPoints: ConfigurationPoint[];
  onSelectionChange?: (selectedText: string) => void;
}

export function CodeViewer({ 
  code, 
  language, 
  configPoints,
  onSelectionChange 
}: CodeViewerProps) {
  const codeRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();
    
    if (text) {
      onSelectionChange?.(text);
    }
  };

  return (
    <div 
      ref={codeRef} 
      className="relative group"
      onMouseUp={handleMouseUp}
    >
      <pre className="p-4 overflow-auto font-mono text-sm whitespace-pre-wrap">
        {code}
      </pre>
      {configPoints.map((point, index) => (
        <div
          key={point.id}
          className="absolute bg-primary/20 pointer-events-none group"
          style={{
            top: `${Math.floor(code.substring(0, code.indexOf(point.default_value || '')).split('\n').length - 1) * 24}px`,
            left: '0',
            width: '100%',
            height: '24px'
          }}
        >
          <div className="absolute hidden group-hover:block bg-popover text-popover-foreground p-2 rounded shadow-lg -top-8 left-0 z-50">
            {point.label}{point.is_required ? ' (Required)' : ''}
          </div>
        </div>
      ))}
    </div>
  );
}
