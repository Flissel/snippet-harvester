
import { Card } from '@/components/ui/card';
import { ConfigurationPointList } from './ConfigurationPointList';
import { ConfigurationPointForm } from './ConfigurationPointForm';
import { Snippet } from '@/types/snippets';
import { ConfigurationPoint, ConfigurationPointInput } from '@/types/configuration';
import { Button } from '@/components/ui/button';
import { Plus, Check, Wand2, X } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConfigurationSectionProps {
  snippet: Snippet;
  configPoints: ConfigurationPoint[];
  selectedCode: { text: string; start: number; end: number; } | null;
  selectedConfig: any | null;
  onDelete: (id: string) => void;
  onSubmit: (data: ConfigurationPointInput) => void;
}

interface PendingReplacement {
  start: number;
  end: number;
  text: string;
  config: any;
}

interface Suggestion {
  label: string;
  config_type: string;
  description: string;
  default_value: string;
  template_placeholder?: string;
}

export function ConfigurationSection({
  snippet,
  configPoints,
  selectedCode,
  selectedConfig,
  onDelete,
  onSubmit,
}: ConfigurationSectionProps) {
  const { toast } = useToast();
  const [pendingReplacements, setPendingReplacements] = useState<PendingReplacement[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAddLabel = () => {
    if (!selectedCode || !selectedConfig) return;
    
    setPendingReplacements(prev => [...prev, {
      start: selectedCode.start,
      end: selectedCode.end,
      text: selectedCode.text,
      config: selectedConfig
    }]);
  };

  const handleAddSuggestion = (suggestion: Suggestion) => {
    const startPosition = snippet.code_content.indexOf(suggestion.default_value);
    if (startPosition !== -1) {
      setPendingReplacements(prev => [...prev, {
        start: startPosition,
        end: startPosition + suggestion.default_value.length,
        text: suggestion.default_value,
        config: suggestion
      }]);
      
      // Remove the suggestion from the list
      setSuggestions(prev => prev.filter(s => s.label !== suggestion.label));
    }
  };

  const handleRemoveSuggestion = (suggestion: Suggestion) => {
    setSuggestions(prev => prev.filter(s => s.label !== suggestion.label));
  };

  const handleSubmitAll = () => {
    pendingReplacements.forEach(replacement => {
      const configPoint: ConfigurationPointInput = {
        snippet_id: snippet.id,
        label: replacement.config.label,
        config_type: replacement.config.config_type,
        default_value: replacement.text,
        description: replacement.config.description || '',
        template_placeholder: replacement.config.template_placeholder || `{${replacement.config.label}}`,
        is_required: true,
        start_position: replacement.start,
        end_position: replacement.end,
      };
      onSubmit(configPoint);
    });
    setPendingReplacements([]);
  };

  const handleAnalyzeCode = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-config-points', {
        body: { code: snippet.code_content }
      });

      if (error) throw error;

      setSuggestions(data.suggestions);
      setPendingReplacements([]);

      toast({
        title: "Analysis Complete",
        description: `Found ${data.suggestions.length} potential configuration points.`,
      });
    } catch (error) {
      console.error('Error analyzing code:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderCodeWithReplacements = () => {
    let result = snippet.code_content;
    const allReplacements: PendingReplacement[] = [];

    configPoints.forEach(point => {
      allReplacements.push({
        start: point.start_position,
        end: point.end_position,
        text: point.default_value || '',
        config: {
          label: point.label,
          template_placeholder: point.template_placeholder,
        }
      });
    });

    allReplacements.push(...pendingReplacements);

    if (selectedCode && selectedConfig && pendingReplacements.length === 0) {
      allReplacements.push({
        start: selectedCode.start,
        end: selectedCode.end,
        text: selectedCode.text,
        config: selectedConfig
      });
    }

    allReplacements.sort((a, b) => b.start - a.start);

    allReplacements.forEach(replacement => {
      const placeholder = replacement.config.template_placeholder || `{${replacement.config.label}}`;
      result = result.slice(0, replacement.start) + placeholder + result.slice(replacement.end);
    });

    return result;
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Configuration Points</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyzeCode}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Auto-detect'}
            </Button>
          </div>
          <ConfigurationPointList
            configPoints={configPoints}
            onDelete={onDelete}
          />
        </Card>

        {suggestions.length > 0 && (
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
                        onClick={() => handleAddSuggestion(suggestion)}
                        className="text-primary hover:text-primary/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSuggestion(suggestion)}
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
        )}

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Add Labels</h2>
            {selectedCode && selectedConfig && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddLabel}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Label
              </Button>
            )}
          </div>

          <ConfigurationPointForm
            snippet={snippet}
            onSubmit={onSubmit}
            selectedCode={selectedCode}
            initialValues={selectedConfig}
          />
        </Card>
      </div>

      <div>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Preview</h2>
            {pendingReplacements.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmitAll}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Submit All ({pendingReplacements.length})
              </Button>
            )}
          </div>
          <pre className="p-3 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap">
            {renderCodeWithReplacements()}
          </pre>
        </Card>
      </div>
    </div>
  );
}
