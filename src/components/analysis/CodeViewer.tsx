
import { useRef, useState } from 'react';
import { ConfigurationPoint } from '@/types/configuration';
import { predefinedConfigPoints } from './config-form/schema';

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

  const handleMouseUp = () => {
    if (!activeConfig) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();
    
    if (text) {
      const startIndex = code.indexOf(text);
      if (startIndex !== -1) {
        onConfigPointDrop?.(activeConfig, startIndex, startIndex + text.length);
        setActiveConfig(null); // Reset active config after applying
      }
    }
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
    </div>
  );
}
