
import { Snippet } from "@/types/snippets";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SnippetCard } from "./SnippetCard";

interface SnippetListProps {
  snippets: Snippet[] | undefined;
  isLoading: boolean;
  expandedCardId: string | null;
  copiedSnippetId: string | null;
  focusedSnippetId: string | null;
  onSnippetExpand: (snippet: Snippet) => void;
  onSnippetCopy: (code: string, id: string) => void;
  onSnippetAnalyze: (snippet: Snippet) => void;
}

export function SnippetList({
  snippets,
  isLoading,
  expandedCardId,
  copiedSnippetId,
  focusedSnippetId,
  onSnippetExpand,
  onSnippetCopy,
  onSnippetAnalyze,
}: SnippetListProps) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
          </Card>
        ))}
      </>
    );
  }

  if (!snippets?.length) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-muted-foreground">No snippets found</p>
      </div>
    );
  }

  return (
    <>
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          onExpand={onSnippetExpand}
          onCopy={onSnippetCopy}
          onAnalyze={onSnippetAnalyze}
          isExpanded={expandedCardId === snippet.id}
          isCopied={copiedSnippetId === snippet.id}
          isFocused={focusedSnippetId === snippet.id}
        />
      ))}
    </>
  );
}
