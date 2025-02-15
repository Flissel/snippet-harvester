
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, RotateCcw } from "lucide-react";

interface SnippetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  snippet: {
    title: string;
    description?: string | null;
    code_content: string;
    language?: string | null;  // Changed from required to optional
  };
}

export function SnippetViewModal({ isOpen, onClose, snippet }: SnippetViewModalProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);

  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleResetZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div>
              <h2 className="text-xl font-semibold">{snippet.title}</h2>
              {snippet.description && (
                <p className="text-sm text-muted-foreground">{snippet.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{zoom}%</span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetZoom}
                disabled={zoom === 100}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <pre
              className="font-mono text-sm whitespace-pre-wrap break-all transition-transform"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
              }}
            >
              <code>{snippet.code_content}</code>
            </pre>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
