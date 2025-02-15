
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Copy, Maximize2 } from "lucide-react";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Snippet } from "@/types/snippets";

interface SnippetCardProps {
  snippet: Snippet;
  onExpand: (snippet: Snippet) => void;
  onCopy: (code: string, id: string) => void;
  isExpanded: boolean;
  isCopied: boolean;
  isFocused: boolean;
}

export function SnippetCard({
  snippet,
  onExpand,
  onCopy,
  isExpanded,
  isCopied,
  isFocused
}: SnippetCardProps) {
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
          {snippet.teams && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Team:</span>
              <span className="text-sm text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                {snippet.teams.name}
              </span>
            </div>
          )}
          {snippet.snippet_label_associations?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {snippet.snippet_label_associations.map(({ snippet_labels }) => (
                <span
                  key={snippet_labels.name}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${snippet_labels.color}20`,
                    color: snippet_labels.color,
                  }}
                >
                  {snippet_labels.name}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <img
              src={snippet.profiles?.avatar_url || "/placeholder.svg"}
              alt={snippet.profiles?.username || "Anonymous"}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-muted-foreground">
              {snippet.profiles?.username || "Anonymous"}
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
