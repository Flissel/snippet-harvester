
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Snippet } from '@/types/snippets';
import { ConfigurationPoint, ConfigurationPointInput } from '@/types/configuration';

export interface Suggestion {
  label: string;
  config_type: string;
  description: string;
  default_value: string;
  template_placeholder?: string;
}

export interface PendingReplacement {
  start: number;
  end: number;
  text: string;
  config: any;
}

export function useAnalysis(snippet: Snippet, onSubmit: (data: ConfigurationPointInput) => void) {
  const { toast } = useToast();
  const [pendingReplacements, setPendingReplacements] = useState<PendingReplacement[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAddLabel = (selectedCode: { text: string; start: number; end: number; } | null, selectedConfig: any) => {
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

  return {
    pendingReplacements,
    suggestions,
    isAnalyzing,
    handleAddLabel,
    handleAddSuggestion,
    handleRemoveSuggestion,
    handleSubmitAll,
    handleAnalyzeCode
  };
}
