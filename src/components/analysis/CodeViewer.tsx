
import { useRef, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ConfigurationPoint } from '@/types/configuration';

interface CodeViewerProps {
  code: string;
  language: string;
  configPoints: ConfigurationPoint[];
}

export function CodeViewer({ code, language, configPoints }: CodeViewerProps) {
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!codeRef.current) return;

    // Clear existing highlights
    const highlights = codeRef.current.querySelectorAll('.config-highlight');
    highlights.forEach((el) => el.remove());

    // Add new highlights
    const codeContainer = codeRef.current.querySelector('pre');
    if (!codeContainer) return;

    configPoints.forEach((point) => {
      const highlight = document.createElement('div');
      highlight.className = 'config-highlight absolute bg-primary/20 pointer-events-none';
      highlight.style.position = 'absolute';
      
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
      tooltip.textContent = point.label;
      
      highlight.appendChild(tooltip);
      codeContainer.appendChild(highlight);
    });
  }, [code, configPoints]);

  return (
    <div ref={codeRef} className="relative group">
      <SyntaxHighlighter
        language={language}
        className="!bg-transparent !m-0"
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
