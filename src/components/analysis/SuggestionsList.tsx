
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { Suggestion } from './hooks/useAnalysis';

interface SuggestionsListProps {
  suggestions: Suggestion[];
  onAdd: (suggestion: Suggestion) => void;
  onRemove: (suggestion: Suggestion) => void;
}

export function SuggestionsList({
  suggestions,
  onAdd,
  onRemove,
}: SuggestionsListProps) {
  if (suggestions.length === 0) return null;

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Suggestions</h2>
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.label}
              className="flex items-start justify-between p-3 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="font-medium">{suggestion.label}</div>
                <div className="text-sm text-muted-foreground">
                  Type: {suggestion.config_type}
                </div>
                {suggestion.description && (
                  <div className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAdd(suggestion)}
                  className="text-primary hover:text-primary/90"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(suggestion)}
                  className="text-destructive hover:text-destructive/90"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
