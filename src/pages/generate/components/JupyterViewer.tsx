
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ScrollArea } from '@/components/ui/scroll-area';
import 'katex/dist/katex.min.css';

interface JupyterCell {
  cell_type: 'code' | 'markdown' | 'raw';
  source: string[] | string;
  execution_count?: number | null;
  outputs?: JupyterOutput[];
  metadata?: Record<string, any>;
}

interface JupyterOutput {
  output_type: string;
  text?: string[];
  data?: {
    'text/plain'?: string[];
    'text/html'?: string[];
    'image/png'?: string;
  };
}

interface JupyterNotebook {
  cells: JupyterCell[];
  metadata: Record<string, any>;
  nbformat: number;
  nbformat_minor: number;
}

interface JupyterViewerProps {
  content: string;
}

export function JupyterViewer({ content }: JupyterViewerProps) {
  let notebook: JupyterNotebook;
  
  try {
    notebook = JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse notebook:', error);
    return (
      <div className="text-red-500 p-4">
        Error: Invalid Jupyter notebook format
      </div>
    );
  }

  const renderSource = (source: string[] | string): string => {
    if (Array.isArray(source)) {
      return source.join('');
    }
    return source;
  };

  const renderOutput = (output: JupyterOutput) => {
    if (output.text) {
      return <pre className="whitespace-pre-wrap text-sm">{output.text.join('')}</pre>;
    }

    if (output.data) {
      if (output.data['text/html']) {
        return (
          <div 
            dangerouslySetInnerHTML={{ __html: output.data['text/html'].join('') }}
            className="jupyter-output-html"
          />
        );
      }
      if (output.data['image/png']) {
        return (
          <img 
            src={`data:image/png;base64,${output.data['image/png']}`}
            alt="Jupyter output"
            className="max-w-full"
          />
        );
      }
      if (output.data['text/plain']) {
        return <pre className="whitespace-pre-wrap text-sm">{output.data['text/plain'].join('')}</pre>;
      }
    }

    return null;
  };

  const renderCell = (cell: JupyterCell, index: number) => {
    switch (cell.cell_type) {
      case 'markdown':
        return (
          <div key={index} className="jupyter-cell markdown-cell mb-4">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              className="prose dark:prose-invert max-w-none"
            >
              {renderSource(cell.source)}
            </ReactMarkdown>
          </div>
        );

      case 'code':
        return (
          <div key={index} className="jupyter-cell code-cell mb-4 border rounded-lg overflow-hidden">
            <div className="bg-muted/50 p-2 border-b">
              {cell.execution_count !== null && (
                <span className="text-sm text-muted-foreground">In [{cell.execution_count}]:</span>
              )}
            </div>
            <div className="p-4 bg-muted/30">
              <SyntaxHighlighter
                language="python"
                customStyle={{
                  backgroundColor: 'transparent',
                  padding: 0,
                  margin: 0,
                }}
              >
                {renderSource(cell.source)}
              </SyntaxHighlighter>
            </div>
            {cell.outputs && cell.outputs.length > 0 && (
              <div className="outputs border-t p-4 bg-background">
                {cell.outputs.map((output, i) => (
                  <div key={i} className="output">
                    {renderOutput(output)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 space-y-4">
        {notebook.cells.map((cell, index) => renderCell(cell, index))}
      </div>
    </ScrollArea>
  );
}
