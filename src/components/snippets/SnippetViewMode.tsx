
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Copy, Check, Edit } from "lucide-react";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Snippet } from "@/types/snippets";
import { SnippetMetadata } from "./SnippetMetadata";

interface SnippetViewModeProps {
  snippet: Snippet;
  onClose: () => void;
  onEdit: () => void;
  onCopy: () => void;
  isCopied: boolean;
  canModify: boolean;
}

export function SnippetViewMode({ 
  snippet, 
  onClose, 
  onEdit, 
  onCopy, 
  isCopied, 
  canModify 
}: SnippetViewModeProps) {
  return (
    <>
      <CardHeader className="relative border-b bg-muted/50">
        <div className="absolute right-2 top-2 flex items-center gap-2 z-50">
          <Button
            variant="secondary"
            size="icon"
            className="hover:bg-primary/20 hover:text-primary transition-colors"
            onClick={onCopy}
            title="Copy code"
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          {canModify && (
            <Button
              variant="secondary"
              size="icon"
              className="hover:bg-primary/20 hover:text-primary transition-colors"
              onClick={onEdit}
              title="Edit snippet"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="secondary"
            size="icon"
            className="hover:bg-destructive/20 hover:text-destructive transition-colors"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {snippet.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground/80">
          {snippet.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 min-h-0 p-6">
        <ScrollArea className="h-[calc(100vh-400px)] w-full rounded-lg border bg-muted/30 shadow-inner">
          <div className="p-4">
            <SyntaxHighlighter
              language={snippet.language || 'text'}
              className="!bg-transparent !m-0 !p-0"
              showLineNumbers
              wrapLongLines
              customStyle={{
                background: 'transparent',
                fontSize: '14px',
              }}
            >
              {snippet.code_content}
            </SyntaxHighlighter>
          </div>
        </ScrollArea>
        <SnippetMetadata snippet={snippet} />
      </CardContent>
    </>
  );
}
