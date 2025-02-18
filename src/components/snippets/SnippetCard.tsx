
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Copy, FileCode, Maximize2, Wand2 } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Snippet } from "@/types/snippets";
import { useNavigate } from 'react-router-dom';

interface SnippetCardProps {
  snippet: Snippet;
  onExpand: (snippet: Snippet) => void;
  onCopy: (code: string, id: string) => void;
  onAnalyze: (snippet: Snippet) => void;
  isExpanded: boolean;
  isCopied: boolean;
  isFocused: boolean;
}

export function SnippetCard({
  snippet,
  onExpand,
  onCopy,
  onAnalyze,
  isExpanded,
  isCopied,
  isFocused
}: SnippetCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className={`group relative transition-all duration-200 cursor-pointer hover:shadow-md ${
        isFocused ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onExpand(snippet)}
    >
      <CardHeader className="relative">
        <div className="absolute top-2 right-2 flex gap-2 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/95 hover:bg-background shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(snippet.code_content, snippet.id);
            }}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/95 hover:bg-background shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(snippet);
            }}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle>{snippet.title}</CardTitle>
        <CardDescription>{snippet.description}</CardDescription>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            variant="default"
            size="sm"
            className="w-full flex items-center justify-center gap-2 bg-primary"
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze(snippet);
            }}
          >
            <Wand2 className="h-4 w-4" />
            Analyze Snippet
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/yml-maker/${snippet.id}`);
            }}
          >
            <FileCode className="h-4 w-4" />
            Make YML
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="border-t pt-4 space-y-4 animate-slide-up">
          <div className="bg-muted/50 p-4 rounded-md overflow-hidden">
            <ScrollArea className="h-[200px]">
              <SyntaxHighlighter
                language={snippet.language || 'text'}
                className="!bg-transparent !m-0 !p-0"
              >
                {snippet.code_content}
              </SyntaxHighlighter>
            </ScrollArea>
          </div>
          <div className="text-sm text-muted-foreground">
            Created: {new Date(snippet.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
