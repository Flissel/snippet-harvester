
import { Snippet } from "@/types/snippets";

interface SnippetMetadataProps {
  snippet: Snippet;
}

export function SnippetMetadata({ snippet }: SnippetMetadataProps) {
  return (
    <>
      {snippet.teams && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Team:</span>
          <span className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full font-medium">
            {snippet.teams.name}
          </span>
        </div>
      )}
      {snippet.snippet_label_associations?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {snippet.snippet_label_associations.map(({ snippet_labels }) => (
            <span
              key={snippet_labels.name}
              className="text-xs px-3 py-1 rounded-full font-medium"
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
      <div className="flex items-center gap-2 pt-2 border-t">
        <img
          src={snippet.profiles?.avatar_url || "/placeholder.svg"}
          alt={snippet.profiles?.username || "Anonymous"}
          className="w-6 h-6 rounded-full ring-2 ring-primary/20"
        />
        <span className="text-sm text-muted-foreground">
          {snippet.profiles?.username || "Anonymous"}
        </span>
      </div>
    </>
  );
}
