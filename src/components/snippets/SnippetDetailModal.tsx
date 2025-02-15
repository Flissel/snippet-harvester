
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Snippet } from "@/types/snippets";

interface SnippetDetailModalProps {
  snippet: Snippet;
  onClose: () => void;
}

export function SnippetDetailModal({ snippet, onClose }: SnippetDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] overflow-hidden animate-fade-in">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle>{snippet.title}</CardTitle>
          <CardDescription>{snippet.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-md overflow-hidden">
            <ScrollArea className="h-[400px]">
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
      </Card>
    </div>
  );
}
