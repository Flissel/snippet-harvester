
import { useRef, useEffect, useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ConfigurationPoint } from '@/types/configuration';

interface CodeViewerProps {
  code: string;
  language: string;
  configPoints: ConfigurationPoint[];
  onSelectionChange?: (start: number, end: number, selectedText: string) => void;
}

export function CodeViewer({ 
  code, 
  language, 
  configPoints,
  onSelectionChange 
}: CodeViewerProps) {
  const codeRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    if (!codeRef.current) return;

    // Clear existing highlights
    const highlights = codeRef.current.querySelectorAll('.config-highlight');
    highlights.forEach((el) => el.remove());

    // Add new highlights for existing config points
    const codeContainer = codeRef.current.querySelector('pre');
    if (!codeContainer) return;

    configPoints.forEach((point) => {
      const highlight = document.createElement('div');
      highlight.className = 'config-highlight absolute bg-primary/20 pointer-events-none group';
      
      // Calculate position based on the code text
      const textBefore = code.substring(0, point.start_position);
      const lines = textBefore.split('\n');
      const lineHeight = 20; // Approximate line height in pixels
      
      highlight.style.top = `${lines.length * lineHeight}px`;
      highlight.style.left = '0';
      highlight.style.width = '100%';
      highlight.style.height = `${lineHeight}px`;
      
      const tooltip = document.createElement('div');
      tooltip.className = 'absolute hidden group-hover:block bg-popover text-popover-foreground p-2 rounded shadow-lg -top-8 left-0 z-50';
      tooltip.textContent = `${point.label}${point.is_required ? ' (Required)' : ''}`;
      
      highlight.appendChild(tooltip);
      codeContainer.appendChild(highlight);
    });
  }, [code, configPoints]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();
    
    if (text) {
      const preElement = codeRef.current?.querySelector('pre');
      if (!preElement) return;

      const preText = preElement.textContent || '';
      const start = preText.indexOf(text);
      const end = start + text.length;

      setSelection({ start, end });
      onSelectionChange?.(start, end, text);
    }
  };

  return (
    <div 
      ref={codeRef} 
      className="relative group"
      onMouseUp={handleMouseUp}
    >
      <SyntaxHighlighter
        language={language}
        className="!bg-transparent !m-0"
        showLineNumbers
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
      {selection && (
        <div 
          className="absolute bg-blue-500/20 pointer-events-none"
          style={{
            top: `${Math.floor(selection.start / code.length) * 20}px`,
            height: '20px',
            width: '100%'
          }}
        />
      )}
    </div>
  );
}
