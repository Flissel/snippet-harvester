
import { Snippet } from "@/types/snippets";

interface SnippetMetadataProps {
  snippet: Snippet;
}

export function SnippetMetadata({ snippet }: SnippetMetadataProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        Created: {new Date(snippet.created_at).toLocaleDateString()}
      </div>
      {snippet.language && (
        <div className="text-sm">
          <span className="font-medium">Language:</span>{' '}
          <span className="text-primary">{snippet.language}</span>
        </div>
      )}
    </div>
  );
}
