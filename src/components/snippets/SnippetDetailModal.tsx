
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Copy, Check, Edit } from "lucide-react";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Snippet } from "@/types/snippets";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

interface SnippetDetailModalProps {
  snippet: Snippet;
  onClose: () => void;
}

export function SnippetDetailModal({ snippet, onClose }: SnippetDetailModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { user } = useAuth();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code_content);
      setIsCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const canModify = user?.id === snippet.created_by;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] flex flex-col animate-fade-in">
        <CardHeader className="relative">
          <div className="absolute right-2 top-2 flex items-center gap-2 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/95 hover:bg-background shadow-sm"
              onClick={copyToClipboard}
              title="Copy code"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            {canModify && (
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/95 hover:bg-background shadow-sm"
                onClick={() => toast.info("Edit functionality coming soon!")}
                title="Edit snippet"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/95 hover:bg-background shadow-sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle>{snippet.title}</CardTitle>
          <CardDescription>{snippet.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 min-h-0">
          <ScrollArea className="h-[calc(100vh-400px)] w-full rounded-md border">
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
